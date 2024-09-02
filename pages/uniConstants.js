const mainAddress = "http://localhost:8000";
const authMainAddress = "http://localhost:8080";
const labPage = 'http://localhost:5500/screen/pages/labPage/laboratoryPage.html';
export const gridPage = 'http://localhost:5500/screen/pages/managerPage/managerPage.html';
const loginPage = 'http://localhost:5500/screen/pages/managerPage/loginPage.html'

export const BACK_URL  = {
    POST_BATCH_STATUS_UPDATE: `${mainAddress}/batch_number/update_laboratory_status`,
    GET_BATCHES_DATA_PERIOD: `${mainAddress}/batch_number/period`,
    GET_BATCH_DATA: `${mainAddress}/batch_number/batch_number`,
    POST_AUTH_CREDENTIALS: `${authMainAddress}/users/login`,
};

export const NAV_BUTTONS = [
    {
        'class': 'btn btn-secondary',
        'text': 'Лаборатория',
        'href': labPage,
    },
    {
        'class': 'btn btn-secondary',
        'text': 'Приямок',
        'href': gridPage,
    },
    {
        'class': 'btn btn-danger',
        'text': 'Выход',
        'href': loginPage,
    },
];

export const AUTH_COOKIE_NAME = 'auth-token';