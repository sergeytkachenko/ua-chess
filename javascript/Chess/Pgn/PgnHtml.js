/**
 * Генерирует html из pgn dom дерева партии
 */
Ext.onReady(function () {
    Ext.define("Chess.PgnHtml", {
        constructor : function (tableId, option) {
            this.tableId = tableId;
            var self = this;
            Ext.iterate(option, function (key, value) {
                self[key] = value;
            });
        },

        statics: {
            instance : [],
            getInstance: function (tableId, option) {
                if(undefined === Chess.PgnHtml.instance[tableId]) {
                    Chess.PgnHtml.instance[tableId] = new Chess.PgnHtml(tableId, option);
                }
                return Chess.PgnHtml.instance[tableId];
            }
        },

        display : function (root, toRender, noevent) {
            var self = this;
            this.toRender = toRender;
            var html = "";
            $(root).find(">*").each(function (ind, elem){
                html += self.replaceElem(elem);
            });
            $(toRender).html(html);
            if(!noevent) {
                setTimeout(function () {
                    self.initEvent();
                }, 200);
            }
        },

        getCurrentMove : function () {
            return $(this.toRender).find(".move.active");
        },

        replaceElem : function (el) {
            var self = this;
            var tag = el.localName;
            var dataId = $(el).attr("data-id") || false;
            if(tag!=="move") {
                var text = $(el).onlyText(),
                    children = $(el).children();
                if(children.length > 0) {
                    $(children).each(function (ind, child) {
                        text += self.replaceElem(child);
                    });
                }
                if(tag=="time") {
                    text = this.replaceTime(text.replace(/\s*/, ""));
                }
                switch(tag) {
                    case "branch" :
                        return "<div class='"+tag+"' data-id='"+dataId+"'> ("+text+")</div>";
                    case "symbol":
                        return "<div class='"+tag+"' data-id='"+dataId+"'> $"+text+"</div>";
                    default :
                        return "<div class='"+tag+"' data-id='"+dataId+"'> "+text+"</div>";
                }
            }
            return this.replaceMove(el);
        },

        /**
         * Изменение вывода формата времени
         * @param time
         * @returns {string}
         */
        replaceTime : function (time) {
            time = time.split(":");
            var h = parseInt(time[0]),
                m = parseInt(time[1]),
                s = parseInt(time[2]);
            var time = h !== 0 ? (h < 10? "0"+h : h) + ":" : "";
            time += m !== 0 ? (m < 10? "0"+m : m) + ":" : "";
            time += (s < 10 && time != ""? "0"+s : s);
            return time;
        },

        replaceMove : function (el) {
            var self = this,
                color = $(el).attr("data-color"),
                dataId = $(el).attr("data-id"),
                text = this.generationMoveText(el),
                children = $(el).children();
            if(children.length > 0) {
                $(children).each(function (ind, child) {
                    text += self.replaceElem(child);
                });
            }
            return "<div class='move' data-id='"+dataId+"' data-color='"+color+"'>"+text+"</div>";
        },

        /**
         * Генерация нотации хода
         * @param el
         * @returns {string}
         */
        generationMoveText : function (el) {
            var color = $(el).attr("data-color");
            var move = $(el).attr("data-move");
            var num = $(el).attr("data-num");
            if(color==="w") {
                num = num+".";
            } else if(color==="b") {
                if($(el).index()===0) {
                    num = num+"...";
                } else {
                    num = "";
                }
            }
            move = move.replace(/-/g, "&#8211;");
            return "<span>" + num + move + "</span>";
        },

        initEvent : function () {
            var self = this;
            $(self.toRender).off("click", ".move").on("click", ".move", function () {
                Ext.getCmp("notation.ContextMenu")? Ext.getCmp("notation.ContextMenu").close() : "";
                self.setActiveMove($(this).attr("data-id"));
                return false;
            });
            if(undefined !==this.eventKey) {
                this.eventKey.destroy(true);
            }
            this.eventKey = new Ext.util.KeyNav({
                target : Ext.getBody(),
                left   : function(e){
                    self.setPrev();
                },
                right  : function(e){
                    self.setNext();
                },
                esc: {
                    fn: this.onEsc,
                    defaultEventAction: false
                },
                scope : this
            });

            // прокрутка на доске
            $("#board").off('mousewheel').on('mousewheel', function(event) {
                if (event.originalEvent.wheelDelta >= 0) {
                    self.setPrev();
                }
                else {
                    self.setNext();
                }
            });

            $(self.toRender).find("div.move > div.branch").parent().css("display", "block");
        },

        /**
         * устанавливает активный ход в нотации и на доске
         * @param id
         * @returns {Chess.PgnHtml}
         */
        setActiveMove : function (id) {
            $(this.toRender).find(".move").removeClass("active");
            var currElement = $(this.toRender).find(".move[data-id="+id+"]");
            $(currElement).addClass("active");

            this.setScrollPosition(currElement);

            var tableId = $(this.toRender).attr("data-id");
            this.setPositionToBoard(id, tableId);
            this.setExtantions(currElement);
            return this;
        },

        /**
         * Отображение активного ход на доске
         * @param id
         * @param tableId
         */
        setPositionToBoard : function (id, tableId) {
            var Fen = Chess.Fen.getInstance(tableId);
            var Pgn = Chess.Pgn.getInstance(tableId);
            var Draw = Chess.Draw.getInstance(tableId);


            Chess.Setting.getInstance(tableId).meLastMove = true;
            if(!Pgn.parseFenArray) {
                Chess.Debuger.alert("Подождите пока спарсится PGN нотация...");
            }
            if(Pgn.parseFenArray[id]===undefined) {
                Chess.Debuger.alert("Не удалось найти ход...");
            }
            var obj = Pgn.parseFenArray[id];
            if(obj) {
                var fen = obj.fen;
                var move = obj.lastMove;
                Fen.setFen(fen);
                Draw.drawLastMove(move[0], move[1]);
                this.setTime(tableId, obj.time);
            }
        },

        /**
         * Устанавлвает время на часах
         * @param tableId
         * @param time = {w:[sec],b:[sec]}
         */
        setTime : function (tableId, time) {
            var Time = Chess.Time.getInstance(tableId);
            if(undefined !==time && undefined !== time.w && undefined !== time.b) {
                Time.w = time.w*1000;
                Time.b = time.b*1000;
                Time.setHtml();
            } else {
                // устанавливает последнее запомненное время в обьекте Time
                Time.setHtml();
            }
        },

        /**
         * Отображает разноцветные стрелочки, и клеточки на доске
         */
        setExtantions : function (currElement) {
            var Draw = Chess.Draw.getInstance(this.tableId),
                Board = Chess.Board.getInstance(this.tableId);
            var ext = $(currElement).find(" > div.comment > div.cal, > div.comment > div.csl");
            $(ext).each(function () {
                var extCls = $.trim($(this).attr("class"));
                var values = $.trim($(this).text()).split(",");
                Ext.Array.each(values, function (text) {
                    var color = text[0],
                        text = text.replace(/^[YGR]/,"");
                    if(extCls==="cal") {
                        var from = text[0]+text[1],
                            to = text[2]+text[3],
                            fromPosition = Board.getCellPosition(from),
                            toPosition = Board.getCellPosition(to),
                            coord = Draw.getArrowCoordinates(fromPosition, toPosition, 3.4/* depth */),
                            option = Draw.getOptionCalExtension(color);
                        Draw.printArrow(coord, option)
                    }
                    if(extCls==="csl") {
                        var cell = Board.cellTransform(text),
                            option = Draw.getOptionCalExtension(color);
                        Board.setCellBackground(cell, option.fill);
                        // не нужно рисовать
                    }
                });
            });
        },

        setPrev : function () {
            var curEl = $(this.toRender).find(".move.active");
            var prev = $(curEl).prev(".move");
            prev = prev.length===0 ? $(curEl).parents(".move:eq(0)") : prev;

            this._setElement(curEl, prev);
        },

        setNext : function () {
            var curEl = $(this.toRender).find(".move.active");
            var next = curEl.length > 0 ? $(curEl).next(".move") :  $(this.toRender).find(".move:eq(0)");

            this._setElement(curEl, next);
        },

        _setElement : function (curEl, element) {
            if(element.length===0) {
                return;
            }
            this.setScrollPosition(element);

            var tableId = $(element).parents(".notation-pgn").attr("data-id");
            var id = $(element).attr("data-id");
            $(curEl).removeClass("active");
            $(element).addClass("active");
            this.setPositionToBoard(id, tableId);
            this.setExtantions(element);
        },

        setScrollPosition : function (element) {
            var position = $(element).position(),
                elementScroll = $(element).parents(".x-panel-body"),
                notationHeight = $(element).parents(".x-panel").height(),
                top = elementScroll.scrollTop() + position.top;
            
            if(notationHeight-20 <= position.top) {
                Ext.get(elementScroll[0]).scrollTo('top', top);
            } else if(position.top <= 10) {
                Ext.get(elementScroll[0]).scrollTo('top', top - 100);
            }
        }
    });
});