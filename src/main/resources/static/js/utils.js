/**
 * Utility Functions - Toast notifications, loaders, and common UI helpers
 */

// Toast Notification System
      console.debug('Utils.js loaded.....hurrah!');

const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.id = 'toastContainer';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-body d-flex align-items-center gap-2">
                <i class="bi ${icon}"></i>
                <span>${message}</span>
                <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // Manual close
        toast.querySelector('.btn-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    },

    getIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || icons.info;
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// Loading Spinner
const Loader = {
    overlay: null,

    show() {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'spinner-overlay';
            this.overlay.id = 'loadingOverlay';
            this.overlay.innerHTML = '<div class="loading-spinner"></div>';
        }
        document.body.appendChild(this.overlay);
    },

    hide() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
};

// Form Validation Helper
const FormValidator = {
    validate(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
                this.showError(input, 'Please enter a valid email address');
                isValid = false;
            } else if (input.minLength && input.value.length < input.minLength) {
                this.showError(input, `Minimum ${input.minLength} characters required`);
                isValid = false;
            } else {
                this.clearError(input);
            }
        });

        return isValid;
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showError(input, message) {
        input.classList.add('is-invalid');
        
        let feedback = input.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
        feedback.textContent = message;
    },

    clearError(input) {
        input.classList.remove('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    },

    clearAllErrors(form) {
        form.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.textContent = '';
        });
    }
};

// Confirmation Dialog
const Confirm = {
    show(title, message, onConfirm, onCancel = null) {
        const modalId = 'confirmModal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = modalId;
            modal.tabIndex = -1;
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="confirm-message mb-0"></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger confirm-btn">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.confirm-message').textContent = message;

        const bsModal = new bootstrap.Modal(modal);
        const confirmBtn = modal.querySelector('.confirm-btn');

        // Remove previous event listener
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', () => {
            bsModal.hide();
            if (onConfirm) onConfirm();
        });

        modal.addEventListener('hidden.bs.modal', () => {
            if (onCancel) onCancel();
        }, { once: true });

        bsModal.show();
    }
};

// Table Helper
const TableHelper = {
    renderEmpty(message = 'No data found') {
        return `
            <tr>
                <td colspan="100%" class="text-center py-4">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <h4>${message}</h4>
                    </div>
                </td>
            </tr>
        `;
    },

    renderLoading(colspan = 5) {
        return `
            <tr>
                <td colspan="${colspan}" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
    }
};

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// URL Parameter Helper
const UrlParams = {
    get(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    set(name, value) {
        const params = new URLSearchParams(window.location.search);
        params.set(name, value);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    },

    remove(name) {
        const params = new URLSearchParams(window.location.search);
        params.delete(name);
        const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
};

// Check Authentication on Page Load
function requireAuth() {
    const isAuth = TokenManager.isAuthenticated();
    console.debug('[requireAuth] isAuthenticated:', isAuth);
    if (!isAuth) {
        console.warn('[requireAuth] Not authenticated, redirecting to login');
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
    }
    return true;
}

// Check Role on Page Load
function requireRole(allowedRoles) {
    if (!requireAuth()) return false;
    const user = UserManager.getUser();
    console.debug('[requireRole] user:', user, 'allowedRoles:', allowedRoles);
    if (!user || !allowedRoles.includes(user.role)) {
        console.warn('[requireRole] User does not have required role:', user ? user.role : null);
        Toast.error('You do not have permission to access this page');
        window.location.href = '/dashboard';
        return false;
    }
    return true;
}

// Update Navbar based on authentication state
function updateNavbar() {
    const user = UserManager.getUser();
    const isAuthenticated = TokenManager.isAuthenticated();

    // Update user info in navbar
    const userNameEl = document.getElementById('navUserName');
    const userRoleEl = document.getElementById('navUserRole');
    const userInitialEl = document.getElementById('navUserInitial');

    if (isAuthenticated && user) {
        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) userRoleEl.textContent = user.role;
        if (userInitialEl) userInitialEl.textContent = user.name.charAt(0).toUpperCase();

        // Show/hide menu items based on role
        document.querySelectorAll('[data-role]').forEach(el => {
            const roles = el.dataset.role.split(',');
            el.style.display = roles.includes(user.role) ? '' : 'none';
        });
    }

    // Set active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.startsWith(href) && href !== '/') {
            link.classList.add('active');
        } else if (href === '/' && currentPath === '/') {
            link.classList.add('active');
        }
    });
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    // Update navbar
    updateNavbar();

    // Setup logout buttons
    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            Confirm.show(
                'Logout',
                'Are you sure you want to logout?',
                () => AuthApi.logout()
            );
        });
    });

    // Auto-hide alerts after 5 seconds
    document.querySelectorAll('.alert-dismissible').forEach(alert => {
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
});

// Export utilities
window.Toast = Toast;
window.Loader = Loader;
window.FormValidator = FormValidator;
window.Confirm = Confirm;
window.TableHelper = TableHelper;
window.debounce = debounce;
window.UrlParams = UrlParams;
window.requireAuth = requireAuth;
window.requireRole = requireRole;
window.updateNavbar = updateNavbar;
