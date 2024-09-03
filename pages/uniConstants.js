const mainAddress = "http://localhost:8000";
const authMainAddress = "http://localhost:8080";
const serviceDom = "http://localhost:5500";
export const labPage = `${serviceDom}/screen/pages/labPage/laboratoryPage.html`;
export const gridPage = `${serviceDom}/screen/pages/managerPage/managerPage.html`;
export const loginPage = `${serviceDom}/screen/pages/loginPage/mainLogin.html`;

export const BACK_URL  = {
    POST_BATCH_STATUS_UPDATE: `${mainAddress}/batch_number/update_laboratory_status`,
    GET_BATCHES_DATA_PERIOD: `${mainAddress}/batch_number/period`,
    GET_BATCH_DATA: `${mainAddress}/batch_number/batch_number`,
    POST_AUTH_CREDENTIALS: `${authMainAddress}/users/login`,
    POST_AUTH_REFRESH_TOKEN: `${authMainAddress}/users/token_refresh`,
};

// auth-token cookie
export const AUTH_COOKIE_NAME = 'auth-token';
export const AUTH_COOKIE_BASIC_EXPIRE = 3 * 60;
export const COOKIE_UPDATE_INTERVAL = 1 * 30 * 1000;
// cookie Messages
export const AUTH_COOKIE_NOT_FOUND = 'auth-cookie-not-found';
export const AUTH_COOKIE_SESSION_EXPIRED = 'auth-cookie-session-expired';
export const RESTRICTED_TO_THIS_ROLE = 'user-role-restricted';
// user-role cookie.
export const USER_ROLE_COOKIE_NAME = 'user-role';
export const USER_ROLE_COOKIE_BASIC_EXPIRE = 3 * 60;
export const USER_ROLE_COOKIE_UPDATE_INTERVAL = 1 * 5 * 1000;
export const BASIC_COOKIES = [AUTH_COOKIE_NAME, USER_ROLE_COOKIE_NAME];

export const MANAGER_ROLE = 'manager';
export const ADMIN_ROLE = 'admin';
export const OPERATOR_ROLE = 'operator'
export const LAB_PERSONAL_ROLE = 'labPersonal';

export const LAB_PAGE_ROLES = {
    [ADMIN_ROLE]: true,
    [LAB_PERSONAL_ROLE]: true,
    [MANAGER_ROLE]: true,
};

export const GRID_PAGE_ROLES = {
    [ADMIN_ROLE]: true,
    [MANAGER_ROLE]: true,
    [OPERATOR_ROLE]: true,
};

export const COOKIE_MESSAGES = {
    [AUTH_COOKIE_NOT_FOUND]: "Токен доступа не найден.<br> Перезайдите в систему.",
    [AUTH_COOKIE_SESSION_EXPIRED]: "Токен доступа больше не действителен.<br> Перезайдите в систему.",
    [RESTRICTED_TO_THIS_ROLE]: `Использование страниц без прав доступа запрещено<br>Произведён автоматический выход из системы<br>Перезайдите в систему`,
}
export const COOKIE_MESSAGES_TEXT_COLOR = 'white';
export const COOKIE_MESSAGES_BG_COLOR = 'black';
export const COOKIE_MESSAGES_POSITION = 'top-center';
export const COOKIE_MESSAGES_SHOW_TIME = 8000;

// nav-buttons
const NAV_LAB_BUTTON = {
    'class': 'btn btn-secondary',
    'text': 'Лаборатория',
    'href': labPage,
}
const NAV_GRID_BUTTON = {
    'class': 'btn btn-secondary',
    'text': 'Приямок',
    'href': gridPage,
}
const NAV_LOGIN_BUTTON = {
    'class': 'btn btn-danger',
    'text': 'Выход',
    'href': loginPage,
}

export const NAV_BUTTONS = {
    [LAB_PERSONAL_ROLE]: [
        NAV_LAB_BUTTON,
        NAV_LOGIN_BUTTON,
    ],
    [ADMIN_ROLE]: [
        NAV_LAB_BUTTON,
        NAV_GRID_BUTTON, 
        NAV_LOGIN_BUTTON,
    ],
    [MANAGER_ROLE]: [
        NAV_LAB_BUTTON,
        NAV_GRID_BUTTON,
        NAV_LOGIN_BUTTON,
    ],
    [OPERATOR_ROLE]: [
        NAV_GRID_BUTTON,
        NAV_LOGIN_BUTTON,
    ],
};
