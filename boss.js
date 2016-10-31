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
 	var facing = bossImageDown;
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
	var drawWidth = 25;
	// for right and left
	//var drawWidth = 48;
	var drawHeight = 42;
	// for when we are checking hit boxes
	// for up and down
	var width = 25;
	// for right and left
	//var width = 48;
	var height = 37;
	var x = startX;
	var y = startY;
	var path = null;
	var prevX;
	var prevY;
	var drawX;
	var drawY;
	var prevPlayerX = player.getX();
	var prevPlayerY = player.getY();
	// need to tinker with this
	var damage = 3.0;
	// ditto as above
	var moveAmount = 2.0;
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
		path = getSmoothPath(getTile(x, y), getTile(player.getX(), player.getY()));
		followPath();
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

	// returns the path. Uses Jump point to get the neighbors.
	var getSmoothPath = function(start, end){
		//open moves
		var openList = [];
		//can't go back here
		var closedList = [];
		//final steps
		var result = [];
		//starting point
		var current = node(start.x, start.y, null, 0, manDistance(start.x, start.y, end.x, end.y));
		//obviously we can start here
		openList.push(current);
		//if there are open moves keep trying to get places
		while(openList.length > 0){
			//sorts the open list based on the fcost.
			openList.sort(compareFunc);
			current = openList[0];
			//if we are here then stop
			if(current.x === end.x && current.y === end.y) {
				while(current.parent != null){
					result.push(current);
					current = current.parent;
				}
				openList = [];
				closedList = [];
				if(result.length > 0) {
					result.push(getTile(x, y));
					var tempResult = smooth(result);
					tempResult.pop();
					return tempResult;
				} else {
					return result;
				}
			}
			//removes the current element.
			openList.shift();
			//add it to closed list so is not revisited
			closedList.push(current);
			var neighbors = getNeighbors(current);
			for(var i = 0; i < neighbors.length; i++) {
				var neighbor = neighbors[i];
				// Try to find a node to jump to
				var jumpNode = jump(neighbor.x, neighbor.y, current.x, current.y, end);
				if (jumpNode === null || jumpNode === undefined) {
				continue;
				}
				var gCost = current.gCost + manDistance(current.x, current.y, jumpNode.x, jumpNode.y);
				var hCost = manDistance(jumpNode.x, jumpNode.y, end.x, end.y);
				var tempNode = node(jumpNode.x, jumpNode.y, current, gCost, hCost);
				if(contains(closedList, tempNode)){
					continue;
				}
				//var jumpNodeGCost = manDistance(start.x, start.y, jumpNode.x, jumpNode.y);
				//if (!contains(openList, tempNode) || gCost < jumpNodeGCost) {
				if (!contains(openList, tempNode)) {
					openList.push(tempNode);
				}
			}
		}
		//has failed
		return null;
	};

	//once the path has been set in update follow it.
	var followPath = function() {
		if (path !== null && path !== undefined) {
			var len = path.length - 1;
			//check to see if the length is legit. and that some gobble-de-gook didn't get in the path
			if(len > -1 && path[len] !== undefined) {
				if(len < 2) {
					if (manDistance(player.getX(), player.getY(), x, y) < 56) {
						player.setHealth(player.getHealth() - damage);
					}
				}
				var tempTile = getPixel(path[len]);
				// super small stuff won't affect the movement
				var smallXCheck = Math.abs(x - tempTile.x) > 1;
				if (x < tempTile.x && smallXCheck) {
					x += moveAmount;
					facing = bossImageRight;
					drawWidth = 48;
					width = 48;
				} else if (x > tempTile.x && smallXCheck) {
					x -= moveAmount;
					facing = bossImageLeft;
					drawWidth = 48;
					width = 48;
				}
				var smallYCheck = Math.abs(y - tempTile.y) > 1;
				// if elseif so it can't do both in the same update cycle
				if (y < tempTile.y && smallYCheck) {
					y += moveAmount;
					facing = bossImageDown;
					drawWidth = 25;
					width = 25;
				} else if (y > tempTile.y && smallYCheck) {
					y -= moveAmount;
					facing = bossImageUp;
					drawWidth = 25;
					width = 25;
				}
				// if we hit the tile we are going to then remove it from the path
				// used to be moveamount
				if (Math.abs(x - tempTile.x) < 24 && Math.abs(y - tempTile.y) < 24) {
					path.pop();
				}
			} else {
				if (manDistance(player.getX(), player.getY(), x, y) < 56) {
					player.setHealth(player.getHealth() - damage);
				}
			}
		} else {
			if (manDistance(player.getX(), player.getY(), x, y) < 56) {
				player.setHealth(player.getHealth() - damage);
			}
		}
	};

  //DISTANCE

	//used in checking if player is in range
	//calculates the euclidean distance between boss and the x and y provided
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

  // this is used to sort the open list. Get the best fcost
	var compareFunc = function(first, second){
		if(second.fCost < first.fCost){
			return 1;
		}
		if(second.fCost > first.fCost){
			return -1;
		}
		return 0;
	};


  //just returns a node object
	var node = function(tileX, tileY, parent, gCost, hCost)
	{
		var temp = {
			"x": tileX,
			"y": tileY,
			"parent": parent,
			"gCost": gCost,
			"hCost": hCost,
			"fCost": gCost + hCost,
		};
		return temp;
	};

	//get the neighbors (either normal cardinal or based on parent)
	var getNeighbors = function(current) {
		var neighbors = [];
		// directed pruning: can ignore most neighbors, unless forced.
		if (current.parent) {
			var px = current.parent.x;
			var py = current.parent.y;
			// get the normalized direction of travel
			var dx = (current.x - px) / Math.max(Math.abs(current.x - px), 1);
			var dy = (current.y - py) / Math.max(Math.abs(current.y - py), 1);

			if (dx !== 0) {
				if (!isBlocked(current.x, current.y - 1)) {
					neighbors.push({"x": current.x, "y": current.y - 1});
				}
				if (!isBlocked(current.x, current.y + 1)) {
					neighbors.push({"x": current.x, "y": current.y + 1});
				}
				if (!isBlocked(current.x + dx, current.y)) {
					neighbors.push({"x": current.x + dx, "y": current.y});
				}
			}
			else if (dy !== 0) {
				if (!isBlocked(current.x - 1, current.y)) {
					neighbors.push({"x": current.x - 1, "y": current.y});
				}
				if (!isBlocked(current.x + 1, current.y)) {
					neighbors.push({"x": current.x + 1, "y": current.y});
				}
				if (!isBlocked(current.x, current.y + dy)) {
					neighbors.push({"x": current.x, "y": current.y + dy});
				}
			}
		}
		// return all neighbors
		else {
			var neighborX = current.x - 1;
			var neighborY = current.y;
			if(!isBlocked(neighborX, neighborY)) {
				neighbors.push({"x": neighborX, "y": neighborY});
			}
			neighborX = current.x + 1;
			neighborY = current.y;
			if(!isBlocked(neighborX, neighborY)) {
				neighbors.push({"x": neighborX, "y": neighborY});
			}
			neighborX = current.x ;
			neighborY = current.y - 1;
			if(!isBlocked(neighborX, neighborY)) {
				neighbors.push({"x": neighborX, "y": neighborY});
			}
			neighborX = current.x;
			neighborY = current.y + 1;
			if(!isBlocked(neighborX, neighborY)) {
				neighbors.push({"x": neighborX, "y": neighborY});
			}
		}
		return neighbors;
	};

	//the jump point search. sees how far it can go along one direction.
	var jump = function(currentX, currentY, parentX, parentY, end) {
		var directionX = currentX - parentX;
		var directionY = currentY - parentY;
		if(isBlocked(currentX, currentY)) {
			return null;
		}
		if (currentX === end.x && currentY === end.y) {
			return {"x": currentX, "y": currentY};
		}

		if (directionX !== 0) {
				if ((!isBlocked(currentX, currentY - 1) &&
						 isBlocked(currentX - directionX, currentY - 1)) ||
						(!isBlocked(currentX, currentY + 1) &&
						 isBlocked(currentX - directionX, currentY + 1))) {
							 return {"x": currentX, "y": currentY};
				}
		}
		else if (directionY !== 0){
			if ((!isBlocked(currentX - 1, currentY) &&
					 isBlocked(currentX - 1, currentY - directionY)) ||
					(!isBlocked(currentX + 1, currentY) &&
					 isBlocked(currentX + 1, currentY - directionY))) {
						  return {"x": currentX, "y": currentY};
			}
			if(jump(currentX + 1, currentY, currentX, currentY, end) !== null || jump(currentX - 1, currentY, currentX, currentY, end) !== null) {
				return {"x": currentX, "y": currentY};
			}
		}
		return jump(currentX + directionX, currentY + directionY, currentX, currentY, end);
	};

	//smooth out the turns for the astar
	//add old so the whole line isnt checked every time
	var smooth = function(arr){
		//initial check
		var checkPoint = arr[0];
		var i = 1;
		//the point to see if can be removed
		var currentPoint = arr[i];
		//while we don't go past the array
		while(arr[i + 1] !== null && arr[i + 1] !== undefined){
			//checks the vector between the points
			if(walkable(checkPoint, arr[i + 1])){
				//keep checking along the line
				currentPoint = arr[i + 1];
				//get rid of the old point
				arr.splice(i, 1);
			}
			else {
				//otherwise that's the best we can smooth that section. next section now
				checkPoint = currentPoint;
				currentPoint = arr[i + 1];
				i = i + 1;
			}
		}
		return arr;
	};

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
			var topY = checkPixelY - (height / 2) + 1;
			var bottomY = checkPixelY + (height / 2) - 1;
			var leftX = checkPixelX - (width / 2) + 1;
			var rightX = checkPixelX + (width / 2) - 1;
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
