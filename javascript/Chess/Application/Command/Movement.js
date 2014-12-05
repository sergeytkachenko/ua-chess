/**
 * Пермещение фигруы на доске
 */
Ext.define("Chess.Application.Command.Movement", {

    requires : ["Chess.core.interface.Command"],
    extend : "Chess.core.interface.Command",

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.commandsIterator = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Application.CommandsIterator");
        this.terms = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Figures.Terms");
        this.chessMoves = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Moves");
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
    },

    execute : function () {
        var fromCell = this.chessMoves.getFromCell(),
            toCell = this.chessMoves.getToCell(),
            color = this.chessMoves.getColor(),
            figure = this.chessMoves.getFigure();

        var deletePawnForPassant = Chess.Figures.Terms.getDeletePawnForPassant (Ext.apply({}, this.board.board), fromCell, toCell),
            rookMovesForCastling = Chess.Figures.Terms.getMoveRookForCastling (Ext.apply({}, this.board.board), fromCell, toCell);

        this.board.setCell(toCell, color+figure);
        this.board.setCell(fromCell, "");

        if(deletePawnForPassant) { // взятие на проходе
            this.board.dropFigure(deletePawnForPassant, null, figure, color);
            this.board.setCell(deletePawnForPassant, "");
        }
        if(rookMovesForCastling) {
            this.board.dropFigure(rookMovesForCastling[0], rookMovesForCastling[1], "R", color);
            this.board.setCell(rookMovesForCastling[1], color+"R");
            this.board.setCell(rookMovesForCastling[0], "");
        }
        this.board.dropFigure(fromCell, toCell, figure, color);
        this.board.clearBackgroundColor();

        this.commandsIterator.next();
        Chess.Debuger.info("Передача управления команды в "+this.$className);
    },

    undoExecute : function () {

    },

    rollBack : function () {
        return Chess.Application.CommandsIterator.ROLLBACK_STRING;
    }
});