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

     
        if (!games[roomId]) {
            const chess = new Chess();
            games[roomId] = {
                chess,
                players: {},
                history: [chess.fen()] 
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

        socket.roomId = roomId;
        socket.role = role;
    });

    socket.on("makeMove", (move) => {
        const roomId = socket.roomId;
        if (!roomId || !games[roomId]) return;

        const game = games[roomId];
        const chess = game.chess;

        if ((chess.turn() === 'w' && socket.id !== game.players.white) ||
            (chess.turn() === 'b' && socket.id !== game.players.black)) {
            return socket.emit("invalidMove", "It's not your turn!");
        }

        try {
            const res = chess.move(move);
            if (!res) {
                return socket.emit("invalidMove", "Invalid move!");
            }
            // Save FEN to history
            game.history.push(chess.fen());

            io.to(roomId).emit("moveMade", { move: res });
            io.to(roomId).emit("updateBoard", chess.fen());
        } catch (err) {
            socket.emit("invalidMove", "You are playing an invalid move or dragging not properly.");
            // rollback to previous FEN when erro happem
            if (game.history.length > 0) {
                const lastFen = game.history[game.history.length - 1];
                chess.load(lastFen);
                io.to(roomId).emit("updateBoard", lastFen);
            }
        }
    });

    socket.on("stepHistory", (direction) => {
        const roomId = socket.roomId;
        if (!roomId || !games[roomId]) return;
        const game = games[roomId];

        if (typeof game.historyIndex !== "number") {
            game.historyIndex = game.history.length - 1;
        }

        if (direction === "back" && game.historyIndex > 0) {
            game.historyIndex--;
        } else if (direction === "forward" && game.historyIndex < game.history.length - 1) {
            game.historyIndex++;
        }

        const fen = game.history[game.historyIndex];
        if (fen) {
            game.chess.load(fen);
            io.to(roomId).emit("updateBoard", fen);
        }
    });

    socket.on("disconnect", () => {
        const roomId = socket.roomId;
        if (roomId && games[roomId]) {
            const game = games[roomId];
            if (game.players.white === socket.id) delete game.players.white;
            if (game.players.black === socket.id) delete game.players.black;
            
        }
    });
});

server.listen(3000);
module.exports = server;