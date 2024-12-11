document.addEventListener('DOMContentLoaded', function() {

    // CSRF token
    const token = document.querySelector("meta[name='_csrf']")?.content;
    const header = document.querySelector("meta[name='_csrf_header']")?.content;


    // Member Selection Modal
    const memberSelectionBtn = document.getElementById('memberSelectionBtn');
    const memberModalElement = document.getElementById('memberModal');
    const saveMembersBtn = document.getElementById('saveMembersBtn');
    let memberModal;
    
    // Initialize selected members from existing badges
    let selectedMembers = Array.from(document.querySelectorAll('#selectedMembers .member-badge'))
        .map(badge => badge.dataset.memberId);

    // Member Modal Initialization
    if (memberSelectionBtn && memberModalElement && saveMembersBtn) {
        memberSelectionBtn.addEventListener('click', function() {
            if (!memberModal) {
                memberModal = new bootstrap.Modal(memberModalElement);
            }
            // Reset and pre-check existing members
            document.querySelectorAll('#memberModal input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = selectedMembers.includes(checkbox.value);
            });
            memberModal.show();
        });

        saveMembersBtn.addEventListener('click', function() {
            selectedMembers = Array.from(document.querySelectorAll('#memberModal input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            updateMemberBadges();
            memberModal.hide();
        });
    }

    // Task Management
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModalElement = document.getElementById('taskModal');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskList = document.getElementById('taskList');
    let taskModal;
    
    // Initialize tasks array from existing tasks
    let tasks = Array.from(document.querySelectorAll('#taskList .task-item')).map(taskElement => ({
        id: taskElement.dataset.taskId,
        name: taskElement.querySelector('.task-name').textContent,
        description: taskElement.dataset.description,
        status: taskElement.querySelector('.task-status-badge').dataset.status,
        startDate: taskElement.querySelector('.task-start-date')?.dataset.date,
        dueDate: taskElement.querySelector('.task-date').dataset.date,
        assignees: Array.from(taskElement.querySelectorAll('.task-assignees img')).map(img => ({
            id: img.dataset.userId,
            name: img.alt,
            avatarUrl: img.src
        }))
    }));

    // Event Listeners for Edit and Delete Tasks
    document.querySelectorAll('.edit-task').forEach((button, index) => {
        button.addEventListener('click', () => editTask(index));
    });

    document.querySelectorAll('.delete-task').forEach((button, index) => {
        button.addEventListener('click', () => deleteTask(index));
    });

    // Task Modal Initialization
    if (addTaskBtn && taskModalElement) {
        taskModal = new bootstrap.Modal(taskModalElement);
        
        addTaskBtn.addEventListener('click', function() {
            resetTaskForm();
            taskModal.show();
        });
    }

    // Task Form Handling
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', function() {
            const taskData = getTaskFormData();
            if (!validateTaskData(taskData)) return;

            const editIndex = saveTaskBtn.getAttribute('data-edit-index');
            if (editIndex !== null) {
                updateExistingTask(parseInt(editIndex), taskData);
            } else {
                addNewTask(taskData);
            }

            taskModal.hide();
        });
    }

    // Helper Functions
    function updateMemberBadges() {
        const memberList = document.getElementById('selectedMembers');
        if (!memberList) return;

        memberList.innerHTML = '';
        document.querySelectorAll('#memberModal input[type="checkbox"]:checked').forEach(checkbox => {
            const memberBadge = createMemberBadge(checkbox);
            memberList.appendChild(memberBadge);
        });
    }

    function createMemberBadge(checkbox) {
        const badge = document.createElement('div');
        badge.className = 'member-badge';
        badge.dataset.memberId = checkbox.value;
        
        const label = checkbox.nextElementSibling;
        badge.innerHTML = `
            <img src="${label.querySelector('img').src}" 
                 class="member-avatar" 
                 alt="${label.querySelector('.fw-bold').textContent}">
            <span>${label.querySelector('.fw-bold').textContent}</span>
        `;
        return badge;
    }

    function getTaskFormData() {
        return {
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value,
            status: document.getElementById('taskStatus').value,
            startDate: document.getElementById('taskStartDate').value,
            dueDate: document.getElementById('taskDueDate').value,
            assignees: Array.from(document.querySelectorAll('.task-assignee:checked')).map(checkbox => ({
                id: checkbox.value,
                name: checkbox.nextElementSibling.querySelector('.fw-bold').textContent,
                avatarUrl: checkbox.nextElementSibling.querySelector('img').src
            }))
        };
    }

    function validateTaskData(taskData) {
        if (!taskData.name.trim()) {
            alert('Vui lòng nhập tên task');
            return false;
        }
        return true;
    }

    function resetTaskForm() {
        document.getElementById('taskForm').reset();
        saveTaskBtn.removeAttribute('data-edit-index');
    }

    function updateExistingTask(index, taskData) {
        const existingTask = tasks[index];
        taskData.id = existingTask.id;
        tasks[index] = taskData;
        
        const taskElement = renderTask(taskData, index);
        taskList.children[index].replaceWith(taskElement);
    }

    function addNewTask(taskData) {
        const newIndex = tasks.length;
        tasks.push(taskData);
        
        const taskElement = renderTask(taskData, newIndex);
        taskList.appendChild(taskElement);
    }

    function renderTask(task, index) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.dataset.taskId = task.id || '';
        taskElement.dataset.description = task.description || '';
        
        taskElement.innerHTML = `
            <div class="task-header">
                <span class="task-name">${task.name}</span>
                <div class="task-actions">
                    <button class="btn btn-sm btn-outline-primary edit-task" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-task" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-info">
                <div class="task-metadata">
                    <span class="task-start-date" data-date="${task.startDate}">
                        <i class="far fa-calendar"></i> ${formatDate(task.startDate)}
                    </span>
                    <span class="task-date-separator">-</span>
                    <span class="task-date" data-date="${task.dueDate}">
                        <i class="far fa-calendar-alt"></i> ${formatDate(task.dueDate)}
                    </span>
                    <span class="task-status-badge ${getStatusClass(task.status)}" data-status="${task.status}">
                        ${getStatusLabel(task.status)}
                    </span>
                </div>
                <div class="task-assignees">
                    ${task.assignees.map(assignee => `
                        <img src="${assignee.avatarUrl}" 
                             class="task-assignee-avatar"
                             alt="${assignee.name}"
                             title="${assignee.name}"
                             data-user-id="${assignee.id}">
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        taskElement.querySelector('.edit-task').addEventListener('click', () => editTask(index));
        taskElement.querySelector('.delete-task').addEventListener('click', () => deleteTask(index));

        return taskElement;
    }

    function editTask(index) {
        const task = tasks[index];
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status || 'TODO';
        document.getElementById('taskStartDate').value = task.startDate;
        document.getElementById('taskDueDate').value = task.dueDate;
        
        document.querySelectorAll('.task-assignee').forEach(checkbox => {
            checkbox.checked = task.assignees.some(assignee => assignee.id === checkbox.value);
        });

        saveTaskBtn.setAttribute('data-edit-index', index);
        taskModal.show();
    }

    async function deleteTask(index) {
        const confirmed = await confirmDeleteModal('công việc này');
        if (!confirmed) return;

        const task = tasks[index];
        if (task.id) {
            const deletedTasksInput = document.createElement('input');
            deletedTasksInput.type = 'hidden';
            deletedTasksInput.name = 'deletedTaskIds';
            deletedTasksInput.value = task.id;
            document.getElementById('projectForm').appendChild(deletedTasksInput);
        }

        tasks.splice(index, 1);
        taskList.children[index].remove();
        
        // Update remaining task indices
        Array.from(taskList.children).forEach((element, i) => {
            element.querySelector('.edit-task').dataset.index = i;
            element.querySelector('.delete-task').dataset.index = i;
        });
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    function getStatusClass(status) {
        const statusClasses = {
            'TODO': 'status-todo',
            'IN_PROGRESS': 'status-in-progress',
            'REVIEW': 'status-review',
            'DONE': 'status-done'
        };
        return statusClasses[status] || 'status-todo';
    }

    function getStatusLabel(status) {
        const statusLabels = {
            'TODO': 'Cần làm',
            'IN_PROGRESS': 'Đang thực hiện',
            'REVIEW': 'Đang review',
            'DONE': 'Hoàn thành'
        };
        return statusLabels[status] || 'Cần làm';
    }

    // Project Form Submission
    const projectForm = document.getElementById('projectForm');
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            basic: Object.fromEntries(new FormData(projectForm)),
            memberIds: selectedMembers,
            tasks: tasks.map(task => ({
                id: task.id,
                name: task.name,
                description: task.description,
                status: task.status || 'TODO',
                startDate: task.startDate,
                dueDate: task.dueDate,
                assigneeIds: task.assignees.map(a => a.id)
            }))
        };

        try {
            const projectId = projectForm.getAttribute('data-project-id');
            const response = await fetch(`/api/projects/${projectId}/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    [header]: token
                },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                window.location.href = `/projects/${projectId}`;
                toast.show('success', 'Dự án đã được cập nhật thành công');
            } else {
                const error = await response.json();
                toast.show('error', error.message || 'Có lỗi xảy ra khi cập nhật dự án');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.show('error', 'Có lỗi xảy ra khi cập nhật dự án');
        }
    });
});