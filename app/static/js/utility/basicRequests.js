import { clearRedirect, getCookie } from './roleCookies.js';
import {
    AUTH_COOKIE_NAME,
    BASIC_COOKIES,
    loginPage,
    AUTH_COOKIE_INVALID,
} from '../uniConstants.js';


export async function getRequest(url, catchErrors = true, includeAuthCookie = false, args = {method: "GET"}) {
    try {
        if (includeAuthCookie) {
            const authCookie = await getCookie(AUTH_COOKIE_NAME);
            var extraArgs = {
                'headers': {
                    'Content-type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authCookie}`,
                }
            }
        }
        Object.assign(args, extraArgs);
        if (!'headers' in args) {
            args['headers'] = {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            }
        }
        const response = await fetch(url, args)
        await validAuthorization(response);
        if (catchErrors && !response.ok) {
            throw new Error(`Error while getting data ${response.statusText}. URL = ${url}`);
        }
        return response;
    } catch (error) {
        console.error(
            `There was a problem with getting data: ${error}`
        );
        throw error;
    }
}


export async function patchRequest(url, catchErrors = true,  includeAuthCookie = false, args={method: 'PATCH'}) {
    try {
        if (includeAuthCookie) {
            const authCookie = await getCookie(AUTH_COOKIE_NAME);
            var extraArgs = {
                'headers': {
                    'Content-type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authCookie}`,
                }
            }
        }
        Object.assign(args, extraArgs);
        if (!'headers' in args) {
            args['headers'] = {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            }
        }
        const response = await fetch(url, args);
        await validAuthorization(response);
        if (catchErrors &&  !response.ok) {
            throw new Error(`Error while making PATCH request = ${response.statusText}. URL = ${url}`);
        }
        return response;
    } catch (error) {
        console.error(
            `There was a problem with PATCH request: ${error}`
        );
        throw error;
    }
}


export async function postRequest(url, catchErrors = true, includeAuthCookie = false, args = {'method': 'POST'}) {
    try {
        if (includeAuthCookie) {
            const authCookie = await getCookie(AUTH_COOKIE_NAME);
            var extraArgs = {
                'headers': {
                    'Content-type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authCookie}`,
                }
            }
        }
        Object.assign(args, extraArgs);
        if (!('headers' in args)) {
            args['headers'] = {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            }
        }
        const response = await fetch(url, args);
        await validAuthorization(response);
        if (catchErrors &&  !response.ok) {
            throw new Error(`Error while making POST request = ${response.statusText}. URL = ${url}`);
        }
        return response;
    } catch (error) {
        console.error(
            `There was a problem with POST request: ${error}`
        );
        throw error;
    }
}


async function validAuthorization(response) {
    // AUTH error, only getting 401 from backPart when TOKEN is Invalid,
    //  so we can cover this error in every request.
    const redirectUrl = `${loginPage}?message=${AUTH_COOKIE_INVALID}`
    if (401 === response.status) {
        await clearRedirect(BASIC_COOKIES, redirectUrl);
    }
}
