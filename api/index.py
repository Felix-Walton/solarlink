import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from .sunsave.simulate import calculate_daily_solar_generation
from .sunsave.dispatch import run_dispatch_simulation
#from .sunsave.octopus_prices import agile_prices as get_current_agile_prices

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "your_super_secret_key_here")

# ----------  API ROUTES  ----------

@app.get("/api/simulate")
def simulate():
    postcode = request.args.get("postcode")
    kwp      = request.args.get("kwp", type=float)

    if postcode is None or kwp is None:
        return jsonify({"error": "postcode and kwp are required"}), 400

    daily_kwh = calculate_daily_solar_generation(postcode, kwp)
    return jsonify({"daily_kwh": daily_kwh})


@app.get("/api/dispatch")
def dispatch():
    args = {
        "postcode": request.args.get("postcode"),
        "kwp":      request.args.get("kwp",      type=float),
        "cap_kwh":  request.args.get("cap_kwh",  type=float),
        "pow_kw":   request.args.get("pow_kw",   type=float),
        "eta":      request.args.get("eta",      type=float),
    }
    missing = [k for k, v in args.items() if v is None]
    if missing:
        return jsonify({"error": f"Missing query param(s): {', '.join(missing)}"}), 400

    results = run_dispatch_simulation(**args)   # wrapper does PV + prices + dispatch
    return jsonify(results)
