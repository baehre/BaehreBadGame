//particles class
/**************************************************
** GAME particles CLASS
**************************************************/
var emitter = function(game, startX, startY, amount, life, color, velocity) {
	var x = startX;
	var y = startY;
    var toRemove = false;

    for (var j = 0; j < amount; j++) {
        particles.push(new Particle(x, y, life, color, velocity));
    }

    var particles = [];

    var getX = function() {
        return x;
    };
    
    var setX = function(newX) {
        x = newX;
    };

    var getY = function() {
        return y;
    };

    var setY = function(newY) {
        y = newY;
    };

    var getToRemove = function() {
        return toRemove;
    };

    var getProjectiles = function() {
        return particles;
    };

    var setProjectiles = function() {
        return particles;
    };

    var update = function() {
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
        }
    };

    var draw = function(context) {
        for (var i = 0; i < particles.length; i++) {
            if(particles[i].getToRemove()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw(context);
            }
        }
        if (particles.length === 0) {
            toRemove = true;
        }
    };

  // Define which variables and methods can be accessed
	return {
        getX: getX,
        setX: setX,
        getY: getY,
        setY: setY,
        getToRemove: getToRemove,
        getProjectiles: getProjectiles,
        setProjectiles: setProjectiles,
        draw: draw,
        update: update
	}
};
