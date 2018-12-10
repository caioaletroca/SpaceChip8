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
		// The program counter starts at 0x200, as
		// that is the start location of the program.
		this.pc = 0x200;

		// Memory
		this.memory = new Uint8Array(new ArrayBuffer(0x1000));

		var hexChars = [
			0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
			0x20, 0x60, 0x20, 0x20, 0x70, // 1
			0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
			0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
			0x90, 0x90, 0xF0, 0x10, 0x10, // 4
			0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
			0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
			0xF0, 0x10, 0x20, 0x40, 0x40, // 7
			0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
			0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
			0xF0, 0x90, 0xF0, 0x90, 0x90, // A
			0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
			0xF0, 0x80, 0x80, 0x80, 0xF0, // C
			0xE0, 0x90, 0x90, 0x90, 0xE0, // D
			0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
			0xF0, 0x80, 0xF0, 0x80, 0x80 // F
		];

		for (i = 0; i < hexChars.length; i++) {
			this.memory[i] = hexChars[i];
		}

		// Stack
		this.stack = new Array(16);

		// Stack Pointer
		this.sp = 0;

		// V registers
		this.v = zeros([ 16 ]);

		// I Registers
		this.i = 0;

		// Delay timer
		this.delayTimer = 0;

		// Sound timer
		this.soundTimer = 0;

		// Key Pads
		this.key = {};

		this.step = 0;
		this.running = false;

		// Clear display
		this.display = zeros([ this.displayHeight, this.displayWidth ]);
	},

	start: function() {

		if (!this.renderer) {
             throw new Error("You must specify a renderer.");
         }

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

			if(!(self.step++ % 2)) {
				self.handleTimers();
			}

			requestAnimFrame(me);
		});
	},

	stop: function() {
		this.running = false;
	},

	handleTimers: function() {
		if(this.delayTimer > 0)
			this.delayTimer--;

		if(this.soundTimer > 0) {
			if(this.soundTimer == 1)
				console.log("Beep");
			this.soundTimer--;
		}
	},

	openRom: function (path) {
		fetch(path, { 
			method: 'GET',
	  		mode: 'no-cors',
		}).then(function (response) {
			response.arrayBuffer().then(function(buffer) {
				// Load File as a binary array
				//console.log(this);
				this.reset();
				this.rom = new Uint8Array(buffer);
				for(var i = 0; i < this.rom.length; i++)
					this.memory[i + 0x0200] = this.rom[i];
				this.start();
			}.bind(this));
		}.bind(this));
	},

	setKey: function(key) {
		this.key[key] = 1;
	},

	setPixel: function(x, y) {
		if(x > this.displayWidth)
			x -= this.displayWidth;
		else if (x < 0)
			x += this.displayWidth;

		if(y > this.displayHeight)
			y -= this.displayHeight;
		else if (y < 0)
			y += this.displayHeight;

		this.display[x, y] ^= 1;

		return !this.display[x, y];
	},

	emulateCycle: function () {
		var opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1];

		var x = (opcode & 0x0F00) >> 8;
		var y = (opcode & 0x00F0) >> 4;

		console.log(opcode.toString(16));

		// Each opcode is 2 bytes long
		this.pc += 2;

		// Read opcode first nibble
		switch(opcode & 0xF000) {
			case 0x0000:
				switch(opcode) {
					case 0x00E0: // CLS
						this.renderer.clear();
						this.display = zeros([ this.displayHeight, this.displayWidth ]);
						break;

					case 0x00EE: // Ret
						this.pc = this.stack[--this.sp];
						break;
				}
				break;

			case 0x1000: // JP addr
				this.pc = (opcode & 0x0FFF);
				break;

			case 0x2000: // Call addr
				this.stack[this.sp++] = this.pc;
				this.pc = (opcode & 0x0FFF);
				break;

			case 0x3000: // SE Vx, byte
				if(this.v[x] == (opcode & 0x00FF))
					this.pc += 2;
				break;

			case 0x4000: // SNE Vx, byte
				if(this.v[x] != (opcode & 0x00FF))
					this.pc += 2;
				break;

			case 0x5000: // SE Vx, Vy
				if(this.v[x] == this.v[y])
					this.pc += 2;
				break;

			case 0x6000: // LD Vx, byte
				this.v[x] = (opcode & 0x00FF);
				break; 

			case 0x7000: // Add Vx, byte
				var value = this.v[x] + (opcode & 0x00FF);

				if(value > 255)
					value -= 255

				this.v[x] = value;
				break;

			case 0x8000:
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
							value -= 256;

						this.v[x] = value;
						break;

					case 0x8005: // Sub Vx, Vy
						var value = this.v[x] - this.v[y];

						this.v[15] = (this.v[x] > this.v[y]) ? 1 : 0;

						if(value < 0)
							value += 256;

						this.v[x] = value;
						break;

					case 0x8006: // SHR Vx {, Vy}
						this.v[15] = (this.v[x] & 0x0001 == 0x0001) ? 1 : 0;
						this.v[x] >>= 1;
						break;

					case 0x8007: // SUBN Vx, Vy
						var value = this.v[y] - this.v[x];

						this.v[15] = (this.v[y] > this.v[x]) ? 1 : 0;

						if(value < 0)
							value += 256;

						this.v[y] = value;
						break;

					case 0x800E: // SHR Vx {, Vy}
						this.v[15] = (this.v[x] & 0x80) ? 1 : 0;
						this.v[x] <<= 1;
						if(this.v[x] > 255)
							this.v[x] -= 256;
						break;
				}
				break;

			case 0x9000: // SNE Vx, Vy
				if(this.v[x] != this.v[y])
					this.pc += 2;
				break;

			case 0xA000: // LD I, addr
				this.i = (opcode & 0x0FFF);
				break;

			case 0xB000: // JP V0, addr
				this.pc = (opcode & 0x0FFF) + this.v[0];
				break;

			case 0xC000: // RND Vx, byte
				this.v[x] = Math.floor(Math.random() * 0xFF) & (opcode & 0xFF);
				break;

			case 0xD000: // DRW Vx, Vy, nibble
				this.v[15] = 0;

				var height = (opcode & 0x000F);
				var vX = this.v[x];
				var vY = this.v[y];
				var spr;
				for(var y = 0; x < height; y++) {
					spr = this.memory[this.i + y];
					for(var x = 0; x < 8; x++) {
						if(spr & 0x80 > 0) 
							if(this.setPixel(vX + x, vY + y))
								this.v[15] = 1;
						spr <<= 1;
					}
				}
				this.drawFlag = true;
				break;

			case 0xE000:
				switch(opcode & 0xF0FF) {
					case 0xE09E: // SKP Vx
						if(this.key[this.v[x]])
							this.pc += 2;
						break;

					case 0xE0A1: // SKNP Vx
						if(!this.key[this.v[x]])
							this.pc += 2;
						break;
				}
				break;

			case 0xF000:
				switch(opcode & 0xF0FF) {
					case 0xF007: // LD Vx, DT
						this.v[x] = this.delayTimer;
						break;

					case 0xF00A: // LD Vx, K
						var oldKeyDown = this.setKey;

						this.setKey = function(key) {
							this.v[x] = key;

							this.setKey = oldKeyDown.bind(this);
							this.setKey(key);

							this.start();
						}.bind(this);

						this.stop();
						break;

					case 0xF015: // LD DT, Vx
						this.delayTimer = this.v[x];
						break;

					case 0xF018: // LD ST, Vx
						this.soundTimer = this.v[x];
						break;

					case 0xF01E: // ADD I, Vx
						this.i += this.v[x];

						if(this.i > 255)
							this.i -= 256;

						break;

					case 0xF029: // LD F, Vx
						this.i = this.v[x] * 5;
						break;

					case 0xF033: // LD B, Vx
						var number = this.v[x];

						for(var i = 3; i > 0; i--) {
							this.memory[this.i + i - 1] = parseInt(number % 10);
							number /= 10;
						}
						break;

					case 0xF055: // LD [I], Vx
						for(var i = 0; i < x; i++)
							this.memory[this.i + i] = this.v[i];
						break;

					case 0xF065: // LD Vx, [i]
						for(var i = 0; i < x; i++)
							this.v[i] = this.memory[this.i + i];
						break;
				}
				break;

			default:
				throw new Error("Unknown opcode " + opcode.toString(16) + " passed.");
		}
	},
} 