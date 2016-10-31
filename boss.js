//boss class
/**************************************************
** GAME boss CLASS
**************************************************/
var Boss = function(game, startX, startY, level, player) {
	var bossImage = new Image();
	//bossImage.src = "SpriteSheets/EnemySprites/bossSprite.png";
	bossImage.src = "SpriteSheets/EnemySprites/bossTemp.png";
	var bossImageUp = [{"x":59,"y":4},{"x":59,"y":53},{"x":59,"y":102},{"x":59,"y":151},{"x":59,"y":200},
	{"x":59,"y":249},{"x":59,"y":298},{"x":59,"y":347},{"x":59,"y":396},{"x":59,"y":445}];
	var bossImageDown = [{"x":10,"y":4},{"x":10,"y":53},{"x":10,"y":102},{"x":10,"y":151},{"x":10,"y":200},
	{"x":10,"y":249},{"x":10,"y":298},{"x":10,"y":347},{"x":10,"y":396},{"x":10,"y":445}];
	var bossImageRight =[{"x":147,"y":4},{"x":147,"y":53},{"x":147,"y":102},{"x":147,"y":151},{"x":147,"y":200},
	{"x":147,"y":249},{"x":147,"y":298},{"x":147,"y":347},{"x":147,"y":396},{"x":147,"y":445}];
	var bossImageLeft =[{"x":98,"y":4},{"x":98,"y":53},{"x":98,"y":102},{"x":98,"y":151},{"x":98,"y":200},
	{"x":98,"y":249},{"x":98,"y":298},{"x":98,"y":347},{"x":98,"y":396},{"x":98,"y":445}];
	//default to the boss looking down
 	var facing = bossImageLeft;
	//separate time for update to go with rate
	var time = 0;
	var rate = 5;
	//for the frames
	var frame = 0;
	// update the frame
	var frameIndex = 0;
	//the size of the sprite
	var tileSize = 48;
	//scale the person to 48 (16*3) pixels with this
	var scale = 3;
	// how much to draw
	// for up and down
	//var drawWidth = 25;
	// for right and left
	var drawWidth = 48;
	var drawHeight = 42;
		// for when we are checking hit boxes
	// for up and down
	//var width = 25;
	// for right and left
	var width = 48;
	var height = 37;
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

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var getWidth = function() {
		return width * scale;
	};

	var getHeight = function() {
		return height * scale;
	}

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

	// Update boss position
	var update = function(enemies) {

	};

	// Draw boss
	var draw = function(ctx) {
		//so the way this works. we only want to change the frame every 5th time draw is
		//called. otherwise it goes through supppperr quick. which is bad.
		//so only change the frame every rate times per draw called.
		frame = frame + 1;
		if(frame % rate === 0) {
			drawX = facing[frameIndex % facing.length].x;
			drawY = facing[frameIndex % facing.length].y;
			frameIndex++;
		}
		// got too big. make it small.
		if (frame > 7500) {
			frame = 0;
			frameIndex = 0;
		}
		ctx.drawImage(bossImage, drawX, drawY, drawWidth, drawHeight, Math.round(x - (drawWidth * scale / 2)), Math.round(y - (drawHeight * scale / 2)), drawWidth * scale, drawHeight * scale);
		if (health < fullHealth) {
			var percent = health / fullHealth;
			// ratio in relation to the size of the character
			var pixelWidth = percent * width * scale;
			// tinker with this number if we want
			var pixelHeight = 20;
			// top side then the height and a padding of 2
			var healthY = y - (height * scale / 2) - pixelHeight - 2;
			// just the left side of the sprite
			var healthX = x - (width * scale / 2);
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
		getWidth: getWidth,
		getHeight: getHeight,
		getHealth: getHealth,
        getLeader: getLeader,
		getFullHealth: getFullHealth,
		setFullHealth: setFullHealth,
		setX: setX,
		setY: setY,
		setHealth: setHealth,
		update: update,
		draw: draw
	}
};
