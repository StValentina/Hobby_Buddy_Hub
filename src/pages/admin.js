/**
 * Admin page logic for role management
 */

import { apiService } from '/src/services/api.js';

let currentUser = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function roleBadgeClass(role) {
    if (role === 'admin') return 'bg-danger';
    if (role === 'host') return 'bg-primary';
    return 'bg-secondary';
}

function showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 320px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    toast.innerHTML = `
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), type === 'danger' ? 5000 : 3000);
}

function renderRows(users) {
    const tbody = document.getElementById('adminUsersTbody');

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted py-4">No users found.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map((user) => {
        const safeName = escapeHtml(user.full_name || 'N/A');
        const safeEmail = escapeHtml(user.email || 'N/A');
        const safeRole = escapeHtml(user.role || 'seeker');

        return `
            <tr>
                <td>${safeName}</td>
                <td>${safeEmail}</td>
                <td><span class="badge ${roleBadgeClass(user.role)}">${safeRole}</span></td>
                <td>
                    <select class="form-select form-select-sm" id="role-${user.user_id}">
                        <option value="seeker" ${user.role === 'seeker' ? 'selected' : ''}>seeker</option>
                        <option value="host" ${user.role === 'host' ? 'selected' : ''}>host</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                    </select>
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary save-role-btn" data-user-id="${user.user_id}">
                        Save
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function loadUsers() {
    const tbody = document.getElementById('adminUsersTbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted py-4">Loading users...</td></tr>';

    try {
        const users = await apiService.getAllUsersWithRoles();
        renderRows(users);
        setupSaveHandlers();
    } catch (error) {
        console.error('Failed to load users:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger py-4">Failed to load users: ${escapeHtml(error.message)}</td></tr>`;
    }
}

function setupSaveHandlers() {
    const buttons = document.querySelectorAll('.save-role-btn');

    buttons.forEach((button) => {
        button.addEventListener('click', async () => {
            const userId = button.getAttribute('data-user-id');
            const roleSelect = document.getElementById(`role-${userId}`);
            const selectedRole = roleSelect?.value;

            if (!selectedRole) {
                showMessage('Please select a role.', 'danger');
                return;
            }

            // Avoid accidental self-demotion from admin panel.
            if (userId === currentUser.id && selectedRole !== 'admin') {
                showMessage('You cannot remove your own admin role from this panel.', 'danger');
                return;
            }

            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Saving...';

            try {
                await apiService.updateUserRole(userId, selectedRole);
                showMessage(`Role updated to ${selectedRole}.`);
                await loadUsers();
            } catch (error) {
                console.error('Failed to update role:', error);
                showMessage(`Failed to update role: ${error.message}`, 'danger');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Admin');

    if (!apiService.isAuthenticated()) {
        window.location.href = '/pages/auth/login.html';
        return;
    }

    currentUser = apiService.getCurrentUser();
    if (!currentUser) {
        window.location.href = '/pages/auth/login.html';
        return;
    }

    const currentRole = await apiService.getUserRole(currentUser.id);
    if (currentRole !== 'admin') {
        showMessage('Access denied. Admins only.', 'danger');
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1200);
        return;
    }

    await loadUsers();
});
