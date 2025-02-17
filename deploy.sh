#!/bin/bash

# 停止现有服务
docker-compose down

# 拉取最新代码
git pull origin main

# 构建新镜像
docker-compose build

# 启动服务
docker-compose up -d

# 执行数据库迁移
docker-compose exec web flask db upgrade

# 检查服务状态
docker-compose ps 