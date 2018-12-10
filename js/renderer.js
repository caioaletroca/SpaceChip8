var CanvasRenderer = function(canvas, width, height, cellSize, fgColor, bgColor) {
	this.context = canvas.getContext("2d");
	this.canvas = canvas;
	this.width = +width;
	this.height = +height;
	this.lastRenderedData = [];
	this.lastRender = 0;
	this.draws = 0;
	this.setCellSize(cellSize);

	this.fgColor = fgColor || "#0f0";
	this.bgColor = bgColor || "transparent";

	this.audioContext = null;

}

CanvasRenderer.prototype = {
	clear: function() {
		this.context.clearRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
	},

	render: function(display) {
		this.clear();
		this.lastRenderedData = display;
		var x, y;
		for(var i = 0; i < display.length; i++) {
			for (var j = 0; j < display[0].length; j++) {
				x = j * this.cellSize;
				y = i * this.cellSize;

				this.context.fillStyle = [this.bgColor, this.fgColor][display[i][j]];
				this.context.fillRect(x, y, this.cellSize, this.cellSize);
			}
		}

		this.draws++;
	},

	setCellSize(cellSize) {
		this.cellSize = +cellSize;

		this.canvas.width = cellSize * this.width;
		this.canvas.height = cellSize * this.height;

		this.render(this.lastRenderedData);
	},

	getFps: function() {
		var fps = this.draws / (+new Date - this.lastRender)
		if(fps == Infinity)
			return 0;

		this.draws = 0;
		this.lastRender = +new Date;
		return fps * 1000;
	}
}