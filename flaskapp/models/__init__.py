from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Tender(db.Model):
    """招标信息模型"""
    __tablename__ = 'tenders'
    
    id = db.Column(db.Integer, primary_key=True)
    entry_time = db.Column(db.DateTime, nullable=False)
    project_name = db.Column(db.String(500), nullable=False)
    keywords = db.Column(db.String(200))
    matching_degree = db.Column(db.String(10))
    project_type = db.Column(db.String(50))
    project_number = db.Column(db.String(100))
    province = db.Column(db.String(20))
    city = db.Column(db.String(20))
    district = db.Column(db.String(20))
    publish_time = db.Column(db.DateTime)
    bid_stage = db.Column(db.String(20))
    registration_deadline = db.Column(db.DateTime)
    bid_deadline = db.Column(db.DateTime)
    bid_amount = db.Column(db.Float)
    bidding_unit = db.Column(db.String(200))
    bidding_unit_extra1 = db.Column(db.String(200))
    bidding_unit_extra2 = db.Column(db.String(200))
    agency_unit = db.Column(db.String(200))
    agency_unit_extra1 = db.Column(db.String(200))
    agency_unit_extra2 = db.Column(db.String(200))
    website_url = db.Column(db.String(500))

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'project_name': self.project_name,
            'project_number': self.project_number,
            'project_type': self.project_type,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'bid_deadline': self.bid_deadline.isoformat() if self.bid_deadline else None,
            'registration_deadline': self.registration_deadline.isoformat() if self.registration_deadline else None,
            'bid_stage': self.bid_stage,
            'bid_amount': self.bid_amount,
            'bidding_unit': self.bidding_unit,
            'agency_unit': self.agency_unit,
            'province': self.province,
            'city': self.city,
            'district': self.district,
            'matching_degree': self.matching_degree,
            'website_url': self.website_url,
            'entry_time': self.entry_time.isoformat() if self.entry_time else None
        } 