// ============================================================
// TASKFLOW - APLICAÇÃO DE TAREFAS COM LOCAL STORAGE
// ============================================================

class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'todos';
        this.currentSort = 'data';
        this.editingTaskId = null;
        this.init();
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Input e botões
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // Ordenação
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Ações
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTasks());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('modalSaveBtn').addEventListener('click', () => this.saveEditedTask());
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeModal();
        });
    }

    // ============================================================
    // GERENCIAR TAREFAS
    // ============================================================

    addTask() {
        const input = document.getElementById('taskInput');
        const priority = document.getElementById('prioritySelect').value;
        const text = input.value.trim();

        if (!text) {
            alert('Por favor, adicione uma descrição para a tarefa');
            return;
        }

        const task = {
            id: Date.now(),
            text,
            priority,
            completed: false,
            dueDate: null,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();

        input.value = '';
        document.getElementById('prioritySelect').value = 'media';
        input.focus();
    }

    deleteTask(id) {
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        this.editingTaskId = id;
        const task = this.tasks.find(t => t.id === id);

        document.getElementById('editTaskInput').value = task.text;
        document.getElementById('editPrioritySelect').value = task.priority;
        document.getElementById('editDueDateInput').value = task.dueDate || '';

        document.getElementById('editModal').classList.add('active');
    }

    saveEditedTask() {
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = document.getElementById('editTaskInput').value.trim();
            task.priority = document.getElementById('editPrioritySelect').value;
            task.dueDate = document.getElementById('editDueDateInput').value || null;
            
            this.saveTasks();
            this.render();
            this.closeModal();
        }
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('active');
        this.editingTaskId = null;
    }

    // ============================================================
    // FILTRAR E ORDENAR
    // ============================================================

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        if (this.currentFilter === 'pendentes') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.currentFilter === 'completas') {
            filtered = filtered.filter(t => t.completed);
        }

        return this.sortTasks(filtered);
    }

    sortTasks(tasks) {
        const sorted = [...tasks];

        if (this.currentSort === 'prioridade') {
            const priorityOrder = { 'alta': 0, 'media': 1, 'baixa': 2 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (this.currentSort === 'nome') {
            sorted.sort((a, b) => a.text.localeCompare(b.text));
        } else {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return sorted;
    }

    // ============================================================
    // RENDERIZAÇÃO
    // ============================================================

    render() {
        this.updateStats();
        this.renderTasks();
        this.renderFilters();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;

        document.getElementById('clearCompletedBtn').style.display = completed > 0 ? 'flex' : 'none';
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filtered = this.getFilteredTasks();

        if (filtered.length === 0) {
            tasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tasksList.innerHTML = filtered.map(task => this.createTaskElement(task)).join('');

        // Adicionar event listeners
        tasksList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(parseInt(e.target.dataset.id));
            });
        });

        tasksList.querySelectorAll('.task-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTask(parseInt(e.target.dataset.id));
            });
        });

        tasksList.querySelectorAll('.task-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTask(parseInt(e.target.dataset.id));
            });
        });
    }

    createTaskElement(task) {
        const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : '';
        const createdDate = new Date(task.createdAt).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="task-item prioridade-${task.priority} ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    data-id="${task.id}" 
                    ${task.completed ? 'checked' : ''}
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">
                            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span class="task-date">Criado em ${createdDate}</span>
                        ${dateStr ? `<span class="task-date">Vence em: ${dateStr}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn task-edit-btn" data-id="${task.id}" title="Editar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                            <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="task-action-btn delete task-delete-btn" data-id="${task.id}" title="Deletar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderFilters() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        document.querySelector('[data-filter="todos"]').innerHTML = `Todas (${total})`;
        document.querySelector('[data-filter="pendentes"]').innerHTML = `Pendentes (${pending})`;
        document.querySelector('[data-filter="completas"]').innerHTML = `Completas (${completed})`;
    }

    // ============================================================
    // AÇÕES EM MASSA
    // ============================================================

    clearCompleted() {
        if (confirm('Tem certeza que deseja deletar todas as tarefas completas?')) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tarefas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    resetAll() {
        if (confirm('Tem certeza que deseja deletar TODAS as tarefas? Esta ação não pode ser desfeita!')) {
            if (confirm('Tem CERTEZA? Todas as tarefas serão perdidas!')) {
                this.tasks = [];
                this.saveTasks();
                this.render();
            }
        }
    }

    // ============================================================
    // LOCAL STORAGE
    // ============================================================

    saveTasks() {
        try {
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
            alert('Erro ao salvar tarefas. Verifique o espaço de armazenamento.');
        }
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem('taskflow_tasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    }

    // ============================================================
    // UTILIDADES
    // ============================================================

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Inicializar app quando DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlow = new TaskFlow();
});
