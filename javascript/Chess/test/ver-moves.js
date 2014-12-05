var verMovesCount = 100;
function verMoves () {
    if(verMovesCount < 0) {
        return false;
    }
    var group = Chess.GroupRegistry.getInstance('play2');
    var board = group.get("Chess.Board"),
        terms = group.get("Chess.Figures.Terms");

    // p, B, N, R, Q, K [w, b] -- wp, bp, wB, bB, bK, wK ...
    var figures = ["", "", "wp", "", "", "", "", "", "bp", "", "", "", "", "wN", "", "", "bN", "", "wB", "", "", "", "", "", "", "", "", "", "bB", "", "wR", "", "", "bR", "", "", "", "", "wQ", "", "bQ", "", "wK", "", "bK"];

    var cells = [11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48,51,52,53,54,55,56,57,58,61,62,63,64,65,66,67,68,71,72,73,74,75,76,77,78,81,82,83,84,85,86,87,88]

    var wK, bK;

    Ext.iterate(board.board, function (cell) {
        var f = figures[getRandomInt(0, figures.length-1)];
        f = f==="wK" && wK? "" : f;
        f = f==="bK" && bK? "" : f;
        wK = wK || f==="wK"? true : null;
        bK = bK || f==="bK"? true : null;
        board.setCell(cell, f);
    });
    board.printFigures();
    var cell=null;

    while(cell===null) {
        var cl = cells[getRandomInt(0, cells.length-1)];
        if(board.getCell(cl)!=="") {
            cell =  cl;
        }
    }
    verMovesCount--;
    board.savePossibleMoves(cell, terms.getPossibleMoves(cell));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
