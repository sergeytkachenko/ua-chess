Ext.define("Chess.Application.Controller", {
    requires : [
        "Chess.Application.CommandsIterator"
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
    },

    /**
     * Triggers a specific controller (example PLayController or WatchController or ConstructorBoardController)
     * @param specificController - specific Controller to run, depending on the type of Game
     */
    run : function(specificController) {
        this.specificController = specificController;
        this.specificController.run();
    }
});