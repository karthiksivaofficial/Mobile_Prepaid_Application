let currentImage = 0;
const images = [
  'linear-gradient(to right, #ff7e5f, #feb47b)',
  'linear-gradient(to right, #6a11cb, #2575fc)',
  'linear-gradient(to right, #ff9a9e, #fad0c4)'
];

function changeImage() {
  currentImage = (currentImage + 1) % images.length;
  document.getElementById('recommended-img').style.background = images[currentImage];
}

function backToImage() {
  currentImage = (currentImage - 1 + images.length) % images.length;
  document.getElementById('recommended-img').style.background = images[currentImage];
}

var plansData = {
  jio: [
    { plan: "299₹", validity: 28, data: "2GB/Day" },
    { plan: "499₹", validity: 56, data: "1.5GB/Day" }
  ],
  airtel: [
    { plan: "399₹", validity: 28, data: "3GB/Day" },
    { plan: "599₹", validity: 84, data: "2GB/Day" }
  ],
  vi: [
    { plan: "269₹", validity: 28, data: "1GB/Day" },
    { plan: "479₹", validity: 56, data: "2GB/Day" }
  ],
  bsnl: [
    { plan: "247₹", validity: 30, data: "2GB/Day" },
    { plan: "399₹", validity: 60, data: "1.5GB/Day" }
  ]
};

function showPlans() {
  const selectedOperator = document.getElementById("operator-type").value;
  const plansContainer = document.querySelector(".plans-list");
  plansContainer.innerHTML = "";

  if (selectedOperator in plansData) {
    plansData[selectedOperator].forEach(plan => {
      const listItem = document.createElement("li");
      listItem.classList.add("plan-item");
      listItem.innerHTML = `
        <span>${plan.plan}</span>
        <span class="badge">${plan.validity} days</span>
        <span>${plan.data}</span>
      `;
      plansContainer.appendChild(listItem);
    });
  }
}

document.getElementById("operator-type").addEventListener("change", showPlans);

document.addEventListener("DOMContentLoaded", function() {
  let carousel = new bootstrap.Carousel(document.getElementById("testimonialCarousel"), {
    interval: 10000,
    wrap: true
  });

  document.getElementById("prevBtn").addEventListener("click", function () {
    carousel.prev();
  });

  document.getElementById("nextBtn").addEventListener("click", function () {
    carousel.next();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  let loggedIn=localStorage.getItem("loggedIn");
  if(!loggedIn){
    localStorage.removeItem("floatingInput");
  }
  let rechargeBtn = document.getElementById("recharge-btn");
  let otpModal = new bootstrap.Modal(document.getElementById("otpModal"));
  let otpInputs = document.querySelectorAll(".otp-input");
  let resendOtpBtn = document.getElementById("resendOtp");
  let timerDisplay = document.getElementById("timer");
  let home_mobile = document.getElementById("floatingInput");
  let mobileAlert = document.getElementById("mobileAlert");
  let timer;

  rechargeBtn.addEventListener("click", function (event) {
    event.preventDefault();


    let mobileNumber = home_mobile.value.trim();
    let mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobileNumber)) {

      mobileAlert.classList.remove("d-none");
      mobileAlert.classList.add("show");
      home_mobile.focus();
      return;
    } else {

      localStorage.setItem("floatingInput",home_mobile.value);
      mobileAlert.classList.add("d-none");
      mobileAlert.classList.remove("show");
    }


    otpModal.show();
    startTimer();
    clearOtpFields();
  });


  cancelAlert.addEventListener("click", function () {
    mobileAlert.classList.add("d-none");
    mobileAlert.classList.remove("show");
  });

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, ''); // Allow only numbers
      if (this.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Backspace" && !this.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  function startTimer() {
    clearInterval(timer);
    let timeLeft = 60;
    resendOtpBtn.disabled = true;
    resendOtpBtn.style.color = "gray";
    updateTimerDisplay(timeLeft);

    timer = setInterval(function () {
      timeLeft--;
      updateTimerDisplay(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        resendOtpBtn.disabled = false;
        resendOtpBtn.style.color = "blue";
        timerDisplay.textContent = "You can now resend OTP.";
      }
    }, 1000);
  }

  function updateTimerDisplay(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timerDisplay.textContent = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function clearOtpFields() {
    otpInputs.forEach(input => input.value = "");
    otpInputs[0].focus();
  }
});
document.querySelectorAll(".toggle-item").forEach(item => {
  item.addEventListener("click", function() {
    let icon = this.querySelector(".toggle-icon");
    if (icon.classList.contains("fa-circle-plus")) {
      icon.classList.replace("fa-circle-plus", "fa-circle-minus");
    } else {
      icon.classList.replace("fa-circle-minus", "fa-circle-plus");
    }
  });
});

document.getElementById("submitOtp").addEventListener("click",function (){
    window.location.href="./plans.html";
});




