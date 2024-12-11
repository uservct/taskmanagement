document.addEventListener('DOMContentLoaded', function() {
    // CSRF token
    const token = document.querySelector("meta[name='_csrf']")?.content;
    const header = document.querySelector("meta[name='_csrf_header']")?.content;

    // Handle restore project
    document.querySelectorAll('[restore-button]').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const projectId = button.getAttribute('restore-button');
            try {
                const response = await fetch(`/projects/${projectId}/restore`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    }
                });

                if (response.ok) {
                    // Remove the project card from the trash view
                    document.querySelector(`[div-project="${projectId}"]`).remove();
                    
                    // Show success toast
                    toast.show('success', 'Đã khôi phục dự án thành công');
                    
                    // If no more projects, show empty state
                    if (document.querySelectorAll('[div-project]').length === 0) {
                        location.reload();
                    }
                } else {
                    toast.show('error', 'Không thể khôi phục dự án');
                }
            } catch (error) {
                toast.show('error', 'Đã xảy ra lỗi khi khôi phục dự án');
            }
        });
    });

    // Handle permanent delete
    document.querySelectorAll('[delete-permanent]').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirmDeleteModal('dự án')) {
                return;
            }

            const projectId = button.getAttribute('delete-permanent');
            
            try {
                const response = await fetch(`/projects/${projectId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        [header]: token
                    }
                });

                if (response.ok) {
                    document.querySelector(`[div-project="${projectId}"]`).remove();
                    toast.show('success', 'Đã xóa vĩnh viễn dự án');
                    
                    if (document.querySelectorAll('[div-project]').length === 0) {
                        location.reload();
                    }
                } else {
                    toast.show('error', 'Không thể xóa dự án');
                }
            } catch (error) {
                toast.show('error', 'Đã xảy ra lỗi khi xóa dự án');
            }
        });
    });
});
