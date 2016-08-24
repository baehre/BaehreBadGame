//chaser class
/**************************************************
** GAME chaser CLASS
**************************************************/
var Chaser = function(startX, startY, level, player) {
	var chaserImage = new Image();
	chaserImage.src = "SpriteSheets/PlayerSprites/gentlemanSprite.png";
	var chaserImageUp = [{"x":16,"y":1},{"x":16,"y":18},{"x":16,"y":1},{"x":16,"y":35}];
	var chaserImageDown = [{"x":0,"y":1},{"x":0,"y":18},{"x":0,"y":1},{"x":0,"y":35}];
	var chaserImageRight = [{"x":32,"y":1},{"x":32,"y":18},{"x":32,"y":1},{"x":32,"y":35}];
	var chaserImageLeft = [{"x":48,"y":1},{"x":48,"y":18},{"x":48,"y":1},{"x":48,"y":35}];
	//default to the chaser looking down
 	var facing = chaserImageDown;
	//separate time for update to go with rate
	var time = 0;
	var rate = 5;
	//for the frames
	var frame = 0;
	var tempX = 0;
	var tempY = 0;
	//the size of the sprite
	var tileSize = 16;
	//scale the person to 48 (16*3) pixels with this
	var scale = 3;
	var size = tileSize * scale;
	var x = startX;
	var y = startY;
	var prevPlayerX = player.getX();
	var prevPlayerY = player.getY();
	//make global. for the pathfinding
	var smoothPath = null;
	//how much chaser moves
	var moveAmount = 1.5;
	var damage = 10;
	var health = 100;

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
	}

	var setHealth = function(newHealth) {
		health = newHealth;
	}

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var setSize = function(newSize) {
		size = newSize;
	};

	// Update chaser position
	var update = function() {
		if(smoothPath === null) {
			var path = getPath(getTile(x, y), getTile(player.getX(), player.getY()));
			if(path !== null){
				if (path.length > 0) {
					path.push(getTile(x, y));
					smoothPath = smooth(path);
					smoothPath.pop();
				}
				else {
					smoothPath = path;
				}
			}
			else {
				smoothPath = null;
			}
		}
		time = time + 1;
		if (time > 7500) {
			time = 0;
		}
		// Previous position
		var prevX = x;
		var	prevY = y;
		//like an a-star algo
		if(distance(player.getX(), player.getY(), x, y) < 900){
			// if the player has moved update the path. and update the previous position
			if ((prevPlayerX !== player.getX() || prevPlayerY !== player.getY())) {
				prevPlayerX = player.getX();
				prevPlayerY = player.getY();
				if(smoothPath !== null && smoothPath !== undefined) {
					if(smoothPath.length !== 0 && smoothPath[smoothPath.length - 1] !== undefined) {
						var tempTile = getTile(prevPlayerX, prevPlayerY);
						if(tempTile !== undefined) {
							if(tempTile.x !== smoothPath[0].x || tempTile.y !== smoothPath[0].y) {
								smoothPath.unshift(tempTile);
								smoothPath.push(getTile(x, y));
								smoothPath = smooth(smoothPath);
								smoothPath.pop();
							}
						}
					} else {
						if(tempTile !== undefined) {
							smoothPath.unshift(tempTile);
						}
					}
				}
			}
			if(smoothPath !== null && smoothPath !== undefined){
				var len = smoothPath.length - 1;
				if(len > -1 && smoothPath[len] !== undefined){
					var tempTile = getPixel(smoothPath[len]);
					var smallXCheck = Math.abs(x - tempTile.x) > 1;
					if (x < tempTile.x && smallXCheck) {
						x += moveAmount;
						facing = chaserImageRight;
					} else if (x > tempTile.x && smallXCheck) {
						x -= moveAmount;
						facing = chaserImageLeft;
					}
					var smallYCheck = Math.abs(y - tempTile.y) > 1;
					if (y < tempTile.y && smallYCheck) {
						y += moveAmount;
						facing = chaserImageDown;
					} else if (y > tempTile.y && smallYCheck) {
						y -= moveAmount;
						facing = chaserImageUp;
					}
					if(Math.abs(x - tempTile.x) < moveAmount && Math.abs(y - tempTile.y) < moveAmount) {
						smoothPath.pop();
					}
					// now on same tile adjust for pixel perfect.
				} else {
					if(rectIntersection()) {
						if(time % 1000) {
							player.setHealth(player.getHealth() - damage);
						}
					} else {
						if(x < player.getX()){
							x += moveAmount;
							facing = chaserImageRight;
						} else if(x > player.getX()){
							x -= moveAmount;
							facing = chaserImageLeft;
						}
						if(y < player.getY()){
							y += moveAmount;
							facing = chaserImageDown;
						} else if(y > player.getY()){
							y -= moveAmount;
							facing = chaserImageUp;
						}
					}
				}
			}
		}
		if(prevX === x && prevY === y){
			moving = false;
		}
		else{
			moving = true;
		}
		return moving;
	};

	var rectIntersection = function() {
		// 1 is players sides
		var playerX = player.getX();
		var playerY = player.getY();
		var playerSize = player.getSize();
		var left1 = playerX - (playerSize / 2);
		var right1 = playerX + (playerSize / 2);
		var top1 = playerY - (playerSize / 2);
		var bottom1 = playerY + (playerSize / 2);
		// 2 is chasers sides
		// Changing by 10 because sprite doesn't actually overlap otherwise
		var left2 = x - (size / 2) + 15;
		var right2 = x + (size / 2) - 15;
		var top2 = y - (size / 2) + 15;
		var bottom2 = y + (size / 2) - 15;
		return !(left2 > right1 || right2 < left1 || top2 > bottom1 || bottom2 < top1);
	};
	//used in checking if player is in range and astar
	//calculates the euclidean distance between chaser and the x and y provided
	var distance = function(x1, y1, x2, y2){
		return Math.sqrt(Math.abs((x2 - x1) * (x2 - x1) + (y2 - y1)
			* (y2 - y1)));
	};

	var manDistance = function(x1, y1, x2, y2) {
		return Math.abs(x2 - x1) + Math.abs(y2 - y1);
	}

	var getPath = function(start, end){
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
				return result;
			}
			//removes the current element.
			openList.shift();
			//add it to closed list so is not revisited
			closedList.push(current);
			var neighbors = getNeighbors(current);
			for(var i = 0; i < neighbors.length; i++) {
				var neighbor = neighbors[i];
				// Try to find a node to jump to:
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

	var contains = function(arr, obj){
		for(var j = 0; j < arr.length; j++){
			if(arr[j].x === obj.x && arr[j].y === obj.y){
				return true;
			}
		}
		return false;
	};

	var compareFunc = function(first, second){
		if(second.fCost < first.fCost){
			return 1;
		}
		if(second.fCost > first.fCost){
			return -1;
		}
		return 0;
	};

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

	// Draw chaser
	var draw = function(ctx) {
		//so the way this works. we only want to change the frame every 5th time draw is
		//called. otherwise it goes through supppperr quick. which is bad.
		//so only change the frame every rate times per draw called.
		frame = frame + 1;
		if(frame % rate === 0) {
			tempX = facing[frame % facing.length].x;
			tempY = facing[frame % facing.length].y;
		}
		if (frame > 7500) {
			frame = 0;
		}
		ctx.drawImage(chaserImage, tempX, tempY, tileSize, tileSize, Math.round(x-((size)/2)), Math.round(y-((size)/2)), size, size);
	};

	var getTile = function(x0, y0){
		var tileX = Math.floor(x0/48.0);
		var tileY = Math.floor(y0/48.0);
		if(tileX < 0 || tileX > level[0].length || tileY < 0 || tileY > level.length){
			return null;
		}
		return {"x": tileX, "y": tileY};
	};

	var getLevelTile = function(x0, y0){
		if(x0 < 0 || x0 > level[0].length || y0 < 0 || y0 > level.length){
			return null;
		}
		return level[y0][x0];
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
			if(intersection(topLeft) || intersection(topRight) || intersection(bottomLeft) || intersection(bottomRight) ||
			intersection(middle)){
				return false;
			}
			//checking every 8 pixels along the line
			dist = dist + 8;
		}
		//the whole line was tested. we gucci
		return true;
	};

	var getPixel = function(tile){
		var tempX = (tile.x * 48) + 24;
		var tempY = (tile.y * 48) + 24;
		return {"x": tempX, "y": tempY};
	};

	var intersection = function(checkTile){
		if(level[checkTile.y][checkTile.x] > 10){
			return true;
		}
		else{
			return false;
		}
	};
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

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		getSize: getSize,
		getHealth: getHealth,
		setX: setX,
		setY: setY,
		setSize: setSize,
		setHealth: setHealth,
		update: update,
		draw: draw
	}
};
