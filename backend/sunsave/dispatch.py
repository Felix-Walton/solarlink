"""
Greedy battery dispatch – now honours a household-demand profile.

New arg
-------
demand_kwh : pd.Series, same 48-slot index as pv_kwh.
             Positive = kWh drawn by the house in that slot.
             Default = zeros (back-compat).

Algorithm
---------
1.    PV powers the home first.
2.    Surplus PV may charge battery or go to export.
3.    If PV < demand, battery discharges up to power/cap limits;
      any remaining shortfall is imported from the grid.

Returns baseline economics *and* with-battery economics so the UI
can show a full breakdown.
"""

from __future__ import annotations
from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass(slots=True)
class BatteryCfg:
    cap_kwh: float = 5.0
    pow_kw:  float = 3.0
    eta:     float = 0.92               # round-trip


# ─────────────────────────────────────────────────────────
def greedy_dispatch(
    pv_kwh: pd.Series,
    prices: pd.Series,
    cap_kwh: float = BatteryCfg.cap_kwh,
    pow_kw:  float = BatteryCfg.pow_kw,
    eta:     float = BatteryCfg.eta,
    demand_kwh: pd.Series | None = None,          # ★ NEW ★
) -> dict:
    """
    Return a dict with:
      • dataframe  – slot-level details
      • baseline_cost
      • with_batt_cost
      • money_saved
      • kwh_shifted (energy the battery actually cycled)
    """
    if demand_kwh is None:
        demand_kwh = pd.Series(0.0, index=pv_kwh.index)

    # ── guards ──
    if not (pv_kwh.index.equals(prices.index) and pv_kwh.index.equals(demand_kwh.index)):
        raise ValueError("pv, prices, demand must share the same index")
    if cap_kwh <= 0 or pow_kw <= 0 or not 0 < eta <= 1:
        raise ValueError("cap_kwh>0, pow_kw>0, 0<eta≤1")

    dt_h = (pv_kwh.index[1] - pv_kwh.index[0]).total_seconds()/3600
    step_limit = pow_kw * dt_h
    eff        = eta ** 0.5

    n = len(pv_kwh)
    soc            = 0.0
    soc_log        = np.zeros(n)
    import_grid    = np.zeros(n)   # +ve = buy
    export_grid    = np.zeros(n)   # +ve = sell
    batt_in_kwh    = 0.0           # to report kWh cycled

    for i in range(n):
        pv   = pv_kwh.iat[i]
        load = demand_kwh.iat[i]

        # 1) Use PV to serve load first
        net = pv - load                               # +ve surplus, -ve deficit

        # 2) Surplus path  ───────────────────────────
        if net > 0:
            room   = cap_kwh - soc
            charge = min(net, room, step_limit)
            soc   += charge * eff
            export_grid[i] = net - charge             # leftover → grid

        # 3) Deficit path  ───────────────────────────
        else:
            need = -net                               # kWh short
            discharge = min(need, soc, step_limit)
            soc      -= discharge
            batt_in_kwh += discharge
            import_grid[i] = need - discharge         # unmet part → grid import

        soc_log[i] = soc

    # ── economics ───────────────────────────────────
    # Baseline (no battery): grid_kwh = demand - pv
    baseline_grid = demand_kwh - pv_kwh
    baseline_cost = (baseline_grid * prices).sum()

    with_batt_grid = import_grid - export_grid        # export reduces bill
    with_batt_cost = (with_batt_grid * prices).sum()

    money_saved = baseline_cost - with_batt_cost
    kwh_shifted = batt_in_kwh

    df = pd.DataFrame({
        "pv_kwh": pv_kwh,
        "demand_kwh": demand_kwh,
        "import_grid": import_grid,
        "export_grid": export_grid,
        "soc_kwh": soc_log,
    })

    return {
        "frame": df,
        "baseline_cost": baseline_cost,
        "with_batt_cost": with_batt_cost,
        "money_saved": money_saved,
        "kwh_shifted": kwh_shifted,
    }
