document.addEventListener("DOMContentLoaded", function () {
    let phone = localStorage.getItem("floatingInput");
    if (phone) {
        document.getElementById("user-mobile").textContent =phone;
        let name=document.getElementById("user-name").textContent;
        localStorage.setItem("userName", name);
    } else {
        document.getElementById("user-mobile").textContent = "Not available";
    }
});
document.getElementById('submitOtp').addEventListener("click", function () {
    const otpInputs = document.querySelectorAll(".otp-input");
    let isOtpComplete = true;
    let otpValue = "";
    otpInputs.forEach(input => {
        if (input.value.trim() === "") {
            isOtpComplete = false;
        }
        otpValue += input.value.trim();
    });
    if (isOtpComplete) {
        let phone = document.getElementById("phone").value;
        localStorage.setItem("floatingInput", phone);
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userName", "User");
        window.location.href = "./userDashboard.html";
    } else {
        alert("Please enter all OTP digits.");
        otpInputs[0].focus();
    }
});