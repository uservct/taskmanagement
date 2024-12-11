document.addEventListener('DOMContentLoaded', function() {
    const toast = document.getElementById('toast');
    if (toast) {
        const bsToast = new bootstrap.Toast(toast, {
            animation: true,
            autohide: true,
            delay: 5000  // Show error messages longer
        });
        bsToast.show();
    }

    // Hàm dùng chung cho tìm kiếm user
    const userSearch = document.getElementById('userSearch');
    const userItems = document.querySelectorAll('.user-item');
    if(userSearch && userItems){
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            userItems.forEach(item => {
                const userName = item.querySelector('.fw-bold').textContent.toLowerCase();
                const userEmail = item.querySelector('.text-muted').textContent.toLowerCase();
                if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Hàm format date dùng chung
    window.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
        });
    }
});

function confirmDeleteModal(itemName) {
    return new Promise((resolve) => {
        // Create modal container div
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('modal', 'fade', 'modal-delete-confirm');
        modalContainer.setAttribute('tabindex', '-1');
        modalContainer.setAttribute('role', 'dialog');
        modalContainer.setAttribute('aria-hidden', 'true');

        // Create modal dialog div
        const modalDialog = document.createElement('div'); 
        modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');

        // Create modal content div
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content', 'modal-delete-content');

        modalContent.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">Xác nhận xóa</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Bạn có chắc chắn muốn xóa <span class="fw-bold">${itemName}</span> không?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="button" class="btn btn-danger">Xóa</button>
            </div>
        `;

        // Assemble modal structure
        modalDialog.appendChild(modalContent);
        modalContainer.appendChild(modalDialog);
        document.body.appendChild(modalContainer);

        // Initialize and show modal
        const modalConfirmDelete = new bootstrap.Modal(modalContainer);
        modalConfirmDelete.show();

        // Clean up modal when hidden
        modalContainer.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalContainer);
            resolve(false); // Resolve with false when modal is dismissed
        });

        // Handle delete button click
        const deleteButton = modalContent.querySelector('.btn-danger');
        deleteButton.addEventListener('click', function() {
            modalConfirmDelete.hide();
            resolve(true); // Resolve with true when delete is confirmed
        });

        // Handle cancel button click
        const cancelButton = modalContent.querySelector('.btn-secondary');
        cancelButton.addEventListener('click', function() {
            modalConfirmDelete.hide();
            resolve(false); // Resolve with false when cancelled
        });
    });
}