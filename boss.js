//boss class
/**************************************************
** GAME boss CLASS
**************************************************/
var Boss = function(startX, startY, level, player) {
	var bossImage = new Image();
	bossImage.src = "SpriteSheets/PlayerSprites/afroKidSprite.png";
	var bossImageUp = [{"x":16,"y":1},{"x":16,"y":18},{"x":16,"y":1},{"x":16,"y":35}];
	var bossImageDown = [{"x":0,"y":1},{"x":0,"y":18},{"x":0,"y":1},{"x":0,"y":35}];
	var bossImageRight = [{"x":32,"y":1},{"x":32,"y":18},{"x":32,"y":1},{"x":32,"y":35}];
	var bossImageLeft = [{"x":48,"y":1},{"x":48,"y":18},{"x":48,"y":1},{"x":48,"y":35}];
	//default to the chaser looking down
 	var facing = bossImageDown;
	//separate time for update to go with rate
	var time = 0;
	var rate = 5;
	//for the frames
	var frame = 0;
	//the size of the sprite
	var tileSize = 48;
	//scale the person to 48 (16*3) pixels with this
	var scale = 3;
	var size = tileSize * scale;
	var x = startX;
	var y = startY;
	var prevX;
	var prevY;
	var drawX;
	var drawY;
	var prevPlayerX = player.getX();
	var prevPlayerY = player.getY();
	var fullHealth = 2000;
	var health = fullHealth;
	//the previous behavior. used to reset path between behavior changes
	var pastBehavior = '';

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var getSize = function() {
		return size;
	};

	var getHealth = function() {
		return health;
	};

	var getFullHealth = function() {
		return fullHealth;
	};

    var getLeader = function() {
        return false;
    };

	var setFullHealth = function(newHealth) {
		fullHealth = newHealth;
	};

	var setHealth = function(newHealth) {
		health = newHealth;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var setSize = function(newSize) {
		size = newSize;
	};

	// Update boss position
	var update = function(enemies) {
		prevX = x;
		prevY = y;
	};

	// Draw boss
	var draw = function(ctx) {
		//so the way this works. we only want to change the frame every 5th time draw is
		//called. otherwise it goes through supppperr quick. which is bad.
		//so only change the frame every rate times per draw called.
		frame = frame + 1;
		if(frame % rate === 0) {
			drawX = facing[frame % facing.length].x;
			drawY = facing[frame % facing.length].y;
		}
		// got too big. make it small.
		if (frame > 7500) {
			frame = 0;
		}
		ctx.drawImage(bossImage, drawX, drawY, tileSize, tileSize, Math.round(x - (size / 2)), Math.round(y - (size / 2)), size, size);
		if (health < fullHealth) {
			var percent = health / fullHealth;
			// ratio in relation to the size of the character
			var pixelWidth = percent * size;
			// tinker with this number if we want
			var pixelHeight = 30;
			// top side then the height and a padding of 2
			var healthY = y - (size / 2) - pixelHeight - 2;
			// just the left side of the sprite
			var healthX = x - (size / 2);
			if (percent < 0.25) {
				ctx.fillStyle = '#ff0000';
			} else if (percent < 0.75) {
				ctx.fillStyle = '#ffff00';
			} else {
				ctx.fillStyle = '#006400';
			}
			ctx.fillRect(healthX, healthY, pixelWidth, pixelHeight);
		}
	};

  //DISTANCE

	//used in checking if player is in range
	//calculates the euclidean distance between chaser and the x and y provided
	var distance = function(x1, y1, x2, y2){
		return Math.sqrt(Math.abs((x2 - x1) * (x2 - x1) + (y2 - y1)
			* (y2 - y1)));
	};


	// manhattan distance. used in aStar and in resetting the path.
	var manDistance = function(x1, y1, x2, y2) {
		return Math.abs(x2 - x1) + Math.abs(y2 - y1);
	};

  //TILE INFO

  //return the tile given pixel coordinates
	var getTile = function(x0, y0){
		var tileX = Math.floor(x0 / 48.0);
		var tileY = Math.floor(y0 / 48.0);
		if(tileX < 0 || tileX > level[0].length || tileY < 0 || tileY > level.length){
			return null;
		}
		return {"x": tileX, "y": tileY};
	};

	// based on tile coordinates return the tile's number
	var getLevelTile = function(x0, y0){
		if(x0 < 0 || x0 > level[0].length || y0 < 0 || y0 > level.length){
			return null;
		}
		return level[y0][x0];
	};

	//gets the center of the tile obj passed in.
	var getPixel = function(tile){
		var tempX = (tile.x * 48) + 24;
		var tempY = (tile.y * 48) + 24;
		return {"x": tempX, "y": tempY};
	};

	//based on tile coordinates does a slightly better check. Used in jump point search.
	var isBlocked = function(checkX, checkY) {
		if(checkX < 0 || checkX > level[0].length || checkY < 0 || checkY > level.length){
			return true;
		}
		if(level[checkY][checkX] > 10){
			return true;
		}
		else{
			return false;
		}
	};

  //PATHFINDING
	//if an array contains an object. The object is a tile.
	var contains = function(arr, obj){
		for(var j = 0; j < arr.length; j++){
			if(arr[j].x === obj.x && arr[j].y === obj.y){
				return true;
			}
		}
		return false;
	};
    
	var walkable = function(point1, point2){
		//get the middle of the tile
		var start = getPixel(point1);
		var end = getPixel(point2);
		//doing vector stuff here
		var vec = {"x": end.x - start.x, "y": end.y - start.y};
		var vecLength = Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
		var uX = vec.x / vecLength;
		var uY = vec.y / vecLength;
		var dist = 0;
		while(dist < vecLength){
			var checkPixelX = start.x + (dist * uX);
			var checkPixelY = start.y + (dist * uY);
			//get the corners
			var topY = checkPixelY - (size / 2) + 1;
			var bottomY = checkPixelY + (size / 2) - 1;
			var leftX = checkPixelX - (size / 2) + 1;
			var rightX = checkPixelX + (size / 2) - 1;
			//get the tiles for the corners and the middle
			var topLeft = getTile(leftX, topY);
			var topRight = getTile(rightX, topY);
			var bottomLeft = getTile(leftX, bottomY);
			var bottomRight = getTile(rightX, bottomY);
			var middle = getTile(checkPixelX, checkPixelY);
			//if any of those intersect don't take the line
			if(isBlocked(topLeft.x, topLeft.y) || isBlocked(topRight.x, topRight.y) || isBlocked(bottomLeft.x, bottomLeft.y) || isBlocked(bottomRight.x, bottomRight.y) ||
			isBlocked(middle.x, middle.y)){
				return false;
			}
			//checking every 8 pixels along the line
			dist = dist + 8;
		}
		//the whole line was tested. we gucci
		return true;
	};

  // Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		getSize: getSize,
		getHealth: getHealth,
        getLeader: getLeader,
		getFullHealth: getFullHealth,
		setFullHealth: setFullHealth,
		setX: setX,
		setY: setY,
		setSize: setSize,
		setHealth: setHealth,
		update: update,
		draw: draw
	}
};