/* Package */
const path = require("path");
const reload = require("reload");
const omitEmpty = require("omit-empty");
const socketio = require("socket.io");
const handlebars = require("express-handlebars");
const express = require("express");

const URL = require("./helpers/urls");

/* Route */
const homeRoute = require("./routes/home.route");
const chatRoute = require("./routes/chat.route");

const app = express();

/* Set Static */
app.use(express.static(path.join(__dirname, "public")));

/* Set View Engine */
app.engine(
	"hbs",
	handlebars({
		extname: ".hbs",
		layoutsDir: __dirname + "/views/layouts",
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
		/* Từ 4.6.0 Handlebars cấm access prototype prop & methods */
	})
);
app.set("view engine", "hbs");

/* Middleware */
app.use(express.urlencoded({ extended: false }));

const removeEmptyProperties = () => {
	return function (req, res, next) {
		req.body = omitEmpty(req.body);
		req.params = omitEmpty(req.params);
		req.query = omitEmpty(req.query);
		next();
	};
};
app.use(removeEmptyProperties());

app.use((req, res, next) => {
	res.locals.URL = URL;
	next();
}); // middleware của csrfToken phải đặt trước tất cả routes

/* Route */
app.use(homeRoute);
app.use("/chat", chatRoute);

/* Server */
const PORT = 9999;
reload(app);

const http = require("http");
const server = http.createServer(app);
const io = socketio(server);

const users = new Set();

io.on("connection", (socket) => {
	socket.on("join-room", ({ username, roomId }) => {
		users.add({
			id: socket.id,
			username,
		});
		socket.join(roomId);

		// notify
		console.log(`Đã đăng nhập ${username} vào Room : ${roomId}`);
		socket.emit("message", {
			sender: {
				id: null,
				username: "Bot",
			},
			message: `Chào mừng! Bạn vừa join room: ${roomId}`,
		});
		socket.to(roomId).emit("message", {
			sender: {
				id: null,
				username: "Bot",
			},
			message: `${username} vừa join vào room <3`,
		});
	});

	socket.on("message", ({ roomId, message }) => {
		const user = getUser(socket.id);
		io.to(roomId).emit("message", {
			sender: user,
			message,
		});
	});
});

const getClients = (roomId) => {
	if (!roomId) return io.sockets.adapter.sids;

	return io.sockets.adapter.rooms.get(roomId.toString());
};

const getUser = (userId) => {
	let user = null;

	users.forEach((u) => {
		if (u.id === userId) user = u;
	});

	return user;
};

server.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}`);
});
