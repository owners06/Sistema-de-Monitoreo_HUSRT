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
    try:
        new_metric = Metric(
            name=data.get("name"),
            value=float(data.get("value")) if data.get("value") is not None else 0.0,
            timestamp=datetime.fromisoformat(str(data.get("timestamp"))) if data.get("timestamp") else datetime.utcnow(),
            device_id=int(data.get("device_id")) if data.get("device_id") is not None else None,
            metric_type_id=int(data.get("metric_type_id")) if data.get("metric_type_id") is not None else None
        )

        db.session.add(new_metric)
        db.session.commit()

        return {
            "message": "Metric created successfully",
            "data": serialize_metric(new_metric)
        }, 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"message": f"Error interno: {str(e)}"}, 500


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
