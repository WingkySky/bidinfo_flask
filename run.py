import os
from flaskapp import create_app

# 获取环境配置
config_name = os.getenv('FLASK_CONFIG') or 'default'
app = create_app(config_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 