Ext.define("Chess.DragDrop.Board", {
    statics : {

        dragCls : "drag",

        getRealEl : function (boardId, elDataId) {
            return Ext.get(boardId).select("div.board > div > div[data-id='"+elDataId+"'] img");
        },

        getElByCell : function (boardId, dataId) {
            return Ext.get(boardId).select("div.board > div > div[data-id='"+dataId+"']");
        },

        getCellByXY : function (boardId, x, y) {
            var cells = Ext.get(boardId).select("div.board > div > div[data-id]"),
                dataId = false;
            Ext.each(cells.elements, function (cell) {
                var el = Ext.dom.Element.get(cell),
                    xy = el.getXY(),
                    w = el.getWidth(),
                    h = el.getHeight(),
                    a1 = [xy[0] - w/2, xy[1] - h/2],
                    a2 = [xy[0] + w/2, xy[1] - h/2],
                    a3 = [xy[0] + w/2, xy[1] + h/2],
                    a4 = [xy[0] - w/2, xy[1] + h/2];
                if (x >= a1[0] && x <= a2[0] && y >= a1[1] && y <= a3[1]) {
                    dataId = el.getAttribute("data-id");
                    return false;
                }
            });
            return dataId;
        },

        initDrag : function (boardId, imageElement) {
            var overrides = {
                cache : {},
                b4StartDrag : function() { // До начала перетаскивания
                    var dataId = this.el.up().getAttribute("data-id");

                    this.cache = {};
                    this.cache.dataId = dataId;
                    this.cache.elReal = Chess.DragDrop.Board.getRealEl(boardId, this.cache.dataId);

                    this.cache.width = this.el.getWidth();
                    this.cache.height = this.el.getHeight();
                    this.cache.position = this.el.getStyle("position");
                    this.cache.x = this.el.getXY()[0] - Ext.getBody().getScrollLeft();
                    this.cache.y = this.el.getXY()[1] - Ext.getBody().getScrollTop();

                    this.el.dom.style.position = 'fixed';
                    this.el.dom.style.width = this.cache.width+"px";
                    this.el.dom.style.height = this.cache.height+"px";


                    this.cache.elReal.setStyle("position", "fixed");
                    this.cache.elReal.setWidth(this.cache.width);
                    this.cache.elReal.setHeight(this.cache.height);

                    this.el.addCls(Chess.DragDrop.Board.dragCls);
                    this.cache.elReal.addCls(Chess.DragDrop.Board.dragCls);

                    this.invalidDrop = false;
                },

                onDrag: function(e) { // В момент перетаскивания
                    var x = this.el.getXY()[0],
                        y = this.el.getXY()[1];
                    this.cache.elReal.position("fixed", 10, x, y);
                },

                onInvalidDrop : function() { // если нельзя сюда бросать
                    console.log("onInvalidDrop")
                    this.invalidDrop = true;
                },

                onDragDrop : function (e, boardId) { // бросание элемента
                    var group = Chess.GroupRegistry.getInstance(boardId),
                        event = group.get("event"),
                        x = this.el.getXY()[0],
                        y = this.el.getXY()[1];
                    var fromCell = this.el.up().getAttribute("data-id"),
                        toCell = Chess.DragDrop.Board.getCellByXY(boardId, x, y);
                    event.run("board.drop", [Number.parseInt(fromCell), Number.parseInt(toCell), this]);
                },

                endDrag : function(o, invalidDrop, me) { // окнчание перетаскивания
                    var me = me || this;
                    if (me.invalidDrop === true || invalidDrop) { // выполняется если drop не разрешен на этом элементе
                        var animCfgObj = {
                            to: {
                                left: me.cache.x,
                                top: me.cache.y
                            },
                            duration : 100,
                            scope    : me,
                            callback : function() {
                                me.cache.elReal.setStyle({
                                    position : me.cache.position,
                                    left : 0,
                                    top: 0,
                                    'z-index' : 0
                                }).removeCls(Chess.DragDrop.Board.dragCls);
                                me.el.setStyle({
                                    position : me.cache.position,
                                    left : 0,
                                    top: 0
                                }).removeCls(Chess.DragDrop.Board.dragCls);
                            }
                        };

                        me.el.animate(animCfgObj);
                        Ext.dom.Element.get(me.cache.elReal.first()).animate(animCfgObj);

                        delete me.invalidDrop;
                    }
                }
            };
            var images = imageElement || Ext.get(boardId).select("div.board > .event > div img").elements;

            Ext.each(images, function (el) {
                var dd = Ext.create('Ext.dd.DD', el, boardId, {
                    isTarget  : false
                });

                Ext.apply(dd, overrides);
            });
        },

        initDropElements : function (boardId) {
            Ext.create('Ext.dd.DropTarget', boardId, {
                ddGroup: boardId
            });
        }
    }
})