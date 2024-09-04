

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


export function validatePassword(
    password,
    regexPattern,
    minLength,
    maxLength,
) {
    const specialCharacters = '@$!%*#?&'; // Special characters for validation
    const regex = new RegExp(regexPattern);

    // Check length
    if (password.length < minLength || password.length > maxLength) {
        alert(`Пароль должен быть длиной от ${minLength} до ${maxLength} символов.`);
        return false;
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
        alert('Пароль должен содержать хотя бы одну цифру.');
        return false;
    }

    // Check for at least one letter
    if (!/[A-Za-z]/.test(password)) {
        alert('Пароль должен содержать хотя бы одну букву.');
        return false;
    }

    // Check for at least one special character
    if (!password.split('').some(char => specialCharacters.includes(char))) {
        alert('Пароль должен содержать хотя бы один специальный символ (@$!%*#?&).');
        return false;
    }

    // Check the regex pattern (if necessary)
    if (!regex.test(password)) {
        alert('Пароль не соответствует требованиям безопасности.');
        return false;
    }

    return true; // If all checks pass
}
