Ext.define("Chess.Application.CommandsIterator", {

    requires : ["Chess.core.interface.CommandsIterator"],
    extend : "Chess.core.interface.CommandsIterator",

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.commands = [];
        this.currentIndex = -1;
    },
    statics : {

        ROLLBACK_STRING : 'rollBack'
    },

    registryCommand : function (command) {
        if(typeof command.execute !== "function") {
            throw "command mast be command pattern and mast have execute method";
        }
        this.commands.push(command);
    },

    next : function () {
        if(!this.hasNext()) {
            this.abortIndex();
            return false;
        }
        this.currentIndex++;
        var res = this.commands[this.currentIndex].execute();
        if(res === Chess.Application.CommandsIterator.ROLLBACK_STRING) {
            Chess.Debuger.info("class "+this.commands[this.currentIndex].$className+" execute rollBack");
            return this.rollBack();
        }
        if(this.hasLast()) {

        }
        return true;
    },

    prev : function () {

        if(!this.hasPrev()) {
            return false;
        }
        this.commands[this.currentIndex].undoExecute();
        this.currentIndex--;
    },

    hasNext : function () {
        return undefined!==this.commands[this.currentIndex+1];
    },

    hasLast : function () {
        this.commands.length-1 === this.currentIndex;
    },

    hasPrev : function () {
        return undefined!==this.commands[this.currentIndex];
    },

    abortIndex : function () {
        this.currentIndex = -1;
    },

    rollBack : function () {
        while(this.hasPrev()) {
            this.prev();
        }
        Chess.Debuger.info("rollBack completed");
    }
});