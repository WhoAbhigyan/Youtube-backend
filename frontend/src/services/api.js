import axios from "axios";

/**
 * Single axios instance for the whole app.
 * `withCredentials` is required because the backend keeps the access token in
 * an httpOnly cookie (it also accepts an Authorization header, but we never
 * handle tokens in JS/localStorage).
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 30000
});

/**
 * The backend builds every response as
 *   new ApiResponse(statusCode, payload, "human readable status")
 * which serialises to { statusCode, message: payload, data: status, success }.
 * `message` is therefore the payload the UI needs; `data` is only a label.
 */
export const unwrap = (response) => response.data.message;

/** Used when the server answers without a message, so the UI still says something useful. */
const FALLBACK_ERRORS = {
    400: "That request could not be processed",
    401: "Your session has expired. Please sign in again",
    403: "You do not have access to this resource",
    404: "We could not find what you were looking for",
    409: "That already exists",
    413: "That file is too large",
    429: "Too many requests. Please slow down",
    500: "Something went wrong on our side. Please try again",
    502: "The server took too long to respond",
    503: "The service is temporarily unavailable"
};

export const getErrorMessage = (error, fallback = "Something went wrong") => {
    if (!error) return fallback;

    if (error.code === "ECONNABORTED") {
        return "The request timed out. Please try again";
    }

    if (!error.response) {
        return "Cannot reach the server. Is the backend running?";
    }

    const { status, data } = error.response;

    if (data && typeof data === "object") {
        if (typeof data.message === "string") return data.message;
        if (typeof data.error === "string") return data.error;
    }

    return FALLBACK_ERRORS[status] || fallback;
};

export const getErrorStatus = (error) => error?.response?.status ?? null;

export default api;
