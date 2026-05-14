from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from functools import wraps
import jwt

app = Flask(__name__)
CORS(app) # Habilita CORS para todas las rutas

# DOCKER (produccion)
AUTH_SERVICE    = "http://auth-service:5001/auth"
USER_SERVICE    = "http://users-service:5002"
DEVICE_SERVICE  = "http://devices-service:5003"
LOCATION_SERVICE = "http://locations-service:5004/locations"
METRIC_SERVICE  = "http://metrics-service:5005"
ALERT_SERVICE   = "http://alerts-service:5006"

# LOCAL (desarrollo) - descomentar y comentar el bloque de arriba
# AUTH_SERVICE    = "http://localhost:5001/auth"
# USER_SERVICE    = "http://localhost:5002"
# DEVICE_SERVICE  = "http://localhost:5003"
# LOCATION_SERVICE = "http://localhost:5004/locations"
# METRIC_SERVICE  = "http://localhost:5005"
# ALERT_SERVICE   = "http://localhost:5006"

SECRET_KEY = "super_secret_key"

app.json.sort_keys = False


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return jsonify({}), 200
            
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token required"}), 401
        try:
            token = auth_header.split()[1]
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = decoded_token
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token is invalid"}), 401
        except Exception:
            return jsonify({"error": "Error on token"}), 401
        return f(*args, **kwargs)
    return decorated


@app.errorhandler(Exception)
def handle_global_error(e):
    import traceback
    traceback.print_exc()
    return jsonify({"error": f"Gateway Error: {str(e)}"}), 500


# ── AUTH ──────────────────────────────────────────────────────────────────────

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        response = requests.post(f"{AUTH_SERVICE}/register", json=request.json)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Gateway Error: {str(e)}"}), 500



@app.route('/auth/login', methods=['POST'])
def login():
    response = requests.post(f"{AUTH_SERVICE}/login", json=request.json)
    return jsonify(response.json()), response.status_code


# ── USERS ─────────────────────────────────────────────────────────────────────

@app.route('/users', methods=['GET', 'POST'])
@token_required
def users():
    if request.method == 'GET':
        response = requests.get(f"{USER_SERVICE}/users")
    else:
        response = requests.post(f"{USER_SERVICE}/users", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def user_detail(user_id):
    if request.method == 'GET':
        response = requests.get(f"{USER_SERVICE}/users/{user_id}")
    elif request.method == 'PUT':
        response = requests.put(f"{USER_SERVICE}/users/{user_id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{USER_SERVICE}/users/{user_id}")
    return jsonify(response.json()), response.status_code


@app.route('/users/document/<string:user_document>', methods=['GET'])
@token_required
def user_by_document(user_document):
    response = requests.get(f"{USER_SERVICE}/users/document/{user_document}")
    return jsonify(response.json()), response.status_code


# ── DEVICES ───────────────────────────────────────────────────────────────────

@app.route('/devices', methods=['GET', 'POST'])
@token_required
def devices():
    if request.method == 'GET':
        response = requests.get(f"{DEVICE_SERVICE}/devices")
    else:
        response = requests.post(f"{DEVICE_SERVICE}/devices", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/devices/<int:device_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def device_detail(device_id):
    if request.method == 'GET':
        response = requests.get(f"{DEVICE_SERVICE}/devices/{device_id}")
    elif request.method == 'PUT':
        response = requests.put(f"{DEVICE_SERVICE}/devices/{device_id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{DEVICE_SERVICE}/devices/{device_id}")
    return jsonify(response.json()), response.status_code


# ── LOCATIONS ─────────────────────────────────────────────────────────────────

@app.route('/locations', methods=['GET', 'POST'])
@token_required
def locations():
    if request.method == 'GET':
        response = requests.get(f"{LOCATION_SERVICE}/")
    else:
        response = requests.post(f"{LOCATION_SERVICE}/", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/locations/<int:location_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def location_detail(location_id):
    if request.method == 'GET':
        response = requests.get(f"{LOCATION_SERVICE}/{location_id}")
    elif request.method == 'PUT':
        response = requests.put(f"{LOCATION_SERVICE}/{location_id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{LOCATION_SERVICE}/{location_id}")
    return jsonify(response.json()), response.status_code


# ── METRICS ───────────────────────────────────────────────────────────────────

@app.route('/metrics', methods=['GET', 'POST'])
@token_required
def metrics():
    if request.method == 'GET':
        response = requests.get(f"{METRIC_SERVICE}/metrics")
    else:
        response = requests.post(f"{METRIC_SERVICE}/metrics", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/metrics/<int:metric_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def metric_detail(metric_id):
    if request.method == 'GET':
        response = requests.get(f"{METRIC_SERVICE}/metrics/{metric_id}")
    elif request.method == 'PUT':
        response = requests.put(f"{METRIC_SERVICE}/metrics/{metric_id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{METRIC_SERVICE}/metrics/{metric_id}")
    return jsonify(response.json()), response.status_code


# ── ALERTS ────────────────────────────────────────────────────────────────────

@app.route('/alerts', methods=['GET', 'POST'])
@token_required
def alerts():
    if request.method == 'GET':
        response = requests.get(f"{ALERT_SERVICE}/alerts")
    else:
        response = requests.post(f"{ALERT_SERVICE}/alerts", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/alerts/<int:alert_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def alert_detail(alert_id):
    if request.method == 'GET':
        response = requests.get(f"{ALERT_SERVICE}/alerts/{alert_id}")
    elif request.method == 'PUT':
        response = requests.put(f"{ALERT_SERVICE}/alerts/{alert_id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{ALERT_SERVICE}/alerts/{alert_id}")
    return jsonify(response.json()), response.status_code


@app.route('/alerts/device/<int:device_id>', methods=['GET'])
@token_required
def alerts_by_device(device_id):
    response = requests.get(f"{ALERT_SERVICE}/alerts/device/{device_id}")
    return jsonify(response.json()), response.status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
