Ext.define("Chess.Fen.Reader", {
    statics : {

        fenStart : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

        replaceFigure : {
            "s" : "",
            'P' : 'wp', 'p' : 'bp',  'N': 'wN', 'n' : 'bN', 'R': 'wR', 'r' : 'bR',
            'Q' : 'wQ', 'q' : 'bQ', 'K' : 'wK', 'k' : 'bK', 'B': 'wB', 'b' : 'bB'
        },

        prepareFen : function (fen) {
            fen = fen || Chess.Fen.Reader.fenStart;
            fen = fen.replace(/(\s)+/gi, " ");
            var fenArray = Chess.Fen.Reader.parseFenToArray(fen);
            if(!Chess.Fen.Reader.isFenCorrect(fenArray)) {
                return;
            }
            return fenArray;
        },

        readToBoard : function (fen) {
            var fenArray = Chess.Fen.Reader.prepareFen(fen);
            return Chess.Fen.Reader.getBoardFromFen(fenArray[0]); // позиция на доске
        },

        parseFenToArray : function (fen) {
            return fen.split(" ");
        },

        isFenCorrect : function (fenArray) {
            var position = fenArray[0].split("/");
            var result = fenArray.length >=3 && position.length===8;
            if(!result) {
                Chess.Debuger.warning("Неверный формат FEN");
            }
            return result;
        },

        /**
         * Возвращает заданое количество пробелов
         * @param count
         */
        getNamespase : function (count) {
            var namespace = "";
            for(var i=0; i<parseInt(count); i++) {
                namespace += "s";
            }
            return namespace;
        },

        getBoardFromFen : function (position) {
            var board = {};
            position = position.split("/");
            position = position.reverse();
            for (var y = 8; y >= 1; y--) {
                var yKey = y-1;
                var pos = position[yKey].replace(/[0-9]/gi, Chess.Fen.Reader.getNamespase);
                for(var x = 0; x < 8; x++) {
                    var figure = pos[x];
                    board[(x+1)+""+y] = Chess.Fen.Reader.replaceFigure[figure];
                }
            }
            return board;
        },

        /**
         *
         * @param fen
         * @returns {*} color move
         */
        getColor : function (fen) {
            var fenArray = Chess.Fen.Reader.prepareFen(fen);
            return fenArray[1];
        },

        /**
         *
         * @param fen
         * @returns {*} castling - рокировка
         */
        getCastling : function (fen) {
            var fenArray = Chess.Fen.Reader.prepareFen(fen);
            return fenArray[2] != "-" ? fenArray[2] : null;
        },

        /**
         *
         * @param fen
         * @returns {*} взятие на проходе
         */
        getPassant : function (fen) {
            var fenArray = Chess.Fen.Reader.prepareFen(fen);
            return fenArray[3] != "-" ? fenArray[3] : null;
        },

        /**
         *
         * @param fen
         * @returns {Number} Число полуходов, прошедших с последнего хода пешки или взятия.
         */
        getCounterPlies : function (fen) {
            var fenArray = Chess.Fen.Reader.prepareFen(fen);
            return parseInt(fenArray[4]);
        },

        /**
         *
         * @param fen
         * @returns {Number} Номер хода
         */
        getPastCountMoves : function (fen) {
            var fenArray = Chess.Fen.Reader.prepareFen(fen);
            return parseInt(fenArray[5]);
        }
    }
});