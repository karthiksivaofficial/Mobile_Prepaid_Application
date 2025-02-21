document.addEventListener("DOMContentLoaded", function () {
    const buyButtons = document.querySelectorAll(".btn-primary");
    const changeNumberLink = document.getElementById('change-number-link');
    const mobile_number = document.getElementById("phone-number");

    let floatingInput = localStorage.getItem("floatingInput");
    if (floatingInput) {
        mobile_number.textContent = floatingInput;
    } else {
        mobile_number.textContent = "Enter Number";
    }

    buyButtons.forEach(button => {
        button.addEventListener("click", function () {
            const card = button.closest('.plan-card');
            const price = card.querySelector('.card-title').textContent;
            const planDetails = card.querySelector('.card-text').textContent;
            const additionalDetails = `
                ✔ Unlimited Calls <br>
                ✔ 2GB/Day Data <br>
                ✔ 100 SMS/Day <br>
                ✔ 365 Days Validity
            `;

            floatingInput = localStorage.getItem("floatingInput");

            if (floatingInput) {
                mobile_number.textContent = floatingInput;
                savePlanAndRedirect(price, planDetails, additionalDetails, floatingInput);
            } else {
                let modal = $('#change-number-modal');
                let saveButton = document.getElementById('save-number');
                let cancelButton = document.getElementById('cancel-button');
                let newPhoneNumberInput = document.getElementById('new-phone-number');
                modal.modal('show');

                $(saveButton).off('click').on('click', function () {
                    const newPhoneNumber = newPhoneNumberInput.value.trim();
                    if (newPhoneNumber) {
                        localStorage.setItem("floatingInput", newPhoneNumber);
                        mobile_number.textContent = newPhoneNumber;
                        modal.modal('hide');
                        savePlanAndRedirect(price, planDetails, additionalDetails, newPhoneNumber);
                    } else {
                        alert("Please enter a valid phone number");
                    }
                });

                $(cancelButton).off('click').on('click', function () {
                    modal.modal('hide');
                });
            }
        });
    });

    changeNumberLink.addEventListener("click", function (event) {
        event.preventDefault();


        let modal = $('#change-number-modal');
        let saveButton = document.getElementById('save-number');
        let cancelButton = document.getElementById('cancel-button');
        let newPhoneNumberInput = document.getElementById('new-phone-number');
        modal.modal('show');

        $(saveButton).off('click').on('click', function () {
            const newPhoneNumber = newPhoneNumberInput.value.trim();
            if (newPhoneNumber) {
                localStorage.setItem("floatingInput", newPhoneNumber);
                modal.modal('hide');
                location.reload();
            } else {
                alert("Please enter a valid phone number");
            }
        });

        $(cancelButton).off('click').on('click', function () {
            modal.modal('hide');
        });
    });
});

function savePlanAndRedirect(price, planDetails, additionalDetails, phoneNumber) {
    localStorage.setItem("selectedPlan", JSON.stringify({
        price: price,
        planDetails: planDetails,
        additionalDetails: additionalDetails,
        phoneNumber: phoneNumber
    }));
    window.location.href = "Recharge.html";
}
