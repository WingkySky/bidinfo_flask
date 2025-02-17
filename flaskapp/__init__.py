from flask import Flask
from flask_migrate import Migrate
from flask_httpauth import HTTPBasicAuth
import logging
import os
from .config import config
from .models import db
from .utils import format_amount

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# 初始化扩展
auth = HTTPBasicAuth()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # 加载配置
    app.config.from_object(config[config_name])
    
    # 确保实例文件夹存在
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # 初始化扩展
    db.init_app(app)
    
    # 配置日志
    logging.basicConfig(
        level=getattr(logging, app.config['LOG_LEVEL']),
        format=app.config['LOG_FORMAT'],
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(app.config['LOG_FILE'])
        ]
    )
    
    # 注册蓝图
    from .views.auth import auth_bp
    from .views.main import main_bp
    from .views.api import api_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 初始化数据库
    with app.app_context():
        init_db()
    
    return app

def init_db():
    """初始化数据库"""
    try:
        if not os.path.exists('instance'):
            os.makedirs('instance', mode=0o755)
            logger.info('Created instance directory')
        
        os.chmod('instance', 0o755)
        
        db_path = 'instance/database.db'
        if not os.path.exists(db_path):
            open(db_path, 'a').close()
            os.chmod(db_path, 0o644)
            logger.info('Created database file')
        
        db.create_all()
        logger.info('Database tables created successfully')
            
    except Exception as e:
        logger.error(f'Database initialization failed: {str(e)}')
        raise 