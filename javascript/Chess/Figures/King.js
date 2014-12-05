Ext.define("Chess.Figures.King", {

    statics : {
        getPossibleMoves : function (board, fromCell, vectors, isSelfColor) {
        console.time('getPossibleMoves-static');
        var color = board[fromCell][0];
        var possibleMoves = [],
            x = parseInt(String(fromCell)[0]),
            y = parseInt(String(fromCell)[1]);
        for(key in vectors) {
            var vector = vectors[key];
            var xl=x+vector[0], yl=y+vector[1],
                cell = xl+""+yl,
                figure = board[cell];
            if(typeof figure !== 'string' || (figure.search(color) !== -1 && isSelfColor !== true) ) {
                continue;
            }
            possibleMoves.push(parseInt(cell));
        }
        console.timeEnd('getPossibleMoves-static');
        // Рокировка подсчитывается отдельно в другом методе
        return possibleMoves;
        }
    },

    requires : [
        "Chess.Figures.FigureInterface"
    ],
    vectors : [
        [-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0]
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
        this.pgnInterface = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Pgn.Interface");
    },

    /**
     * Returns all possible stroke without hidden step King - без учетаа скрытого шага королю
     * @param fromCell
     * @param color
     * @returns {Array}
     */
    getPossibleMoves : function (fromCell, color, isSelfColor) {
        return Chess.Figures.King.getPossibleMoves(this.board.board, fromCell, this.vectors, isSelfColor);
        // var me = this,
        //     possibleMoves = [],
        //     x = parseInt(String(fromCell)[0]),
        //     y = parseInt(String(fromCell)[1]);
        // for(key in this.vectors) {
        //     var vector = this.vectors[key];
        //     var xl=x+vector[0], yl=y+vector[1],
        //         cell = xl+""+yl,
        //         figure = me.board.board[cell];
        //     if(!figure || (figure.search(color) !== -1 && isSelfColor !== true) ) {
        //         continue;
        //     }
        //     possibleMoves.push(parseInt(cell));
        // }
        // // Рокировка подсчитывается отдельно в другом методе
        // return possibleMoves;
    },

    // possible notation = KQkq
    getCastlingMoves : function (color, allBrokenCells, isCheck) {
        if(isCheck) {
            return [];
        }
        var fen = this.pgnInterface.getLastFenFromMove();
            castling = Chess.Fen.Reader.getCastling(fen),
            possibleMoves = [];
        // TODO проверить возможность прохождения битого поля
        // TODO проверить пешки на 7-й горизонтале
        if(!castling) {
            return [];
        }
        switch(color) {
            case "w" :
                if(this.board.getCell(52) === "bp")
                    return [];
                if(castling.search("K") !== -1) { // короткая рокировка, белых фигур
                    if(allBrokenCells.indexOf(61) === -1 && this.board.getCell(72) !== "bp") {
                        if(this.board.getCell(61)==="" && this.board.getCell(71)==="") {
                            possibleMoves.push(71); // g1
                        }
                    }
                } else if(castling.search("Q") !== -1) {
                    if(allBrokenCells.indexOf(41) === -1 && this.board.getCell(32) !== "bp") {
                        if(this.board.getCell(21)==="" && this.board.getCell(31)==="" && this.board.getCell(41)==="") {
                            possibleMoves.push(31); // c1
                        }
                    }
                }
            break;
            case "b" :
                if(this.board.getCell(57) === "wp")
                    return [];
                if(castling.search("k") !== -1) { // короткая рокировка, белых фигур
                    if(allBrokenCells.indexOf(68) === -1 && this.board.getCell(77) !== "wp") {
                        if(this.board.getCell(68)==="" && this.board.getCell(78)==="") {
                            possibleMoves.push(78); // g8
                        }
                    }
                } else if(castling.search("q") !== -1) {
                    if(allBrokenCells.indexOf(48) === -1 && this.board.getCell(37) !== "wp") {
                        if(this.board.getCell(28)==="" && this.board.getCell(38)==="" && this.board.getCell(48)==="") {
                            possibleMoves.push(38); // c8
                        }
                    }
                }
        }
        return possibleMoves;
    }
});