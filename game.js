var canvas;
var context;
var keys;
var localPlayer;
var chaser;
var projectiles;
var backgroundSprites;
var tileSize = 16;
var scale = 3;
var enemies = [];
var backgroundTileSize = tileSize * scale;
//level data. saying which tiles to use.
var levelData = [
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,11,11,11,11,11,11,0,2,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,2,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,2,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11]];


function init(){
  //set globals
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  backgroundSprites = new Image();
  backgroundSprites.src = "SpriteSheets/LevelSprites/levelElementSprites48.png";

  canvas.width = 900;
  canvas.height = 504;

  //keys.js
  keys = new Keys();
  //player.js
  localPlayer = new Player(canvas, 100, 300, levelData, enemies);
  addChaser(300, 100);
  projectiles = [];
  //sets all the event handlers
  setEventHandlers();
}

function setEventHandlers(){
  //checking for keys
  window.addEventListener("keydown", keyDown, false);
  window.addEventListener("keyup", keyUp, false);
}

function keyDown(e){
  if(localPlayer){
    keys.onKeyDown(e);
  }
}

function keyUp(e){
  if(localPlayer){
    keys.onKeyUp(e);
  }
}

function gameLoop(){
  update();
  draw();
  //the magic by Paul Irish. Apparently much smoother rendering
  window.requestAnimFrame(gameLoop);
}

function update(){
  updatePlayer();
  updateChasers();
  updateProjectiles();
}

function updatePlayer(){
  localPlayer.update(keys);
}

function updateProjectiles(){
  for(var i = 0; i < projectiles.length; i++){
    var tempProjectile = projectiles[i];
    tempProjectile.update();
  }
}

function updateChasers(){
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    enemy.update();
  }
}

function draw(){
  //wipe it
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  //shifts the canvas based around where the player is
  context.translate(Math.round(canvas.width/2 - localPlayer.getX()), Math.round(canvas.height/2 - localPlayer.getY()));
  drawBackground();
  drawEnemies();
  drawPlayer();
  drawProjectiles();
  context.restore();
}

function drawBackground(){
  var grassSprite = {x : 0, y : 0};
  var rockSprite = {x : 0, y : 96};
  var flowerSprite = {x : 0, y : 48};
  var voidSprite = {x : 48, y: 0};
  for(var y = 0; y < levelData.length; y++){
    for(var x = 0; x < levelData[0].length; x++){
      var tileNum = levelData[y][x];
      //so. draw the appropriate sprite. at an x and y coordinate * 48 since that's how
      //many pixels we want each sprite to take up
      if(tileNum % 10 === 0){
        context.drawImage(backgroundSprites, grassSprite.x, grassSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if(tileNum % 10 === 1){
        context.drawImage(backgroundSprites, rockSprite.x, rockSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if(tileNum % 10 === 2){
        context.drawImage(backgroundSprites, flowerSprite.x, flowerSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*tileSize*scale), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else{
        context.drawImage(backgroundSprites, voidSprite.x, voidSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
    }
  }
}

function drawPlayer(){
  if(localPlayer.getHealth() <= 0) {
    localPlayer.setX(100);
    localPlayer.setY(300);
    localPlayer.setHealth(100);
  } else {
    localPlayer.draw(context);
  }
}

function drawEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (enemy.getHealth() <= 0) {
      enemies.splice(i, 1);
      localPlayer.setEnemies(enemies);
    } else {
      enemy.draw(context);
    }
  }
}

function drawProjectiles(){
  //get the players projectiles and add them to the overall list
  projectiles = localPlayer.getProjectiles();
  // NOTE: for later concat the array here
  for(var i = 0; i < projectiles.length; i++){
    var tempProjectile = projectiles[i];
    if(tempProjectile.getToRemove()){
      projectiles.splice(i, 1);
    }
    else{
      tempProjectile.draw(context);
    }
  }
  // NOTE: this needs to be changed when we have shooting enemies
  localPlayer.setProjectiles(projectiles);
}

function addChaser(chaserX, chaserY){
  enemies.push(new Chaser(chaserX, chaserY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}
