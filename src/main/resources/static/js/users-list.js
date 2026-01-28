// users-list.js
// Handles all user management logic for users/list.html

console.debug('[users-list.js] loaded');

let allUsers = [];
let editModal;

document.addEventListener("DOMContentLoaded", async function () {
  console.debug('[users-list.js] DOMContentLoaded');
  const user = UserManager.getUser();
  const token = TokenManager.getToken();
  console.debug('[users-list.js] User:', user);
  console.debug('[users-list.js] Token:', token);

  // Check authentication and admin role
  if (!requireRole(["ADMIN"])) {
    console.warn('[users-list.js] User does not have ADMIN role or not authenticated');
    return;
  }
  console.debug('[users-list.js] User is authenticated and has ADMIN role');

  // Initialize modal
  editModal = new bootstrap.Modal(document.getElementById("editUserModal"));

  // Load users
  await loadUsers();
  console.debug('[users-list.js] Users loaded and rendered');

  // Setup search and filter
  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(filterUsers, 300));
  document
    .getElementById("roleFilter")
    .addEventListener("change", filterUsers);

  // Handle edit form submission
  document
    .getElementById("editUserForm")
    .addEventListener("submit", handleSaveUser);
});

async function loadUsers() {
  console.debug('[users-list.js] loadUsers function started');
  try {
    console.debug('[users-list.js] loadUsers called');
    console.debug('[users-list.js] Fetching users from API');
    allUsers = await UsersApi.getAll();
    console.debug('[users-list.js] Users fetched from API:', allUsers);
    console.debug('[users-list.js] Users loaded:', allUsers);
    renderUsers(allUsers);
  } catch (error) {
    console.error('[users-list.js] Error loading users:', error);
    Toast.error("Failed to load users");
    document.getElementById("usersTable").innerHTML =
      TableHelper.renderEmpty("Failed to load users");
  }
}

function filterUsers() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const roleFilter = document.getElementById("roleFilter").value;

  let filtered = allUsers;

  if (search) {
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    );
  }

  if (roleFilter) {
    filtered = filtered.filter((user) => user.role === roleFilter);
  }

  renderUsers(filtered);
}

function renderUsers(users) {
  const tbody = document.getElementById("usersTable");
  document.getElementById("usersCount").textContent =
    `${users.length} user${users.length !== 1 ? "s" : ""}`;

  console.debug('[users-list.js] renderUsers called with:', users);
  if (users.length === 0) {
    tbody.innerHTML = TableHelper.renderEmpty("No users found");
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td><span class="text-muted">#${user.id}</span></td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
             style="width: 36px; height: 36px; font-size: 0.875rem;">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <strong>${user.name}</strong>
        </div>
      </td>
      <td>${user.email}</td>
      <td>
        <span class="badge badge-role ${getRoleBadgeClass(user.role)}">${user.role}</span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${user.id})" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id}, '${user.name}')" title="Delete"
            ${user.id === UserManager.getUser().id ? "disabled" : ""}>
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

window.openEditModal = function(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return;

  document.getElementById("editUserId").value = user.id;
  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;
  document.getElementById("editPassword").value = "";

  // Clear validation errors
  document
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));

  editModal.show();
};

async function handleSaveUser(e) {
  e.preventDefault();

  const saveBtn = document.getElementById("saveUserBtn");
  const saveSpinner = document.getElementById("saveUserSpinner");

  // Clear validation errors
  document
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));

  saveBtn.disabled = true;
  saveSpinner.classList.remove("d-none");

  const userId = document.getElementById("editUserId").value;
  const userData = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    role: document.getElementById("editRole").value,
  };

  const password = document.getElementById("editPassword").value;
  if (password) {
    userData.password = password;
  }

  try {
    await UsersApi.update(userId, userData);
    editModal.hide();
    Toast.success("User updated successfully");
    await loadUsers();
  } catch (error) {
    if (error.data && error.data.validationErrors) {
      Object.keys(error.data.validationErrors).forEach((field) => {
        const input = document.getElementById(
          "edit" + field.charAt(0).toUpperCase() + field.slice(1),
        );
        if (input) {
          input.classList.add("is-invalid");
          input.nextElementSibling.textContent =
            error.data.validationErrors[field];
        }
      });
    } else {
      Toast.error(error.message || "Failed to update user");
    }
  } finally {
    saveBtn.disabled = false;
    saveSpinner.classList.add("d-none");
  }
}

window.deleteUser = function(userId, userName) {
  if (userId === UserManager.getUser().id) {
    Toast.error("You cannot delete your own account from here");
    return;
  }

  Confirm.show(
    "Delete User",
    `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
    async () => {
      try {
        await UsersApi.delete(userId);
        Toast.success("User deleted successfully");
        await loadUsers();
      } catch (error) {
        Toast.error(error.message || "Failed to delete user");
      }
    },
  );
};
