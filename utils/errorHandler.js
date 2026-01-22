export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.code || 500;
    const message = err.message || err.msg || "Internal Server Error";

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};
