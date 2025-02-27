document.addEventListener("DOMContentLoaded", function () {
    let loggedIn = localStorage.getItem("loggedIn") === "true";
    let name = localStorage.getItem("userName");

    if (loggedIn && name) {
        const dropdownMenu = document.getElementById("profile-dropdown");
        document.getElementById('username-display').innerText = name;
        const logoutFeature = document.getElementById('logout-feature');
        dropdownMenu.addEventListener('mouseover', () => {
            logoutFeature.style.display = 'block';
        });
        dropdownMenu.addEventListener('mouseout', () => {
            logoutFeature.style.display = 'none';
        });
        document.getElementById("login-feature").style.display = "none";
    } else {
        document.getElementById('username-display').innerText = "";
        document.getElementById("logout-feature").style.display = "none";
        const dropdownMenu = document.getElementById("profile-dropdown");
        document.getElementById('username-display').innerText = name;
        const loginFeature = document.getElementById('login-feature');
        dropdownMenu.addEventListener('mouseover', () => {
            loginFeature.style.display = 'block';
        });
        dropdownMenu.addEventListener('mouseout', () => {
            loginFeature.style.display = 'none';
        });
    }
});


document.getElementById('logout-link').addEventListener("click", function (e) {
    logout();
});

function logout() {
    const loadingOverlay = document.createElement("div");
    loadingOverlay.classList.add("position-fixed", "top-0", "start-0", "w-100", "h-100", "bg-dark", "bg-opacity-50", "d-flex", "justify-content-center", "align-items-center", "text-white", "fs-4");
    loadingOverlay.innerHTML = "Logging out...";
    document.body.appendChild(loadingOverlay);

    setTimeout(function() {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("floatingInput");
        window.location.href = "index.html";
    },2000);

}
