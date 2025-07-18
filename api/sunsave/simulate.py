# simulate.py  
import argparse
import requests
import pandas as pd
import numpy as np
import datetime as dt
from typing import Optional, Tuple
from .octopus_prices import agile_prices


PVGIS_VERSION = "v5_3"                         # need ≥5.3 for SARAH-3
BASE_URL      = f"https://re.jrc.ec.europa.eu/api/{PVGIS_VERSION}/"

PVGIS_URL  = BASE_URL + "PVcalc"
SERIES_URL = BASE_URL + "seriescalc"
HOURLY_URL = SERIES_URL

DEFAULT_RAD_DB = "PVGIS-SARAH3"                # ends 2023  :contentReference[oaicite:0]{index=0}

# ──────────────────────────────────────────────────────────────────────
def estimate_generation(lat: float, lon: float, kwp: float,
                        raddatabase: str = DEFAULT_RAD_DB) -> float:
    """Daily-average kWh from PVGIS totals."""
    params = {"lat": lat, "lon": lon,
              "peakpower": kwp, "loss": 14,
              "raddatabase": raddatabase,
              "outputformat": "json", "browser": 0}
    r = requests.get(PVGIS_URL, params=params, timeout=20)
    r.raise_for_status()
    annual_kwh = r.json()["outputs"]["totals"]["fixed"]["E_y"]
    return annual_kwh / 365


def hourly_generation_series(
    lat: float,
    lon: float,
    kwp: float,
    tilt: int = 35,
    azim: int = 0,
    year: Optional[int] = None,
    raddatabase: str = DEFAULT_RAD_DB,
) -> pd.Series:
    """
    Return *hourly* PV energy (kWh) for one calendar year.
    """
    params = {"lat": lat, "lon": lon,
              "surface_tilt": tilt, "surface_azimuth": azim,
              "raddatabase": raddatabase,
              "pvcalculation": 1, "peakpower": kwp, "loss": 14,
              "pvtechchoice": "crystSi", "mountingplace": "building",
              "outputformat": "json", "browser": 0}
    if year is None:
        year = 2023            #
    params["startyear"] = params["endyear"] = year

    try:
        r = requests.get(HOURLY_URL, params=params, timeout=35)
        r.raise_for_status()
    except requests.exceptions.RequestException as e:
        # Log the error and return an empty series
        print(f"Error fetching data from PVGIS: {e}")
        return pd.Series([], dtype=float)
    src = r.json()

    # ---- parse the hourly table ------------------------------------------------
    df = pd.DataFrame(src["outputs"]["hourly"])
    # YYYYMMDD:HHMM  → pandas datetime (UTC)
    df["time"] = pd.to_datetime(df["time"],
                                format="%Y%m%d:%H%M",  # <-- key line ### CHANGED ###
                                utc=True)              # PVGIS gives UTC stamps  :contentReference[oaicite:1]{index=1}
    df.set_index("time", inplace=True)

    # power [W] every 10 min → energy [kWh] and sum per ISO hour
    power_w = df["P"].astype(float)
    dt_h = (df.index[1] - df.index[0]).total_seconds() / 3600   # 0.166… for SARAH
    energy_each = power_w * dt_h / 1000.0                      # kWh per sample
    hourly_kwh = energy_each.resample("h").sum()               # 60-min buckets
    hourly_kwh.name = "pv_kwh"
    return hourly_kwh

def mock_price_series(index: pd.DatetimeIndex) -> pd.Series:
    """
    Cheap overnight (12 p), expensive evening peak (30 p),
    gentle mid-day valley (15 p).
    """
    hours = index.hour
    base = np.where((hours >= 16) & (hours < 20), 0.30,
            np.where((hours >= 0)  & (hours < 6), 0.12, 0.15))
    return pd.Series(base, index=index, name="price_£pkWh")

def geocode(postcode: str) -> Tuple[float, float]:
    r = requests.get(f"https://api.postcodes.io/postcodes/{postcode}", timeout=10)
    r.raise_for_status()
    res = r.json()["result"]
    return res["latitude"], res["longitude"]


# ── CLI ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    from .dispatch import greedy_dispatch, BatteryCfg  
    p = argparse.ArgumentParser(
        description="Estimate solar generation for a UK site")
    p.add_argument("--kwp", type=float,
                   help="Array size in kWp (e.g. 4.0)")
    p.add_argument("--panels", type=int,
                   help="Number of 300 W panels (e.g. 10)")

    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--postcode", type=str,
                   help="UK postcode, e.g. EC2A3AY")
    g.add_argument("--latlon", nargs=2, type=float, metavar=("LAT", "LON"),
                   help="Latitude and longitude")

    p.add_argument("--hourly", action="store_true",
                   help="Print the first 24 h of hourly kWh")

    p.add_argument("--dispatch", action="store_true",
               help="Run greedy battery schedule for next 24 h")

    p.add_argument("--tariff", choices=["mock", "agile"], default="mock",
               help="Price source")

    args = p.parse_args()

    # ─── Convert panels → kWp if requested ───────────────────────────
    if args.panels is not None:
        # assume 300 W per panel → 0.3 kWp/panel
        kwp = args.panels * 0.3
    elif args.kwp is not None:
        kwp = args.kwp
    else:
        p.error("You must supply either --kwp or --panels")

    lat, lon = (geocode(args.postcode) if args.postcode
                else tuple(map(float, args.latlon)))

    if args.dispatch:
        pv = hourly_generation_series(lat, lon, kwp).head(24)

        if args.tariff == "agile":
            # ask for yesterday's data
            query_date = dt.date.today() - dt.timedelta(days=1)
            s = agile_prices(query_date, postcode=args.postcode)

            if len(s) < 48:
                print("⚠️  Agile returned no rates—using mock prices instead.")
                price = mock_price_series(pv.index)
            else:
                hourly_raw = s.resample("h").mean().head(24)
                price = pd.Series(hourly_raw.values, index=pv.index, name="price_£pkWh")

        else:
            price = mock_price_series(pv.index)

        res = greedy_dispatch(pv, price)
        print(f"Greedy battery saves £{res['pounds_saved']:.2f} in the next 24 h")

    elif args.hourly:
        s = hourly_generation_series(lat, lon, kwp)
        print(s.head(24))

    else:
        daily = estimate_generation(lat, lon, kwp)
        print(f"Estimated average daily generation: {daily:.1f} kWh")



import datetime as _dt
import numpy as np
import pandas as pd

def forecast_day(postcode: str, kwp: float, *, when: _dt.date | None = None):
    """
    Half-hour PV forecast (kWh) for the next 24 h, **aligned to today’s date**.

    • Always pulls SARAH-3 hourly data for 2023 (the last available year).  
    • Lifts the right month-and-day out of 2023 and re-dates it to *when*.
    • Splits each 1-hour kWh equally into two 30-min slots so the series lines
      up with price data.

    Returns
    -------
    pandas.Series indexed at 00:00 UTC → 23:30 UTC for *when* (48 points).
    """
    if when is None:
        when = _dt.date.today()

    # 1) Lat/Lon
    lat, lon = geocode(postcode)

    # 2) One-year hourly series (latest SARAH-3 year = 2023)
    hourly_2023 = hourly_generation_series(lat, lon, kwp, year=2023)

    # 3) Grab the matching 24 h in 2023
    try:
        src_start = _dt.datetime(2023, when.month, when.day,
                                 tzinfo=_dt.timezone.utc)
    except ValueError:             # 29 Feb on a non-leap year
        src_start = _dt.datetime(2023, when.month, when.day - 1,
                                 tzinfo=_dt.timezone.utc)

    src_slice = hourly_2023.loc[src_start : src_start + _dt.timedelta(hours=23)]
    if len(src_slice) != 24:       # last-ditch fall-back
        src_slice = hourly_2023.head(24)

    # 4) Re-date to the requested day & split into half-hours
    tgt_start = _dt.datetime(when.year, when.month, when.day,
                             tzinfo=_dt.timezone.utc)
    half_idx  = pd.date_range(tgt_start, periods=48, freq="30min", tz="UTC")
    half_vals = np.repeat(src_slice.values / 2.0, 2)

    return pd.Series(half_vals, index=half_idx, name="pv_kwh")

def calculate_daily_solar_generation(postcode: str, kwp: float) -> float:
    """
    Wrapper so api/index.py can import the legacy name.
    Converts postcode -> (lat, lon) and calls estimate_generation().
    """
    lat, lon = geocode(postcode)
    return estimate_generation(lat, lon, kwp)