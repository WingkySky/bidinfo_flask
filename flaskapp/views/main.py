from flask import Blueprint, render_template, session, flash, redirect, url_for
from functools import wraps
from flaskapp.models import Tender
from flaskapp.utils import format_amount
import logging

main_bp = Blueprint('main', __name__)
logger = logging.getLogger(__name__)

# 添加自定义过滤器
@main_bp.app_template_filter('format_amount')
def format_amount_filter(amount):
    return format_amount(amount)

@main_bp.app_template_filter('matching_degree_class')
def matching_degree_class_filter(degree):
    if not degree:
        return 'bg-secondary'
    classes = {
        '高': 'bg-success',
        '中': 'bg-warning text-dark',
        '低': 'bg-danger'
    }
    return classes.get(degree, 'bg-secondary')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

@main_bp.route('/')
def index():
    """首页路由"""
    is_admin = session.get('logged_in', False)
    username = session.get('username')
    return render_template('index.html', is_admin=is_admin, username=username)

@main_bp.route('/bids/<int:bid_id>')
def bid_details(bid_id):
    """招标详情页"""
    try:
        tender = Tender.query.get_or_404(bid_id)
        return render_template('bid_details.html', tender=tender)
    except Exception as e:
        logger.error(f'访问招标详情页出错: {str(e)}')
        flash('获取详情失败', 'error')
        return redirect(url_for('main.index')) 