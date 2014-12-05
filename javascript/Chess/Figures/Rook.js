Ext.define("Chess.Figures.Rook", {
    requires : [
        "Chess.Figures.FigureInterface"
    ],
    vectors : [
        [0,1],[1,0],[0,-1],[-1,0]
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
        this.pgnInterface = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Pgn.Interface");
        Ext.apply(this, Chess.Figures.FigureInterface.init.apply(this));
    },

    statics : {
        instance : [],
        getInstance : function (boardID, config) {
            config = config || {};
            if (null===boardID || undefined===boardID) {
                return Chess.Figures.Rook.instance[null] = new Chess.Figures.Rook(config);
            }
            if(undefined === Chess.Figures.Rook.instance[boardID]) {
                config.boardID = boardID;
                Chess.Figures.Rook.instance[boardID] = new Chess.Figures.Rook(config);
            }
            return Chess.Figures.Rook.instance[boardID];
        }
    }
});