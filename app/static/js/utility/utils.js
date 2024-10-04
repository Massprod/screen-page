

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
    inputElement,
    password,
    regexPattern,
) {
    const specialCharacters = '@$!%*#?&'; // Special characters for validation
    const regex = new RegExp(regexPattern);
    let correct = true;

    if (!/\d/.test(password)) {
        inputElement.setCustomValidity('Пароль должен содержать хотя бы одну цифру.');
        correct =  false;
    } else if (!/[A-Za-z]/.test(password)) {
        inputElement.setCustomValidity('Пароль должен содержать хотя бы одну букву.');
        correct = false;
    } else if (!password.split('').some(char => specialCharacters.includes(char))) {
        inputElement.setCustomValidity('Пароль должен содержать хотя бы один специальный символ (@$!%*#?&).');
        correct = false;
    } else if (!regex.test(password)) {
        inputElement.setCustomValidity('Пароль не соответствует требованиям безопасности.');
        correct = false;
    }

    return correct;
}


export function validateUsername(
    username,
    regexPattern,
    minLength,
    maxLength
) {
    const regex = new RegExp(regexPattern);
    if (username.length < minLength || username.length > maxLength) {
        alert(`Имя пользователя должно быть длиной от ${minLength} до ${maxLength} символов.`);
        return false;
    }
    if (!regex.test(username)) {
        alert('Имя пользователя не соответствует требованиям безопасности');
        return false
    }
    return true;
}
