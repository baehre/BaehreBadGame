var Projectile = function(entity, xP, yP, direction, can, level) {
    var canvas = can;
    var projectileImage = new Image();
    projectileImage.src = "SpriteSheets/BulletSprites/bulletSprites.png";
    var projectileSpeed = 5;
    var projectileRange = 200;
    var projectileDamage = 20;
    var tileSize = 16;
    var scale = 1;
    var size = tileSize * scale;
    //subtractions are to adjust for where it is firing on the sprite.
    var x = xP;
    var y = yP;
    var xOrigin = x;
    var yOrigin = y;
    var angle = direction;

    var newX = projectileSpeed * Math.cos(angle);
    var newY = projectileSpeed * Math.sin(angle);

    var toRemove = false;

    var getX = function(){
      return x;
    };

    var getY = function(){
      return y;
    };

    var update = function(){
      if(!checkIntersection(x,y)){
        x = x + newX;
        y = y + newY;
      }
      else{
        toRemove = true;
      }
      if (distance() > projectileRange)
      {
          toRemove = true;
      }
    };

    var distance = function(){
        var dist =
            Math.sqrt(Math.abs((xOrigin - x) * (xOrigin - x) + (yOrigin - y)
                * (yOrigin - y)));
        return dist;
    };

    var checkIntersection = function(projX, projY){
      var up = false;
      var down = false;
      var left = false;
      var right = false;
      if(newX > 0){
        var pixelX = projX + (size / 2);
        var pixelY = projY;
        right = checkTile(getTile(pixelX, pixelY));
      }
      else if(newX < 0){
        var pixelX = projX - (size  / 2);
        var pixelY = projY;
        left = checkTile(getTile(pixelX, pixelY));
      }
      if(newY > 0){
        var pixelX = projX;
        var pixelY = projY + (size / 2);
        down = checkTile(getTile(pixelX, pixelY));
      }
      else if(newY < 0){
        var pixelX = projX;
        var pixelY = (projY - size / 2);
        var temp = getTile(pixelX, pixelY);
        up = checkTile(getTile(pixelX, pixelY));
      }
      //console.log("UP: " + up);
      //console.log("DOWN: " + down);
      //console.log("RIGHT: " + right);
      //console.log("LEFT: " + left);
      return up || down || left || right;
    };

    var getTile = function(x0, y0){
      //minus one to handle the start at 0 thing
      var tileX = Math.floor(x0/48.0);
      var tileY = Math.floor(y0/48.0);
      return {x: tileX, y: tileY};
	  };

    var checkTile = function(tile){
      if(level[tile.y][tile.x] > 10){
        return true;
      }
      else{
        return false;
      }
    }

    var getToRemove = function(){
      return toRemove;
    };

    var draw = function(projectileContext){
      projectileContext.drawImage(projectileImage, 0, 0, tileSize, tileSize, Math.round(x - (tileSize / 2)), Math.round(y - (tileSize / 2)), tileSize, tileSize);
    };

    var getPlayer = function(){
      return player;
    };

    return {
      getPlayer: getPlayer,
      getX: getX,
      getY: getY,
  		getToRemove: getToRemove,
  		update: update,
  		draw: draw
  	}
};
