//shielder class
/**************************************************
** GAME shielder CLASS
**************************************************/
var Shooter = function(game, startX, startY, level, player) {
	var shooterImage = new Image();
	shooterImage.src = "SpriteSheets/PlayerSprites/scareCrowSprite.png";
	var shooterImageUp = [{"x":16,"y":1},{"x":16,"y":18},{"x":16,"y":1},{"x":16,"y":35}];
	var shooterImageDown = [{"x":0,"y":1},{"x":0,"y":18},{"x":0,"y":1},{"x":0,"y":35}];
	var shooterImageRight = [{"x":32,"y":1},{"x":32,"y":18},{"x":32,"y":1},{"x":32,"y":35}];
	var shooterImageLeft = [{"x":48,"y":1},{"x":48,"y":18},{"x":48,"y":1},{"x":48,"y":35}];
	//default to the chaser looking down
 	var facing = shooterImageDown;
	//separate time for update to go with rate
	var time = 0;
	var rate = 5;
	//for the frames
	var frame = 0;
	var frameIndex = 0;
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
	//how much shooter moves
	var originalSpeed = 1.25;
	var moveAmount = 1.25;
	var damage = 5.0;
	var fullHealth = 50;
	var health = fullHealth;
    // how far the shooter can actually shoot
    var attackRange = 250;
    //for shooting
	//higher is slower. lower is faster
	var startingProjectileFireRate = 40;
	//this is the value used to say when they can fire by subtracting then resetting the value
	var projectileFireRate = startingProjectileFireRate;
	//holds all the shooters projectiles
	var projectiles = [];
	//the previous behavior. used to reset path between behavior changes
	var pastBehavior = '';
	//used in path finding. if leader he is getting the path. everyone else steals from him
	var leader = false;
	//the path the shooter is taking
	var path = null;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var getWidth = function() {
		return size;
	};

	var getHeight = function() {
		return size;
	};

	var getHealth = function() {
		return health;
	};

	var getPath = function() {
		return path;
	};

    var getProjectiles = function() {
        return projectiles;
    };

	var getLeader = function() {
		return leader;
	};
	
	var resetSpeed = function() {
		moveAmount = originalSpeed;
	};

	var getOriginalSpeed = function() {
		return originalSpeed;
	};

	var getMoveAmount = function() {
		return moveAmount;
	};

	var setMoveAmount = function(amount) {
		moveAmount = amount;
	};

	var getFullHealth = function() {
		return fullHealth;
	};

	var getType = function() {
		return 'shooter';
	};

	var setFullHealth = function(newHealth) {
		fullHealth = newHealth;
	};

    var setProjectiles = function(proj) {
        projectiles = proj;
    };

	var setLeader = function(newLeader) {
		leader = newLeader;
	}

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

	// Update shooter position
	var update = function(enemies) {
		prevX = x;
		prevY = y;
        //if they can fire then update projectileFireRate
		if(startingProjectileFireRate > 0){
			projectileFireRate = projectileFireRate - 1;
		}
		var dist = distance(player.getX(), player.getY(), x, y);
        // now attack da guy
		if (dist < attackRange) {
            if(path !== null && pathManDistance(path) < attackRange) {
				if(pastBehavior !== 'shootPlayer') {
                    path = null;
                }
                pastBehavior = 'shootPlayer';
                avoid();
                shootPlayer(enemies);
			} else {
                if(pastBehavior !== 'pathing') {
                    path = null;
                }
                pastBehavior = 'pathing';
                // get closer
                pathing(enemies);
            }
        } else {
            if(pastBehavior !== 'pathing') {
                path = null;
            }
            pastBehavior = 'pathing';
            // get closer
            pathing(enemies);
        }
		separate(enemies);
		//get the path from above then follow it
		followPath();
	};

	// Draw shooter
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
		ctx.drawImage(shooterImage, drawX, drawY, tileSize, tileSize, Math.round(x - (size / 2)), Math.round(y - (size / 2)), size, size);
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
					facing = shooterImageRight;
				} else if (x > tempTile.x && smallXCheck) {
					x -= moveAmount;
					facing = shooterImageLeft;
				}
				var smallYCheck = Math.abs(y - tempTile.y) > 1;
				// if elseif so it can't do both in the same update cycle
				if (y < tempTile.y && smallYCheck) {
					y += moveAmount;
					facing = shooterImageDown;
				} else if (y > tempTile.y && smallYCheck) {
					y -= moveAmount;
					facing = shooterImageUp;
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
	var pathing = function(enemies, distance) {
		var noLeader = true;
		for (var i = 0; i < enemies.length; i++) {
			var enemy = enemies[i];
			// we are not the current enemy
			if(enemy.getX() !== x && enemy.getY() !== y) {
				// if the enemy is within 3 tiles
				if (manDistance(enemy.getX(), enemy.getY(), x, y) < 144) {
					if (!leader && enemy.getLeader()) {
						// means that someone already did the overarching path concat the path to that guy to his path
						noLeader = false;
						// need to double check that this works
						var tempPath = getSmoothPath(getTile(x, y), getTile(enemy.getX(), enemy.getY()));
						var enemyPath = enemy.getPath();
						if (enemyPath !== null) {
							path = enemyPath.concat(tempPath);
						} else {
							path = getSmoothPath(getTile(x, y), getTile(player.getX(), player.getY()));
						}
					}
				}
			}
		}
		//if none of the other enemies are leaders
		if (noLeader) {
			leader = true;
			//if no path get one or get a new one if the path is longer than the distance to the player
			if (path === null || pathManDistance(path) > manDistance(player.getX(), player.getY(), x, y)) {
				path = getSmoothPath(getTile(x, y), getTile(player.getX(), player.getY()));
			} else {
				//already has a path. gotta update it.but only if player has moved
				if (prevPlayerX !== player.getX() || prevPlayerY !== player.getY()) {
					prevPlayerX = player.getX();
					prevPlayerY = player.getY();
					if (path !== null && path !== undefined) {
						if(path.length !== 0 && path[path.length - 1] !== undefined) {
							var tempTile = getTile(prevPlayerX, prevPlayerY);
							// long as the tile doesn't fail
							if(tempTile !== undefined) {
								// if the new tile isn't already in the path then add it.
								if(tempTile.x !== path[0].x || tempTile.y !== path[0].y) {
									//put the new tile onto the end of the path
									path.unshift(tempTile);
									//add the current tile to the beginning for making sure you can move to the first tile correctly.
									path.push(getTile(x, y));
									path = smooth(path);
									// we don't want to get stuck where we currently are or go back to the center of the first tile.
									// gotta get rid of it.
									path.pop();
								}
							}
						} else {
							var tempTile = getTile(prevPlayerX, prevPlayerY);
							// when the path is empty we just tack on the tile regardless
							if(tempTile !== undefined) {
								path.unshift(tempTile);
							}
						}
					}
				}
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
				if (manDistance(enemy.getX(), enemy.getY(), x, y) < 144 && enemy.getType() !== 'shielder') {
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

    var shootPlayer = function(enemies) {
        var playerX = player.getX();
        var playerY = player.getY();
        //means we can shoot at him
        if(projectileFireRate <= 0) {
            //means a clear shot
            if(walkable(getTile(x, y), getTile(playerX, playerY))) {
                // if the player is moving
                if (prevPlayerX !== playerX || prevPlayerY !== playerX) {
                    //vector things
                    var playerVecX = playerX - prevPlayerX;
                    var playerVecY = playerY - prevPlayerY;
                    var vecLength = Math.sqrt((playerVecX * playerVecX) + (playerVecY * playerVecY));
                    if (vecLength > 0) {
                        var uX = playerVecX / vecLength;
                        var uY = playerVecY / vecLength;
                        // get a point along the vector past where they are (we assume they are going to follow that direction)
                        // 15 is arbitrary. probably need to tinker to get an ok number
                        var shootX = playerX + uX * 30;
                        var shootY = playerY + uY * 30;
                    } else {
                        var shootX = playerX;
                        var shootY = playerY;
                    }
                    fireProjectile(shootX, shootY);
                    //update player position
                    prevPlayerX = playerX
                    prevPlayerY = playerY;
                    //player is not moving
                } else {
                    fireProjectile(playerX, playerY);
                }
            // means we need to shift to get a shot
            } else {
                //this isn't super efficient. but will work for now
                pathing(enemies);
                pastBehavior = 'pathing';
            }
            //means can't fire yet. lets move around a bit
        } else {
            var temp = [0, 1];
            var rand = Math.floor(Math.random() * 2);
            var surroundDirection = temp[rand];
            var angle = (Math.atan2(y - playerY, x - playerX));
            if(surroundDirection === 0) {
                // 0.261799 is 15 degrees
                var positiveAngle = angle + 0.261799;
                //orbits the player. yay for unit circle?
                var tempPositiveX = playerX + Math.cos(positiveAngle) * 96;
                var tempPositiveY = playerY + Math.sin(positiveAngle) * 96;
                var tempTile = getTile(tempPositiveX, tempPositiveY);
                if (!isBlocked(tempTile.x, tempTile.y)) {
                    var smallXCheck = Math.abs(x - tempPositiveX) > 1;
                    var smallYCheck = Math.abs(y - tempPositiveY) > 1;
                    if (x < tempPositiveX && smallXCheck) {
                        x += moveAmount;
                    } else if (x > tempPositiveX && smallXCheck) {
                        x -= moveAmount;
                    }
                    if (y < tempPositiveY && smallYCheck) {
                        y += moveAmount;
                    } else if (y > tempPositiveY && smallYCheck) {
                        y -= moveAmount;
                    }
                }
            } else if (surroundDirection === 1) {
                // 15 degrees
                var negativeAngle = angle - 0.261799;
                var tempNegativeX = playerX + Math.cos(negativeAngle) * 96;
                var tempNegativeY = playerY + Math.sin(negativeAngle) * 96;
                tempTile = getTile(tempNegativeX, tempNegativeY);
                if (!isBlocked(tempTile.x, tempTile.y)) {
                    var smallXCheck = Math.abs(x - tempNegativeX) > 1;
                    var smallYCheck = Math.abs(y - tempNegativeY) > 1;
                    if (x < tempNegativeX && smallXCheck) {
                        x += moveAmount;
                    } else if (x > tempNegativeX && smallXCheck) {
                        x -= moveAmount;
                    }
                    if (y < tempNegativeY && smallYCheck) {
                        y += moveAmount;
                    } else if (y > tempNegativeY && smallYCheck) {
                        y -= moveAmount;
                    }
                    //can't move along the circle in either direction
                }
            }
        }
    };

    var avoid = function() {
        var playerX = player.getX();
        var playerY = player.getY();
        var shooterVecX = x - playerX;
        var shooterVecY = y - playerY;
        var vecLength = Math.sqrt((shooterVecX * shooterVecX) + (shooterVecY * shooterVecY));
        if (vecLength > 0) {
            var uX = shooterVecX / vecLength;
            var uY = shooterVecY / vecLength;
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

    //take the coordinates to shoot at
    var fireProjectile = function(shootX, shootY) {
        var direction = Math.atan2(shootY - y, shootX - x);
        // the enemies are whomever we can hit. so array of player. cuz we can hit the player
        var tempProjectile = new Projectile(game, "shooter", x, y, direction, canvas, levelData, [player], 10, 6, 300);
        projectiles.push(tempProjectile);
        projectileFireRate = startingProjectileFireRate;
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

  //return the tile given pixel coordinates
	var getTile = function(x0, y0){
		var tileX = Math.floor(x0 / 48.0);
		var tileY = Math.floor(y0 / 48.0);
		if(tileX < 0 || tileX > level[0].length - 1 || tileY < 0 || tileY > level.length - 1){
			return null;
		}
		return {"x": tileX, "y": tileY};
	};

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
		if(level[checkY][checkX] > 10 && level[checkY][checkX] < 100){
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
		getProjectiles: getProjectiles,
		getFullHealth: getFullHealth,
		setMoveAmount: setMoveAmount,
		getMoveAmount: getMoveAmount,
		getOriginalSpeed: getOriginalSpeed,
		resetSpeed: resetSpeed,
		setFullHealth: setFullHealth,
		setProjectiles: setProjectiles,
		setLeader: setLeader,
		setX: setX,
		setY: setY,
		setHealth: setHealth,
		setPath: setPath,
		update: update,
		draw: draw
	}
};
