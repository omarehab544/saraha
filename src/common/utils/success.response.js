export const success_response = ({
    res,
    statusCode,
    message = "Done",
    data = undefined
} = {}) => {
    return res.status(statusCode || 200).json({ message, data })
}