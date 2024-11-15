export const mainAddress = "/api/grid";
const authMainAddress = "/api/auth";
const serviceDom = "";
export const gridRelSocketAddress = `wss//${window.location.host}/api/grid/ws/grid_page`;



export const loginPage = `${serviceDom}/`;
export const usersPage = `${serviceDom}/users`;
export const gridPage = `${serviceDom}/grid`;
export const labPage = `${serviceDom}/lab`;
export const historyPage = `${serviceDom}/history`;

// TODO: We need to find some analog of `.env` for js.
// PRESET NAMES
export const BASIC_PMK_PLATFORM_PRESET = `pmkBasePlatform`;
export const BASIC_PMK_GRID_PRESET = `pmkGrid`;
export const BASIC_TEMPO_STORAGE = 'tempoStorage';

// + REMOVE SELECTORS +
export const USED_PMK_GRID_NAME = 'pmkGrid1';
export const USED_PLATFORN_NAME = 'pmkBase1';
// - REMOVE SELECTORS -

// + NAMES +
export const EXTRA_ELEMENT_NAME = 'extra';

export const WHEEL_STATUSES = {
    WH_LABORATORY: 'laboratory',
    SHIPPED: 'shipped',
    GRID: 'grid',
    PLATFORM: 'basePlatform',
    REJECTED: 'rejected',
    STORAGE: 'storage',
    UNPLACED: 'unplaced',
} 


export const PLACEMENT_TYPES = {
    BASE_PLATFORM: 'basePlatform',
    GRID: 'grid',
    STORAGE: 'storage',
    LABORATORY: 'laboratory',
}

export const BATCH_STATUS_CLASSES = {
    NOT_PASSED: 'not-passed',
    PASSED: 'passed',
    NOT_TESTED: 'not-tested',
}

export const PLACEMENT_TYPES_TRANSLATE = {
    "grid": "Приямок",
    "basePlatform": "Челнок",
    'storage': "Хранилище",
    'laboratory': "Лаборатория",
};

// BASIC ORDER NAMES
export const ORDER_MOVE_TO_PROCESSING = "moveToProcessing";
export const ORDER_MOVE_TO_REJECTED = "moveToRejected";
export const ORDER_MOVE_TO_LABORATORY = 'moveToLaboratory';
export const ORDER_MOVE_WHOLE_STACK = 'moveWholeStack';
export const ORDER_MOVE_TO_STORAGE = 'moveToStorage';

export const ORDER_TYPES_TRANSLATE_TABLE = {
    "moveWholeStack": "Перемещение<br>в приямке",
    "moveTopWheel": "Перенос верхнего колеса",
    "moveToLaboratory": "Лаборатория",
    "mergeWheelStacks": "Объединение стоп",
    "moveToProcessing": "Обработка",
    "moveToRejected": "Несоответствующая",
    "moveToStorage": "Хранилище",
}

export const EXTRA_ORDER_TYPES_TRANSLATE_TABLE = {
    'moveWholeStack': 'Перемещение в приямке',
    'moveTopWheel': 'Перенос верхнего колеса',
    'moveToLaboratory': 'Перенос колеса<br>в лабораторию',
    'mergeWheelStacks': 'Объединение стоп',
    'moveToProcessing': 'Перенос в обработку',
    'moveToRejected': 'Перенос в несоответствующую',
    'moveToStorage': 'Перенос в хранилище',
}

// - NAMES -
// + BASIC ATTRIBUTES +
export const BASIC_ATTRIBUTES = {
    BATCH_NUMBER: 'data-batch-number',
    WHEELS: 'data-wheels',
    BLOCKING_ORDER: 'data-blocking-order',
    ORDER_TYPE: 'data-order-type',
    WHEELSTACK_ID: 'data-wheelstack-id',
    WHEELSTACK_DATA: 'data-wheelstack-data',
}
// - BASIC ATTRIBUTES -

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
    GET_PRESET_DATA: `${mainAddress}/presets/by_id`,
    GET_PLACEMENT_HISTORY: `${mainAddress}/history/all`,
    GET_PLATFORMS: `${mainAddress}/platform/all`,
    GET_GRIDS: `${mainAddress}/grid/all`,
    GET_PLACEMENT_DATA: `${mainAddress}/`,
    GET_HISTORY_RECORD: `${mainAddress}/history/record`,
    GET_WHEELSTACK_RECORD: `${mainAddress}/wheelstacks/id`,
    GET_WHEEL_DATA_OBJECT_ID: `${mainAddress}/wheels/object_id`,
    GET_GRID_STATE: `${mainAddress}/grid`,
    GET_GRID_STATE_BY_NAME: `${mainAddress}/grid/name`,
    GET_PLATFORM_STATE: `${mainAddress}/platform`,
    GET_PLATFORM_STATE_BY_NAME: `${mainAddress}/platform/name`,
    GET_ORDER_BY_ID: `${mainAddress}/orders/order`,
    GET_STORAGE: `${mainAddress}/storages`,
    POST_COMPLETE_ORDER: `${mainAddress}/orders/complete`,
    POST_CANCEL_ORDER: `${mainAddress}/orders/cancel`,
    GET_GRID_LAST_CHANGE: `${mainAddress}/grid/change_time`,
    GET_PLATFORM_LAST_CHANGE: `${mainAddress}/platform/change_time`,
    GET_ALL_WHEELS: `${mainAddress}/wheels/all`,
    PATCH_RECONSTRUCT_WHEELSTACK: `${mainAddress}/wheelstacks/reconstruct`,
    PATCH_DECONSTRUCT_WHEELSTACK: `${mainAddress}/wheelstacks/deconstruct`,
    POST_CREATE_WHEEL: `${mainAddress}/wheels`,
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
export const COOKIE_UPDATE_INTERVAL = 1 * 60 * 1000;
// cookie Messages
export const AUTH_COOKIE_NOT_FOUND = 'auth-cookie-not-found';
export const AUTH_COOKIE_SESSION_EXPIRED = 'auth-cookie-session-expired';
export const RESTRICTED_TO_THIS_ROLE = 'user-role-restricted';
export const AUTH_COOKIE_INVALID ='auth-cookie-invalid';
// user-role cookie.
export const USER_ROLE_COOKIE_NAME = 'user-role';
export const USER_ROLE_COOKIE_BASIC_EXPIRE = 3 * 60;
export const USER_ROLE_COOKIE_UPDATE_INTERVAL = 1 * 60 * 1000;
// chosen-grid-platform cookie
// stored as `{active-user}-saved-{type} = placementId;presetId`
export const SAVED_GRID_COOKIE_NAME = 'saved-grid';
export const SAVED_PLATFORM_COOKIE_NAME = 'saved-platform';
export const ACTIVE_USERNAME_COOKIE_NAME = 'active-user';
// + EXTRA INTERVALS +
export const EXTRA_INTERVALS = {
    WHEELSTACK_CREATION_MENU_BATCHES: 500,
    WHEELSTACK_CREATION_MENU_WHEELS: 500,
}
// - EXTRA INTERVALS -

export const BASIC_COOKIES = [
    AUTH_COOKIE_NAME, USER_ROLE_COOKIE_NAME, ACTIVE_USERNAME_COOKIE_NAME
];

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
    'class': '',
    'text': 'Лаборатория',
    'href': labPage,
    'id': 'labRedirect',
    'insideList': true,
    'title': 'Страница изменения статуса лабораторных тестов партии',
}
const NAV_GRID_BUTTON = {
    'class': '',
    'text': 'Приямок',
    'href': gridPage,
    'id': 'gridRedirect',
    'insideList': true,
    'title': 'Основная страница приямка остывания',
}
const NAV_LOGIN_BUTTON = {
    'class': 'close-btn',
    'text': 'Выход',
    'href': loginPage,
    'id': 'loginRedirect',
    'insideList': false,
    'title': 'Страница авторизации',
}

const NAV_USERS_BUTTON = {
    'class': '',    
    'text': 'Пользователи',
    'href': usersPage,
    'id': 'usersRedirect',
    'insideList': true,
    'title': 'Страница управления пользователями системы',
}

const NAV_HISTORY_BUTTON = {
    'class': '',
    'text': 'История',
    'href': historyPage,
    'id': 'historyRedirect',
    'insideList': true,
    'title': 'Страница истории приямка остывания',
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

// GRID PAGE UPDATE INTERVALS
export const GRID_PLACEMENT_INTERVAL = 350;
export const UPDATE_BATCHES_DATA_INTERVAL = 350;
export const UPDATE_DATA_BANKS_INTERVAL = 200;
export const UPDATE_ORDERS_DATA_INTERVAL = 200;
export const WHEELSTACK_MENU_UPDATE_INTERVAL = 50;
export const ORDERS_TABLE_PRUNE_INTERVAL = 200;

// CONST TIMERS 
export const ORDERS_TABLE_ELEMENT_REMOVE_INDICATOR = 1600;
// SOME CONSTANTS
export const ORDERS_TABLE_BREAKSIZE = 1000;
export const WHEELSTACK_WHEELS_LIMIT = 6;


// + SEARCHERS SETTINGS +
export const BASIC_BATCH_SEARCHER_OPTIONS = {
    threshold: 0,
    distance: 0,
    ignoreLocation: true,
    minMatchCharLength: 1, 
}

export const BASIC_WHEELS_SEARCHER_OPTION = {
    threshold: 0,  // lower == stricter
    distance: 0,     // distance between matches
    ignoreLocation: true,  // true <- dont care about match place | false <- prioritize left-most symbols
    minMatchCharLength: 1,
}
// - SEARCHERS SETTINGS -


// FLASH MESSAGE COLORS
export const BASIC_INFO_MESSAGE_PRESET = {
    message: '',
    color: '#ffffff',           // White text color
    backgroundColor: '#17a2b8', // Cyan-blue for informational background
    fontSize: '12px',           // Default font size
    fontFamily: 'Arial, sans-serif', // Default font family
    duration: 1250              // Duration in milliseconds
};

export const BASIC_INFO_MESSAGE_WARNING = {
    message: '',
    color: '#000000',           // Black text color for visibility
    backgroundColor: '#ffc107', // Yellow background for warning
    fontSize: '12px',           // Default font size
    fontFamily: 'Arial, sans-serif', // Default font family
    duration: 1500              // Duration in milliseconds
}

export const BASIC_INFO_MESSAGE_ERROR = {
    message: '',
    color: '#ffffff',           // White text color
    backgroundColor: '#dc3545', // Red background for error
    fontSize: '12px',           // Default font size
    fontFamily: 'Arial, sans-serif', // Default font family
    duration: 1250              // Duration in milliseconds
};


export const TOM_SETTINGS = {
    WHEELSTACK_CREATION_BATCHES: {
        searchField: 'batchNumber',
        valueField: 'batchNumber',
        labelField: 'batchNumber',
        maxOptions: 250,
        highlight: true,
        placeholder: 'Выберите партию стопы',
        render: {
            option: function(data, escape) {
                return '<div class="check-batch-option">' + escape(data.batchNumber) + '</div>';
            },
            item: function(data, escape) {
                return '<div class="check-item">' + escape(data.batchNumber) + '</div>'
            }
        },
    },
    WHEELSTACK_CREATION_WHEELS: {
        searchField: 'wheelId',
        valueField: '_id',
        labelField: 'wheelId',
        maxOptions: 250,
        highlight: true,
        placeholder: 'Выбор колеса',
        render: {
            option: function(data, escape) {
                return '<div class="check-option">' + escape(data.wheelId) + '</div>';
            },
            item: function(data, escape) {
                return '<div class="check-item">' + escape(data.wheelId) + '</div>'
            }
        },
    },
}
