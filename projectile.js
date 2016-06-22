var Projectile = function(player, xP, yP, direction, can) {
    var canvas = can;
    var projectileImage = new Image();
    projectileImage.src = "SpriteSheets/BulletSprites/bulletSprites.png";
    var projectileSpeed = 4;
    var projectileRange = 200;
    var projectileDamage = 20;
    var tileSize = 16;
    var scale = 3;
    //-14 and -10 are to adjust for where it is firing on the sprite.
    var x = xP - 14;
    var y = yP - 10;
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
      x = x + newX;
      y = y + newY;

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

    var getToRemove = function(){
      return toRemove;
    };

    var draw = function(projectileContext){
      projectileContext.drawImage(projectileImage, 0, 0, tileSize, tileSize, Math.round(x-tileSize), Math.round(y-tileSize), tileSize, tileSize);
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
