from models.metricsModel import Metric
from extensions import db


def get_all_metrics():
    metrics = Metric.query.order_by(Metric.id.asc()).all()
    return [serialize_metric(metric) for metric in metrics], 200


def get_metric_by_id(metric_id):
    metric = Metric.query.get(metric_id)
    if not metric:
        return {"message": "Metric not found"}, 404
    return serialize_metric(metric), 200


def create_metric(data):
    from datetime import datetime

    new_metric = Metric(
        name=data["name"],
        value=data["value"],
        timestamp=datetime.fromisoformat(data["timestamp"]) if isinstance(data["timestamp"], str) else data["timestamp"],
        device_id=data.get("device_id"),
        metric_type_id=data.get("metric_type_id")
    )

    db.session.add(new_metric)
    db.session.commit()

    return {
        "message": "Metric created successfully",
        "data": serialize_metric(new_metric)
    }, 201


def update_metric(metric_id, data):
    from datetime import datetime

    metric = Metric.query.get(metric_id)
    if not metric:
        return {"message": "Metric not found"}, 404

    metric.name = data.get("name", metric.name)
    metric.value = data.get("value", metric.value)
    if "timestamp" in data:
        metric.timestamp = datetime.fromisoformat(data["timestamp"]) if isinstance(data["timestamp"], str) else data["timestamp"]
    metric.device_id = data.get("device_id", metric.device_id)
    metric.metric_type_id = data.get("metric_type_id", metric.metric_type_id)

    db.session.commit()

    return {
        "message": "Metric updated successfully",
        "data": serialize_metric(metric)
    }, 200


def delete_metric(metric_id):
    metric = Metric.query.get(metric_id)
    if not metric:
        return {"message": "Metric not found"}, 404

    db.session.delete(metric)
    db.session.commit()

    return {"message": "Metric deleted successfully"}, 200


def serialize_metric(metric):
    return {
        "id": metric.id,
        "name": metric.name,
        "value": metric.value,
        "timestamp": metric.timestamp.isoformat() if metric.timestamp else None,
        "device_id": metric.device_id,
        "metric_type_id": metric.metric_type_id
    }
