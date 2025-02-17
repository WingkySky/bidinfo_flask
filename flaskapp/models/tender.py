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