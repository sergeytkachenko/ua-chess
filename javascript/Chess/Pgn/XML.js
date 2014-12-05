Ext.define("Chess.Pgn.XML", {
    statics : {
        getLastMove : function (xml) {
            return $(xml).find(">move:last");
        },
        getLastPgnMove : function (xmlMove) {
            return $(xmlMove).attr("data-move");
        },
        getFen : function (xmlMove) {
            return $(xmlMove).attr('data-fen');
        },
        getColor : function (xmlMove) {
            return $(xmlMove).attr("data-color");
        },

        getNumberMove : function (xmlMove) {
            return $(xmlMove).attr("data-num");
        },

        getPgnMove : function (xmlMove) {
            return $(xmlMove).attr("data-move");
        },
        getPgnMoveId : function (xmlMove) {
            return $(xmlMove).attr("data-id");
        },
        getLastColorMove : function (xml) {
            return Chess.Pgn.XML.getLastMove(xml).attr("data-color");
        },
        isEmpty : function (xml) {
            return Chess.Pgn.XML.getLastMove(xml).length === 0;
        },
        appendMove : function (xml, move) {
            return $(xml).append(move);
        },
        addFenToMove : function (move, fen) {
            return $(move).attr("data-fen", fen);
        },

        getPrevMove : function (xmlMove) {
            return $(xmlMove).prev();
        },

        getMoveByNumberAndColor : function (XML, num, color) {
            return $(XML).find("move[data-num='"+num+"'][data-color='"+color+"']");
        },

        /**
         * Главная ли ветка
         * @param XML
         * @param xmlMove
         */
        isMainBranch : function (xmlMove) {
            return $(xmlMove).parents("move").length === 0;
        },

        /**
         * Возввращает предыдущий ход по номеру, и цвету текущего хода
         * @param xmlMove
         */
        getPrevMoveByChildren : function (XML, xmlMove) {
            var number = Chess.Pgn.XML.getNumberMove(xmlMove),
                color = Chess.Pgn.XML.getColor(xmlMove),
                colorRevers = color === "w"? "b" : "w",
                numberPrev = color === "w"? number - 1 : number;
            return Chess.Pgn.XML.getMoveByNumberAndColor(XML, numberPrev, colorRevers);
        }
    }
});