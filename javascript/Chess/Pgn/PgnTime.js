/**
 * Генерация остатка времени для часов
 */
Ext.onReady(function () {
    Ext.define("Chess.PgnTime", {

        constructor : function (tableId, option) {
            var self = this;
            Ext.iterate(option, function (key, value) {
                self[key] = value;
            });
            this.tableId = tableId;
            this.timeParse = Chess.Pgn.getInstance(this.tableId).getMeta("timeParse");
        },

        statics: {
            instance : [],
            getInstance: function (tableId, option) {
                if(undefined === Chess.PgnTime.instance[tableId]) {
                    Chess.PgnTime.instance[tableId] = new Chess.PgnTime(tableId, option);
                }
                return Chess.PgnTime.instance[tableId];
            }
        },

        /**
         * вычитает с хода вермя затраченое на обдумывание + добавление за ход
         * @param time
         */
        getTime : function (colorMove, time, tmove) {
            if(!this.timeParse) {
                return 0;
            }
            var secMove = this.timeToSec(tmove),
                add = parseInt(this.timeParse.add);
            time[colorMove] -= secMove - add;
            return time;
        },

        /**
         * переводит в секунды время в формате 00:00:02
         * @param tmove
         * @returns {number}
         */
        timeToSec : function (tmove) {
            var t = tmove.split(":");
            var h = parseInt(t[0]),
                m = parseInt(t[1]),
                s = parseInt(t[2]);
            return s + m * 60 + h * 3600;
        }
    });
});