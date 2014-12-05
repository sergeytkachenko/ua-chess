Ext.define("Chess.core.interface.Command", {
    // if this method return "rollBack" string that rollBack all commands in parent CommandsIterator class
    execute : function () {throw "method of binding"},
    undoExecute : function () {throw "method of binding"}
});