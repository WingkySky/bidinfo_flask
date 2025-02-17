from . import db
from datetime import datetime

class Tender(db.Model):
    __tablename__ = 'tenders'
    
    id = db.Column(db.Integer, primary_key=True)
    entry_time = db.Column(db.DateTime, default=datetime.now)
    project_name = db.Column(db.String(255), nullable=False)
    keywords = db.Column(db.String(255))
    project_number = db.Column(db.String(100))
    province = db.Column(db.String(50))
    city = db.Column(db.String(50))
    district = db.Column(db.String(50))
    publish_time = db.Column(db.DateTime)
    bid_stage = db.Column(db.String(50))
    registration_deadline = db.Column(db.DateTime)
    bid_deadline = db.Column(db.DateTime)
    bid_amount = db.Column(db.Float)
    bidding_unit = db.Column(db.String(255))
    bidding_unit_extra1 = db.Column(db.String(255))
    bidding_unit_extra2 = db.Column(db.String(255))
    agency_unit = db.Column(db.String(255))
    agency_unit_extra1 = db.Column(db.String(255))
    agency_unit_extra2 = db.Column(db.String(255))
    website_url = db.Column(db.String(500))
    project_type = db.Column(db.String(100))
    matching_degree = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'project_name': self.project_name,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'bid_deadline': self.bid_deadline.isoformat() if self.bid_deadline else None,
            'bid_stage': self.bid_stage,
            'bid_amount': float(self.bid_amount) if self.bid_amount is not None else None,
            'bidding_unit': self.bidding_unit,
            'project_type': self.project_type,
            'matching_degree': self.matching_degree,
            'website_url': self.website_url,
            'province': self.province,
            'city': self.city
        } 