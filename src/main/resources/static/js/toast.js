class Toast {
    constructor() {
        this.initializeContainer();
    }

    initializeContainer() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
    }

    show(type = 'success', message = '') {
        const toast = this.createToastElement(type, message);
        const container = document.querySelector('.toast-container');
        container.appendChild(toast);

        // Force reflow
        void toast.offsetHeight;

        // Show toast
        toast.classList.add('show');

        // Remove toast after animation
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    }

    createToastElement(type, message) {
        const toast = document.createElement('div');
        toast.className = 'toast border-0 fade';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        const icon = type === 'error' 
            ? 'bi bi-x-circle-fill me-2' 
            : 'bi bi-check-circle-fill me-2';

        const headerClass = type === 'error' 
            ? 'toast-header border-0 text-white bg-danger' 
            : 'toast-header border-0 text-white bg-success';

        const bodyClass = type === 'error'
            ? 'toast-body bg-danger bg-opacity-10'
            : 'toast-body bg-success bg-opacity-10';

        const title = type === 'error' ? 'Error' : 'Success';

        toast.innerHTML = `
            <div class="${headerClass}">
                <i class="${icon}"></i>
                <strong class="me-auto">${title}</strong>
                <small>Just now</small>
                <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="${bodyClass}">
                <div class="d-flex align-items-center">
                    <div class="toast-message">${message}</div>
                    <div class="toast-progress"></div>
                </div>
            </div>
        `;

        // Add click event for close button
        const closeBtn = toast.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        });

        return toast;
    }
}

const toast = new Toast();
