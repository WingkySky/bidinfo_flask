from flask import Blueprint, render_template, request, redirect, session
from werkzeug.security import check_password_hash, generate_password_hash
from .. import logger

auth_bp = Blueprint('auth', __name__)

# 用户数据（实际应用中应该存储在数据库中）
users = {
    "admin": generate_password_hash("admin123")
}

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username in users and check_password_hash(users.get(username), password):
            session['logged_in'] = True
            session['username'] = username
            logger.info(f'User {username} logged in successfully')
            return redirect('/')
        return render_template('login.html', error='用户名或密码错误')
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    logger.info('User logged out')
    return redirect('/') 