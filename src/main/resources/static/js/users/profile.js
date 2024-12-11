document.addEventListener('DOMContentLoaded', function() { 
    const header = document.querySelector("meta[name='_csrf_header']")?.getAttribute("content");
    const token = document.querySelector("meta[name='_csrf']")?.getAttribute("content");
    
    const emailUser = document.getElementById("data-user-email").getAttribute("data-user-email");
    // Modal references
    const otpVerificationModal = new bootstrap.Modal(document.getElementById('otpVerificationModal'));
    const newPasswordModal = new bootstrap.Modal(document.getElementById('newPasswordModal'));

    // Send OTP Button Handler
    const sendOtpButton = document.getElementById('sendOtpButton');
    if (sendOtpButton) {
        sendOtpButton.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email-request').value;
            
            if (!email) {
                toast.show('error', 'Vui lòng nhập email');
                return;
            }

            if(email != emailUser) {
                toast.show('error', 'Vui lòng sử dụng email đã đăng ký');
                return;
            }

            // Disable button and show loading state
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang gửi...';
            
            try {
                const response = await fetch('/api/users/profile/send-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        [header]: token
                    },
                    body: `email=${encodeURIComponent(email)}`
                });

                if (response.ok) {
                    toast.show('success', 'Mã OTP đã được gửi đến email của bạn');
                    startOtpTimer(this);
                } else {
                    const error = await response.json();
                    toast.show('error', error.message || 'Có lỗi xảy ra khi gửi mã OTP');
                    this.disabled = false;
                    this.innerHTML = originalText;
                }
            } catch (error) {
                toast.show('error', 'Có lỗi xảy ra khi gửi mã OTP');
                this.disabled = false;
                this.innerHTML = originalText;
            }
        });
    }

    // OTP Verification Form Handler
    const otpVerificationForm = document.getElementById('otpVerificationForm');
    if (otpVerificationForm) {
        otpVerificationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }

            const formData = new FormData(this);
            const data = {
                email: document.getElementById("email-request").value,
                otp: document.getElementById("otp-request").value
            };
            try {
                const response = await fetch('/api/users/profile/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    otpVerificationModal.hide();
                    newPasswordModal.show();
                    this.reset();
                } else {
                    const error = await response.json();
                    toast.show('error', error.message || 'Mã OTP không hợp lệ');
                }
            } catch (error) {
                toast.show('error', 'Có lỗi xảy ra khi xác thực OTP');
            }
        });
    }

    // New Password Form Handler
    const newPasswordForm = document.getElementById('newPasswordForm');
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }

            const formData = new FormData(this);
            const data = {
                email: emailUser,
                newPassword: formData.get('newPassword'),
                confirmPassword: formData.get('confirmPassword')
            };
            if (data.newPassword !== data.confirmPassword) {
                toast.show('error', 'Mật khẩu mới không khớp');
                return;
            }

            try {
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
                    newPasswordModal.hide();
                    this.reset();
                } else {
                    console.log("Failed");
                    const error = await response.json();
                    toast.show('error', error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
                }
            } catch (error) {
                toast.show('error', 'Có lỗi xảy ra khi đổi mật khẩu');
            }
        });
    }

    // OTP Timer Function
    function startOtpTimer(button) {
        let timeLeft = 60;
        button.disabled = true;
        
        const timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Gửi mã';
            } else {
                button.innerHTML = `<i class="fas fa-clock me-2"></i>Gửi lại sau ${timeLeft}s`;
                timeLeft--;
            }
        }, 1000);
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
                    bootstrap.Modal.getInstance(document.getElementById('avatarModal')).hide();
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
