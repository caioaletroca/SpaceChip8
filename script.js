var chip8 = function() {

	this.displayWidth = 64;
	this.displayHeight = 32;
	//this.display = new Array(this.dis)

	this.running = null;
	this.renderer = null;



	this.reset();
	this.rom = [];
}

chip8.prototype = {
	reset: function() {
		// Program counter
		this.pc = 0;

		// Memory
		this.memory = new Array(4096);

		// Stack
		this.stack = new Array(16);

		// Stack Pointer
		this.sp = 0;

		// V registers
		this.v = new Array(16);

		// I Registers
		this.i = 0;

		// Delay timer
		this.delayTimer = 0;

		// Sound timer
		this.soundTimer = 0;
	},

	openRom: function (path) {
		fetch(path, { 
			method: 'GET',
	  		mode: 'no-cors',

		}).then(function (response) {
			response.arrayBuffer().then(function(buffer) {
				// Load File as a binary array
			  chip8.rom = new Uint8Array(buffer);
			});
		});
	},

	loop: function () {
		var opcode = memory[pc] << 8 | memory[pc + 1];

		// Read opcode first nibble
		switch(opcode & 0xF000) {

		}

		// Each opcode is 2 bytes long
		this.pc = this.pc + 2;

		// Decrement timers
		this.delayTimer--;
		this.soundTimer--;
	},
} 