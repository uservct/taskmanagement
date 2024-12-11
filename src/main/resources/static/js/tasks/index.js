document.addEventListener('DOMContentLoaded', function() {
    // Handle status updates
    const dropdownItems = document.querySelectorAll('.status-dropdown .dropdown-item');
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const status = this.dataset.status;
            const taskId = this.closest('.status-dropdown')
                              .querySelector('.dropdown-toggle')
                              .dataset.taskId;
            
            updateTaskStatus(taskId, status);
        });
    });
    
    function updateTaskStatus(taskId, status) {
        console.log(taskId, status);
        fetch(`/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        })
        .then(response => response.json())
        .then(data => {
            // Update UI without page reload
            const statusBadge = document.querySelector(`[data-task-id="${taskId}"]`);
            const statusText = statusBadge.querySelector('span');
            
            // Remove existing status classes
            statusBadge.classList.remove('status-todo', 'status-progress', 'status-review', 'status-done');
            
            // Add new status class and update text
            const statusMap = {
                'TODO': { class: 'status-todo', text: 'Chưa bắt đầu' },
                'IN_PROGRESS': { class: 'status-progress', text: 'Đang thực hiện' },
                'REVIEW': { class: 'status-review', text: 'Đang xem xét' },
                'DONE': { class: 'status-done', text: 'Hoàn thành' }
            };
            
            statusBadge.classList.add(statusMap[status].class);
            statusText.textContent = statusMap[status].text;
            
            // Update updatedAt
            const updatedTime = document.querySelector(`[divTask="${taskId}"]`).querySelector('.update-time');
            updatedTime.textContent = formatDate(data.updatedAt);
            
            // Show success toast or notification
            toast.show('success', 'Cập nhật trạng thái thành công');
        })
        .catch(error => {
            console.error('Error:', error);
            toast.show('error', 'Có lỗi xảy ra khi cập nhật trạng thái');
        });
    }

    // Search and filter functionality
    const searchInput = document.getElementById('taskSearch');
    const projectFilter = document.getElementById('projectFilter');
    const statusFilter = document.getElementById('statusFilter');
    const tagFilter = document.getElementById('tagFilter');
    const dueDateFilter = document.getElementById('dueDateFilter');

    // Add event listeners
    searchInput?.addEventListener('input', filterTasks);
    projectFilter?.addEventListener('change', filterTasks);
    statusFilter?.addEventListener('change', filterTasks);
    tagFilter?.addEventListener('change', filterTasks);
    dueDateFilter?.addEventListener('change', filterTasks);

    function filterTasks() {
        const searchTerm = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const projectValue = projectFilter.value;
        const statusValue = statusFilter.value;
        const tagValue = tagFilter.value;
        const dueDateValue = dueDateFilter.value;
        
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(task => {
            const taskName = task.querySelector('.task-title').textContent
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            const taskDescription = task.querySelector('.task-description')?.textContent
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            
            // Get project ID
            const projectLink = task.querySelector('.project-link');
            const projectId = projectLink?.href.split('/').pop() || '';
            
            // Get status
            const statusBadge = task.querySelector('.status-badge');
            let status = '';
            if (statusBadge.classList.contains('status-todo')) status = 'TODO';
            else if (statusBadge.classList.contains('status-progress')) status = 'IN_PROGRESS';
            else if (statusBadge.classList.contains('status-review')) status = 'REVIEW';
            else if (statusBadge.classList.contains('status-done')) status = 'DONE';
            
            // Get tag
            const tagElement = task.querySelector('.task-tag');
            const tag = tagElement ? tagElement.textContent.trim().toUpperCase() : '';

            // Get due date
            const dueDateElement = task.querySelector('.task-date:last-child');
            const dueDate = dueDateElement ? new Date(dueDateElement.textContent.split('/').reverse().join('-')) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check due date filter
            let matchesDueDate = true;
            if (dueDateValue) {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 7);
                
                const monthEnd = new Date(today);
                monthEnd.setMonth(monthEnd.getMonth() + 1);

                switch(dueDateValue) {
                    case 'overdue':
                        matchesDueDate = dueDate && dueDate < today;
                        break;
                    case 'today':
                        matchesDueDate = dueDate && dueDate.toDateString() === today.toDateString();
                        break;
                    case 'tomorrow':
                        matchesDueDate = dueDate && dueDate.toDateString() === tomorrow.toDateString();
                        break;
                    case 'week':
                        matchesDueDate = dueDate && dueDate >= today && dueDate <= weekEnd;
                        break;
                    case 'month':
                        matchesDueDate = dueDate && dueDate >= today && dueDate <= monthEnd;
                        break;
                }
            }

            // Check if task matches all filters
            const matchesSearch = taskName.includes(searchTerm) || 
                                (taskDescription && taskDescription.includes(searchTerm));
            const matchesProject = !projectValue || projectId === projectValue;
            const matchesStatus = !statusValue || status === statusValue;
            const matchesTag = !tagValue || tag === tagValue;
            
            // Show/hide task based on filter results
            task.style.display = 
                matchesSearch && matchesProject && matchesStatus && 
                matchesTag && matchesDueDate ? 'block' : 'none';
        });
    }

    // Format date helper function
    function formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN');
    }
});
