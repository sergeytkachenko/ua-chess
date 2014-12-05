Ext.define("Chess.Pgn.Common", {
    requires : [
        "Chess.Pgn.MoveParse"
    ],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
        this.group = Chess.GroupRegistry.getInstance(this.boardID);

        this.XML = $('<XMLDocument />');

        this.pgn = null;
        this.meta = null;
        this.nmbMove = null;
        this.trash = [];
        this.moves = [];

        this.parseFenArray = null;
    },

    clean : function () {
        this.constructor(this.tableId, this.option);
    },

    getPgnFromString : function (text, fnCallback) {
        if(typeof fnCallback === 'function') {
            this.fnCallback = fnCallback;
        }
        this.pgn = text;
        this.parse();
    },

    getPgnFromFile : function (file, fnCallback) {
        var self = this;
        var file = file || '/files/best.pgn';
        if(typeof fnCallback === 'function') {
            this.fnCallback = fnCallback;
        }
        Ext.Ajax.request({
            url: file,
            success: function(response){
                var text = response.responseText;
                self.pgn = text;
                self.parse();
            },
            error : function () {
                Chess.Debuger.log("Не удалось загрузить файл");
            }
        });
    },

    runPgn : function (pgn) {
        this.clean();
        this.pgn = pgn;
        this.parse();
    },

    run : function () {
        this.getFile();
    },

    getXML : function () {
        return this.XML;
    },

    /**
     * Запуск парсинга всей партии
     */
    parse : function () {
        var self = this;
        this.clearXML(); // сбрасываем this.XML

        // изменяет this.XML, который передается как параметр
        Chess.Pgn.Parser.runParse(this.pgn, this.XML, this);

        while(this.isNeedParse()) {
            $(this.XML).find("comment,branch").each(function (ind, elem) {
                var text = $.trim($(this).onlyText());
                if(text!=="") {
                    self.reParse(elem);
                }
            });
        }

        // генерируем fen
        this.generationFenToMoves();

        if(typeof this.fnCallback === 'function') {
            this.fnCallback.call(this.XML);
        }
    },

    generationFenToMoves : function () {
        Chess.Debuger.time("generationFenToMove");
        var self = this,
            XML = $(this.XML);
        $(XML).find(">move").each(function (ind, xmlMove) {
            self.getFenToMove(ind, xmlMove, self);
        });
        $(XML).find("move move").each(function (ind, xmlMove) {
            self.getFenToMove(ind, xmlMove, self);
        });
        Chess.Debuger.timeEnd("generationFenToMove");
    },

    getFenToMove : function (index, xmlMove, self) {
        var color = Chess.Pgn.XML.getColor(xmlMove),
            pgnMove = Chess.Pgn.XML.getPgnMove(xmlMove),
            prevMoveXml = Chess.Pgn.XML.getPrevMove(xmlMove);
        prevMoveXml = prevMoveXml.length === 0? Chess.Pgn.XML.getPrevMoveByChildren(self.getXML(), xmlMove) : prevMoveXml;

        var fenPrev;
        if(Chess.Pgn.XML.isMainBranch(xmlMove) && index == 0) {
            fenPrev = self.getMeta("fen") || Chess.Fen.Reader.fenStart;
        } else {
            fenPrev = Chess.Pgn.XML.getFen(prevMoveXml);
        }

        var boardPrev = Chess.Fen.Reader.readToBoard(fenPrev);
        var move = self.group.get("Chess.Pgn.MoveParse").getMoves(pgnMove, color, Ext.apply({},boardPrev)),
            fromCell = move[0],
            toCell = move[1],
            pawnTransform = undefined !== move[2]? move[2] : null;

        var fen = Chess.Fen.Writer.generationFen(fenPrev, Ext.apply({},boardPrev), pgnMove, fromCell, toCell, pawnTransform);
        $(xmlMove).attr("data-fen", fen);
    },

    getLastMoveFromXml : function () {
        var xmlMove = $(this.XML).find(">move:last"),
            prevMoveXml = Chess.Pgn.XML.getPrevMove(xmlMove),
            fen = Chess.Pgn.XML.getFen(prevMoveXml),
            color = Chess.Pgn.XML.getColor(xmlMove),
            pgnMove = Chess.Pgn.XML.getPgnMove(xmlMove),
            board = Chess.Fen.Reader.readToBoard(fen);
        return this.group.get("Chess.Pgn.MoveParse").getMoves(pgnMove, color, Ext.apply({},board));
    },

    displayPgn : function () {
        Chess.Debuger.log(this.XML);
        //Chess.PgnHtml.getInstance(this.tableId).display(this.XML, ".notation-pgn");
    },

    /**
     * парсинг конкретного елемента elem
     * @param elem
     */
    reParse : function (elem) {
        var text = $.trim($(elem).text());
        var xml =  Chess.Pgn.Parser.runNotationParse(text, $(elem));
        // удаляем текст
        var content = $(xml).children();
        if(content.length>0) {
            $(elem).empty().append(content);
        }
    },

    /**
     * есть ли в елементах comment и branch "текст", который нужно парсить
     * @returns {boolean}
     */
    isNeedParse : function () {
        var need = false;
        $(this.XML).find("comment,branch").each(function (ind, elem) {
            var text = $.trim($(this).onlyText());
            if(text!=="") {
                need = true;
                return false;
            }
        });
        return need;
    },

    /**
     * Возвращает мета расспарсиного значение
     * @param key
     * @returns {*}
     */
    getMeta : function (key) {
        var meta = this.meta[key.toLowerCase()];
        return meta !==undefined ? meta : null;
    },

    /**
     * устанавливат первый ход на доске
     * устанавливает изначальное время на часах их отпарсеный метаданных
     */
    setFirstMove : function () {
        var PgnHtml = Chess.PgnHtml.getInstance(this.tableId);
        PgnHtml.setNext();
        // TODO set first move in board
        var time = this.getMeta("timeParse");
        if(time && undefined !== time.sec) {
            // установить время на часы
            PgnHtml.setTime(this.tableId, {w:time.sec, b:time.sec});
        }
    },

    /**
     * Возвращает ход из xml дерева
     * @param moveId
     * @returns {*|Number|jQuery}
     */
    getXmlMove : function (moveId) {
        return $(this.xml).find("move[data-id='"+moveId+"']");
    },

    /**
     * возвращает xml ход привязаный к активному ходу в pgn нотации
     * @returns {null}
     */
    getCurrentXmlMove : function () {
        return Engine.Pgn.Notation.getInstance(this.tableId).getCurrentXmlMove();
    },

    /**
     * отпарвсеный fen{} по уникальному id move
     * @param idMove
     * @returns {*}
     */
    getParsedFen : function (idMove) {
        if(undefined === this.parseFenArray[idMove]) {
            return null;
        }
        return this.parseFenArray[idMove];
    },

    setParsedFen : function (idMove, fen) {
        this.parseFenArray[idMove] = fen;
    },

    /**
     * возвращает массив хода [moveFrom,moveTo] (рокировка возвращается ходом короля)
     * @param idMove
     * @returns {*}
     */
    getParsedMove : function (idMove) {
        var fen = this.getParsedFen(idMove);
        if(!fen) {
            return null;
        }
        return fen.lastMove;
    },

    /**
     * вставляет новую подведку в текущий ход
     * @param currentMove - в кого втавляем
     * @param moveXml - первый ход в подветке
     */
    appendBranch : function (moveXml, currentMove) {
        if(!currentMove) {
            currentMove = this.getCurrentXmlMove();
        }
        var id =  Chess.Pgn.Parser.getUniqueId();
        var branch = $("<branch id="+id+" />");
        $(branch).append(moveXml);
        $(currentMove).append(branch);
    },

    /**
     * вставляет ход в подветку
     * @param branchId
     * @param moveXml
     */
    appendMoveToBranch : function (branchId, moveXml) {
        var branch = $(this.XML).find("branch[data-id='"+branchId+"']");
        $(branch).append(moveXml);
    },

    /**
     * вставляет новый ход(newMove) после хода(afterMove)
     * @param newMove
     * @param afterMove
     */
    appendMoveAfterMove : function (newMove, afterMove) {
        $(afterMove ).after(newMove);
    },

    /**
     * Генерирует xml представление хода
     * @param move
     * @param color
     * @param num
     * @returns {*|jQuery|HTMLElement}
     */
    generationMoveXml : function (move, color, num) {
        var m = $("<move></move>");
        $(m)
            .attr("data-color", color)
            .attr("data-num", num)
            .attr("data-move", move);
        $(m).attr("data-id",  Chess.Pgn.Parser.getUniqueId());

        return $(m);
    },

    /**
     * все следующие хода делает подветкой активного хода
     */
    nextMovesToAdditionalBranch : function () {
        var current = this.getCurrentXmlMove();
        var nextMoves = $(current).nextAll("move").clone();
        var removed = $(current).nextAll("move").remove();
        if(removed.length===0) {
            return;
        }
        var id =  Chess.Pgn.Parser.getUniqueId();
        var branch = $("<branch id="+id+" />");
        $(branch).append(nextMoves);
        $(current).append(branch);
    },

    /**
     * подсветка клеточек и стрелочек
     */
    displayColorArrow : function () {
        var PgnHtml = Chess.PgnHtml.getInstance(this.tableId),
            currentMove = PgnHtml.getCurrentMove();
        PgnHtml.setExtantions(currentMove);
    },

    clearXML : function () {
        this.XML = $('<XMLDocument />');
    },

    logTree : function () {
        console.dir(this.XML[0]);
    }
});