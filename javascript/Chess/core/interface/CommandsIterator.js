Ext.define("Chess.core.interface.CommandsIterator", {
    registryCommand : function () {},
    next : function () {throw "this method should be overridden"},
    prev : function () {throw "this method should be overridden"},
    rollBack : function () {throw "this method should be overridden"},
    hasNext : function () {throw "this method should be overridden"},
    hasPrev : function () {throw "this method should be overridden"}
});