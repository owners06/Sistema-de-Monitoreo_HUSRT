from flask import Blueprint, request, jsonify
from controllers.metricsController import (
    get_all_metrics, get_metric_by_id,
    create_metric, update_metric, delete_metric
)

metric_bp = Blueprint('metric_bp', __name__)


@metric_bp.route('/metrics', methods=['GET'])
def get_metrics_route():
    result, status = get_all_metrics()
    return jsonify(result), status


@metric_bp.route('/metrics/<int:metric_id>', methods=['GET'])
def get_metric_by_id_route(metric_id):
    result, status = get_metric_by_id(metric_id)
    return jsonify(result), status


@metric_bp.route('/metrics', methods=['POST'])
def create_metric_route():
    data = request.get_json()
    if not data:
        return jsonify({"message": "JSON Data is required"}), 400
    result, status = create_metric(data)
    return jsonify(result), status


@metric_bp.route('/metrics/<int:metric_id>', methods=['PUT'])
def update_metric_route(metric_id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "JSON Data is required"}), 400
    result, status = update_metric(metric_id, data)
    return jsonify(result), status


@metric_bp.route('/metrics/<int:metric_id>', methods=['DELETE'])
def delete_metric_route(metric_id):
    result, status = delete_metric(metric_id)
    return jsonify(result), status
