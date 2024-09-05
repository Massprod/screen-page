import { AUTH_COOKIE_NAME, BACK_URL, COOKIE_UPDATE_INTERVAL, AUTH_COOKIE_BASIC_EXPIRE, loginPage, AUTH_COOKIE_SESSION_EXPIRED, AUTH_COOKIE_NOT_FOUND, USER_ROLE_COOKIE_NAME, USER_ROLE_COOKIE_BASIC_EXPIRE, BASIC_COOKIES } from "../uniConstants.js";
import { postRequest } from "./basicRequests.js";


export async function setCookie(name, value, seconds = 0, path = "/", secure = false) {
    // Construct the cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path};`;

    // Set the expiration date if specified
    if (seconds) {
        const date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));  // Convert seconds to milliseconds
        cookieString += ` expires=${date.toUTCString()};`;
    }

    // Add secure flag if needed
    if (secure) {
        cookieString += " Secure;";
    }

    // Set the cookie
    document.cookie = cookieString;
}


export async function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        
        // Check if the cookie's name matches the requested name
        if (cookie.startsWith(`${encodeURIComponent(name)}=`)) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    
    return null;  // Return null if the cookie isn't found
}


export async function deleteCookie(name, path = "/") {
    // Set the cookie's expiration date to a time in the past to delete it
    const date = new Date();
    date.setTime(date.getTime() - 1000);  // Set to one second in the past
    
    let cookieString = `${encodeURIComponent(name)}=; expires=${date.toUTCString()}; path=${path};`;
    
    // Set the cookie to delete it
    document.cookie = cookieString;
}


export async function updateAuthCookie(cookieName) {
    const cookie = await getCookie(cookieName);
    if (!cookie) {
        return null;
    }
    const refreshURL = `${BACK_URL.POST_AUTH_REFRESH_TOKEN}?token=${cookie}`;
    const args = {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        }
    }
    const response = await postRequest(refreshURL, args, false);
    if (!response.ok) {
        await deleteCookie(cookieName);
        if (window.location.href !== loginPage) {
            window.location.href = `${loginPage}?message=${AUTH_COOKIE_SESSION_EXPIRED}`; 
        };
        return false;
    }
    const respData = await response.json();
    await setCookie(cookieName, respData['access_token'], AUTH_COOKIE_BASIC_EXPIRE);
    await setCookie(USER_ROLE_COOKIE_NAME, respData['user_role'], USER_ROLE_COOKIE_BASIC_EXPIRE);
    return true;
}


export async function keepAuthCookieFresh(name) {
    if (null === await updateAuthCookie(name)) {
        window.location.href = `${loginPage}?message=${AUTH_COOKIE_NOT_FOUND}`;
        return;
    }
    setInterval( async () => {
        if (null === await updateAuthCookie(name)) {
            window.location.href = `${loginPage}?message=${AUTH_COOKIE_NOT_FOUND}`;
            return;
        }
    }, COOKIE_UPDATE_INTERVAL)
}


export async function clearRedirect(cookieNames, pageUrl) {
    cookieNames.forEach( cookieName => {
        deleteCookie(cookieName);
    });
    window.location.href = pageUrl;
}


export async function validateRoleCookie(cookieName, validRoles, redirectUrl) {
    const role = await getCookie(cookieName);
    if (!(role in validRoles)) {
        clearRedirect(BASIC_COOKIES, redirectUrl);
    }
}
