/**
 * Генерация pgn и запись ее в текущее xml дерево
 */
Ext.define("Chess.Application.Command.SetPgnNotation", {

    requires : ["Chess.core.interface.Command"],
    extend : "Chess.core.interface.Command",

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        var group = Chess.GroupRegistry.getInstance(this.boardID);
        this.group = group;

        this.commandsIterator = group.get("Chess.Application.CommandsIterator");
        this.terms = group.get("Chess.Figures.Terms");
        this.chessMoves = group.get("Chess.Moves");
        this.board = group.get("board");
        this.pgnGenerator = group.get("Chess.Pgn.Generator");
        this.pgnInterface = group.get("Chess.Pgn.Interface");
    },

    execute : function () {
        //console.time("SetPgnNotation");
        var fromCell = this.chessMoves.getFromCell(),
            toCell = this.chessMoves.getToCell(),
            color = this.chessMoves.getColor(),
            figure = this.chessMoves.getFigure(),
            pawnTransform = this.chessMoves.getPawnTransform();
        var lastXmlMove = Chess.Pgn.XML.getLastMove(this.pgnInterface.getXML());
        //var lastMovePgn = Chess.Pgn.XML.getLastPgnMove(lastXmlMove);
        // xml представление хода

        var fenOld = Chess.Pgn.XML.getFen(lastXmlMove);
        //console.time("movePgn");
        var movePgn = this.pgnGenerator.generationMovePgn(figure, fromCell, toCell, color, pawnTransform);
        //console.timeEnd("movePgn");
        var fen = Chess.Fen.Writer.generationFen(fenOld, Ext.apply({}, this.board.board), movePgn, fromCell, toCell, pawnTransform);

        var xmlMove = this.pgnGenerator.getXmlMove(figure, fromCell, toCell, color, fen, pawnTransform);
        this.pgnInterface.appendMove(xmlMove); // вставляем xml представление хода в xml дерево
        //console.timeEnd("SetPgnNotation");
        console.log('fenOld = '+fenOld, 'fen= '+fen, this.pgnInterface.getXML()[0]);
        this.commandsIterator.next(); // переходим на следующую итерацию
    },

    undoExecute : function () {

    },

    rollBack : function () {
        return Chess.Application.CommandsIterator.ROLLBACK_STRING;
    }
});