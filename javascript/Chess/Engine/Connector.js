Ext.define("Chess.Engine.Connector", {

    statics : {
        instance : null,
        getInstance : function () {
            if(Chess.Engine.Connector.instance instanceof  Chess.Engine.Connector === false) {
                Chess.Engine.Connector.instance = Ext.create('Chess.Engine.Connector');
            }
            return Chess.Engine.Connector.instance;
        }
    },

    URL : "http://localhost:8090/engine",
    socket : new SockJS(URL),
    stomp : Stomp.over(socket),

    constructor : function (config) {
        // init engine path
    },

    connect : function () {
        var self= this;
        self.stomp.connect({}, function(frame) {
            self.stomp.subscribe('/topic/engine', function(data){ // подписка на слушание канала
                var data = Ext.JSON.decode(data.body);
                var move = data.bestMove;
                var patt = /^([a-h0-8]{2})([a-h0-8]{2})$/,
                        fromCell = Chess.Board.cellTransform(move.replace(patt, "$1")),
                        toCell = Chess.Board.cellTransform(move.replace(patt, "$2"));
                controller.specificController.drop(fromCell, toCell);
                //board.printFromFen(data.fen);
            });
            var fen = pgnInterface.getLastFenFromMove() || Chess.Fen.Reader.fenStart;
            sendFen(fen);
        });
    },

    getEngine : function (engineName) {

    }
});