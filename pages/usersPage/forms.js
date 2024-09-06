import { REVERSE_ROLE_TRANSLATION } from "../uniConstants.js";
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


const showForm = async (form) => {
    let overlay = document.getElementById('blurOverlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'blurOverlay';
        overlay.classList.add('blur-overlay');
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = '';
    overlay.appendChild(form); 
    overlay.style.display = 'flex';
}


export const createRegistrationForm = async (
    availableRoles,
    registerNewUserAction,
    usernameRegex,
    usernameRegexTitle,
    usernameMinLength,
    usernameMaxLength,
    passwordRegex,
    passwordRegexTitle,
    passwordMinLength,
    passwordMaxLength,
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
    usernameInput.title = usernameRegexTitle;
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
    passwordInput.title = passwordRegexTitle;
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
    confirmPasswordInput.title = passwordRegexTitle;
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
    registerButton.onclick = event => {
        passwordInput.setCustomValidity('');
        usernameInput.setCustomValidity('');
    }
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
            // ^^ FIXED: it was blocking form from `submit` action and we needed to restore it somewhere else!
            passwordInput.setCustomValidity('Пароль и подтверждение не совпадают');
            passwordInput.reportValidity();
            await alterButtonState(registerButton, buttonRegisterText);
            return;
        }
        if (!usernameInput.reportValidity() || !roleSelect.reportValidity()) {
            await alterButtonState(registerButton, buttonRegisterText);
            return;
        }
        if (passwordInput.reportValidity()) {
            if (!validatePassword(
                passwordInput,
                password,
                passwordRegex,
            )) {
                passwordInput.reportValidity();
                await alterButtonState(registerButton, buttonRegisterText);
                return;
            }
        } else {
            await alterButtonState(registerButton, buttonRegisterText);
            return;
        }
        const userRole = roleSelect.value;
        const newUserData = {
            'username': usernameInput.value,
            'password': password,
            'userRole': userRole,
        };
        const result = await registerNewUserAction(usernameInput, newUserData);
        if (result) {
            document.getElementById('blurOverlay').remove();
            usernameInput.value = '';
            passwordInput.value = '';
            confirmPasswordInput.value = '';
        }
        await alterButtonState(registerButton, buttonRegisterText);
    })

    showForm(formContainer);
}


export const createPasswordChangeForm = async (
    username,
    changePassAction,
    passwordRegex,
    passwordRegexTitle,
    passwordMinLength,
    passwordMaxLength,
) =>  {
    const buttonPendingText = 'Выполняется...';
    const buttonChangeText = 'Сменить пароль';
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const mainForm = document.createElement('form');
    formContainer.appendChild(mainForm);
    // TITLE
    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Смена пароля';
    mainForm.appendChild(formTitle);
    // ---
    // OLD PASSWORD FIELD
    const oldPasswordContainer = document.createElement('div');
    oldPasswordContainer.classList.add('mb-3');
    const oldPasswordLabel = document.createElement('label');
    oldPasswordLabel.classList.add('form-label');
    oldPasswordLabel.setAttribute('for', 'oldPassword');
    oldPasswordLabel.textContent = 'Старый пароль';
    const oldPasswordInput = document.createElement('input');
    oldPasswordInput.id = 'oldPassword';
    oldPasswordInput.type = 'password';
    oldPasswordInput.required = true;
    oldPasswordInput.pattern = passwordRegex;
    oldPasswordInput.minLength = passwordMinLength;
    oldPasswordInput.maxLength = passwordMaxLength;
    oldPasswordInput.title = passwordRegexTitle;
    oldPasswordInput.classList.add('form-control');
    oldPasswordContainer.appendChild(oldPasswordLabel);
    oldPasswordContainer.appendChild(oldPasswordInput);
    mainForm.appendChild(oldPasswordContainer);
    // ---
    // NEW PASSWORD FIELD
    const newPasswordContainer = document.createElement('div');
    newPasswordContainer.classList.add('mb-3');
    const newPasswordLabel = document.createElement('label');
    newPasswordLabel.classList.add('form-label');
    newPasswordLabel.setAttribute('for', 'newPassword');
    newPasswordLabel.textContent = 'Новый пароль';
    const newPasswordInput = document.createElement('input');
    newPasswordInput.id = 'newPassword';
    newPasswordInput.type = 'password';
    newPasswordInput.required = true;
    newPasswordInput.pattern = passwordRegex;
    newPasswordInput.minLength = passwordMinLength;
    newPasswordInput.maxLength = passwordMaxLength;
    newPasswordInput.title = passwordRegexTitle;
    newPasswordInput.classList.add('form-control');
    newPasswordContainer.appendChild(newPasswordLabel);
    newPasswordContainer.appendChild(newPasswordInput);
    mainForm.appendChild(newPasswordContainer);
    // ---
    // CONFIRM PASSWORD FIELD
    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.classList.add('mb-3');
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.classList.add('form-label');
    confirmPasswordLabel.setAttribute('for', 'confirmPassword');
    confirmPasswordLabel.textContent = 'Подтвердите новый пароль';
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.required = true;
    confirmPasswordInput.pattern = passwordRegex;
    confirmPasswordInput.minLength = passwordMinLength;
    confirmPasswordInput.maxLength = passwordMaxLength;
    confirmPasswordInput.title = passwordRegexTitle;
    confirmPasswordInput.classList.add('form-control');
    confirmPasswordContainer.appendChild(confirmPasswordLabel);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    mainForm.appendChild(confirmPasswordContainer);
    // ---
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');
    const changeButton = document.createElement('button');
    changeButton.type = 'submit';
    changeButton.className = 'btn btn-warning';
    changeButton.textContent = buttonChangeText;
    changeButton.onclick = async (event) => {
        newPasswordInput.setCustomValidity('');
        oldPasswordInput.setCustomValidity('');
    };
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    };
    buttonGroup.appendChild(changeButton);
    buttonGroup.appendChild(cancelButton);
    mainForm.appendChild(buttonGroup);
    
    mainForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await alterButtonState(changeButton, buttonPendingText);
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (newPassword !== confirmPassword) {
            newPasswordInput.setCustomValidity('Пароль и подтверждение не совпадают');
            newPasswordInput.reportValidity();
            await alterButtonState(changeButton, buttonChangeText);
            return;
        }
        if (!oldPasswordInput.reportValidity()
             || !newPasswordInput.reportValidity()) {
                await alterButtonState(changeButton, buttonChangeText);
                return;
            }
        const oldPassword = oldPasswordInput.value;
        if (!validatePassword(
            newPasswordInput,
            newPassword,
            passwordRegex,
        )) {
            newPasswordInput.reportValidity();
            await alterButtonState(changeButton, buttonChangeText);
            return;
        }
        const newPassData = {
            'oldPassword': oldPassword,
            'newPassword': newPassword,
            'username': username,
        }
        const result = await changePassAction(newPasswordInput, oldPasswordInput, newPassData);
        if (result) {
            document.getElementById('blurOverlay').remove();
            oldPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        }
        await alterButtonState(changeButton, buttonChangeText);
    });

    showForm(formContainer);
}


export const createResetPasswordForm = async (
    username,
    resetPassAction,
    passwordRegex,
    passwordRegexTitle,
    passwordMinLength,
    passwordMaxLength,
) =>  {
    const buttonPendingText = 'Выполняется...';
    const resetButtonText = 'Сбросить пароль';
    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const mainForm = document.createElement('form');
    formContainer.appendChild(mainForm);
    // TITLE
    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Сбросить пароль';
    mainForm.appendChild(formTitle);
    // ---
    // NEW PASSWORD FIELD
    const newPasswordContainer = document.createElement('div');
    newPasswordContainer.classList.add('mb-3');
    const newPasswordLabel = document.createElement('label');
    newPasswordLabel.classList.add('form-label');
    newPasswordLabel.setAttribute('for', 'newPassword');
    newPasswordLabel.textContent = 'Новый пароль';
    const newPasswordInput = document.createElement('input');
    newPasswordInput.id = 'newPassword';
    newPasswordInput.type = 'password';
    newPasswordInput.required = false;
    newPasswordInput.pattern = passwordRegex;
    newPasswordInput.minLength = passwordMinLength;
    newPasswordInput.maxLength = passwordMaxLength;
    newPasswordInput.title = passwordRegexTitle;
    newPasswordInput.classList.add('form-control');
    newPasswordContainer.appendChild(newPasswordLabel);
    newPasswordContainer.appendChild(newPasswordInput);
    mainForm.appendChild(newPasswordContainer);
    // ---
    // CONFIRM PASSWORD FIELD
    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.classList.add('mb-3');
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.classList.add('form-label');
    confirmPasswordLabel.setAttribute('for', 'confirmPassword');
    confirmPasswordLabel.textContent = 'Подтвердите новый пароль';
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.required = false;
    confirmPasswordInput.pattern = passwordRegex;
    confirmPasswordInput.minLength = passwordMinLength;
    confirmPasswordInput.maxLength = passwordMaxLength;
    confirmPasswordInput.title = passwordRegexTitle;
    confirmPasswordInput.classList.add('form-control');
    confirmPasswordContainer.appendChild(confirmPasswordLabel);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    mainForm.appendChild(confirmPasswordContainer);
    // ---
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');
    // RESET BUTTON
    const resetButton = document.createElement('button');
    resetButton.type = 'submit';
    resetButton.className = 'btn btn-warning';
    resetButton.textContent = resetButtonText;
    resetButton.onclick = async (event) => {
        newPasswordInput.setCustomValidity('');
        confirmPasswordInput.setCustomValidity('');
    };
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    };
    buttonGroup.appendChild(resetButton);
    buttonGroup.appendChild(cancelButton);
    mainForm.appendChild(buttonGroup);
    
    mainForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await alterButtonState(resetButton, buttonPendingText);
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                confirmPasswordInput.setCustomValidity('Пароль и подтверждение не совпадают');
                confirmPasswordInput.reportValidity();
                await alterButtonState(resetButton, resetButtonText);
                return;
            }
            if (!newPasswordInput.reportValidity()) {
                await alterButtonState(resetButton, resetButtonText);
                return;
            }
            if (!validatePassword(
                newPasswordInput,
                newPassword,
                passwordRegex,
            )) {
                newPasswordInput.reportValidity();
                await alterButtonState(resetButton, resetButtonText);
                return;
            }
        }
        const newPassData = {
            'username': username,
            'newPassword': newPassword,
        };
        const result = await resetPassAction(newPassData);
        if (result) {
            document.getElementById('blurOverlay').remove();
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        }
        await alterButtonState(resetButton, resetButtonText);
    })

    showForm(formContainer);
}


export const createChangeRoleForm = async(
    username,
    currentRole,
    availableRoles,
    changeRoleAction,
) => {
    const roleButtonText = 'Сменить роль';
    const buttonPendingText = 'Выполняется...';

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const mainForm = document.createElement('form');
    formContainer.appendChild(mainForm);
    // TITLE
    const formTitle = document.createElement('h4');
    formTitle.classList.add('text-center');
    formTitle.textContent = 'Изменить роль';
    mainForm.appendChild(formTitle);
    // ---
    // ROLE SELECT
    const roleContainer = document.createElement('div');
    roleContainer.classList.add('mb-3');
    const roleLabel = document.createElement('label');
    roleLabel.classList.add('form-label');
    roleLabel.setAttribute('for', 'roleSelect');
    roleLabel.textContent = 'Выберите новую роль';
    const roleSelect = document.createElement('select');
    roleSelect.classList.add('form-control');
    roleSelect.id = 'roleSelect';
    roleSelect.required = true;
    availableRoles.forEach(role => {
        const option = document.createElement('option');
        const capRole = role.charAt(0).toUpperCase() + role.slice(1);
        if (REVERSE_ROLE_TRANSLATION[role] === currentRole) {
            option.textContent = capRole + "  (текущая роль)";
            option.selected = true;
        } else {
            option.textContent = capRole;
        }
        option.value = role;
        roleSelect.appendChild(option);
    });
    roleContainer.appendChild(roleLabel);
    roleContainer.appendChild(roleSelect);
    mainForm.appendChild(roleContainer);
    // BUTTONS
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('d-flex', 'justify-content-between');
    // CHANGE ROLE
    const changeButton = document.createElement('button');
    changeButton.type = 'submit';
    changeButton.className = 'btn btn-warning';
    changeButton.textContent = 'Изменить роль';
    // CANCEL
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Отменить';
    cancelButton.onclick = (event) => {
        event.preventDefault();
        document.getElementById('blurOverlay').remove();
    };

    mainForm.addEventListener('submit', async event => {
        event.preventDefault();
        await alterButtonState(changeButton, buttonPendingText);
        const selectedRole = roleSelect.value;
        const roleData = {
            'username': username,
            'newRole': selectedRole,
        }
        const result = await changeRoleAction(roleData);
        if (result) {
            document.getElementById('blurOverlay').remove();
        }
        await alterButtonState(changeButton, roleButtonText);
    })

    buttonGroup.appendChild(changeButton);
    buttonGroup.appendChild(cancelButton);
    mainForm.appendChild(buttonGroup);

    showForm(formContainer);
}