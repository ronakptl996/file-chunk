class ApiError extends Error {
    statusCode;
    data;
    success;
    message;
    error;
    constructor(
        statusCode,
        message = "Something went wrong",
        error,
        stack = ""
    ) {
        super();
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.error = error;

        if (error instanceof Error) {
            this.error = {
                message: error.message,
                stack: error.stack,
            };
        } else if (typeof error === "object" && error !== null) {
            this.error = error;
        } else {
            this.error = { message: error };
        }

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
