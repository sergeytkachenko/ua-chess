Ext.define("Chess.Pgn.Parser", {
    requires : [
        "Chess.Pgn.Patterns"
    ],
    statics: {
        idCounter : 1,
        getUniqueId : function () {
            return (this.idCounter++);
        },

        /**
         * разделяет партию на мета-данные и нотацию партии
         * @param game
         */
        separationData : function (game) {
            var data = game.split(/\n{2}|\n\r/);
            return data.length > 1 ?
                data :
                Ext.create("Chess.Pgn.Exception", "Не удалось отделить нотацию от мета-данных", game);
        },

        /**
         * Анализирует начало строки и возвращает тип данных для парсинга, или false, если тип не опознан
         * @param notation
         * @returns false|string - тип данных, который нужно парсить
         */
        getTypeNotation : function (notation) {
            if(typeof notation !== "string") {
                Ext.create("Chess.Pgn.Exception", "Переменная должна быть string", notation);
            }
            var notation = $.trim(notation);

            var patterns = {
                    Lag : new RegExp("^\\s*\\(lag:", "i"),
                    Comment : new RegExp("^\\s*\\{"),
                    Branch : new RegExp("^\\s*\\("),
                    Symbol : new RegExp("^\\s*\\$"),
                    Figure : new RegExp(Chess.Pgn.Patterns.getFigure()),
                    Pawn : new RegExp(Chess.Pgn.Patterns.getPawn()),
                    Extension : new RegExp("^\\s*\\[%"),
                    Result : new RegExp("^\\s*(\\*|1-0|0-1|1\\/2-1\\/2)"),
                    Text : new RegExp("[\\s\\S]+")
                },
                result = false;

            Ext.iterate(patterns, function (index, pattern) {
                if(pattern.test(notation)) {
                    result = index;
                    return false;
                }
            });
            if(!result) {
                if($.trim(notation).length===0) {
                    //Chess.Debuger.info("Pgn запись успешно отпарсена");
                } else {
                    Ext.create("Chess.Pgn.Exception", "При парсинге Pgn, произошла ошибка", notation);
                }
            }

            return result;
        },

        /**
         * запусткает парсер нотации
         * @param game - полная запись pgn формата (до 1-й партии)
         * @param root - родитель, в которого будут вставлятся все найденые елементы
         **/
        runParse : function (game, root, parent) {
            var game = this.separationData(game),
                meta = game[0],
                notation =  game[1].replace(/\n/g, " ");

            this.parseMeta(meta, parent); // parse meta information
            return this.runNotationParse(notation, root);
        },

        parseMeta : function (meta, parent) {
            var self = this;
            var obj = {};
            meta = meta.split(/\n/);
            Ext.Array.each(meta, function(line) {
                var m = self.getParsingMeta(line.replace(/\r|\n/, ""));
                obj[m.key] = m.val;
            });
            parent.meta = obj;
            this.parseTimeControll(parent);
        },

        parseTimeControll : function (parent) {
            // потдержка времени только с добавлением на ход
            var meta = parent.meta;
            if(meta.timecontrol === undefined) {
                Chess.Debuger.warning("В PGN не указан контоль партии");
                return;
            }
            var timecontrol = meta.timecontrol,
                pattern = /([0-9]+)(\+([0-9]+))?/;
            if(!pattern.test(timecontrol)) {
                Chess.Debuger.info("Не потдерживаемый контроль времени");
            }
            var sec = parseInt(timecontrol.replace(pattern, "$1")),
                add = parseInt(timecontrol.replace(pattern, "$3"));
            // количетво сек на партию и добавление за ход
            parent.meta.timeParse = {
                sec : sec,
                add : add
            };
        },

        /**
         * парсит конкретную строку из метаданных
         * @param metaLine
         */
        getParsingMeta : function (metaLine) {
            metaLine = $.trim(metaLine);
            var pattern = /^\[([a-zA-Z]+)\s*('|")(.*)('|")]$/;
            if(!pattern.test(metaLine)) {
                Ext.create("Chess.Pgn.Exception", "Не удалось спарсить метаданные", metaLine);
            }

            return {
                key :  $.trim(metaLine.replace(pattern, "$1").toLowerCase()),
                val : $.trim(metaLine.replace(pattern, "$3"))
            }
        },

        /**
         * Запустить парсер только нотации без мета-данных партии
         * @param n
         * @param root
         * @returns {*}
         */
        runNotationParse : function (n, root) {
            this.root = root;
            //Chess.Debuger.time("parsePgn");
            n =  n.replace(/\n/g, " ");
            n =  n.replace(/\s{2,}/g, " ");
            while(this.getTypeNotation(n)) {
                n = this.parse(n);
            }
            //Chess.Debuger.timeEnd("parsePgn");
            // Возвращает  спарсенное XML дерево
            return this.root;
        },

        /**
         * анализирует строку и вызывает соответсвующий метод для конкретного парсинга
         * @param notation - нотация без мета данных
         **/
        parse : function (notation) {
            var type = this.getTypeNotation(notation);
            var f = this["parse" + type]; // название функции для парсинга этого типа данных
            if(f===undefined) {
                Ext.create("Chess.Pgn.Exception", "Не определена функция для парсинга этого типа даных", type);
            }
            return f.apply(this, [notation]);
        },

        /**
         * парсинг, пока, непонятного для меня значения  -  (Lag .* )
         **/
        parseLag : function (n) {
            var pattern = /\s*\(\s*lag[\s\S]*\)/i;
            if(!pattern.test(n)) {
                Ext.create("Chess.Pgn.Exception", "Не удалось найти Lag", n);
            }
            return n.replace(pattern, "");
        },

        /**
         * парсинг комментария
         **/
        parseComment : function (n) {
            var comment = this.getBlock(n, "{", "}");
            this.appendElement("comment", this.deleteFE(comment));
            return n.replace(comment, "");
        },

        /**
         * парсинг ветки
         **/
        parseBranch : function (n) {
            var branch = this.getBlock(n, "(", ")");
            this.appendElement("branch", this.deleteFE(branch));
            return n.replace(branch, "");
        },

        /**
         * парсинга специального символа хода
         **/
        parseSymbol : function (n) {
            var pattern = /^\s*\$([0-9]+)[\s\S]*/;
            if(!pattern.test(n)) {
                Ext.create("Chess.Pgn.Exception", "Не найден символ на месте где он должен присутсвовать", n);
            }
            var symbol = n.replace(pattern, "$1");
            this.appendElement("symbol", symbol);
            return n.replace(/^\s*\$([0-9]+)/, "");
        },

        /**
         * парсим номер хода фигуры и саму запись хода
         * @param n
         * @returns {m.n|*}
         */
        parseFigure : function (n) {
            var data = this.parseNumberMove(n);
            var m = this.parseMoveNotation(data.n);
            this.appendMove(m.move,data.color,data.number);
            return m.n;
        },

        /**
         * парсим номер хода пешки и саму запись хода
         * @param n
         * @returns {m.n|*}
         */
        parsePawn : function (n) {
            var data = this.parseNumberMove(n);
            var m = this.parseMoveNotation(data.n);
            this.appendMove(m.move,data.color,data.number);
            return m.n;
        },

        /**
         * парсинга записи хода
         **/
        parseMoveNotation : function (n) {
            var pattern  = /^\s*([a-zA-Z]+[0-9=+xOo#-qrbn]+[a-h1-8]*[\+\?!#0-9]*)[\s\S]*$/i;
            if(!pattern.test(n)) {
                Ext.create("Chess.Pgn.Exception", "Не найдена запись хода, или имеет не верное значение", n);
            }
            var move = n.replace(pattern, "$1"),
                n = n.replace(/^\s*([a-zA-Z0-9=+x#-]+[a-h1-8]*[\+\?!#0-9]*)\s*/, "");
            return {
                move : move,
                n : n
            };
        },

        /**
         * парсинга номера хода, цвета хода
         **/
        parseNumberMove : function (n) {
            this.nmbMove = this.nmbMove? this.nmbMove : 1;
            var pattern = /^\s*([0-9]*)\s*\.{1}[^.]\s*/,
                color = "b";
            color = pattern.test(n)? "w" : color;
            if(/^\s*([0-9]+)\s*(\.{1}|\.{3})\s*/.test(n)) {
                this.nmbMove = parseInt(n.replace(/^\s*([0-9])\s*(\.{1}|\.{3})\s*/, "$1"));
            }
            var nbrMove = Math.floor(this.nmbMove);
            this.nmbMove += 0.5;
            n = n.replace(/^(\s*[0-9]+(\.{1,3}))?/, "");
            return {
                color : color,
                number : nbrMove,
                n : n
            };
        },

        /**
         * Парсим расширение
         * В PGN формате [*] - считается расширением
         * @param n
         * @returns {*}
         */
        parseExtension : function (n) {
            var self = this;
            n = $.trim(n);
            var patterns = {
                time : new RegExp("^\\[%emt([0-9:\\s*]*)\\]([\\s\\S]*)"),
                csl : new RegExp("^\\[%csl([a-zA-Z0-9,\\s*]*)\\]([\\s\\S]*)"),
                cal : new RegExp("^\\[%cal([a-zA-Z0-9,\\s*]*)\\]([\\s\\S]*)")
            }
            var result = false;
            Ext.iterate(patterns, function (index, pattern) {
                if(pattern.test(n)) {
                    result = index;
                    var extension = $.trim(n.replace(pattern, "$1"));
                    self.appendElement(index,extension);
                    n = n.replace(pattern, "$2");
                    return false;
                }
            });

            return result===false ? Ext.create("Chess.Pgn.Exception", "Не удалось отпарсить расширение", n) : n;
        },

        /**
         * парсим текст
         * @param n - нотация
         */
        parseText : function (n) {
            n = $.trim(n);
            for (var l = n.length, i=0; i<l; i++) {
                var text = n.substr(0, i+1);
                var notation = n.substr(i+1, l-i);

                var result = this.getTypeNotation(notation);
                if((result && result!=="Text") || notation.length===0) {
                    this.appendElement("text", text)
                    return notation;
                }
            }
            return "";
        },

        /**
         * парсинга результата партии
         **/
        parseResult : function (n) {
            var pattern = /^\s*(\*|1-0|0-1|1\/2-1\/2)/;
            if(!pattern.test(n)) {
                Chess.Debuger.info("Не найден результат партии", n);
            }
            var result = n.replace(pattern, "$1");
            this.appendResult(result);
            return n.replace(pattern, "");
        },

        getBlock : function (s, start, end) {
            var l = s.length,
                ind=[],
                c= 0;
            for (var i=0; i<l; i++) {
                if(s[i]==start) {
                    ind[0] = ind[0]===undefined? i : ind[0];
                    c++;
                }
                if(s[i]==end) {
                    c--;
                    if(c===0) {
                        ind[1] = i-ind[0]+1;
                        break;
                    }
                }
            }
            if(ind.length!==2) {
                Ext.create("Chess.Pgn.Exception", "Не удалось найти завершающий тег", s);
            }
            var block = s.substr(ind[0], ind[1]);
            return block;
        },

        /**
         * вставляет результат партии
         * @param result
         */
        appendResult : function (result) {
            $(this.root).append("<result>"+result+"</result>");
        },

        /**
         * вставляет ход в корень
         * @param move
         * @param color
         * @param num
         */
        appendMove : function (move, color, num) {
            var m = $("<move></move>");
            $(m)
                .attr("data-color", color)
                .attr("data-num", num)
                .attr("data-move", move);
            $(m).attr("data-id", this.getUniqueId());
            $(this.root).append(m);
        },

        /**
         * вставляет елемент в последний ход, или в root, если ходов нет
         * @param el
         * @param value
         */
        appendElement : function (el, value) {
            var el = $("<"+el+">"+value+"</"+el+">");
            $(el).attr("data-id", this.getUniqueId());
            var parent = $(this.root).find("move:last");
            parent = parent.length===0? this.root : parent;
            $(parent).append(el);
        },

        /**
         * удаляет из строки первый и последний символ
         * @param text
         * @returns {string}
         */
        deleteFE : function (text) {
            text = text.substr(1, text.length);
            return text.substr(0, text.length-1);
        },

        getCell : function (movePgn) {
            var self = this;
            var patt = /^([qknbr])([a-h][0-9])?(x)([a-h][0-9])[\+\?!#0-9\$]*$/gi;
            var patt2 = /^([qknbr])([a-h0-9]+)?([a-h][0-9])[\+\?!#0-9\$]*$/gi;
            if(patt.test(move)) {
                var cellTo = move.replace(patt, "$4");
                var cellFrom = move.replace(patt, "$2");
            } else if(patt2.test(move)) {
                var cellTo = move.replace(patt2, "$3");
                var cellFrom = move.replace(patt2, "$2");
            }
            Chess.Debuger.log(move, patt.test(move), patt2.test(move));
            if(cellFrom.length < 2){
                //Chess.Debuger.log("cellFrom="+cellFrom+",", "cellTo="+cellTo, color, move);
                var cellFromIsset = /[a-h]|[0-9]/.test(cellFrom);
                var cellToInt = self.board.cellTransform(cellTo);
                var f = move.replace(/^([qknbr]).*/i, "$1").toLowerCase();
                f = this.figureAdapter(f);
                var cells = this.board.getFiguresCell(color+f);
                if(cells.length===1) {
                    Chess.Debuger.log(this.board.board);
                    return [cells[0], cellTo];
                }
                Ext.Array.each(cells, function (cell) {
                    var potenmoves = self.figure.getFigureMoves(color+f, cell);
                    var key = Ext.Array.indexOf(potenmoves, cellToInt);
                    if(key !== -1) {
                        if(cellFromIsset) {
                            if(cellFrom % 1 === 0){
                                if(cellFrom != cell[1]) {
                                    return;
                                }
                            } else {
                                var x = Ext.Array.indexOf(self.board.index, cellFrom) + 1;
                                if(x != cell[0]) {
                                    return;
                                }
                            }
                        }
                        cellFrom = cell;
                        return false;
                    }
                });
            }
            if(!cellFrom || !cellTo) {
                Ext.create("Chess.Pgn.Exception", "не удалось спартись ход фигуры в PGN формате", move);
            }

            return [cellFrom, cellTo];
        }
    }
});