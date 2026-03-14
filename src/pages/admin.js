/**
 * Admin page logic for role management
 */

import { apiService } from '/src/services/api.js';

let currentUser = null;
let usersCache = [];
let hobbiesCache = [];
let eventsCache = [];
let locationsCache = [];

let adminViewModal = null;
let createHobbyModal = null;
let createEventModal = null;
let editHobbyModal = null;
let editEventModal = null;

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

function formatDateTime(dateValue) {
    if (!dateValue) return 'N/A';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function toDateTimeLocalValue(dateValue) {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';

    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

function renderHobbiesRows(hobbies) {
    const tbody = document.getElementById('adminHobbiesTbody');

    if (!hobbies || hobbies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted py-4">No hobbies found.</td></tr>';
        return;
    }

    tbody.innerHTML = hobbies.map((hobby) => `
        <tr>
            <td><strong>${escapeHtml(hobby.name || 'N/A')}</strong></td>
            <td class="truncate-cell" title="${escapeHtml(hobby.description || '')}">${escapeHtml(hobby.description || 'No description')}</td>
            <td>${hobby.created_at ? new Date(hobby.created_at).toLocaleDateString('en-US') : 'N/A'}</td>
            <td>
                <div class="actions-group">
                    <button type="button" class="btn btn-sm btn-outline-info view-hobby-btn" data-hobby-id="${hobby.id}">View</button>
                    <button type="button" class="btn btn-sm btn-outline-primary edit-hobby-btn" data-hobby-id="${hobby.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-hobby-btn" data-hobby-id="${hobby.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderEventsRows(events) {
    const tbody = document.getElementById('adminEventsTbody');

    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted py-4">No events found.</td></tr>';
        return;
    }

    tbody.innerHTML = events.map((event) => `
        <tr>
            <td><strong>${escapeHtml(event.title || 'N/A')}</strong></td>
            <td>${formatDateTime(event.event_date)}</td>
            <td>${escapeHtml(event.hobbies?.name || 'Unknown')}</td>
            <td>${escapeHtml(event.locations?.city || 'TBD')}</td>
            <td>
                <div class="actions-group">
                    <button type="button" class="btn btn-sm btn-outline-info view-event-btn" data-event-id="${event.id}">View</button>
                    <button type="button" class="btn btn-sm btn-outline-primary edit-event-btn" data-event-id="${event.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-event-btn" data-event-id="${event.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadUsers() {
    const tbody = document.getElementById('adminUsersTbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted py-4">Loading users...</td></tr>';

    try {
        usersCache = await apiService.getAllUsersWithRoles();
        renderRows(usersCache);
        setupSaveHandlers();
    } catch (error) {
        console.error('Failed to load users:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger py-4">Failed to load users: ${escapeHtml(error.message)}</td></tr>`;
    }
}

async function loadHobbies() {
    const tbody = document.getElementById('adminHobbiesTbody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted py-4">Loading hobbies...</td></tr>';

    try {
        hobbiesCache = await apiService.getAdminHobbies();
        renderHobbiesRows(hobbiesCache);
    } catch (error) {
        console.error('Failed to load hobbies:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger py-4">Failed to load hobbies: ${escapeHtml(error.message)}</td></tr>`;
    }
}

async function loadEvents() {
    const tbody = document.getElementById('adminEventsTbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted py-4">Loading events...</td></tr>';

    try {
        eventsCache = await apiService.getAdminEvents();
        renderEventsRows(eventsCache);
    } catch (error) {
        console.error('Failed to load events:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger py-4">Failed to load events: ${escapeHtml(error.message)}</td></tr>`;
    }
}

async function loadLocations() {
    try {
        locationsCache = await apiService.getLocations();
    } catch (error) {
        console.error('Failed to load locations:', error);
        locationsCache = [];
    }
}

function showViewModal(title, htmlContent) {
    document.getElementById('adminViewModalLabel').textContent = title;
    document.getElementById('adminViewModalBody').innerHTML = htmlContent;
    adminViewModal.show();
}

function openViewHobby(hobbyId) {
    const hobby = hobbiesCache.find((h) => h.id === hobbyId);
    if (!hobby) return;

    showViewModal('Hobby Details', `
        <div class="mb-2"><strong>Name:</strong> ${escapeHtml(hobby.name || 'N/A')}</div>
        <div class="mb-2"><strong>Description:</strong><br>${escapeHtml(hobby.description || 'No description')}</div>
        <div class="mb-2"><strong>Image URL:</strong><br>${escapeHtml(hobby.image_url || 'N/A')}</div>
        <div class="mb-0"><strong>Created:</strong> ${hobby.created_at ? new Date(hobby.created_at).toLocaleString('en-US') : 'N/A'}</div>
    `);
}

function openEditHobby(hobbyId) {
    const hobby = hobbiesCache.find((h) => h.id === hobbyId);
    if (!hobby) return;

    document.getElementById('editHobbyId').value = hobby.id;
    document.getElementById('editHobbyName').value = hobby.name || '';
    document.getElementById('editHobbyDescription').value = hobby.description || '';
    document.getElementById('editHobbyImageUrl').value = hobby.image_url || '';
    editHobbyModal.show();
}

function openCreateHobby() {
    const nameInput = document.getElementById('createHobbyName');
    const descriptionInput = document.getElementById('createHobbyDescription');
    const imageUrlInput = document.getElementById('createHobbyImageUrl');

    if (nameInput) nameInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (imageUrlInput) imageUrlInput.value = '';

    createHobbyModal.show();
}

async function deleteHobby(hobbyId) {
    const hobby = hobbiesCache.find((h) => h.id === hobbyId);
    if (!hobby) return;

    const confirmed = window.confirm(`Delete hobby "${hobby.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
        await apiService.deleteHobby(hobbyId);
        showMessage('Hobby deleted successfully.');
        await Promise.all([loadHobbies(), loadEvents()]);
    } catch (error) {
        console.error('Failed to delete hobby:', error);
        showMessage(`Failed to delete hobby: ${error.message}`, 'danger');
    }
}

function openViewEvent(eventId) {
    const event = eventsCache.find((e) => e.id === eventId);
    if (!event) return;

    showViewModal('Event Details', `
        <div class="mb-2"><strong>Title:</strong> ${escapeHtml(event.title || 'N/A')}</div>
        <div class="mb-2"><strong>Description:</strong><br>${escapeHtml(event.description || 'No description')}</div>
        <div class="mb-2"><strong>Date:</strong> ${formatDateTime(event.event_date)}</div>
        <div class="mb-2"><strong>Category:</strong> ${escapeHtml(event.hobbies?.name || 'Unknown')}</div>
        <div class="mb-2"><strong>Location:</strong> ${escapeHtml(event.locations?.city || 'TBD')} - ${escapeHtml(event.locations?.address || '')}</div>
        <div class="mb-2"><strong>Host:</strong> ${escapeHtml(event.profiles?.full_name || event.profiles?.email || 'Unknown')}</div>
        <div class="mb-0"><strong>Max Participants:</strong> ${escapeHtml(event.max_participants || 0)}</div>
    `);
}

function fillEventSelectOptions(hobbySelectId = 'editEventHobby', locationSelectId = 'editEventLocation') {
    const hobbySelect = document.getElementById(hobbySelectId);
    const locationSelect = document.getElementById(locationSelectId);

    if (!hobbySelect || !locationSelect) return;

    hobbySelect.innerHTML = hobbiesCache.map((h) => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('');
    locationSelect.innerHTML = locationsCache.map((l) => `<option value="${l.id}">${escapeHtml(l.name || `${l.city} - ${l.address}`)}</option>`).join('');
}

function fillHobbyOptions(selectId) {
    const hobbySelect = document.getElementById(selectId);
    if (!hobbySelect) return;
    hobbySelect.innerHTML = hobbiesCache.map((h) => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('');
}

function openCreateEvent() {
    if (!hobbiesCache.length || !locationsCache.length) {
        showMessage('You need at least one hobby and one location to create an event.', 'danger');
        return;
    }

    fillHobbyOptions('createEventHobby');

    document.getElementById('createEventTitle').value = '';
    document.getElementById('createEventDescription').value = '';
    document.getElementById('createEventMaxParticipants').value = '10';
    document.getElementById('createEventLocation').value = locationsCache[0]?.name || locationsCache[0]?.city || '';

    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    document.getElementById('createEventDateTime').value = toDateTimeLocalValue(now.toISOString());

    createEventModal.show();
}

function openEditEvent(eventId) {
    const event = eventsCache.find((e) => e.id === eventId);
    if (!event) return;

    fillEventSelectOptions();

    document.getElementById('editEventId').value = event.id;
    document.getElementById('editEventTitle').value = event.title || '';
    document.getElementById('editEventDescription').value = event.description || '';
    document.getElementById('editEventDateTime').value = toDateTimeLocalValue(event.event_date);
    document.getElementById('editEventMaxParticipants').value = event.max_participants || 1;
    document.getElementById('editEventHobby').value = event.hobby_id || '';
    document.getElementById('editEventLocation').value = event.location_id || '';
    editEventModal.show();
}

async function deleteEvent(eventId) {
    const event = eventsCache.find((e) => e.id === eventId);
    if (!event) return;

    const confirmed = window.confirm(`Delete event "${event.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
        await apiService.deleteEvent(eventId);
        showMessage('Event deleted successfully.');
        await loadEvents();
    } catch (error) {
        console.error('Failed to delete event:', error);
        showMessage(`Failed to delete event: ${error.message}`, 'danger');
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

function setupAdminCrudHandlers() {
    document.getElementById('openCreateHobbyBtn')?.addEventListener('click', openCreateHobby);
    document.getElementById('openCreateEventBtn')?.addEventListener('click', openCreateEvent);
    document.getElementById('refreshHobbiesBtn')?.addEventListener('click', loadHobbies);
    document.getElementById('refreshEventsBtn')?.addEventListener('click', loadEvents);

    document.getElementById('createHobbyBtn')?.addEventListener('click', async () => {
        const name = document.getElementById('createHobbyName').value.trim();
        const description = document.getElementById('createHobbyDescription').value.trim();
        const imageUrl = document.getElementById('createHobbyImageUrl').value.trim();

        if (!name) {
            showMessage('Hobby name is required.', 'danger');
            return;
        }

        try {
            await apiService.createHobby({
                name,
                description: description || null,
                image_url: imageUrl || null
            });

            createHobbyModal.hide();
            showMessage('Hobby created successfully.');
            await Promise.all([loadHobbies(), loadEvents()]);
        } catch (error) {
            console.error('Failed to create hobby:', error);
            showMessage(`Failed to create hobby: ${error.message}`, 'danger');
        }
    });

    document.getElementById('adminHobbiesTbody')?.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const hobbyId = target.getAttribute('data-hobby-id');
        if (!hobbyId) return;

        if (target.classList.contains('view-hobby-btn')) {
            openViewHobby(hobbyId);
        } else if (target.classList.contains('edit-hobby-btn')) {
            openEditHobby(hobbyId);
        } else if (target.classList.contains('delete-hobby-btn')) {
            deleteHobby(hobbyId);
        }
    });

    document.getElementById('adminEventsTbody')?.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const eventId = target.getAttribute('data-event-id');
        if (!eventId) return;

        if (target.classList.contains('view-event-btn')) {
            openViewEvent(eventId);
        } else if (target.classList.contains('edit-event-btn')) {
            openEditEvent(eventId);
        } else if (target.classList.contains('delete-event-btn')) {
            deleteEvent(eventId);
        }
    });

    document.getElementById('createEventBtn')?.addEventListener('click', async () => {
        const title = document.getElementById('createEventTitle').value.trim();
        const description = document.getElementById('createEventDescription').value.trim();
        const eventDateTime = document.getElementById('createEventDateTime').value;
        const maxParticipants = parseInt(document.getElementById('createEventMaxParticipants').value, 10);
        const hobbyId = document.getElementById('createEventHobby').value;
        const locationText = document.getElementById('createEventLocation').value.trim();

        if (!title || !eventDateTime || !hobbyId || !locationText || !Number.isFinite(maxParticipants) || maxParticipants < 1) {
            showMessage('Please fill all event fields correctly.', 'danger');
            return;
        }

        try {
            const locationObj = await apiService.getOrFindLocation(locationText);
            if (!locationObj?.id) {
                showMessage('Location not found. Please type a valid location name or city.', 'danger');
                return;
            }

            await apiService.createAdminEvent({
                title,
                description: description || null,
                event_date: new Date(eventDateTime).toISOString(),
                max_participants: maxParticipants,
                hobby_id: hobbyId,
                location_id: locationObj.id,
                host_id: currentUser.id
            });

            createEventModal.hide();
            showMessage('Event created successfully.');
            await loadEvents();
        } catch (error) {
            console.error('Failed to create event:', error);
            showMessage(`Failed to create event: ${error.message}`, 'danger');
        }
    });

    document.getElementById('saveHobbyBtn')?.addEventListener('click', async () => {
        const hobbyId = document.getElementById('editHobbyId').value;
        const name = document.getElementById('editHobbyName').value.trim();
        const description = document.getElementById('editHobbyDescription').value.trim();
        const imageUrl = document.getElementById('editHobbyImageUrl').value.trim();

        if (!name) {
            showMessage('Hobby name is required.', 'danger');
            return;
        }

        try {
            await apiService.updateHobby(hobbyId, {
                name,
                description,
                image_url: imageUrl || null
            });
            editHobbyModal.hide();
            showMessage('Hobby updated successfully.');
            await Promise.all([loadHobbies(), loadEvents()]);
        } catch (error) {
            console.error('Failed to update hobby:', error);
            showMessage(`Failed to update hobby: ${error.message}`, 'danger');
        }
    });

    document.getElementById('saveEventBtn')?.addEventListener('click', async () => {
        const eventId = document.getElementById('editEventId').value;
        const title = document.getElementById('editEventTitle').value.trim();
        const description = document.getElementById('editEventDescription').value.trim();
        const eventDateTime = document.getElementById('editEventDateTime').value;
        const maxParticipants = parseInt(document.getElementById('editEventMaxParticipants').value, 10);
        const hobbyId = document.getElementById('editEventHobby').value;
        const locationId = document.getElementById('editEventLocation').value;

        if (!title || !eventDateTime || !hobbyId || !locationId || !Number.isFinite(maxParticipants) || maxParticipants < 1) {
            showMessage('Please fill all event fields correctly.', 'danger');
            return;
        }

        try {
            await apiService.updateEvent(eventId, {
                title,
                description,
                event_date: new Date(eventDateTime).toISOString(),
                max_participants: maxParticipants,
                hobby_id: hobbyId,
                location_id: locationId
            });
            editEventModal.hide();
            showMessage('Event updated successfully.');
            await loadEvents();
        } catch (error) {
            console.error('Failed to update event:', error);
            showMessage(`Failed to update event: ${error.message}`, 'danger');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Admin');

    adminViewModal = new bootstrap.Modal(document.getElementById('adminViewModal'));
    createHobbyModal = new bootstrap.Modal(document.getElementById('createHobbyModal'));
    createEventModal = new bootstrap.Modal(document.getElementById('createEventModal'));
    editHobbyModal = new bootstrap.Modal(document.getElementById('editHobbyModal'));
    editEventModal = new bootstrap.Modal(document.getElementById('editEventModal'));

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

    await Promise.all([loadUsers(), loadHobbies(), loadEvents(), loadLocations()]);
    setupAdminCrudHandlers();
});
