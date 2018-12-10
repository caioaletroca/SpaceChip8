var Keyboard = function(context) {
	this.context = context;
	document.addEventListener('keydown', this.keyDown.bind(this));
	document.addEventListener('keyup', this.keyUp.bind(this));

	this.translateKeys = {
        '1': 0x1,  // 1
        '2': 0x2,  // 2
        '3': 0x3,  // 3
        '4': 0x4,  // 4
        'q': 0x5,  // Q
        'w': 0x6,  // W
        'e': 0x7,  // E
        'r': 0x8,  // R
        'a': 0x9,  // A
        's': 0xA,  // S
        'd': 0xB,  // D
        'f': 0xC,  // F
        'z': 0xD,  // Z
        'x': 0xE,  // X
        'c': 0xF,  // C
        'v': 0x10  // V
    };
}

Keyboard.prototype = {
	keyDown: function(event) {
		this.context.key[this.translateKeys[event.key]] = 1;
	},

	keyUp: function(event) {
		this.context.key[this.translateKeys[event.key]] = 0;	
	}
}