from extensions import db


class MetricType(db.Model):
    __tablename__ = "metric_types"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class Metric(db.Model):
    __tablename__ = "metrics"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    device_id = db.Column(db.Integer, nullable=False)
    metric_type_id = db.Column(db.Integer, db.ForeignKey('metric_types.id'), nullable=True)
