// Main event listener when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // CSRF token
    const token = document.querySelector("meta[name='_csrf']")?.content;
    const header = document.querySelector("meta[name='_csrf_header']")?.content;


    // Initialize member selection modal components
    const memberSelectionBtn = document.getElementById('memberSelectionBtn');
    const memberModalElement = document.getElementById('memberModal');
    const saveMembersBtn = document.getElementById('saveMembersBtn');

    // Handle member selection modal functionality
    if (memberSelectionBtn && memberModalElement && saveMembersBtn) {
        let memberModal;

        // Show member selection modal when button clicked
        memberSelectionBtn.addEventListener('click', function() {
            if (!memberModal) {
                memberModal = new bootstrap.Modal(memberModalElement);
            }
            memberModal.show();
        });

        // Save selected members and update UI
        saveMembersBtn.addEventListener('click', function() {
            const selectedMembers = document.querySelectorAll('#memberModal input[type="checkbox"]:checked');
            const memberList = document.getElementById('selectedMembers');
            if (memberList) {
                // Clear existing member list
                memberList.innerHTML = '';
                // Add each selected member to the UI
                selectedMembers.forEach(function(member) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <img src="${member.nextElementSibling.querySelector('img').src}" alt="${member.nextElementSibling.querySelector('.fw-bold').textContent}" class="rounded-circle" style="width: 30px; height: 30px; margin-right: 5px;">
                        <span>${member.nextElementSibling.querySelector('.fw-bold').textContent}</span>
                    `;
                    memberList.appendChild(li);
                });
            }
            memberModal.hide();
        });
    }

    // Initialize task management components
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModalElement = document.getElementById('taskModal');
    let taskModal;
    let tasks = []; // Array to store all tasks

    // Handle add task button click
    if (addTaskBtn && taskModalElement) {
        addTaskBtn.addEventListener('click', function() {
            if (!taskModal) {
                taskModal = new bootstrap.Modal(taskModalElement);
            }
            document.getElementById('taskForm').reset();
            taskModal.show();
        });
    }

    // Initialize task save functionality
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskList = document.getElementById('taskList');

    // Handle save task button click
    if(saveTaskBtn) {
        saveTaskBtn.addEventListener('click', function() {
            // Get task form values
            const taskName = document.getElementById('taskName').value;
            const taskDescription = document.getElementById('taskDescription').value;
            const taskDueDate = document.getElementById('taskDueDate').value;
            const taskStartDate = document.getElementById('taskStartDate').value;
            const taskAssignees = document.querySelectorAll('.task-assignee:checked');
            // Map selected assignees to objects
            const assignees = Array.from(taskAssignees).map(checkbox => ({
                id: checkbox.value,
                name: checkbox.nextElementSibling.textContent,
                avatarUrl: checkbox.nextElementSibling.querySelector('img').src
            }));

            // Validate task name
            if (!taskName) {
                alert('Vui lòng nhập tên task');
                return;
            }

            // Create task object
            const task = {
                name: taskName,
                description: taskDescription,
                startDate: taskStartDate,
                dueDate: taskDueDate,
                assignees: assignees
            };
        
            // Handle edit or create new task
            const editIndex = saveTaskBtn.getAttribute('data-edit-index');
            if (editIndex !== null) {
                tasks[editIndex] = task;
                saveTaskBtn.removeAttribute('data-edit-index');
            } else {
                tasks.push(task);
            }

            // Update UI and close modal
            renderTaskList();
            taskModal.hide();
        });
    }

    // Render task list in UI
    function renderTaskList() {
        taskList.innerHTML = '';
        // Create HTML for each task
        tasks.forEach((task, index) => {
            const li = document.createElement('div');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="task-name">${task.name}</span>
                    <div class="task-actions">
                        <button class="btn btn-sm btn-outline-primary edit-task" data-index="${index}" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-task" data-index="${index}" title="Xóa">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="task-info">
                    <div class="task-date">
                        <i class="far fa-calendar-alt me-1"></i>
                        <small>${formatDate(task.startDate)}</small>
                        <span class="task-date-separator">-</span>
                        <small>${formatDate(task.dueDate)}</small>
                    </div>
                    <div class="task-assignees mt-2">
                        ${task.assignees.map(assignee => `
                            <img src="${assignee.avatarUrl}" alt="${assignee.name}" title="${assignee.name}" class="task-assignee-avatar">
                        `).join('')}
                    </div>
                </div>
            `;
            taskList.appendChild(li);
        });

        // Add event listeners for task actions
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                editTask(index);
            });
        });

        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteTask(index);
            });
        });
    }

    // Handle task editing
    function editTask(index) {
        const task = tasks[index];
        // Populate form with task data
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskStartDate').value = task.startDate;
        // Reset assignee checkboxes
        document.querySelectorAll('.task-assignee').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check boxes for current assignees
        task.assignees.forEach(assignee => {
            const checkbox = document.querySelector(`.task-assignee[value="${assignee.id}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Set edit mode and show modal
        saveTaskBtn.setAttribute('data-edit-index', index);
        taskModal.show();
    }

    // Handle task deletion
    function deleteTask(index) {
        if (confirm('Bạn có chắc chắn muốn xóa task này?')) {
            tasks.splice(index, 1);
            renderTaskList();
        }
    }

    // Handle form submission
    const form = document.getElementById('projectForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validate form
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Add selected member IDs to form
            const selectedMembers = document.querySelectorAll('#memberModal input[type="checkbox"]:checked');
            selectedMembers.forEach(function(member) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'memberIds';
                input.value = member.value;
                form.appendChild(input);
            });

            // Add task data to form
            tasks.forEach(function(task, index) {
                // Add task name
                const taskNameInput = document.createElement('input');
                taskNameInput.type = 'hidden';
                taskNameInput.name = `tasks[${index}].name`;
                taskNameInput.value = task.name;
                form.appendChild(taskNameInput);

                // Add task description
                const taskDescInput = document.createElement('input');
                taskDescInput.type = 'hidden';
                taskDescInput.name = `tasks[${index}].description`;
                taskDescInput.value = task.description;
                form.appendChild(taskDescInput);

                // Add task start date
                const taskStartDateInput = document.createElement('input');
                taskStartDateInput.type = 'hidden';
                taskStartDateInput.name = `tasks[${index}].startDate`;
                taskStartDateInput.value = task.startDate;
                form.appendChild(taskStartDateInput);

                // Add task due date
                const taskDueDateInput = document.createElement('input');
                taskDueDateInput.type = 'hidden';
                taskDueDateInput.name = `tasks[${index}].dueDate`;
                taskDueDateInput.value = task.dueDate;
                form.appendChild(taskDueDateInput);

                // Add task assignees
                task.assignees.forEach(function(assignee, assigneeIndex) {
                    const assigneeInput = document.createElement('input');
                    assigneeInput.type = 'hidden';
                    assigneeInput.name = `tasks[${index}].assigneeIds[${assigneeIndex}]`;
                    assigneeInput.value = assignee.id;
                    form.appendChild(assigneeInput);
                });
            });

            // Add CSRF token to form
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = header.replace('X-', '');
            csrfInput.value = token;
            form.appendChild(csrfInput);

            // Submit the form
            form.submit();
        });
    }
});
