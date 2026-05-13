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


def get_metric_by_id(metric_id):
    metric = Metric.query.get(metric_id)

    if not metric:
        return {"message": "Metric not found"}, 404

    return serialize_metric(metric), 200

def serialize_metric(metric):
    return {
        "id": metric.id,
        "name": metric.name,
        "value": metric.value,
        "timestamp": metric.timestamp
    }


def create_metric(data):
    if Metric.query.filter_by(name=data["name"]).first():
        return {"message": "Metric already exists"}, 409

    new_metric = Metric(
        name=data["name"],
        value=data["value"],
        timestamp=data["timestamp"]
    )

    db.session.add(new_metric)
    db.session.commit()

    return {
        "message": "Metric created successfully",
        "data": serialize_metric(new_metric)
    }, 201


def update_metric(metric_id, data):
    metric = Metric.query.get(metric_id)

    if not metric:
        return {"message": "Metric not found"}, 404

    existing_metric = Metric.query.filter(
        Metric.id != metric_id,
        Metric.name == data["name"]
    ).first()

    if existing_metric:
        return {"message": "Metric already exists"}, 409

    metric.name = data["name"]
    metric.value = data["value"]
    metric.timestamp = data["timestamp"]

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
        "timestamp": metric.timestamp
    }