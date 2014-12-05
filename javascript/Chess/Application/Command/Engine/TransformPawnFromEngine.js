Ext.define("Chess.Application.Command.Engine.TransformPawnFromEngine", {

    requires : ["Chess.core.interface.Command"],
    extend : "Chess.core.interface.Command",

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.commandsIterator = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Application.CommandsIterator");
    },

    execute : function () {
        var fromCell = this.chessMoves.getFromCell(),
            toCell = this.chessMoves.getToCell(),
            color = this.chessMoves.getColor(),
            figure = this.chessMoves.getFigure(),
            pawnTransform = this.chessMoves.getPawnTransform();
        /**
         * TODO
         * проверяем ход на наличие превращения пешки
         * если условие выполняется - выкидываем форму для выбора фигуры
         *
        **/
        this.commandsIterator.next();
        Chess.Debuger.info("Передача управления команды в "+this.$className);
    },

    undoExecute : function () {

    },

    rollBack : function () {
        return Chess.Application.CommandsIterator.ROLLBACK_STRING;
    }
});