//particles class
/**************************************************
** GAME particles CLASS
**************************************************/
var particle = function(startX, startY, l, col, vel) {
	var x = startX;
	var y = startY;
	//randomize how much life each particle in the emitter actually has
	var originalLife = l + Math.random() * 15 - 10;
	var tempLife;
	// hex string hopefully
	var time = 0;
	// radius of the particle. tinker with number
	var radius = 10;

	var toRemove = false;
	var normal = normalize(vel);
	var getToRemove = function() {
		return toRemove;
	};

	//normalize a vector
	var normalize = function(vec) {
		var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
		return {"x": vec.x / len, "y": vec.y / len};
	};

	var update = function() {
		time++;
		if (time > life) {
			toRemove = true;
			return;
		}
		if (time > 7500) {
			time = 0;
		}
		tempLife = originalLife - time;
		x += normal.x;
		y += normal.y;
	};

	var draw = function(context) {
		context.fillStyle = col;
		context.globalAlpha = tempLife / originalLife;
		// draw a circle centered on the particle's location, sized to the particle
		context.beginPath();
		// center x, center y, radius, start angle, end angle, draw counter clockwise
		context.arc(x, y, radius, 0, Math.PI*2, true);
		context.closePath();
		context.fill();
		context.globalAlpha = 1.0;
	};

  // Define which variables and methods can be accessed
	return {
		getToRemove: getToRemove,
		draw: draw,
		update: update
	}
};
