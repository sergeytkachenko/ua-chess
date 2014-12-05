Ext.define("Chess.Moves", {

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.toCell = null;
        this.fromCell = null;
        this.figure = null; // without figure color
        this.color = null;

        this.pawnTransform = null;

        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
    },
    /**
     * @param fromCell
     * @param toCell
     */
    setCells : function (fromCell, toCell, pawnTransform) {
        this.clear();

        fromCell = parseInt(fromCell);
        toCell = parseInt(toCell);
        if(isNaN(fromCell) || isNaN(toCell)) {
            throw "No valid params this method";
        }
        this.fromCell = fromCell;
        this.toCell = toCell;

        if(pawnTransform) {
            this.pawnTransform = pawnTransform.toUpperCase();
        }

        this.init();
    },


    init : function () {
        this.initFigure();
        this.initColor();
    },

    /**
     * establishes a figure which went
     */
    initFigure : function () {
        var figure = this.board.getCell(this.fromCell);
        this.figure = figure.substring(1);
    },

    initColor : function () {
        var figure = this.board.getCell(this.fromCell);
        this.color = figure[0];
    },

    getFromCell : function () {
        return this.fromCell;
    },

    getToCell : function () {
        return this.toCell;
    },

    getColor : function () {
        return this.color;
    },

    getFigure : function () {
        return this.figure;
    },

    getPawnTransform : function () {
      return this.pawnTransform;
    },

    /**
     * check whether the progress made
     * @returns {boolean}
     */
    isEmptyMove : function () {
        if(this.getFromCell()===this.getToCell()) {
            return true;
        }
        return (this.getFromCell() === null || this.getToCell() === null);
    },

    clear : function () {
        this.toCell = null;
        this.fromCell = null;
        this.color = null;
        this.figure = null;
        this.pawnTransform = null;

        return this;
    }
});