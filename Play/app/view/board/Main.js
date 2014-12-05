
Ext.define("Play.view.board.Main",{
    extend: "Ext.panel.Panel",

    xtype:"board",

    controller: "board-main",
    viewModel: {
        type: "board-main"
    },

    html:
    '<div class="board-general">' +
        '<div style="width:880px;height:880px;" id="12hd" data-id="play" data-board="true" data-coordinate="true"></div>' +
    '</div>'
});
