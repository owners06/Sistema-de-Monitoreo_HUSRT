from flask import Blueprint, request, jsonify
from controllers.alertsController import (
    get_all_alerts, get_alert_by_id, get_alerts_by_device,
    create_alert, update_alert, delete_alert
)

alert_bp = Blueprint('alert_bp', __name__)


@alert_bp.route('/alerts', methods=['GET'])
def get_alerts_route():
    result, status = get_all_alerts()
    return jsonify(result), status


@alert_bp.route('/alerts/<int:alert_id>', methods=['GET'])
def get_alert_by_id_route(alert_id):
    result, status = get_alert_by_id(alert_id)
    return jsonify(result), status


@alert_bp.route('/alerts/device/<int:device_id>', methods=['GET'])
def get_alerts_by_device_route(device_id):
    result, status = get_alerts_by_device(device_id)
    return jsonify(result), status


@alert_bp.route('/alerts', methods=['POST'])
def create_alert_route():
    data = request.get_json()
    if not data:
        return jsonify({"message": "JSON Data is required"}), 400
    result, status = create_alert(data)
    return jsonify(result), status


@alert_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
def update_alert_route(alert_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "JSON Data is required"}), 400
    result, status = update_alert(alert_id, data)
    return jsonify(result), status


@alert_bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert_route(alert_id):
    result, status = delete_alert(alert_id)
    return jsonify(result), status
