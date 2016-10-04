//shielder class
/**************************************************
** GAME shielder CLASS
**************************************************/
var Shielder = function(startX, startY, level, player) {
	var shielderImage = new Image();
	shielderImage.src = "SpriteSheets/PlayerSprites/afroKidSprite.png";
	var shielderImageUp = [{"x":16,"y":1},{"x":16,"y":18},{"x":16,"y":1},{"x":16,"y":35}];
	var shielderImageDown = [{"x":0,"y":1},{"x":0,"y":18},{"x":0,"y":1},{"x":0,"y":35}];
	var shielderImageRight = [{"x":32,"y":1},{"x":32,"y":18},{"x":32,"y":1},{"x":32,"y":35}];
	var shielderImageLeft = [{"x":48,"y":1},{"x":48,"y":18},{"x":48,"y":1},{"x":48,"y":35}];
	//default to the chaser looking down
 	var facing = shielderImageDown;
	//separate time for update to go with rate
	var time = 0;
	var rate = 5;
	//for the frames
	var frame = 0;
	//the size of the sprite
	var tileSize = 16;
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
	//how much shielder moves
	var moveAmount = 1.5;
	var fullHealth = 350;
	var health = fullHealth;
	//the previous behavior. used to reset path between behavior changes
	var pastBehavior = '';
    // the closest ally
    var closest = null;
    var startProjectileGrabTime = 40;
    var projectileGrabTime = startProjectileGrabTime;
	//the path the shielder is taking
	var path = null;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var getHealth = function() {
		return health;
	};

	var getPath = function() {
		return path;
	};

	var getFullHealth = function() {
		return fullHealth;
	};

    var getLeader = function() {
        return false;
    };

	var getType = function() {
		return 'shielder';
	};

	var getWidth = function() {
		return size;
	};

	var getHeight = function() {
		return size;
	};

	var setFullHealth = function(newHealth) {
		fullHealth = newHealth;
	};

	var setPath = function(newPath) {
		path = newPath;
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

	// Update shielder position
	var update = function(enemies) {
        if(startProjectileGrabTime > 0){
			projectileGrabTime = projectileGrabTime - 1;
		}
		prevX = x;
		prevY = y;
		// just a stupidly large number
        var dist = 999999999;
        //so if there is no one then the closest also gets set to null
        closest = null;
		for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            // not us
            var enemyX = enemy.getX();
            var enemyY = enemy.getY();
            if (enemyX !== x && enemyY !== y && enemy.getType() !== 'shielder') {
                var tempDist = manDistance(x, y, enemyX, enemyY);
                if (tempDist < dist) {
                    dist = tempDist;
                    closest = enemy;
                }
            }
        }
        // get closer
        if (closest !== null) {
            var closestDist = distance(x, y, closest.getX(), closest.getY());
            // means we are close enough to start a new behavior
            if (closestDist < 100) {
                if(pastBehavior !== 'protect') {
                    path = null;
                }
                pastBehavior = 'protect';
                protect();
            } else {
                // if not make sure our path is GUCCI
                if(pastBehavior !== 'pathing') {
                    path = null;
                }
                pastBehavior = 'pathing';
                pathing();
            }
        } else {
            if(pastBehavior !== 'avoid') {
                path = null;
            }
            pastBehavior = 'avoid';
            avoid();
        }
				if (pastBehavior !== 'avoid') {
						grabProjectile();
				}
        if (pastBehavior !== 'protect') {
            separate(enemies);
        }
		//get the path from above then follow it
		followPath();
	};

	// Draw shielder
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
		ctx.drawImage(shielderImage, drawX, drawY, tileSize, tileSize, Math.round(x - (size / 2)), Math.round(y - (size / 2)), size, size);
		if (health < fullHealth) {
			var percent = health / fullHealth;
			// ratio in relation to the size of the character
			var pixelWidth = percent * size;
			// tinker with this number if we want
			var pixelHeight = 10;
			// top side then the height and a padding of 2
			var healthY = y - (size / 2) - pixelHeight - 2;
			// just the left side of the sprite
			var healthX = x - (size / 2);
			if (percent < 0.25) {
				ctx.fillStyle = '#ff0000';
			} else if (percent < 0.75) {
				ctx.fillStyle = '#ffff00';
			} else {
				ctx.fillStyle = '#00ff00';
			}
			ctx.fillRect(healthX, healthY, pixelWidth, pixelHeight);
		}
	};

	//once the path has been set in update follow it.
	var followPath = function() {
		if (path !== null && path !== undefined) {
			var len = path.length - 1;
			//check to see if the length is legit. and that some gobble-de-gook didn't get in the path
			if(len > -1 && path[len] !== undefined) {
				var tempTile = getPixel(path[len]);
				// super small stuff won't affect the movement
				var smallXCheck = Math.abs(x - tempTile.x) > 1;
				if (x < tempTile.x && smallXCheck) {
					x += moveAmount;
					facing = shielderImageRight;
				} else if (x > tempTile.x && smallXCheck) {
					x -= moveAmount;
					facing = shielderImageLeft;
				}
				var smallYCheck = Math.abs(y - tempTile.y) > 1;
				// if elseif so it can't do both in the same update cycle
				if (y < tempTile.y && smallYCheck) {
					y += moveAmount;
					facing = shielderImageDown;
				} else if (y > tempTile.y && smallYCheck) {
					y -= moveAmount;
					facing = shielderImageUp;
				}
				// if we hit the tile we are going to then remove it from the path
				// used to be moveamount
				if (Math.abs(x - tempTile.x) < 24 && Math.abs(y - tempTile.y) < 24) {
					path.pop();
				}
			}
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

	// keeps the chasers separate and gets the path
	var pathing = function() {
        //now should have the closest enemy. unless he is the only one left. then RUN FOREST
        if (closest === null) {
            if(pastBehavior !== 'avoid') {
                path = null;
            }
            pastBehavior = 'avoid';
            avoid();
        } else {
            path = getSmoothPath(getTile(x, y), getTile(closest.getX(), closest.getY()));
        }
	};

    var protect = function() {
        if (closest !== null) {
            var playerX = player.getX();
            var playerY = player.getY();
            var closestX = closest.getX();
            var closestY = closest.getY();
            var vecX = playerX - closestX;
            var vecY = playerY - closestY;
            var vecLength = Math.sqrt((vecX * vecX) + (vecY * vecY));
            var uX = vecX / vecLength;
            var uY = vecY / vecLength;

            // the distance to go from the closest between the player
            var protectDistance = 70;

            var protectX = closestX + (uX * protectDistance);
            var protectY = closestY + (uY * protectDistance);
            var tempTile = getTile(protectX, protectY);
            if (!isBlocked(tempTile.x, tempTile.y)) {
                path = getSmoothPath(getTile(x, y), tempTile);
            }
            return;
        }
        if(pastBehavior !== 'avoid') {
            path = null;
        }
        pastBehavior = 'avoid';
        avoid();
    };

    var grabProjectile = function() {
        if (projectileGrabTime <= 0) {
            var dist = 999999999;
            var closestProj = null;
            for (var i = 0; i < player.getProjectiles().length; i++) {
                var proj = player.getProjectiles()[i];
                var projDist = manDistance(x, y, proj.getX(), proj.getY());
                if (projDist < dist) {
                    dist = projDist;
                    closestProj = proj;
                }
            }
            if (closestProj !== null && dist < 200) {
				var closestProjX = closestProj.getX();
				var closestProjY = closestProj.getY();
				if(walkable(getTile(x, y), getTile(closestProjX, closestProjY))) {
					closestProj.setAngle(Math.atan2(y - closestProjY, x - closestProjX));
				}
            }
            projectileGrabTime = startProjectileGrabTime;
        }
    };

    var avoid = function() {
        var playerX = player.getX();
        var playerY = player.getY();
        var shielderVecX = x - playerX;
        var shielderVecY = y - playerY;
        var vecLength = Math.sqrt((shielderVecX * shielderVecX) + (shielderVecY * shielderVecY));
        if (vecLength > 0) {
            var uX = shielderVecX / vecLength;
            var uY = shielderVecY / vecLength;
            var xStuff = x + uX * moveAmount;
            var yStuff = y + uY * moveAmount;
            if (xStuff < x) {
                var tileX = getTile(xStuff - 24, y);
            } else {
                var tileX = getTile(xStuff + 24, y);
            }
            if (yStuff < y) {
                var tileY = getTile(x, yStuff - 24);
            } else {
                var tileY = getTile(x, yStuff + 24);
            }
            var tileLeft = getTile(xStuff - 24, yStuff);
            var tileRight = getTile(xStuff + 24, yStuff);
            var tileUp = getTile(xStuff, yStuff - 24);
            var tileDown = getTile(xStuff, yStuff + 24);
            if(!isBlocked(tileLeft.x, tileLeft.y) && !isBlocked(tileRight.x, tileRight.y) &&
             !isBlocked(tileDown.x, tileDown.y) && !isBlocked(tileUp.x, tileUp.y)) {
                x = xStuff;
                y = yStuff;
            } else if (!isBlocked(tileX.x, tileX.y)) {
                x = xStuff;
            } else if (!isBlocked(tileY.x, tileY.y)) {
                y = yStuff;
            }
        }
    };

    var separate = function(enemies) {
		var velocity = {"x": 0, "y": 0};
		var neighbors = 0;
		for (var i = 0; i < enemies.length; i++) {
			var enemy = enemies[i];
			// we are not the current enemy
			if(enemy.getX() !== x && enemy.getY() !== y) {
				// if the enemy is within 3 tiles
				if (manDistance(enemy.getX(), enemy.getY(), x, y) < 144) {
					velocity.x += x - enemy.getX();
					velocity.y += y - enemy.getY();
					neighbors += 1;
				}
			}
		}
		if (neighbors !== 0) {
			// all dat sweet sweet velocity stuff
			velocity.x /= neighbors;
			velocity.y /= neighbors;
			velocity.x *= -1;
			velocity.y *= -1;
			var velocityLength = Math.sqrt((velocity.x * velocity.x) + (velocity.y * velocity.y));
			var uX = velocity.x / velocityLength;
			var uY = velocity.y / velocityLength;
			//get the hypothetical bounds of the enemy
			var tempTile1 = getTile(x + uX - 24, y + uY);
			var tempTile2 = getTile(x + uX + 24, y + uY);
			var tempTile3 = getTile(x + uX, y + uY - 24);
			var tempTile4 = getTile(x + uX, y + uY + 24);
			// shift the enemy along the vector. if it wouldn't shove it through a blocked tile
			if(getLevelTile(tempTile1.x, tempTile1.y) < 10 && getLevelTile(tempTile2.x, tempTile2.y) < 10 &&
			 getLevelTile(tempTile3.x, tempTile3.y) < 10 && getLevelTile(tempTile4.x, tempTile4.y) < 10) {
				x -= uX;
				y -= uY;
			}
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

	//return the total manhattan distance of the path given to it
	// fun fact arrays are passed by reference automatically. This was adding stuff to the path
	var pathManDistance = function(tempPath) {
		var distance = 0;
		tempPath.unshift(getTile(x, y));
		for (var i = 0; i < tempPath.length - 1; i++) {
			var pixel1 = getPixel(tempPath[i]);
			var pixel2 = getPixel(tempPath[i + 1]);
			distance = distance + manDistance(pixel1.x, pixel1.y, pixel2.x, pixel2.y);
		}
		// get rid of things we did to the tile
		tempPath.shift();
		return distance;
	};

  //TILE INFO

  //PATHFINDING

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

	//if an array contains an object. The object is a tile.
	var contains = function(arr, obj){
		for(var j = 0; j < arr.length; j++){
			if(arr[j].x === obj.x && arr[j].y === obj.y){
				return true;
			}
		}
		return false;
	};

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

	//return the tile given pixel coordinates
	var getTile = function(x0, y0){
		var tileX = Math.floor(x0 / 48.0);
		var tileY = Math.floor(y0 / 48.0);
		if(tileX < 0 || tileX > level[0].length - 1|| tileY < 0 || tileY > level.length - 1){
			return null;
		}
		return {"x": tileX, "y": tileY};
	};

	// based on tile coordinates return the tile's number
	var getLevelTile = function(x0, y0){
		if(x0 < 0 || x0 > level[0].length - 1|| y0 < 0 || y0 > level.length - 1){
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

	//gets the center of the tile obj passed in.
	var getPixel = function(tile){
		var tempX = (tile.x * 48) + 24;
		var tempY = (tile.y * 48) + 24;
		return {"x": tempX, "y": tempY};
	};

	//based on tile coordinates does a slightly better check. Used in jump point search.
	var isBlocked = function(checkX, checkY) {
		if(checkX < 0 || checkX > level[0].length - 1 || checkY < 0 || checkY > level.length - 1){
			return true;
		}
		if(level[checkY][checkX] > 10){
			return true;
		}
		else{
			return false;
		}
	};

  //gets a vector between things. returns if you walk a straight line in between them
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
		getPath: getPath,
        getLeader: getLeader,
		getType: getType,
		getFullHealth: getFullHealth,
		setFullHealth: setFullHealth,
		setX: setX,
		setY: setY,
		setHealth: setHealth,
		setPath: setPath,
		update: update,
		draw: draw
	}
};
