"""
Flask façade for the Sunsave core.

Endpoints
---------
/simulate  – average daily generation (kWh)
/dispatch  – 24 h battery schedule & full economics
"""

from __future__ import annotations

from datetime import date
import datetime as dt
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from .simulate import forecast_day
from .octopus_prices import agile_prices, mock_prices
from .dispatch import greedy_dispatch, BatteryCfg   # BatteryCfg only echoed

# ────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # allow localhost React dev-server


# ─── /simulate ───────────────────────────────────────────
@app.route("/simulate")
def simulate_route():
    """Return estimated **daily** PV generation for a given array & postcode."""
    postcode = request.args["postcode"]
    kwp      = float(request.args.get("kwp", 4))

    pv = forecast_day(postcode, kwp)        # 48 × ½ h series
    return jsonify({"daily_kwh": pv.sum()})


# ─── /dispatch ───────────────────────────────────────────
@app.route("/dispatch")
def dispatch_route():
    """
    24-hour battery dispatch simulation (live Agile by default).

    Query parameters
    ----------------
    postcode  : str   (required)
    kwp       : float – array size (default 4)
    tariff    : str   – 'agile' (default) or 'mock'

    cap_kwh   : float – battery capacity     (default 5)
    pow_kw    : float – max power            (default 3)
    eta       : float – round-trip efficiency (default 0.92)
    """
    # ── core args ──
    postcode = request.args["postcode"]
    kwp      = float(request.args.get("kwp", 4))
    tariff   = request.args.get("tariff", "agile")

    # ── battery spec ──
    cap_kwh = float(request.args.get("cap_kwh", 5.0))
    pow_kw  = float(request.args.get("pow_kw", 3.0))
    eta     = float(request.args.get("eta", 0.92))

    if cap_kwh <= 0 or pow_kw <= 0 or not 0 < eta <= 1:
        return jsonify(error="cap_kwh>0, pow_kw>0 and 0<eta≤1 required"), 400

    # ── PV forecast ──
    target_day = date.today() 
    pv = forecast_day(postcode, kwp, when=target_day)

    # ── fixed evening household load (0.6 kWh 17:00–22:00) ──
    hrs  = pv.index.hour
    load_vals = np.where((hrs >= 17) & (hrs < 22), 0.6, 0.0)
    demand = pd.Series(load_vals, index=pv.index, name="demand_kwh")

    # ── price curve ──
    fallback = False
    if tariff == "agile":
        try:
            prices = agile_prices(target_day, postcode=postcode)
            if len(prices) < 48:
                raise ValueError("incomplete Agile dataset")
        except Exception as e:
            print(f"⚠️  Agile fetch failed ({e}) – using mock prices.")
            prices   = mock_prices(pv.index)   # keep index identical
            fallback = True
    else:
        prices = mock_prices(pv.index)         # user explicitly asked for mock

    # ── dispatch ──
    res = greedy_dispatch(
        pv, prices,
        cap_kwh=cap_kwh, pow_kw=pow_kw, eta=eta,
        demand_kwh=demand,
    )

    return jsonify(
        money_saved    = res["money_saved"],
        baseline_cost  = res["baseline_cost"],
        with_batt_cost = res["with_batt_cost"],
        kwh_shifted    = res["kwh_shifted"],
        battery        = {"cap_kwh": cap_kwh, "pow_kw": pow_kw, "eta": eta},
        fallback       = fallback,
    )


# ─── dev helper ──────────────────────────────────────────
if __name__ == "__main__":
    # run with:  python -m sunsave.server
    app.run(host="0.0.0.0", port=5000, debug=True)
