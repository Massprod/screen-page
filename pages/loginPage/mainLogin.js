import { BACK_URL, AUTH_COOKIE_NAME, gridPage, AUTH_COOKIE_BASIC_EXPIRE } from "../uniConstants.js";
import { FLASH_MESSAGES } from "../managerPage/js/constants.js";
import { setCookie, updateCookie } from "../utility/roleCookies.js";
import flashMessage from "../utility/flashMessage/flashMessage.js";


window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message === 'session-expired') {
        flashMessage.show({
            message: `Токен доступа больше не действителен. Перезайдите в систему.`,
            color: FLASH_MESSAGES.BASIC_TEXT_COLOR,
            backgroundColor: FLASH_MESSAGES.BASIC_BG_COLOR,
            position: FLASH_MESSAGES.BASIC_POSITION,
            duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
        });
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }
    if (await updateCookie(AUTH_COOKIE_NAME)) {
        window.location.href = gridPage;
    }
};



document.getElementById('userData').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
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
            // alert('Пользователь с таким именем не существует.')
            flashMessage.show({
                message: `Пользователь с таким именем не существует.`,
                color: FLASH_MESSAGES.BASIC_TEXT_COLOR,
                backgroundColor: FLASH_MESSAGES.BASIC_BG_COLOR,
                position: FLASH_MESSAGES.BASIC_POSITION,
                duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
            });
        } else if (403 === response.status) {
            if ('Blocked' === respData['detail']) {
                flashMessage.show({
                    message: `Пользователь заблокирован.`,
                    color: FLASH_MESSAGES.BASIC_ERROR_COLOR,
                    backgroundColor: FLASH_MESSAGES.BASIC_ERROR_BG_COLOR,
                    position: FLASH_MESSAGES.BASIC_POSITION,
                    duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
                });
            } else {
                flashMessage.show({
                    message: `Указан неправильный пароль.`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: FLASH_MESSAGES.BASIC_POSITION,
                    duration: FLASH_MESSAGES.BASIC_SHOW_TIME,
                });
            }
        }
        return;
    }
    const authToken = respData['access_token'];
    await setCookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_BASIC_EXPIRE);
    window.location.href = gridPage;
})
