const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const numberInput = document.getElementById('number');
const birthdayInput = document.getElementById('birthday')
const birthdayError = document.querySelector('.birthday-error')
const passwordError = document.querySelector(".password-error");
const usernameError = document.querySelector(".username-error");
const numberError = document.querySelector(".number-error")
const emailInput = document.getElementById("email");
const emailError = document.querySelector(".email-error");
const registerButton = document.querySelector("#register-btn");
const confirmPasswordInput = document.getElementById('confirm-password');
const confirmPasswordError = document.querySelector(".confirm-password-error");
const showHidePassword = document.querySelector(".show_hide");

let validLength, includesLowercase, includesUppercase, includesSpecialChar, includesEmailTemplate, includesUsernameTemplate, includesNumberTemplate, validDOB;

usernameInput.addEventListener("input", () => {
    const username = usernameInput.value;

    usernameTemplate = /^[A-Za-z]+$/;
    includesUsernameTemplate = usernameTemplate.test(username)

    if (username.length === 0){
        usernameError.style.display = "none"
    } else if(includesUsernameTemplate) {
        usernameError.style.display = "block";
        usernameError.style.background = "green";
        usernameError.innerHTML = "Valid name"
    } else {
        usernameError.style.display = "block";
        usernameError.style.background = "red";
        usernameError.innerHTML = "Name should only contain letters"
    }

    checkValidatedFields()
})

birthdayInput.addEventListener("input", () => {
    const birthday = birthdayInput.value;
    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    console.log(birthday)

    if (!birthdayRegex.test(birthday)) {
        birthdayError.style.display = "block";
        birthdayError.innerHTML = "Invalid birthday format (YYYY-MM-DD)";
        birthdayError.style.background = "red"
        return;
    }

    // Additional checks for minimum age
    const birthdayDate = new Date(birthday);
    const currentDate = new Date();
    const minAgeDate = new Date(currentDate.getFullYear() - 13, currentDate.getMonth(), currentDate.getDate());

     validDOB = birthdayDate < minAgeDate

    if (birthdayDate > minAgeDate) {
        birthdayError.style.display = "block";
        birthdayError.innerHTML = "You must be at least 13 years old.";
        birthdayError.style.background = "red"
    } else {
        birthdayError.style.display = "block";
        birthdayError.style.background = "green"
        birthdayError.innerHTML = "Valid D.O.B"
    }

    checkValidatedFields();
});
numberInput.addEventListener("input", () => {
    const number = numberInput.value
    numberTemplate = /^\d{11}$/
    includesNumberTemplate = numberTemplate.test(number)

    if (number.length === 0) {
        numberError.style.display = "none"
    } else if (includesNumberTemplate) {
        numberError.style.display = "block";
        numberError.style.background = "green"
        numberError.innerHTML = "Valid Number"
    } else {
        numberError.style.display = "block";
        numberError.style.background = "red"
        numberError.innerHTML = "Invalid Number"
    }

    checkValidatedFields()
})

// Event listener for email input
emailInput.addEventListener("input", () => {
    const email = emailInput.value;

    const emailTemplate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    includesEmailTemplate = emailTemplate.test(email);

    if (email.length === 0) {
        emailError.style.display = "none";
    } else if (includesEmailTemplate) {
        emailError.style.display = "block";
        emailError.style.background = "green";
        emailError.innerHTML = "Valid Email";
    } else {
        emailError.style.display = "block";
        emailError.innerHTML = "Invalid email address.";
        emailError.style.background = "red";
        registerButton.setAttribute('disabled', 'disabled');
    }

    checkValidatedFields();
});


// Event listener for password input
passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    validLength = password.length >= 8;
    includesLowercase = lowercase.test(password);
    includesUppercase = uppercase.test(password);
    includesSpecialChar = specialChar.test(password);

    if (password.length === 0) {
        passwordError.style.display = "none";
    } else if (validLength && includesLowercase && includesUppercase && includesSpecialChar) {
        passwordError.style.display = "block";
        passwordError.style.background = "green";
        passwordError.innerHTML = "Password Valid";
    } else {
        passwordError.style.display = "block";
        passwordError.style.background = "red";
        passwordError.innerHTML = "Password invalid";
    }

    checkPasswords()
    checkValidatedFields();
});

confirmPasswordInput.addEventListener("input", () => {
    let password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword.length === 0){
        confirmPasswordError.style.display = "none"
    } else if (password === confirmPassword) {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "green";
        confirmPasswordError.innerHTML = "Passwords match"
    } else {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "red";
        confirmPasswordError.innerHTML = "Passwords do not match"
    }

    checkPasswords()
    checkValidatedFields()
})

function checkPasswords () {
    const val1 = passwordInput.value;
    const val2 = confirmPasswordInput.value;

    if(val1 === val2) {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "green";
        confirmPasswordError.innerHTML = "Passwords match"
    } else {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "red";
        confirmPasswordError.innerHTML = "Passwords do not match"
    }
    if (val2 === ""){
        confirmPasswordError.style.display = "none";
    }
}


function checkValidatedFields() {
    const passwordsMatch = passwordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.length > 0;

    if (validLength && includesLowercase && includesUppercase && includesSpecialChar && includesEmailTemplate && includesUsernameTemplate && validDOB && includesNumberTemplate && passwordsMatch) {
        registerButton.removeAttribute("disabled");
        registerButton.style.background = "green"
    } else {
        registerButton.setAttribute('disabled', 'disabled');
        registerButton.style.background = "lightgrey"
    }
}


showHidePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showHidePassword.innerHTML = showHidePassword.innerHTML.replace("show", "hide");
    } else {
        passwordInput.type = "password";
        showHidePassword.innerHTML = showHidePassword.innerHTML.replace("hide", "show");
    }
});


document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      var errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    }, 3000);
  });





// changing picture function

function changeProfilePicture() {
    const image = document.getElementById('imagepro');
    const imageInput = document.getElementById('image');    
    const imageUrl = imageInput.value;
    image.src = imageUrl 
}

image.addEventListener('input', () => {
    changeProfilePicture()
})

changeProfilePicture()