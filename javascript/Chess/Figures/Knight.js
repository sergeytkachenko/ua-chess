Ext.define("Chess.Figures.Knight", {
    vectors : [
        [1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
        this.pgnInterface = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Pgn.Interface");
    },

    statics : {
        instance : [],
        getInstance : function (boardID, config) {
            config = config || {};
            if (null===boardID || undefined===boardID) {
                return Chess.Figures.Knight.instance[null] = new Chess.Figures.Knight(config);
            }
            if(undefined === Chess.Figures.Knight.instance[boardID]) {
                config.boardID = boardID;
                Chess.Figures.Knight.instance[boardID] = new Chess.Figures.Knight(config);
            }
            return Chess.Figures.Knight.instance[boardID];
        }
    },

    /**
     * Returns all possible stroke without hidden step King - без учетаа скрытого шага королю
     * @param fromCell
     * @param color
     * @returns {Array}
     */
    getPossibleMoves : function (fromCell, color, isSelfColor) {
        Chess.Debuger.time(this.$className+"_getBrokenCells");
        var me = this,
            possibleMoves = [],
            x = parseInt(String(fromCell)[0]),
            y = parseInt(String(fromCell)[1]);
        Ext.Array.each(this.vectors, function (vector) {
            var xl=x+vector[0], yl=y+vector[1],
                cell = xl+""+yl,
                figure = me.board.getCell(cell);
            if(figure==null || figure.search(color) !== -1 && isSelfColor !== true) {
                return;
            }
            possibleMoves.push(parseInt(cell));
        });
        Chess.Debuger.timeEnd(this.$className+"_getBrokenCells");
        return possibleMoves;
    }
});