# 招标信息管理系统

一个基于Flask的招标信息管理系统，支持Excel文件导入、数据查询和导出功能。

## 功能特点

- 📊 支持Excel文件（.xls、.xlsx）批量导入招标信息
- 🔍 多条件组合查询（项目名称、时间、地区、招标单位等）
- 📍 省市二级联动的地区筛选
- 📅 支持招标阶段和时间范围筛选
- 💾 支持数据导出为Excel
- 🔐 基本的用户认证功能

## 技术栈

- **后端框架**: Flask 3.1.0
- **数据库**: PostgreSQL + SQLAlchemy
- **前端框架**: Bootstrap 5
- **数据处理**: Pandas, Openpyxl
- **部署**: Docker, Nginx, Gunicorn

## 项目结构

```
bidinfo/
├── flaskapp/                # Flask应用主目录
│   ├── __init__.py         # 应用初始化
│   ├── config.py           # 配置文件
│   ├── models.py           # 数据模型
│   ├── utils.py            # 工具函数
│   ├── views/              # 视图函数
│   │   ├── __init__.py
│   │   ├── main.py        # 主要路由
│   │   └── api.py         # API接口
│   ├── templates/          # 模板文件
│   └── static/            # 静态文件
├── instance/               # 实例配置和数据
│   └── database.db        # SQLite数据库（开发环境）
├── run.py                 # 应用启动脚本
├── migrate_data.py        # 数据迁移脚本
├── requirements.txt       # Python依赖
├── Dockerfile            # Docker构建文件
├── docker-compose.yml    # Docker编排配置
├── nginx.conf           # Nginx配置
├── deploy.sh            # 部署脚本
└── .env                 # 环境变量配置
```

## 开发环境配置

### 1. 克隆项目

```bash
git clone [项目地址]
cd bidinfo
```

### 2. 创建虚拟环境并安装依赖

```bash
python -m venv venv
source venv/bin/activate  # Windows使用: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 修改环境变量
nano .env
```

### 4. 运行开发服务器

```bash
# 直接运行
python run.py

# 或者使用 Flask CLI
export FLASK_APP=run.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5001
```

访问 http://localhost:5001 即可使用系统。

## 生产环境部署

### 1. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 域名（用于HTTPS配置）
- SSL证书

### 2. 部署步骤

1. 配置环境变量：
```bash
# 修改环境变量
nano .env

# 必需的环境变量包括：
FLASK_CONFIG=production
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@db:5432/dbname
```

2. 配置SSL证书：
```bash
# 创建证书目录
mkdir ssl
# 复制SSL证书
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

3. 执行部署：
```bash
# 给部署脚本添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 3. 部署架构

```
[Client] --> [Nginx(HTTPS)] --> [Gunicorn] --> [Flask App] --> [PostgreSQL]
```

### 4. 维护命令

```bash
# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f web

# 查看Nginx日志
docker-compose logs -f nginx

# 重启服务
docker-compose restart web

# 数据库备份
docker-compose exec db pg_dump -U $DB_USER $DB_NAME > backup.sql
```

## 数据导入格式

Excel文件需包含以下字段：
- 项目名称（必填）
- 信息发布时间（必填）
- 投标截止时间（必填）
- 招标阶段
- 招标金额（元）
- 招标单位
- 省份
- 城市
- 官网查看地址

## 常见问题（FAQ）

1. **数据库连接错误**
   - 检查环境变量中的数据库连接字符串
   - 确保PostgreSQL服务正常运行

2. **文件上传失败**
   - 检查文件大小是否超过限制
   - 确保上传目录具有正确的写入权限

3. **页面加载缓慢**
   - 检查数据库查询性能
   - 确认Nginx缓存配置是否正确

## 性能优化建议

1. **数据库优化**
   - 为常用查询字段创建索引
   - 定期进行数据库维护和清理

2. **应用优化**
   - 使用合适的批量处理大小
   - 实现合适的缓存策略

## 安全建议

1. 定期更新依赖包
2. 使用强密码和密钥
3. 及时更新SSL证书
4. 定期备份数据
5. 监控服务器资源使用情况

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
