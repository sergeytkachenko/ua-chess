Ext.define("Chess.Figures.Terms", {
    requires : [
        "Chess.Figures.Pawn",
        "Chess.Figures.Bishop",
        "Chess.Figures.Knight",
        "Chess.Figures.Rook",
        "Chess.Figures.Queen",
        "Chess.Figures.King"
    ],

    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);

        this.group = Chess.GroupRegistry.getInstance(this.boardID);

        this.board = this.group.get("board");
        this.pgnInterface = this.group.get("Chess.Pgn.Interface");

        this.pawn = this.group.get("Chess.Figures.Pawn");
        this.bishop = this.group.get("Chess.Figures.Bishop");
        this.knight = this.group.get("Chess.Figures.Knight");
        this.rook = this.group.get("Chess.Figures.Rook");
        this.queen = this.group.get("Chess.Figures.Queen");
        this.king = this.group.get("Chess.Figures.King");
    },
    statics : {
        /**
         * Invert color move
         * @param color
         * @returns {string}
         */
        colorInvert : function (color) {
            return color==="w"? "b" : "w";
        },

        /**
         * @param cellFrom
         * @param cellTo
         * @param figure
         * @returns {*} - возвращает запись рокировки
         */
        getRookNotation : function (cellFrom, cellTo, figure) {
            if (figure==="K") {
                if(cellFrom - cellTo === 20) {
                    return 'O-O-O';
                } else if(cellFrom - cellTo === -20) {
                    return 'O-O';
                }
            }
            return false;
        },

        getFigure : function (board, fromCell) {
            if(!fromCell) {
                Chess.Debuger.error("getFigure не может принимать "+fromCell);
            }
            if(undefined === board[fromCell]) {
                Chess.Debuger.error("Не найдено свойство "+fromCell+" у board", [board, fromCell]);
            }
            return board[fromCell].replace(/[wbp]/, "");
        },

        isFigureOnCell : function (board, cell) {
            if(undefined === board[cell]) {
                Chess.Debuger.error("property not found", cell);
            }
            return board[cell] !== "";
        },

        getMoveRookForCastling : function (board, fromCell, toCell) {

            var figure = Chess.Figures.Terms.getFigure(board, fromCell),
                castling = Chess.Figures.Terms.getRookNotation (fromCell, toCell, figure),
                color = Chess.Board.getColor(fromCell, board);
            if(castling==='O-O') {
                if(color==="w") {
                    return [81, 61]
                } else if(color==="b") {
                    return [88, 68]
                }
            } else if (castling==='O-O-O') {
                if(color==="w") {
                    return [11, 41]
                } else if(color==="b") {
                    return [18, 48]
                }
            }
            return false;
        },

        /**
         * Перемещаем ладью, после хода рокировки
         * @param board
         * @param fromCell
         * @param toCell
         * @returns {*}
         */
        moveRookForCastling : function (board, fromCell, toCell) {
            var moves = Chess.Figures.Terms.getMoveRookForCastling(board, fromCell, toCell);
            if(moves) {
                board = Chess.Board.movementFigure(board, moves[0], moves[1]);
            }
            return board;
        },

        /**
         * удаляет пешку на проходе из board
         * @param board
         * @param fromCell
         * @param toCell
         * @returns {*}
         */
        deletePawnForPassant : function (board, fromCell, toCell) {
            var cell = Chess.Figures.Terms.getDeletePawnForPassant(board, fromCell, toCell);
            if(!cell) {
                return board;
            }
            board = Chess.Board.setCell(board, cell, "");
            return board;
        },

        /**
         * Возвращает клеточку удаленной пешки на проходе
         * @param board
         * @param fromCell
         * @param toCell
         * @returns {*}
         */
        getDeletePawnForPassant : function (board, fromCell, toCell) {
            fromCell = Number.parseInt(fromCell);
            toCell = Number.parseInt(toCell);
            var figure = Chess.Figures.Terms.getFigure(board, fromCell);
            if (Chess.Figures.Terms.isPassantMove(board, fromCell, toCell, figure)) {
                var pawnColor = Chess.Board.getColor(fromCell, board),
                    k = pawnColor==='b'? 1 : -1,
                    cell = toCell + k;
                return cell;
            }
            return false;
        },

        /**
         * Возвращает клеточку куда может побить пешка на проходе
         * @param fromCell
         * @param toCell
         * @param board
         * @returns {string}
         */
        getPossibilityPassant : function (fromCell, toCell, board) {
            var figure = board[fromCell],
                passant = "";
            if(figure.search('p')!==-1 || !figure) { // ходит пешка
                if(fromCell - toCell === -2) { // white pawn
                    if(undefined !== board[toCell+10] && board[toCell+10]==='bp') {
                        passant = Chess.Board.getCellSymbol(toCell-1);
                    } else if(undefined !== board[toCell-10] && board[toCell-10]==='bp') {
                        passant = Chess.Board.getCellSymbol(toCell-1);
                    }
                } else if(fromCell - toCell === 2) { // black pawn
                    if(undefined !== board[toCell+10] && board[toCell+10]==='wp') {
                        passant = Chess.Board.getCellSymbol(toCell+1);
                    } else if(undefined !== board[toCell-10] && board[toCell-10]==='wp') {
                        passant = Chess.Board.getCellSymbol(toCell+1);
                    }
                }
            }
            return passant;
        },

        isPassantMove : function (board, fromCell, toCell, figure) {
            fromCell = Number.parseInt(fromCell);
            toCell = Number.parseInt(toCell);
            if((figure==='p' || figure==='') && !Chess.Figures.Terms.isFigureOnCell(board, toCell)) { // if pawn
                if(fromCell-toCell === 9 || fromCell-toCell === 11) {
                    return true;
                }
            }
            return false;
        },

        isCheck : function (color, board) {
            var cell = Chess.Board.getFiguresCell(color+"K", board);
            cell = cell.toString();
            var vectors = [[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0]],
                vectorsKnight = [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]],
                vectorsPawn = {
                    "w": [
                        [-1, 1], [1, 1]
                    ],
                    "b": [
                        [-1, -1], [1, -1]
                    ]
                };
            var vf = {
                Q : [0,1,2,3,4,5,6,7],
                R : [1,3,5,7],
                B : [0,2,4,6]
            }
            for(var key in vectors) { // ферзь, ладья, слон
                var v = vectors[key];
                var x = Number.parseInt(cell[0]), y = Number.parseInt(cell[1]);
                do {
                    x = x + v[0];
                    y = y + v[1];
                    var c = x + "" + y,
                        fig = board[c];

                    if(undefined !== fig && fig !== "") {
                        var patt = vf[fig[1]];
                        if(fig[0] !== color && undefined !== patt && patt.indexOf(Number.parseInt(key)) !== -1) {
                            return true;
                        }
                        break;
                    }
                } while(undefined !== board[c]);
            }

            for(var key in vectorsKnight) { // для коней
                var v = vectorsKnight[key];
                var x = Number.parseInt(cell[0]), y = Number.parseInt(cell[1]);
                var x1 = x + v[0];
                var y1 = y + v[1];
                var c = x1 + "" + y1,
                    fig = board[c];
                if(undefined !== fig && fig !== "") {
                    if(fig[0] !== color && fig[1] === "N") {
                        return true;
                    }
                }
            }

            for(var key in vectorsPawn[color]) { // для пешек
                var v = vectorsPawn[color][key];
                var x = Number.parseInt(cell[0]), y = Number.parseInt(cell[1]);
                x = x + v[0];
                y = y + v[1];
                var c = x + "" + y,
                    fig = board[c];
                if(undefined !== fig && fig[0] !== color && fig[1] === "p") {
                    return true;
                }
            }

            for(var key in vectors) { // Король
                var v = vectors[key];
                var x = Number.parseInt(cell[0]), y = Number.parseInt(cell[1]);
                    x = x + v[0];
                    y = y + v[1];
                    var c = x + "" + y,
                        fig = board[c];

                    if(undefined !== fig && fig !== "" && fig[0] !== color && fig[1] === "K") {
                        return true;
                    }
            }

            return false;
        }
    },

    /**
     * possible whether a particular move on the board
     * @param fromCell - [11,12 ... 87,88]
     * @param toCell - [11,12 ... 87,88]
     * @public
     */
    isPossibleMove : function (fromCell, toCell) {
        var me = this,
            possibleMoves = this.getBrokenCellsPlusRook(fromCell);
        return possibleMoves.indexOf(toCell)!==-1 && !me.isMeCheck(fromCell, toCell);
    },

    /**
     * все возможные хода с конкретной клеточки, учитывая взятие на проходе, рокировку, скрытый шаг
     * @param fromCell
     * @returns {Array}
     * @public
     */
    getPossibleMoves : function (fromCell) {
        var me = this,
            possibleMoves = this.getBrokenCellsPlusRook(fromCell),
            moves = [];
        for (var i in possibleMoves) {
            var toCell = possibleMoves[i];
            if(me.isMeCheck(fromCell, toCell)) {
                continue;
            }
            moves.push(toCell);
        }
        return moves;
    },

    /**
     * Все битые поля + рокировка, без учета скрытого шага
     * @param fromCell
     * @returns {*}
     * @protected
     */
    getBrokenCellsPlusRook : function (fromCell) {
        var cache = Chess.Cache.getToBoard(this.board.board, fromCell);
        if(cache) {
            return cache;
        }
        var figure = this.board.getCell(fromCell);
        if(!figure) {
            return [];
        }

        var color = figure[0],
            colorInvert = Chess.Figures.Terms.colorInvert(color);
        figure = figure[1].toUpperCase();
        var possibleMove = this.getBrokenCells(fromCell);
        if(figure==="K") {
            possibleMove  = possibleMove.concat(
                this.king.getCastlingMoves(
                color,
                this.getAllBrokenCells(colorInvert),
                this.isCheck(color)
            ));
        }
        return Chess.Cache.setToBoard(this.board.board, fromCell, possibleMove);
    },

    /**
     * Все битые поля данной фигуры
     * @param fromCell - [11,12 ... 87,88]
     * @protected
     */
    getBrokenCells : function (fromCell) {
        var cache = Chess.Cache.getToBoard(this.board.board, fromCell+"getBrokenCells");
        if(cache) {
            return cache;
        }
        var figure = this.board.getCell(fromCell),
            possibleMoves;
        if(!figure) {
            return null;
        }
        var color = figure[0];
        figure = figure[1].toUpperCase();
        switch (figure) {
            case "P" :
                Chess.Debuger.time("BrokenInstance get");
                possibleMoves = this.pawn.getPossibleMoves(fromCell, color);
                Chess.Debuger.timeEnd("BrokenInstance get");
                break;
            case "B" :
                possibleMoves = this.bishop.getPossibleMoves(fromCell, color);
                break;
            case "N" :
                possibleMoves = this.knight.getPossibleMoves(fromCell, color);
                break;
            case "R" :
                possibleMoves = this.rook.getPossibleMoves(fromCell, color);
                break;
            case "Q" :
                possibleMoves = this.queen.getPossibleMoves(fromCell, color);
                break;
            case "K" :
                possibleMoves = this.king.getPossibleMoves(fromCell, color);
                break
            default :
                throw "not found the appropriate case for calculate possible moves";
        }
        //Chess.Debuger.log("getBrokenCells, figure - "+figure);
        return Chess.Cache.setToBoard(this.board.board, fromCell+"getBrokenCells", possibleMoves);
        return possibleMoves;
    },


    /**
     * все битые поля за данный цвет
     * @param colorМиллион способов потерять голову
     * @returns {Array}
     * @protected
     */
    getAllBrokenCells : function (color) {
        Chess.Debuger.time("getAllBrokenCells");
        var cache = Chess.Cache.getToBoard(this.board.board, color);
        if(cache) {
            return cache;
        }
        var me = this,
            cells = [];
        for (var cell in this.board.board) {
            var figure = this.board.board[cell];
            if(figure.search(color)===-1) {
                continue;
            }
            var brokenCells = me.getBrokenCells(cell);
            if(brokenCells && brokenCells.length > 0) {
                cells = cells.concat(brokenCells);
            }
        }
        Chess.Debuger.timeEnd("getAllBrokenCells");
        var cells = Ext.Array.unique(cells);

        return Chess.Cache.setToBoard(this.board.board, color, cells);
    },

    /**
     * Шаг ли на текущий момент
     * @param color
     * @returns {*}
     */
    isCheck : function (color) {
        return Chess.Figures.Terms.isCheck(color, this.board.board);
    },

    /**
     * Будет ли мне шаг после мною сделаного хода
     * @param fromCell
     * @param toCell
     * @protected
     */
    isMeCheck : function (fromCell, toCell, color) {
        var group = Chess.GroupRegistry.getInstance("cache");
        var board = group.get("board");
        var terms = group.get("Chess.Figures.Terms");
        var meColor = color || this.board.getCell(fromCell)[0] || Chess.Debuger.error("Клеточка с которой ходят, не может быть пустой");
        Ext.apply(board.board, this.board.board); // устанавливем board

        board.setCell(toCell, board.board[fromCell]); // перемещаем фигуру на доске
        board.setCell(fromCell, "");
        return terms.isCheck(meColor);
    },

    /**
     * Мат ли на доске за конкретный цвет
     * @param color
     * @returns {boolean}
     * @public
     */
    isMate : function (color) {
        // TODO реализовать другой механизм подсчета мата
        if(this.isCheck(color)===false) {
            return false;
        }
        var me = this,
            isCheck = false,
            isMate = true;
        for (var cell in this.board.board) {
            var figure = this.board.board[cell];
            if(figure==="" || figure.indexOf(color) === -1) {
                continue;
            }
            var brokenCells = me.getBrokenCells(cell);

            Ext.Array.each(brokenCells, function (toCell) {
                var check = me.isMeCheck(cell, toCell, color);
                isCheck = isCheck || check? true : false;
                isCheck = isCheck || check? true : false;
                isMate = isMate===false || check===false? false : true;
                if(isMate===false) {
                    return isCheck && isMate;
                }
            });
        }
        return isCheck && isMate;
    },

    /**
     *  Пат ли на доске за конкретный цвет
     * @param color
     * @returns {boolean}
     * @public
     */
    isPat : function (color) {
        // нет доступных ходов и нет шага
        var me = this,
            isPat = true;
        Ext.iterate(this.board.board, function (cell, figure) {
            if(isPat === false) {
                return false;
            }
            if(figure=="" || figure.indexOf(color) ===-1) {
                return;
            }
            var brokenCells = me.getBrokenCells(cell);
            Ext.Array.each(brokenCells, function (toCell) {
                var check = me.isMeCheck(cell, toCell);
                isPat = check===false? false : true;
                return isPat;
            });
        });
        return isPat && !this.isCheck(color);
    },

    /**
     * Шал ли после сделанного хода
     * @param fromCell
     * @param toCell
     * @param color
     * @returns {*}
     */
    isCheckAfterMove : function (fromCell, toCell, color) {
        return this.isMeCheck(fromCell, toCell, color);
    },

    /**
     * Будет ли мат после сделанного хода
     * @param fromCell
     * @param toCell
     * @param color
     * @returns {boolean}
     */
    isMateAfterMove : function (fromCell, toCell, color) {
        var group = Chess.GroupRegistry.getUniqueInstance();
        var board = group.get("board");
        var terms = group.get("Chess.Figures.Terms");
        Ext.apply(board.board, this.board.board); // устанавливем board
        board.setCell(toCell, board.board[fromCell]); // перемещаем фигуру на доске
        board.setCell(fromCell, "");
        console.time("isMate")
        var isMate = terms.isMate(color);
        //console.log(board.board)
        console.timeEnd("isMate")
        return isMate;
    },

    /**
     * Определяет с какой клеточки пошла фигура
     * @param board
     * @param fromXY - может быть a2 -> [1, 2], a -> [1, null], 2 -> [null, 2], "" -> []
     * @param toCell - ввида [56]
     * @param figure
     * @param color
     * @param requrse - нужно для отмены цыкличности
     */
    getPossibleFromCell : function (board, fromXY, toCell, figure, color, requrse) {
        // TODO не критично но желательно переписать эту функцию
        if(Array.isArray(toCell)) {
            for(var key in toCell) {
                var cellCame = this.getPossibleFromCell(board, fromXY, toCell[key], figure, color, true);
                if(cellCame) {
                    return [cellCame, toCell[key]];
                }
            }
        }
        if(!fromXY[0] && fromXY[1] && (fromXY[0] + "" + fromXY[1] > 10)) {
            return Number.parseInt(fromXY[0] + "" + fromXY[1]);
        }
        var cellCame,
            toCell = Number.parseInt(toCell),
            group = Chess.GroupRegistry.getInstance('cache'),
            b = group.get("board"),
            terms = group.get("Chess.Figures.Terms");
        Ext.apply(b.board, board); // устанавливем board
        var figureCells = b.getFiguresCell(color+figure);
        for (var i in figureCells) {
            var cell = figureCells[i];

            if(fromXY.length > 0) {
                if(fromXY[0] && cell.toString()[0] != fromXY[0]) {
                    continue;
                }
                if(null!==fromXY[1] && cell.toString()[1] != fromXY[1]) {
                    continue;
                }
            }
            var i = terms.isPossibleMove(cell, toCell);
            if(i) {
                cellCame = cell;
                break;
            }

        }
        if(!cellCame && !Array.isArray(toCell) && requrse !== true) {
            var toCells = [];
            var yArr = [1,2,3,4,5,6,7,8];
            for (var k in yArr) {
                var c = toCell + "" + yArr[k];
                var f = b.getCell(c);
                if(!f || f=="" || f[1] !== "p" || f[0] === color) {
                    continue;
                }
                toCells.push(Number.parseInt(c));
            }
            if(toCells.length > 0) {
                return this.getPossibleFromCell(board, fromXY, toCells, figure, color, true);
            }
        }
        return cellCame;
    }

});