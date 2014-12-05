Ext.define("Chess.Pgn.Exception", {
    constructor : function (msg) {
        Ext.getBody().unmask();
        Ext.Msg.alert("Ошибка", msg);
        throw msg;
    }
});