document.addEventListener("DOMContentLoaded", function () {
    let phone = localStorage.getItem("userPhone");
    if (phone) {
        document.getElementById("user-mobile").textContent =phone;
        let name=document.getElementById("user-name").textContent;
        localStorage.setItem("userName", name);
    } else {
        document.getElementById("user-mobile").textContent = "Not available";
    }
});
document.getElementById('submitOtp').addEventListener("click", function () {
    let phone = document.getElementById("phone").value;
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userName", "User");
    window.location.href = "./userDashboard.html";
});