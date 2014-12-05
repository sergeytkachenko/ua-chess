/**
 * This class makes it easy to work with groups of objects by initializing
 * singletons only this group classes on tableID
 * @example
 *  var group1 = Chess.GroupRegistry.getInstance('play1');
 *  var group2 = Chess.GroupRegistry.getInstance('play2');
 *
 *  var board1 = group1.get("board"); // returned singleton with tableID = 'play1'
 *  var board2 = group2.get("board"); // returned singleton with tableID = 'play2'
 *
 */
Ext.define("Chess.GroupRegistry", {
    classes : [],
    constructor : function (conf) {
        this.config = conf;
        Ext.apply(this, conf);
    },
    statics : {
        counter : 0,
        instance : [],
        /**
         * Генерирует уникальный id и возвращает свой instance
         * @returns {*}
         */
        getUniqueInstance : function () {
            Chess.GroupRegistry.counter ++;
            return Chess.GroupRegistry.getInstance(Chess.GroupRegistry.counter);
        },
        getInstance : function (boardID, config) {
            config = config || {};
            config.boardID = config.boardID ? config.boardID : boardID;
            if (null===boardID || undefined===boardID) {
                return Chess.GroupRegistry.instance[null] = new Chess.GroupRegistry(config);
            }
            if(undefined === Chess.GroupRegistry.instance[boardID]) {
                config.boardID = boardID;
                Chess.GroupRegistry.instance[boardID] = new Chess.GroupRegistry(config);
            }
            return Chess.GroupRegistry.instance[boardID];
        },
        instanceList : [],
        get : function (boardID, config) {
            config = config || {};
            if(undefined===Chess.GroupRegistry.instanceList[boardID]) {
                Chess.GroupRegistry.instanceList[boardID] = Chess.GroupRegistry.getInstance(boardID, config);
            }
            return Chess.GroupRegistry.instanceList[boardID];
        }
    },

    /**
     * @param classAlias - alias for class name or full class name
     * @returns {*||bool} - chess group class || bool false if alias not found
     * @example var group = Chess.GroupRegistry.getInstance([tableID]); group.get('board') - returned Chess.Board.getInstance([tableID]);
     */
    get : function (classAlias) {
        var $className;
        switch(classAlias) {
            case "board":
                $className = "Chess.Board";
                break;
            case "event":
                $className = "Chess.Event";
                break;
            default:
                $className = classAlias;
            // TODO add more alias classes
        }
        $className = $className || classAlias;
        var className = $className.split("."),
            func = className.pop(),
            context = window;
        for(var i = 0; i < className.length; i++) {
            context = context[className[i]];
        }
        if(typeof (context[func]) !== "function" ) {
            console.error("Не найден класс " + $className);
            return false;
        }
        if(
            undefined === this.classes[this.boardID] ||
            typeof this.classes[this.boardID][$className] !== "object"
        ) {
            this.classes[this.boardID] = this.classes[this.boardID] || [];
            this.classes[this.boardID][$className] = new context[func](this.config);
        }
        return this.classes[this.boardID][$className];
    }
    // TODO created register classAlias array to this group-class
});