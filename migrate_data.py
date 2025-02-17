from app import app, db
from models import Tender

def migrate_bids_to_tenders():
    with app.app_context():
        # 获取所有旧表的数据
        result = db.session.execute('SELECT * FROM bids')
        rows = result.fetchall()
        
        # 迁移数据到新表
        for row in rows:
            tender = Tender(
                project_name=row.project_name,
                publish_time=row.publish_time,
                # ... 其他字段映射 ...
            )
            db.session.add(tender)
        
        # 提交更改
        db.session.commit()
        
        # 删除旧表
        db.session.execute('DROP TABLE IF EXISTS bids')
        db.session.commit()

if __name__ == '__main__':
    migrate_bids_to_tenders() 