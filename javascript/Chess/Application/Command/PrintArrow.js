Ext.define("Chess.Application.Command.PrintArrow", {

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
        /**
         * TODO рисуем стрелочки, подсветку клеточек
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