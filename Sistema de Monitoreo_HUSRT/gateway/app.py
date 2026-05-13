from flask import Flask, request, jsonify
import requests
from functools import wraps
import jwt

app = Flask(__name__)

#LOCAL
AUTH_SERVICE = "http://localhost:5003/auth"
USER_SERVICE = "http://localhost:5001/user"
DEVICE_SERVICE = "http://localhost:5002/device"
LOCATION_SERVICE = "http://localhost:5004/location"
ALERT_SERVICE = "http://localhost:5006/alert"
METRIC_SERVICE = "http://localhost:5005/metric"

# DOCKER
# AUTH_SERVICE = "http://authService:5003/auth"
# USER_SERVICE = "http://usersService:5001/user"
# DEVICE_SERVICE = "http://devicesService:5002/device"
# LOCATION_SERVICE = "http://locationsService:5003/location"
# ALERT_SERVICE = "http://alertsService:5006/alert"
# METRIC_SERVICE = "http://metricsService:5005/metric"

SECRET_KEY = "super_secret_key"

# For mantein the order of the responses in JSON format
app.json.sort_keys = False

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
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
            return jsonify({"error": "error on token"}), 401
        
        return f(*args, **kwargs)
    return decorated

@app.route('/auth/register', methods=['POST'])
def register():
    response = requests.post(f"{AUTH_SERVICE}/register", json=request.json)
    return jsonify(response.json()), response.status_code


@app.route('/auth/login', methods=['POST'])
def login():
    response = requests.post(f"{AUTH_SERVICE}/login", json=request.json)
    return jsonify(response.json()), response.status_code

# DEVICES ----------------------------------------

@app.route('/devices', methods=['POST', 'GET'])
@token_required
def devices():
    if request.method == 'POST':
        response = requests.post(DEVICE_SERVICE, json=request.json)
        return jsonify(response.json()), response.status_code
    if request.method == 'GET':
        response = requests.get(DEVICE_SERVICE)
        return jsonify(response.json()), response.status_code

@app.route('/devices/<int:device_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def device_detail(device_id):
    
    if request.method == 'GET':
        response = requests.get(f"{DEVICE_SERVICE}/{device_id}")
    elif request.method == 'PUT':
        response = requests.put(f"{DEVICE_SERVICE}/{device_id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{DEVICE_SERVICE}/{device_id}")    
    return jsonify(response.json()), response.status_code

# LOCATIONS ----------------------------------------

@app.route('/locations', methods=['POST', 'GET'])
@token_required
def locations():
    if request.method == 'POST':
        response = requests.post(LOCATION_SERVICE, json=request.json)
        return jsonify(response.json()), response.status_code
    if request.method == 'GET':
        response = requests.get(LOCATION_SERVICE)
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

if __name__ == "__main__":
    # app.run(debug=True, port=5000)
    app.run(host="0.0.0.0", port=5000, debug=True)