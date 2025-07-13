
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sunsave.simulate import calculate_daily_solar_generation
from sunsave.dispatch import run_dispatch_simulation
from sunsave.octopus_prices import get_current_agile_prices

app = Flask(__name__)
CORS(app)

app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'your_super_secret_key_here')

@app.route('/simulate', methods=['GET'])
def simulate_route():
    postcode = request.args.get('postcode')
    kwp = float(request.args.get('kwp'))
    daily_kwh = calculate_daily_solar_generation(postcode, kwp)
    return jsonify({'daily_kwh': daily_kwh})

@app.route('/dispatch', methods=['GET'])
def dispatch_route():
    postcode = request.args.get('postcode')
    kwp = float(request.args.get('kwp'))
    cap_kwh = float(request.args.get('cap_kwh'))
    pow_kw = float(request.args.get('pow_kw'))
    eta = float(request.args.get('eta'))

    octopus_api_key = os.environ.get('OCTOPUS_API_KEY')
    if not octopus_api_key:
        return jsonify({"error": "OCTOPUS_API_KEY not set"}), 500

    prices_data = get_current_agile_prices(postcode, octopus_api_key)

    results = run_dispatch_simulation(
        postcode, kwp, cap_kwh, pow_kw, eta, prices_data
    )
    return jsonify(results)
