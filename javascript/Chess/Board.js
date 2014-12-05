Ext.define("Chess.Board", {

    requires : "Chess.Draw.Arrow",

    statics : {
        cellTransform : function (cell) {
            return Chess.GroupRegistry.getInstance("cache").get("board").cellTransform(cell);
        },

        getCellSymbol : function (cell) {
            return Chess.GroupRegistry.getInstance("cache").get("board").getCellSymbol(cell);
        },

        getColor : function (cell, board) {
            var b = Chess.GroupRegistry.getInstance("cache").get("board");
            Ext.apply(b.board, board);
            return b.getColorFigure(cell);
        },

        getFiguresCell : function (figure, board) {
            var b = Chess.GroupRegistry.getInstance("cache").get("board");
            Ext.apply(b.board, board);
            return Number.parseInt(b.getFiguresCell(figure));
        },
        /**
         * Получает на вход клеточку видов [a7, a, 7, '']
         * Возвращает массив xy [1, 7], [1, null], [null, 7], []
         * @param cell
         * @returns {*}
         */
        getCellOXInteger : function (cell) {
            var b = Chess.GroupRegistry.getInstance("cache").get("board");
            if(!cell) {
                return [];
            }
            if(cell > 10) {
                cell = cell.toString();
                return [Number.parseInt(cell[1]), Number.parseInt(cell[2])];
            }
            if(cell % 1 === 0) { // number - this y
                return [null, cell];
            }
            cell = Number.parseInt(b.index.indexOf(cell)+1);
            return [cell, null];
        },

        /**
         * Moves the pieces on the board
         * @param board
         * @param fromCell
         * @param toCell
         * @returns {*}
         */
        movementFigure : function (board, fromCell, toCell) {
            if(undefined === board[toCell]) {
                Chess.Debuger.error("property not found", toCell);
            }
            if(undefined === board[fromCell]) {
                Chess.Debuger.error("property not found", toCell);
            }
            board[toCell] = board[fromCell];
            board[fromCell] = "";

            return board;
        },

        setCell : function (board, cell, val) {
            var b = Chess.GroupRegistry.getInstance("cache").get("board");
            Ext.apply(b.board, board);
            b.setCell(cell, val);
            return b.board;
        }
    },

    constructor : function (conf) {
        Ext.apply(this, conf);

        this.group = Chess.GroupRegistry.getInstance(this.boardID);
        this.index = ['a','b','c','d','e','f','g','h'];
        this.numbers = [8,7,6,5,4,3,2,1];
        this.board = {
            '11' : 'wR', '12' : 'wp', '13' : '', '14' : '', '15' : '', '16' : '', '17' : 'bp', '18' : 'bR',
            '21' : 'wN', '22' : 'wp', '23' : 'bp', '24' : '', '25' : 'wQ', '26' : '', '27' : 'bp', '28' : 'bN',
            '31' : 'wB', '32' : 'wp', '33' : '', '34' : 'bp', '35' : '', '36' : '', '37' : 'bp', '38' : 'bB',
            '41' : 'wQ', '42' : 'wp', '43' : '', '44' : 'wQ', '45' : '', '46' : '', '47' : 'bp', '48' : 'bQ',
            '51' : 'wK','52' : '', '53' : '', '54' : '', '55' : 'wp', '56' : '', '57' : 'bp', '58' : 'bK',
            '61' : '', '62' : 'wR', '63' : '', '64' : 'wQ', '65' : '', '66' : '', '67' : 'bp', '68' : 'bB',
            '71' : '', '72' : 'wp', '73' : 'bp', '74' : 'bB', '75' : 'wQ', '76' : '', '77' : 'bp', '78' : 'bN',
            '81' : 'wR', '82' : 'wp', '83' : '', '84' : '', '85' : '', '86' : '', '87' : 'bp', '88' : 'bR'
        }
        this.board = {
            '11' : 'wR', '12' : 'wp', '13' : '', '14' : '', '15' : '', '16' : '', '17' : 'bp', '18' : 'bR',
            '21' : 'wN', '22' : 'wp', '23' : '', '24' : '', '25' : '', '26' : '', '27' : 'bp', '28' : 'bN',
            '31' : 'wB', '32' : 'wp', '33' : '', '34' : '', '35' : '', '36' : '', '37' : 'bp', '38' : 'bB',
            '41' : 'wQ', '42' : 'wp', '43' : '', '44' : '', '45' : '', '46' : '', '47' : 'bp', '48' : 'bQ',
            '51' : 'wK','52' : 'wp', '53' : '', '54' : '', '55' : '', '56' : '', '57' : 'bp', '58' : 'bK',
            '61' : 'wB', '62' : 'wp', '63' : '', '64' : '', '65' : '', '66' : '', '67' : 'bp', '68' : 'bB',
            '71' : 'wN', '72' : 'wp', '73' : '', '74' : '', '75' : '', '76' : '', '77' : 'bp', '78' : 'bN',
            '81' : 'wR', '82' : 'wp', '83' : '', '84' : '', '85' : '', '86' : '', '87' : 'bp', '88' : 'bR'
        }
        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    },

    /**
     * Очищает доску от фигур
     */
    clearBoard : function () {
        var self  = this;
        for (var key in this.board) {
            self.board[key] = "";
        }
        this.group.get('event').run("board.clear", this.board);
    },

    /**
     * возвращает значение клеточки
     * @param cell
     * @returns {*}
     */
    getCell : function (cell) {
        if(isNaN(parseInt(cell)) ) {
            cell = this.cellTransform(cell);
        }
        return (undefined !== this.board[cell])? this.board[cell] : null;
    },

    /**
     * ищет фигуру и возвращает массив клеточек, на которой она стоит
     * @return [] - клеточки на которых стоит данная фигура
     * @param figure - фигура
     */
    getFiguresCell : function (fig) {
        var cells = [];
        for (var key in this.board) {
            var f = this.board[key];
            if(f===fig) {
                cells.push(parseInt(key));
            }
        }
        return cells;
    },

    /**
     * заменяет строковое значение порядка клеточки на цифровое
     * @param cell
     */
    cellTransform : function (cell) {
        if(!cell || (!isNaN(parseFloat(cell)) && isFinite(cell)) ) {
            return cell;
        }
        var pattern = /^(.*)(=(q|r|b|n))$/i;
        if(pattern.test(cell)) {
            var p = cell.replace(pattern, "$2");
            cell = cell.replace(pattern, "$1");
        }
        var index = ['a','b','c','d','e','f','g','h'];
        Ext.Array.each(index, function (val, ind) {
            if(cell.indexOf(val) !== -1) {
                cell = cell.replace(val, ind+1);
                return false;
            }
        });
        return undefined===p ? cell : cell+p;
    },

    getColorFigure : function (cell) {
        var figure = this.getCell(cell);
        return undefined !== figure? figure[0] : null;
    },

    /**
     * Возвращает человечесое представление клеточки например из 12 возвратит a2
     * @param cellNumber
     * @returns {*}
     */
    getCellSymbol : function(cellNumber) {
        if(cellNumber % 1 === 0) {
            cellNumber = cellNumber.toString();
            var index = ['a','b','c','d','e','f','g','h'];
            return index[cellNumber[0]-1] + cellNumber[1];
        }
        return cellNumber;
    },

    /**
     * стоит ли на данной клеточке фигура
     * @param cell
     */
    cellIsFigure : function (cell) {
        cell = this.cellTransform(cell);
        return this.getCell(cell) !== "";
    },

    /**
     *
     * @param cell клеточка
     * @param val - фигура
     */
    setCell : function (cell, val) {
        cell = this.cellTransform(cell);
        this.board[cell] = val;
        this.group.get('event').run("board.setCell", [cell, val]);
    },

    printFigures : function () {
        var self = this,
            board = Ext.get(self.boardID);
        self.removeDragDrop(); // remove drag drop events
        board.select(".board > div, .board > span.event > div").setHtml("");
        Ext.iterate(self.numbers, function(value, ind) {
            Ext.iterate(self.index, function (val, key) {
                var divGoriz = board.select(".board > div:nth-child("+(ind+1)+"), .board > span.event > div:nth-child("+(ind+1)+")"),
                    cell = self.cellTransform(val) + "" + (value),
                    f = self.getCell(cell, true);
                f = f ===""? f : "<img src='/img/100/"+f+".png' data-color='"+f[0]+"' data-f='"+f+"' />";
                divGoriz.createChild({
                    tag: 'div',
                    'data-id': cell,
                    html : f
                })
            });
        });
        this.group.get('event').run("board.print", board);
    },

    getBoardDiv : function () {
        return Ext.get(this.boardID);
    },

    /**
     * print coordinates on board if they enabled
     */
    printCoordinates : function () {
        var board = Ext.get(this.boardID);
        Ext.Array.each(this.numbers, function (val, key) {
            var el  = board.select("div[data-align='left'] > div:nth-child("+(key+1)+"), div[data-align='right'] > div:nth-child("+(key+1)+")");
            el.setHtml("<spn>"+val+"</spn>");
        });
        Ext.Array.each(this.index, function (val, key) {
            var el  = board.select("div[data-align='top'] > div:nth-child("+(key+1)+"), div[data-align='bottom'] > div:nth-child("+(key+1)+")");
            el.setHtml("<spn>"+val+"</spn>");
        });
        this.group.get('event').run("board.print-coordinates", [this.numbers]);
    },

    removeDragDrop : function () {
        var parent = $("#"+this.boardID);
        var elDrag = $(parent).find("img.ui-draggable");
        $(elDrag).off("draggable");
        $(elDrag).draggable('destroy');
        $(elDrag).remove();

        var elDrop = $(parent).find("div.ui-droppable");
        $(elDrop).off("droppable");
        $(elDrop).droppable('destroy');
        $(elDrop).remove();
        this.group.get('event').run("board.removeDraDrop", [elDrag.length, elDrop.length]);
    },

    initDragDrop : function (imageElement) {
        Chess.DragDrop.Board.initDrag(this.boardID, imageElement);
        Chess.DragDrop.Board.initDropElements(this.boardID); // должен вызыватся всего один раз!
    },

    /**
     * Перемещает фигуру на доске и навещивает событие dragDrop на нее
     * @param fromCell
     * @param toCell
     * @param figure
     * @param color
     */
    dropFigure : function (fromCell, toCell, figure, color, pawnTransform) {
        var board = this.getBoardDiv();
        board.select("img."+Chess.DragDrop.Board.dragCls).remove(); // удаляем drag елементы, которые были перемещены
        board.select("div[data-id='"+fromCell+"'] img ").remove();
        if(toCell) {
            figure = pawnTransform? pawnTransform : figure;
            var elements = board.select("div[data-id='"+toCell+"']");
            $(elements.elements).each(function () {
                var imgEl = document.createElement('img');
                imgEl.setAttribute('src', "/img/100/"+color+figure+".png")
                imgEl.setAttribute("data-color", color)
                imgEl.setAttribute("data-f", color+figure);
                $(this).empty();
                this.appendChild(imgEl);
            });
            Chess.DragDrop.Board.initDrag(this.boardID, board.select(".board > span.event > div > div[data-id='"+toCell+"'] img").elements);
        }
    },

    /**
     * поворот доски на 180 градусов
     */
    flip : function () {
        this.group.get('event').run("board.flip.start");
        this.numbers.reverse();
        this.index.reverse();
        this.printFigures();
        this.printCoordinates();
        this.initDragDrop();
        this.group.get('event').run("board.flip.end");
    },

    setBackgroundColor : function (cells) {
        var board = Ext.get(this.boardID);
        Ext.Array.each(cells, function (cell) {
            board.select("div.board > div > div[data-id='"+cell+"']").addCls("possible-moves")
        });
    },

    savePossibleMoves : function (fromCell, toCells) {
        var board = Ext.get(this.boardID);
        board.select("div.board > div > div[data-id='"+fromCell+"']")
            .setStyle("background-color", "#117579")
            .setStyle("border", "1px solid grey")
            .setStyle("border-top", "0")
            .setStyle("border-left", "0")
        Ext.Array.each(toCells, function (cell) {
            board.select("div.board > div > div[data-id='"+cell+"']")
                .setStyle("background-color", "#1FA81F")
                .setStyle("border", "1px solid grey")
                .setStyle("border-top", "0")
                .setStyle("border-left", "0")
        });
        html2canvas(board.dom, {
            onrendered: function(canvas) {
               $("#test").append(canvas);
                verMoves();
            }
        });
    },

    clearBackgroundColor : function () {
        var board = Ext.get(this.boardID);
        board.select("div.board > div > div[data-id]").removeCls("possible-moves");
    },

    printFromFen : function (fen) {
        var board = Chess.Fen.Reader.readToBoard(fen);
        this.board = board;
        this.printFigures();
    },

    getSvgBoard : function () {
        var board = Ext.get(this.boardID);
        return board.select(".draw").elements[0];
    },

    getBoardHeight : function () {return $("#"+this.boardID).width()},
    getBoardWidth : function () {return $("#"+this.boardID).height()},

    getCellPosition : function (cell) {
        return $("#"+this.boardID).find("> div.board > div > div[data-id='"+cell+"']").position();
    },

    getBoardCellWidth : function () {
        return $("#"+this.boardID).find("> div.board > div > div[data-id]:first").width();
    },

    printToConsole : function (board) {
        board = board || this.board;
        for (var y = 8; y > 0; y--) {
            var string="";
            for (var x = 1; x < 9; x++) {
                var f = board[Number.parseInt(x+""+y)];
                f = f === ""? "  ": f;
                string += "|"+f+"|";
            }
            console.log("%c"+string, "font-size:10px; color:#666;");
        }
    }
});