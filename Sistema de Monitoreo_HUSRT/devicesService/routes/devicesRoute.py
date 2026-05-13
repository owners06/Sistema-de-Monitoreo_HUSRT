from flask import Blueprint, request, jsonify
from controllers.devicesController import *

device_bp = Blueprint('device_bp', __name__)


@device_bp.route('/devices', methods=['GET'])
def get_devices_route():
    result, status = get_all_devices()
    return jsonify(result), status


@device_bp.route('/devices/<int:device_id>', methods=['GET'])
def get_device_by_id_route(device_id):
    result, status = get_device_by_id(device_id)
    return jsonify(result), status


@device_bp.route('/devices', methods=['POST'])
def create_device_route():
    data = request.get_json()

    if not data:
        return jsonify({"message": "JSON Data is required"}), 400

    result, status = create_device(data)
    return jsonify(result), status


@device_bp.route('/devices/<int:device_id>', methods=['PUT'])
def update_device_route(device_id):
    data = request.get_json()

    if not data:
        return jsonify({"message": "JSON Data is required"}), 400

    result, status = update_device(device_id, data)
    return jsonify(result), status


@device_bp.route('/devices/<int:device_id>', methods=['DELETE'])
def delete_device_route(device_id):
    result, status = delete_device(device_id)
    return jsonify(result), status