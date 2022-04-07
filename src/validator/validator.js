
const isValidUrl = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value !== "string") return false
    if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/gi.test(value))) return false
    return true;
};

const longUrlPresent = function (data) {
    if (!Object.keys(data).includes('longUrl')) {
        return false
    } else return true
}


module.exports = {
    longUrlPresent,
    isValidUrl
}