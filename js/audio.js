var WebBrowserAudio = function() {
	this.audioContext = window.AudioContext && new AudioContext ||
	                    window.webkitAudioContext && new webkitAudioContext;
}

WebBrowserAudio.prototype = {
	beep: function() {
		if(this.audioContext) {
			var osc = this.audioContext.createOscillator();
			osc.connect(this.audioContext.destination);
			osc.type = 'triangle';
			osc.start();;
			setTimeout(function () {
				osc.stop();
			}, 100);
			return;
		}
	}
}