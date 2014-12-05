Ext.define("Chess.Draw.Arrow", {
    statics : {

        k : 1,
        addPixelCenter : 2,
        depth : 4.3,
        width : 27,
        height : 12,
        kCenter : 2.5,

        getArrowCoordinates : function (positionFrom, positionTo, depth, board) {
            var cellK  = board.getBoardCellWidth() / 2,
                depth = depth || Chess.Draw.Arrow.depth,
                depth = depth * Chess.Draw.Arrow.k,
                width = Chess.Draw.Arrow.width * Chess.Draw.Arrow.k,
                height = Chess.Draw.Arrow.height * Chess.Draw.Arrow.k,
                kCenterMin = cellK / Chess.Draw.Arrow.kCenter;
            positionFrom.left += cellK;
            positionFrom.top += cellK;
            positionTo.left += cellK;
            positionTo.top += cellK;
            var x1 = positionFrom.left;
            var y1 = positionFrom.top;
            var x2 = positionTo.left;
            var y2 = positionTo.top;
            var AB =  Math.sqrt(Math.pow((x2 - x1), 2) +  Math.pow((y2 - y1), 2));
            var AB2 = Math.sqrt( Math.pow((x2 - x1), 2));
            var cosA = x2 < x1 ? - (AB2 / AB) : AB2 / AB,
                sinA = Math.sqrt((1 - Math.pow(cosA, 2) ));
            sinA = (y2 < y1 ? - sinA : sinA ),
                m = (AB-kCenterMin)/kCenterMin;
            puth = [];
            x2 = (x1 + (m*x2))/(1+m);
            y2 = (y1 + (m*y2))/(1+m);
            puth.push((x1 - depth*sinA) + " " + (y1 + depth*cosA)); // 1
            puth.push((x2 - depth*sinA - width*cosA) + " " + (y2 - width*sinA + depth*cosA)); // 2
            puth.push((x2 - width*cosA - height*sinA) + " " + (y2 + height*cosA -width*sinA)); // 3
            puth.push(x2 + " " + y2); // 4
            puth.push((x2 + height*sinA - width*cosA) + " " + (y2 - height*cosA -width*sinA)); // 5
            puth.push((x2 + depth*sinA - width*cosA) + " " + (y2 - depth*cosA -width*sinA)); // 6
            puth.push((x1 + depth*sinA) + " " + (y1 - depth*cosA)); // 7
            return "M " + puth.join(" L ") + " z";
        },

        drawArrow : function (board, cellFromPosition, cellToPosition) {
            var xy = Chess.Draw.Arrow.getArrowCoordinates(cellFromPosition, cellToPosition, null, board);
            Chess.Draw.Arrow.printArrow(xy, null, board);
        },

        printArrow : function(r, option, board) {
            var svg = board.getSvgBoard();
            var option = option || {
                    fill : "#e2d82d",
                    stroke: '#d7c370',
                    'stroke-width' : 0.5,
                    opacity: 0.8,
                    cls : "lastMove"
                }
            Ext.create('Ext.draw.Container', {
                viewBox : false,
                sprites: [{
                    type: "path",
                    path: r,
                    fill: option.fill,
                    opacity: option.opacity,
                    stroke: option.stroke,
                    'stroke-width': option['stroke-width']
                }],
                renderTo : svg,
                cls : option.cls,
                height : board.getBoardHeight(),
                width : board.getBoardWidth()
            });
        },

        clear : function (board) {
            var svg = board.getSvgBoard();
            $(svg).empty();
        }
    }
});