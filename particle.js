//particles class
/**************************************************
** GAME particles CLASS
**************************************************/
var Particle = function(startX, startY, level, l, col) {

	var gaussian = function(mean, stdev) {
	    var y2;
	    var use_last = false;
	    return function() {
	        var y1;
	        if(use_last) {
	           y1 = y2;
	           use_last = false;
	        }
	        else {
	            var x1, x2, w;
	            do {
	                 x1 = 2.0 * Math.random() - 1.0;
	                 x2 = 2.0 * Math.random() - 1.0;
	                 w  = x1 * x1 + x2 * x2;
	            } while( w >= 1.0);
	            w = Math.sqrt((-2.0 * Math.log(w))/w);
	            y1 = x1 * w;
	            y2 = x2 * w;
	            use_last = true;
	       }

	       var retval = mean + stdev * y1;
	       if(retval > 0) {
	           return retval;
				 }
	       return -retval;
	   }
	};
	 var standard = gaussian(0, 1);
	 var xa = standard();
	 var ya = standard();
	 var za = 0;
	 var x = startX;
 	 var y = startY;
	 var z = Math.random() + 2.0;

	//randomize how much life each particle in the emitter actually has
	var originalLife = l + Math.random() * 15 - 10;
	var tempLife;
	var time = 0;
	// radius of the particle. tinker with number
	var radius = 3;

	var toRemove = false;

	/*//normalize a vector
	var normalize = function(vec) {
		var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
		return {"x": vec.x / len, "y": vec.y / len};
	};*/

	//var normal = normalize(vel);
	var getToRemove = function() {
		return toRemove;
	};

	var update = function() {
		time++;
		if (time > originalLife) {
			toRemove = true;
			return;
		}
		if (time > 7500) {
			time = 0;
		}
		tempLife = originalLife - time;
		za = za - 0.1;
		if (z < 0) {
        z = 0;
        // change direction of particles
        xa = xa * 0.4;
        ya = ya * 0.4;
		za = za * -0.55;
    }
		if (collision(x + xa, y + ya + z + za)) {
			xa = xa * -0.5;
			ya = ya * -0.5;
			za = za * -0.5;
		}
		x = x + xa;
	 	y = y + ya;
	 	z = z + za;
		//x += normal.x;
		//y += normal.y;
	};

	var getTile = function(x0, y0){
		var tileX = Math.floor(x0/48.0);
		var tileY = Math.floor(y0/48.0);
		return {x: tileX, y: tileY};
	};

	var collision = function(x0, y0) {
		var tile = getTile(x0, y0);
		if(level[tile.y][tile.x] > 10 && level[tile.y][tile.x] < 100){
			return true;
		}
		else{
			return false;
		}
	};

	var draw = function(context) {
		context.fillStyle = col;
		context.globalAlpha = tempLife / originalLife;
		// draw a circle centered on the particle's location, sized to the particle
		context.beginPath();
		// center x, center y, radius, start angle, end angle, draw counter clockwise
		context.arc(x - 2, y - z - 1, radius, 0, Math.PI*2, true);
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
