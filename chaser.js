//chaser class
/**************************************************
** GAME chaser CLASS
**************************************************/
//the chaser x and y are actually the lower right hand corner of image...
var Chaser = function(startX, startY, level, player) {
	var moving = false;
	var chaserImage = new Image();
	chaserImage.src = "SpriteSheets/PlayerSprites/sumoWrestlerSprite.png";
	var chaserImageUp = [{x:16,y:1},{x:16,y:18},{x:16,y:35}];
	var chaserImageDown = [{x:0,y:1},{x:0,y:18},{x:0,y:35}];
	var chaserImageRight = [{x:32,y:1},{x:32,y:18},{x:32,y:35}];
	var chaserImageLeft = [{x:48,y:1},{x:48,y:18},{x:48,y:35}];
	//default to the chaser looking down
 	var facing = chaserImageDown;
	//for choosing the animation
	var frame = 0;
	//for adjusting how fast animations go
	var rate = 5;
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
	var moveAmount = 2.5;

    var path = [];

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
		//frame for animating chaser
		if(frame < 7500){
			frame = frame + 1;
		}
		//if it gets too large then reset it. big numbers bad
		else{
			frame = 0;
		}
        //like an a-star algo
		var playerX = player.getX();
    var playerY = player.getY();
    if(distance(playerX, playerY) < 250){
	    //don't want path to update super quick. may need to even make this slower
	    if(time % 3 == 0){
				//may need to take out the - 24's hoping that it'll make the tile it returns a little more accurate
	    	path = getPath(level, getTile(getX() - 24, getY() - 24), getTile(playerX - 24, playerY - 24));
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
	var distance = function(x1, y1){
      var dist =
          Math.sqrt(Math.abs((x1 - x) * (x1 - x) + (y1 - y)
              * (y1 - y)));
      return dist;
  };

	var getPath = function(levelData, start, end){
	}

	// Draw chaser
	var draw = function(ctx) {
		//so the way this works. we only want to change the frame every 5th time draw is
		//called. otherwise it goes through supppperr quick. which is bad.
		//so only change the frame every rate times per draw called.
		time = time + 1
		if(time%rate == 0){
			tempX = facing[frame%facing.length].x;
			tempY = facing[frame%facing.length].y;
		}
		if(time > 7500){
			time = 0;
		}
		if(moving){
			//so. the image to draw, from startingX startingY through the width and height
			//then desination x and y and the width and height you want. so scaling to *3
			//get the proper animation.
			ctx.drawImage(chaserImage, tempX, tempY, tileSize, tileSize, Math.round(x-(tileSize*scale)), Math.round(y-(tileSize*scale)), tileSize*scale, tileSize*scale);
		}
		else{
			//if the chaser is not moving then make sure it is in the stand still frame
			//by setting it to facing[0]
			ctx.drawImage(chaserImage, facing[0].x, facing[0].y, tileSize, tileSize, Math.round(x-(tileSize*scale)), Math.round(y-(tileSize*scale)), tileSize*scale, tileSize*scale);
		}
	};

	var upIntersection = function(chaserX, chaserY){
		//this chooses two pixels at the top of the character
		var checkPixelX1 = chaserX - (size / 3);
		var checkPixelX2 = chaserX - (2 * size / 3);
		var checkPixelY = chaserY - size;
		//get that pixels tile
		return (intersection(getTile(checkPixelX1, checkPixelY)) || intersection(getTile(checkPixelX2, checkPixelY)));
	}
	var downIntersection = function(chaserX, chaserY){
		var checkPixelX1 = chaserX - (size / 3);
		var checkPixelX2 = chaserX - (2 * size / 3);
		var checkPixelY = chaserY;
		//get that pixels tile
		return (intersection(getTile(checkPixelX1, checkPixelY)) || intersection(getTile(checkPixelX2, checkPixelY)));
	}

	var leftIntersection = function(chaserX, chaserY){
		var checkPixelX = chaserX - size;
		var checkPixelY1 = chaserY - (size / 3);
		var checkPixelY2 = chaserY - (2 * size / 3);
		//get that pixels tile
		return (intersection(getTile(checkPixelX, checkPixelY1)) || intersection(getTile(checkPixelX, checkPixelY2)));
	}

	var rightIntersection = function(chaserX, chaserY){
		var checkPixelX = chaserX;
		var checkPixelY1 = chaserY - (size / 3);
		var checkPixelY2 = chaserY - (2 * size / 3);
		//get that pixels tile
		return (intersection(getTile(checkPixelX, checkPixelY1)) || intersection(getTile(checkPixelX, checkPixelY2)));
	}

	var intersection = function(checkTile){
		if(levelData[checkTile.y][checkTile.x] > 10){
			return true;
		}
		else{
			return false;
		}
	}

	var getTile = function(x0, y0){
		var tileX = Math.floor(x0/48.0);
		var tileY = Math.floor(y0/48.0);
		return {x: tileX, y: tileY};
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
