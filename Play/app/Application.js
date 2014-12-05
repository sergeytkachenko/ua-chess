/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */

Ext.Loader.setPath({
    'Chess': '/javascript/Chess',
    'File': '/javascript/File'
});
Ext.define('Play.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'Chess.Application.Controller',
        'Chess.Application.Command.CorrectMove',
        'Chess.Application.PlayController',
        'Chess.Board',
        'Chess.Cache',
        'Chess.GroupRegistry',
        'Chess.Moves',
        'Chess.Event',
        'Chess.Debuger',
        'Chess.Fen.Reader',
        'Chess.Fen.Writer',
        'Chess.Pgn.Interface',
        'Chess.DragDrop.Board',
        'Chess.Board.Template',
        "File.Reader"
    ],

    name: 'Play',

    stores: [
        // TODO: add global / shared stores here
    ],
    
    launch: function () {

        this.boardId = Ext.create("Chess.Board.Template").displayBoards(true);

        Chess.GroupRegistry.getInstance('cache');
        var group = Chess.GroupRegistry.getInstance('play');

        var commandsIterator = group.get("Chess.Application.CommandsIterator");

        commandsIterator.registryCommand(group.get("Chess.Application.Command.CorrectMove"));
        commandsIterator.registryCommand(group.get("Chess.Application.Command.TransformPawn"));
        commandsIterator.registryCommand(group.get("Chess.Application.Command.PrintArrow"));
        commandsIterator.registryCommand(group.get("Chess.Application.Command.SetPgnNotation"));
        commandsIterator.registryCommand(group.get("Chess.Application.Command.Movement"));

        var controller = group.get("Chess.Application.Controller");
        controller.run(group.get("Chess.Application.PlayController"));

        var board = group.get("board");

        var event = group.get('Chess.Event');

        event.on("board.drag.start", function () {
            var dataID = arguments[0][0].target.parentNode.getAttribute('data-id');
            arguments[0][1].helper[0].setAttribute('data-id', dataID);
            board.setBackgroundColor(group.get("Chess.Figures.Terms").getPossibleMoves(parseInt(dataID)));
        });

        event.on("board.drop", function (fromCell, toCell) {
            controller.specificController.drop(fromCell, toCell);
        });

        board.printFigures();
        board.initDragDrop();
    }
});
