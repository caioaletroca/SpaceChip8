var CanvasRenderer = function(canvas, width, height, cellSize, fgColor, bgColor) {
	this.context = canvas.getContext("2d");
	this.canvas = canvas;
	this.width = +width;
	this.height = +height;
	this.cellSize = cellSize;

	this.fgColor = fgColor || "#0f0";
	this.bgColor = bgColor || "transparent";

}

CanvasRenderer.prototype = {
	clear: function() {
		this.context.clearRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
	},

	render: function(display) {
		console.log("Deu bom");

		var x, y;
		for(var i = 0; i < display.length; i++) {
			for (var j = 0; j < display[0].length; j++) {
				x = j * this.cellSize;
				y = i * this.cellSize;

				this.context.fillStyle = [this.bgColor, this.fgColor][display[i, j]];
				this.context.fillRect(x, y, this.cellSize, this.cellSize);
			}
		}
	},
}