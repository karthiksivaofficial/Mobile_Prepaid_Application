document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("loggedIns") === "true";
    const profileSection = document.getElementById("profile-section");
    const loginSection = document.getElementById("login-section");

    if (isLoggedIn) {
        profileSection.classList.remove("d-none");
        loginSection.style.display = "none";
    } else {
        profileSection.classList.add("d-none");
        loginSection.style.display = "block";
    }
});

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
