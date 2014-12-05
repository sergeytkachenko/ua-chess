Ext.define("Chess.Debuger", {
    statics : {

        logMode : false,
        timeMode : false,
        groupMode : false,
        infoMode : false,

        error : function (msg, params) {

            throw new Ext.Error(msg+": "+params);
        },

        warning : function (msg) {
            console.warn(msg);
        },

        log : function (msg) {
            if(Chess.Debuger.logMode===true) {
                console.trace(msg);
            }
        },

        info : function (msg) {
            if(Chess.Debuger.infoMode===true) {
                console.info(msg);
            }
        },

        group : function (msg) {
            if(Chess.Debuger.groupMode===true) {
                console.group(msg);
            }
        },

        groupEnd : function (msg) {
            if(Chess.Debuger.groupMode===true) {
                console.groupEnd(msg);
            }
        },

        groupCollapsed : function (msg) {
            if(Chess.Debuger.groupMode===true) {
                console.groupCollapsed(msg);
            }
        },

        time : function (msg) {
            if(Chess.Debuger.timeMode===true) {
                console.time(msg);
            }
        },

        timeEnd : function (msg) {
            if(Chess.Debuger.timeMode===true) {
                console.timeEnd(msg);
            }
        },

        saveLog : function (msg, param) {
            // здесь храняться js логи
        },

        alert : function (msg) {
            Ext.Msg.alert("Message", msg);
        }
    }
});