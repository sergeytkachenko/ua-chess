Ext.define("Chess.Pgn.Interface", {
    requires : [
        "Chess.Pgn.Common",
        "Chess.Pgn.XML",
        "Chess.Pgn.Parser",
        "Chess.Pgn.Generator"
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.XML = $("<xml></xml>");

        this.group = Chess.GroupRegistry.getInstance(this.boardID);

        this.common = this.group.get('Chess.Pgn.Common');
        this.parser = this.group.get('Chess.Pgn.Parser');

    },

    getXML : function () {
        return this.XML;
    },

    /**
     * get XML representation for PGN notation
     * @param filePath
     * @param fnCallback
     */
    getXMLPgnFromFile : function (filePath, fnCallback) {
        var me = this;
        this.common.getPgnFromFile(filePath, function () {
            me.XML = this;
            if(typeof fnCallback === 'function') {
                fnCallback.call(me);
            }
        });
    },

    getXMLPgnFromString : function (pgnStr, fnCallback) {
        var me = this;
        this.common.getPgnFromString(pgnStr, function () {
            me.XML = this;
            if(typeof fnCallback === 'function') {
                fnCallback.call(me);
            }
        });
    },

    /**
     * whether it made ​​the last move in this color
     * @param color
     * @returns {boolean}
     */
    isLastTurnColor : function (color) {
        if(Chess.Pgn.XML.isEmpty(this.getXML())) { // if does not one move
            return color == 'b';
        }
        return color == Chess.Pgn.XML.getLastColorMove(this.getXML());
    },

    /**
     * get last move from main branch
     * @returns {jQuery XML}
     */
    getLastXMLMove : function () {
        return Chess.Pgn.XML.getLastMove(this.XML);
    },

    getLastFenFromMove : function () {
        var xmlMove = this.getLastXMLMove();
        return Chess.Pgn.XML.getFen(xmlMove);
    },

    /**
     * XML move for move id
     * @param moveId
     * @returns {*|jQuery}
     */
    getXmlMove : function (moveId) {
        return $(this.XML).find("move[data-id="+moveId+"]");
    },

    /**
     *
     * @param moveId
     * @returns {*|jQuery}
     */
    getXmlMoveBeforeMove : function (moveId) {
        return $(this.XML).find("move[data-id="+moveId+"]").prev();
    },

    /**
     * last figure on board in the main branch
     * return [p,b,n,r,q,k]
     */
    getLastFigureMove : function() {
        // TODO writing this method
        return "p";
    },

    appendMove : function (move) {
        Chess.Pgn.XML.appendMove(this.getXML(), move);
        return this.XML;
    }
});