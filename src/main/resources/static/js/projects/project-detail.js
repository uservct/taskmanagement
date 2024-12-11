document.addEventListener("DOMContentLoaded", function() {
    
    // CSRF token
    const token = document.querySelector("meta[name='_csrf']")?.content;
    const header = document.querySelector("meta[name='_csrf_header']")?.content;

    const projectId = document.querySelector('[data-project-id]').getAttribute('data-project-id');

    // Countdown timer
    function updateCountdown() {
        const dueDate = new Date(document.getElementById('projectDueDate').value).getTime();
        const now = new Date().getTime();
        const distance = dueDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById("days").textContent = days;
        document.getElementById("hours").textContent = hours;
        document.getElementById("minutes").textContent = minutes;
    }

    if (document.getElementById('projectDueDate')) {
        updateCountdown();
        setInterval(updateCountdown, 1000 * 60); // Cập nhật mỗi phút
    }

    // Delete project confirmation
    window.confirmDelete = function(projectId) {
        if (confirm('Bạn có chắc chắn muốn xóa dự án này không?')) {
            window.location.href = '/projects/' + projectId + '/delete';
        }
    }


    // Add task to project
    document.getElementById('saveTaskBtn').addEventListener('click', function() {
        const taskForm = document.getElementById('addTaskForm');
        const assigneeIds = Array.from(taskForm.querySelectorAll('input[name="assigneeIds"]:checked'))
            .map(input => input.value);
        
        // Format date to YYYY-MM-DD
        const dueDateInput = taskForm.elements.dueDate.value;
        const formattedDate = dueDateInput ? dueDateInput : null;
        
        const taskData = {
            name: taskForm.elements.name.value,
            description: taskForm.elements.description.value,
            startDate: taskForm.elements.startDate.value,
            dueDate: formattedDate,  // This will be in YYYY-MM-DD format
            assigneeIds: assigneeIds
        }
        
        // Call API to add task
        fetch(`/api/projects/${projectId}/add-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [header]: token
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            // Reload page or update UI
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi tạo task');
        });
    });

    // Edit task
    const editTaskBtns = document.querySelectorAll('.task-btn-edit');
    editTaskBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = btn.getAttribute('data-task-id');
            const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
            const editForm = document.getElementById('editTaskForm');

            fetch(`/api/tasks/${taskId}`, {
                headers: {
                    [header]: token
                }
            })
                .then(response => response.json())
                .then(data => {
                    editForm.elements.name.value = data.name;
                    editForm.elements.description.value = data.description;
                    editForm.elements.startDate.value = data.startDate;
                    editForm.elements.dueDate.value = data.dueDate;
                    editForm.elements.status.value = data.status;

                    data.assignees.forEach(assignee => {
                        const checkbox = editForm.querySelector(`input[name="assigneeIds"][value="${assignee.id}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                    modal.show();
                });
            const updateTaskBtn = document.querySelector('#updateTaskBtn');
            updateTaskBtn.addEventListener('click', function() {
                const assigneeIds = Array.from(editForm.querySelectorAll('input[name="assigneeIds"]:checked'))
                    .map(input => input.value);
                const taskData = {
                    name: editForm.elements.name.value,
                    description: editForm.elements.description.value,
                    startDate: editForm.elements.startDate.value,
                    dueDate: editForm.elements.dueDate.value,
                    status: editForm.elements.status.value,
                    assigneeIds: assigneeIds
                }

                fetch(`/api/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    },
                    body: JSON.stringify(taskData)
                })
                .then(response => response.json())
                .then(data => {
                    window.location.reload();
                });
            });
        });
    });

    // Delete project
    const deleteProjectBtn = document.querySelector('[delete-project-button]');
    if (deleteProjectBtn) {
        deleteProjectBtn.addEventListener('click', async function() {
            const confirmed = await confirmDeleteModal('dự án');
            if (confirmed) {
                try {
                    const response = await fetch(`/projects/${projectId}/delete`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            [header]: token
                        }
                    });
                    window.location.href = '/projects';
                    toast.show('success', 'Dự án đã được chuyển đến thùng rác');
                } catch (error) {
                    console.error('Error:', error);
                    toast.show('error', 'Có lỗi xảy ra khi xóa dự án');
                }
            }
        });
    }

    // Delete task
    const deleteTaskBtns = document.querySelectorAll('.task-btn-delete');
    deleteTaskBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const taskId = btn.getAttribute('data-task-id');
            const confirmed = await confirmDeleteModal('công việc');
            
            if (confirmed) {
                try {
                    const response = await fetch(`/api/tasks/${taskId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            [header]: token
                        }
                    });
                    const divTask = document.querySelector(`[divTask="${taskId}"]`);
                    divTask.remove();
                    toast.show('success', 'Công việc đã được xóa thành công');
                } catch (error) {
                    console.error('Error:', error);
                    toast.show('error', 'Có lỗi xảy ra khi xóa công việc');
                }
            }
        });
    });

    // Delete announcement
    const deleteAnnouncementBtns = document.querySelectorAll('.announcement-btn-delete');
    deleteAnnouncementBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const announcementId = btn.getAttribute('data-announcement-id');
            console.log(announcementId);
            const confirmed = await confirmDeleteModal('thông báo');
            if(confirmed) {
                try {
                    const response = await fetch(`/api/announcements/${announcementId}`, {
                        method: 'DELETE',
                        headers: {
                            [header]: token
                        }
                    });
                    const announcementDiv = document.querySelector(`[divAnnouncement="${announcementId}"]`);
                    announcementDiv.remove();
                    toast.show('success', 'Thông báo đã được xóa thành công');
                } catch (error) {
                    console.error('Error:', error);
                    toast.show('error', 'Có lỗi xảy ra khi xóa thông báo');
                }
            }
        });
    });



     // Show attachments
   
     const projectDocumentsModal = document.getElementById('projectDocumentsModal');
     
    let currentContext = {
        type: null,
        id: null
    }

    // Set current context when click on  task button
    const documentProjectBtn = document.querySelector('[document-project-button]');
    const discussionProjectBtn = document.querySelector('[discussion-project-button]');
    const attachmentTaskBtns = document.querySelectorAll('.task-btn-attachment');
    const discussionTaskBtns = document.querySelectorAll('.task-btn-discussion');

    documentProjectBtn.addEventListener('click', async () => {
        currentContext = {
            type: 'project',
            id: projectId
        };
        console.log(currentContext);
    });

    discussionProjectBtn.addEventListener('click', async () => {
        currentContext = {
            type: 'project',
            id: projectId
        };
        console.log(currentContext);
    });

    attachmentTaskBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            currentContext = {
                type: 'task',
                id: btn.getAttribute('data-task-id')
            };
        });
    });

    discussionTaskBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            currentContext = {
                type: 'task',
                id: btn.getAttribute('data-task-id')
            };
            console.log(currentContext);
        });
    });

   
    // Show attachments for project
    documentProjectBtn.addEventListener('click', async () => {
        const modal = new bootstrap.Modal(projectDocumentsModal);
        modal.show();
        
        // Xử lý khi modal được đóng
        projectDocumentsModal.addEventListener('hidden.bs.modal', function () {
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        });

        const response = await fetch(`/api/attachments/project/${projectId}`, {
            headers: {
                [header]: token
            }
        });

        const attachments = await response.json();
        const documentsList = document.querySelector('.documents-list');
        
        // Clear existing list
        documentsList.innerHTML = '';
        
        // Add attachments to list
        attachments.forEach(attachment => {
            const fileSize = (attachment.fileSize / 1024).toFixed(2); // Convert to KB
            const uploadDate = new Date(attachment.uploadedAt).toLocaleString();
            
            const docHtml = `
                <div class="document-item p-3 border-bottom" data-attachment-id="${attachment.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-file fa-lg text-info me-3"></i>
                            <div>
                                <h6 class="mb-0">${attachment.originalFileName}</h6>
                                <small class="text-muted">
                                    ${fileSize} KB • Uploaded by ${attachment.uploadedBy.name} • ${uploadDate}
                                </small>
                            </div>
                        </div>
                        <div class="btn-group">
                            <a href="${attachment.filePath}" 
                               class="btn btn-sm btn-outline-primary" 
                               target="_blank"
                               download="${attachment.originalFileName}">
                                <i class="fas fa-download"></i>
                            </a>
                            <button class="btn btn-sm btn-outline-danger delete-attachment" 
                                    data-attachment-id="${attachment.id}"
                                    sec:authorize="hasRole('ADMIN')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            documentsList.insertAdjacentHTML('beforeend', docHtml);
        });

        // Delete attachment
        const deleteAttachmentBtns = document.querySelectorAll('.delete-attachment');
        deleteAttachmentBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const attachmentId = btn.getAttribute('data-attachment-id');
                const confirmed = await confirmDeleteModal('tập tin');
                if (confirmed) {
                    try {
                        const response = await fetch(`/api/attachments/${attachmentId}`, {
                            method: 'DELETE',
                            headers: {
                                [header]: token
                            }
                        });
                        const attachmentDiv = document.querySelector(`[data-attachment-id="${attachmentId}"]`);
                        attachmentDiv.remove();
                        toast.show('success', 'Tập tin đã được xóa thành công');
                    } catch (error) {
                        console.error('Error:', error);
                        toast.show('error', 'Có lỗi xảy ra khi xóa tập tin');
                    }
                }
            });
        });
    });

    // Show attachments for task
    attachmentTaskBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const modal = new bootstrap.Modal(projectDocumentsModal);
        modal.show();
        
        // Xử lý khi modal được đóng
        projectDocumentsModal.addEventListener('hidden.bs.modal', function () {
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        });

        const response = await fetch(`/api/attachments/task/${currentContext.id}`, {
            headers: {
                [header]: token
            }
        });

        const attachments = await response.json();
        
        // Clear existing list
        documentsList.innerHTML = '';
        
        // Add attachments to list
        attachments.forEach(attachment => {
            const fileSize = (attachment.fileSize / 1024).toFixed(2); // Convert to KB
            const uploadDate = new Date(attachment.uploadedAt).toLocaleString();
            
            const docHtml = `
                <div class="document-item p-3 border-bottom" data-attachment-id="${attachment.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-file fa-lg text-info me-3"></i>
                            <div>
                                <h6 class="mb-0">${attachment.originalFileName}</h6>
                                <small class="text-muted">
                                    ${fileSize} KB • Uploaded by ${attachment.uploadedBy.name} • ${uploadDate}
                                </small>
                            </div>
                        </div>
                        <div class="btn-group">
                            <a href="${attachment.filePath}" 
                               class="btn btn-sm btn-outline-primary" 
                               target="_blank"
                               download="${attachment.originalFileName}">
                                <i class="fas fa-download"></i>
                            </a>
                            <button class="btn btn-sm btn-outline-danger delete-attachment" 
                                    data-attachment-id="${attachment.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            documentsList.insertAdjacentHTML('beforeend', docHtml);
        });
        });
    });

    // Upload file 
    const uploadForm = document.getElementById('uploadForm');
    const documentsList = document.querySelector('.documents-list');

    // Load attachments khi mở modal
    documentProjectBtn.addEventListener('click', async () => {
        const modal = new bootstrap.Modal(projectDocumentsModal);
        const projectId = document.querySelector('[data-project-id]').getAttribute('data-project-id');
        
        try {
            const response = await fetch(`/api/attachments/project/${projectId}`, {
                headers: {
                    [header]: token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attachments');
            }

            const attachments = await response.json();
            
            // Clear existing list
            documentsList.innerHTML = '';
            
            // Add attachments to list
            attachments.forEach(attachment => {
                const fileSize = (attachment.fileSize / 1024).toFixed(2); // Convert to KB
                const uploadDate = new Date(attachment.uploadedAt).toLocaleString('vi-VN');
                
                const docHtml = `
                    <div class="document-item p-3 border-bottom" data-attachment-id="${attachment.id}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-file fa-lg text-info me-3"></i>
                                <div>
                                    <h6 class="mb-0">${attachment.originalFileName}</h6>
                                    <small class="text-muted">
                                        ${fileSize} KB • Uploaded by ${attachment.uploadedBy.name} • ${uploadDate}
                                    </small>
                                </div>
                            </div>
                            <div class="btn-group">
                                <a href="${attachment.filePath}" 
                                   class="btn btn-sm btn-outline-primary" 
                                   target="_blank"
                                   download="${attachment.originalFileName}">
                                    <i class="fas fa-download"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-danger delete-attachment" 
                                        data-attachment-id="${attachment.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                documentsList.insertAdjacentHTML('beforeend', docHtml);
            });

            modal.show();
            // Close modal when click outside
            projectDocumentsModal.addEventListener('hidden.bs.modal', function () {
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
            });
            
        } catch (error) {
            console.error('Error:', error);
            toast.show('error', 'Có lỗi xảy ra khi tải danh sách tài liệu');
        }
    });



    // Upload file
    if(uploadForm){
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('fileUpload');
            const file = fileInput.files[0];
            
            if (!file) {
                toast.show('error', 'Vui lòng chọn tập tin');
                return;
            }
            
            const formData = new FormData();
            formData.append('file', file);
            
            formData.append(currentContext.type === 'project' ? 'projectId' : 'taskId', currentContext.id);
            
            try {
                const response = await fetch('/api/attachments/upload', {
                    method: 'POST',
                    headers: {
                        [header]: token
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }
                
                const attachment = await response.json();
                
                // Add new file to the list
                const docHtml = `
                    <div class="document-item p-3 border-bottom" data-attachment-id="${attachment.id}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-file fa-lg text-info me-3"></i>
                                <div>
                                    <h6 class="mb-0">${attachment.originalFileName}</h6>
                                    <small class="text-muted">
                                        ${(attachment.fileSize / 1024).toFixed(2)} KB • 
                                        Uploaded by ${attachment.uploadedBy.name} • 
                                        ${new Date(attachment.uploadedAt).toLocaleString('vi-VN')}
                                    </small>
                                </div>
                            </div>
                            <div class="btn-group">
                                <a href="${attachment.filePath}" 
                                class="btn btn-sm btn-outline-primary" 
                                target="_blank"
                                download="${attachment.originalFileName}">
                                    <i class="fas fa-download"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-danger delete-attachment" 
                                        data-attachment-id="${attachment.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                documentsList.insertAdjacentHTML('afterbegin', docHtml);
                
                // Reset form
                fileInput.value = '';
                toast.show('success', 'Tải lên tập tin thành công');
                
            } catch (error) {
                console.error('Error:', error);
                toast.show('error', 'Có lỗi xảy ra khi tải lên tập tin');
            }
        });
    }
    // Delete attachment
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('delete-attachment')) {
            const attachmentId = e.target.dataset.attachmentId;
            const confirmed = await confirmDeleteModal('tài liệu');
            
            if (confirmed) {
                try {
                    const response = await fetch(`/api/attachments/${attachmentId}`, {
                        method: 'DELETE',
                        headers: {
                            [header]: token
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Delete failed');
                    }

                    // Remove attachment from UI
                    const attachmentElement = document.querySelector(`[data-attachment-id="${attachmentId}"]`);
                    attachmentElement.remove();
                    toast.show('success', 'Đã xóa tài liệu');

                } catch (error) {
                    console.error('Error:', error);
                    toast.show('error', 'Có lỗi xảy ra khi xóa tài liệu');
                }
            }
        }
    });

   

    // Comments handling
    const commentForm = document.querySelector('#projectDiscussionsModal form');
    const commentsList = document.querySelector('.comments-list');

    // show project when click discussion button
    discussionProjectBtn.addEventListener('click', async function() {
        const modal = new bootstrap.Modal(projectDiscussionsModal);
        const projectId = document.querySelector('[data-project-id]').getAttribute('data-project-id');
        
        try {
            // Fetch comments from API
            const response = await fetch(`/api/comments/project/${projectId}`, {
                headers: {
                    [header]: token
                }
            });

            if (!response.ok) {
                throw new Error('Có lỗi xảy ra khi tải bình luận');
            }

            const comments = await response.json();
            const commentsList = document.querySelector('.comments-list');
            
            // Clear existing comments
            commentsList.innerHTML = '';
            
            // Add comments to list
            comments.forEach(comment => {
                const commentHtml = `
                    <div class="comment-item mb-3" data-comment-id="${comment.id}">
                        <div class="d-flex">
                            <img src="${comment.createdBy?.avatarUrl || '/images/default-avatar.png'}" 
                                 class="rounded-circle me-2" 
                                 style="width: 40px; height: 40px;">
                            <div class="flex-grow-1">
                                <div class="bg-light p-3 rounded">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <h6 class="mb-0">${comment.createdBy?.name || 'Unknown User'}</h6>
                                        <div class="d-flex align-items-center">
                                            <small class="text-muted me-2">
                                                ${comment.updatedAt ? 
                                                  `Đã chỉnh sửa: ${new Date(comment.updatedAt).toLocaleString('vi-VN')}` :
                                                  new Date(comment.createdAt).toLocaleString('vi-VN')}
                                            </small>
                                            <div class="dropdown">
                                                <button class="btn btn-link btn-sm p-0" data-bs-toggle="dropdown">
                                                    <i class="fas fa-ellipsis-v"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end">
                                                    <li>
                                                        <button class="dropdown-item edit-comment" 
                                                                data-comment-id="${comment.id}">
                                                            <i class="fas fa-edit me-1"></i>Sửa
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button class="dropdown-item delete-comment text-danger" 
                                                                data-comment-id="${comment.id}">
                                                            <i class="fas fa-trash-alt me-1"></i>Xóa
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="mb-0">${comment.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                commentsList.insertAdjacentHTML('beforeend', commentHtml);
            });

            // Scroll xuống cuối để xem tin nhắn cũ nhất
            commentsList.scrollTop = commentsList.scrollHeight;
            projectDiscussionsModal.addEventListener('hidden.bs.modal', function () {
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
            });
            modal.show();
            
        } catch (error) {
            console.error('Error:', error);
            toast.show('error', 'Có lỗi xảy ra khi tải bình luận');
        }
    });

    // Show task discussion
    discussionTaskBtns.forEach(btn => {
        btn.addEventListener('click', (async () => {
            const taskId = btn.getAttribute('data-task-id');
            const modal = new bootstrap.Modal(projectDiscussionsModal);
            // Fetch comments from API
            try {
                // Fetch comments from API
                const response = await fetch(`/api/comments/task/${currentContext.id}`, {
                    headers: {
                        [header]: token
                    }
                });
    
                if (!response.ok) {
                    throw new Error('Có lỗi xảy ra khi tải bình luận');
                }
    
                const comments = await response.json();
                const commentsList = document.querySelector('.comments-list');
                
                // Clear existing comments
                commentsList.innerHTML = '';
                
                // Add comments to list
                comments.forEach(comment => {
                    const commentHtml = `
                        <div class="comment-item mb-3" data-comment-id="${comment.id}">
                            <div class="d-flex">
                                <img src="${comment.createdBy?.avatarUrl || '/images/default-avatar.png'}" 
                                     class="rounded-circle me-2" 
                                     style="width: 40px; height: 40px;">
                                <div class="flex-grow-1">
                                    <div class="bg-light p-3 rounded">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="mb-0">${comment.createdBy?.name || 'Unknown User'}</h6>
                                            <div class="d-flex align-items-center">
                                                <small class="text-muted me-2">
                                                    ${comment.updatedAt ? 
                                                      `Đã chỉnh sửa: ${new Date(comment.updatedAt).toLocaleString('vi-VN')}` :
                                                      new Date(comment.createdAt).toLocaleString('vi-VN')}
                                                </small>
                                                <div class="dropdown">
                                                    <button class="btn btn-link btn-sm p-0" data-bs-toggle="dropdown">
                                                        <i class="fas fa-ellipsis-v"></i>
                                                    </button>
                                                    <ul class="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button class="dropdown-item edit-comment" 
                                                                    data-comment-id="${comment.id}">
                                                                <i class="fas fa-edit me-1"></i>Sửa
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button class="dropdown-item delete-comment text-danger" 
                                                                    data-comment-id="${comment.id}">
                                                                <i class="fas fa-trash-alt me-1"></i>Xóa
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <p class="mb-0">${comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    commentsList.insertAdjacentHTML('beforeend', commentHtml);
                });
    
                // Scroll xuống cuối để xem tin nhắn cũ nhất
                commentsList.scrollTop = commentsList.scrollHeight;
                projectDiscussionsModal.addEventListener('hidden.bs.modal', function () {
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                });
                modal.show();
                
            } catch (error) {
                console.error('Error:', error);
                toast.show('error', 'Có lỗi xảy ra khi tải bình luận');
            }

            modal.show();
        }));
    });


    // Submit new comment
    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const commentContent = this.querySelector('textarea').value;
        if (!commentContent.trim()) {
            toast.show('error', 'Vui lòng nhập nội dung bình luận');
            return;
        }

        const commentData = {
        };

        commentData[currentContext.type === 'project' ? 'projectId' : 'taskId'] = currentContext.id;
        commentData.content = commentContent;

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [header]: token
                },
                body: JSON.stringify(commentData)
            });

            if (!response.ok) {
                throw new Error('Có lỗi xảy ra');
            }

            
            const comment = await response.json();
            
            // Add new comment to the list
            const commentHtml = `
                <div class="comment-item mb-3" data-comment-id="${comment.id}">
                    <div class="d-flex">
                        <img src="${comment.createdBy?.avatarUrl || '/images/default-avatar.png'}" 
                             class="rounded-circle me-2" 
                             style="width: 40px; height: 40px;">
                        <div class="flex-grow-1">
                            <div class="bg-light p-3 rounded">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h6 class="mb-0">${comment.createdBy?.name || 'Unknown User'}</h6>
                                    <div class="d-flex align-items-center">
                                        <small class="text-muted me-2">
                                            ${comment.createdAt ? new Date(comment.createdAt).toLocaleString('vi-VN') : 'Unknown time'}
                                        </small>
                                        <div class="dropdown">
                                            <button class="btn btn-link btn-sm p-0" data-bs-toggle="dropdown">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul class="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <button class="dropdown-item edit-comment" 
                                                            data-comment-id="${comment.id}">
                                                        <i class="fas fa-edit me-1"></i>Sửa
                                                    </button>
                                                </li>
                                                <li>
                                                    <button class="dropdown-item delete-comment text-danger" 
                                                            data-comment-id="${comment.id}">
                                                        <i class="fas fa-trash-alt me-1"></i>Xóa
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <p class="mb-0">${comment.content}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            commentsList.insertAdjacentHTML('afterbegin', commentHtml);
            this.reset();
            // Scroll to top sau khi thêm comment mới
            commentsList.scrollTop = 0;
            toast.show('success', 'Đã thêm bình luận');
            

        } catch (error) {
            console.error('Error:', error);
            toast.show('error', 'Có lỗi xảy ra khi thêm bình luận');
        }
    });

    // Edit comment
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('edit-comment')) {
            const commentId = e.target.dataset.commentId;
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            const contentElement = commentElement.querySelector('p');
            const originalContent = contentElement.textContent;

            // Create edit form
            const editForm = document.createElement('div');
            editForm.innerHTML = `
                <div class="edit-comment-form mt-2">
                    <textarea class="form-control mb-2">${originalContent}</textarea>
                    <div class="text-end">
                        <button class="btn btn-secondary btn-sm cancel-edit me-2">Hủy</button>
                        <button class="btn btn-primary btn-sm save-edit">Lưu</button>
                    </div>
                </div>
            `;

            contentElement.style.display = 'none';
            contentElement.after(editForm);

            // Handle cancel edit
            editForm.querySelector('.cancel-edit').addEventListener('click', function() {
                contentElement.style.display = 'block';
                editForm.remove();
            });

            // Handle save edit
            editForm.querySelector('.save-edit').addEventListener('click', async function() {
                const newContent = editForm.querySelector('textarea').value;
                if (!newContent.trim()) {
                    toast.show('error', 'Nội dung không được để trống');
                    return;
                }

                try {
                    const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            [header]: token
                        },
                        body: JSON.stringify({
                            content: newContent,
                            projectId: projectId
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Có lỗi xảy ra');
                    }

                    const updatedComment = await response.json();
                    
                    // Cập nhật nội dung và thời gian
                    const commentDiv = document.querySelector(`[data-comment-id="${commentId}"]`);
                    const contentElement = commentDiv.querySelector('p');
                    const timeElement = commentDiv.querySelector('.text-muted');
                    
                    contentElement.textContent = updatedComment.content;
                    // Format thời gian một cách an toàn
                    if (updatedComment.updatedAt) {
                        timeElement.textContent = `Đã chỉnh sửa: ${new Date(updatedComment.updatedAt).toLocaleString('vi-VN')}`;
                    }
                    
                    contentElement.style.display = 'block';
                    editForm.remove();
                    toast.show('success', 'Đã cập nhật bình luận');

                } catch (error) {
                    console.error('Error:', error);
                    toast.show('error', 'Có lỗi xảy ra khi cập nhật bình luận');
                }
            });
        }
    });

    // Delete comment
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('delete-comment')) {
            const commentId = e.target.dataset.commentId;
            const confirmed = await confirmDeleteModal('bình luận');
            
            if (confirmed) {
                try {
                    const response = await fetch(`/api/comments/${commentId}`, {
                        method: 'DELETE',
                        headers: {
                            [header]: token
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Có lỗi xảy ra');
                    }

                    // Remove comment from UI
                    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                    commentElement.remove();
                    
                    toast.show('success', 'Đã xóa bình luận');

                } catch (error) {
                    console.error('Error:', error);
                    toast.show('error', 'Có lỗi xảy ra khi xóa bình luận');
                }
            }
        }
    });

    // Search and filter functionality
    const searchInput = document.getElementById('taskSearch');
    const statusFilter = document.getElementById('statusFilter');
    const tagFilter = document.getElementById('tagFilter');

    // Add event listeners
    searchInput?.addEventListener('input', filterTasks);
    statusFilter?.addEventListener('change', filterTasks);
    tagFilter?.addEventListener('change', filterTasks);

    function filterTasks() {
        const searchTerm = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const statusValue = statusFilter.value;
        const tagValue = tagFilter.value;
        
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
            
            // Get status from the status badge
            const statusBadge = task.querySelector('.status-badge');
            let status = '';
            if (statusBadge.classList.contains('status-todo')) status = 'TODO';
            else if (statusBadge.classList.contains('status-progress')) status = 'IN_PROGRESS';
            else if (statusBadge.classList.contains('status-review')) status = 'REVIEW';
            else if (statusBadge.classList.contains('status-done')) status = 'DONE';
            
            // Get tag from the task tag span
            const tagElement = task.querySelector('.task-tag');
            const tag = tagElement ? tagElement.textContent.toUpperCase() : '';

            // Check if task matches all filters
            const matchesSearch = taskName.includes(searchTerm) || 
                                (taskDescription && taskDescription.includes(searchTerm));
            const matchesStatus = !statusValue || status === statusValue;
            const matchesTag = !tagValue || tag === tagValue;
            
            // Show/hide task based on filter results
            task.style.display = matchesSearch && matchesStatus && matchesTag ? 'block' : 'none';
        });
    }
});
