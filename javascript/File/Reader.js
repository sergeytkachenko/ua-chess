/**
 * Открывает локальные файлы, с учетом нескольких кодировок
 */
Ext.define("File.Reader", {
    statics: {

        encodingIndex : 0, // индекс кодировки по-умолчанию
        encodings : [
            "UTF-8",
            "CP1251"
        ],

        getLocalFile : function (file, callback, encoding) {
            if(File.Reader.encodingIndex > File.Reader.encodings.length) {
                File.Reader.encodingIndex = 0;
                return false;
            }
            if (file) {
                encoding = encoding || File.Reader.encodings[File.Reader.encodingIndex];
                var r = new FileReader();
                r.onload = function(e) {
                    var text  = r.result;
                    if (text.indexOf(String.fromCharCode(65533)) !== -1) {
                        // остановка
                        r.abort();
                        encoding = File.Reader.encodings[File.Reader.encodingIndex++];
                        File.Local.getLocalFile(file, callback, encoding);
                        return false;
                    }
                    File.Reader.encodingIndex = 0;
                    callback(r.result);
                }
                r.readAsText(file, encoding);
            } else {
                console.error("Failed to load local file",  file);
            }
        }
    }
});