document.addEventListener('DOMContentLoaded', function() { 
    const header = document.querySelector("meta[name='_csrf_header']")?.getAttribute("content");
    const token = document.querySelector("meta[name='_csrf']")?.getAttribute("content");
    
    const emailUser = document.getElementById("data-user-email").getAttribute("data-user-email");

    // Modal references
    const newPasswordModalElement = document.getElementById('newPasswordModal');
    const changePasswordModal = newPasswordModalElement ? new bootstrap.Modal(newPasswordModalElement) : null;
    
    // New Password Form Handler (Thay đổi mật khẩu)
    const newPasswordForm = document.getElementById('changePasswordForm');
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
             
            // Kiểm tra tính hợp lệ của form
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }

            // Lấy dữ liệu từ form
            const formData = new FormData(this);
            const data = {
                email: emailUser,
                currentPassword: formData.get('currentPassword'),
                newPassword: formData.get('newPassword'),
                confirmPassword: formData.get('confirmPassword')
            };

            // Kiểm tra nếu mật khẩu mới và mật khẩu xác nhận không khớp
            if (data.newPassword !== data.confirmPassword) {
                toast.show('error', 'Mật khẩu mới không khớp');
                return;
            }

            try {
                // Gửi yêu cầu POST lên server để thay đổi mật khẩu
                const response = await fetch('/api/users/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    toast.show('success', 'Đổi mật khẩu thành công');
                    if (changePasswordModal) {
                        changePasswordModal.hide();
                    }
                    this.reset();
                } else {
                    // Xử lý lỗi nếu không thành công
                    const error = await response.json();
                    toast.show('error', error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
                }
            } catch (error) {
                toast.show('error', 'Có lỗi xảy ra khi đổi mật khẩu');
            }
        });
    }

    // Avatar Form Handler
    const avatarForm = document.getElementById('avatarForm');
    if (avatarForm) {
        avatarForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }

            const formData = new FormData(this);
            const userId = document.getElementById('data-user-id').getAttribute('data-user-id');
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang tải lên...';
            
            try {
                const response = await fetch(`/api/users/${userId}/avatar`, {
                    method: 'POST',
                    headers: {
                        [header]: token
                    },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    // Update avatar in UI
                    document.querySelector('img[alt="Avatar"]').src = data.avatarUrl;
                    toast.show('success', 'Cập nhật ảnh đại diện thành công');
                    const avatarModal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
                    if (avatarModal) avatarModal.hide();
                    this.reset();
                } else {
                    const error = await response.json();
                    toast.show('error', error.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
                }
            } catch (error) {
                toast.show('error', 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }
});
