export function getShiftedFromCurrent(days) {
    // Get the current date
    const currentDate = new Date();
    
    // Shift the date by the specified number of days
    currentDate.setDate(currentDate.getDate() + days);
    
    // Format the date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    // Return the formatted date
    return `${year}-${month}-${day}`;
}

export const getISOFormatUTC = (secondsShift = 0) => {
    // Create a new Date object
    const date = new Date();

    // Shift the date by the provided number of seconds (positive or negative)
    date.setSeconds(date.getSeconds() + secondsShift);

    // Get the ISO string and replace 'Z' with '+00:00' for explicit UTC time zone
    const isoString = date.toISOString();
    const isoWithUTC = isoString.replace('Z', '+00:00');
    return isoWithUTC;
}

export const convertToUTC = (localDateTime) => {
    // Returns UTC time in ISO 8601 format
    let localDate = new Date(localDateTime);
    localDate = localDate.toISOString();
    localDate = localDate.replace('Z', '+00:00');
    return localDate;
}

export const convertUTCToLocal = (utcDateTime) => {
    const utcDate = new Date(utcDateTime);
    
    // Get local time offset in minutes and convert to milliseconds
    const offset = utcDate.getTimezoneOffset() * 60000;
    
    // Adjust the UTC time to local by adding the offset
    const localTime = new Date(utcDate.getTime() - offset);
    
    // Format as "YYYY-MM-DDTHH:MM" (required for <input type="datetime-local">)
    return localTime.toISOString().slice(0, 16);
}