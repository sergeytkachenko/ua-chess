Ext.define("Chess.Application.Command.TransformPawn", {

    requires : ["Chess.core.interface.Command"],
    extend : "Chess.core.interface.Command",

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.commandsIterator = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Application.CommandsIterator");
    },

    execute : function () {
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