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
    BASIC_USERNAME_REGEX,
    BASIC_USERNAME_REGEX_TITLE,
    BASIC_USERNAME_MIN_LENGTH,
    BASIC_USERNAME_MAX_LENGTH,
    BASIC_PASSWORD_REGEX_TITLE,
    BASIC_PASSWORD_MIN_LENGTH,
    BASIC_PASSWORD_REGEX,
    BASIC_PASSWORD_MAX_LENGTH,
} from "../uniConstants.js";
import {
    clearRedirect,
    keepAuthCookieFresh,
    validateRoleCookie,
    getCookie,
} from "../utility/roleCookies.js";
import NavigationButton from "../utility/navButton/navButton.js";
import { getRequest, patchRequest, postRequest } from "../utility/basicRequests.js";
import convertISOToCustomFormat from "../utility/convertToIso.js";
import flashMessage from "../utility/flashMessage/flashMessage.js";
import {
    createChangeRoleForm,
    createPasswordChangeForm,
    createResetPasswordForm,
    createRegistrationForm,

} from "./forms.js";


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
        'method': 'GET',
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
    }
    const response = await getRequest(usersDataUrl, true, true, args)
    const usersData = await response.json();
    return usersData;
}


const blockUserRequest = async (username, blockSeconds, token) => {
    const blockURL = `${BACK_URL.PATCH_AUTH_BLOCK_USER}?username=${username}&block_seconds=${blockSeconds}`;
    const response = await patchRequest(blockURL, true, true);
    return response;
}


const unblockUserRequest = async (username, token) => {
    const unblockURL = `${BACK_URL.PATCH_AUTH_UNBLOCK_USER}?username=${username}`;
    const response = await patchRequest(unblockURL, true, true);
    return response;
}
// ---


const createUserRow = async (userData) => {
    const userRow = document.createElement('tr');
    userRow.className = 'user-row fw-bold';
    // USERNAME
    const usernameCell = document.createElement('td');
    usernameCell.classList.add('ps-2');
    const username = userData['username'];
    usernameCell.textContent = username.charAt(0).toUpperCase() + username.slice(1);
    userRow.appendChild(usernameCell);
    // USER_ROLE
    const userRoleCell = document.createElement('td');
    userRoleCell.classList.add('ps-2');
    const corRole = ROLE_TRANSLATION[userData['userRole']];
    userRoleCell.textContent = corRole.charAt().toUpperCase() + corRole.slice(1);
    userRow.appendChild(userRoleCell);
    // USER_STATUS
    const userStatusCell = document.createElement('td');
    userStatusCell.classList.add('text-end', 'pe-5');
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
    userRow.id = username;
    return userRow;
}


// BUTTONS CREATION
const createBlockInput = async (userData) => {
    // TIME INPUT
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('mb-6');
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group');
    inputGroup.id = 'blockInput';
    const inputField = document.createElement('input');
    inputField.type = 'number';
    inputField.className = 'form-control-sm mt-2 me-2 pe-2 fs-6';
    inputField.placeholder = 'Введите секунды';
    inputField.min = 30;
    inputField.defaultValue = 30;
    inputField.required = true;
    inputGroup.appendChild(inputField);
    inputContainer.appendChild(inputGroup);
    // BLOCK BUTTOM
    const blockButton = document.createElement('button');
    blockButton.className = 'btn btn-danger mt-2 me-2 fs-6';
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

// BUTTON ACTIONS
const changePasswordAction = async (newPassElement, oldPassElement, passwordData) => {
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
    const response = await patchRequest(changePassURL, false, false, args);
    if (response.ok) {
        flashMessage.show({
            message: `Пароль для пользователя <b>${passwordData['username']}</b> успешно изменён`,
            duration: 7000,
        })
        return true;
    }
    if (302 === response.status) {
        newPassElement.setCustomValidity('Новый пароль не может быть равен старому');
        newPassElement.reportValidity();
    } else if (400 === response.status) {
        oldPassElement.setCustomValidity('Указан неправильный старый пароль');
        oldPassElement.reportValidity();
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
    const response = await patchRequest(resetPassURL, false, false, args);
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
    const username = roleData['username'];
    const newRole = REVERSE_ROLE_TRANSLATION[roleData['newRole'].toLowerCase()];
    const roleChangeURL = `${BACK_URL.PATCH_AUTH_CHANGE_ROLE}?username=${username}&new_role=${newRole}`;
    const response = await patchRequest(roleChangeURL, false, true);
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

const registerNewUserAction = async (inputElement, userData) => {
    const token = await getCookie(AUTH_COOKIE_NAME);
    const username = userData['username'];
    const userRole = REVERSE_ROLE_TRANSLATION[userData['userRole'].toLowerCase()];
    const userPass = userData['password'];
    const registerUserURL = `${BACK_URL.POST_AUTH_REGISTER_USER}`;
    const body = {
        'username': username,
        'password': userPass,
        'userRole': userRole,
    }
    const args = {
        'headers': {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json',
        },
        'method': 'POST',
        'body': JSON.stringify(body),
    }
    const response = await postRequest(registerUserURL, false, false, args);
    if (response.ok) {
        flashMessage.show({
            message: `Пользователь <b>${username}</b> успешно добавлен в систему`,
            duration: 6000,
        })
        return true;
    }
    const responseData = await response.json();
    if (302 == response.status) {
        inputElement.setCustomValidity('Пользователь с таким именем уже существует');
        inputElement.reportValidity();
    } else {
        inputElement.setCustomValidity(`Неизвестная ошибка. Сообщите администратору ${response.status} | ${responseData}`)
        inputElement.reportValidity();
    }
    return false;
}
// ---

const passwordChangeButton = async (userData) => {
    const changeButton = document.createElement('button');
    changeButton.className = 'btn btn-secondary mt-2 me-2 fs-6';
    changeButton.textContent = 'Сменить пароль';
    changeButton.onclick = async () => {
        const passChangeForm = await createPasswordChangeForm(
            userData['username'],
            changePasswordAction,
            BASIC_PASSWORD_REGEX,
            BASIC_USERNAME_REGEX_TITLE,
            BASIC_PASSWORD_MIN_LENGTH,
            BASIC_USERNAME_MAX_LENGTH,
        );
    }
    return changeButton;
}

const passwordResetButton = async (userData) => {
    const resetButton = document.createElement('button');
    resetButton.className = `btn btn-secondary mt-2 me-2 fs-6`;
    resetButton.textContent = 'Сбросить пароль';
    resetButton.onclick = async () => {
        await createResetPasswordForm(
            userData['username'],
            resetPasswordAction,
            BASIC_PASSWORD_REGEX,
            BASIC_PASSWORD_REGEX_TITLE,
            BASIC_PASSWORD_MIN_LENGTH,
            BASIC_PASSWORD_MAX_LENGTH,
        );
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
    roleChangeButton.onclick = async () => {
        await createChangeRoleForm(
            userData['username'],
            userData['userRole'],
            availableRoles,
            changeRoleAction
        );
    }
    return roleChangeButton;
}

const setNewUserButton = async (newUserButton) => {
    const availableRoles = [];
    for (let roleName of Object.values(ROLE_TRANSLATION)) {
        availableRoles.push(roleName);
    }
    newUserButton.onclick = async () => {
        await createRegistrationForm(
            availableRoles,
            registerNewUserAction,
            BASIC_USERNAME_REGEX,
            BASIC_USERNAME_REGEX_TITLE,
            BASIC_USERNAME_MIN_LENGTH,
            BASIC_USERNAME_MAX_LENGTH,
            BASIC_PASSWORD_REGEX,
            BASIC_PASSWORD_REGEX_TITLE,
            BASIC_PASSWORD_MIN_LENGTH,
            BASIC_USERNAME_MAX_LENGTH,
        );
    }
    return newUserButton;
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
        // BLOCK
        const blockInputGroup = await createBlockInput(userData);    
        detailsContainer.appendChild(blockInputGroup);
        // UNBLOCK
        const unblockDateParag = document.createElement('p');
        unblockDateParag.classList.add('fs-5');
        const unblockDate = convertISOToCustomFormat(userData['blockEndDate'], false, true, true);
        unblockDateParag.innerHTML = `Дата окончания блокировки: <b>${unblockDate}</b>`;
        detailsContainer.appendChild(unblockDateParag);
        const unblockButton = await createUnblockButton(userData);
        detailsContainer.appendChild(unblockButton);
        if (userData['isBlocked']) {
            blockInputGroup.style.display = 'none';
        } else {
            unblockDateParag.style.display = 'none';
            unblockButton.style.display = 'none';
        }
    }
    const roleChangeBut = await roleChangeButton(userData);
    detailsContainer.appendChild(roleChangeBut);
    const passChangeBut = await passwordChangeButton(userData);
    detailsContainer.appendChild(passChangeBut);
    const resetPassBut = await passwordResetButton(userData);
    detailsContainer.appendChild(resetPassBut);
    return userDetailsRow;
}


const createRecord = async (userData, tableBody) => {
    const rowData = {
        'userData': userData,
    };
    const userRow = await createUserRow(userData);
    rowData['mainRow'] = userRow;
    tableBody.appendChild(userRow);
    // USER DETAILS
    const detailsRow = await createUserDetails(userData);
    rowData['detailsRow'] = detailsRow;
    tableBody.appendChild(detailsRow);
    userRow.addEventListener('click', () => {
        const details = detailsRow.childNodes[0].childNodes[0];
        details.style.display = details.style.display === 'none' || details.style.display === '' ? 'block': 'none';
    })
    return rowData;
}


const generateUserRows = async (usersData, tableBody) => {
    tableBody.innerHTML = "";
    const userRows = {};
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
        const newRowData = await createRecord(userData, tableBody);
        userRows[username] = newRowData;
    }
    return userRows;
}


const updateRowData = async (currenRowData, newUserData) => {
    const curBlockStatus = currenRowData['userData']['isBlocked'];
    const newBlockStatus = newUserData['isBlocked'];
    const curUserRole = currenRowData['userData']['userRole'];
    const newUserRole = newUserData['userRole'];
    if (curBlockStatus !== newBlockStatus) {
        const detailsCell = currenRowData['detailsRow'].childNodes[0].childNodes[0];
        const blockInput = detailsCell.childNodes[1];
        const unblockParag = detailsCell.childNodes[2];
        const unblockButton = detailsCell.childNodes[3];
        const imageIcon = currenRowData['mainRow'].childNodes[2].childNodes[0];
        if (newBlockStatus) {
            const newUnblockData = convertISOToCustomFormat(newUserData['blockEndDate'], false, true, true);
            unblockParag.style.display = 'block';
            unblockParag.innerHTML = `Дата окончания блокировки: <b>${newUnblockData}</b>`;
            unblockButton.style.display = 'block';
            blockInput.style.display = 'none';
            imageIcon.src = "../images/blocked.png";
            imageIcon.alt = "Blocked";
        } else {
            unblockParag.style.display = 'none';
            unblockButton.style.display = 'none';
            blockInput.style.display = 'flex';
            imageIcon.src = "../images/active.png";
            imageIcon.alt = "Active";
        }
    }
    const roleElement = currenRowData['mainRow'].childNodes[1];
    if (curUserRole !== newUserRole) {
        const roleTranslation = ROLE_TRANSLATION[newUserRole];
        roleElement.textContent = roleTranslation.charAt(0).toUpperCase() + roleTranslation.slice(1);
    }
}


const updateCreatedRows = async (curRows, tableBody) => {
    const newUsersData = await getUsersData();
    for (let newUserData of newUsersData) {
        const username = newUserData['username'];
        if (username in curRows) {
            const rowData = curRows[username];
            await updateRowData(rowData, newUserData);
            curRows[username]['userData'] = newUserData;
        } else {
            const newRowData = await createRecord(newUserData, tableBody); 
            curRows[username] = newRowData;
        }
    }
} 


const startUpdating = async (curRows, tableBody) => {
    if (usersUpdatingInterval) {
        return;
    }
    usersUpdatingInterval = setInterval( async () => {
        await updateCreatedRows(curRows, tableBody);
    }, 500);
}

const stopUpdating = async () => {
    if (!usersUpdatingInterval) {
        return;
    }
    clearInterval(usersUpdatingInterval);
    usersUpdatingInterval = null;
}


var usersUpdatingInterval = null;
// BASIC BUTTONS
const newUserButton = document.getElementById('newUserButton');
await setNewUserButton(newUserButton);
// ---
const usersTable = document.getElementById('usersTableBody');
const newData = await getUsersData();
const createdRows = await generateUserRows(newData, usersTable);
startUpdating(createdRows, usersTable);
