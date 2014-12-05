/**
 * Открывает локальные файлы, с учетом нескольких кодировок
 */
Ext.define("File.Local", {
    statics: {

        encodingIndex : 0, // индекс кодировки по-умолчанию
        encodings : [
            "UTF-8",
            "CP1251"
        ],

        getLocalFile : function (file, callback, encoding) {
            if(File.Local.encodingIndex > File.Local.encodings.length) {
                File.Local.encodingIndex = 0;
                return false;
            }
            if (file) {
                encoding = encoding || File.Local.encodings[File.Local.encodingIndex];
                var r = new FileReader();
                r.onload = function(e) {
                    var text  = r.result;
                    if (text.indexOf(String.fromCharCode(65533)) !== -1) {
                        // остановка
                        r.abort();
                        encoding = File.Local.encodings[File.Local.encodingIndex++];
                        File.Local.getLocalFile(file, callback, encoding);
                        return false;
                    }
                    File.Local.encodingIndex = 0;
                    callback(r.result);
                }
                r.readAsText(file, encoding);
            } else {
                console.error("Failed to load local file",  file);
            }
        }
    }
});