/**
 * API Utility Module - Handles all API calls with JWT authentication
 */
      console.debug('Api.js loaded.....hurrah!');

const API_BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Token Management
const TokenManager = {
    getToken() {
        const token = localStorage.getItem(TOKEN_KEY);
        console.debug('[TokenManager] getToken:', token ? 'token exists' : 'no token');
        console.debug(USER_KEY);
        
        return token;
    },

    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
        console.debug('[TokenManager] setToken:', token ? 'token set' : 'no token');
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
        console.debug('[TokenManager] removeToken: token removed');
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch (e) {
            return false;
        }
    },

    getTokenExpiry() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return new Date(payload.exp * 1000);
        } catch (e) {
            return null;
        }
    }
};

// User Management
const UserManager = {
    getUser() {
        const userData = localStorage.getItem(USER_KEY);
        let user = null;
        try {
            user = userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('[UserManager] getUser: failed to parse user data', e, userData);
        }
        console.debug('[UserManager] getUser:', user);
        return user;
    },

    setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.debug('[UserManager] setUser:', user);
    },

    removeUser() {
        localStorage.removeItem(USER_KEY);
        console.debug('[UserManager] removeUser: user removed');
    },

    hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    },

    isAdmin() {
        return this.hasRole('ADMIN');
    },

    isSeller() {
        return this.hasRole('SELLER');
    },

    isCustomer() {
        return this.hasRole('CUSTOMER');
    }
};

// API Request Handler
console.debug('Defining Api object...');
const Api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = TokenManager.getToken();

        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
console.debug('[Api] request to', url, 'with options', options);
        if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
}

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                TokenManager.removeToken();
                UserManager.removeUser();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login?session=expired';
                }
                throw new Error('Session expired. Please login again.');
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                throw new Error('You do not have permission to perform this action.');
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const error = new Error(data.message || 'An error occurred');
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check your internet connection.');
            }
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Auth API
const AuthApi = {
    async login(credentials) {
        let token = await Api.post('/api/users/login', credentials);
        
        // If token is a string wrapped in quotes (from Spring), remove them
        if (typeof token === 'string') {
            token = token.replace(/^["']|["']$/g, '');
        }
        
        console.log('Login token received:', token ? 'token exists' : 'no token');
        TokenManager.setToken(token);
        
        // Fetch user profile after login
        const user = await Api.get('/api/users/profile');
        console.log('User profile received:', user);
        UserManager.setUser(user);
        
        return user;
    },

    async register(userData) {
        return await Api.post('/api/users/register', userData);
    },

    logout: async function() {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include' // REQUIRED to remove JSESSIONID
        });
        TokenManager.removeToken();
        UserManager.removeUser();
        window.location.href = '/login';
    },

    isAuthenticated() {
        return TokenManager.isAuthenticated();
    }
};

// Users API
const UsersApi = {
    getAll() {
        console.debug('[UsersApi] getAll called');
        return Api.get('/api/users');
    },

    getById(id) {
        return Api.get(`/api/users/${id}`);
    },

    getProfile() {
        return Api.get('/api/users/profile');
    },

    update(id, data) {
        return Api.put(`/api/users/${id}`, data);
    },

    delete(id) {
        return Api.delete(`/api/users/${id}`);
    }
};

// Stores API
const StoresApi = {
    getAll() {
        return Api.get('/api/stores');
    },

    getById(id) {
        return Api.get(`/api/stores/${id}`);
    },

    getByManager(managerId) {
        return Api.get(`/api/stores/manager/${managerId}`);
    },

    create(data) {
        return Api.post('/api/stores/create', data);
    },

    update(id, data) {
        return Api.put(`/api/stores/${id}`, data);
    },

    delete(id) {
        return Api.delete(`/api/stores/${id}`);
    }
};

// Products API
const ProductsApi = {
    getAll() {
        return Api.get('/api/products');
    },

    getById(id) {
        return Api.get(`/api/products/${id}`);
    },

    getByStore(storeId) {
        return Api.get(`/api/products/store/${storeId}`);
    },

    getByCategory(category) {
        return Api.get(`/api/products/category/${category}`);
    },

    search(keyword) {
        return Api.get(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
    },

    searchByStore(storeId, keyword) {
        return Api.get(`/api/products/store/${storeId}/search?keyword=${encodeURIComponent(keyword)}`);
    },

    create(data) {
        return Api.post('/api/products', data);
    },

    update(id, data) {
        return Api.put(`/api/products/${id}`, data);
    },

    delete(id) {
        return Api.delete(`/api/products/${id}`);
    }
};

// Product Categories
const ProductCategories = [
    'ELECTRONICS',
    'GROCERY',
    'CLOTHING',
    'TOYS',
    'BOOKS',
    'FURNITURE',
    'BEAUTY',
    'SPORTS',
    'AUTOMOTIVE',
    'HEALTH',
    'PERSONAL_CARE',
    'HOUSEHOLD',
    'ACCESSORIES',
    'OTHERS'
];

// User Roles
const UserRoles = ['ADMIN', 'CUSTOMER', 'SELLER'];

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCategory(category) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getCategoryBadgeClass(category) {
    const classes = {
        'ELECTRONICS': 'bg-primary',
        'GROCERY': 'bg-success',
        'CLOTHING': 'bg-info',
        'TOYS': 'bg-warning',
        'BOOKS': 'bg-secondary',
        'FURNITURE': 'bg-dark',
        'BEAUTY': 'bg-danger',
        'SPORTS': 'bg-primary',
        'AUTOMOTIVE': 'bg-secondary',
        'HEALTH': 'bg-success',
        'PERSONAL_CARE': 'bg-info',
        'HOUSEHOLD': 'bg-warning',
        'ACCESSORIES': 'bg-danger',
        'OTHERS': 'bg-secondary'
    };
    return classes[category] || 'bg-secondary';
}

function getRoleBadgeClass(role) {
    const classes = {
        'ADMIN': 'badge-admin',
        'SELLER': 'badge-seller',
        'CUSTOMER': 'badge-customer'
    };
    return classes[role] || 'bg-secondary';
}

// Export for use in other modules
window.TokenManager = TokenManager;
window.UserManager = UserManager;
window.Api = Api;
window.AuthApi = AuthApi;
window.UsersApi = UsersApi;
window.StoresApi = StoresApi;
window.ProductsApi = ProductsApi;
window.ProductCategories = ProductCategories;
window.UserRoles = UserRoles;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatCategory = formatCategory;
window.getCategoryBadgeClass = getCategoryBadgeClass;
window.getRoleBadgeClass = getRoleBadgeClass;
