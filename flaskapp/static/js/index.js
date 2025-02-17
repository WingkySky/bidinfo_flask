// 全局变量
let currentPage = 1;
let totalPages = 1;
let selectedIds = new Set();

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化选项数据
    initializeOptions();
    
    // 初始化事件监听
    initializeEventListeners();
    
    // 加载数据
    loadData();
});

// 初始化选项数据
async function initializeOptions() {
    try {
        const response = await fetch('/api/options');
        const data = await response.json();
        
        // 填充选项数据
        fillSelectOptions('bid_stage', data.bid_stages);
        fillSelectOptions('project_type', data.project_types);
        fillSelectOptions('matching_degree', data.matching_degrees);
        
        // 填充省份数据
        const provinceSelect = document.getElementById('province');
        data.provinces.forEach(province => {
            const option = new Option(province.name, province.name);
            provinceSelect.add(option);
        });
        
        // 省份变更时更新城市
        provinceSelect.addEventListener('change', function() {
            const citySelect = document.getElementById('city');
            citySelect.innerHTML = '<option value="">全部</option>';
            
            const selectedProvince = this.value;
            if (selectedProvince) {
                const province = data.provinces.find(p => p.name === selectedProvince);
                if (province) {
                    province.cities.forEach(city => {
                        const option = new Option(city, city);
                        citySelect.add(option);
                    });
                }
            }
        });
    } catch (error) {
        console.error('加载选项数据失败:', error);
        showError('加载选项数据失败');
    }
}

// 填充选择框选项
function fillSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(option => {
        const optionElement = new Option(option, option);
        select.add(optionElement);
    });
}

// 初始化事件监听
function initializeEventListeners() {
    // 搜索表单提交
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadData();
    });
    
    // 重置按钮
    document.getElementById('searchForm').addEventListener('reset', function() {
        setTimeout(() => {
            currentPage = 1;
            loadData();
        }, 0);
    });
    
    // 全选框
    if (document.getElementById('checkAll')) {
        document.getElementById('checkAll').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('table input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const id = parseInt(checkbox.value);
                if (this.checked) {
                    selectedIds.add(id);
                } else {
                    selectedIds.delete(id);
                }
            });
            updateBatchDeleteButton();
        });
    }
    
    // 导入按钮
    if (document.getElementById('btnImport')) {
        document.getElementById('btnImport').addEventListener('click', showImportDialog);
    }
    
    // 导出按钮
    if (document.getElementById('btnExport')) {
        document.getElementById('btnExport').addEventListener('click', exportData);
    }
    
    // 批量删除按钮
    if (document.getElementById('btnBatchDelete')) {
        document.getElementById('btnBatchDelete').addEventListener('click', batchDelete);
    }
    
    // 导入表单提交
    if (document.getElementById('importForm')) {
        document.getElementById('importForm').addEventListener('submit', handleImport);
    }
}

// 加载数据
async function loadData() {
    try {
        const formData = new FormData(document.getElementById('searchForm'));
        const params = new URLSearchParams(formData);
        params.append('page', currentPage);
        
        const response = await fetch(`/api/bids?${params.toString()}`);
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        renderTable(data.items);
        renderPagination(data.current_page, data.pages, data.total);
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('加载数据失败');
    }
}

// 渲染表格
function renderTable(items) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const tr = document.createElement('tr');
        
        // 如果是管理员，添加复选框
        if (document.getElementById('checkAll')) {
            tr.innerHTML = `
                <td><input type="checkbox" value="${item.id}" ${selectedIds.has(item.id) ? 'checked' : ''}></td>
            `;
        }
        
        tr.innerHTML += renderTableRow(item);
        
        tbody.appendChild(tr);
    });
    
    // 绑定复选框事件
    if (document.getElementById('checkAll')) {
        tbody.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const id = parseInt(this.value);
                if (this.checked) {
                    selectedIds.add(id);
                } else {
                    selectedIds.delete(id);
                }
                updateBatchDeleteButton();
            });
        });
    }
}

// 修改渲染表格行的函数
function renderTableRow(item) {
    const isAdmin = document.getElementById('checkAll') !== null;  // 通过检查全选框判断是否是管理员
    
    return `
        <tr data-id="${item.id}">
            <td>
                <div class="form-check">
                    <input class="form-check-input row-checkbox" type="checkbox" value="${item.id}">
                </div>
            </td>
            <td class="text-wrap" title="${item.project_name || '--'}">${item.project_name || '--'}</td>
            <td class="text-center">${formatDate(item.publish_time)}</td>
            <td class="text-center">${formatDate(item.bid_deadline)}</td>
            <td class="text-center">${item.bid_stage || '--'}</td>
            <td class="text-end">${formatAmount(item.bid_amount)}</td>
            <td class="text-wrap" title="${item.bidding_unit || '--'}">${item.bidding_unit || '--'}</td>
            <td class="text-center">${item.project_type || '--'}</td>
            <td class="text-center">
                <span class="badge ${getMatchingDegreeClass(item.matching_degree)}">
                    ${item.matching_degree || '--'}
                </span>
            </td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    ${item.website_url ? 
                        `<a href="${item.website_url}" target="_blank" class="btn btn-outline-primary" title="查看原文">
                            <i class="bi bi-link-45deg"></i>
                        </a>` : ''
                    }
                    <button type="button" class="btn btn-outline-info" onclick="showDetails(${item.id})" title="查看详情">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${isAdmin ? 
                        `<button type="button" class="btn btn-outline-danger" onclick="deleteBid(${item.id}, '${item.project_name}')" title="删除">
                            <i class="bi bi-trash"></i>
                        </button>` : ''
                    }
                </div>
            </td>
        </tr>
    `;
}

// 获取契合度样式
function getMatchingDegreeClass(degree) {
    switch(degree) {
        case '高': return 'bg-success';
        case '中': return 'bg-warning text-dark';
        case '低': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// 显示详情
function showDetails(id) {
    window.location.href = `/bids/${id}`;
}

// 删除确认
function deleteBid(id, projectName) {
    if (confirm(`确定要删除项目"${projectName}"吗？此操作不可恢复。`)) {
        fetch(`/api/bids/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            showAlert('删除成功', 'success');
            loadData(currentPage);
        })
        .catch(error => {
            showAlert(`删除失败: ${error.message}`, 'danger');
        });
    }
}

// 渲染分页
function renderPagination(currentPage, totalPages, total) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';
    
    // 更新总数显示
    document.getElementById('totalCount').textContent = total;
    
    // 如果只有一页，不显示分页
    if (totalPages <= 1) return;
    
    // 上一页按钮
    const prevButton = document.createElement('button');
    prevButton.textContent = '上一页';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadData();
        }
    });
    pagination.appendChild(prevButton);
    
    // 页码按钮
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadData();
        });
        pagination.appendChild(pageButton);
    }
    
    // 下一页按钮
    const nextButton = document.createElement('button');
    nextButton.textContent = '下一页';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadData();
        }
    });
    pagination.appendChild(nextButton);
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化金额
function formatAmount(amount) {
    if (!amount) return '--';
    const num = parseFloat(amount);
    if (isNaN(num)) return '--';
    if (num >= 100000000) {
        return (num / 100000000).toFixed(2) + '亿元';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万元';
    }
    return num.toFixed(2) + '元';
}

// 显示错误信息
function showError(message) {
    // 可以根据需要实现错误提示UI
    alert(message);
}

// 更新批量删除按钮状态
function updateBatchDeleteButton() {
    const btnBatchDelete = document.getElementById('btnBatchDelete');
    if (btnBatchDelete) {
        btnBatchDelete.disabled = selectedIds.size === 0;
    }
}

// 导出选中的数据
function exportSelectedData(selectedRows) {
    fetch('/api/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            exportType: 'selected',
            selectedData: selectedRows
        })
    })
    .then(handleExportResponse)
    .then(handleExportDownload)
    .catch(handleExportError);
}

// 导出筛选后的所有数据
function exportFilteredData(searchParams) {
    // 将 URLSearchParams 转换为普通对象
    const filterParams = {};
    for (let [key, value] of searchParams.entries()) {
        filterParams[key] = value;
    }

    fetch('/api/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            exportType: 'all',
            filterParams: filterParams
        })
    })
    .then(handleExportResponse)
    .then(handleExportDownload)
    .catch(handleExportError);
}

// 处理导出响应
function handleExportResponse(response) {
    if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
    }
    return response.blob();
}

// 处理导出错误
function handleExportError(error) {
    console.error('导出错误:', error);
    const errorMessage = error.error || error.message || '导出失败，请稍后重试';
    showAlert(errorMessage, 'danger');
}

// 处理导出文件下载
function handleExportDownload(blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/[/:]/g, '').replace(/\s+/g, '_');
    a.download = `招标数据_${timestamp}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 0);
}

// 获取选中的行数据
function getSelectedRows() {
    const selectedRows = [];
    document.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        const rowData = {
            id: row.dataset.id,
            project_name: row.querySelector('td:nth-child(2)').textContent.trim(),
            publish_time: row.querySelector('td:nth-child(3)').textContent.trim(),
            bid_deadline: row.querySelector('td:nth-child(4)').textContent.trim(),
            bid_stage: row.querySelector('td:nth-child(5)').textContent.trim(),
            bid_amount: row.querySelector('td:nth-child(6)').textContent.trim(),
            bidding_unit: row.querySelector('td:nth-child(7)').textContent.trim(),
            project_type: row.querySelector('td:nth-child(8)').textContent.trim(),
            matching_degree: row.querySelector('td:nth-child(9)').textContent.trim()
        };
        
        // 过滤掉占位符 '--'
        Object.keys(rowData).forEach(key => {
            if (rowData[key] === '--') {
                rowData[key] = '';
            }
        });
        
        selectedRows.push(rowData);
    });
    return selectedRows;
}

// 修改导出数据函数
function exportData() {
    const selectedRows = getSelectedRows();
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
    const searchParams = new URLSearchParams();
    
    // 获取当前筛选条件
    for (let [key, value] of formData.entries()) {
        if (value) searchParams.append(key, value);
    }

    // 获取当前筛选条件下的总数
    fetch(`/api/bids/count?${searchParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            const totalFilteredCount = data.total;
            
            // 创建导出选项对话框
            const modalHtml = `
                <div class="modal fade" id="exportModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">导出数据</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${selectedRows.length > 0 ? `
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="radio" name="exportScope" id="exportSelected" value="selected" checked>
                                        <label class="form-check-label" for="exportSelected">
                                            导出选中数据（${selectedRows.length} 条记录）
                                        </label>
                                    </div>
                                ` : ''}
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="exportScope" id="exportAll" value="all" 
                                        ${selectedRows.length === 0 ? 'checked' : ''}>
                                    <label class="form-check-label" for="exportAll">
                                        导出筛选数据（${totalFilteredCount} 条记录）
                                    </label>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                                <button type="button" class="btn btn-primary" onclick="executeExport()">确认导出</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 移除已存在的模态框
            const existingModal = document.getElementById('exportModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 添加模态框到页面
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // 显示模态框
            const modal = new bootstrap.Modal(document.getElementById('exportModal'));
            modal.show();

            // 定义导出执行函数
            window.executeExport = function() {
                const exportScope = document.querySelector('input[name="exportScope"]:checked').value;
                
                if (exportScope === 'selected' && selectedRows.length > 0) {
                    // 导出选中的数据
                    exportSelectedData(selectedRows);
                } else {
                    // 导出所有筛选数据
                    exportFilteredData(searchParams);
                }
                
                // 关闭模态框
                modal.hide();
            };
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('获取数据总数失败', 'danger');
        });
}

// 批量删除
async function batchDelete() {
    if (selectedIds.size === 0) {
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/bids/batch', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ids: Array.from(selectedIds)
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // 清空选中的ID
        selectedIds.clear();
        updateBatchDeleteButton();
        
        // 重新加载数据
        loadData();
        
    } catch (error) {
        showError(error.message);
    }
}

// 显示导入对话框
function showImportDialog() {
    const dialog = document.getElementById('importDialog');
    dialog.classList.add('show');
    
    // 重置表单和结果显示
    document.getElementById('importForm').reset();
    document.getElementById('importResult').style.display = 'none';
    
    // 绑定关闭按钮事件
    dialog.querySelectorAll('.close-dialog').forEach(btn => {
        btn.addEventListener('click', () => {
            dialog.classList.remove('show');
        });
    });
}

// 处理导入
async function handleImport(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const resultDiv = document.getElementById('importResult');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> 导入中...';
    
    try {
        const response = await fetch('/api/import', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '导入失败');
        }
        
        // 显示导入结果统计
        resultDiv.innerHTML = `
            <div class="result-summary">
                <p>总记录数：${result.total}</p>
                <p>成功导入：${result.success_count}</p>
                <p>重复记录：${result.duplicate_count}</p>
                <p>导入失败：${result.error_count}</p>
            </div>
        `;
        
        // 显示重复记录对比
        if (result.duplicate_records && result.duplicate_records.length > 0) {
            const duplicateList = document.createElement('div');
            duplicateList.id = 'duplicateList';
            duplicateList.innerHTML = `
                <h4>重复记录对比：</h4>
                ${result.duplicate_records.map(record => `
                    <div class="duplicate-item">
                        <div class="duplicate-header">
                            <span>行号：${record.row_number}</span>
                            <span>重复类型：${record.duplicate_type}</span>
                        </div>
                        <table class="compare-table">
                            <thead>
                                <tr>
                                    <th>字段</th>
                                    <th>新数据</th>
                                    <th>已存在数据</th>
                                    <th>对比结果</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>项目名称</td>
                                    <td>${record.new_record.project_name || '--'}</td>
                                    <td>${record.existing_record.project_name || '--'}</td>
                                    <td class="compare-result">
                                        ${record.new_record.project_name === record.existing_record.project_name ? 
                                            '<i class="bi bi-check-circle-fill text-success"></i>' : 
                                            '<i class="bi bi-x-circle-fill text-danger"></i>'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>项目编号</td>
                                    <td>${record.new_record.project_number || '--'}</td>
                                    <td>${record.existing_record.project_number || '--'}</td>
                                    <td class="compare-result">
                                        ${record.new_record.project_number === record.existing_record.project_number ? 
                                            '<i class="bi bi-check-circle-fill text-success"></i>' : 
                                            '<i class="bi bi-x-circle-fill text-danger"></i>'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>发布时间</td>
                                    <td>${record.new_record.publish_time || '--'}</td>
                                    <td>${record.existing_record.publish_time || '--'}</td>
                                    <td class="compare-result">
                                        ${record.new_record.publish_time === record.existing_record.publish_time ? 
                                            '<i class="bi bi-check-circle-fill text-success"></i>' : 
                                            '<i class="bi bi-x-circle-fill text-danger"></i>'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>招标阶段</td>
                                    <td>${record.new_record.bid_stage || '--'}</td>
                                    <td>${record.existing_record.bid_stage || '--'}</td>
                                    <td class="compare-result">
                                        ${record.new_record.bid_stage === record.existing_record.bid_stage ? 
                                            '<i class="bi bi-check-circle-fill text-success"></i>' : 
                                            '<i class="bi bi-x-circle-fill text-danger"></i>'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>招标金额</td>
                                    <td>${record.new_record.bid_amount || '--'}</td>
                                    <td>${record.existing_record.bid_amount || '--'}</td>
                                    <td class="compare-result">
                                        ${record.new_record.bid_amount === record.existing_record.bid_amount ? 
                                            '<i class="bi bi-check-circle-fill text-success"></i>' : 
                                            '<i class="bi bi-x-circle-fill text-danger"></i>'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>招标单位</td>
                                    <td>${record.new_record.bidding_unit || '--'}</td>
                                    <td>${record.existing_record.bidding_unit || '--'}</td>
                                    <td class="compare-result">
                                        ${record.new_record.bidding_unit === record.existing_record.bidding_unit ? 
                                            '<i class="bi bi-check-circle-fill text-success"></i>' : 
                                            '<i class="bi bi-x-circle-fill text-danger"></i>'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </div>
        `;
            resultDiv.appendChild(duplicateList);
        }
        
        // 显示错误详情
        if (result.error_details && result.error_details.length > 0) {
            const errorList = document.createElement('div');
            errorList.id = 'errorList';
            errorList.innerHTML = `
                <h4>错误详情：</h4>
                ${result.error_details.map(error => `
                    <div class="error-item">
                        <p>行号：${error.row_number}</p>
                        <p>错误：${error.error_message}</p>
                        <p>数据：${JSON.stringify(error.data)}</p>
                    </div>
                `).join('')}
            `;
            resultDiv.appendChild(errorList);
        }
        
        resultDiv.style.display = 'block';
        resultDiv.className = 'import-result success';
        
        // 重新加载数据
        loadData();
        
    } catch (error) {
        resultDiv.innerHTML = `<p>导入失败：${error.message}</p>`;
        resultDiv.style.display = 'block';
        resultDiv.className = 'import-result error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '导入';
    }
}

// 全选/取消全选
function toggleAllRows() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        const id = parseInt(checkbox.closest('tr').dataset.id);
        if (selectAllCheckbox.checked) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }
    });
    
    // 更新批量删除按钮状态
    updateBatchDeleteButton();
}

// 监听单个复选框变化
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('row-checkbox')) {
        const id = parseInt(e.target.closest('tr').dataset.id);
        if (e.target.checked) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }
        
        // 更新全选框状态
        const selectAllCheckbox = document.getElementById('selectAll');
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        selectAllCheckbox.checked = Array.from(rowCheckboxes).every(cb => cb.checked);
        
        // 更新批量删除按钮状态
        updateBatchDeleteButton();
    }
}); 