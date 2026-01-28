// dashboard-list.js
// Handles all dashboard page logic

document.addEventListener('DOMContentLoaded', async function() {
    if (!requireAuth()) return;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const user = UserManager.getUser();
        if (!user) {
            console.error('No user data found');
            Toast.error('Please login again');
            window.location.href = '/login';
            return;
        }
        const [products, stores] = await Promise.all([
            ProductsApi.getAll(),
            StoresApi.getAll()
        ]);
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalStores').textContent = stores.length;
        if (UserManager.isAdmin()) {
            try {
                const users = await UsersApi.getAll();
                document.getElementById('totalUsers').textContent = users.length;
            } catch (e) {
                document.getElementById('totalUsers').textContent = '-';
            }
        }
        renderRecentProducts(products.slice(0, 5), stores);
        if (user.role === 'SELLER' || user.role === 'ADMIN') {
            const myStores = stores.filter(s => s.managerId === user.id);
            renderMyStores(myStores);
        }
        renderCategories(products);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        Toast.error('Failed to load dashboard data: ' + error.message);
        document.getElementById('pageErrorMessage').textContent = 'Failed to load dashboard: ' + error.message;
        document.getElementById('pageError').classList.remove('d-none');
    }
}

function renderRecentProducts(products, stores) {
    const tbody = document.getElementById('recentProductsTable');
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="empty-state">
                        <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                        <p class="mb-0 mt-2">No products found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = products.map(product => {
        const store = stores.find(s => s.id === product.storeId);
        return `
            <tr class="cursor-pointer" onclick="window.location.href='/products/${product.id}'">
                <td><strong>${product.name}</strong></td>
                <td><span class="badge ${getCategoryBadgeClass(product.category)}">${formatCategory(product.category)}</span></td>
                <td class="text-primary fw-bold">${formatCurrency(product.price)}</td>
                <td>${store ? store.name : '-'}</td>
            </tr>
        `;
    }).join('');
}

function renderMyStores(stores) {
    const list = document.getElementById('myStoresList');
    if (stores.length === 0) {
        list.innerHTML = `
            <li class="list-group-item text-center py-3 text-muted">
                <i class="bi bi-building mb-2" style="font-size: 1.5rem;"></i>
                <p class="mb-0">No stores yet</p>
                <a href="/stores?action=new" class="btn btn-sm btn-primary mt-2">Create Store</a>
            </li>
        `;
        return;
    }
    list.innerHTML = stores.slice(0, 4).map(store => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <a href="/stores/${store.id}" class="text-decoration-none">
                <i class="bi bi-building me-2"></i>${store.name}
            </a>
            <span class="badge bg-secondary">${store.location}</span>
        </li>
    `).join('');
}

function renderCategories(products) {
    const grid = document.getElementById('categoriesGrid');
    const categoryCounts = {};
    ProductCategories.forEach(cat => categoryCounts[cat] = 0);
    products.forEach(p => {
        if (categoryCounts[p.category] !== undefined) {
            categoryCounts[p.category]++;
        }
    });
    grid.innerHTML = ProductCategories.map(category => `
        <div class="col-6 col-md-4 col-lg-3">
            <a href="/products?category=${category}" class="text-decoration-none">
                <div class="card h-100 text-center p-3">
                    <span class="badge ${getCategoryBadgeClass(category)} mb-2 mx-auto" style="width: fit-content;">
                        ${categoryCounts[category]}
                    </span>
                    <small class="text-muted">${formatCategory(category)}</small>
                </div>
            </a>
        </div>
    `).join('');
}
