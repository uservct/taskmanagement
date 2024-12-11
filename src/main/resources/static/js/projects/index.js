document.addEventListener('DOMContentLoaded', function() {
    // CSRF token
    const token = document.querySelector("meta[name='_csrf']")?.content;
    const header = document.querySelector("meta[name='_csrf_header']")?.content;

    // Search and filter functionality
    const searchInput = document.getElementById('projectSearch');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const tagFilter = document.getElementById('tagFilter');

    // Add event listeners
    searchInput?.addEventListener('input', filterProjects);
    statusFilter?.addEventListener('change', filterProjects);
    priorityFilter?.addEventListener('change', filterProjects);
    tagFilter?.addEventListener('change', filterProjects);

    function filterProjects() {
        const searchTerm = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const statusValue = statusFilter.value;
        const priorityValue = priorityFilter.value;
        const tagValue = tagFilter.value;
        
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const projectName = card.querySelector('.card-title').textContent
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            const projectDescription = card.querySelector('.project-description')?.textContent
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            
            // Get status from badge classes
            const statusBadge = card.querySelector('.badge[data-status]');
            const status = statusBadge?.getAttribute('data-status') || '';
            
            // Get priority from priority indicator
            const priorityIndicator = card.querySelector('.priority-indicator');
            let priority = '';
            if (priorityIndicator?.classList.contains('priority-low')) priority = 'LOW';
            else if (priorityIndicator?.classList.contains('priority-medium')) priority = 'MEDIUM';
            else if (priorityIndicator?.classList.contains('priority-high')) priority = 'HIGH';
            else if (priorityIndicator?.classList.contains('priority-urgent')) priority = 'URGENT';
            
            // Get tag from badge
            const tagBadge = card.querySelector('.badge[data-tag]');
            const tag = tagBadge?.getAttribute('data-tag') || '';

            // Check if project matches all filters
            const matchesSearch = projectName.includes(searchTerm) || 
                                (projectDescription && projectDescription.includes(searchTerm));
            const matchesStatus = !statusValue || status === statusValue;
            const matchesPriority = !priorityValue || priority === priorityValue;
            const matchesTag = !tagValue || tag === tagValue;
            
            // Show/hide project based on filter results
            const projectDiv = card.closest('.col');
            if (projectDiv) {
                projectDiv.style.display = 
                    matchesSearch && matchesStatus && matchesPriority && matchesTag ? 'block' : 'none';
            }
        });
    }

    // Existing delete functionality
    const deleteButtons = document.querySelectorAll('[delete-button]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            const confirm = await confirmDeleteModal("dự án");
            if (confirm) {
                const projectId = this.getAttribute('delete-button');
                const response = await fetch(`/projects/${projectId}/delete`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    },
                });
                
                if (response.ok) {
                    const divProject = document.querySelector(`[div-project="${projectId}"]`);
                    toast.show("success", "Dự án đã được chuyển đến thùng rác");
                    divProject.remove();
                } else {
                    console.error('Failed to delete project');
                }
            }
        });
    });
});

