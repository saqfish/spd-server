const { log } = require("../util");

const handleMessages = (data) => {
	// Message handler
	log("MESSAGE", data);
};

module.exports = { handleMessages };
