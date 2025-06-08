function getPieceUnicode(type, color) {
    const pieces = {
        p: { w: "♙", b: "♟" },
        r: { w: "♖", b: "♜" },
        n: { w: "♘", b: "♞" },
        b: { w: "♗", b: "♝" },
        q: { w: "♕", b: "♛" },
        k: { w: "♔", b: "♚" }
    };
    // Check if the type and color exist in the pieces object
    return pieces[type][color] || ""; // Return an empty string if not found
}

const socket = io();

const chess = new Chess();

const boardElement = document.querySelector(".chessboard"); 

let draggedPiece = null;
let source = null;
let playerRole = null;

const params = new URLSearchParams(window.location.search);
const username = params.get('username') || "Guest";

const renderBoard = () => {
   const board = chess.board();
   boardElement.innerHTML = ""; // clear the board

   board.forEach((row, rowIndex) => {
      row.forEach((square, squareIndex) => {
         const squareElement = document.createElement("div");
         squareElement.classList.add("square",
            (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
         );

         squareElement.dataset.row = rowIndex;
         squareElement.dataset.col = squareIndex;

         if(square) {
            const pieceElement = document.createElement("div");
            pieceElement.classList.add("piece", square.color==='w' ?"white" :"black", square.type);
            
            pieceElement.innerText = getPieceUnicode(square.type, square.color);
 
            pieceElement.draggable = playerRole===square.color;
              
            pieceElement.addEventListener("dragstart", (e) => {
               if(pieceElement.draggable) {
                  draggedPiece = pieceElement;
                  source = {row: rowIndex, col: squareIndex};
                  e.dataTransfer.setData("text/plain", "");
               }
            });
            pieceElement.addEventListener("dragend", (e) => {
               draggedPiece = null;
               source = null;
            });
            squareElement.appendChild(pieceElement);
         }

         squareElement.addEventListener("dragover", (e) => {
            e.preventDefault();
         });
         squareElement.addEventListener("drop", (e) => {
            e.preventDefault();
            if(draggedPiece && source) {
               const target = {row: parseInt(squareElement.dataset.row), col: parseInt(squareElement.dataset.col)};
               handleMove(source, target);
            }
         });
         boardElement.appendChild(squareElement);
      }); 
   });

   if (playerRole === "b") {
      boardElement.classList.add("flipped");
   } else {
      boardElement.classList.remove("flipped");
   }
};

function updatePlayerInfo() {
  const infoDiv = document.getElementById('player-info');
  let roleText = "";
  if (playerRole === "w") roleText = "White";
  else if (playerRole === "b") roleText = "Black";
  else roleText = "Spectator";
  infoDiv.innerHTML = `<div>${username} <span class="text-primary">(${roleText})</span></div>`;
}

const handleMove = (source, target) => {
   const move={
       from:`${String.fromCharCode(97 + source.col)}${8 - source.row}`,
       to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`, 
         promotion: "q" 
   }
   socket.emit("makeMove", move); // emit the move to the server
   draggedPiece = null; // reset the dragged piece
};

function updateStepButtons() {
    const backBtn = document.getElementById('step-back');
    const forwardBtn = document.getElementById('step-forward');
    if (playerRole === "spectator") {
        backBtn.style.display = "none";
        forwardBtn.style.display = "none";
    } else {
        backBtn.style.display = "";
        forwardBtn.style.display = "";
    }
}


socket.on("playerRole", (role) => {
   playerRole = role;
   updatePlayerInfo();
   renderBoard();
   updateStepButtons();
});

socket.on('SpectatorRole', () => {
   playerRole = "spectator";
   updatePlayerInfo();
   renderBoard();
   updateStepButtons();
});

socket.on("updateBoard", (board) => {
   chess.load(board); //
   renderBoard();
});


socket.on("moveMade", (data) => {
   const { move } = data;
   chess.move(move); 
   renderBoard(); // 
});

socket.on("invalidMove", (msg) => {
    alert(msg || "You are playing an invalid move or dragging not properly.");
});

const urlParams = window.location.pathname.split('/');
const roomId = urlParams[urlParams.length - 1];
socket.emit("joinRoom", roomId);

// Call the function to render the board on page load
renderBoard();

document.getElementById('step-back').onclick = () => {
    socket.emit("stepHistory", "back");
};
document.getElementById('step-forward').onclick = () => {
    socket.emit("stepHistory", "forward");
};