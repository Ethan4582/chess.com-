const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');

// instance of express app
const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const games = {}; // { roomId: { chess, players: {white, black} } }

app.get('/', (req, res) => {
   res.render("index");
});

app.get('/io/:id', (req, res) => {
   res.render("game", { gameId: req.params.id, title: "Chess Game" });
});

app.get('/api/room-exists/:id', (req, res) => {
  res.json({ exists: !!games[req.params.id] });
});

io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);

        // Create game if not exists
        if (!games[roomId]) {
            games[roomId] = {
                chess: new Chess(),
                players: {}
            };
        }

        const game = games[roomId];

        // Assign role
        let role;
        if (!game.players.white) {
            game.players.white = socket.id;
            role = "w";
        } else if (!game.players.black) {
            game.players.black = socket.id;
            role = "b";
        } else {
            role = "spectator";
        }

        socket.emit("playerRole", role);
        if (role === "spectator") socket.emit("spectatorRole");

        // Send current board state
        socket.emit("updateBoard", game.chess.fen());

        // Store roomId on socket for cleanup
        socket.roomId = roomId;
        socket.role = role;
    });

    socket.on("makeMove", (move) => {
        const roomId = socket.roomId;
        if (!roomId || !games[roomId]) return;

        const game = games[roomId];
        const chess = game.chess;

        // Only allow correct player to move
        if ((chess.turn() === 'w' && socket.id !== game.players.white) ||
            (chess.turn() === 'b' && socket.id !== game.players.black)) {
            return socket.emit("invalidMove", "It's not your turn!");
        }

        const res = chess.move(move);
        if (!res) {
            return socket.emit("invalidMove", "Invalid move!");
        }

        // Broadcast move and board state to all in room
        io.to(roomId).emit("moveMade", { move: res });
        io.to(roomId).emit("updateBoard", chess.fen());
    });

    socket.on("disconnect", () => {
        const roomId = socket.roomId;
        if (roomId && games[roomId]) {
            const game = games[roomId];
            if (game.players.white === socket.id) delete game.players.white;
            if (game.players.black === socket.id) delete game.players.black;
            // Optionally: delete game if no players left
        }
    });
});

server.listen(3000);
module.exports = server;