

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
