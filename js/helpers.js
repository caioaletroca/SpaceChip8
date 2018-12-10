window.requestAnimFrame = (function() {
	return 	window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame ||
	        window.oRequestAnimationFrame ||
	        window.msRequestAnimationFrame ||
	        function (callback) {
	        	window.setTimeout(callback, 0);
	        }
})();

function zeros(dimensions) {
	var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}