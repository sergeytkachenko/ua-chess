Ext.define("Chess.Event", {
    statics: {},
    constructor: function (conf) {
        Ext.apply(this, conf);
        this.events = [];
    },

    on : function (name, callBack, scope) {
        scope  = scope || window;
        name = name.split(".");
        var context = this.events;
        Ext.Array.each(name, function (key) {
            if(undefined===context[key]) {
                context[key] = [];
            }
            context = context[key];
        });
        context.push([callBack, scope]);
    },

    off : function (name) {
        name = name.split(".");
        var last = name.pop();
        name.push(last);
        var context = this.events;
        Ext.Array.each(name, function (key) {
            if(undefined===context[key]) {
                return false;
            }
            if(key===last) {
                delete context[key];
                return false;
            }
            context = context[key];
        });
    },

    run : function (name, params) {
        name = name.split(".");
        var context = this.events;
        var a = 1;
        Ext.Array.each(name, function (key) {
            if(undefined===context[key]) {
                return a = false;
            }
            context = context[key];
        });
        if(!a) {
            return false;
        }
        for(var i=0; i < context.length; i++) {
            var f = context[i][0],
                scope = context[i][1];
            if(Object.prototype.toString.call(params) !== '[object Array]' ) {
                params = [params];
            }
            Chess.Debuger.groupCollapsed("event "+arguments[0]);
            Chess.Debuger.log(f);
            f.apply(scope, params);
            Chess.Debuger.groupEnd();
        }

    }
});