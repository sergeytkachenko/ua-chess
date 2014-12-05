/**
 * Генератор PGN нотации из ходов на доске
 */
Ext.define("Chess.Pgn.Generator", {

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        var group = Chess.GroupRegistry.getInstance(this.boardID);
        this.group = group;

        this.common = group.get("Chess.Pgn.Common");
        this.pgnInterface = group.get("Chess.Pgn.Interface");
        this.board = group.get('board');
        this.terms = group.get("Chess.Figures.Terms");
        //this.fen = Chess.Fen.getInstance(tableId);

    },

    /**
     * Генерирует xml представление хода
     * @param figure - фигура
     * @param cellFrom - откудово
     * @param cellTo - куда
     * @param color - цвет фигуры
     */
    getXmlMove : function (figure, cellFrom, cellTo, color, fen, pawnTransform) {
        var movePgn = this.generationMovePgn(figure, cellFrom, cellTo, color, pawnTransform);
        var number = this.getCurrentNumberMove(null);
        var xmlMove = this.common.generationMoveXml(movePgn, color, number);
        if(fen) {
            xmlMove = Chess.Pgn.XML.addFenToMove(xmlMove, fen);
        }
        return xmlMove;
    },

    /**
     * добавляет новый ход в pgn xml дерево
     * @param cellFrom
     * @param cellTo
     */
    getNewMove : function (cellFrom, cellTo) {
        var PgnHtml = Chess.PgnHtml.getInstance(this.tableId);
        var currentMove = this.parent.getCurrentXmlMove(),
            n = this.getCurrentNumberMove(currentMove),
            c = $(currentMove).attr("data-color") === "w"? "b" : "w",
            m = this.generationMovePgn(cellFrom, cellTo);

        var xmlMove = this.parent.generationMoveXml(m, c, n),
            id = $(xmlMove).attr("data-id");

        var fen = this.fen.getFen();
        fen = this.pgnFen.generationFen(fen, [cellFrom, cellTo]);
        return {
            id : id,
            fen : fen,
            movePgn : $(PgnHtml.generationMoveText(xmlMove)).onlyText(),
            currentMove : currentMove,
            xmlMove : xmlMove,
            displayPgn : this.displayPgn,
            that : this
        };
    },

    displayPgn : function (id) {
        this.parent.displayPgn();
        this.pgnHtml.setActiveMove(id);
    },

    /**
     * возвращает pgn представление последнего, сделаного хода в ввиде Nc2xd5, Qa2b3, a2a4
     * данный метод должен вызыватся только после перестановки хода на board
     * @param cellFrom
     * @param cellTo
     * @param pawnTransform
     * @returns {*}
     */
    generationMovePgn : function (figure, cellFrom, cellTo, color, pawnTransform) {
        //console.time("getCastling")
        var move = null,
            colorInvert = Chess.Figures.Terms.colorInvert(color),
            castling = this.getCastling(cellFrom, cellTo, figure);
        //console.timeEnd("getCastling")
        if (castling) {
            move = castling;
        } else if(figure==="p") { // move for pawn
            move = this.getPawnNotation(cellFrom, cellTo, pawnTransform);
        } else { // move for the all on not pawn
            // TODO реализовать рокировку
            //console.time("getFigureNotation")
            move = this.getFigureNotation(cellFrom, cellTo, figure);
            //console.timeEnd("getFigureNotation")
        }
        //console.time("generationMetaToMove")
        move = this.generationMetaToMove(colorInvert, move, cellFrom, cellTo);
        //console.timeEnd("generationMetaToMove")
        return move;
    },

    /**
     * Добавляет в конец хода, значок шаг или мат
     * @param colorInvert
     * @param move
     * @param cellFrom
     * @param cellTo
     * @returns {string}
     */
    generationMetaToMove : function (colorInvert, move, cellFrom, cellTo) {
        //console.time("isCheckAfterMove")
        var check = this.terms.isCheckAfterMove(cellFrom, cellTo, colorInvert);
        //console.timeEnd("isCheckAfterMove")
        //console.time("isMateAfterMove")
        var mate = this.terms.isMateAfterMove(cellFrom, cellTo, colorInvert);
        //console.timeEnd("isMateAfterMove")
        move = mate ? move + "#": (check? move + "+" : move);

        return move;
    },

    /**
     * Возвращает нотацию для хода пешки
     * @param from (string)
     * @param to (string)
     * @returns string
     */
    getPawnNotation : function (cellFrom, cellTo, pawnTransform) {
        var move = null,
            from = this.board.getCellSymbol(cellFrom),
            to = this.board.getCellSymbol(cellTo);

        if(from[0]!==to[0]) { // взятие фигуры
            move = from + "x" + to;
        } else {
            move = from + to;
        }
        return pawnTransform? move + "=" + pawnTransform : move;
    },

    /**
     * возвращает запись хода фигурой
     * @param from
     * @param to
     * @param figure
     * @returns {*}
     */
    getFigureNotation : function (cellFrom, cellTo, figure) {
        var move = null,
            from = this.board.getCellSymbol(cellFrom),
            to = this.board.getCellSymbol(cellTo),
            brokenFigure = this.board.getCell(cellTo); // фигура, которую хотят побить
        move = figure+from;
        move = brokenFigure!==""? move + "x"+to : move + to;

        return move;
    },

    /**
     * Если ровкировка, то вернет запись рокировки
     * @param cellFrom
     * @param cellTo
     * @param figure
     * @returns {*}
     */
    getCastling : function (cellFrom, cellTo, figure) {
        return Chess.Figures.Terms.getRookNotation(cellFrom, cellTo, figure);
    },

    /**
     * возвращает номер хода для нововой подветки
     * @param currentMoveXml
     */
    getCurrentNumberMove : function (currentMoveXml) {
        currentMoveXml = currentMoveXml ? currentMoveXml : this.pgnInterface.getLastXMLMove();
        var c, n;
        if(currentMoveXml.length>0) {
            c = $(currentMoveXml).attr("data-color");
            n = parseInt($(currentMoveXml).attr("data-num"));
        }
        return c && c === "b" ? n+1 : (n)? n : 1;
    }
});