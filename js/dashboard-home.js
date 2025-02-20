document.addEventListener("DOMContentLoaded", function () {
    // Check if the user is logged in
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

// Handle logout
document.getElementById('logout-link').addEventListener("click", function (e) {
    e.preventDefault();

    // Show logout alert
    document.getElementById('logout-alert').style.display = "block";

    // Delay the logout action to allow the user to see the alert
    setTimeout(() => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhone");

        // Redirect to the home page
        window.location.href = "./index.html";
    }, 2000); // 2 seconds delay
});

