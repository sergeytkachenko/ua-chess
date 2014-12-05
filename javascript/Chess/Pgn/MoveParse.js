Ext.define("Chess.Pgn.MoveParse", {

    castlingPattern : /[o0]/gi,
    figurePattern : /^([QKRBN])([a-h]?[0-9]?)?x?([a-h][0-9])[\+#]?$/g,
    pawnPattern : /^([a-h]?[1-8]?)[-x]?([a-h][1-8]?)(=([QRBK]))?[\+#]?$/g,

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
        this.terms = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Figures.Terms");
        this.pgnInterface = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Pgn.Interface");
    },

    // Rd5[+#] Ra5-d5[+#] Rxd5[+#] Ra5xd5[+#] Raxd5[+#] R5xd5[+#]
    // c2-c4[=Q+#] c4[=Q+#] cxd[=Q+#] c2xd3[=Q+#] c2xd[=Q+#] cxd3[=Q+#]
    /**
     * Возвращает массив клеточек откудово и куда был сделан ход,
     * если рокировка, то возвращает ход только короля
     * @param movePgn
     * @param color
     * @param boardPrev
     * @returns [fromCell, toCell, pawnTransform]
     */
    getMoves : function (movePgn, color, boardPrev) {
        // castling
        var m;
        if(this.castlingPattern.test(movePgn)) {
            m = this.getMoveCastling(movePgn, color);
        } else
        // figures move
        if(this.figurePattern.test(movePgn)) {
            m = this.getFigureMove(movePgn, color, boardPrev);
        } else
        // pawn move
        if(this.pawnPattern.test(movePgn)) {
            m = this.getPawnMove(movePgn, color, boardPrev);
        } else {
            Chess.Debuger.error("Not find pattern for move ", movePgn);
        }
        return m;
    },

    /**
     *
     * @param pgnMove
     * @param color
     * @returns {*}
     */
    getMoveCastling : function (pgnMove, color) {
        pgnMove = pgnMove.toLowerCase();
        if(pgnMove === "o-o" || pgnMove === "0-0") {
            return color==='w'? [51, 71] : [58, 78];
        } else if(pgnMove === "o-o-o" || pgnMove === "0-0-0") {
            return  color==='w'? [51, 31] : [58, 38];
        }
        return [];
    },

    // Rd5[+#] Ra5-d5[+#] Rxd5[+#] Ra5xd5[+#] Raxd5[+#] R5xd5[+#]
    getFigureMove : function (pgnMove, color, boardPrev) {
        var figure = pgnMove.replace(this.figurePattern, "$1"),
            fromCell = pgnMove.replace(this.figurePattern, "$2"),
            toCell = pgnMove.replace(this.figurePattern, "$3"),
            fromXY = Chess.Board.getCellOXInteger(fromCell);
        toCell = this.board.cellTransform(toCell);
        var fromCell = this.terms.getPossibleFromCell(boardPrev, fromXY, toCell, figure, color, false);
        if(!fromCell) {
            Chess.GroupRegistry.getUniqueInstance().get("board").printToConsole(boardPrev)

            Chess.Debuger.error("getFigureMove не смогла определить откудово пошла фигура, pgnMove =", [pgnMove, fromXY]);
        }
        return [fromCell, toCell];
    },

    // c2-c4[=Q+#] c4[=Q+#] cxd[=Q+#] c2xd3[=Q+#] c2xd[=Q+#] cxd3[=Q+#]
    getPawnMove : function (pgnMove, color, boardPrev) {
        var figure = 'p',
            toCell = pgnMove.replace(this.pawnPattern, "$2"),
            fromCell = pgnMove.replace(this.pawnPattern, "$1"),
            pawnTransform = pgnMove.replace(this.pawnPattern, "$4"),
            fromXY = Chess.Board.getCellOXInteger(fromCell);
        toCell = Number.parseInt(this.board.cellTransform(toCell));
        fromCell = this.terms.getPossibleFromCell(boardPrev, fromXY, toCell, figure, color, false);
        if(!fromCell) {
            var b = Chess.GroupRegistry.getInstance("aaaa").get("board").printToConsole(boardPrev);
            Chess.Debuger.error("getPawnMove не смогла определить откудово пошла пешка, pgnMove =", pgnMove);
        }
        return Array.isArray(fromCell)? ((pawnTransform)? [fromCell[0], fromCell[1], pawnTransform] : [fromCell[0], fromCell[1]]) : [fromCell, toCell];
    }
});