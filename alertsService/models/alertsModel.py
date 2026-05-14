from extensions import db


class AlertSeverity(db.Model):
    __tablename__ = "alert_severities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    severity_id = db.Column(db.Integer, db.ForeignKey('alert_severities.id'), nullable=True)
