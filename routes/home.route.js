const express = require("express");
const router = express.Router();
const URL = require("../helpers/urls");

const chatRooms = [
	{
		id: 1,
		name: "Room No.1",
	},
	{
		id: 2,
		name: "Room No.2",
	},
	{
		id: 3,
		name: "Room No.3",
	},
];

router.get("/", (req, res) => {
	res.render("home", {
		rooms: chatRooms,
	});
});

module.exports = router;
