document.addEventListener('DOMContentLoaded', function() {

    // CSRF token
    const token = document.querySelector("meta[name='_csrf']")?.content;
    const header = document.querySelector("meta[name='_csrf_header']")?.content;

    
    // Form and modal elements
    const form = document.getElementById('createUserForm');
    const modal = document.getElementById('createUserModal');
    const modalInstance = new bootstrap.Modal(modal);
    

    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Form validation and submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!e.target.checkValidity()) {
            e.stopPropagation();
            e.target.classList.add('was-validated');
            return;
        }

        try {
            const formData = new FormData(e.target);
            
            const response = await fetch('/users/create', {
                method: 'POST',
                body: formData,
                headers: {
                    [header]: token
                }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Có lỗi xảy ra khi tạo tài khoản');
            }

            // Show success message
            toast.show('success', 'Tạo tài khoản thành công!');
            
            // Close modal and reset form
            modalInstance.hide();
            e.target.classList.remove('was-validated');
            window.location.reload();

        } catch (error) {
            toast.show('error', error.message);
        }
    });

    // Reset form when modal is closed
    modal.addEventListener('hidden.bs.modal', function() {
        form.reset();
        form.classList.remove('was-validated');
    });


    // Edit user functionality
    document.querySelectorAll('[btn-edit-user]').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();

            const userId = e.target.getAttribute('btn-edit-user');
            const formEdit = document.getElementById('editUserForm');
            const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
            
            try {
                const response = await fetch(`/api/users/${userId}`);
                const user = await response.json();
                
                // Set form values
                formEdit.querySelector('#username-edit').value = user.username;
                formEdit.querySelector('#email-edit').value = user.email;
                formEdit.querySelector('#fullName-edit').value = user.fullName;
                formEdit.querySelector('#phoneNumber-edit').value = user.phoneNumber;
                formEdit.querySelector('#position-edit').value = user.position;
                formEdit.querySelector('#role-edit').value = user.role;
                formEdit.querySelector('#status-edit').value = user.status;
                editModal.show();
                
                // Update user
                formEdit.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    try {
                        // Convert FormData to JSON object
                        const formData = new FormData(e.target);
                        const jsonData = Object.fromEntries(formData.entries());
                        
                        const response = await fetch(`/api/users/${userId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                [header]: token
                            },
                            body: JSON.stringify(jsonData)
                        });

                        if(response.ok) {
                            toast.show('success', 'Cập nhật tài khoản thành công');
                            editModal.hide();
                            window.location.reload(); // Reload to see changes
                        } else {
                            const error = await response.json();
                            toast.show('error', error.message || 'Có lỗi xảy ra khi cập nhật');
                        }
                    } catch (error) {
                        toast.show('error', 'Có lỗi xảy ra khi cập nhật');
                        console.error(error);
                    }
                });
            } catch (error) {
                toast.show('error', 'Có lỗi xảy ra khi tải thông tin người dùng');
                console.error(error);
            }
        });
    });

    // Search functionality
    const searchInput = document.getElementById('userSearch');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    searchInput.addEventListener('input', filterUsers);
    roleFilter.addEventListener('change', filterUsers);
    statusFilter.addEventListener('change', filterUsers);

    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const roleValue = roleFilter.value;
        const statusValue = statusFilter.value;
        
        const userCards = document.querySelectorAll('.user-card');
        userCards.forEach(card => {
            const fullName = card.querySelector('.card-title').textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const email = card.querySelector('.text-muted').textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const roleElement = card.querySelector('.badge.role-badge');
            const statusElement = card.querySelector('.badge.status-badge');

            // Get the actual role value from the data attribute or text content
            let role = roleElement.textContent;
            if (role === 'Quản trị viên') role = 'ADMIN';
            if (role === 'Thành viên') role = 'MEMBER';
            
            // Get the actual status value from the data attribute or text content
            let status = statusElement.textContent;
            if (status === 'Đang hoạt động') status = 'ACTIVE';
            if (status === 'Đã khóa') status = 'INACTIVE';
            
            // Use regex for search
            const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
            const matchesSearch = regex.test(fullName) || regex.test(email);
            const matchesRole = !roleValue || role === roleValue;
            const matchesStatus = !statusValue || status === statusValue;
            
            card.closest('.col').style.display = 
                matchesSearch && matchesRole && matchesStatus ? 'block' : 'none';
        });
    }

    // Delete user functionality
    document.querySelectorAll('[delete-user]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const userId = this.getAttribute('delete-user');
            
            if (await confirmDeleteModal('tài khoản này')) {
                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            [header]: token
                        }
                    });
                    if (!response.ok) { 
                        const error = await response.json();
                        throw new Error(error.message || 'Có lỗi xảy ra khi xóa tài khoản');
                    }

                    toast.show('success', 'Xóa tài khoản thành công!');
                    
                    // Remove the user card from DOM
                    const userCard = document.querySelector(`[div-user="${userId}"]`);
                    if (userCard) {
                        userCard.remove();
                    }

                } catch (error) {
                    toast.show('error', error.message);
                }
            }
        });
    });

    // Reset password functionality
    document.querySelectorAll('[btn-reset-password]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const userId = this.getAttribute('btn-reset-password');
            try {
                const response = await fetch(`/api/users/${userId}/reset-password`, {
                    method: 'PATCH',
                    headers: {
                        [header]: token
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
                }

                // Get the new password as text, not JSON
                const newPassword = await response.text();
                toast.show('success', 'Đặt lại mật khẩu thành công!');
                const infoModal = document.getElementById('infoModal');
                infoModal.querySelector('.modal-title').textContent = 'Cập nhật mật khẩu';
                infoModal.querySelector('.modal-body').textContent = `Mật khẩu mới: ${newPassword}`;
                const modalShowPassword = new bootstrap.Modal(infoModal);
                modalShowPassword.show();
            } catch (error) {
                console.error(error.message);
                toast.show('error', error.message);
            }
        });
    });
});