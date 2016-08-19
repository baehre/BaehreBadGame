//chaser class
/**************************************************
** GAME chaser CLASS
**************************************************/
var Chaser = function(startX, startY, level, player) {
	var moving = false;
	var chaserImage = new Image();
	chaserImage.src = "SpriteSheets/PlayerSprites/gentlemanSprite.png";
	var chaserImageDown = [{"x":0,"y":1},{"x":0,"y":18},{"x":0,y:35}];
	//default to the chaser looking down
 	var facing = chaserImageDown;
	//separate time for update to go with rate
	var time = 0;
	var rate = 5;
	//for the frames
	var tempX = 0;
	var tempY = 0;
	//the size of the sprite
	var tileSize = 16;
	//scale the person to 48 (16*3) pixels with this
	var scale = 3;
	var size = tileSize * scale;

	var x = startX;
	var y = startY;
	// no idea why this is this high. Slows down a lot otherwise though
	var moveAmount = 5;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	// Update chaser position
	var update = function() {
		if (time > 7500) {
			time = 0;
		} else {
			time = time + 1;
		}
		// Previous position
		var prevX = x;
		var	prevY = y;
		//like an a-star algo
		if(distance(player.getX(), player.getY(), x, y) < 900){
			//don't want path to update super quick. may need to even make this slower
			//basically the way this sets up this is also how often the path is updated
			// but also how quickly he moves. Change to a big number if you don't believe me
			if(time % 5 == 0){
				var path = getPath(getTile(x, y), getTile(player.getX(), player.getY()));
				if(path !== null){
					if (path.length > 0) {
						var smoothPath = smooth(path, getTile(x, y));
					}
					else {
						var smoothPath = path;
					}
				}
				else {
					var smoothPath = null;
				}
			}
			if(smoothPath !== null && smoothPath !== undefined){
				var len = smoothPath.length - 1;
				if(len > 0){
					var tempTile = getPixel(smoothPath[len]);
					if (x < tempTile.x) {
						x += moveAmount;
					}
					if (x > tempTile.x) {
						x -= moveAmount;
					}
					if (y < tempTile.y) {
						y += moveAmount;
					}
					if (y > tempTile.y) {
						y -= moveAmount;
					}
					// now on same tile adjust for pixel perfect.
				} else {
					if(x < player.getX()){
						x += moveAmount;
					}
					if(x > player.getX()){
						x -= moveAmount;
					}
					if(y < player.getY()){
						y += moveAmount;
					}
					if(y > player.getY()){
						y -= moveAmount;
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
				var jumpNodeGCost = manDistance(start.x, start.y, jumpNode.x, jumpNode.y);
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
		ctx.drawImage(chaserImage, 0, 1, tileSize, tileSize, Math.round(x-((tileSize*scale)/2)), Math.round(y-((tileSize*scale)/2)), tileSize*scale, tileSize*scale);
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
	var smooth = function(arr, start){
		//initial check
		var checkPoint = start;
		//the point to see if can be removed
		var i = 0;
		var currentPoint = arr[i];
		//while we don't go past the array
		while(arr[i+1] !== null && arr[i+1] !== undefined){
			//checks the vector between the points
			if(walkable(checkPoint, currentPoint)){
				//keep checking along the line
				currentPoint = arr[i+1];
				//get rid of the old point
				arr.splice(i, 1);
			}
			else{
				//otherwise that's the best we can smooth that section. next section now
				checkPoint = currentPoint;
				currentPoint = arr[i+1];
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
			var topY = checkPixelY - (size / 2);
			var bottomY = checkPixelY + (size / 2);
			var leftX = checkPixelX - (size / 2);
			var rightX = checkPixelX + (size / 2);
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
		setX: setX,
		setY: setY,
		update: update,
		draw: draw
	}
};
