//particles class
/**************************************************
** GAME particles CLASS
**************************************************/
var particle = function(startX, startY, game) {
	var x = startX;
	var y = startY;
	var life = 0;
	var velocity = {"x": 0, "y": 0};

	var getVelocity = function() {
		return velocity;
	};

	var setVelocity = function(angle, speed) {
		var rad =  Math.PI * angle / 180;
		velocity.x = Math.cos(rad) * speed;
		velocity.y = -Math.sin(rad) * speed;
	};

	var getLife = function() {
		return life;
	};

	var setLife = function(newLife) {
		life = newLife;
	};

  // Define which variables and methods can be accessed
	return {
		getVelocity: getVelocity,
		setVelocity: setVelocity,
		getLife: getLife,
		setLife: setLife,
	}
};
