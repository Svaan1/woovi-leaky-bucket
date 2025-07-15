export const parseError = (error: Error): string => {
    try {
        const message = error.message;
        const jsonString = message.substring(message.indexOf('['));
        const errors = JSON.parse(jsonString);
        if (Array.isArray(errors) && errors.length > 0 && errors[0].message) {
            return errors[0].message;
        } else {
            return "An unknown error occurred.";
        }
    } catch (e) {
        return error.message;
    }
}