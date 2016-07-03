//chaser class
/**************************************************
** GAME chaser CLASS
**************************************************/
//the chaser x and y are actually the lower right hand corner of image...
var Chaser = function(startX, startY, level, player) {
	var moving = false;
	var chaserImage = new Image();
	chaserImage.src = "SpriteSheets/PlayerSprites/gentlemanSprite.png";
	var chaserImageDown = [{x:0,y:1},{x:0,y:18},{x:0,y:35}];
	//default to the chaser looking down
 	var facing = chaserImageDown;
	//separate time for update to go with rate
	var time = 0;
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
		// Previous position
		var prevX = x;
		var	prevY = y;
        //like an a-star algo
    if(distance(player.getX(), player.getY(), x, y) < 900){
	    //don't want path to update super quick. may need to even make this slower
			var smoothPath;
	    if(time % 5 == 0){
				//may need to take out the - 24's hoping that it'll make the tile it returns a little more accurate
	    	//path = getPath(getTile(getX() - 24, getY() - 24), getTile(playerX - 24, playerY - 24));
				//path = smooth(getPath(getTile(x, y), getTile(player.getX(), player.getY())));
				var path = getPath(getTile(x, y), getTile(player.getX(), player.getY()));
				if(path.length > 1){
					smoothPath = smooth(path);
				}
				else{
					smoothPath = path;
				}
			}
			if(smoothPath !== null && smoothPath !== undefined){
				if(smoothPath.length > 0){
					var tempX = smoothPath[smoothPath.length - 1].x;
					var tempY = smoothPath[smoothPath.length - 1].y;
					var tile = getTile(x, y);
					if(tile.x < tempX){
						x += moveAmount;
					}
					if(tile.x > tempX){
						x -= moveAmount;
					}
					if(tile.y < tempY){
						y += moveAmount;
					}
					if(tile.y > tempY){
						y -= moveAmount;
					}
				}
				//they are both on the same tile now adjust to try and get perfect matching
				else {
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

		if(prevX == x && prevY == y){
			moving = false;
		}
		else{
			moving = true;
		}
		return (prevX != x || prevY != y) ? true : false;
	};
	//used in checking if player is in range and astar
	//calculates the euclidean distance between chaser and the x and y provided
	var distance = function(x1, y1, x2, y2){
      var dist =
          Math.sqrt(Math.abs((x2 - x1) * (x2 - x1) + (y2 - y1)
              * (y2 - y1)));
      return dist;
  };

	var getPath = function(start, end){
		//open moves
		var openList = [];
		//can't go back here
		var closedList = [];
		//final steps
		var result = [];
		//starting point
		var current = node(start.x, start.y, null, 0, distance(start.x, start.y, end.x, end.y))
		//obviously we can start here
		openList.push(current);
		//if there are open moves keep trying to get places
		while(openList.length > 0){
			//sorts the open list based on the fcost.
			openList.sort(compareFunc);
			current = openList[0];
			//if we are here then stop
			if(current.x === end.x && current.y === end.y){
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

			for(var i = 0; i < 9; i++){
				if(i === 4){
					// dont' care about the middle tile
					continue;
				}
				//basically returns -1, 0 or 1 depending on the value of i basically | grabs the tile aroudn current.x, current.y
				var xi = (i % 3) - 1;
				var yi = Math.floor(i / 3) - 1;
				var tempX = current.x + xi;
				var tempY = current.y + yi;
				var currentTile = getLevelTile(tempX, tempY);
				//if not in level
				if(currentTile === null || currentTile === undefined){
					continue;
				}
				//is solid
				if(currentTile > 10){
					continue;
				}
				//extra check for the diagonals
				/*if(i === 0 || i === 2 || i === 6 || i === 8){
					if(!walkable(current, currentTile)){
						continue;
					}
				}*/
				var gCost = current.gCost + distance(current.x, current.y, tempX, tempY);
				var hCost = distance(tempX, tempY, end.x, end.y);
				var tempNode = node(tempX, tempY, current, gCost, hCost);
				//ignore optimizations for now
				//if(contains(closedList, tempNode) && tempNode.gCost >= current.gCost){
				if(contains(closedList, tempNode)){
					continue;
				}
				//if(!contains(openList, tempNode) || tempNode.gCost < current.gCost){
				if(!contains(openList, tempNode)){
					openList.push(tempNode);
				}
			}
		}
		//has failed
		return null;
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
		time = time + 1
		if(time > 7500){
			time = 0;
		}
		ctx.drawImage(chaserImage, facing[0].x, facing[0].y, tileSize, tileSize, Math.round(x - ((tileSize*scale) / 2)), Math.round(y - ((tileSize*scale) / 2)), tileSize*scale, tileSize*scale);
	};

	var getTile = function(x0, y0){
		var tileX = Math.floor(x0/48.0);
		var tileY = Math.floor(y0/48.0);
		if(tileX < 0 || tileX > level[0].length || tileY < 0 || tileY > level.length){
			return null;
		}
		return {x: tileX, y: tileY};
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
		//the point to see if can be removed
		var i = 1;
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
			}
			i = i + 1;
		}
		return arr;
	};

	var walkable = function(point1, point2){
		//get the middle of the tile
		var start = getPixel(point1);
		var end = getPixel(point2);
		//doing vector stuff here
		var vec = {"x": start.x - end.x, "y": start.y - end.y};
		var vecLength = Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
		var uX = vec.x / vecLength;
		var uY = vec.y / vecLength;
		var dist = 0;
		while(dist < vecLength){
			var checkPixelX = start.x + (dist * uX);
			var checkPixelY = start.y + (dist * uY);
			//console.log("CHECKPIXEL: (" + checkPixelX + ", " + checkPixelY + ")");
			//get the hypothetical corners
			var leftX = checkPixelX - 24;
			var rightX = checkPixelX + 24;
			var upY = checkPixelY - 24;
			var downY = checkPixelY + 24;
			//get the tiles for the corners and the middle
			var topLeft = getTile(leftX, upY);
			var topRight = getTile(rightX, upY);
			var bottomLeft = getTile(leftX, downY);
			var bottomRight = getTile(rightX, downY);
			var middle = getTile(checkPixelX, checkPixelY);
			//if any of those intersect don't take the line
			if(intersection(topLeft) || intersection(topRight) || intersection(bottomLeft) || intersection(bottomRight) || intersection(middle)){
				console.log("SOMETHING HIT");
				return false;
			}
			else{
				console.log("NOT HIT");
			}
			//checking every 10 pixels along the line
			dist = dist + 24;
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
