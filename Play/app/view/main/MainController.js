Ext.define('Play.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    pgnLoad : function () { // загрузка pgn файла
        var self = this;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var group = Chess.GroupRegistry.getInstance(Play.app.boardId),
                board = group.get("board"),
                pgnInterface = group.get("Chess.Pgn.Interface");
            $("input[name=tmpFile]")
                .trigger("click")
                .off("change")
                .on("change", function (event) {

                    Ext.getBody().mask("Loading...");

                    File.Reader.getLocalFile(this.files[0], function (text) {
                        $("input[name=tmpFile]").val("");
                        pgnInterface.getXMLPgnFromString(text, function () {
                            var lstFen = pgnInterface.getLastFenFromMove();
                            board.printFromFen(lstFen);

                            Ext.getBody().unmask();

                            console.log(this.XML[0])
                            var moves = this.common.getLastMoveFromXml();
                            // print last move
                            Chess.Draw.Arrow.clear(board);
                            Chess.Draw.Arrow.drawArrow(board, board.getCellPosition(moves[0]), board.getCellPosition(moves[1]))
                        });
                    });
                });
        } else {
            alert('Вы используете устаревший браузер.');
        }
    },

    flipBoard : function () {
        var group = Chess.GroupRegistry.getInstance(Play.app.boardId),
            board = group.get("board");
        board.flip();
    }

});
