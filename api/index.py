import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from .simulate import calculate_daily_solar_generation
from .dispatch import run_dispatch_simulation
from .octopus_prices import get_current_agile_prices

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "your_super_secret_key_here")

# ----------  API ROUTES  ----------

@app.get("/simulate")
def simulate():
    postcode = request.args.get("postcode")
    kwp      = request.args.get("kwp", type=float)

    if postcode is None or kwp is None:
        return jsonify({"error": "postcode and kwp are required"}), 400

    daily_kwh = calculate_daily_solar_generation(postcode, kwp)
    return jsonify({"daily_kwh": daily_kwh})


@app.get("/dispatch")
def dispatch():
    args = {
        "postcode": request.args.get("postcode"),
        "kwp":       request.args.get("kwp", type=float),
        "cap_kwh":   request.args.get("cap_kwh", type=float),
        "pow_kw":    request.args.get("pow_kw", type=float),
        "eta":       request.args.get("eta", type=float),
    }
    missing = [k for k, v in args.items() if v is None]
    if missing:
        return jsonify({"error": f"Missing query param(s): {', '.join(missing)}"}), 400

    octopus_api_key = os.environ.get("OCTOPUS_API_KEY")
    if not octopus_api_key:
        return jsonify({"error": "OCTOPUS_API_KEY not set"}), 500

    prices_data = get_current_agile_prices(args["postcode"], octopus_api_key)
    results = run_dispatch_simulation(**args, prices_data=prices_data)

    return jsonify(results)
