Ext.define("Audio.Voices", {
    constructor : function () {
        this.speach = window.speechSynthesis;
        this.msg = new SpeechSynthesisUtterance();
        this.voices = this.speach.getVoices();
    },
    msg : null,
    voices : null,
    setVoices : function () {
        this.msg.voice = this.speach.getVoices().filter(function(voice) { return voice.name == 'Milena'; })[0];
        this.msg.voiceURI = 'native';
        this.msg.volume = 1; // 0 to 1
        this.msg.rate = 0.6; // 0.1 to 10
        this.msg.pitch = 0.6; //0 to 2

        this.msg.lang = 'en-US';
    },

    playText : function (text) {
        this.setVoices();
        this.msg.text = text;
        this.speach.speak(this.msg);
    },
    singleton : true
});