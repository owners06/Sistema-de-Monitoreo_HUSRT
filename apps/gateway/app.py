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


def admin_required(f):
    """Decorator que requiere token + rol admin."""
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

        if decoded_token.get("role") != "admin":
            return jsonify({"error": "Acceso denegado. Se requiere rol de administrador."}), 403

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


@app.route('/auth/me', methods=['GET'])
@token_required
def get_me():
    """Retorna los datos del usuario actual a partir del token JWT."""
    user_data = {
        "user_id": request.user.get("user_id"),
        "email": request.user.get("email"),
        "username": request.user.get("username"),
        "role": request.user.get("role", "viewer")
    }
    return jsonify(user_data), 200


# ── AUTH USERS (admin) ────────────────────────────────────────────────────────

@app.route('/auth/users', methods=['GET'])
@admin_required
def get_auth_users():
    response = requests.get(f"{AUTH_SERVICE}/users")
    return jsonify(response.json()), response.status_code


@app.route('/auth/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_auth_user_role(user_id):
    response = requests.put(f"{AUTH_SERVICE}/users/{user_id}/role", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/auth/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_auth_user(user_id):
    response = requests.delete(f"{AUTH_SERVICE}/users/{user_id}")
    return jsonify(response.json()), response.status_code


# ── ROLE REQUESTS ─────────────────────────────────────────────────────────────

@app.route('/auth/role-requests', methods=['POST'])
@token_required
def create_role_request():
    data = request.json or {}
    data["user_id"] = request.user.get("user_id")
    response = requests.post(f"{AUTH_SERVICE}/role-requests", json=data)
    return jsonify(response.json()), response.status_code


@app.route('/auth/role-requests', methods=['GET'])
@admin_required
def get_all_role_requests():
    response = requests.get(f"{AUTH_SERVICE}/role-requests")
    return jsonify(response.json()), response.status_code


@app.route('/auth/role-requests/mine', methods=['GET'])
@token_required
def get_my_role_requests():
    user_id = request.user.get("user_id")
    response = requests.get(f"{AUTH_SERVICE}/role-requests/user/{user_id}")
    return jsonify(response.json()), response.status_code


@app.route('/auth/role-requests/<int:request_id>/approve', methods=['PUT'])
@admin_required
def approve_role_request(request_id):
    response = requests.put(f"{AUTH_SERVICE}/role-requests/{request_id}/approve")
    return jsonify(response.json()), response.status_code


@app.route('/auth/role-requests/<int:request_id>/reject', methods=['PUT'])
@admin_required
def reject_role_request(request_id):
    response = requests.put(f"{AUTH_SERVICE}/role-requests/{request_id}/reject")
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
