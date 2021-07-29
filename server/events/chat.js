const { log } = require("../util");

const handleChat = (data) => {
	log("Chat -- ", data);
};

module.exports = { handleChat };
