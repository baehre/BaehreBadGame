var Projectile = function(entity, xP, yP, direction, can, level, enemies) {
    var canvas = can;
    var projectileImage = new Image();
    projectileImage.src = "SpriteSheets/BulletSprites/bulletSprites.png";
    //these should eventually come in from whomever is firing
    var projectileSpeed = 5;
    var projectileRange = 300;
    var projectileDamage = 20;
    var tileSize = 16;
    var scale = 1;
    var size = tileSize * scale;
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

    var getEnemies = function() {
      return enemies;
    };

    var getSize = function() {
      return size;
    };

    var setX = function(newX) {
      x = newX;
    };

    var setY = function(newY) {
      y = newY;
    };

    var setEnemies = function(newEnemies) {
      enemies = newEnemies;
    };

    var setSize = function(newSize) {
      size = newSize;
    }

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
        right = checkTile(getTile(pixelX, pixelY)) || checkHit(pixelX, pixelY);
      }
      else if(newX < 0){
        var pixelX = projX - (size  / 2);
        var pixelY = projY;
        left = checkTile(getTile(pixelX, pixelY)) || checkHit(pixelX, pixelY);
      }
      if(newY > 0){
        var pixelX = projX;
        var pixelY = projY + (size / 2);
        down = checkTile(getTile(pixelX, pixelY)) || checkHit(pixelX, pixelY);
      }
      else if(newY < 0){
        var pixelX = projX;
        var pixelY = (projY - size / 2);
        up = checkTile(getTile(pixelX, pixelY)) || checkHit(pixelX, pixelY);
      }
      return up || down || left || right;
    };

    var getTile = function(x0, y0){
      var tileX = Math.floor(x0/48.0);
      var tileY = Math.floor(y0/48.0);
      return {x: tileX, y: tileY};
	  };

    var checkTile = function(tile){
      if (level[tile.y][tile.x] > 10) {
        return true;
      } else {
        return false;
      }
    };

    var checkHit = function(x0, y0) {
      for(var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        var tempX = enemy.getX();
        var tempY = enemy.getY();
        var tempSize = enemy.getSize();
        var left = tempX - (tempSize / 2);
        var right = tempX + (tempSize / 2);
        var top = tempY - (tempSize / 2);
        var bottom = tempY + (tempSize / 2);
        //pass in point + sides of rectangle
        if (rectIntersection(x0, y0, left, right, top, bottom)) {
          enemy.setHealth(enemy.getHealth() - projectileDamage);
          return true;
        }
      }
      return false;
    };

    var rectIntersection = function(x0, y0, left, right, top, bottom) {
      if (x0 >= left && x0 <= right && y0 <= bottom && y0 >= top) {
        return true;
      }
      return false;
    };

    var getToRemove = function(){
      return toRemove;
    };

    var setToRemove = function(newRemove) {
      toRemove = newRemove;
    };

    var draw = function(projectileContext){
      projectileContext.drawImage(projectileImage, 0, 0, tileSize, tileSize, Math.round(x - (tileSize / 2)), Math.round(y - (tileSize / 2)), tileSize, tileSize);
    };

    var getEntity = function(){
      return entity;
    };

    var setEntity = function(newEntity) {
      entity = newEntity;
    };

    return {
      getEntity: getEntity,
      getX: getX,
      getY: getY,
  		getToRemove: getToRemove,
      getSize: getSize,
      getEnemies: getEnemies,
      setEntity: setEntity,
      setX: setX,
      setY: setY,
      setToRemove: setToRemove,
      setSize: setSize,
      setEnemies: setEnemies,
  		update: update,
  		draw: draw
  	}
};
