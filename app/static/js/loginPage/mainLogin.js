import {
    BACK_URL,
    AUTH_COOKIE_NAME,
    gridPage,
    AUTH_COOKIE_BASIC_EXPIRE,
    COOKIE_MESSAGES,
    USER_ROLE_COOKIE_NAME,
    USER_ROLE_COOKIE_BASIC_EXPIRE,
    LAB_PAGE_ROLES,
    labPage,
    GRID_PAGE_ROLES,
    COOKIE_MESSAGES_POSITION,
    COOKIE_MESSAGES_SHOW_TIME,
    COOKIE_MESSAGES_TEXT_COLOR,
    COOKIE_MESSAGES_BG_COLOR,
    USERS_PAGE_ROLES,
    usersPage,
    ACTIVE_USERNAME_COOKIE_NAME,
} from "../uniConstants.js";
import { FLASH_MESSAGES } from "../managerPage/js/constants.js";
import { setCookie, updateAuthCookie } from "../utility/roleCookies.js";
import flashMessage from "../utility/flashMessage/flashMessage.js";


window.onload = async () => {
    if (await updateAuthCookie(AUTH_COOKIE_NAME)) {
        window.location.href = gridPage;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
        const flashText = COOKIE_MESSAGES[message];
        flashMessage.show({
            message: flashText,
            color: COOKIE_MESSAGES_TEXT_COLOR,
            backgroundColor: COOKIE_MESSAGES_BG_COLOR,
            position: COOKIE_MESSAGES_POSITION,
            duration: COOKIE_MESSAGES_SHOW_TIME,
        });
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }
};


document.getElementById('userData').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    form.classList.remove('was-validated');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    usernameInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');
    const formData = new FormData(form);
    const requestData = new URLSearchParams();
    requestData.append('grant_type', 'password');
    requestData.append('username', formData.get('username'));
    requestData.append('password', formData.get('password'));
    requestData.append('scopre', '');
    const response = await fetch(
        BACK_URL.POST_AUTH_CREDENTIALS,
        {
            'method': 'POST',
            'headers': {
                'Accept': 'application/json',
                'Content-type': 'application/x-www-form-urlencoded',
            },
            'body': requestData.toString(),
        },
    )
    const respData = await response.json();
    if (!response.ok) {
        if (404 === response.status) {
            flashMessage.show({
                message: `Пользователь с таким именем не существует.`,
                color: FLASH_MESSAGES.BASIC_TEXT_COLOR,
                backgroundColor: FLASH_MESSAGES.BASIC_BG_COLOR,
                position: FLASH_MESSAGES.BASIC_POSITION,
                duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
            });
            usernameInput.classList.add('is-invalid');
        } else if (403 === response.status) {
            if ('Blocked' === respData['detail']) {
                flashMessage.show({
                    message: `Пользователь заблокирован.`,
                    color: FLASH_MESSAGES.BASIC_ERROR_COLOR,
                    backgroundColor: FLASH_MESSAGES.BASIC_ERROR_BG_COLOR,
                    position: FLASH_MESSAGES.BASIC_POSITION,
                    duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
                });
                form.classList.add('was-validated');
            } else {
                flashMessage.show({
                    message: `Указан неправильный пароль.`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: FLASH_MESSAGES.BASIC_POSITION,
                    duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
                });
                passwordInput.classList.add('is-invalid');
            }
        }
        return;
    }
    form.classList.add('was-validated');
    const authToken = respData['access_token'];
    const userRole = respData['user_role'];
    await setCookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_BASIC_EXPIRE);
    await setCookie(USER_ROLE_COOKIE_NAME, userRole, USER_ROLE_COOKIE_BASIC_EXPIRE)
    await setCookie(ACTIVE_USERNAME_COOKIE_NAME, formData.get('username').toLowerCase());
    if (userRole in USERS_PAGE_ROLES) {
        window.location.href = usersPage;
    } else if (userRole in GRID_PAGE_ROLES) {
        window.location.href = gridPage;
    } else if (userRole in LAB_PAGE_ROLES) {
        window.location.href = labPage;
    }
})
