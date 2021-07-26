const { log } = require("../util");

const handleAdmin = (data) => {
	log("ADMIN", data);
};

module.exports = { handleAdmin };
