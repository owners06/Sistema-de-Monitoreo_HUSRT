from models.alertsModel import Alert
from extensions import db


def get_all_alerts():
    alerts = Alert.query.order_by(Alert.id.asc()).all()

    return [serialize_alert(alert) for alert in alerts], 200


def get_alert_by_id(alert_id):
    alert = Alert.query.get(alert_id)

    if not alert:
        return {"message": "Alert not found"}, 404

    return serialize_alert(alert), 200


def create_alert(data):
    new_alert = Alert(
        device_id=data["device_id"],
        message=data["message"],
        timestamp=data["timestamp"]
    )

    db.session.add(new_alert)
    db.session.commit()

    return {
        "message": "Alert created successfully",
        "data": serialize_alert(new_alert)
    }, 201


def update_alert(alert_id, data):
    alert = Alert.query.get(alert_id)

    if not alert:
        return {"message": "Alert not found"}, 404

    alert.device_id = data["device_id"]
    alert.message = data["message"]
    alert.timestamp = data["timestamp"]

    db.session.commit()

    return {
        "message": "Alert updated successfully",
        "data": serialize_alert(alert)
    }, 200


def delete_alert(alert_id):
    alert = Alert.query.get(alert_id)

    if not alert:
        return {"message": "Alert not found"}, 404

    db.session.delete(alert)
    db.session.commit()

    return {"message": "Alert deleted successfully"}, 200


def serialize_alert(alert):
    return {
        "id": alert.id,
        "device_id": alert.device_id,
        "message": alert.message,
        "timestamp": alert.timestamp
    }


def get_alerts_by_id(device_id):
    alerts = Alert.query.filter(Alert.device_id == device_id).all()

    return [serialize_alert(alert) for alert in alerts], 200



