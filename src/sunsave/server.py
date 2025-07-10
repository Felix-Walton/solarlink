from flask import Flask, request, jsonify
import pandas as pd, datetime as dt

from .simulate import (estimate_generation,hourly_generation_series,geocode,mock_price_series,)
from .dispatch import greedy_dispatch
from .octopus_prices import agile_prices

app = Flask(__name__)

@app.route("/simulate", methods=["GET"])
def simulate():
    postcode = request.args.get("postcode")
    kwp      = float(request.args.get("kwp", 4.0))
    lat, lon = geocode(postcode)
    daily_kwh = estimate_generation(lat, lon, kwp)
    return jsonify({"daily_kwh": daily_kwh})

@app.route("/dispatch", methods=["GET"])
def dispatch():
    postcode = request.args.get("postcode")
    kwp      = float(request.args.get("kwp", 4.0))
    tariff   = request.args.get("tariff", "mock")
    lat, lon = geocode(postcode)

    # Use the latest available full year of data (2023) as a forecast
    HISTORICAL_YEAR = 2023
    year_series = hourly_generation_series(lat, lon, kwp, year=HISTORICAL_YEAR)

    if year_series.empty:
        return jsonify({"error": "Could not retrieve solar generation data."}), 500

    # Create a 24-hour forecast for today based on historical data
    now = pd.Timestamp.utcnow().floor("h")
    historical_start_time = now.replace(year=HISTORICAL_YEAR)
    historical_end_time = historical_start_time + pd.Timedelta(hours=23)
    
    # Select the 24h slice from the historical data
    pv_forecast_historical = year_series.loc[historical_start_time:historical_end_time]

    if len(pv_forecast_historical) < 24:
        return jsonify({"error": "Not enough historical data for a 24-hour forecast."}), 500

    # Create a new series with the same data but with a forward-looking index starting now
    future_index = pd.date_range(start=now, periods=len(pv_forecast_historical), freq='h')
    pv = pd.Series(pv_forecast_historical.values, index=future_index)

    if tariff == "agile":
        try:
            # Fetch Agile prices for the next 24 hours
            today = dt.date.today()
            prices_today = agile_prices(today, postcode=postcode)
            prices_tomorrow = agile_prices(today + dt.timedelta(days=1), postcode=postcode)
            all_prices = pd.concat([prices_today, prices_tomorrow])
            
            # Resample to hourly and select the next 24 hours
            hourly_prices = all_prices.resample("h").mean()
            price = hourly_prices.loc[now : now + pd.Timedelta(hours=23)]

            if len(price) < 24:
                 raise ValueError("Not enough Agile price data available.")

        except Exception as e:
            print(f"Agile API error: {e}")
            # Fallback to mock prices if Agile fails
            price = mock_price_series(pv.index)
    else:
        price = mock_price_series(pv.index)

    res  = greedy_dispatch(pv, price)
    return jsonify({"pounds_saved": res["pounds_saved"]})
    
if __name__ == "__main__":
    app.run(debug=True)