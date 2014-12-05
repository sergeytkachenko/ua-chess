Ext.define("Chess.Figures.Bishop", {
    requires : [
        "Chess.Figures.FigureInterface"
    ],
    vectors : [
        [-1,1],[1,1],[1,-1],[-1,-1]
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
                return Chess.Figures.Bishop.instance[null] = new Chess.Figures.Bishop(config);
            }
            if(undefined === Chess.Figures.Bishop.instance[boardID]) {
                config.boardID = boardID;
                Chess.Figures.Bishop.instance[boardID] = new Chess.Figures.Bishop(config);
            }
            return Chess.Figures.Bishop.instance[boardID];
        }
    }
});