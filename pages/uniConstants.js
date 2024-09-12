const mainAddress = "http://localhost:8000";
const authMainAddress = "http://localhost:8080";
const serviceDom = "http://localhost:5500";
export const labPage = `${serviceDom}/screen/pages/labPage/laboratoryPage.html`;
export const gridPage = `${serviceDom}/screen/pages/managerPage/managerPage.html`;
export const loginPage = `${serviceDom}/screen/pages/loginPage/mainLogin.html`;
export const usersPage = `${serviceDom}/screen/pages/usersPage/usersPage.html`;
export const historyPage = `${serviceDom}/screen/pages/historyPage/index.html`;
// TODO: We need to find some analog of `.env` for js.
// PRESET NAMES
export const BASIC_PMK_PLATFORM_PRESET = `pmkBasePlatform`;
export const BASIC_PMK_GRID_PRESET = `pmkGrid`;
// ------
export const BACK_URL  = {
    POST_BATCH_STATUS_UPDATE: `${mainAddress}/batch_number/update_laboratory_status`,
    GET_BATCHES_DATA_PERIOD: `${mainAddress}/batch_number/period`,
    GET_BATCH_DATA: `${mainAddress}/batch_number/batch_number`,
    POST_AUTH_CREDENTIALS: `${authMainAddress}/users/login`,
    POST_AUTH_REFRESH_TOKEN: `${authMainAddress}/users/token_refresh`,
    GET_AUTH_USERS_DATA: `${authMainAddress}/users/all`,
    PATCH_AUTH_BLOCK_USER: `${authMainAddress}/users/block`,
    PATCH_AUTH_UNBLOCK_USER: `${authMainAddress}/users/unblock`,
    PATCH_AUTH_CHANGE_PASS: `${authMainAddress}/users/change_password`,
    PATCH_AUTH_RESET_PASS: `${authMainAddress}/users/reset_password`,
    PATCH_AUTH_CHANGE_ROLE: `${authMainAddress}/users/change_role`,
    POST_AUTH_REGISTER_USER: `${authMainAddress}/users/register`,
    GET_PRESET_DATA_BY_NAME: `${mainAddress}/presets/by_name`,
    GET_PLACEMENT_HISTORY: `${mainAddress}/history/all`,
    GET_PLATFORMS: `${mainAddress}/platform/all`,
    GET_PLACEMENT_DATA: `${mainAddress}/`,
    GET_PRESET_DATA: `${mainAddress}/presets/by_id`,
    GET_HISTORY_RECORD: `${mainAddress}/history/record`,
};
// REGEX
export const BASIC_USERNAME_REGEX = '^[\\-._a-zA-Z0-9]+$';
export const BASIC_USERNAME_REGEX_TITLE = 'Имя пользователя должно быть размером 3-20 символов с использованием: латиницы, цифр и [-._]';
export const BASIC_USERNAME_MIN_LENGTH = 3;
export const BASIC_USERNAME_MAX_LENGTH = 20;

export const BASIC_PASSWORD_REGEX = '^[A-Za-z\\d@$!%*#?&]+$';
export const BASIC_PASSWORD_REGEX_TITLE = 'Пароль пользователя должен быть размером 8-50 символо с использованием: латиницы, цифр и [@$!%*#?&]';
export const BASIC_PASSWORD_MIN_LENGTH = 8;
export const BASIC_PASSWORD_MAX_LENGTH = 50;

// auth-token cookie
export const AUTH_COOKIE_NAME = 'auth-token';
export const AUTH_COOKIE_BASIC_EXPIRE = 3 * 60;
export const COOKIE_UPDATE_INTERVAL = 1 * 30 * 1000;
// cookie Messages
export const AUTH_COOKIE_NOT_FOUND = 'auth-cookie-not-found';
export const AUTH_COOKIE_SESSION_EXPIRED = 'auth-cookie-session-expired';
export const RESTRICTED_TO_THIS_ROLE = 'user-role-restricted';
export const AUTH_COOKIE_INVALID ='auth-cookie-invalid';
// user-role cookie.
export const USER_ROLE_COOKIE_NAME = 'user-role';
export const USER_ROLE_COOKIE_BASIC_EXPIRE = 3 * 60;
export const USER_ROLE_COOKIE_UPDATE_INTERVAL = 1 * 5 * 1000;
export const BASIC_COOKIES = [AUTH_COOKIE_NAME, USER_ROLE_COOKIE_NAME];

export const MANAGER_ROLE = 'manager';
export const ADMIN_ROLE = 'admin';
export const OPERATOR_ROLE = 'operator'
export const LAB_PERSONAL_ROLE = 'labPersonal';

export const ROLE_TRANSLATION = {
    'manager': 'менеджер',
    'admin': 'администратор',
    'operator': 'оператор',
    'labPersonal': 'лаборант',
}

export const REVERSE_ROLE_TRANSLATION = {}
for (let [key, value] of Object.entries(ROLE_TRANSLATION)) {
    REVERSE_ROLE_TRANSLATION[value] = key;
}

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

export const USERS_PAGE_ROLES = {
    [ADMIN_ROLE]: true,
}

export const HISTORY_PAGE_ROLES = {
    [ADMIN_ROLE]: true,
    [MANAGER_ROLE]: true,
}

export const COOKIE_MESSAGES = {
    [AUTH_COOKIE_NOT_FOUND]: "Токен доступа не найден.<br> Перезайдите в систему.",
    [AUTH_COOKIE_SESSION_EXPIRED]: "Токен доступа больше не действителен.<br> Перезайдите в систему.",
    [RESTRICTED_TO_THIS_ROLE]: `Использование страниц без прав доступа запрещено<br>Произведён автоматический выход из системы<br>Перезайдите в систему`,
    [AUTH_COOKIE_INVALID]: "Не действительный токен доступа. Перезайдите в систему.",
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

const NAV_USERS_BUTTON = {
    'class': 'btn btn-secondary',
    'text': 'Пользователи',
    'href': usersPage,
}

const NAV_HISTORY_BUTTON = {
    'class': 'btn btn-secondary',
    'text': 'История',
    'href': historyPage,
}

export const NAV_BUTTONS = {
    [LAB_PERSONAL_ROLE]: [
        NAV_LAB_BUTTON,
        NAV_LOGIN_BUTTON,
    ],
    [ADMIN_ROLE]: [
        NAV_USERS_BUTTON,
        NAV_LAB_BUTTON,
        NAV_GRID_BUTTON,
        NAV_HISTORY_BUTTON, 
        NAV_LOGIN_BUTTON,
    ],
    [MANAGER_ROLE]: [
        NAV_USERS_BUTTON,
        NAV_LAB_BUTTON,
        NAV_GRID_BUTTON,
        NAV_HISTORY_BUTTON,
        NAV_LOGIN_BUTTON,
    ],
    [OPERATOR_ROLE]: [
        NAV_GRID_BUTTON,
        NAV_LOGIN_BUTTON,
    ],
};
