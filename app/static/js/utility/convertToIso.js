export function convertISOToCustomFormat(
    isoDate,
    withBreaker = false,
    convertToLocalTimezone = false,
    includeTimezone = false,
    dateFirst = false,
) {
    // Parse the ISO date string
    let date = new Date(isoDate);

    // Log the original date and timezone for debugging
    // console.log('Original ISO date:', isoDate);
    // console.log('Parsed Date object:', date);
    
    // Get user's timezone for debugging
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // console.log('User\'s detected timezone:', userTimeZone);

    if (convertToLocalTimezone) {
        // Get the user's local timezone offset in minutes (negative values mean ahead of UTC)
        const timezoneOffsetInMinutes = date.getTimezoneOffset();
        // console.log('Timezone offset in minutes:', timezoneOffsetInMinutes);
        if (includeTimezone) {
            var timezoneShift = (timezoneOffsetInMinutes / 60) * -1;
        }
        // Convert the offset to milliseconds and adjust the date
        date = new Date(date.getTime() - (timezoneOffsetInMinutes * 60 * 1000));
        // console.log('Adjusted Date object:', date);
    }

    // Extract day, month, year, hour, minute, and seconds
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const secs = String(date.getSeconds()).padStart(2, '0');

    // Generate formatted date
    let formattedDate = '';
    if (withBreaker) {
        if (dateFirst) {
            formattedDate = `${day}.${month}.${year} <br> ${hours}:${minutes}:${secs}`
        } else {
            formattedDate = `${hours}:${minutes}:${secs} <br> ${day}.${month}.${year}`;
        }
    } else {
        if (dateFirst) {
            formattedDate = `${day}.${month}.${year} - ${hours}:${minutes}:${secs}`
        } else {
            formattedDate = `${hours}:${minutes}:${secs} - ${day}.${month}.${year}`;
        }
    }

    if (convertToLocalTimezone && includeTimezone) {
        const sign = timezoneShift >= 0 ? '+' : '-';
        formattedDate = `${formattedDate} | UTC ${sign}${Math.abs(timezoneShift)}:00`;
    }
    return formattedDate;
}
