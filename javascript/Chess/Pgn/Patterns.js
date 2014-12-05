Ext.define("Chess.Pgn.Patterns", {
    statics : {
        Begin : "^\\s*",
        NumberMove : "([0-9]{0,}(\\.|\\.{3}))?\\s*",
        Figure : "([KQRBN]([1-8a-h]{2,4}|[1-8a-h]{0,2}(x|-)[1-8a-h]{2})|(0-0|0-0-0|O-O|O-O-O))",
        Transform : "(=[qrbn])?",
        Pawn : "([a-h1-8]{2}|[a-h1-8]{2}\\-[a-h1-8]{2}|[a-h1-8]{1,2}x[a-h1-8]{1,2})",
        NotIn : "([^а-яА-Яa-zA-Z0-9]|\\b)",
        End : "[\\s\\S]*$",

        getFigure : function () {
            return Chess.Pgn.Patterns.Begin +
                Chess.Pgn.Patterns.NumberMove +
                Chess.Pgn.Patterns.Figure +
                Chess.Pgn.Patterns.NotIn + Chess.Pgn.Patterns.End;
        },

        getPawn : function () {
            return Chess.Pgn.Patterns.Begin +
                Chess.Pgn.Patterns.NumberMove +
                Chess.Pgn.Patterns.Pawn +
                Chess.Pgn.Patterns.Transform +
                Chess.Pgn.Patterns.NotIn + Chess.Pgn.Patterns.End;
        }
    }
});

