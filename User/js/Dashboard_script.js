const rechargeHistory = [
    { id: "TXN123", date: "2025-02-15", time: "14:30", plan: "Basic Plan", amount: 10, status: "Success", gst: 1.8, discount: 0 },
    { id: "TXN124", date: "2025-02-14", time: "09:45", plan: "Premium Plan", amount: 20, status: "Success", gst: 3.6, discount: 2 }
];

function populateRechargeHistory(historyData = rechargeHistory) {
    const historyList = document.getElementById("history-lists");
    historyList.innerHTML = historyData.length === 0 ? '<tr><td colspan="6">No records found.</td></tr>' : '';

    historyData.forEach(txn => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${txn.id}</td>
            <td>${txn.date}, ${txn.time}</td>
            <td>${txn.plan}</td>
            <td>₹${txn.amount}</td>
            <td><span class="badge bg-${txn.status === 'Success' ? 'success' : 'warning'}">${txn.status}</span></td>
            <td><i class="fas fa-download download-icon" data-transaction="${txn.id}"></i></td>
        `;
        historyList.appendChild(row);
    });

    attachDownloadListeners();
}

function attachDownloadListeners() {
    document.querySelectorAll('.download-icon').forEach(icon => {
        icon.onclick = () => generateInvoice(icon.getAttribute('data-transaction'));
    });
}

function generateInvoice(txnId) {
    const txn = rechargeHistory.find(t => t.id === txnId);
    if (!txn) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();


    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });


    doc.setFontSize(12);
    doc.text("Company Name", 20, 40);
    doc.text("123 Street Name", 20, 45);
    doc.text("City, State, ZIP", 20, 50);
    doc.text("Phone: (123) 456-7890", 20, 55);

    doc.text(`Invoice #: ${txn.id}`, 190, 40, { align: "right" });
    doc.text(`Date: ${txn.date}`, 190, 45, { align: "right" });
    doc.text(`Time: ${txn.time}`, 190, 50, { align: "right" });

    doc.text("Billed To:", 20, 70);
    doc.text(document.getElementById("user-name").textContent, 20, 75);
    doc.text(document.getElementById("user-email").textContent, 20, 80);
    doc.text(document.getElementById("user-mobile").textContent, 20, 85);

    doc.line(20, 95, 190, 95);
    doc.text("Description", 22, 100);
    doc.text("Amount", 190, 100, { align: "right" });
    doc.line(20, 102, 190, 102);

    doc.text(txn.plan, 22, 110);
    doc.text(`₹${txn.amount.toFixed(2)}`, 190, 110, { align: "right" });
    doc.text("GST", 22, 120);
    doc.text(`₹${txn.gst.toFixed(2)}`, 190, 120, { align: "right" });
    let yPos = 120;
    if (txn.discount > 0) {
        yPos += 10;
        doc.text("Discount", 22, yPos);
        doc.text(`-₹${txn.discount.toFixed(2)}`, 190, yPos, { align: "right" });
    }

    const total = txn.amount + txn.gst - txn.discount;
    doc.line(20, yPos + 20, 190, yPos + 20);
    doc.setFontSize(14);
    doc.text("Total", 22, yPos + 30);
    doc.text(`₹${total.toFixed(2)}`, 190, yPos + 30, { align: "right" });
    doc.line(20, yPos + 32, 190, yPos + 32);

    doc.setFontSize(10);
    doc.text("Thank you for your business!", 105, yPos + 50, { align: "center" });
    doc.text("For customer support, please call (123) 456-7890", 105, yPos + 55, { align: "center" });

    doc.save(`Invoice_${txn.id}.pdf`);
}

function initUsageChart() {
    new Chart(document.getElementById('usageChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Data Usage (GB)',
                data: [5, 8, 12, 9, 7, 12],
                backgroundColor: 'rgba(76, 201, 240, 0.2)',
                borderColor: 'rgba(76, 201, 240, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(76, 201, 240, 1)',
                tension: 0.3
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top' } } }
    });
    document.querySelector('.used').style.width = '60%';
}

function initNavigation() {
    const links = ['dashboard', 'recharge-history', 'autopay-management', 'saved-payment'].map(id => document.getElementById(`${id}-link`));
    const views = links.map((_, i) => document.getElementById(`${links[i].id.replace('-link', '')}-view`));

    links.forEach((link, i) => {
        link.onclick = e => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            views.forEach(v => v.style.display = 'none');
            views[i].style.display = 'block';
            if (window.innerWidth < 992) document.getElementById('sidebar').classList.remove('active');
            if (i === 1) populateRechargeHistory();
            if (i === 2) populateCardSelect();
            if (i === 3) populateSavedCards();
        };
    });
}

function initSidebarToggle() {
    document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('close-btn').onclick = () => document.getElementById('sidebar').classList.remove('active');
}

function initAutopayToggle() {
    const toggle = document.getElementById('autopay-toggle');
    toggle.onchange = () => {
        const cardForm = document.getElementById('autopay-card-form'), cardDisplay = document.getElementById('selected-card-display');
        if (toggle.checked) {
            const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
            savedCards.length > 0 ? new bootstrap.Modal(document.getElementById('selectCardModal')).show() : (cardForm.style.display = 'block', cardDisplay.style.display = 'none');
        } else {
            cardForm.style.display = cardDisplay.style.display = 'none';
            showSuccessMessage('AutoPay disabled successfully.');
        }
    };
}

function populateCardSelect() {
    const select = document.getElementById('selected-card');
    select.innerHTML = '';
    JSON.parse(localStorage.getItem('savedCards') || '[]').forEach((card, i) => select.innerHTML += `<option value="${i}">${card.name} - ${card.number.slice(-4)}</option>`);
}

function populateSavedCards() {
    const list = document.getElementById('saved-cards-list');
    const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
    list.innerHTML = savedCards.length === 0 ? '<li>No saved cards found.</li>' : savedCards.map(card => `<li>${card.name} - ${card.number.slice(-4)} (Expires: ${card.expiry})</li>`).join('');
}

function showSuccessMessage(msg) {
    document.getElementById('success-message').textContent = msg;
    new bootstrap.Modal(document.getElementById('successModal')).show();
}

function initFormHandlers() {
    document.getElementById('add-card-form-modal').onsubmit = e => {
        e.preventDefault();
        const card = { number: document.getElementById('modal-card-number').value, name: document.getElementById('modal-card-holder').value, expiry: document.getElementById('modal-expiry-date').value };
        const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
        savedCards.push(card);
        localStorage.setItem('savedCards', JSON.stringify(savedCards));
        bootstrap.Modal.getInstance(document.getElementById('addCardModal')).hide();
        populateSavedCards();
        showSuccessMessage('Card added successfully.');
    };

    document.getElementById('add-card-form-autopay').onsubmit = e => {
        e.preventDefault();
        const card = { number: document.getElementById('autopay-card-number').value, name: document.getElementById('autopay-card-holder').value, expiry: document.getElementById('autopay-expiry-date').value };
        const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
        savedCards.push(card);
        localStorage.setItem('savedCards', JSON.stringify(savedCards));
        document.getElementById('autopay-card-form').style.display = 'none';
        document.getElementById('selected-card-display').style.display = 'block';
        document.getElementById('selected-card-info').textContent = `${card.name} - ${card.number.slice(-4)} (Expires: ${card.expiry})`;
        showSuccessMessage('Card added and AutoPay enabled successfully.');
    };

    document.getElementById('select-card-form').onsubmit = e => {
        e.preventDefault();
        const card = JSON.parse(localStorage.getItem('savedCards') || '[]')[document.getElementById('selected-card').value];
        bootstrap.Modal.getInstance(document.getElementById('selectCardModal')).hide();
        document.getElementById('autopay-card-form').style.display = 'none';
        document.getElementById('selected-card-display').style.display = 'block';
        document.getElementById('selected-card-info').textContent = `${card.name} - ${card.number.slice(-4)} (Expires: ${card.expiry})`;
        showSuccessMessage('AutoPay enabled successfully.');
    };

    document.getElementById('save-changes').onclick = () => {
        document.getElementById('user-email').textContent = document.getElementById('edit-email').value;
        document.getElementById('user-alt-mobile').textContent = document.getElementById('edit-alt-mobile').value;
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        showSuccessMessage('User information updated successfully.');
    };

    document.getElementById('view-all-btn').onclick = () => {
        const start = document.getElementById('start-date').value;
        const end = document.getElementById('end-date').value;

        let filtered = rechargeHistory;
        if (start || end) {
            filtered = rechargeHistory.filter(txn => {
                const txnDate = new Date(txn.date);
                const startDate = start ? new Date(start) : null;
                const endDate = end ? new Date(end) : null;
                return (!startDate || txnDate >= startDate) && (!endDate || txnDate <= endDate);
            });
        }
        populateRechargeHistory(filtered);
    };
}

function initEditModal() {
    document.getElementById('editModal').addEventListener('show.bs.modal', () => {
        ['name', 'email', 'mobile', 'alt-mobile'].forEach(field => document.getElementById(`edit-${field}`).value = document.getElementById(`user-${field}`).textContent);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initUsageChart();
    initNavigation();
    initSidebarToggle();
    initAutopayToggle();
    initFormHandlers();
    initEditModal();
    populateRechargeHistory();
    updatePhone();
});

function updatePhone(){
    let rewrite=document.getElementById("user-mobile");
    const phone=localStorage.getItem("mobileNumber");
    rewrite.innerText=phone;
}


document.getElementById("logout-btn").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
});

function logout() {
    const loadingOverlay = document.createElement("div");
    loadingOverlay.classList.add(
        "position-fixed", "top-0", "start-0", "w-100", "h-100",
        "bg-dark", "bg-opacity-50", "d-flex", "justify-content-center",
        "align-items-center", "text-white", "fs-4"
    );
    loadingOverlay.innerHTML = "Logging out...";
    document.body.appendChild(loadingOverlay);

    setTimeout(function () {

        localStorage.removeItem("loggedIns");

        document.body.removeChild(loadingOverlay);
        window.location.href = "../Html_files/index.html";
    }, 2000);
}