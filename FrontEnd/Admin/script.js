// Navigation
function navigateTo(sectionId) {
    const menuItems = document.querySelectorAll('.menu-item:not(#logout-btn)');
    const sections = document.querySelectorAll('.section');
    menuItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'dashboard') initDashboard();
    if (sectionId === 'user-management') { updateCounts(); showTable('all'); }
    if (sectionId === 'plan-management') { updatePlanCounts(); showPlansTable('all'); }
    if (sectionId === 'category-management') { updateCategoryCounts(); populateCategoriesTable(); }
    if (sectionId === 'transactions') { updateStats(); populateTransactionsTable(); }
    if (sectionId === 'support') { updateTicketCounts(); populateTicketsTable(); }
    if (sectionId === 'analysis') initCharts();
}

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item:not(#logout-btn)');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.getAttribute('data-section'));
        });
    });
}

// Sidebar Toggle
function setupSidebarToggle() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
    });
}

// Logout
function setupLogout() {
    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        const loadingOverlay = document.createElement("div");
        loadingOverlay.classList.add("position-fixed", "top-0", "start-0", "w-100", "h-100", "bg-dark", "bg-opacity-50", "d-flex", "justify-content-center", "align-items-center", "text-white", "fs-4");
        loadingOverlay.innerHTML = "Logging out...";
        document.body.appendChild(loadingOverlay);
        setTimeout(() => {
            sessionStorage.removeItem("accessToken");
            document.body.removeChild(loadingOverlay);
            window.location.href = "login.html";
        }, 2000);
    });
}

// Profile Setup
function setupProfile() {
    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const name = document.getElementById('admin-name').value;
        const phone = document.getElementById('admin-phone').value;
        if (name && phone.match(/^[0-9]{10}$/)) {
            const response = await fetchWithAuth('http://localhost:8083/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });
            if (response && response.ok) {
                localStorage.setItem('adminProfile', JSON.stringify({ name, phone }));
                alert('Profile updated successfully!');
                bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
            } else {
                alert('Failed to update profile');
            }
        } else {
            alert('Please enter valid name and 10-digit phone number');
        }
    });
    const storedProfile = localStorage.getItem('adminProfile');
    if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        document.getElementById('admin-name').value = profile.name;
        document.getElementById('admin-phone').value = profile.phone;
    }
}

// Fetch with Authentication
async function fetchWithAuth(url, options = {}) {
    const accessToken = sessionStorage.getItem('accessToken');
    options.headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        ...options.headers
    };
    const response = await fetch(url, options);
    if (response.status === 401) {
        alert('Session expired. Please log in again.');
        sessionStorage.removeItem('accessToken');
        window.location.href = 'login.html';
        return null;
    }
    return response;
}

// Data Fetching Functions
async function fetchUsers() {
    try {
        const response = await fetchWithAuth('http://localhost:8083/api/user');
        const data = response ? await response.json() : [];
        console.log('Fetched Users:', data);
        return data.map(u => {
            const transactionDate = u.transactionDate ? new Date(u.transactionDate) : new Date();
            const expiryDate = new Date(transactionDate);
            expiryDate.setDate(transactionDate.getDate() + 30);
            return {
                name: u.name || 'Unknown',
                phone: u.phoneNumber || 'N/A',
                plan: u.planName || 'N/A',
                amount: u.amount || 0,
                status: u.status ? u.status.toUpperCase() : 'unknown',
                expiry: expiryDate.toISOString().split('T')[0],
                lastTransaction: u.transactionDate || 'N/A'
            };
        });
    } catch (error) {
        console.error('Fetch Users Failed:', error);
        return [];
    }
}

async function fetchPlans() {
    try {
        const response = await fetchWithAuth('http://localhost:8083/api/plans');
        const data = response ? await response.json() : [];
        console.log('Fetched Plans:', data);
        return data.map(p => ({
            planId: p.planId || 'N/A',
            name: p.planName || 'Unknown',
            price: p.price || 0,
            data: p.data || 'N/A',
            validity: p.validity || 'N/A',
            feature: p.feature || 'No additional features',
            status: p.status ? p.status.toLowerCase() : 'unknown',
            planType: p.planType || 'N/A'
        }));
    } catch (error) {
        console.error('Fetch Plans Failed:', error);
        return [];
    }
}

async function fetchCategories() {
    try {
        const response = await fetchWithAuth('http://localhost:8083/api/categories');
        const data = response ? await response.json() : [];
        console.log('Fetched Categories:', data);
        return data.map(c => ({
            name: c.name || 'Unknown',
            status: c.status ? c.status.toLowerCase() : 'active'
        }));
    } catch (error) {
        console.error('Fetch Categories Failed:', error);
        return [];
    }
}

async function fetchTransactions() {
    try {
        const response = await fetchWithAuth('http://localhost:8083/api/transactions');
        const data = response ? await response.json() : [];
        console.log('Fetched Transactions:', data);
        return data.map(t => ({
            id: t.transactionId || 'N/A',
            customer: t.customer || 'Unknown',
            date: t.dateTime || 'N/A',
            amount: t.amount || 0,
            plan: t.plan || 'N/A',
            method: t.paymentMethod || 'N/A',
            status: t.status ? t.status.toUpperCase() : 'UNKNOWN'
        }));
    } catch (error) {
        console.error('Fetch Transactions Failed:', error);
        return [];
    }
}

async function fetchTickets() {
    try {
        const response = await fetchWithAuth('http://localhost:8083/api/support');
        const data = response ? await response.json() : [];
        console.log('Fetched Tickets:', data);
        return data.map(t => ({
            id: t.ticketId || 'N/A',
            customer: t.customerName || 'Unknown',
            subject: t.description || 'N/A',
            created: t.createdDate || 'N/A',
            status: t.status ? t.status.toUpperCase() : 'PENDING'
        }));
    } catch (error) {
        console.error('Fetch Tickets Failed:', error);
        return [];
    }
}

// Global Data
let users = [];
let plans = [];
let categories = [];
let transactions = [];
let tickets = [];

// Dashboard Initialization
async function initDashboard() {
    console.log('Dashboard Users:', users);
    console.log('Dashboard Transactions:', transactions);

    document.getElementById('active-users').textContent = users.filter(u => u.status === 'ACTIVE').length || 0;
    document.getElementById('inactive-users').textContent = users.filter(u => u.status === 'INACTIVE' || u.status === 'BLOCKED').length || 0;
    document.getElementById('expiring-users').textContent = users.filter(u => u.expiry && new Date(u.expiry) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length || 0;
    document.getElementById('total-income').textContent = `₹${transactions.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? parseFloat(t.amount) : 0), 0).toFixed(2)}`;

    const paymentList = document.getElementById('payment-list');
    console.log('Rendering Payments:', transactions.slice(0, 5));
    paymentList.innerHTML = transactions.slice(0, 5).map(t => `
        <tr>
            <td>${t.customer}</td>
            <td>${t.plan}</td>
            <td>₹${t.amount}</td>
            <td><span class="status-badge status-${t.status.toLowerCase()}">${t.status}</span></td>
            <td><button class="action-btn view-transaction" data-id="${t.id}">View</button></td>
        </tr>
    `).join('') || '<tr><td colspan="5">No recent payments</td></tr>';

    const studentsList = document.getElementById('students-list');
    console.log('Rendering New Users:', users.slice(0, 5));
    studentsList.innerHTML = users.slice(0, 5).map(u => `
        <tr>
            <td><div class="icon-btn"><i class="fas fa-user"></i></div></td>
            <td>${u.name}</td>
            <td><i class="fas fa-edit text-primary edit-status" style="cursor: pointer;" data-phone="${u.phone}"></i></td>
        </tr>
    `).join('') || '<tr><td colspan="3">No new users</td></tr>';

    document.getElementById('add-new-btn').addEventListener('click', () => navigateTo('plan-management'));
}

// User Management
async function updateCounts() {
    console.log('User Management Users:', users);
    document.getElementById('active-count').textContent = users.filter(u => u.status === 'ACTIVE').length || 0;
    document.getElementById('expiry-count').textContent = users.filter(u => u.status==='EXPIRING').length || 0;
    document.getElementById('inactive-count').textContent = users.filter(u => u.status === 'INACTIVE' || u.status === 'BLOCKED').length || 0;
}

function showTable(status) {
    console.log('Showing Table with Status:', status);
    console.log('Users Available:', users);
    document.getElementById('statusFilter').value = status;
    document.getElementById('table-title').textContent = status === 'active' ? 'Active Users' : status === 'expiring' ? 'Users Expiring Soon' : status === 'inactive' ? 'Inactive Users' : status === 'blocked' ? 'Blocked Users' : 'All Users';
    const filteredUsers = status === 'all' ? users : status === 'expiring' ? users.filter(u => u.expiry && new Date(u.expiry) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : users.filter(u => u.status.toLowerCase() === status.toLowerCase());
    console.log('Filtered Users:', filteredUsers);
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = filteredUsers.map(u => {
        const statusClass = u.status === 'success' ? 'status-active' : u.status === 'failed' ? 'status-inactive' : u.status === 'blocked' ? 'status-danger' : 'status-warning';
        return `
            <tr>
                <td>${u.name}</td>
                <td>${u.phone}</td>
                <td>${u.plan}</td>
                <td>${u.expiry}</td>
                <td>${u.lastTransaction}</td>
                <td>₹${u.amount}</td>
                <td><span class="status-badge ${statusClass}">${u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span></td>
                <td><button class="btn btn-sm btn-primary edit-status" data-phone="${u.phone}"><i class="fas fa-edit"></i></button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="8">No users found</td></tr>';
    document.getElementById('table-container').style.display = 'block';
}

function setupUserManagement() {
    document.getElementById('searchUser').addEventListener('input', (e) => {
        const value = e.target.value;
        const userResult = document.getElementById('userResult');
        const errorMessage = document.getElementById('errorMessage');
        userResult.style.display = 'none';
        errorMessage.style.display = 'none';
        if (value.length >= 3) {
            const user = users.find(u => u.phone === value || u.name.toLowerCase() === value.toLowerCase());
            if (user) {
                userResult.style.display = 'block';
                document.getElementById('userDetails').textContent = `User Found: ${user.name} (${user.phone}) - Current Status: ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`;
                document.getElementById('updateStatus').value = user.status;
                document.getElementById('updateUserStatusBtn').onclick = async () => {
                    const response = await fetchWithAuth("http://localhost:8083/api/user", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            status: document.getElementById("updateStatus").value.trim(),
                            number: document.getElementById("searchUser").value
                        })
                    });
                    if (response && response.ok) {
                        user.status = document.getElementById('updateStatus').value.toLowerCase();
                        await updateCounts();
                        showTable(document.getElementById('statusFilter').value);
                        bootstrap.Modal.getInstance(document.getElementById('updateUserModal')).hide();
                    } else {
                        alert('Failed to update user status');
                    }
                };
            } else {
                errorMessage.style.display = 'block';
            }
        }
    });

    document.getElementById('export-btn-user').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - User Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        doc.text(`Filter: ${document.getElementById('statusFilter').options[document.getElementById('statusFilter').selectedIndex].text}`, 10, 40);
        const tableData = users.filter(u => document.getElementById('statusFilter').value === 'all' || u.status.toLowerCase() === document.getElementById('statusFilter').value.toLowerCase())
            .map(u => [u.name, u.phone, u.plan, u.expiry, u.lastTransaction, u.amount, u.status.charAt(0).toUpperCase() + u.status.slice(1)]);
        doc.autoTable({
            startY: 50,
            head: [['Name', 'Phone', 'Plan', 'Expiry', 'Last Transaction', 'Amount', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3, textColor: [33, 37, 41] },
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { top: 50 }
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('© RechargeFlow', 10, doc.internal.pageSize.height - 10);
        doc.save(`RechargeFlow_User_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    document.getElementById('table-body').addEventListener('click', (e) => {
        if (e.target.closest('.edit-status')) {
            const phone = e.target.closest('.edit-status').dataset.phone;
            const user = users.find(u => u.phone === phone);
            document.getElementById('searchUser').value = user.phone;
            const modal = new bootstrap.Modal(document.getElementById('updateUserModal'));
            modal.show();
        }
    });

    document.getElementById('statusFilter').addEventListener('change', (e) => showTable(e.target.value));
}

// Plan Management
async function updatePlanCounts() {
    console.log('Plan Management Plans:', plans);
    document.getElementById('active-plan-count').textContent = plans.filter(p => p.status === 'active').length || 0;
    document.getElementById('subscription-count').textContent = plans.reduce((sum, p) => sum + (p.status === 'active' ? 300 : 0), 0) || 0;
    const popularPlan = plans.reduce((max, p) => (p.subscribers || 0) > (max.subscribers || 0) ? p : max, plans[0] || { name: '-' });
    document.getElementById('popular-plan').textContent = popularPlan.name;
}

function showPlansTable(status) {
    console.log('Showing Plans Table with Status:', status);
    console.log('Plans Available:', plans);
    document.getElementById('statusFilterPlan').value = status;
    document.getElementById('table-title1').textContent = status === 'active' ? 'Active Plans' : status === 'inactive' ? 'Inactive Plans' : 'All Plans';
    const filteredPlans = status === 'all' ? plans : plans.filter(p => p.status.toLowerCase() === status.toLowerCase());
    console.log('Filtered Plans:', filteredPlans);
    const tableBody = document.getElementById('plans-table');
    tableBody.innerHTML = filteredPlans.map(p => {
        const statusClass = p.status === 'active' ? 'status-active' : 'status-inactive';
        return `
            <tr>
                <td>${p.planId}</td>
                <td><strong>${p.name}</strong></td>
                <td>₹${p.price}</td>
                <td>${p.data}</td>
                <td>${p.validity} days</td>
                <td>${p.feature}</td>
                <td><span class="status-badge ${statusClass}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary me-1 edit-plan" data-name="${p.name}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-plan" data-id="${p.planId}" data-name="${p.name}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="8">No plans found</td></tr>';
}

async function populateCategoryDropdown() {
    console.log('Populating Category Dropdown with:', categories);
    const addDropdown = document.getElementById('planCategory');
    const editDropdown = document.getElementById('editPlanCategory');
    addDropdown.innerHTML = '<option value="">Select Category</option>' +
        categories.filter(c => c.status === 'active').map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    editDropdown.innerHTML = '<option value="">Select Category</option>' +
        categories.filter(c => c.status === 'active').map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function setupPlanManagement() {
    document.getElementById('savePlanBtn').addEventListener('click', async () => {
        const planId = document.getElementById('planId').value;
        const name = document.getElementById('planName').value;
        const price = document.getElementById('planPrice').value;
        const data = document.getElementById('planData').value.replace('GB', '').trim();
        const validity = document.getElementById('planValidity').value;
        const category = document.getElementById('planCategory').value;
        const features = document.getElementById('planFeatures').value || "No additional features";
        const status = document.getElementById('planStatus').value;
        if (planId && name && price && data && validity && category) {
            const response = await fetchWithAuth("http://localhost:8083/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    planName: name,
                    planType: category, // Still using category as planType
                    price,
                    data,
                    validity,
                    feature: features,
                    status: status.toUpperCase()
                })
            });
            if (response && response.ok) {
                plans.push({ planId, name, price, data, validity, planType: category, feature: features, status: status.toLowerCase() });
                await updatePlanCounts();
                showPlansTable("all");
                bootstrap.Modal.getInstance(document.getElementById('addPlanModal')).hide();
            } else {
                alert('Failed to add plan');
            }
        } else {
            alert('Please fill all required fields');
        }
    });

    document.getElementById('export-btn-plan').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - Plan Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        doc.text(`Filter: ${document.getElementById('statusFilterPlan').options[document.getElementById('statusFilterPlan').selectedIndex].text}`, 10, 40);
        const tableData = plans.filter(p => document.getElementById('statusFilterPlan').value === 'all' || p.status.toLowerCase() === document.getElementById('statusFilterPlan').value.toLowerCase())
            .map(p => [p.planId, p.name, `₹${p.price}`, `${p.data}`, `${p.validity} days`, p.feature, p.status.charAt(0).toUpperCase() + p.status.slice(1)]);
        doc.autoTable({
            startY: 50,
            head: [['Plan ID', 'Plan Name', 'Price', 'Data', 'Validity', 'Features', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3, textColor: [33, 37, 41] },
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { top: 50 }
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('© RechargeFlow', 10, doc.internal.pageSize.height - 10);
        doc.save(`RechargeFlow_Plan_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    document.getElementById('plans-table').addEventListener('click', async (e) => {
        if (e.target.closest('.edit-plan')) {
            const name = e.target.closest('.edit-plan').dataset.name;
            const plan = plans.find(p => p.name === name);
            document.getElementById('editPlanId').value = plan.planId;
            document.getElementById('editPlanName').value = plan.name;
            document.getElementById('editPlanPrice').value = plan.price;
            document.getElementById('editPlanData').value = plan.data;
            document.getElementById('editPlanValidity').value = plan.validity;
            document.getElementById('editPlanCategory').value = plan.planType;
            document.getElementById('editPlanFeatures').value = plan.feature;
            document.getElementById('editPlanStatus').value = plan.status;
            const modal = new bootstrap.Modal(document.getElementById('editPlanModal'));
            modal.show();
            document.getElementById('saveEditPlanBtn').onclick = async () => {
                const response = await fetchWithAuth("http://localhost:8083/api/plans", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        planId: document.getElementById('editPlanId').value,
                        planName: document.getElementById('editPlanName').value,
                        planType: document.getElementById('editPlanCategory').value,
                        price: document.getElementById('editPlanPrice').value,
                        data: document.getElementById('editPlanData').value,
                        validity: document.getElementById('editPlanValidity').value,
                        feature: document.getElementById('editPlanFeatures').value || "No additional features",
                        status: document.getElementById('editPlanStatus').value.toUpperCase()
                    })
                });
                if (response && response.ok) {
                    plan.planId = document.getElementById('editPlanId').value;
                    plan.name = document.getElementById('editPlanName').value;
                    plan.price = document.getElementById('editPlanPrice').value;
                    plan.data = document.getElementById('editPlanData').value;
                    plan.validity = document.getElementById('editPlanValidity').value;
                    plan.planType = document.getElementById('editPlanCategory').value;
                    plan.feature = document.getElementById('editPlanFeatures').value || "No additional features";
                    plan.status = document.getElementById('editPlanStatus').value.toLowerCase();
                    await updatePlanCounts();
                    showPlansTable("all");
                    modal.hide();
                } else {
                    alert('Failed to update plan');
                }
            };
        }
        if (e.target.closest('.delete-plan')) {
            const id = e.target.closest('.delete-plan').dataset.id;
            const name = e.target.closest('.delete-plan').dataset.name;
            if (confirm(`Are you sure you want to delete the plan "${name}"?`)) {
                const response = await fetchWithAuth("http://localhost:8083/api/plans", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: parseInt(id) })
                });
                if (response && response.ok) {
                    plans = plans.filter(p => p.planId !== id);
                    await updatePlanCounts();
                    showPlansTable("all");
                } else {
                    alert('Failed to delete plan');
                }
            }
        }
    });

    document.getElementById('statusFilterPlan').addEventListener('change', (e) => showPlansTable(e.target.value));
}

// Category Management
async function updateCategoryCounts() {
    console.log('Category Management Categories:', categories);
    document.getElementById('active-category-count').textContent = categories.filter(c => c.status === 'active').length || 0;
    document.getElementById('inactive-category-count').textContent = categories.filter(c => c.status === 'inactive').length || 0;
}

async function populateCategoriesTable() {
    console.log('Populating Categories Table with:', categories);
    const tableBody = document.getElementById('categories-table');
    tableBody.innerHTML = categories.map(c => {
        const statusClass = c.status === 'active' ? 'status-active' : 'status-inactive';
        return `
            <tr>
                <td>${c.name}</td>
                <td><span class="status-badge ${statusClass}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary me-1 edit-category" data-name="${c.name}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-category" data-name="${c.name}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="3">No categories found</td></tr>';

    document.getElementById('searchCategory').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm));
        console.log('Filtered Categories for Search:', filteredCategories);
        tableBody.innerHTML = filteredCategories.map(c => {
            const statusClass = c.status === 'active' ? 'status-active' : 'status-inactive';
            return `
                <tr>
                    <td>${c.name}</td>
                    <td><span class="status-badge ${statusClass}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1 edit-category" data-name="${c.name}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-category" data-name="${c.name}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="3">No categories found</td></tr>';
    });
}

function setupCategoryManagement() {
    document.getElementById('saveCategoryBtn').addEventListener('click', async () => {
        const name = document.getElementById('categoryName').value;
        const status = document.getElementById('categoryStatus').value;
        if (name) {
            const response = await fetchWithAuth('http://localhost:8083/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, status: status.toUpperCase() })
            });
            if (response && response.ok) {
                categories.push({ name, status: status.toLowerCase() });
                await updateCategoryCounts();
                populateCategoriesTable();
                await populateCategoryDropdown();
                bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
            } else {
                alert('Failed to add category');
            }
        } else {
            alert('Please enter a category name');
        }
    });

    document.getElementById('export-btn-category').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - Category Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        const tableData = categories.map(c => [c.name, c.status.charAt(0).toUpperCase() + c.status.slice(1)]);
        doc.autoTable({
            startY: 40,
            head: [['Category Name', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3, textColor: [33, 37, 41] },
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { top: 40 }
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('© RechargeFlow', 10, doc.internal.pageSize.height - 10);
        doc.save(`RechargeFlow_Category_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    document.getElementById('categories-table').addEventListener('click', async (e) => {
        if (e.target.closest('.edit-category')) {
            const name = e.target.closest('.edit-category').dataset.name;
            const category = categories.find(c => c.name === name);
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryStatus').value = category.status;
            const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
            modal.show();
            document.getElementById('saveCategoryBtn').onclick = async () => {
                const newName = document.getElementById('categoryName').value;
                const newStatus = document.getElementById('categoryStatus').value;
                const response = await fetchWithAuth('http://localhost:8083/api/categories', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName, status: newStatus.toUpperCase() })
                });
                if (response && response.ok) {
                    category.name = newName;
                    category.status = newStatus.toLowerCase();
                    await updateCategoryCounts();
                    populateCategoriesTable();
                    await populateCategoryDropdown();
                    modal.hide();
                } else {
                    alert('Failed to update category');
                }
            };
        }
        if (e.target.closest('.delete-category')) {
            const name = e.target.closest('.delete-category').dataset.name;
            if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
                const response = await fetchWithAuth('http://localhost:8083/api/categories', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                if (response && response.ok) {
                    categories = categories.filter(c => c.name !== name);
                    await updateCategoryCounts();
                    populateCategoriesTable();
                    await populateCategoryDropdown();
                } else {
                    alert('Failed to delete category');
                }
            }
        }
    });
}

// Transactions
async function updateStats() {
    console.log('Transactions Stats:', transactions);
    const thisMonth = transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth() && new Date(t.date).getFullYear() === new Date().getFullYear());
    document.getElementById('total-revenue').textContent = `₹${thisMonth.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? parseFloat(t.amount) : 0), 0).toFixed(2)}`;
    document.getElementById('transaction-count').textContent = thisMonth.length || 0;
    document.getElementById('avg-transaction').textContent = `₹${thisMonth.length ? (thisMonth.reduce((sum, t) => sum + parseFloat(t.amount), 0) / thisMonth.length).toFixed(2) : 0}`;
    document.getElementById('growth-rate').textContent = 'N/A';
}

async function populateTransactionsTable(page = 1) {
    console.log('Populating Transactions Table with:', transactions);
    const recordsPerPage = parseInt(document.getElementById('recordsPerPage').value);
    const dateRange = document.getElementById('dateRange').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    let filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        const now = new Date();
        if (dateRange === 'today') return date.toDateString() === now.toDateString();
        if (dateRange === 'yesterday') return date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
        if (dateRange === 'last7days') return date >= new Date(now.setDate(now.getDate() - 7));
        if (dateRange === 'last30days') return date >= new Date(now.setDate(now.getDate() - 30));
        if (dateRange === 'thisMonth') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (dateRange === 'lastMonth') return date.getMonth() === now.getMonth() - 1 && date.getFullYear() === now.getFullYear();
        return true;
    });

    if (paymentStatus !== 'all') filteredTransactions = filteredTransactions.filter(t => t.status.toUpperCase() === paymentStatus.toUpperCase());
    if (paymentMethod !== 'all') filteredTransactions = filteredTransactions.filter(t => t.method.toUpperCase() === paymentMethod.toUpperCase());

    console.log('Filtered Transactions:', filteredTransactions);

    const totalRecords = filteredTransactions.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const start = (page - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedTransactions = filteredTransactions.slice(start, end);

    const tableBody = document.getElementById('transactions-table');
    tableBody.innerHTML = paginatedTransactions.map(t => {
        const statusClass = t.status === 'SUCCESS' ? 'status-active' : t.status === 'PENDING' ? 'status-warning' : t.status === 'FAILED' ? 'status-danger' : 'status-info';
        return `
            <tr>
                <td>${t.id}</td>
                <td>${t.customer}</td>
                <td>${t.date}</td>
                <td>₹${t.amount}</td>
                <td>${t.plan}</td>
                <td>${t.method}</td>
                <td><span class="status-badge ${statusClass}">${t.status}</span></td>
                <td><button class="btn btn-sm btn-primary view-transaction" data-id="${t.id}"><i class="fas fa-eye"></i></button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="8">No transactions found</td></tr>';

    document.getElementById('showing-records').textContent = `${start + 1}-${Math.min(end, totalRecords)}`;
    document.getElementById('total-records').textContent = totalRecords;

    const paginationButtons = document.getElementById('pagination-buttons');
    paginationButtons.innerHTML = `
        <button class="btn btn-sm btn-outline-primary ${page === 1 ? 'disabled' : ''}" onclick="populateTransactionsTable(${page - 1})"><i class="fas fa-chevron-left"></i></button>
        <span>Page ${page} of ${totalPages}</span>
        <button class="btn btn-sm btn-outline-primary ${page === totalPages ? 'disabled' : ''}" onclick="populateTransactionsTable(${page + 1})"><i class="fas fa-chevron-right"></i></button>
    `;
}

function setupTransactions() {
    document.getElementById('apply-filters').addEventListener('click', () => populateTransactionsTable());
    document.getElementById('recordsPerPage').addEventListener('change', () => populateTransactionsTable());
    document.getElementById('export-btn-transaction').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - Transaction Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        const tableData = transactions.map(t => [t.id, t.customer, t.date, `₹${t.amount}`, t.plan, t.method, t.status]);
        doc.autoTable({
            startY: 40,
            head: [['Transaction ID', 'Customer', 'Date & Time', 'Amount', 'Plan', 'Payment Method', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3, textColor: [33, 37, 41] },
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { top: 40 }
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('© RechargeFlow', 10, doc.internal.pageSize.height - 10);
        doc.save(`RechargeFlow_Transaction_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    document.getElementById('transactions-table').addEventListener('click', async (e) => {
        if (e.target.closest('.view-transaction')) {
            const id = e.target.closest('.view-transaction').dataset.id;
            const transaction = transactions.find(t => t.id === id);
            document.getElementById('transactionDetailsContent').innerHTML = `
                <p><strong>Transaction ID:</strong> ${transaction.id}</p>
                <p><strong>Customer:</strong> ${transaction.customer}</p>
                <p><strong>Date & Time:</strong> ${transaction.date}</p>
                <p><strong>Amount:</strong> ₹${transaction.amount}</p>
                <p><strong>Plan:</strong> ${transaction.plan}</p>
                <p><strong>Payment Method:</strong> ${transaction.method}</p>
                <p><strong>Status:</strong> ${transaction.status}</p>
            `;
            const modal = new bootstrap.Modal(document.getElementById('transactionDetailsModal'));
            modal.show();
        }
    });
}

// Support
async function updateTicketCounts() {
    console.log('Support Tickets:', tickets);
    document.getElementById('total-tickets').textContent = tickets.length || 0;
    document.getElementById('pending-tickets').textContent = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length || 0;
    document.getElementById('processing-tickets').textContent = tickets.filter(t => t.status === 'PROCESSING').length || 0;
    document.getElementById('resolved-tickets').textContent = tickets.filter(t => t.status === 'RESOLVED').length || 0;
}
function filterTickets() {
    const statusFilter = document.getElementById('statusFilterSupport').value;
    const searchQuery = document.getElementById('searchTicketId').value.toLowerCase();

    return tickets.filter(t => {
        const matchesStatus = statusFilter === 'all' || t.status.toUpperCase() === statusFilter.toUpperCase();
        const ticketIdStr = t.id ? t.id.toString().toLowerCase() : '';
        const matchesSearch = ticketIdStr.includes(searchQuery) ||
            (t.customer || '').toLowerCase().includes(searchQuery) ||
            (t.subject || '').toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });
}

async function populateTicketsTable(page = 1) {
    console.log('Populating Tickets Table with:', tickets);
    const filteredTickets = filterTickets();
    console.log('Filtered Tickets:', filteredTickets);
    const recordsPerPage = 10;
    const totalRecords = filteredTickets.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    page = Math.min(page, totalPages || 1);
    const start = (page - 1) * recordsPerPage;
    const end = Math.min(start + recordsPerPage, totalRecords);
    const paginatedTickets = filteredTickets.slice(start, end);

    const tableBody = document.getElementById('tickets-table');
    tableBody.innerHTML = paginatedTickets.map(t => {
        const statusClass = t.status === 'RESOLVED' ? 'status-active' :
            (t.status === 'OPEN' || t.status === 'PENDING') ? 'status-warning' :
                t.status === 'PROCESSING' ? 'status-info' : 'status-danger';
        return `
            <tr>
                <td>${t.id || 'N/A'}</td>
                <td>${t.customer || 'Unknown'}</td>
                <td>${t.subject || 'N/A'}</td>
                <td>${t.created || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${t.status}</span></td>
                <td><button class="btn btn-sm btn-primary view-ticket" data-id="${t.id}"><i class="fas fa-eye"></i></button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6">No tickets found</td></tr>';

    document.getElementById('showing-records-support').textContent = `${start + 1}-${Math.min(end, totalRecords)}`;
    document.getElementById('total-records-support').textContent = totalRecords;

    const paginationButtons = document.getElementById('pagination-buttons-support');
    paginationButtons.innerHTML = `
        <button class="btn btn-sm btn-outline-primary ${page === 1 ? 'disabled' : ''}" onclick="populateTicketsTable(${page - 1})"><i class="fas fa-chevron-left"></i></button>
        <span>Page ${page} of ${totalPages}</span>
        <button class="btn btn-sm btn-outline-primary ${page === totalPages ? 'disabled' : ''}" onclick="populateTicketsTable(${page + 1})"><i class="fas fa-chevron-right"></i></button>
    `;
}

function setupSupport() {
    document.getElementById('searchTicketId').addEventListener('input', (e) => {
        const value = e.target.value;
        const ticketResult = document.getElementById('ticketResult');
        const errorMessage = document.getElementById('errorMessageTicket');
        ticketResult.style.display = 'none';
        errorMessage.style.display = 'none';
        if (value.length >= 3) {
            const ticket = tickets.find(t => t.id === value);
            if (ticket) {
                ticketResult.style.display = 'block';
                document.getElementById('ticketDetails').textContent = `Ticket Found: ${ticket.subject} (${ticket.customer}) - Current Status: ${ticket.status}`;
                document.getElementById('updateTicketStatus').value = ticket.status.toLowerCase();
                document.getElementById('updateTicketStatusBtn').onclick = async () => {
                    const response = await fetchWithAuth('http://localhost:8083/api/support', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: ticket.id, status: document.getElementById('updateTicketStatus').value.toUpperCase() })
                    });
                    if (response && response.ok) {
                        ticket.status = document.getElementById('updateTicketStatus').value.toUpperCase();
                        await updateTicketCounts();
                        populateTicketsTable();
                        bootstrap.Modal.getInstance(document.getElementById('updateTicketModal')).hide();
                    } else {
                        alert('Failed to update ticket status');
                    }
                };
            } else {
                errorMessage.style.display = 'block';
            }
        }
    });

    document.getElementById('export-btn-support').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - Support Ticket Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        const tableData = filterTickets().map(t => [t.id, t.customer, t.subject, t.created, t.status]);
        doc.autoTable({
            startY: 40,
            head: [['Ticket ID', 'Customer', 'Subject', 'Created', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3, textColor: [33, 37, 41] },
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { top: 40 }
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('© RechargeFlow', 10, doc.internal.pageSize.height - 10);
        doc.save(`RechargeFlow_Support_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    document.getElementById('tickets-table').addEventListener('click', async (e) => {
        if (e.target.closest('.view-ticket')) {
            const id = e.target.closest('.view-ticket').dataset.id;
            const ticket = tickets.find(t => t.id === id);
            if (!ticket) return;

            document.getElementById('viewTicketModalLabel').textContent = `Ticket ${ticket.id} - ${ticket.subject}`;
            document.getElementById('viewTicketContent').innerHTML = `
                <div class="mb-4">
                    <h6 class="fw-bold">Customer Information</h6>
                    <div class="d-flex">
                        <div class="me-4">
                            <div class="icon-btn mb-2" style="width: 50px; height: 50px;">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                        <div>
                            <p class="mb-1"><strong>Name:</strong> ${ticket.customer || 'Unknown'}</p>
                            <p class="mb-1"><strong>Email:</strong> Unknown</p>
                            <p class="mb-1"><strong>Plan:</strong> Unknown</p>
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <h6 class="fw-bold">Ticket Details</h6>
                    <p class="mb-1"><strong>Created:</strong> ${ticket.created || 'N/A'}</p>
                    <p class="mb-1"><strong>Status:</strong> 
                        <span class="badge ${
                ticket.status === 'RESOLVED' ? 'bg-success' :
                    (ticket.status === 'OPEN' || ticket.status === 'PENDING') ? 'bg-warning' :
                        ticket.status === 'PROCESSING' ? 'bg-info' : 'bg-danger'
            }">${ticket.status}</span>
                    </p>
                    <p class="mb-1"><strong>Priority:</strong> Unknown</p>
                </div>
                <div class="mb-4">
                    <h6 class="fw-bold">Description</h6>
                    <p>${ticket.subject || 'No description'}</p>
                </div>
                <div class="mb-4">
                    <h6 class="fw-bold">Conversation</h6>
                    <div class="card mb-2">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <strong>No conversation available</strong>
                                <small>${new Date().toLocaleString()}</small>
                            </div>
                            <p class="mb-0">Start a conversation by replying below.</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <textarea class="form-control" rows="3" placeholder="Type your reply..." id="replyText"></textarea>
                    </div>
                    <button class="btn btn-primary" id="sendReplyBtn" data-id="${ticket.id}">Send Reply</button>
                </div>
            `;
            document.getElementById('modalStatusSelect').value = ticket.status.toLowerCase();
            const modal = new bootstrap.Modal(document.getElementById('viewTicketModal'));
            modal.show();

            document.getElementById('updateModalStatusBtn').onclick = async () => {
                const newStatus = document.getElementById('modalStatusSelect').value.toUpperCase();
                const response = await fetchWithAuth('http://localhost:8083/api/support', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: ticket.id, status: newStatus })
                });
                if (response && response.ok) {
                    ticket.status = newStatus;
                    await updateTicketCounts();
                    populateTicketsTable();
                    modal.hide();
                } else {
                    alert('Failed to update ticket status');
                }
            };

            document.getElementById('sendReplyBtn').onclick = () => {
                const reply = document.getElementById('replyText').value;
                if (reply) {
                    // Simulate adding a conversation (since no conversation field exists in original ticket data)
                    console.log(`Reply for ticket ${ticket.id}: ${reply}`);
                    document.getElementById('viewTicketContent').innerHTML = document.getElementById('viewTicketContent').innerHTML.replace(
                        /<div class="card mb-2">.*<\/div>/,
                        `
                        <div class="card mb-2">
                            <div class="card-body">
                                <div class="d-flex justify-content-between mb-2">
                                    <strong>Support Agent</strong>
                                    <small>${new Date().toLocaleString()}</small>
                                </div>
                                <p class="mb-0">${reply}</p>
                            </div>
                        </div>
                        `
                    );
                    document.getElementById('replyText').value = '';
                    alert('Reply sent successfully!');
                }
            };
        }
    });

    document.getElementById('statusFilterSupport').addEventListener('change', () => populateTicketsTable());
    document.getElementById('searchTicketId').addEventListener('input', () => populateTicketsTable());
}

// Analysis
let userGrowthChart, revenueChart, planChart, transactionChart;
async function initCharts() {
    console.log('Analysis Users:', users);
    console.log('Analysis Transactions:', transactions);
    console.log('Analysis Plans:', plans);

    document.getElementById('total-users-analysis').textContent = users.length || 0;
    document.getElementById('monthly-revenue').textContent = `₹${transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}`;
    document.getElementById('popular-plan-analysis').textContent = plans.reduce((max, p) => (p.subscribers || 0) > (max.subscribers || 0) ? p : max, plans[0] || { name: '-' }).name;
    document.getElementById('new-users-week').textContent = users.filter(u => new Date(u.lastTransaction) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;

    if (userGrowthChart) userGrowthChart.destroy();
    if (revenueChart) revenueChart.destroy();
    if (planChart) planChart.destroy();
    if (transactionChart) transactionChart.destroy();

    const ctx1 = document.getElementById('userGrowthChart').getContext('2d');
    userGrowthChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'User Growth',
                data: Array(12).fill(0).map((_, i) => users.filter(u => new Date(u.lastTransaction).getMonth() === i).length),
                borderColor: '#4361EE',
                fill: false
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    const ctx2 = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue (₹)',
                data: Array(12).fill(0).map((_, i) => transactions.filter(t => new Date(t.date).getMonth() === i).reduce((sum, t) => sum + parseFloat(t.amount), 0)),
                backgroundColor: '#F72585'
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    const ctx3 = document.getElementById('planChart').getContext('2d');
    planChart = new Chart(ctx3, {
        type: 'pie',
        data: {
            labels: plans.map(p => p.name),
            datasets: [{
                data: plans.map(p => p.subscribers || 0),
                backgroundColor: ['#4CC9F0', '#F72585', '#FFB800', '#4361EE', '#7209B7']
            }]
        }
    });

    const ctx4 = document.getElementById('transactionChart').getContext('2d');
    transactionChart = new Chart(ctx4, {
        type: 'doughnut',
        data: {
            labels: ['Success', 'Pending', 'Failed', 'Refunded'],
            datasets: [{
                data: [
                    transactions.filter(t => t.status === 'SUCCESS').length,
                    transactions.filter(t => t.status === 'PENDING').length,
                    transactions.filter(t => t.status === 'FAILED').length,
                    transactions.filter(t => t.status === 'REFUNDED').length
                ],
                backgroundColor: ['#4CC9F0', '#FFB800', '#F72585', '#4361EE']
            }]
        }
    });

    document.getElementById('export-btn-analysis').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - Analysis Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        doc.text(`Total Users: ${users.length}`, 10, 40);
        doc.text(`Monthly Revenue: ₹${transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}`, 10, 50);
        doc.addImage(userGrowthChart.toBase64Image(), 'PNG', 10, 60, 180, 100);
        doc.addImage(revenueChart.toBase64Image(), 'PNG', 10, 170, 180, 100);
        doc.save(`RechargeFlow_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
}

// Notification Setup
async function setupNotifications() {
    console.log('Notifications Tickets:', tickets);
    const highPriorityTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING');
    const notificationList = document.getElementById('notification-list');
    notificationList.innerHTML = highPriorityTickets.map(t => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><strong>${t.subject}</strong> - ${t.customer}</span>
            <span class="badge bg-warning text-dark">${t.status}</span>
        </li>
    `).join('') || '<li class="list-group-item">No high priority notifications</li>';
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    users = await fetchUsers();
    plans = await fetchPlans();
    categories = await fetchCategories();
    transactions = await fetchTransactions();
    tickets = await fetchTickets();

    setupNavigation();
    setupSidebarToggle();
    setupLogout();
    setupProfile();
    setupUserManagement();
    setupPlanManagement();
    setupCategoryManagement();
    setupTransactions();
    setupSupport();
    await populateCategoryDropdown();
    await setupNotifications();
    navigateTo('dashboard');
});