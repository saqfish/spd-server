const { log } = require("../util");
const events = require("../events/events");

const recordsRequest = (socket, records) => {
	log("RECORDS", "request")
	socket.emit(events.RECORDS, JSON.stringify(records)); 
};

module.exports = recordsRequest;
