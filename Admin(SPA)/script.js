function navigateTo(sectionId) {
    const menuItems = document.querySelectorAll('.menu-item:not(#logout-btn)');
    const sections = document.querySelectorAll('.section');
    menuItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'dashboard') initDashboard();
    if (sectionId === 'user-management') { updateCounts(); showTable('active'); }
    if (sectionId === 'plan-management') { updatePlanCounts(); showPlansTable('all'); }
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

function setupSidebarToggle() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
    });
}

function setupLogout() {
    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        const loadingOverlay = document.createElement("div");
        loadingOverlay.classList.add("position-fixed", "top-0", "start-0", "w-100", "h-100", "bg-dark", "bg-opacity-50", "d-flex", "justify-content-center", "align-items-center", "text-white", "fs-4");
        loadingOverlay.innerHTML = "Logging out...";
        document.body.appendChild(loadingOverlay);
        setTimeout(() => {
            localStorage.removeItem("loggedIns");
            document.body.removeChild(loadingOverlay);
            window.location.href = "../Html_files/login.html";
        }, 2000);
    });
}

function setupProfile() {
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const name = document.getElementById('admin-name').value;
        const phone = document.getElementById('admin-phone').value;
        if (name && phone.match(/^[0-9]{10}$/)) {
            localStorage.setItem('adminProfile', JSON.stringify({ name, phone }));
            alert('Profile updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
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

function initDashboard() {
    const payments = [
        { name: "Karthik", school: "Popular Plan", amount: "₹100" },
        { name: "Raj", school: "Unlimited Plan", amount: "₹150" }
    ];
    const paymentList = document.getElementById("payment-list");
    paymentList.innerHTML = `<tr><td>Siva</td><td>Basic Plan</td><td>₹120</td><td><span class="status-badge status-active">Paid</span></td><td><button class="action-btn">View</button></td></tr>`;
    payments.forEach(p => paymentList.innerHTML += `<tr><td>${p.name}</td><td>${p.school}</td><td>${p.amount}</td><td><span class="status-badge status-active">Paid</span></td><td><button class="action-btn">View</button></td></tr>`);
    document.getElementById('add-new-btn').addEventListener('click', () => navigateTo('plan-management'));
}

// let users = [
//     { name: "karthik", phone: "1234567890", plan: "Basic Plan", expiry: "2025-03-15", lastTransaction: "2025-02-01", amount: "₹100", status: "active" },
//     { name: "siva", phone: "9876543210", plan: "Premium Plan", expiry: "2025-02-25", lastTransaction: "2025-01-15", amount: "₹200", status: "active" },
//     { name: "fazil", phone: "5556667777", plan: "Standard Plan", expiry: "2025-05-10", lastTransaction: "2025-02-05", amount: "₹150", status: "inactive" },
//     { name: "kalai", phone: "3334445555", plan: "Basic Plan", expiry: "2025-02-20", lastTransaction: "2025-01-28", amount: "₹120", status: "expiring" }
// ];
let users;

function updateCounts() {
    document.getElementById('active-count').textContent = users.filter(u => u.status === 'active').length;
    document.getElementById('expiry-count').textContent = users.filter(u => u.status === 'expiring').length;
    document.getElementById('inactive-count').textContent = users.filter(u => u.status === 'inactive' || u.status === 'blocked').length;
}

function showTable(status) {
    document.getElementById('statusFilter').value = status;
    document.getElementById('table-title').textContent = status === 'active' ? 'Active Users' : status === 'expiring' ? 'Users Expiring Soon' : status === 'inactive' ? 'Inactive Users' : status === 'blocked' ? 'Blocked Users' : 'All Users';
    const filteredUsers = status === 'all' ? users : users.filter(u => u.status === status);
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = filteredUsers.map(u => {
        const statusClass = u.status === 'active' ? 'status-active' : u.status === 'inactive' ? 'status-inactive' : u.status === 'blocked' ? 'status-danger' : 'status-warning';
        return `<tr><td>${u.name}</td><td>${u.phone}</td><td>${u.plan}</td><td>${u.expiry}</td><td>${u.lastTransaction}</td><td>${u.amount}</td><td><span class="status-badge ${statusClass}">${u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span></td><td><button class="btn btn-sm btn-primary edit-status" data-phone="${u.phone}"><i class="fas fa-edit"></i></button></td></tr>`;
    }).join('');
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
                document.getElementById('updateUserStatusBtn').onclick = () => {
                    fetch("http://localhost:8083/api/user",{
                        method:"put",
                        headers:{
                            "content-type":"application/json"
                        },
                        body:JSON.stringify({
                            status:document.getElementById("updateStatus").value.trim(),
                            number:document.getElementById("searchUser").value
                        })
                    });
                    user.status = document.getElementById('updateStatus').value;
                    updateCounts();
                    showTable(document.getElementById('statusFilter').value);
                    bootstrap.Modal.getInstance(document.getElementById('updateUserModal')).hide();
                };
            } else {
                errorMessage.style.display = 'block';
            }
        }
    });

    document.getElementById('saveUserBtn').addEventListener('click', () => {
        const name = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;
        const plan = document.getElementById('userPlan').value;
        const status = document.getElementById('userStatus').value;
        if (name && phone && plan && status) {
            users.push({ name, phone, plan, expiry: "2025-12-31", lastTransaction: new Date().toISOString().split('T')[0], amount: "₹0", status });
            updateCounts();
            showTable(status);
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
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
        const tableData = users.filter(u => document.getElementById('statusFilter').value === 'all' || u.status === document.getElementById('statusFilter').value)
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
            document.getElementById('statusUserName').textContent = user.name;
            document.getElementById('statusUserPhone').textContent = user.phone;
            document.getElementById('newStatus').value = user.status;
            const modal = new bootstrap.Modal(document.getElementById('statusChangeModal'));
            modal.show();
            document.getElementById('saveStatusBtn').onclick = () => {
                fetch("http://localhost:8083/api/user",{
                    method:"put",
                    headers:{
                        "content-type":"application/json"
                    },
                    body:JSON.stringify({
                        status:document.getElementById("newStatus").value.trim(),
                        number:phone
                    })
                });
                user.status = document.getElementById('newStatus').value;
                updateCounts();
                showTable(document.getElementById('statusFilter').value);
                modal.hide();
            };
        }
    });

    document.getElementById('statusFilter').addEventListener('change', (e) => showTable(e.target.value));
}

// let plans = [
//     { name: "Basic Plan", price: "₹9.99", data: "2GB", validity: "30 days", features: "Unlimited calls to same network, 100 SMS", status: "active" },
//     { name: "Standard Plan", price: "₹19.99", data: "5GB", validity: "30 days", features: "Unlimited calls to all networks, 500 SMS", status: "active" },
//     { name: "Premium Plan", price: "₹29.99", data: "15GB", validity: "30 days", features: "Unlimited calls, Unlimited SMS, 2GB social media data", status: "active" },
//     { name: "Ultimate Plan", price: "₹49.99", data: "50GB", validity: "30 days", features: "Unlimited everything, 10GB roaming data", status: "active" },
//     { name: "Weekend Special", price: "₹5.99", data: "3GB", validity: "2 days", features: "Weekend only, Unlimited social media", status: "inactive" }
// ];
let plans;
function updatePlanCounts() {
    document.getElementById('active-plan-count').textContent = plans.filter(p => p.status === 'active').length;
    document.getElementById('subscription-count').textContent = plans.reduce((sum, p) => sum + (p.status === 'active' ? 300 : 0), 0);
}

function showPlansTable(status) {
    document.getElementById('statusFilterPlan').value = status;
    document.getElementById('table-title1').textContent = status === 'active' ? 'Active Plans' : status === 'inactive' ? 'Inactive Plans' : 'All Plans';
    const filteredPlans = status === 'all' ? plans : plans.filter(p => p.status === status);
    const tableBody = document.getElementById('plans-table');
    tableBody.innerHTML = filteredPlans.map(p => {
        const statusClass = p.status === 'active' ? 'status-active' : 'status-inactive';
        return `<tr><td>${p.planId}</td><td><strong>${p.name}</strong></td><td>${p.price}</td><td>${p.data}</td><td>${p.validity}</td><td>${p.features}</td><td><span class="status-badge ${statusClass}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td><td><button class="btn btn-sm btn-primary me-1 edit-plan" data-name="${p.name}"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger delete-plan" data-id="${p.planId}"  data-name="${p.name}"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('');
}

function setupPlanManagement() {
    document.getElementById('savePlanBtn').addEventListener('click', () => {
        const planId=document.getElementById('planId').value;
        const name = document.getElementById('planName').value;
        const price = `₹${document.getElementById('planPrice').value}`;
        const data = document.getElementById('planData').value;
        const validity = `${document.getElementById('planValidity').value} days`;
        const features = document.getElementById('planFeatures').value;
        const status = document.getElementById('planStatus').value;
        if (planId && name && price && data && validity) {
            plans.push({planId, name, price, data, validity, features: features || "No additional features", status});
        }
        fetch("http://localhost:8083/api/plans", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                planId: document.getElementById('planId').value,
                planName: document.getElementById('planName').value,
                planType:"PREPAID",
                price: document.getElementById('planPrice').value,
                data: document.getElementById('planData').value.replace('GB', '').trim(),
                validity: document.getElementById('planValidity').value,
                feature: document.getElementById('planFeatures').value || "No additional features",
                status: document.getElementById('planStatus').value.toUpperCase()
            })
        })
            .then(response => response.text())
            .then(text => console.log("Response from server:", text))
            .catch(error => console.error("Error:", error));
        updatePlanCounts();
        // showPlansTable(document.getElementById('statusFilterPlan').value);
        showPlansTable("all");
        const modalElement = document.getElementById('addPlanModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    });

    document.getElementById('searchPlan').addEventListener('input', (e) => {
        const value = e.target.value;
        const planResult = document.getElementById('planResult');
        const errorMessage = document.getElementById('errorMessagePlan');
        planResult.style.display = 'none';
        errorMessage.style.display = 'none';
        if (value.length > 0) {
            const plan = plans.find(p => p.name.toLowerCase() === value.toLowerCase());
            if (plan) {
                planResult.style.display = 'block';
                document.getElementById('planDetails').textContent = `Plan Found: ${plan.name} - Current Status: ${plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}`;
                document.getElementById('updatePlanStatus').value = plan.status;
                document.getElementById('updatePlanStatusBtn').onclick = () => {
                    plan.status = document.getElementById('updatePlanStatus').value;
                    updatePlanCounts();
                    showPlansTable(document.getElementById('statusFilterPlan').value);
                    bootstrap.Modal.getInstance(document.getElementById('updatePlanModal')).hide();
                };
            } else {
                errorMessage.style.display = 'block';
            }
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
        const tableData = plans.filter(p => document.getElementById('statusFilterPlan').value === 'all' || p.status === document.getElementById('statusFilterPlan').value)
            .map(p => [p.name, p.price, p.data, p.validity, p.features, p.status.charAt(0).toUpperCase() + p.status.slice(1)]);
        doc.autoTable({
            startY: 50,
            head: [['Plan Name', 'Price', 'Data', 'Validity', 'Features', 'Status']],
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

    document.getElementById('plans-table').addEventListener('click', (e) => {
        if (e.target.closest('.edit-plan')) {
            const name = e.target.closest('.edit-plan').dataset.name;
            const plan = plans.find(p => p.name === name);
            document.getElementById('editPlanId').value=plan.planId;
            document.getElementById('editPlanName').value = plan.name;
            document.getElementById('editPlanPrice').value = plan.price.replace('₹', '');
            document.getElementById('editPlanData').value = plan.data;
            document.getElementById('editPlanValidity').value = plan.validity.replace(' days', '');
            document.getElementById('editPlanFeatures').value = plan.features;
            document.getElementById('editPlanStatus').value = plan.status;
            const modal = new bootstrap.Modal(document.getElementById('editPlanModal'));
            modal.show();
            document.getElementById('saveEditPlanBtn').onclick = () => {
                plan.planId=document.getElementById('editPlanId').value;
                plan.name = document.getElementById('editPlanName').value;
                plan.price = `₹${document.getElementById('editPlanPrice').value}`;
                plan.data = document.getElementById('editPlanData').value;
                plan.validity = `${document.getElementById('editPlanValidity').value} days`;
                plan.features = document.getElementById('editPlanFeatures').value || "No additional features";
                plan.status = document.getElementById('editPlanStatus').value;
                fetch("http://localhost:8083/api/plans", {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        planId: document.getElementById('editPlanId').value,
                        planName: document.getElementById('editPlanName').value,
                        planType:"DATA_ONLY",
                        price: document.getElementById('editPlanPrice').value,
                        data: document.getElementById('editPlanData').value.replace('GB', '').trim(),
                        validity: document.getElementById('editPlanValidity').value,
                        feature: document.getElementById('editPlanFeatures').value || "No additional features",
                        status: document.getElementById('editPlanStatus').value.toUpperCase()
                    })
                })
                    .then(response => response.text())
                    .then(text => console.log("Response from server:", text))
                    .catch(error => console.error("Error:", error));
                updatePlanCounts();
                // showPlansTable(document.getElementById('statusFilterPlan').value);
                showPlansTable("all");
                modal.hide();
            };
        }
        if (e.target.closest('.delete-plan')) {
            const id = e.target.closest('.delete-plan').dataset.id;
            const name = e.target.closest('.delete-plan').dataset.name;
            const requestBody = JSON.stringify({ planId: parseInt(id) });

            console.log("Sending DELETE request with body:", requestBody);
            if (confirm(`Are you sure you want to delete the plan "${name}"?`)) {
                fetch("http://localhost:8083/api/plans", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: requestBody
                })
                    .then(response => response.text())
                    .then(text => {
                        console.log("Response from server:", text);

                        plans = plans.filter(p => p.planId !== id);

                        updatePlanCounts();
                        showPlansTable("all");
                    })
                    .catch(error => console.error("Error:", error));
            }
        }
    });

    document.getElementById('statusFilterPlan').addEventListener('change', (e) => showPlansTable(e.target.value));
}

// let transactions = [
//     { id: "TRX-12345", customer: "karthik", date: "2025-02-24 14:23:45", amount: "₹59.99", plan: "Premium Plan", method: "Credit Card", status: "successful" },
//     { id: "TRX-12346", customer: "siva", date: "2025-02-24 12:15:33", amount: "₹29.99", plan: "Standard Plan", method: "PayPal", status: "successful" },
//     { id: "TRX-12347", customer: "fazil", date: "2025-02-23 18:45:12", amount: "₹99.99", plan: "Ultimate Plan", method: "Bank Transfer", status: "pending" },
//     { id: "TRX-12348", customer: "dilip", date: "2025-02-23 09:22:10", amount: "₹9.99", plan: "Basic Plan", method: "Digital Wallet", status: "successful" },
//     { id: "TRX-12349", customer: "kalai", date: "2025-02-22 16:08:55", amount: "₹19.99", plan: "Standard Plan", method: "Credit Card", status: "failed" },
//     { id: "TRX-12350", customer: "madhav", date: "2025-02-22 11:30:42", amount: "₹59.99", plan: "Premium Plan", method: "PayPal", status: "successful" },
//     { id: "TRX-12351", customer: "safthar", date: "2025-02-21 20:17:33", amount: "₹29.99", plan: "Standard Plan", method: "Digital Wallet", status: "successful" },
//     { id: "TRX-12352", customer: "abishek", date: "2025-02-21 15:45:18", amount: "₹9.99", plan: "Basic Plan", method: "Credit Card", status: "refunded" }
// ];
let transactions;

let currentPageTransactions = 1;

function updateStats() {
    const filteredTransactions = filterTransactions();
    const successfulTransactions = filteredTransactions.filter(t =>
        t.status === 'SUCCESS' || t.status === 'PARTIALLY_REFUNDED'
    );
    const totalRevenue = successfulTransactions.reduce((sum, t) =>
        sum + (parseFloat(t.amount) || 0), 0);
    const transactionCount = successfulTransactions.length;
    const avgTransaction = transactionCount ? (totalRevenue / transactionCount) : 0;

    const previousPeriodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);
        const lastMonthEnd = new Date();
        lastMonthEnd.setDate(0);
        return tDate >= lastMonthStart && tDate <= lastMonthEnd &&
            (t.status === 'SUCCESS' || t.status === 'PARTIALLY_REFUNDED');
    }).length;

    const growthRate = previousPeriodTransactions ?
        ((transactionCount - previousPeriodTransactions) / previousPeriodTransactions * 100) : 0;

    document.getElementById('total-revenue').textContent =
        `₹${(totalRevenue / 1000).toFixed(2)}K`;
    document.getElementById('transaction-count').textContent = transactionCount;
    document.getElementById('avg-transaction').textContent =
        `₹${avgTransaction.toFixed(2)}`;
    document.getElementById('growth-rate').textContent =
        `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
}

function filterTransactions() {
    const dateRange = document.getElementById('dateRange').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const searchQuery = document.getElementById('searchTransaction').value.toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return transactions.filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        const matchesSearch = (t.id || '').toLowerCase().includes(searchQuery) ||
            (t.customer || '').toLowerCase().includes(searchQuery);
        const normalizedStatus = t.status === 'PARTIALLY_REFUNDED' ? 'REFUNDED' : t.status;
        const matchesStatus = paymentStatus === 'all' ||
            normalizedStatus === paymentStatus;
        const matchesMethod = paymentMethod === 'all' ||
            t.method === paymentMethod;
        let matchesDate = true;
        switch (dateRange) {
            case 'today':
                matchesDate = tDate.getTime() === today.getTime();
                break;
            case 'yesterday':
                matchesDate = tDate.getTime() === yesterday.getTime();
                break;
            case 'last7days':
                matchesDate = tDate >= last7Days;
                break;
            case 'last30days':
                matchesDate = tDate >= last30Days;
                break;
            case 'thisMonth':
                matchesDate = tDate >= thisMonthStart;
                break;
            case 'lastMonth':
                matchesDate = tDate >= lastMonthStart && tDate <= lastMonthEnd;
                break;
        }
        return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
}

function populateTransactionsTable() {
    const filteredTransactions = filterTransactions();
    const recordsPerPage = parseInt(document.getElementById('recordsPerPage').value);
    const totalRecords = filteredTransactions.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    currentPageTransactions = Math.min(currentPageTransactions, totalPages || 1);
    const start = (currentPageTransactions - 1) * recordsPerPage;
    const end = Math.min(start + recordsPerPage, totalRecords);
    const paginatedTransactions = filteredTransactions.slice(start, end);

    document.getElementById('transactions-table').innerHTML = paginatedTransactions.map(t => {
        const normalizedStatus = t.status === 'PARTIALLY_REFUNDED' ? 'REFUNDED' : t.status;
        const statusClass = normalizedStatus === 'SUCCESS' ? 'status-active' :
            normalizedStatus === 'PENDING' || normalizedStatus === 'REFUNDED' ? 'status-warning' :
                'status-inactive';
        return `<tr>
            <td><strong>${t.id || 'N/A'}</strong></td>
            <td>${t.customer || 'N/A'}</td>
            <td>${new Date(t.date).toLocaleString()}</td>
            <td>${t.amount || 'N/A'}</td>
            <td>${t.plan || 'N/A'}</td>
            <td>${t.method || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${normalizedStatus}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 view-details" data-id="${t.id}" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-outline-secondary download-receipt" data-id="${t.id}" title="Download Receipt"><i class="fas fa-download"></i></button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('showing-records').textContent = `${start + 1}-${end}`;
    document.getElementById('total-records').textContent = totalRecords;
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination-buttons');
    pagination.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary me-2" ${currentPageTransactions === 1 ? 'disabled' : ''} id="prev-page"><i class="fas fa-chevron-left"></i></button>
        ${Array.from({ length: totalPages }, (_, i) => `
            <button class="btn btn-sm ${currentPageTransactions === i + 1 ? 'btn-primary' : 'btn-outline-secondary'} me-1" data-page="${i + 1}">${i + 1}</button>
        `).join('')}
        <button class="btn btn-sm btn-outline-secondary" ${currentPageTransactions === totalPages ? 'disabled' : ''} id="next-page"><i class="fas fa-chevron-right"></i></button>
    `;
    document.getElementById('prev-page')?.addEventListener('click', () => { if (currentPageTransactions > 1) { currentPageTransactions--; populateTransactionsTable(); } });
    document.getElementById('next-page')?.addEventListener('click', () => { if (currentPageTransactions < totalPages) { currentPageTransactions++; populateTransactionsTable(); } });
    document.querySelectorAll('.pagination-container button[data-page]').forEach(btn =>
        btn.addEventListener('click', () => { currentPageTransactions = parseInt(btn.dataset.page); populateTransactionsTable(); })
    );
}

function setupTransactions() {
    document.getElementById('apply-filters').addEventListener('click', () => {
        currentPageTransactions = 1;
        populateTransactionsTable();
        updateStats();
    });
    document.getElementById('recordsPerPage').addEventListener('change', () => {
        currentPageTransactions = 1;
        populateTransactionsTable();
    });
    document.getElementById('searchTransaction').addEventListener('input', () => {
        currentPageTransactions = 1;
        populateTransactionsTable();
        updateStats();
    });
    document.getElementById('export-btn-transaction').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(67, 97, 238);
        doc.text('RechargeFlow - Transaction Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        doc.text(`Filter: ${document.getElementById('paymentStatus').options[document.getElementById('paymentStatus').selectedIndex].text}, ${document.getElementById('dateRange').options[document.getElementById('dateRange').selectedIndex].text}`, 10, 40);
        const tableData = filterTransactions().map(t => [t.id, t.customer, t.date, t.amount, t.plan, t.method, t.status.charAt(0).toUpperCase() + t.status.slice(1)]);
        doc.autoTable({
            startY: 50,
            head: [['Transaction ID', 'Customer', 'Date & Time', 'Amount', 'Plan', 'Payment Method', 'Status']],
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
        doc.save(`RechargeFlow_Transaction_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
    document.getElementById('transactions-table').addEventListener('click', (e) => {
        const id = e.target.closest('.view-details')?.dataset.id || e.target.closest('.download-receipt')?.dataset.id;
        if (!id) return;
        const transaction = transactions.find(t => t.id === id);
        if (e.target.closest('.view-details')) {
            document.getElementById('transactionDetailsContent').innerHTML = `
                <p><strong>Transaction ID:</strong> ${transaction.id}</p>
                <p><strong>Customer:</strong> ${transaction.customer}</p>
                <p><strong>Date & Time:</strong> ${transaction.date}</p>
                <p><strong>Amount:</strong> ${transaction.amount}</p>
                <p><strong>Plan:</strong> ${transaction.plan}</p>
                <p><strong>Payment Method:</strong> ${transaction.method}</p>
                <p><strong>Status:</strong> ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</p>
            `;
            const modal = new bootstrap.Modal(document.getElementById('transactionDetailsModal'));
            modal.show();
        } else if (e.target.closest('.download-receipt')) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.setTextColor(67, 97, 238);
            doc.text('RechargeFlow - Transaction Receipt', 10, 20);
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Transaction ID: ${transaction.id}`, 10, 30);
            doc.text(`Date: ${transaction.date}`, 10, 40);
            doc.text(`Customer: ${transaction.customer}`, 10, 50);
            doc.text(`Amount: ${transaction.amount}`, 10, 60);
            doc.text(`Plan: ${transaction.plan}`, 10, 70);
            doc.text(`Payment Method: ${transaction.method}`, 10, 80);
            doc.text(`Status: ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}`, 10, 90);
            doc.text('© RechargeFlow', 10, doc.internal.pageSize.height - 10);
            doc.save(`Receipt_${transaction.id}.pdf`);
        }
    });
}

// let tickets = [
//     { id: "#001", customer: "karthik", email: "karthik@example.com", subject: "Issue with payment", created: "2025-03-01 14:23:45", status: "processing", description: "Payment failed but amount deducted.", priority: "High", conversation: [{ sender: "Support Agent", message: "Checking your payment records.", time: "2025-03-01 15:15:00" }] },
//     { id: "#002", customer: "siva", email: "siva@example.com", subject: "Account locked", created: "2025-02-27 10:00:00", status: "resolved", description: "Unable to log in.", priority: "Medium", conversation: [{ sender: "Support Agent", message: "Account unlocked.", time: "2025-02-27 11:00:00" }] },
//     { id: "#003", customer: "kalai", email: "kalai@example.com", subject: "Data not working", created: "2025-02-28 09:30:00", status: "processing", description: "No internet access.", priority: "High", conversation: [{ sender: "Support Agent", message: "Investigating the issue.", time: "2025-02-28 10:00:00" }] }
// ];
let tickets;

let currentPageSupport = 1;

function updateTicketCounts() {
    document.getElementById('total-tickets').textContent = tickets.length;
    document.getElementById('pending-tickets').textContent =
        tickets.filter(t => t.status === 'OPEN').length;
    document.getElementById('processing-tickets').textContent =
        tickets.filter(t => t.status === 'IN_PROGRESS').length;
    document.getElementById('resolved-tickets').textContent =
        tickets.filter(t => t.status === 'RESOLVED' || t.status === 'DENIED').length;
}

function filterTickets() {
    const statusFilter = document.getElementById('statusFilterSupport').value;
    const searchQuery = document.getElementById('searchTicket').value;

    return tickets.filter(t => {
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        // Handle numeric ticketId and string-based search
        const ticketIdStr = t.ticketId !== null && t.ticketId !== undefined ? t.ticketId.toString() : '';
        const matchesSearch =
            ticketIdStr.includes(searchQuery) ||
            (t.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.issueType || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });
}
function populateTicketsTable() {
    const filteredTickets = filterTickets();
    const recordsPerPage = 5;
    const totalRecords = filteredTickets.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    currentPageSupport = Math.min(currentPageSupport, totalPages || 1);
    const start = (currentPageSupport - 1) * recordsPerPage;
    const end = Math.min(start + recordsPerPage, totalRecords);
    const paginatedTickets = filteredTickets.slice(start, end);

    document.getElementById('tickets-table').innerHTML = paginatedTickets.map(t => {
        const statusClass = t.status === 'RESOLVED' ? 'status-active' :
            t.status === 'OPEN' ? 'status-warning' :
                t.status === 'IN_PROGRESS' ? 'status-info' :
                    'status-danger';
        return `<tr>
            <td><strong>${t.ticketId !== null && t.ticketId !== undefined ? t.ticketId : 'N/A'}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="icon-btn me-2"><i class="fas fa-user"></i></div>
                    <div>
                        <div>${t.customerName || 'Unknown'}</div>
                        <small class="text-muted">${t.customerEmail || 'Unknown'}</small>
                    </div>
                </div>
            </td>
            <td>${t.issueType || 'Unknown'}</td>
            <td>${new Date(t.createdDate).toLocaleString()}</td>
            <td>
                <select class="form-select form-select-sm status-select" data-id="${t.ticketId}">
                    <option value="OPEN" ${t.status === 'OPEN' ? 'selected' : ''}>Open</option>
                    <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                    <option value="RESOLVED" ${t.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                    <option value="DENIED" ${t.status === 'DENIED' ? 'selected' : ''}>Denied</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-primary save-btn" data-id="${t.ticketId}">Save</button>
                <button class="btn btn-sm btn-outline-primary view-btn" data-id="${t.ticketId}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('showing-records-support').textContent = `${start + 1}-${end}`;
    document.getElementById('total-records-support').textContent = totalRecords;
    updateSupportPagination(totalPages);
}

function updateSupportPagination(totalPages) {
    const pagination = document.getElementById('pagination-buttons-support');
    pagination.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary me-2" ${currentPageSupport === 1 ? 'disabled' : ''} id="prev-page-support"><i class="fas fa-chevron-left"></i></button>
        ${Array.from({ length: totalPages }, (_, i) => `
            <button class="btn btn-sm ${currentPageSupport === i + 1 ? 'btn-primary' : 'btn-outline-secondary'} me-1" data-page="${i + 1}">${i + 1}</button>
        `).join('')}
        <button class="btn btn-sm btn-outline-secondary" ${currentPageSupport === totalPages ? 'disabled' : ''} id="next-page-support"><i class="fas fa-chevron-right"></i></button>
    `;
    document.getElementById('prev-page-support')?.addEventListener('click', () => { if (currentPageSupport > 1) { currentPageSupport--; populateTicketsTable(); } });
    document.getElementById('next-page-support')?.addEventListener('click', () => { if (currentPageSupport < totalPages) { currentPageSupport++; populateTicketsTable(); } });
    document.querySelectorAll('#pagination-buttons-support button[data-page]').forEach(btn =>
        btn.addEventListener('click', () => { currentPageSupport = parseInt(btn.dataset.page); populateTicketsTable(); })
    );
}

function setupSupport() {
    document.getElementById('searchTicketId').addEventListener('input', (e) => {
        const value = e.target.value;
        const ticketResult = document.getElementById('ticketResult');
        const errorMessage = document.getElementById('errorMessageTicket');
        ticketResult.style.display = 'none';
        errorMessage.style.display = 'none';
        if (value.length > 0) {
            const ticket = tickets.find(t => t.ticketId.toString() === value);
            if (ticket) {
                ticketResult.style.display = 'block';
                document.getElementById('ticketDetails').textContent =
                    `Ticket Found: ${ticket.ticketId} - ${ticket.issueType} (Current Status: ${ticket.status})`;
                document.getElementById('updateTicketStatus').value = ticket.status;
                document.getElementById('updateTicketStatusBtn').onclick = () => {
                    ticket.status = document.getElementById('updateTicketStatus').value;
                    updateTicketCounts();
                    populateTicketsTable();
                    bootstrap.Modal.getInstance(document.getElementById('updateTicketModal')).hide();
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
        doc.text('RechargeFlow - Support Tickets Report', 10, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
        doc.text(`Filter: ${document.getElementById('statusFilterSupport').options[document.getElementById('statusFilterSupport').selectedIndex].text}`, 10, 40);
        const tableData = filterTickets().map(t => [
            t.ticketId,
            t.customerName,
            t.issueType,
            new Date(t.createdDate).toLocaleString(),
            t.status
        ]);
        doc.autoTable({
            startY: 50,
            head: [['Ticket ID', 'Customer', 'Subject', 'Created', 'Status']],
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
        doc.save(`RechargeFlow_Support_Tickets_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    document.getElementById('tickets-table').addEventListener('click', (e) => {
        const id = e.target.closest('.save-btn')?.dataset.id || e.target.closest('.view-btn')?.dataset.id;
        if (!id) return;
        const ticket = tickets.find(t => t.ticketId.toString() === id);  // Convert to string for comparison
        if (!ticket) return;

        if (e.target.closest('.save-btn')) {
            ticket.status = e.target.closest('tr').querySelector('.status-select').value;
            updateTicketCounts();
            populateTicketsTable();
            alert(`Status for Ticket ${ticket.ticketId} updated to: ${ticket.status}`);
        } else if (e.target.closest('.view-btn')) {
            document.getElementById('viewTicketModalLabel').textContent =
                `Ticket ${ticket.ticketId} - ${ticket.issueType}`;
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
                            <p class="mb-1"><strong>Name:</strong> ${ticket.customerName || 'Unknown'}</p>
                            <p class="mb-1"><strong>Email:</strong> ${ticket.customerEmail || 'Unknown'}</p>
                            <p class="mb-1"><strong>Plan:</strong> Unknown</p>
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <h6 class="fw-bold">Ticket Details</h6>
                    <p class="mb-1"><strong>Created:</strong> ${new Date(ticket.createdDate).toLocaleString()}</p>
                    <p class="mb-1"><strong>Status:</strong> 
                        <span class="badge ${
                ticket.status === 'RESOLVED' ? 'bg-success' :
                    ticket.status === 'OPEN' ? 'bg-warning' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-info' :
                            'bg-danger'
            }">${ticket.status}</span>
                    </p>
                    <p class="mb-1"><strong>Priority:</strong> ${ticket.priority || 'Unknown'}</p>
                </div>
                <div class="mb-4">
                    <h6 class="fw-bold">Description</h6>
                    <p>${ticket.description || 'No description'}</p>
                </div>
                <div class="mb-4">
                    <h6 class="fw-bold">Conversation</h6>
                    ${(Array.isArray(ticket.conversation) ? ticket.conversation : []).map(c => `
                        <div class="card mb-2">
                            <div class="card-body">
                                <div class="d-flex justify-content-between mb-2">
                                    <strong>${c.sender || 'Unknown'}</strong>
                                    <small>${new Date(c.time).toLocaleString()}</small>
                                </div>
                                <p class="mb-0">${c.message || 'No message'}</p>
                            </div>
                        </div>
                    `).join('')}
                    <div class="mb-3">
                        <textarea class="form-control" rows="3" placeholder="Type your reply..." id="replyText"></textarea>
                    </div>
                    <button class="btn btn-primary" id="sendReplyBtn" data-id="${ticket.ticketId}">Send Reply</button>
                </div>
            `;
            document.getElementById('modalStatusSelect').value = ticket.status;
            const modal = new bootstrap.Modal(document.getElementById('viewTicketModal'));
            modal.show();
            document.getElementById('updateModalStatusBtn').onclick = () => {
                ticket.status = document.getElementById('modalStatusSelect').value;
                updateTicketCounts();
                populateTicketsTable();
                modal.hide();
            };
            document.getElementById('sendReplyBtn').onclick = () => {
                const reply = document.getElementById('replyText').value;
                if (reply) {
                    if (!Array.isArray(ticket.conversation)) {
                        ticket.conversation = [];
                    }
                    ticket.conversation.push({
                        sender: "Support Agent",
                        message: reply,
                        time: new Date().toISOString()
                    });
                    populateTicketsTable();
                    document.getElementById('viewTicketContent').innerHTML =
                        document.getElementById('viewTicketContent').innerHTML.replace(
                            /<textarea[^>]*>.*<\/textarea>/,
                            `<textarea class="form-control" rows="3" placeholder="Type your reply..." id="replyText"></textarea>`
                        );
                    alert('Reply sent successfully!');
                }
            };
        }
    });

    document.getElementById('statusFilterSupport').addEventListener('change', () => {
        currentPageSupport = 1;
        populateTicketsTable();
    });
    document.getElementById('searchTicket').addEventListener('input', () => {
        currentPageSupport = 1;
        populateTicketsTable();
    });
}

function initCharts() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 5;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, grid: { drawBorder: false, color: '#f0f0f0' }, ticks: { font: { size: 11 } } }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } },
        plugins: { legend: { position: 'top' }, title: { display: false } }
    };
    new Chart(document.getElementById('userGrowthChart').getContext('2d'), {
        type: 'bar',
        data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'New Users', data: [185, 215, 253, 300, 340, 390], backgroundColor: '#4361EE' }] },
        options: commonOptions
    });
    new Chart(document.getElementById('planChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Basic', 'Standard', 'Premium'], datasets: [{ data: [650, 860, 680], backgroundColor: ['#4CC9F0', '#F72585', '#FFB800'], borderColor: 'white', borderWidth: 2 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { padding: 20, boxWidth: 12 } },
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw} (${Math.round(context.raw / context.dataset.data.reduce((a, b) => a + b, 0) * 100)}%)` } }
            },
            cutout: '70%'
        }
    });
    new Chart(document.getElementById('revenueChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [5000, 7500, 9000, 11500, 13000, 15000],
                borderColor: '#F72585',
                backgroundColor: 'rgba(247, 37, 133, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#F72585',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            ...commonOptions,
            scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, ticks: { ...commonOptions.scales.y.ticks, callback: value => '₹' + value.toLocaleString() } } }
        }
    });
    new Chart(document.getElementById('transactionChart').getContext('2d'), {
        type: 'pie',
        data: { labels: ['Completed', 'Pending', 'Failed'], datasets: [{ data: [1250, 450, 120], backgroundColor: ['#4CC9F0', '#FFB800', '#F72585'], borderColor: 'white', borderWidth: 2 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { padding: 20, boxWidth: 12 } },
                tooltip: { callbacks: { label: context => `${context.label}: ${context.raw} (${Math.round(context.raw / context.dataset.data.reduce((a, b) => a + b, 0) * 100)}%)` } }
            }
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
        doc.text(`Period: ${document.getElementById('analysis-date-range').options[document.getElementById('analysis-date-range').selectedIndex].text}`, 10, 40);
        doc.save(`RechargeFlow_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTransactionData();
    loadUserData();
    loadPlanData();
    loadTicketData();
    setupNavigation();
    setupSidebarToggle();
    setupLogout();
    setupProfile();
    initDashboard();
    setupUserManagement();
    setupPlanManagement();
    setupTransactions();
    setupSupport();
});
async function loadUserData() {
    try {
        const response = await fetch("http://localhost:8083/api/user");
        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        const backendUsers = await response.json();
        console.log("Backend data:", JSON.stringify(backendUsers, null, 2));

        const plansResponse = await fetch("http://localhost:8083/api/plans");
        if (!plansResponse.ok) {
            throw new Error(`Failed to fetch plans: ${plansResponse.status} ${plansResponse.statusText}`);
        }
        const plans = await plansResponse.json();

        users = backendUsers.map(user => {
            const userPlan = plans.find(p => p.planName === user.planName);

            let expiryDate = "N/A";
            if (user.transactionStatus === "SUCCESS" && userPlan) {
                const transactionDate = new Date(user.transactionDate);
                const validityDays = parseInt(userPlan.validity);
                transactionDate.setDate(transactionDate.getDate() + validityDays);
                expiryDate = transactionDate.toISOString().split('T')[0];
            }

            let status = user.status ? user.status.toLowerCase() : "pending";
            if (status === "pending_verification") {
                status = "pending";
            } else if (status === "active" && expiryDate !== "N/A") {
                const daysUntilExpiry = Math.ceil(
                    (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                if (daysUntilExpiry <= 7) {
                    status = "expiring";
                }
            }

            return {
                name: user.name || "Unknown",
                phone: user.phoneNumber || "N/A",
                plan: user.planName || null,
                expiry: expiryDate,
                lastTransaction: user.transactionDate
                    ? new Date(user.transactionDate).toISOString().split('T')[0]
                    : "N/A",
                amount: user.amount ? `₹${user.amount}` : "₹0",
                status: status
            };
        });

        console.log("Transformed users:", JSON.stringify(users, null, 2));
        showTable('all');
    } catch (error) {
        console.error("Error loading user data:", error.message);
        users = [];
        showTable('all');
    }
}

async function loadPlanData() {
    try {
        const response = await fetch("http://localhost:8083/api/plans");
        if (!response.ok) {
            throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}`);
        }

        const backendPlans = await response.json();
        console.log("Backend data:", JSON.stringify(backendPlans, null, 2));

        plans = backendPlans.map(plan => ({
            planId: plan.planId || 0,
            name: plan.planName || "Unknown Plan",
            price: plan.price ? `₹${Number(plan.price).toFixed(2)}` : "₹0.00",
            data: plan.data ? `${plan.data}GB` : "0GB",
            validity: plan.validity ? `${plan.validity} days` : "0 days",
            features: plan.feature || plan.features || "No features specified",
            status: plan.status ? plan.status.toLowerCase() : "inactive"
        }));

        console.log("Formatted Plans:", JSON.stringify(plans, null, 2));
        showPlansTable("all");
    } catch (error) {
        console.error("Error loading plan data:", error.message);
        plans = [];
        showPlansTable("all");
    }
}

async function loadTransactionData() {
    try {
        const response = await fetch("http://localhost:8083/api/transactions");
        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
        }
        const backendTransactions = await response.json();
        console.log("Backend data:", JSON.stringify(backendTransactions, null, 2));
        transactions = backendTransactions.map(transaction => ({
            id: transaction.transactionId || 'N/A',
            customer: transaction.customer || 'Unknown',
            date: transaction.dateTime,
            amount: transaction.amount || 0,
            plan: transaction.plan || 'Unknown',
            method: transaction.paymentMethod || 'Unknown',
            status: transaction.status || 'Unknown'
        }));
        populateTransactionsTable();
        updateStats();
    } catch (error) {
        console.error(error.message);
    }
}

async function loadTicketData(){
    try{
        const response=await fetch("http://localhost:8083/api/support");
        if(!response.ok){
            throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
        }
        const backendTicket = await response.json();
        console.log("BackendTicket data:", JSON.stringify(backendTicket, null, 2));
        tickets = backendTicket.map(ticket => ({
            ticketId: ticket.ticketId|| 'N/A',
            customerName: ticket.customerName|| 'Unknown',
            customerEmail:ticket.customerEmail||'Unknown',
            phone:ticket.phoneNumber||'Unknown',
            issueType:ticket.issueType||'Unknown',
            createdDate:ticket.createdDate,
            status: ticket.status || 'Unknown',
            description:ticket.description ||'Unknown',
            priority:ticket.priority||'Unknown',
            conversation:'Nil'
        }));
        populateTicketsTable();
        updateTicketCounts();
    }
    catch (error){
        console.log(error);
    }
}
// let tickets = [
//     { id: "#001", customer: "karthik", email: "karthik@example.com", subject: "Issue with payment", created: "2025-03-01 14:23:45", status: "processing", description: "Payment failed but amount deducted.", priority: "High", conversation: [{ sender: "Support Agent", message: "Checking your payment records.", time: "2025-03-01 15:15:00" }] },
//     { id: "#002", customer: "siva", email: "siva@example.com", subject: "Account locked", created: "2025-02-27 10:00:00", status: "resolved", description: "Unable to log in.", priority: "Medium", conversation: [{ sender: "Support Agent", message: "Account unlocked.", time: "2025-02-27 11:00:00" }] },
//     { id: "#003", customer: "kalai", email: "kalai@example.com", subject: "Data not working", created: "2025-02-28 09:30:00", status: "processing", description: "No internet access.", priority: "High", conversation: [{ sender: "Support Agent", message: "Investigating the issue.", time: "2025-02-28 10:00:00" }] }
// ];