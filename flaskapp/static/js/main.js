// 全局通用的JavaScript函数

// 显示错误消息
function showError(message) {
    alert(message);
}

// 显示成功消息
function showSuccess(message) {
    alert(message);
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
}

// 格式化金额
function formatAmount(amount) {
    if (!amount) return '--';
    const num = parseFloat(amount);
    if (isNaN(num)) return '--';
    if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万元';
    }
    return num.toFixed(2) + '元';
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
} 