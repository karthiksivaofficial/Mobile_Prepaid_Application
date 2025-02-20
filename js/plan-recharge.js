const buyButtons = document.querySelectorAll(".btn-primary");

buyButtons.forEach(button => {
    button.addEventListener("click", function () {
        // Get the parent card element
        const card = button.closest('.plan-card');

        // Get the details from the card
        const price = card.querySelector('.card-title').textContent;
        const planDetails = card.querySelector('.card-text').textContent;
        const phoneNumber=document.getElementById("phone-number").textContent;

        // Define additional plan features
        const additionalDetails = `
            ✔ Unlimited Calls <br>
            ✔ 2GB/Day Data <br>
            ✔ 100 SMS/Day <br>
            ✔ 365 Days Validity
        `;

        // Store the details in localStorage
        localStorage.setItem("selectedPlan", JSON.stringify({
            price: price,
            planDetails: planDetails,
            additionalDetails: additionalDetails,
            phoneNumber:phoneNumber
        }));

        // Redirect to the recharge page
        window.location.href = "Recharge.html";
    });
});


const changeNumberLink = document.getElementById('change-number-link');
const phoneNumberDisplay = document.getElementById('phone-number');
const modal = document.getElementById('change-number-modal');
const saveButton = document.getElementById('save-number');
const cancelButton = document.getElementById('cancel-button');
const newPhoneNumberInput = document.getElementById('new-phone-number');

changeNumberLink.addEventListener('click', function (event) {
    event.preventDefault();
    $('#change-number-modal').modal('show');
});

saveButton.addEventListener('click', function () {
    const newPhoneNumber = newPhoneNumberInput.value.trim();

    if (newPhoneNumber) {
        phoneNumberDisplay.textContent = newPhoneNumber;
        $('#change-number-modal').modal('hide');
    } else {
        alert("Please enter a valid phone number");
    }
});

cancelButton.addEventListener('click', function () {
    $('#change-number-modal').modal('hide');
});