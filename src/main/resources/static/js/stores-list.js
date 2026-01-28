// stores-list.js
// Handles all store management logic for stores/list.html

console.debug('[stores-list.js] loaded');

let allStores = [];
let storeModal, storeDetailModal;

document.addEventListener('DOMContentLoaded', async function() {
  console.debug('[stores-list.js] DOMContentLoaded');
  const user = UserManager.getUser();
  const token = TokenManager.getToken();
  console.debug('[stores-list.js] User:', user);
  console.debug('[stores-list.js] Token:', token);

  // Check authentication and admin/seller role
  if (!requireRole(["ADMIN", "SELLER"])) {
    console.warn('[stores-list.js] User does not have ADMIN/SELLER role or not authenticated');
    return;
  }
  console.debug('[stores-list.js] User is authenticated and has ADMIN/SELLER role');

  // Initialize modals
  storeModal = new bootstrap.Modal(document.getElementById('storeModal'));
  storeDetailModal = new bootstrap.Modal(document.getElementById('storeDetailModal'));

  // Load stores
  await loadStores();
  console.debug('[stores-list.js] Stores loaded and rendered');

  // Setup search and filter
  document.getElementById('searchInput').addEventListener('input', debounce(filterStores, 300));
  document.getElementById('myStoresOnly').addEventListener('change', filterStores);

  // Handle form submission
  document.getElementById('storeForm').addEventListener('submit', handleSaveStore);

  // Check if we need to open create modal
  if (UrlParams.get('action') === 'new') {
    openCreateModal();
  }
});

async function loadStores() {
  console.debug('[stores-list.js] loadStores function started');
  try {
    console.debug('[stores-list.js] loadStores called');
    console.debug('[stores-list.js] Fetching stores from API');
    allStores = await StoresApi.getAll();
    console.debug('[stores-list.js] Stores fetched from API:', allStores);
    renderStores(allStores);
  } catch (error) {
    console.error('[stores-list.js] Error loading stores:', error);
    Toast.error('Failed to load stores');
    document.getElementById('storesGrid').innerHTML = TableHelper.renderEmpty('Failed to load stores');
  }
}

function filterStores() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const myStoresOnly = document.getElementById('myStoresOnly').checked;
  const user = UserManager.getUser();

  let filtered = allStores;

  if (search) {
    filtered = filtered.filter(
      (store) =>
        store.name.toLowerCase().includes(search) ||
        (store.location && store.location.toLowerCase().includes(search)),
    );
  }

  if (myStoresOnly && user) {
    filtered = filtered.filter((store) => store.managerId === user.id);
  }

  renderStores(filtered);
}

function renderStores(stores) {
  const grid = document.getElementById('storesGrid');
  const storesCount = document.getElementById('storesCount');
  if (storesCount) {
    storesCount.textContent = `${stores.length} store${stores.length !== 1 ? 's' : ''}`;
  }

  console.debug('[stores-list.js] renderStores called with:', stores);
  if (stores.length === 0) {
    grid.innerHTML = TableHelper.renderEmpty('No stores found');
    return;
  }

  grid.innerHTML = stores
    .map(
      (store) => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-building text-primary" style="font-size: 1.5rem;"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">${store.name}</h5>
                  <small class="text-muted">ID: #${store.id}</small>
                </div>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-light" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" onclick="openEditModal(${store.id}); return false;">
                    <i class="bi bi-pencil me-2"></i>Edit
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" onclick="deleteStore(${store.id}, '${store.name}'); return false;">
                    <i class="bi bi-trash me-2"></i>Delete
                  </a></li>
                </ul>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex align-items-center text-muted mb-2">
                <i class="bi bi-geo-alt me-2"></i>
                <span>${store.location}</span>
              </div>
              <div class="d-flex align-items-center text-muted">
                <i class="bi bi-person me-2"></i>
                <span>${store.managerName || 'Unknown'}</span>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-grow-1" onclick="viewStoreDetails(${store.id})">
                <i class="bi bi-eye me-1"></i>View Details
              </button>
              <a href="/products?storeId=${store.id}" class="btn btn-sm btn-primary flex-grow-1">
                <i class="bi bi-box-seam me-1"></i>Products
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
    )
    .join('');
}

window.openEditModal = function(storeId) {
  // ...implement as needed...
};
window.deleteStore = function(storeId, storeName) {
  // ...implement as needed...
};
window.viewStoreDetails = function(storeId) {
  // ...implement as needed...
};

async function handleSaveStore(event) {
  event.preventDefault();
  const form = document.getElementById('storeForm');
  const saveBtn = document.getElementById('saveStoreBtn');
  const spinner = document.getElementById('saveStoreSpinner');

  // Clear previous errors
  form.classList.remove('was-validated');
  form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');

  // Gather form data
  const name = document.getElementById('storeName').value.trim();
  const location = document.getElementById('storeLocation').value.trim();
  let managerId = null;
  const managerInput = document.getElementById('storeManager');
  if (managerInput) {
    managerId = managerInput.value;
  } else {
    const user = UserManager.getUser();
    managerId = user && user.id ? user.id : null;
  }

  // Simple validation
  let valid = true;
  if (!name || name.length < 2 || name.length > 100) {
    document.getElementById('storeName').classList.add('is-invalid');
    document.getElementById('storeName').nextElementSibling.textContent = 'Store name must be 2-100 characters.';
    valid = false;
  } else {
    document.getElementById('storeName').classList.remove('is-invalid');
  }
  if (!location || location.length > 200) {
    document.getElementById('storeLocation').classList.add('is-invalid');
    document.getElementById('storeLocation').nextElementSibling.textContent = 'Location is required and max 200 characters.';
    valid = false;
  } else {
    document.getElementById('storeLocation').classList.remove('is-invalid');
  }
  if (!managerId) {
    if (managerInput) {
      managerInput.classList.add('is-invalid');
      managerInput.nextElementSibling.textContent = 'Manager is required.';
    } else {
      Toast.error('Manager (user) not found. Please re-login.');
    }
    valid = false;
  } else if (managerInput) {
    managerInput.classList.remove('is-invalid');
  }
  if (!valid) {
    form.classList.add('was-validated');
    return;
  }

  // Prepare data
  const data = {
    name,
    location,
    managerId: Number(managerId)
  };

  // UI feedback
  saveBtn.disabled = true;
  spinner.classList.remove('d-none');

  try {
    const created = await StoresApi.create(data);
    Toast.success('Store created successfully');
    storeModal.hide();
    await loadStores();
    form.reset();
  } catch (error) {
    Toast.error('Failed to create store');
    if (error && error.response && error.response.data && error.response.data.errors) {
      // Show validation errors from backend
      for (const err of error.response.data.errors) {
        const field = form.querySelector(`[id^=store${capitalizeFirstLetter(err.field)}]`);
        if (field) {
          field.classList.add('is-invalid');
          field.nextElementSibling.textContent = err.defaultMessage || err.message;
        }
      }
    }
  } finally {
    saveBtn.disabled = false;
    spinner.classList.add('d-none');
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function openCreateModal() {
  // Reset form fields
  const form = document.getElementById('storeForm');
  form.reset();
  form.classList.remove('was-validated');
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');

  // Set modal title
  document.getElementById('storeModalTitle').textContent = 'Add Store';
  document.getElementById('saveStoreBtn').textContent = 'Save Store';

  // Show the modal
  if (!storeModal) {
    storeModal = new bootstrap.Modal(document.getElementById('storeModal'));
  }
  storeModal.show();
}
