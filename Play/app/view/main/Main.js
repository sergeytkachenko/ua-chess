Ext.define('Play.view.main.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'Play.view.main.MainController',
        'Play.view.main.MainModel',
        'Play.view.board.MainController',
        'Play.view.board.MainModel',
        'Play.view.board.Main'
    ],

    controller : 'main',

    xtype: 'app-main',

    viewModel: {
        type: 'main'
    },

    layout: {
        type: 'border'
    },

    items: [{
        id : "top-navigation",
        region: 'north',
        xtype: 'tabpanel',
        activeTab: 0,
        items: [{
            title: 'Главная',
            tbar: [{
                xtype: 'buttongroup',
                minHeight : 30,
                items: [{
                    xtype:'button',
                    text: 'Файл',
                    iconCls: 'add16',
                    scale: 'medium',
                    height: 30,
                    style : {
                        //background: "url(/img/icons/file.png) no-repeat 2px center;"
                    },
                    arrowAlign:'right',
                    menu: [
                        {
                            text: 'Открыть PGN партию',
                            iconCls: 'pgn20',
                            handler: 'pgnLoad'
                        }
                    ]
                }]
            }]
        },{
            title: 'Сообщество'
        },{
            title: 'Вид',
            tbar: [{
                xtype: 'buttongroup',
                minHeight : 30,
                items: [{
                    xtype:'button',
                    text: 'Повернуть доску',
                    iconCls: 'add16',
                    scale: 'medium',
                    height: 30,
                    style : {
                        //background: "url(/img/icons/flip.png) no-repeat 2px center;"
                    },
                    handler: 'flipBoard'
                }]
            }]
        },{
            title: 'Настройки'
        }],
        split: true,
        minHeight : 78,
        maxHeight : 78
    }, {
        id : 'board',
        region: 'west',
        width: '75%',
        minWidth : 390,
        split: true,
        xtype : 'board',
        height : '100%'
    },{
        minHeight : 115,
        minWidth : 305,
        height: '15%',
        region: 'center',
        html : "clock"
    },{
        id : "notation",
        region: 'south',
        h: 60,
        weight: -100,
        xtype: 'tabpanel',
        activeTab: 0,
        bodyCls : "notation-overflow",

        items: [{
            title: 'Нотация',
            html: 'notation'
        },{
            title: 'Бланк',
            html: 'Бланк'
        }],
        height : "40%",
        split: true
    },{
        id : "people",
        region: 'south',
        weight: -100,
        html : "Зрители",
        h: 20,
        height : "20%",

        html: "viewers"
    },{
        hidden: false,
        id : "engine",
        region: 'south',
        h: 10,
        weight: -100,
        height : "10%",
        html: "engine"
    }]
});
