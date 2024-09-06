import {
    validatePassword
} from "../utility/utils.js";


const alterButtonState = async (button, buttonText) => {
    if (button.disabled) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
    button.textContent = buttonText;
}


export const createRegistrationForm = async (
    availableRoles,
    registerNewUserAction,
    usernameRegex = '^[\\-._a-zA-Z0-9]+$',
    usernameMinLength = 3,
    usernameMaxLength = 20,
    passwordRegex = '^[A-Za-z\\d@$!%*#?&]+$',
    passwordMinLength = 8,
    passwordMaxLength = 50,
) => {
    const buttonRegisterText = 'Зарегистировать';
    const buttonPendingText = 'Выполняется...';
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');
    
    const mainForm = document.createElement('form');
    formContainer.appendChild(mainForm);
    // TITLE
    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Регистрация';
    mainForm.appendChild(formTitle);
    // --
    // USERNAME FIELD
    const usernameContainer = document.createElement('div');
    usernameContainer.classList.add('mb-3');
    const usernameLabel = document.createElement('label');
    usernameLabel.classList.add('form-label');
    usernameLabel.setAttribute('for', 'username');
    usernameLabel.textContent = 'Имя';
    const usernameInput = document.createElement('input');
    usernameInput.classList.add('form-control');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    // USERNAME VALIDATION
    usernameInput.pattern = usernameRegex;
    usernameInput.required = true;
    usernameInput.minLength = usernameMinLength;
    usernameInput.maxLength = usernameMaxLength;
    // ---
    usernameContainer.appendChild(usernameLabel);
    usernameContainer.appendChild(usernameInput);
    mainForm.appendChild(usernameContainer);
    // PASSWORD FIELD
    const passwordContainer = document.createElement('div');
    passwordContainer.classList.add('mb-3');
    const passwordLabel = document.createElement('label');
    passwordLabel.classList.add('form-label');
    passwordLabel.setAttribute('for', 'password');
    passwordLabel.textContent = 'Пароль';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.classList.add('form-control');
    // PASSWORD VALIDATION
    passwordInput.pattern = passwordRegex;
    passwordInput.required = true;
    passwordInput.minLength = passwordMinLength;
    passwordInput.maxLength = passwordMaxLength;
    // ---
    passwordContainer.appendChild(passwordLabel);
    passwordContainer.appendChild(passwordInput);
    mainForm.appendChild(passwordContainer);
    // CONFIRM PASSWORD FIELD
    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.classList.add('mb-3');
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.classList.add('form-label');
    confirmPasswordLabel.setAttribute('for', 'confirmPassword');
    confirmPasswordLabel.textContent = 'Подтвердите пароль';
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.classList.add('form-control');
    // CONFIRM PASS VALIDATION
    confirmPasswordInput.pattern = passwordRegex;
    confirmPasswordInput.required = true;
    confirmPasswordInput.minLength = passwordMinLength;
    confirmPasswordInput.maxLength = passwordMaxLength;
    // ---
    confirmPasswordContainer.appendChild(confirmPasswordLabel);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    mainForm.appendChild(confirmPasswordContainer);
    // ---
    // ROLE FIELD
    const roleContainer = document.createElement('div');
    roleContainer.classList.add('mb-3');
    const roleLabel = document.createElement('label');
    roleLabel.classList.add('form-label');
    roleLabel.setAttribute('for', 'roleSelect');
    roleLabel.textContent = 'Роль пользователя';
    const roleSelect = document.createElement('select');
    roleSelect.id = 'roleSelect';
    roleSelect.classList.add('form-control');
    roleSelect.required = true;
    availableRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleSelect.appendChild(option);
    });
    roleContainer.appendChild(roleLabel);
    roleContainer.appendChild(roleSelect);
    mainForm.appendChild(roleContainer);
    // ---
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between', 'gap-2');
    // REGISTER BUTTION
    const registerButton = document.createElement('button');
    registerButton.type = 'submit';
    registerButton.className = 'btn btn-warning';
    registerButton.textContent = buttonRegisterText;
    // ---
    // CANCEL BUTTON
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
        usernameInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
    };
    // ---
    buttonGroup.appendChild(registerButton);
    buttonGroup.appendChild(cancelButton);
    mainForm.appendChild(buttonGroup);

    mainForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await alterButtonState(registerButton, buttonPendingText);
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if(password !== confirmPassword) {
            // No idea why, but changing `setCustomValidity()` is a one way path.
            // If we change it once, we can't alter it to default...
            // https://developer.mozilla.org/en-US/docs/Web/API/ValidityState/customError
            // ^^ offical docs, but it doesnt work, leaving as a simple `alert`. Dunno.
            alert('Пароль и подтверждение не совпадают');
            await alterButtonState(registerButton, buttonRegisterText);
            return;
        }
        if (!usernameInput.reportValidity()
                || !roleSelect.reportValidity()
                || !passwordInput.reportValidity()
                || !confirmPasswordInput.reportValidity()) {
                    await alterButtonState(registerButton, buttonRegisterText);
                    return;
        }
        if (passwordInput.reportValidity()) {
            if (!validatePassword(
                password,
                passwordRegex,
                passwordMinLength,
                passwordMaxLength,
            )) {
                await alterButtonState(registerButton, buttonRegisterText);
                return;
            }
        }
        const userRole = roleSelect.value;
        const newUserData = {
            'username': usernameInput.value,
            'password': password,
            'userRole': userRole,
        };
        const result = await registerNewUserAction(newUserData);
        if (result) {
            document.getElementById('blurOverlay').remove();
            usernameInput.value = '';
            passwordInput.value = '';
            confirmPasswordInput.value = '';
        }
        await alterButtonState(registerButton, buttonRegisterText);
    })
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
        if (!validatePassword(oldPass, regex, minLength, maxLength)
             || !validatePassword(newPass, regex, minLength, maxLength)) {
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
            document.getElementById('blurOverlay').remove();
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        }
        changeButton.disabled = false;
        changeButton.textContent = 'Сменить пароль';
    };
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
    };
    buttonGroup.appendChild(changeButton);
    buttonGroup.appendChild(cancelButton);
    formContainer.appendChild(buttonGroup);

    return formContainer;
}



export const createResetPasswordForm = async (
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
        if (newPass || repeatPass) {
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
            document.getElementById('blurOverlay').remove();
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        }
        resetButton.disabled = false;
        resetButton.textContent = 'Сбросить пароль';
    };
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
    };
    buttonGroup.appendChild(resetButton);
    buttonGroup.appendChild(cancelButton);
    formContainer.appendChild(buttonGroup);

    return formContainer;
}


export const createChangeRoleForm = async(
    username,
    availableRoles,
    changeRoleAction,
) => {
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Изменить роль';
    formContainer.appendChild(formTitle);

    const roleContainer = document.createElement('div');
    roleContainer.classList.add('mb-3');
    const roleLabel = document.createElement('label');
    roleLabel.classList.add('form-label');
    roleLabel.setAttribute('for', 'roleSelect');
    roleLabel.textContent = 'Выберите новую роль';
    const roleSelect = document.createElement('select');
    roleSelect.id = 'roleSelect';
    roleSelect.classList.add('form-control');
    roleSelect.required = true;

    availableRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleSelect.appendChild(option);
    });

    roleContainer.appendChild(roleLabel);
    roleContainer.appendChild(roleSelect);
    formContainer.appendChild(roleContainer);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');

    const changeButton = document.createElement('button');
    changeButton.type = 'submit';
    changeButton.className = 'btn btn-warning';
    changeButton.textContent = 'Изменить роль';
    changeButton.onclick = async (event) => {
        event.preventDefault();
        changeButton.disabled = true;
        changeButton.textContent = 'Выполняется...';

        const selectedRole = roleSelect.value;
        if (!selectedRole) {
            alert('Пожалуйста, выберите новую роль');
            changeButton.disabled = false;
            changeButton.textContent = 'Изменить роль';
            return;
        }

        const roleData = {
            'username': username,
            'newRole': selectedRole,
        }
        const result = await changeRoleAction(roleData);
        if (result) {
            document.getElementById('blurOverlay').remove();
        }
        changeButton.disabled = false;
        changeButton.textContent = 'Изменить роль';
    }

    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
    };

    buttonGroup.appendChild(changeButton);
    buttonGroup.appendChild(cancelButton);
    formContainer.appendChild(buttonGroup);
    return formContainer;
}