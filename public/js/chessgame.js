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

   if(playerRole==="b"){
      boardElement.classList.add("flipped");
   }else{
      boardElement.classList.remove("flipped");
   }
};



const handleMove = (source, target) => {
   const move={
       from:`${String.fromCharCode(97 + source.col)}${8 - source.row}`,
       to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`, 
         promoition: "q" 
   }
   socket.emit("makeMove", move); // emit the move to the server
   draggedPiece = null; // reset the dragged piece
};

socket.on("playerRole", (role) => {
   playerRole = role;
   renderBoard();
});

socket.on('SpectatorRole', () => {
   playerRole = null; // No specific role for spectato
   renderBoard();
});

socket.on("updateBoard", (board) => {
   chess.load(board); // load the birard state 
   renderBoard();
});


socket.on("moveMade", (data) => {
   const { move } = data;
   chess.move(move); // make the move on the chess instance
   renderBoard(); // re-render the board
});


// Call the function to render the board on page load
renderBoard();