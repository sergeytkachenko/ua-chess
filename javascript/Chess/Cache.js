Ext.define("Chess.Cache", {
    statics: {
        cache : {},
        /**
         *
         * @param key
         * @returns {*|null}
         */
        get : function (key, defaultVal) {
            return Chess.Cache.cache[key] || defaultVal || null;
        },

        /**
         *
         * @param key
         * @param val
         * @returns {*}
         */
        set : function (key, val) {
            Chess.Cache.cache[key] = val;
            return true;
        },

        /**
         *
         * @param key
         */
        remove : function (key) {
            Chess.Cache.set(key, null);
        },

        getBoardKey : function (board) {
            var a = "";
            for (p in board) {
                a = a + p + board[p];
            }
            return a;
        },

        setToBoard : function (board, color, value) {
            var key = Chess.Cache.getBoardKey(board) + color;
            Chess.Cache.set(key, value);
            return value;
        },

        getToBoard : function (board, color) {
            var key = Chess.Cache.getBoardKey(board) + color;
            return Chess.Cache.get(key);
        }
    }
});