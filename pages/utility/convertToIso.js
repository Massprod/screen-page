export default function convertISOToCustomFormat(isoDate, withBreaker = false) {
    // Parse the ISO date string
    const date = new Date(isoDate);
    
    // Extract day, month, year, hour, and minute
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const secs = String(date.getSeconds()).padStart(2, '0');

    let formattedDate = '';
    if (withBreaker) {
        formattedDate = `${hours}:${minutes}:${secs} <br> ${day}.${month}.${year}`;
    } else {
        formattedDate = `${hours}:${minutes}:${secs} - ${day}.${month}.${year}`;
    }

    return formattedDate;
}