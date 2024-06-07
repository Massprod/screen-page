export default function convertISOToCustomFormat(isoDate) {
    // Parse the ISO date string
    const date = new Date(isoDate);
    
    // Extract day, month, year, hour, and minute
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Format the date as ddMMyyyy mmHH
    const formattedDate = `${minutes}:${hours} - ${day}.${month}.${year}`;

    return formattedDate;
}