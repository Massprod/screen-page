import flashMessage from "../utility/flashMessage/flashMessage.js";
import {
    validatePassword,
} from "../utility/utils.js";


export const createRegistrationForm = async () => {
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Register';
    formContainer.appendChild(formTitle);

    const usernameContainer = document.createElement('div');
    usernameContainer.classList.add('mb-3');
    const usernameLabel = document.createElement('label');
    usernameLabel.classList.add('form-label');
    usernameLabel.setAttribute('for', 'username');
    usernameLabel.textContent = 'Username';
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.classList.add('form-control');
    usernameInput.required = true;
    usernameContainer.appendChild(usernameLabel);
    usernameContainer.appendChild(usernameInput);
    formContainer.appendChild(usernameContainer);

    const passwordContainer = document.createElement('div');
    passwordContainer.classList.add('mb-3');
    const passwordLabel = document.createElement('label');
    passwordLabel.classList.add('form-label');
    passwordLabel.setAttribute('for', 'password');
    passwordLabel.textContent = 'Password';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.classList.add('form-control');
    passwordInput.required = true;
    passwordContainer.appendChild(passwordLabel);
    passwordContainer.appendChild(passwordInput);
    formContainer.appendChild(passwordContainer);

    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.classList.add('mb-3');
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.classList.add('form-label');
    confirmPasswordLabel.setAttribute('for', 'confirmPassword');
    confirmPasswordLabel.textContent = 'Confirm Password';
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.classList.add('form-control');
    confirmPasswordInput.required = true;
    confirmPasswordContainer.appendChild(confirmPasswordLabel);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    formContainer.appendChild(confirmPasswordContainer);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');

    const registerButton = document.createElement('button');
    registerButton.type = 'submit';
    registerButton.className = 'btn btn-primary';
    registerButton.textContent = 'Register';
    registerButton.onclick = (event) => {
        event.preventDefault();
        alert('Registration successful!');
        document.getElementById('blurOverlay').style.display = 'none';
    };

    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').style.display = 'none';
    };

    buttonGroup.appendChild(registerButton);
    buttonGroup.appendChild(cancelButton);
    formContainer.appendChild(buttonGroup);

    return formContainer;
}


export const createPasswordChangeForm = async (
    username,
    changePassAction,
    regex = '^[A-Za-z\\d@$!%*#?&]+$',
    minLength = 8,
    maxLength = 50,
) =>  {
    const passRegex = new RegExp(regex);

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Сменить пароль';
    formContainer.appendChild(formTitle);

    const oldPasswordContainer = document.createElement('div');
    oldPasswordContainer.classList.add('mb-3');
    const oldPasswordLabel = document.createElement('label');
    oldPasswordLabel.classList.add('form-label');
    oldPasswordLabel.setAttribute('for', 'oldPassword');
    oldPasswordLabel.textContent = 'Старый пароль';
    const oldPasswordInput = document.createElement('input');
    oldPasswordInput.type = 'password';
    oldPasswordInput.id = 'oldPassword';
    oldPasswordInput.pattern = passRegex;
    oldPasswordInput.minLength = minLength;
    oldPasswordInput.maxLength = maxLength;
    oldPasswordInput.classList.add('form-control');
    oldPasswordInput.required = true;
    oldPasswordContainer.appendChild(oldPasswordLabel);
    oldPasswordContainer.appendChild(oldPasswordInput);
    formContainer.appendChild(oldPasswordContainer);

    const newPasswordContainer = document.createElement('div');
    newPasswordContainer.classList.add('mb-3');
    const newPasswordLabel = document.createElement('label');
    newPasswordLabel.classList.add('form-label');
    newPasswordLabel.setAttribute('for', 'newPassword');
    newPasswordLabel.textContent = 'Новый пароль';
    const newPasswordInput = document.createElement('input');
    newPasswordInput.type = 'password';
    newPasswordInput.id = 'newPassword';
    newPasswordInput.pattern = passRegex;
    newPasswordInput.minLength = minLength;
    newPasswordInput.maxLength = maxLength;
    newPasswordInput.classList.add('form-control');
    newPasswordInput.required = true;
    newPasswordContainer.appendChild(newPasswordLabel);
    newPasswordContainer.appendChild(newPasswordInput);
    formContainer.appendChild(newPasswordContainer);

    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.classList.add('mb-3');
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.classList.add('form-label');
    confirmPasswordLabel.setAttribute('for', 'confirmPassword');
    confirmPasswordLabel.textContent = 'Подтвердите новый пароль';
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.pattern = passRegex;
    confirmPasswordInput.minLength = minLength;
    confirmPasswordInput.maxLength = maxLength;
    confirmPasswordInput.classList.add('form-control');
    confirmPasswordInput.required = true;
    confirmPasswordContainer.appendChild(confirmPasswordLabel);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    formContainer.appendChild(confirmPasswordContainer);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');

    const changeButton = document.createElement('button');
    changeButton.type = 'submit';
    changeButton.className = 'btn btn-warning';
    changeButton.textContent = 'Сменить пароль';
    changeButton.onclick = async (event) => {
        event.preventDefault();
        changeButton.disabled = true;
        changeButton.textContent = 'Выполняется...';
        // PASS change function
        const oldPass = oldPasswordInput.value;
        const newPass = newPasswordInput.value;
        const repeatPass = confirmPasswordInput.value;
        if (newPass !== repeatPass) {
            alert('Новый пароль не совпадает с подтверждением');
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            changeButton.disabled = false;
            changeButton.textContent = 'Сменить пароль';
            return;
        }
        if (!validatePassword(oldPass, regex, minLength, maxLength)) {
            changeButton.disabled = false;
            changeButton.textContent = 'Сменить пароль';
            return;
        }
        if (!validatePassword(newPass, regex, minLength, maxLength)) {
            changeButton.disabled = false;
            changeButton.textContent = 'Сменить пароль';
            return;
        }
        const passData = {
            'oldPassword': oldPass,
            'newPassword': newPass,
            'username': username,
        }
        const result = await changePassAction(passData);
        if (result) {
            document.getElementById('blurOverlay').style.display = 'none';
            changeButton.disabled = false;
            changeButton.textContent = 'Сменить пароль';
        } else {
            changeButton.disabled = false;
            changeButton.textContent = 'Сменить пароль';
        }
    };
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').style.display = 'none';
    };
    buttonGroup.appendChild(changeButton);
    buttonGroup.appendChild(cancelButton);
    formContainer.appendChild(buttonGroup);

    return formContainer;
}



export const resetPasswordForm = async (
    username,
    resetPassAction,
    regex = '^[A-Za-z\\d@$!%*#?&]+$',
    minLength = 8,
    maxLength = 50,
) =>  {
    const passRegex = new RegExp(regex);

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Сбросить пароль';
    formContainer.appendChild(formTitle);

    const newPasswordContainer = document.createElement('div');
    newPasswordContainer.classList.add('mb-3');
    const newPasswordLabel = document.createElement('label');
    newPasswordLabel.classList.add('form-label');
    newPasswordLabel.setAttribute('for', 'newPassword');
    newPasswordLabel.textContent = 'Новый пароль';
    const newPasswordInput = document.createElement('input');
    newPasswordInput.type = 'password';
    newPasswordInput.id = 'newPassword';
    newPasswordInput.pattern = passRegex;
    newPasswordInput.minLength = minLength;
    newPasswordInput.maxLength = maxLength;
    newPasswordInput.classList.add('form-control');
    newPasswordInput.required = true;
    newPasswordContainer.appendChild(newPasswordLabel);
    newPasswordContainer.appendChild(newPasswordInput);
    formContainer.appendChild(newPasswordContainer);

    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.classList.add('mb-3');
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.classList.add('form-label');
    confirmPasswordLabel.setAttribute('for', 'confirmPassword');
    confirmPasswordLabel.textContent = 'Подтвердите новый пароль';
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.pattern = passRegex;
    confirmPasswordInput.minLength = minLength;
    confirmPasswordInput.maxLength = maxLength;
    confirmPasswordInput.classList.add('form-control');
    confirmPasswordInput.required = true;
    confirmPasswordContainer.appendChild(confirmPasswordLabel);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    formContainer.appendChild(confirmPasswordContainer);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');

    const resetButton = document.createElement('button');
    resetButton.type = 'submit';
    resetButton.className = 'btn btn-warning';
    resetButton.textContent = 'Сбросить пароль';
    resetButton.onclick = async (event) => {
        event.preventDefault();
        // PASS change function
        resetButton.disabled = true;
        resetButton.textContent = 'Выполняется...';
        const newPass = newPasswordInput.value;
        const repeatPass = confirmPasswordInput.value;
        if (newPass && repeatPass) {
            if (newPass !== repeatPass) {
                alert('Новый пароль не совпадает с подтверждением');
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
                resetButton.disabled = false;
                resetButton.textContent = 'Сбросить пароль';
                return;
            }
            if (!validatePassword(newPass, regex, minLength, maxLength)) {
                resetButton.disabled = false;
                resetButton.textContent = 'Сбросить пароль';
                return;
            }
        }
        const passData = {
            'newPassword': newPass,
            'username': username,
        }
        const result = await resetPassAction(passData);
        if (result) {
            document.getElementById('blurOverlay').style.display = 'none';
            resetButton.disabled = false;
            resetButton.textContent = 'Сбросить пароль';
        } else {
            resetButton.disabled = false;
            resetButton.textContent = 'Сбросить пароль';
        }
    };
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').style.display = 'none';
    };
    buttonGroup.appendChild(resetButton);
    buttonGroup.appendChild(cancelButton);
    formContainer.appendChild(buttonGroup);

    return formContainer;
}
