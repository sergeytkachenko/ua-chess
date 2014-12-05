Ext.define("Chess.Application.Command.CorrectMove", {
    requires : [
        "Chess.core.interface.Command",
        "Chess.Figures.Terms"
    ],
    extend : "Chess.core.interface.Command",

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.commandsIterator = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Application.CommandsIterator");
        this.chessMoves = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Moves");
        this.pgnInterface = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Pgn.Interface");
        this.termsMoves = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Figures.Terms");
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
    },

    execute : function () {
        var color = this.chessMoves.getColor();
        // Проверка правильности заполнения данных о возможном ходе
        // А также коррености последовательности очередности цвета хода
        if(this.chessMoves.isEmptyMove() || this.pgnInterface.isLastTurnColor(color)) {
            Chess.Debuger.info("Не верная очередность хода, или пустой ход");
            return this.rollBack();
        }
        // Проверка возможности хода по шахматным правилам
        console.time("CorrectMove - possibleMove");
        var isPossible = this.termsMoves.isPossibleMove(
            this.chessMoves.getFromCell(),
            this.chessMoves.getToCell()
        );
        console.log("isPossible move "+this.chessMoves.getFromCell()+" to "+this.chessMoves.getToCell()+" = "+isPossible)
        console.timeEnd("CorrectMove - possibleMove");
        if(!isPossible) {
            Chess.Debuger.info("not possible move from - "+this.chessMoves.getFromCell()+", to - "+this.chessMoves.getToCell());
            return this.rollBack();
        }
        this.commandsIterator.next();
    },

    undoExecute : function () {
        var fromCell = this.chessMoves.getFromCell(),
            toCell = fromCell,
            color = this.chessMoves.getColor(),
            figure = this.chessMoves.getFigure();
        this.board.dropFigure(fromCell, toCell, figure, color);
        this.board.clearBackgroundColor();
    },

    rollBack : function () {
        return Chess.Application.CommandsIterator.ROLLBACK_STRING;
    }
});