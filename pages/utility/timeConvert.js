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
