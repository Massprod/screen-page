import {
    AUTH_COOKIE_NAME,
    BACK_URL,
    BASIC_COOKIES,
    loginPage,
    NAV_BUTTONS,
    RESTRICTED_TO_THIS_ROLE,
    USER_ROLE_COOKIE_NAME,
    USER_ROLE_COOKIE_UPDATE_INTERVAL,
    USERS_PAGE_ROLES,
    ADMIN_ROLE,
    ROLE_TRANSLATION,
    REVERSE_ROLE_TRANSLATION,
} from "../uniConstants.js";
import {
    clearRedirect,
    keepAuthCookieFresh,
    validateRoleCookie,
    getCookie,
} from "../utility/roleCookies.js";
import NavigationButton from "../utility/navButton/navButton.js";
import { getRequest, patchRequest } from "../utility/basicRequests.js";
import convertISOToCustomFormat from "../utility/convertToIso.js";
import flashMessage from "../utility/flashMessage/flashMessage.js";
import { createChangeRoleForm, createPasswordChangeForm, createResetPasswordForm } from "./forms.js";


// TODO: combine all of them in 1 function,
//       repeated on multiple pages, just need to think about args.
// COOKIE CHECK
keepAuthCookieFresh(AUTH_COOKIE_NAME);
const redirectUrl = `${loginPage}?message=${RESTRICTED_TO_THIS_ROLE}`;
const userRole = await getCookie(USER_ROLE_COOKIE_NAME);
if (!userRole || !(userRole in USERS_PAGE_ROLES)) {
    clearRedirect(BASIC_COOKIES, redirectUrl);
}
setInterval( async () => {
    validateRoleCookie(USER_ROLE_COOKIE_NAME, USERS_PAGE_ROLES, redirectUrl);
}, USER_ROLE_COOKIE_UPDATE_INTERVAL);
// ---
// NAV BUTTON
const navPosition = {
    top: '2%',
    left: 'auto',
    right: '2%',
    bottom: 'auto',
}
const roleNavButtons = NAV_BUTTONS[userRole];
const clearCookies = [USER_ROLE_COOKIE_NAME, AUTH_COOKIE_NAME];
const navButton = new NavigationButton(
    navPosition, roleNavButtons, clearCookies,
);
// ---


// REQUESTS
const getUsersData = async (onlyBlocked = false) => {
    const usersDataUrl = `${BACK_URL.GET_AUTH_USERS_DATA}?only_blocked=${onlyBlocked}`;
    const authToken = await getCookie(AUTH_COOKIE_NAME);
    if (!authToken) {
        clearRedirect(BASIC_COOKIES, redirectUrl);
    }
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
    }
    const usersData = await getRequest(usersDataUrl, args)
    return usersData;
}


const blockUserRequest = async (username, blockSeconds, token) => {
    const blockURL = `${BACK_URL.PATCH_AUTH_BLOCK_USER}?username=${username}&block_seconds=${blockSeconds}`;
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        'method': 'PATCH',
    }
    const response = await patchRequest(blockURL, args);
    return response;
}


const unblockUserRequest = async (username, token) => {
    const unblockURL = `${BACK_URL.PATCH_AUTH_UNBLOCK_USER}?username=${username}`;
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        'method': 'PATCH',
    }
    const response = await patchRequest(unblockURL, args);
    return response;
}
// ---


const createUserRow = async (userData) => {
    const userRow = document.createElement('tr');
    userRow.className = 'user-row fw-bold';
    // USERNAME
    const usernameCell = document.createElement('td');
    usernameCell.textContent = userData['username'];
    userRow.appendChild(usernameCell);
    // USER_ROLE
    const userRoleCell = document.createElement('td');
    const corRole = ROLE_TRANSLATION[userData['userRole']];
    userRoleCell.textContent = corRole;
    userRow.appendChild(userRoleCell);
    // USER_STATUS
    const userStatusCell = document.createElement('td');
    const userStatusImage = document.createElement('img');
    userStatusImage.classList.add('user-status-image');
    if (userData['isBlocked']) {
        userStatusImage.src = "../images/blocked.png";
        userStatusImage.alt = "Blocked";
    } else {
        userStatusImage.src = "../images/active.png";
        userStatusImage.alt = "Active";
    }
    userStatusCell.appendChild(userStatusImage);
    userRow.appendChild(userStatusCell);
    userRow.id = userData['username'];
    return userRow;
}


// BUTTONS CREATION
const createBlockInput = async (userData) => {
    // TIME INPUT
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('mb-6');
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group');
    const inputField = document.createElement('input');
    inputField.type = 'number';
    inputField.className = 'form-control-sm mh-25 mt-2 me-2 pe-2 fs-6';
    inputField.placeholder = 'Введите секунды';
    inputField.min = 30;
    inputField.defaultValue = 30;
    inputField.required = true;
    inputGroup.appendChild(inputField);
    inputContainer.appendChild(inputGroup);
    // BLOCK BUTTOM
    const blockButton = document.createElement('button');
    blockButton.className = 'btn btn-danger mt-2 me-5 fs-6';
    blockButton.textContent = 'Заблокировать';
    blockButton.onclick = async (event) => {
        event.preventDefault();
        if (parseInt(inputField.value) < inputField.min) {
            flashMessage.show ({
                message: `Минимальное время блокировки ${inputField.min}`,
            })
            inputField.value = inputField.min;
            return;
        }
        const _authToken = await getCookie(AUTH_COOKIE_NAME);
        const blockSeconds = inputField.value;
        const response = await blockUserRequest(userData['username'], blockSeconds, _authToken);
        if (response.ok) {
            flashMessage.show({
                message: `Пользователь: ${userData['username']} заблокирован на период <b>${blockSeconds}</b> секунд`,
            })
        }
        // TODO: ADD record update and request for single user data
        // ----
    }
    inputGroup.appendChild(blockButton);
    return inputGroup;
}

const createUnblockButton = async (userData) => {
    const unblockButton = document.createElement('button');
    unblockButton.className = 'btn btn-success mt-2 me-2 fs-6';
    unblockButton.textContent = 'Разблокировать';
    unblockButton.onclick = async () => {
        const _authToken = await getCookie(AUTH_COOKIE_NAME);
        const response = await unblockUserRequest(userData['username'], _authToken);
        if (response.ok) {
            flashMessage.show({
                message: `Пользователь: ${userData['username']} разблокирован`,
            })
        }
        // TODO: ADD record update and request for single user data
        // ----
    }
    return unblockButton;
}

const showForm = (form) => {
    let overlay = document.getElementById('blurOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'blurOverlay';
        overlay.classList.add('blur-overlay');
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = ''; // Clear previous content
    overlay.appendChild(form); // Append the provided form
    overlay.style.display = 'flex'; // Show the overlay
}

// BUTTON ACTIONS
const changePasswordAction = async (passwordData) => {
    const token = await getCookie(AUTH_COOKIE_NAME);
    const changePassURL = `${BACK_URL.PATCH_AUTH_CHANGE_PASS}`;
    const bodyData = {
        'username': passwordData['username'],
        'old_password': passwordData['oldPassword'],
        'new_password': passwordData['newPassword']
    }
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json',
        },
        'method': 'PATCH',
        'body': JSON.stringify(bodyData),
    }
    const response = await patchRequest(changePassURL, args, false);
    if (response.ok) {
        flashMessage.show({
            message: `Пароль для пользователя <b>${passwordData['username']}</b> успешно изменён`,
            duration: 7000,
        })
        return true;
    }
    if (302 === response.status) {
        alert('Новый пароль не может быть равен старому');
    } else if (400 === response.status) {
        alert('Указан неправильный старый пароль');
    } else if (404 === response.status) {
        alert('Выбранный пользователь не найден. Обновите страницу');
    } else if (403 === response.status) {
        alert('Только аутентифицированный администратор может изменить собственный пароль');
    } else {
        alert(`Неизвестная ошибка. Сообщите администратору ${response.status}`);
    }
    return false
}

const resetPasswordAction = async (passwordData) => {
    const token = await getCookie(AUTH_COOKIE_NAME);
    const resetPassURL = `${BACK_URL.PATCH_AUTH_RESET_PASS}`;
    const bodyData = {
        'username': passwordData['username'],
    }
    if (passwordData['newPassword']) {
        bodyData['new_password'] = passwordData['newPassword'];
    }
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json',
        },
        'method': 'PATCH',
        'body': JSON.stringify(bodyData),
    }
    const response = await patchRequest(resetPassURL, args, false);
    if (response.ok) {
        if (passwordData['newPassword']) {
            flashMessage.show({
                message: `Пароль для пользователя <b>${passwordData['username']}</b> успешно изменён`,
                duration: 7000,
            })
        } else {
            flashMessage.show({
                message: `Пароль для пользователя <b>${passwordData['username']}</b> успешно сброшен на стандартное значение. Уточните его в документации`,
                duration: 7000,
            })
        }
        return true;
    }
    if (404 === response.status) {
        alert('Выбранный пользователь не найден. Обновите страницу');
    } else if (403 === response.status) {
        alert('Только аутентифицированный администратор может изменить собственный пароль');
    } else {
        alert(`Неизвестная ошибка. Сообщите администратору ${response.status}`);
    }
    return false;
}

const changeRoleAction = async (roleData) => {
    const token = await getCookie(AUTH_COOKIE_NAME);
    const username = roleData['username'];
    const newRole = REVERSE_ROLE_TRANSLATION[roleData['newRole']];
    const roleChangeURL = `${BACK_URL.PATCH_AUTH_CHANGE_ROLE}?username=${username}&new_role=${newRole}`;
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json',
        },
        'method': 'PATCH',
    }
    const response = await patchRequest(roleChangeURL, args, false);
    if (response.ok) {
        flashMessage.show({
            message: `Роль для пользователя <b>${roleData['username']}</b> успешно изменена на <b>${newRole}</b>`,
            duration: 7000,
        })
        return true;
    }
    if (404 == response.status) {
        alert('Выбранный пользователь не найден. Обновите страницу');
    } else if (403 === response.status) {
        alert('Роль `Администратор` не может быть изменена');
    } else {
        alert(`Неизвестная ошибка. Сообщите администратору ${response.status}`)
    }
    return false;
}
// ---

const passwordChangeButton = async (userData) => {
    const changeButton = document.createElement('button');
    changeButton.className = 'btn btn-secondary mt-2 me-2 fs-6';
    changeButton.textContent = 'Сменить пароль';
    const passChangeForm = await createPasswordChangeForm(userData['username'], changePasswordAction);
    changeButton.onclick = async () => {
        showForm(passChangeForm);
    }
    return changeButton;
}

const passwordResetButton = async (userData) => {
    const resetButton = document.createElement('button');
    resetButton.className = `btn btn-secondary mt-2 me-2 fs-6`;
    resetButton.textContent = 'Сбросить пароль';
    const passResetForm = await createResetPasswordForm(userData['username'], resetPasswordAction);
    resetButton.onclick = async () => {
        showForm(passResetForm);
    }
    return resetButton;
}

const roleChangeButton = async (userData) => {
    const roleChangeButton = document.createElement('button');
    roleChangeButton.className = 'btn btn-secondary mt-2 me-2 fs-6';
    roleChangeButton.textContent = 'Сменить роль';
    const availableRoles = [];
    for (let roleName of Object.values(ROLE_TRANSLATION)) {
        availableRoles.push(roleName);
    }
    const roleChangeForm = await createChangeRoleForm(userData['username'], availableRoles, changeRoleAction);
    roleChangeButton.onclick = async () => {
        showForm(roleChangeForm);
    }
    return roleChangeButton;
}
// ---


const createUserDetails = async (userData) => {
    const userDetailsRow = document.createElement('tr');
    const userDetailsCell = document.createElement('td');
    userDetailsCell.setAttribute('colspan', '3');
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('user-details');
    // REGISTRATION DATE
    const userRegParag = document.createElement('p');
    userRegParag.classList.add('fs-5');
    const registrationDate = convertISOToCustomFormat(userData['registrationDate'], false, true, true);
    userRegParag.innerHTML = `Дата регистрации: <b>${registrationDate}</b>`;
    detailsContainer.appendChild(userRegParag);
    userDetailsCell.appendChild(detailsContainer);
    userDetailsRow.appendChild(userDetailsCell);
    // BUTTONS
    if (ADMIN_ROLE !== userData['userRole']) {
        if (!userData['isBlocked']) {
            const blockInputGroup = await createBlockInput(userData);
            detailsContainer.appendChild(blockInputGroup);
        } else {
            const unblockDateParag = document.createElement('p');
            unblockDateParag.classList.add('fs-5');
            const unblockDate = convertISOToCustomFormat(userData['blockEndDate'], false, true, true);
            unblockDateParag.innerHTML = `Дата окончания блокировки: <b>${unblockDate}</b>`;
            detailsContainer.appendChild(unblockDateParag);
            const unblockButton = await createUnblockButton(userData);
            detailsContainer.appendChild(unblockButton);
        }
        const roleChangeBut = await roleChangeButton(userData);
        detailsContainer.appendChild(roleChangeBut);
    }
    const passChangeBut = await passwordChangeButton(userData);
    detailsContainer.appendChild(passChangeBut);
    const resetPassBut = await passwordResetButton(userData);
    detailsContainer.appendChild(resetPassBut);
    
    return userDetailsRow;
}


const generateUserRows = async (usersData, tableBody) => {
    tableBody.innerHTML = "";
    if (0 === usersData.length) {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', '3');
        noDataCell.classList.add('text-center fs-2');
        noDataCell.textContent = 'Не найдено ни одного зарегистрированного пользователя';
        noDataRow.appendChild(noDataCell);
        tableBody.appendChild(noDataRow);
        return;
    }
    for (let userData of usersData) {
        const username = userData['username'];
        if (!(username in createdRows)) {
            createdRows[username] = {
                'currentData': userData,
            };
        }
        // USER ROW
        const userRow = await createUserRow(userData);
        createdRows[username]['mainRow'] = userRow;
        tableBody.appendChild(userRow);
        // USER DETAILS
        const detailsRow = await createUserDetails(userData);
        createdRows[username]['detailsRow'] = detailsRow;
        tableBody.appendChild(detailsRow);
        userRow.addEventListener('click', () => {
            const details = detailsRow.childNodes[0].childNodes[0];
            details.style.display = details.style.display === 'none' || details.style.display === '' ? 'block': 'none';
        })
    }
    console.log(createdRows);
}


var createdRows = {};
const usersTable = document.getElementById('usersTableBody');
const newData = await getUsersData();
console.log(newData);
await generateUserRows(newData, usersTable);
