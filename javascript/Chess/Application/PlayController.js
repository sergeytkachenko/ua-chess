Ext.define("Chess.Application.PlayController", {
    requires : [
        "Chess.Application.Command.CorrectMove",
        "Chess.Application.Command.TransformPawn",
        "Chess.Application.Command.PrintArrow",
        "Chess.Application.Command.Movement",
        "Chess.Application.Command.SetPgnNotation"
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
    },

    run : function () {
    },

    drop : function (from, to, meEl) {
        var group = Chess.GroupRegistry.getInstance(this.boardID);
        group.get("Chess.Moves").setCells(from, to);
        group.get("Chess.Application.CommandsIterator").next();
    }
});