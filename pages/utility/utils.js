

export function formatDate(dateString) {
    let date = new Date(dateString);
    // It always should take care of this by default, but doesn't work.
    // Hmm??? Extra applying `offset`.
    let offset = date.getTimezoneOffset() * 60 * 1000;
    date = new Date(date - offset);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    // const year = String(date.getFullYear()).slice(-2);
    const year = String(date.getFullYear()).slice(-4);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}:${month}:${year} | ${hours}:${minutes}`;
}
