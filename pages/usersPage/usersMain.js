import {
    AUTH_COOKIE_NAME,
    BASIC_COOKIES,
    loginPage,
    NAV_BUTTONS,
    RESTRICTED_TO_THIS_ROLE,
    USER_ROLE_COOKIE_NAME,
    USER_ROLE_COOKIE_UPDATE_INTERVAL,
    USERS_PAGE_ROLES,
} from "../uniConstants.js";
import {
    clearRedirect,
    keepAuthCookieFresh,
    validateRoleCookie,
    getCookie,
} from "../utility/roleCookies.js";
import NavigationButton from "../utility/navButton/navButton.js";


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
