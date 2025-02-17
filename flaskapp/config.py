import os

class Config:
    """基础配置"""
    # 基础路径
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "instance", "database.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 安全配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-please-change-in-production'
    
    # 日志配置
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = 'app.log'
    
    # 分页配置
    ITEMS_PER_PAGE = 20
    
    # 文件上传配置
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'xls', 'xlsx'}

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    
    # 开发环境可以使用更详细的日志级别
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    
    # 生产环境应该使用更安全的配置
    SECRET_KEY = os.environ.get('SECRET_KEY')  # 必须设置环境变量
    
    # 生产环境数据库配置（示例）
    # SQLALCHEMY_DATABASE_URI = 'mysql://user:password@localhost/dbname'
    
    # 生产环境日志配置
    LOG_LEVEL = 'WARNING'
    LOG_FILE = '/var/log/flaskapp/app.log'

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    
    # 使用内存数据库进行测试
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # 禁用CSRF保护，方便测试
    WTF_CSRF_ENABLED = False

# 配置映射
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 