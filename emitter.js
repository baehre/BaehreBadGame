//particles class
/**************************************************
** GAME particles CLASS
**************************************************/
var emitter = function(game, startX, startY) {
	var x = startX;
	var y = startY;
    var particles = [];

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
            particles[i].draw(context);
        }
    };

  // Define which variables and methods can be accessed
	return {
        getProjectiles: getProjectiles,
        setProjectiles: setProjectiles
	}
};
