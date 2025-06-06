const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');

// instance of express app
const app = express();

const server= http.createServer(app);
const io = socket(server);

const chess = new Chess(); // functionality to handle chess game logic

let players = {}; 
let currentPlayer = "w"; 

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); // static files like image

app.get('/', (req, res) => {
   res.render("index");
});

app.get('/io/:id', (req, res) => {
   res.render("game", { gameId: req.params.id, title: "Chess Game" });
});

io.on("connection", (uniqsocket) => {
   console.log("New player connected: " + uniqsocket.id, currentPlayer);
    if(! players.white){
      players.white = uniqsocket.id;
      uniqsocket.emit("playerRole", "w"); //  the person who connect tp us 
    }
    else if(! players.black){
      players.black = uniqsocket.id;
      uniqsocket.emit("playerRole", "b");
    } else {
      uniqsocket.emit("spectatorRole");
      return;
    }

    uniqsocket.on("disconnect", () => {
      if(uniqsocket.id === players.white) {
        delete players.white;
      }
      if(uniqsocket.id === players.black) {
        delete players.black;
      }
       
    });

    // validate the move
    uniqsocket.on("makeMove", (move) => {
      // check if the move is valid
      try{
         if(chess.turn()==='w' && uniqsocket.id !== players.white){
            return uniqsocket.emit("invalidMove", "It's not your turn!");
         }

         if(chess.turn()==='b' && uniqsocket.id !== players.black){
            return uniqsocket.emit("invalidMove", "It's no; your turn!");
         }

        const res= chess.move(move); // make the made 
         if(!res) {
            return uniqsocket.emit("invalidMove", "Invalid move!");
         }

         if(res){
            currentPlayer = chess.turn(); // update the current player
            io.emit("moveMade", { //board state update
              move: res,
            //   turn: currentPlayer
            }); // broadcast the move to all players 
             io.emit("boradState", chess.fen()); // update the board state for all players
         }else{
            return uniqsocket.emit("invalidMove", "Invalid move!");
         }

      }
      catch(err) {
        console.error("Invalid move attempted: ", err);
        uniqsocket.emit("invalidMove", "Invalid move!");
      }
    });

});

server.listen(3000, ()=>{
   console.log("Server is running on port 3000");
});