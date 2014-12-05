Ext.define("Chess.Figures.FigureInterface", {
    statics : {
         vectors : [[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0]], // for queen, rook, bishop, king
         vectorsKnight : [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]], // for knight 
         vectorsPawn : { // for pawn 
            "w": [
                [-1, 1], [1, 1]
            ],
            "b": [
                [-1, -1], [1, -1]
            ]
         },
         getBrokenCells : function (board, fromCell, vectors, isSelfColor) { 
            var vectors = vectors? vectors : Chess.Figures.FigureInterface.vectors;
            var figure = board[fromCell];
            if(undefined===figure || figure==="") {
                return [];
            }
            var color = figure[0];
            var colorInvert = Chess.Figures.Terms.colorInvert(color);
            var possibleMoves = [],
                x = parseInt(fromCell.toString()[0]),
                y = parseInt(fromCell.toString()[1]);
            for(key in vectors) {
                var vector = vectors[key];
                for(
                    var xl = x+vector[0], yl = y+vector[1];
                    board[xl+""+yl] !== null;
                    xl = xl+vector[0], yl = yl+vector[1]
                ) {
                    var cell = xl+""+yl,
                        figure = board[cell];    
                    if(undefined===figure) {
                        break;
                    }
                    if(figure.search(color) !== -1) { // if self color (figure)
                        if(isSelfColor) {
                            possibleMoves.push(parseInt(cell));
                        }
                        break;
                    }
                    if(figure.search(colorInvert) !== -1) { // если стоит чужая фигура
                        possibleMoves.push(parseInt(cell));
                        break;
                    }
                    possibleMoves.push(parseInt(cell));
                }
            }
            return possibleMoves;
         },

        init : function () {
            /**
             * Returns all possible stroke without hidden step King - без учетаа скрытого шага королю
             * @param fromCell
             * @param color
             * @param isSelfColor - если true -> клеточка защитывается, если на ней стоит своя фигура 
             *                    (это нужно для быстрого подсчета защиты своих фигур)
             * @returns {Array}
             */
            this.getPossibleMoves = function (fromCell, color, isSelfColor) {
                
                return Chess.Figures.FigureInterface.getBrokenCells(this.board.board, fromCell, this.vectors, isSelfColor);
                // return;
                // Chess.Debuger.time(this.$className+"_getBrokenCells");
                // var colorInvert = Chess.Figures.Terms.colorInvert(color);
                // var me = this,
                //     possibleMoves = [],
                //     x = parseInt(String(fromCell)[0]),
                //     y = parseInt(String(fromCell)[1]);

                // Ext.Array.each(this.vectors, function (vector) {
                //     for(
                //         var xl=x+vector[0], yl=y+vector[1];
                //         me.board.getCell(xl+""+yl)!==null;
                //         xl = xl+vector[0], yl = yl+vector[1]
                //     ) {
                //         var cell = xl+""+yl,
                //             figure = me.board.getCell(cell);    
                //         if(figure.search(color) !== -1) { // if self color (figure)
                //             if(isSelfColor) {
                //                 possibleMoves.push(parseInt(cell));
                //             }
                //             break;
                //         }
                //         if(figure.search(colorInvert) !== -1) { // если стоит чужая фигура
                //             possibleMoves.push(parseInt(cell));
                //             break;
                //         }
                //         possibleMoves.push(parseInt(cell));
                //     }
                // });
                // Chess.Debuger.timeEnd(this.$className+"_getBrokenCells");
                // return possibleMoves;
            }
        }
    }
});