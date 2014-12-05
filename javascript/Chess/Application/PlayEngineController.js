Ext.define("Chess.Application.PlayEngineController", {
    requires : [
        "Chess.Application.Command.CorrectMove",
        "Chess.Application.Command.Engine.TransformPawnFromEngine",
        "Chess.Application.Command.PrintArrow",
        "Chess.Application.Command.Engine.SendMoveToEngine",
        "Chess.Application.Command.SetPgnNotation"
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
    },

    run : function () {
    },

    sendMove : function (from, to, pawnTransform) {
        var group = Chess.GroupRegistry.getInstance(this.boardID);
        group.get("Chess.Moves").clear().setCells(from, to, pawnTransform);
        group.get("Chess.Application.CommandsIterator").next();
    }
});