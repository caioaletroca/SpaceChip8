var chip8 = function() {

	this.displayWidth = 64;
	this.displayHeight = 32;

	this.running = null;
	this.renderer = null;

	this.rom = [];

	this.reset();
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

		// Clear display
		this.display = zeros([ this.displayHeight, this.displayWidth ]);
	},

	start: function() {
		this.running = true;

		var self = this;
		requestAnimFrame(function me() {
			for (var i = 0; i < 10; i++) {
				if(self.running) {
					self.emulateCycle();
				}
			}

			if(self.drawFlag) {
				self.renderer.render(self.display);
				self.drawFlag = false;
			}

			requestAnimFrame(me);
		});
	},

	stop: function() {
		this.running = false;
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

	emulateCycle: function () {
		var opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1];

		var x = (opcode & 0x0F00);
		var y = (opcode & 0x00F0);

		// Read opcode first nibble
		switch(opcode & 0xF000) {
			case 0x0000:
				switch(opcode) {
					case 0x00E0: // CLS
						this.renderer.clear();
						this.display = zeros([ this.displayHeight, this.displayWidth ]);
						break;

					case 0x00EE // Ret
						this.pc = stack[--this.sp];
						break;
				}
				break;

			case 0x1000: // JP addr
				this.pc = opcode & 0x0FFF;
				break;

			case 0x2000: // Call addr
				stack[this.sp++] = this.pc;
				this.pc = opcode & 0x0FFF;

			case 0x3000: // SE Vx, byte
				if(this.v[x] === opcode & 0x00FF)
					this.pc += 2;
				break;

			case 0x4000: // SNE Vx, byte
				if(this.v[x] != opcode & 0x00FF)
					this.pc += 2;
				break;

			case 0x5000: // SE Vx, Vy
				if(this.v[x] === this.v[y])
					this.pc += 2;
				break;

			case 0x6000: // LD Vx, byte
				this.v[x] = opcode & 0x00FF;
				break; 

			case 0x7000: // Add Vx, byte
				var value = this.v[x] + opcode & 0x00FF;

				if(value > 255)
					value -= 255

				this.v[x] = value;
				break;

			case 8:
				// Search by last byte
				switch(opcode % 0xF00F){
					case 0x8000: // LD Vx, Vy
						this.v[x] = this.v[y];
						break;

					case 0x8001: // OR Vx, Vy
						this.v[x] |= this.v[y];
						break;

					case 0x8002: // AND Vx, Vy
						this.v[x] &= this.v[y];
						break;

					case 0x8003: // XOR Vx, Vy
						this.v[x] ^= this.v[y];
						break;

					case 0x8004: // Add Vx, Vy
						var value = this.v[x] + this.v[y];

						this.v[15] = (value > 255) ? 1 : 0;

						if(value > 255)
							value -= 255;

						this.v[x] = value;
						break;

					case 0x8005: // Sub Vx, Vy
						var value = this.v[x] - this.v[y];

						this.v[15] = (this.v[x] > this.v[y]) ? 1 : 0;

						if(value < 0)
							value += 255;

						this.v[x] = value;
						break;

					case 0x8006: // SHR Vx {, Vy}
						this.v[15] = (this.v[x] & 0x0001 == 0x0001) ? 1 : 0;
						this.v[x] = this.v[x] / 2;
						break;

					case 0x8007: // SUBN Vx, Vy
						var value = this.v[y] - this.v[x];

						this.v[15] = (this.v[y] > this.v[x]) ? 1 : 0;

						if(value < 0)
							value += 255;

						this.v[y] = value;
						break;

					case 0x8006: // SHR Vx {, Vy}
						this.v[15] = (this.v[x] & 0x0001 == 0x0001) ? 1 : 0;
						this.v[x] = this.v[x] / 2;
						break;
				}
				break;

			case 0x9000: // SNE Vx, Vy
				if(this.v[x] != this.v[y])
					this.pc += 2;
				break;

			case 0xA000: // LD I, addr
				this.i = opcode & 0x0FFF;
				break;

			case 0xB000: // JP V0, addr
				this.pc = opcode & 0x0FFF + this.v[0];
				break;

			case 0xC000: // RND Vx, byte
				
				break;

			case 0xD000: // DRW Vx, Vy, nibble
				this.i = opcode & 0x0FFF;
				break;

			case 0xA000: // LD I, addr
				this.i = opcode & 0x0FFF;
				break;

			default:
				throw new Error("Unknown opcode " + opcode.toString(16) + " passed.");
		}

		// Each opcode is 2 bytes long
		this.pc = this.pc + 2;

		// Decrement timers
		this.delayTimer--;
		this.soundTimer--;
	},
} 