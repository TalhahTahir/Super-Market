
let allStores = [];
let currentView = 'grid';
let allProducts = [];
let productModal, productDetailModal;

document.addEventListener('DOMContentLoaded', async function() {
  const user = UserManager.getUser();
  if (!requireAuth()) return;

  productModal = new bootstrap.Modal(document.getElementById('productModal'));
  productDetailModal = new bootstrap.Modal(document.getElementById('productDetailModal'));

  populateCategorySelects();
  await loadData();
  applyUrlFilters();

  document.getElementById('searchInput').addEventListener('input', debounce(filterProducts, 300));
  document.getElementById('categoryFilter').addEventListener('change', filterProducts);
  document.getElementById('storeFilter').addEventListener('change', filterProducts);
  document.getElementById('productForm').addEventListener('submit', handleSaveProduct);
  document.getElementById('productDescription').addEventListener('input', function() {
    document.getElementById('descCharCount').textContent = this.value.length;
  });

  if (UrlParams.get('action') === 'new') {
    openCreateModal();
  }
});

function populateCategorySelects() {
  const categoryOptions = ProductCategories.map(cat => 
    `<option value="${cat}">${formatCategory(cat)}</option>`
  ).join('');
  document.getElementById('productCategory').innerHTML = '<option value="">Select category</option>' + categoryOptions;
  document.getElementById('categoryFilter').innerHTML = '<option value="">All Categories</option>' + categoryOptions;
}

async function loadData() {
  try {
    [allProducts, allStores] = await Promise.all([
      ProductsApi.getAll(),
      StoresApi.getAll()
    ]);
    document.getElementById('storeFilter').innerHTML = '<option value="">All Stores</option>' + 
      allStores.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const user = UserManager.getUser();
    let availableStores = allStores;
    if (user.role === 'SELLER') {
      availableStores = allStores.filter(s => s.managerId === user.id);
    }
    document.getElementById('productStore').innerHTML = '<option value="">Select store</option>' + 
      availableStores.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    renderProducts(allProducts);
  } catch (error) {
    console.error('Error loading data:', error);
    Toast.error('Failed to load products');
  }
}

function applyUrlFilters() {
  const categoryParam = UrlParams.get('category');
  const storeIdParam = UrlParams.get('storeId');
  if (categoryParam) {
    document.getElementById('categoryFilter').value = categoryParam;
  }
  if (storeIdParam) {
    document.getElementById('storeFilter').value = storeIdParam;
  }
  if (categoryParam || storeIdParam) {
    filterProducts();
  }
}

function filterProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const storeFilter = document.getElementById('storeFilter').value;
  let filtered = allProducts;
  if (search) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(search) || 
      (product.description && product.description.toLowerCase().includes(search))
    );
  }
  if (categoryFilter) {
    filtered = filtered.filter(product => product.category === categoryFilter);
  }
  if (storeFilter) {
    filtered = filtered.filter(product => product.storeId === parseInt(storeFilter));
  }
  renderProducts(filtered);
}

function setView(view) {
  currentView = view;
  document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
  document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
  document.getElementById('productsGrid').classList.toggle('d-none', view === 'list');
  document.getElementById('productsListCard').classList.toggle('d-none', view === 'grid');
  filterProducts();
}

function renderProducts(products) {
  document.getElementById('productsCount').textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
  if (currentView === 'grid') {
    renderProductsGrid(products);
  } else {
    renderProductsList(products);
  }
}

function renderProductsGrid(products) {
  const grid = document.getElementById('productsGrid');
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <i class="bi bi-box-seam"></i>
          <h4>No products found</h4>
          <p>Try adjusting your search or filters.</p>
        </div>
      </div>
    `;
    return;
  }
  const user = UserManager.getUser();
  grid.innerHTML = products.map(product => {
    const store = allStores.find(s => s.id === product.storeId);
    const canEdit = user.role === 'ADMIN' || (store && store.managerId === user.id);
    return `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card product-card h-100" onclick="viewProductDetails(${product.id})">
          <div class="card-img-top">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="card-body">
            <span class="badge ${getCategoryBadgeClass(product.category)} badge-category mb-2">
              ${formatCategory(product.category)}
            </span>
            <h6 class="card-title mb-1">${product.name}</h6>
            <p class="text-muted small mb-2 text-truncate-2">
              ${product.description || 'No description'}
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="product-price">${formatCurrency(product.price)}</span>
              <small class="text-muted">${store ? store.name : '-'}</small>
            </div>
          </div>
          ${canEdit ? `
          <div class="card-footer bg-transparent border-0 pt-0">
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-grow-1" 
                      onclick="event.stopPropagation(); openEditModal(${product.id})">
                <i class="bi bi-pencil me-1"></i>Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" 
                      onclick="event.stopPropagation(); deleteProduct(${product.id}, '${product.name}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderProductsList(products) {
  const tbody = document.getElementById('productsTable');
  if (products.length === 0) {
    tbody.innerHTML = TableHelper.renderEmpty('No products found');
    return;
  }
  const user = UserManager.getUser();
  tbody.innerHTML = products.map(product => {
    const store = allStores.find(s => s.id === product.storeId);
    const canEdit = user.role === 'ADMIN' || (store && store.managerId === user.id);
    return `
      <tr class="cursor-pointer" onclick="viewProductDetails(${product.id})">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="rounded bg-light p-2">
              <i class="bi bi-box-seam text-muted"></i>
            </div>
            <div>
              <strong>${product.name}</strong>
              <br>
              <small class="text-muted">${product.description ? product.description.substring(0, 50) + '...' : 'No description'}</small>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${getCategoryBadgeClass(product.category)}">
            ${formatCategory(product.category)}
          </span>
        </td>
        <td>${store ? store.name : '-'}</td>
        <td class="text-primary fw-bold">${formatCurrency(product.price)}</td>
        <td class="text-end" onclick="event.stopPropagation()">
          ${canEdit ? `
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${product.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id}, '${product.name}')">
            <i class="bi bi-trash"></i>
          </button>
          ` : `
          <button class="btn btn-sm btn-outline-secondary" onclick="viewProductDetails(${product.id})">
            <i class="bi bi-eye"></i>
          </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateModal() {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productCategory').value = '';
  document.getElementById('productStore').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('descCharCount').textContent = '0';
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  productModal.show();
}

function openEditModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productStore').value = product.storeId;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('descCharCount').textContent = (product.description || '').length;
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  productModal.show();
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const saveBtn = document.getElementById('saveProductBtn');
  const saveSpinner = document.getElementById('saveProductSpinner');
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  saveBtn.disabled = true;
  saveSpinner.classList.remove('d-none');
  const productId = document.getElementById('productId').value;
  const productData = {
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    storeId: parseInt(document.getElementById('productStore').value),
    description: document.getElementById('productDescription').value || null
  };
  try {
    if (productId) {
      await ProductsApi.update(productId, productData);
      Toast.success('Product updated successfully');
    } else {
      await ProductsApi.create(productData);
      Toast.success('Product created successfully');
    }
    productModal.hide();
    await loadData();
  } catch (error) {
    if (error.data && error.data.validationErrors) {
      Object.keys(error.data.validationErrors).forEach(field => {
        const fieldMap = { name: 'productName', price: 'productPrice', category: 'productCategory', storeId: 'productStore', description: 'productDescription' };
        const input = document.getElementById(fieldMap[field] || field);
        if (input) {
          input.classList.add('is-invalid');
          const feedback = input.closest('.mb-3, .col-md-4, .col-md-6, .col-md-8, .mt-3')?.querySelector('.invalid-feedback');
          if (feedback) {
            feedback.textContent = error.data.validationErrors[field];
          }
        }
      });
    } else {
      Toast.error(error.message || 'Failed to save product');
    }
  } finally {
    saveBtn.disabled = false;
    saveSpinner.classList.add('d-none');
  }
}

function viewProductDetails(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  const store = allStores.find(s => s.id === product.storeId);
  const user = UserManager.getUser();
  const canEdit = user.role === 'ADMIN' || (store && store.managerId === user.id);
  document.getElementById('productDetailTitle').textContent = product.name;
  document.getElementById('productDetailBody').innerHTML = `
    <div class="row">
      <div class="col-md-5">
        <div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 250px;">
          <i class="bi bi-box-seam text-muted" style="font-size: 5rem;"></i>
        </div>
      </div>
      <div class="col-md-7">
        <span class="badge ${getCategoryBadgeClass(product.category)} mb-2">
          ${formatCategory(product.category)}
        </span>
        <h3 class="mb-2">${product.name}</h3>
        <p class="text-muted mb-3">Product ID: #${product.id}</p>
        <div class="mb-3">
          <span class="h2 text-primary">${formatCurrency(product.price)}</span>
        </div>
        <div class="mb-3">
          <label class="text-muted small">Description</label>
          <p class="mb-0">${product.description || 'No description provided.'}</p>
        </div>
        <div class="mb-3">
          <label class="text-muted small">Store</label>
          <p class="mb-0">
            <i class="bi bi-building text-primary me-2"></i>
            ${store ? store.name : 'Unknown'}
            ${store ? `<br><small class="text-muted ms-4">${store.location}</small>` : ''}
          </p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('productDetailFooter').innerHTML = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    ${canEdit ? `
    <button type="button" class="btn btn-outline-primary" onclick="productDetailModal.hide(); openEditModal(${product.id})">
      <i class="bi bi-pencil me-2"></i>Edit Product
    </button>
    ` : ''}
  `;
  productDetailModal.show();
}

function deleteProduct(productId, productName) {
  Confirm.show(
    'Delete Product',
    `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
    async () => {
      try {
        await ProductsApi.delete(productId);
        Toast.success('Product deleted successfully');
        await loadData();
      } catch (error) {
        Toast.error(error.message || 'Failed to delete product');
      }
    }
  );
}

async function loadProducts() {
  console.debug('[products-list.js] loadProducts function started');
  try {
    console.debug('[products-list.js] Fetching products from API');
    allProducts = await ProductsApi.getAll();
    console.debug('[products-list.js] Products fetched from API:', allProducts);
    renderProducts(allProducts);
  } catch (error) {
    console.error('[products-list.js] Error loading products:', error);
    Toast.error('Failed to load products');
    document.getElementById('productsGrid').innerHTML = TableHelper.renderEmpty('Failed to load products');
  }
}

function filterProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const store = document.getElementById('storeFilter').value;

  let filtered = allProducts;

  if (search) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        (product.description && product.description.toLowerCase().includes(search)),
    );
  }

  if (category) {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (store) {
    filtered = filtered.filter((product) => String(product.storeId) === store);
  }

  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const productsCount = document.getElementById('productsCount');
  if (productsCount) {
    productsCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
  }

  console.debug('[products-list.js] renderProducts called with:', products);
  if (products.length === 0) {
    grid.innerHTML = TableHelper.renderEmpty('No products found');
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-box-seam text-primary" style="font-size: 1.5rem;"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">${product.name}</h5>
                  <small class="text-muted">ID: #${product.id}</small>
                </div>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-light" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" onclick="openEditModal(${product.id}); return false;">
                    <i class="bi bi-pencil me-2"></i>Edit
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" onclick="deleteProduct(${product.id}, '${product.name}'); return false;">
                    <i class="bi bi-trash me-2"></i>Delete
                  </a></li>
                </ul>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex align-items-center text-muted mb-2">
                <i class="bi bi-tag me-2"></i>
                <span>${formatCategory(product.category)}</span>
              </div>
              <div class="d-flex align-items-center text-muted">
                <i class="bi bi-shop me-2"></i>
                <span>${product.storeName || 'Unknown'}</span>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-grow-1" onclick="viewProductDetails(${product.id})">
                <i class="bi bi-eye me-1"></i>View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
    )
    .join('');
}

window.openEditModal = function(productId) {
  // ...implement as needed...
};
window.deleteProduct = function(productId, productName) {
  // ...implement as needed...
};
window.viewProductDetails = function(productId) {
  // ...implement as needed...
};
window.openCreateModal = openCreateModal;
window.setView = setView;
