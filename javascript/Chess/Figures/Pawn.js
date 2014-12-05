Ext.define("Chess.Figures.Pawn", {
    vectors : {
        "w": [
            [0, 1], [0, 2]
        ],
        "b": [
            [0, -1], [0, -2]
        ]
    },
    brokenVectors : {
        "w": [
            [-1, 1], [1, 1]
        ],
        "b": [
            [-1, -1], [1, -1]
        ]
    },
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
        this.board = Chess.GroupRegistry.getInstance(this.boardID).get("board");
        this.pgnInterface = Chess.GroupRegistry.getInstance(this.boardID).get("Chess.Pgn.Interface");
        //this.possibleMoves = [];
    },


    getPossibleMoves : function (fromCell, color, isSelfColor) {
        Chess.Debuger.time(this.$className+"_getBrokenCells");
        var me = this,
            possibleMoves = [],
            vectors = this.vectors[color],
            brokenVectors = this.brokenVectors[color],
            x = parseInt(String(fromCell)[0]),
            y = parseInt(String(fromCell)[1]);
        Ext.Array.each(vectors, function (vector) {
            var cell = (x+vector[0])+""+(y+vector[1]);
            var figure = me.board.getCell(cell);
            if(figure!=="") {
                return false;
            }
            if(Math.abs(vector[1])===1) {
                possibleMoves.push(parseInt(cell));
            } else if(Math.abs(vector[1])===2) { // pawn first move
                if( (vector[1]===2 && y===2) || (vector[1]===-2 && y===7) ) {
                    possibleMoves.push(parseInt(cell));
                }
            }
        });

        var lastXmlMove = me.pgnInterface.getLastXMLMove(),
            fen = Chess.Pgn.XML.getFen(lastXmlMove),
            passant = passant? passant : Chess.Fen.Reader.getPassant(fen); // get passant move
        Ext.Array.each(brokenVectors, function (vector) {
            var cell = (x+vector[0])+""+(y+vector[1]);
            var figure = me.board.getCell(cell);
            if(figure && figure.search(Chess.Figures.Terms.colorInvert(color)) !== -1 ) {
                possibleMoves.push(parseInt(cell));
            } else if(figure && isSelfColor) { // if self color (figure)
                possibleMoves.push(parseInt(cell));
            }
            if(figure || (passant && passant.length>0) ) { // Возможность взятия на проходе из FEN строки
                passant = me.board.cellTransform(passant);
                if(passant!==cell) {
                    return;
                }
                possibleMoves.push(parseInt(cell));
            }
        });
        Chess.Debuger.timeEnd(this.$className+"_getBrokenCells");

        return possibleMoves;
    }
});