"""
Fetch half-hourly Agile Octopus prices, OR supply a simple mock tariff.
"""

from __future__ import annotations
import datetime as dt
from typing import Optional, Dict

import numpy as np
import pandas as pd
import requests

# ─────────────────────────────────────────────────────────
PRODUCT_CODE = "AGILE-24-10-01"
_DNO_TO_REGION: Dict[int, str] = {
    10: "A", 11: "B", 12: "C", 13: "D", 14: "E", 15: "F",
    16: "G", 17: "H", 18: "J", 19: "K", 20: "L", 21: "M",
    22: "N", 23: "P",
}

# ─── helper ──────────────────────────────────────────────
def _postcode_to_region(postcode: str) -> str:
    r = requests.get(f"https://api.postcodes.io/postcodes/{postcode}", timeout=10)
    r.raise_for_status()
    dno = r.json()["result"]["codes"]["nuts"]      # e.g. UKI31
    dno_num = int(dno[-2:])                        # last two digits
    return _DNO_TO_REGION.get(dno_num, "C")        # default London


# ─── Agile Octopus – LIVE data ───────────────────────────
def agile_prices(
    date: dt.date,
    region: Optional[str] = None,
    postcode: Optional[str] = None,
) -> pd.Series:
    """
    Return a 48-point Series of £/kWh (VAT-inc) for *date* in UTC.
    Missing half-hours are forward-filled then back-filled.
    """
    if region is None:
        if postcode is None:
            raise ValueError("Need either region or postcode")
        region = _postcode_to_region(postcode)

    tariff_code = f"E-1R-{PRODUCT_CODE}-{region}"
    period_from = dt.datetime.combine(date, dt.time.min, tzinfo=dt.timezone.utc)
    period_to   = period_from + dt.timedelta(days=1, minutes=-30)

    url = (
        f"https://api.octopus.energy/v1/products/{PRODUCT_CODE}"
        f"/electricity-tariffs/{tariff_code}/standard-unit-rates/"
    )
    params = {
        "period_from": period_from.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "period_to":   period_to.isoformat(timespec="seconds").replace("+00:00", "Z"),
    }
    r = requests.get(url, params=params, timeout=20)
    r.raise_for_status()
    raw = r.json()["results"]

    prices = {
        pd.to_datetime(item["valid_from"], utc=True): item["value_inc_vat"] / 100
        for item in raw
    }
    s = pd.Series(prices).sort_index()
    s.name = "agile_£pkwh"

    full_idx = pd.date_range(period_from, periods=48, freq="30min", tz="UTC")
    return s.reindex(full_idx).ffill().bfill()


# ─── Mock 3-tier tariff – always available ───────────────
def mock_prices(index: pd.DatetimeIndex | None = None) -> pd.Series:
    """
    Returns a 48-slot mock tariff.
    If *index* is provided we reuse it (so it always matches PV),
    otherwise we build midnight-UTC today.
    """
    if index is None:
        start = dt.datetime.utcnow().replace(hour=0, minute=0, second=0,
                                             microsecond=0, tzinfo=dt.timezone.utc)
        index = pd.date_range(start, periods=48, freq="30min", tz="UTC")

    hrs  = index.hour
    vals = np.where((hrs >= 16) & (hrs < 20), 0.30,
            np.where((hrs < 6), 0.12, 0.15))
    return pd.Series(vals, index, name="mock_£pkwh")
