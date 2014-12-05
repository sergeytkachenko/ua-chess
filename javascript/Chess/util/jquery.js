(function () {
    jQuery.fn.onlyText = function() {
        return $(this)  .clone()
            .children()
            .remove()
            .end()
            .text();
    };
})();