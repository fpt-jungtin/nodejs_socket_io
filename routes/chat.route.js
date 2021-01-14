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

const getChatRoom = (id) => {
	return chatRooms.find((r) => r.id === parseInt(id));
};

router.post("/", (req, res) => {
	res.redirect(`${URL.CHAT}/${req.body.room}?username=${req.body.username}`);
});

router.get("/:roomId", (req, res) => {
	res.render("chat", {
		username: req.query.username,
		room: getChatRoom(req.params.roomId),
	});
});

module.exports = router;
