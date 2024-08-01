const socket = io();

// // for send data frontend to backend
// socket.emit("churan");

// // data recived from backend
// socket.on("churan paapdi", () => {
//     console.log("churan paapdi recived");
// })

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;


const getPieceUnicode = (peice) => {
    const unicodePieces = {
        p: '♙',
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔'
    }

    return unicodePieces[peice.type] || "";
};


const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            // console.log(square);

            const squareElement = document.createElement("div");

            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if(square)
            {
                const pieceElement = document.createElement("div");

                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black" );

                pieceElement.innerText = getPieceUnicode(square);

                pieceElement.draggable = playerRole === square.color; 

                pieceElement.addEventListener("dragstart", (e) => {
                    if(pieceElement.draggable)
                    {
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowIndex, col: squareIndex};
                        e.dataTransfer.setData("text/plain", "");
                    }
                });


                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                })

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            })

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if(draggedPiece)
                {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }

                    handleMove(sourceSquare, targetSource);
                }
            })
            boardElement.appendChild(squareElement);
        })
    });

    if(playerRole === 'b')
    {
        boardElement.classList.add('flipped');
    }
    else{
        boardElement.classList.remove('flipped');
    }
};

renderBoard();


const handleMove = (source, target) => {
    const move = {
        from : `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to : `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion : 'q' 
    }

    socket.emit("move", move);
};



socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
})

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
}) 

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
})