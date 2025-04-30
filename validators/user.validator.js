/**
 *
 * @param {string} username
 * @returns {boolean}
 */
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
}

/**
 *
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
    // At least 1 uppercase, 1 number, 1 special char, minimum 7 characters
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;
    return passwordRegex.test(password);
}

export {
    validateUsername,
    validatePassword
};