# 招标信息管理系统

一个基于 Flask 的招标信息管理系统，支持 Excel 文件导入、数据查询和导出功能。专为招标信息管理和分析设计。

## 功能特点

- 📊 支持 Excel 文件（.xls、.xlsx）批量导入招标信息
- 🔍 多条件组合查询（项目名称、时间、地区、招标单位等）
- 📍 省市二级联动的地区筛选
- 📅 支持招标阶段和时间范围筛选
- 💾 支持数据导出为 Excel
- 📈 数据统计分析和可视化展示
- 🔐 基于角色的用户权限管理
- 📱 响应式设计，支持移动端访问

## 技术栈

- **后端框架**: Flask 3.1.0
- **数据库**: PostgreSQL 14+ + SQLAlchemy 2.0
- **前端框架**: Bootstrap 5 + jQuery
- **数据处理**: Pandas, Openpyxl
- **图表展示**: ECharts 5
- **部署**: Docker, Nginx, Gunicorn
- **缓存**: Redis

## 项目结构

```
bidinfo/
├── flaskapp/                # Flask应用主目录
│   ├── __init__.py         # 应用初始化
│   ├── config.py           # 配置文件
│   ├── models/             # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py        # 用户模型
│   │   └── bid.py         # 招标信息模型
│   ├── utils/              # 工具函数
│   │   ├── __init__.py
│   │   ├── excel.py       # Excel处理
│   │   └── auth.py        # 认证相关
│   ├── views/              # 视图函数
│   │   ├── __init__.py
│   │   ├── main.py        # 主要路由
│   │   ├── api.py         # API接口
│   │   └── admin.py       # 管理接口
│   ├── templates/          # 模板文件
│   └── static/            # 静态文件
├── tests/                  # 测试用例
├── instance/               # 实例配置
├── logs/                   # 日志文件
├── run.py                 # 应用启动脚本
├── requirements/          # 依赖管理
│   ├── base.txt          # 基础依赖
│   ├── dev.txt           # 开发环境依赖
│   └── prod.txt          # 生产环境依赖
├── Dockerfile            # Docker构建文件
├── docker-compose.yml    # Docker编排配置
├── nginx/                # Nginx配置
│   ├── nginx.conf       # 主配置
│   └── conf.d/          # 站点配置
└── scripts/             # 运维脚本
    ├── deploy.sh        # 部署脚本
    ├── backup.sh        # 备份脚本
    └── init-db.sh       # 数据库初始化
```

## 开发环境配置

### 1. 系统要求

- Python 3.10+
- PostgreSQL 14+
- Redis 6+
- Node.js 16+ (用于前端资源构建)

### 2. 克隆项目

```bash
git clone https://github.com/your-username/bidinfo.git
cd bidinfo
```

### 3. 创建虚拟环境并安装依赖

```bash
python -m venv venv
source venv/bin/activate  # Windows使用: venv\Scripts\activate
pip install -r requirements/dev.txt
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 配置项说明
FLASK_ENV=development          # 环境设置
FLASK_DEBUG=1                  # 调试模式
SECRET_KEY=your-secret-key     # 密钥
DATABASE_URL=postgresql://...  # 数据库连接
REDIS_URL=redis://...         # Redis连接
```

### 5. 初始化数据库

```bash
flask db upgrade              # 执行数据库迁移
flask init-db                # 初始化基础数据
```

### 6. 运行开发服务器

```bash
flask run --host=0.0.0.0 --port=5001
```

## 数据导入格式要求

Excel文件必须包含以下字段：

| 字段名称     | 是否必填 | 格式要求         | 说明                       |
| ------------ | -------- | ---------------- | -------------------------- |
| 项目名称     | 是       | 文本             | 项目的完整名称             |
| 信息发布时间 | 是       | YYYY-MM-DD       | 招标信息发布日期           |
| 投标截止时间 | 是       | YYYY-MM-DD HH:mm | 投标截止时间               |
| 招标阶段     | 否       | 枚举值           | 如：资格预审/招标/中标公示 |
| 招标金额     | 否       | 数字             | 单位：元                   |
| 招标单位     | 否       | 文本             | 招标方名称                 |
| 省份         | 否       | 文本             | 项目所在省份               |
| 城市         | 否       | 文本             | 项目所在城市               |
| 官网查看地址 | 否       | URL              | 招标信息原始链接           |

## 系统维护

### 数据库维护

```bash
# 数据库备份（每日自动）
0 2 * * * /app/scripts/backup.sh

# 手动备份
./scripts/backup.sh

# 数据库优化
每周日凌晨自动执行：
- 清理过期数据
- 更新统计信息
- 优化数据库索引
```

### 日志管理

- 应用日志：`/logs/app.log`
- 错误日志：`/logs/error.log`
- 访问日志：`/logs/access.log`

### 监控告警

使用 Prometheus + Grafana 监控：

- 系统资源使用情况
- 接口响应时间
- 错误率统计
- 用户访问量

## 性能优化

1. **数据库优化**

   - 使用复合索引提升查询性能
   - 大数据量分页采用游标分页
   - 定期更新统计信息
2. **缓存策略**

   - Redis 缓存热门数据
   - 前端静态资源 CDN 加速
   - 接口数据缓存
3. **并发处理**

   - 大文件异步处理
   - 任务队列处理耗时操作
   - 合理设置连接池大小

## 安全措施

1. **应用安全**

   - CSRF 防护
   - XSS 防护
   - SQL 注入防护
   - 请求频率限制
2. **数据安全**

   - 数据库定时备份
   - 敏感数据加密存储
   - 文件上传限制和校验
3. **访问控制**

   - 基于角色的权限控制
   - 操作日志记录
   - 登录失败限制

## 常见问题解决

1. **导入失败**

   - 检查 Excel 格式是否符合要求
   - 验证必填字段是否完整
   - 查看错误日志获取详细信息
2. **查询超时**

   - 检查查询条件复杂度
   - 验证索引是否生效
   - 考虑使用缓存优化
3. **导出失败**

   - 检查数据量是否过大
   - 验证临时文件权限
   - 考虑分批导出

## 版本更新记录

### v1.2.0 (2024-03-15)

- 添加数据可视化功能
- 优化查询性能
- 增加批量导出功能

### v1.1.0 (2024-02-01)

- 添加用户权限管理
- 优化数据导入逻辑
- 增加数据验证功能

### v1.0.0 (2024-01-01)

- 首次发布

## 许可证

[MIT License](LICENSE)

## 联系方式

- 项目负责人：wing_sky
- 邮箱：wingsky@f-zone.online
- 技术支持：support@f-zone.online

如有问题或建议，请提交 Issue 或 Pull Request。
