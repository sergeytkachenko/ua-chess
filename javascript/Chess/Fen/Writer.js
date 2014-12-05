/**
 * Поля записи:
 1. Положение фигур со стороны белых. Позиция описывается цифрами и буквами по горизонталям сверху вниз начиная
    с восьмой горизонтали и заканчивая первой. Расположение фигур на горизонтали записывается слева направо,
    данные каждой горизонтали разделяются косой чертой /. Белые фигуры обозначаются заглавными буквами.
    K, Q, R, B, N, P — соответственно белые король, ферзь, ладья, слон, конь, пешка. k, q, r, b, n, p — соответственно
    чёрные король, ферзь, ладья, слон, конь, пешка. Обозначения фигур взяты из англоязычного варианта алгебраической
    нотации. Цифра задаёт количество пустых полей на горизонтали, счёт ведётся либо от левого края доски,
    либо после фигуры (8 означает пустую горизонталь).
 2. Активная сторона: w — следующий ход принадлежит белым, b — следующий ход чёрных.
 3. Возможность рокировки. k — в сторону королевского фланга (короткая), q — в сторону ферзевого фланга (длинная).
    Заглавными указываются белые. Невозможность рокировки обозначается «-».
 4. Возможность взятия пешки на проходе. Указывается проходимое поле, иначе «-».
 5. Счётчик полуходов. Число полуходов, прошедших с последнего хода пешки или взятия. Используется для
    определения применения правила 50 ходов.
 6. Номер хода. Любой позиции может быть присвоено любое неотрицательное значение (по умолчанию 1),
    счётчик увеличивается на 1 после каждого хода чёрных.

 rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 1 1
 rnbqkbnr/pppppppp/8/8/7P/8/PPPPPPP1/RNBQKBKR b KQkq - 1 1
 */
Ext.define("Chess.Fen.Writer", {
    statics : {
        replaceMask : {
            wp : 'P', bp : 'p', wN : 'N', bN : 'n', wR : 'R', bR : 'r',
            wQ : 'Q', bQ : 'q', wK : 'K', bK : 'k', wB : 'B', bB : 'b'
        },
        empty : 0, // количество пустых клеточек на горизонтале

        /**
         *
         * @param fenOld
         * @param board
         * @param movePgn - информация о последнем ходе, для рокировки нужно
         */
        generationFen : function (fenOld, board, movePgn, fromCell, toCell, pawnTransform) {
            var color = Chess.Fen.Reader.getColor(fenOld),
                boardFen = Chess.Fen.Writer.getBoardFen(board, fromCell, toCell, pawnTransform),
                possibilityСastling = Chess.Fen.Reader.getCastling(fenOld),
                castling = Chess.Fen.Writer.getPossibilityCastlingAfterMove(movePgn, color, possibilityСastling),
                passant = this.getPossibilityPassant(fromCell, toCell, board),
                counterPlies = this.getCounterPlies(fenOld, movePgn),
                numberMove = this.getNumberMove(fenOld, color);
            return boardFen + " " + Chess.Figures.Terms.colorInvert(color) + " " + castling + " " + passant + " " + counterPlies + " " + numberMove;
        },

        /**
         * генерирует клеточку - "взятие на проходе, основываясь на последнем ходе"
         * @param fromCell
         * @param toCell
         * @param board - object-array [11:'', 12:'' ...]
         * @returns {string}
         */
        getPossibilityPassant : function (fromCell, toCell, board) {
            var passant = Chess.Figures.Terms.getPossibilityPassant(fromCell, toCell, board);
            return passant? passant : "-";
        },

        /**
         * Счётчик полуходов. Число полуходов, прошедших с последнего хода пешки или взятия.
         * Используется для определения применения правила 50 ходов
         * @param fenOld
         * @param movePgn
         * @returns {number}
         */
        getCounterPlies : function (fenOld, movePgn) {
            if(!movePgn) return 0;
            var counterPlies = Number.parseInt(Chess.Fen.Reader.getCounterPlies(fenOld));
            if(movePgn.search(/[xp]/ig) !== -1 || movePgn.search(/[qrbkn]/ig) === -1) { // либо взятие либо ход пешкой
                return 0;
            }
            return counterPlies + 1;
        },

        /**
         * Номер хода, счётчик увеличивается на 1 после каждого хода чёрных.
         * @param fenOld
         * @param color
         * @returns {*}
         */
        getNumberMove : function (fenOld, color) {
            var numberMove = Number.parseInt(Chess.Fen.Reader.getPastCountMoves(fenOld));
            numberMove = isNaN(numberMove)? 1 : numberMove;
            return color==='b'? numberMove + 1 : numberMove;
        },

        /**
         *  Возможность рокировки из fen нотации и последнего сделаного хода
         * @param movePgn
         * @param color
         * @param possibilityСastling [KQkq] возможность рокировки из FEN
         * @returns {*}
         */
        getPossibilityCastlingAfterMove : function (movePgn, color, possibilityСastling) {
            possibilityСastling = possibilityСastling? possibilityСastling : "";
            if(!movePgn) return "KQkq";
            // если сделал рокировку или ходил королем
            if(
                movePgn.search('O-O') !== -1
                || movePgn.search("K") !== -1
                || movePgn.search("a1") !== -1
                || movePgn.search("a8") !== -1
                || movePgn.search("h1") !== -1
                || movePgn.search("h8") !== -1
                || movePgn.search("e1") !== -1
                || movePgn.search("e8") !== -1
            ) {
                if(color === "w") {
                    possibilityСastling = possibilityСastling.replace("KQ", "");
                } else {
                    possibilityСastling = possibilityСastling.replace("kq", "");
                }
            }
            // если ходил ладьей
            return !possibilityСastling? "-" : possibilityСastling;
        },

        getCastling : function (fromCell, toCell, figure) {
            return Chess.Figures.Terms.getRookNotation (fromCell, toCell, figure);
        },


        getBoardFen : function (board, fromCell, toCell, pawnTransform) {
            // пермещаем ладью после рокировки

            board = Chess.Figures.Terms.moveRookForCastling (board, fromCell, toCell);
            // удаляем пешку после взятия на проходе
            board = Chess.Figures.Terms.deletePawnForPassant(board, fromCell, toCell);
            // перемещаем фигуру
            board = Chess.Board.movementFigure(board, fromCell, toCell);
            if(pawnTransform) {
                var f = board[toCell];
                board[toCell] = f[0] + pawnTransform; // меняем пешку на фигуру
            }
            var result = "";
            // Generation fen position of the board
            for (var y = 8; y >= 1; y--) {
                for(var x = 1; x <= 8; x++) {
                    var xy = x+""+ y,
                        f = board[xy];
                    if(f !== ""){
                        if(Chess.Fen.Writer.empty > 0) {
                            result += "" + Chess.Fen.Writer.empty;
                            Chess.Fen.Writer.empty = 0;
                        }
                        result += Chess.Fen.Writer.replaceMask[f];
                    } else {
                        Chess.Fen.Writer.empty ++;
                    }
                    if(Chess.Fen.Writer.empty>0 && x===8) {
                        result += "" + Chess.Fen.Writer.empty;
                        Chess.Fen.Writer.empty = 0;
                    }
                }
                result = y!== 1? result + "/" : result;
            }
            Chess.Fen.Writer.empty = 0;
            return result;
        }
    }
});