Ext.define("Chess.Board.Template", {
    extends : "Ext.Template",
    html : "<div class='board-coordinates' id='{boardId}'>"
                +"<div class='board'>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<span class='draw'></span>"
                    +"<span class='event'>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"<div></div>"
                    +"</span>"
                +"</div>"
                +"<div data-align='left' data-display='{dataCoordinate}'>"
                    +"<div><spn>8</spn></div>"
                    +"<div><spn>7</spn></div>"
                    +"<div><spn>6</spn></div>"
                    +"<div><spn>5</spn></div>"
                    +"<div><spn>4</spn></div>"
                    +"<div><spn>3</spn></div>"
                    +"<div><spn>2</spn></div>"
                    +"<div><spn>1</spn></div>"
                +"</div>"
                +"<div data-align='right' data-display='false'>"
                    +"<div><spn>8</spn></div>"
                    +"<div><spn>7</spn></div>"
                    +"<div><spn>6</spn></div>"
                    +"<div><spn>5</spn></div>"
                    +"<div><spn>4</spn></div>"
                    +"<div><spn>3</spn></div>"
                    +"<div><spn>2</spn></div>"
                    +"<div><spn>1</spn></div>"
                +"</div>"
                +"<div data-align='top' data-display='false'>"
                    +"<div>a</div>"
                    +"<div>b</div>"
                    +"<div>c</div>"
                    +"<div>d</div>"
                    +"<div>e</div>"
                    +"<div>f</div>"
                    +"<div>g</div>"
                    +"<div>h</div>"
                +"</div>"
                +"<div data-align='bottom' data-display='{dataCoordinate}'>"
                    +"<div>a</div>"
                    +"<div>b</div>"
                    +"<div>c</div>"
                    +"<div>d</div>"
                    +"<div>e</div>"
                    +"<div>f</div>"
                    +"<div>g</div>"
                    +"<div>h</div>"
                +"</div>"
            +"</div>",

    displayBoards : function (revert) {
        var boards = document.querySelectorAll("div[data-board='true']");
        var tpl = new Ext.Template(this.html);
        for(var key = 0; boards.length > key; key ++) {
            var id = boards[key].getAttribute("id");
            var boardId = boards[key].getAttribute("data-id");
            var dataCoordinate = boards[key].getAttribute("data-coordinate");
            dataCoordinate = dataCoordinate === "true"? true : false;
            tpl.append(id, {boardId: boardId, dataCoordinate : dataCoordinate});

            return boardId;
        }
    }
});