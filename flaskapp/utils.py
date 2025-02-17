from datetime import datetime
from .models import Tender, db

def format_amount(amount):
    """格式化金额显示"""
    if amount is None:
        return '未设置'
    try:
        amount = float(amount)
        if amount >= 10000:
            return f'{amount/10000:.2f}万元'
        return f'{amount:.2f}元'
    except:
        return '未设置'

def get_friendly_error_message(error):
    """将系统错误转换为友好的中文提示"""
    error_str = str(error)
    
    # 数据库唯一约束错误
    if 'UNIQUE constraint failed' in error_str:
        if 'project_number' in error_str:
            return '项目编号重复'
        if 'project_name' in error_str and 'publish_time' in error_str:
            return '相同项目名称在同一天已存在'
        return '记录重复'
    
    # 数据类型错误
    if 'invalid literal for int()' in error_str:
        return '数字格式无效'
    if 'invalid datetime format' in error_str:
        return '日期格式无效'
    
    # 空值错误
    if 'NOT NULL constraint failed' in error_str:
        field = error_str.split('.')[-1].strip()
        field_names = {
            'project_name': '项目名称',
            'publish_time': '发布时间',
            'bid_stage': '招标阶段',
            'bidding_unit': '招标单位',
            'bid_deadline': '投标截止时间',
            'bid_amount': '招标金额'
        }
        return f'{field_names.get(field, field)}不能为空'
    
    # 数据格式错误
    if 'Numeric value out of range' in error_str:
        return '金额超出有效范围'
    
    # 其他数据库错误
    if 'SQLite error' in error_str:
        return '数据库操作错误'
    
    # 默认错误信息
    return f'导入错误: {error_str}'

def find_duplicate(tender):
    """
    检查记录是否重复:
    1. 首先检查项目名称是否完全相同
    2. 如果名称相同，则继续检查：
       - 项目编号（如果都存在）
       - 项目类型
       - 发布日期
       - 招标单位
       任何一个字段不同，则视为不同记录
    """
    if not tender.project_name:
        return None
        
    # 1. 首先查找项目名称完全相同的记录
    base_query = Tender.query.filter(
        Tender.project_name == tender.project_name
    ).all()
    
    # 如果没有找到同名项目，直接返回
    if not base_query:
        return None
        
    # 2. 对于每个同名记录，检查其他关键字段
    for existing in base_query:
        # 2.1 如果两条记录都有项目编号，则必须完全相同
        if tender.project_number and existing.project_number:
            if tender.project_number != existing.project_number:
                continue  # 项目编号不同，检查下一条记录
                
        # 2.2 检查发布日期（如果都存在）
        if tender.publish_time and existing.publish_time:
            if tender.publish_time.date() != existing.publish_time.date():
                continue  # 发布日期不同，检查下一条记录
                
        # 2.3 检查招标单位（如果都存在）
        if tender.bidding_unit and existing.bidding_unit:
            if tender.bidding_unit != existing.bidding_unit:
                continue  # 招标单位不同，检查下一条记录
                
        # 2.4 检查项目类型（如果都存在）
        if tender.project_type and existing.project_type:
            if tender.project_type != existing.project_type:
                continue  # 项目类型不同，检查下一条记录
        
        # 如果所有已存在的字段都匹配，则认为是重复记录
        return existing
    
    # 如果没有找到完全匹配的记录，则不是重复
    return None

def get_duplicate_type(new_record, existing_record):
    """判断重复的具体原因"""
    reasons = []
    
    # 项目名称一定是相同的
    reasons.append('项目名称相同')
    
    # 检查项目编号
    if new_record.project_number and existing_record.project_number:
        if new_record.project_number == existing_record.project_number:
            reasons.append('项目编号相同')
            
    # 检查发布日期
    if new_record.publish_time and existing_record.publish_time:
        if new_record.publish_time.date() == existing_record.publish_time.date():
            reasons.append('发布日期相同')
            
    # 检查招标单位
    if new_record.bidding_unit and existing_record.bidding_unit:
        if new_record.bidding_unit == existing_record.bidding_unit:
            reasons.append('招标单位相同')
            
    # 检查项目类型
    if new_record.project_type and existing_record.project_type:
        if new_record.project_type == existing_record.project_type:
            reasons.append('项目类型相同')
    
    return ' 且 '.join(reasons)

def allowed_file(filename):
    """检查文件类型是否允许"""
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in {'xls', 'xlsx'} 