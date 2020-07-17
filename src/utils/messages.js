const generateMessage = (username, text) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime()
    }
};

const generateLocationMessage = (username, mapsUrl) => {
    return {
        username: username,
        url: mapsUrl,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}