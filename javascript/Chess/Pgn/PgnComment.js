/**
 * Походу парсит комментарии в ходах и подходах
 */
Ext.onReady(function () {
    Ext.define("Chess.PgnComment", {
        extend : "Chess.Pgn",
        statics: {
            instance : [],
            getInstance: function (tableId, option) {
                if(undefined === Chess.PgnComment.instance[tableId]) {
                    Chess.PgnComment.instance[tableId] = new Chess.PgnComment(tableId, option);
                }
                return Chess.PgnComment.instance[tableId];
            }
        },
        /**
         * Разделение основной ветки на хода
         */
        delimiterMoves : function (notation) {
            this.parseResult(notation);
            for(var i = 1; i < 1000; i++) { // до 500 ходов
                notation = this.parseAdditional(notation);

                var numberMove = this.parseNumberMove(notation);
                notation = numberMove[1]; // нотация без хода

                notation = this.parseAdditional(notation);

                var move = this.parseMove(notation);
                this.addMoveToXML([numberMove[0],move[0], numberMove[2]]);

                notation = move!==false ? move[1] : notation;

                if(!move) {
                    break;
                }
            }

            return notation;
        },

        addChildToXML : function (node, value) {
            this.XML
                .append("<"+node+">"+ $.trim(value)+"</"+node+">");
        }
    });
});