// what gets drawn on
var canvas;
// the context used to draw things on the canvas
var context;
//players health bar
var healthBar;
// keys pressed for the player.
var keys;
//the player playing
var localPlayer;
// whether to pause the game
var pause = false;
// the paused div
var paused;
// the list of projectiles currently in the game
var projectiles;
// the emitters in the game
var emitters;
// sprites used to draw the background
var backgroundSprites;
// how large a tile would be
var tileSize = 16;
// scale the tilesize
var scale = 3;
// all the enemies in the game currently
var enemies;
// basically what I said above
var backgroundTileSize = tileSize * scale;
// the current screen the player is on
var currentScreen = null;
// the coordinates for the levelArray to be used
var currentScreenX = 0;
var currentScreenY = 0;
// used for fade in and out
var alpha = 0;
var delta = 0.05;
var levelData;
//level data. saying which tiles to use.
var startLevelData = [
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11],
[11,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,0,11,11,11,11,11,11,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,11,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,11,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,11,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,312],
[11,2,0,2,0,2,0,2,11,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,310],
[11,0,2,0,2,0,2,0,11,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,11,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,11,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,11,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,11,11,11,11,11,11,11,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11]];

// to be used for boss fight?
var bossLevelData = [
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11],
[11,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,0,2,0,2,0,2,11],
[11,0,2,0,2,0,2,0,2,0,2,0,2,0,11],
[11,2,0,2,0,2,0,2,2,2,0,2,0,2,11],
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11]];


var levelArray = [[{"level": startLevelData, "spawn": {"x": 100, "y": 300}}, {"level": bossLevelData, "spawn": {"x": 100, "y": 300}}]];

function init(){
  //set globals
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  paused = document.getElementById("paused");
  // player health bar
  healthBar = document.getElementById("healthBar");
  backgroundSprites = new Image();
  backgroundSprites.src = "SpriteSheets/LevelSprites/levelElementSprites48.png";

  canvas.width = 900;
  canvas.height = 504;

  currentScreen = levelArray[currentScreenX][currentScreenY]; 
  levelData = currentScreen.level;
  enemies = [];
  projectiles = [];
  emitters = [];
  //keys.js
  keys = new Keys();
  //player.js
  //localPlayer = new Player(this, canvas, 100, 300, levelData, enemies);
  localPlayer = new Player(this, canvas, currentScreen.spawn.x, currentScreen.spawn.y, levelData, enemies);
  //made a function that adds an enemy and updates the enemies for the player
  //addBoss(300, 300);
  addChaser(200, 100);
  addBuffer(300, 300);
  addShielder(300, 100);
  addShooter(400, 100);
  addChaser(200, 600);
  addShielder(300, 600);
  addShooter(400, 600);
  //sets all the event handlers
  setEventHandlers();
}

function setEventHandlers(){
  //checking for keys
  window.addEventListener("keydown", keyDown, false);
  window.addEventListener("keyup", keyUp, false);
}

// when the key is pressed
function keyDown(e){
  // enter key hit
  if (e.keyCode === 13) {
    // pause or unpause
    pause = !pause;
    paused.classList.toggle('hidden', !pause);
    draw();
  }
  if (localPlayer) {
    keys.onKeyDown(e);
  }
}

//when the key is let go of
function keyUp(e){
  if(localPlayer){
    keys.onKeyUp(e);
  }
}

// how the game actually runs
function gameLoop(){
  if (!document.hasFocus()) {
    if(!pause) {
      pause = true;
      paused.classList.toggle('hidden', false);
      // call draw one more time for the fixed image with the global alpha
      draw();
    }
  }
  if (!pause) {
    update();
    draw();
  }

  //the magic by Paul Irish.
  // chooses the time called based on browser info
  // (like 60 or 30 based on what the browser can handle)
  window.requestAnimFrame(gameLoop);
}

// updates the data for player enemies and projectiles
function update(){
  updatePlayer();
  updateEnemies();
  updateEmitters();
  updateProjectiles();
}

// update the player
function updatePlayer(){
  var playerHealth = localPlayer.getHealth();
  var fullHealth = localPlayer.getFullHealth();
  if(playerHealth !== fullHealth) {
    var percent = (playerHealth / fullHealth) * 100;
    if (percent < 25) {
      healthBar.style.backgroundColor = '#ff0000';
    } else if (percent < 75) {
      healthBar.style.backgroundColor = '#ffff00';
    } else {
      healthBar.style.backgroundColor = '#00ff00';
    }
    healthBar.style.width = percent.toString() + '%';
  }
  localPlayer.update(keys);
  checkNewScreen();
}

function checkNewScreen() {
  var tempX = Math.floor(localPlayer.getX() / 48.0);
  var tempY = Math.floor(localPlayer.getY() / 48.0);
  if (tempX > -1 && tempX < currentScreen.level[0].length && tempY > -1 && tempY < currentScreen.level.length) {
    if (currentScreen.level[tempY][tempX] > 100) {
      pause = true;
      var direction = Math.floor(currentScreen.level[tempY][tempX] / 100);
      if (direction === 1) {
        currentScreenX = currentScreenX - 1;
      } else if (direction === 2) {
        currentScreenY = currentScreenY - 1;
      } else if (direction === 3) {
        currentScreenX = currentScreenX + 1;
      } else if (direction === 4) {
        currentScreenY = currentScreenY + 1;
      }
      // do stuff here
      fadeNewLevel();
    }
  }
}

function fadeNewLevel() {
  /// increase alpha with delta value
  alpha += delta;
  //// if delta <=0 or >=1 then reverse
  if (alpha <= 0 || alpha >= 1) delta = -delta;
  /// set global alpha
  //wipe it
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  //shifts the canvas based around where the player is
  context.translate(Math.round(canvas.width/2 - localPlayer.getX()), Math.round(canvas.height/2 - localPlayer.getY()));
  context.globalAlpha = alpha;
  // draw the layers. background first. otherwise doesn't really matter
  drawBackground();
  drawEnemies();
  drawPlayer();
  drawEmitters();
  drawProjectiles();
  // keep the context bueno
  context.restore();
  // basically can't see anything
  if (alpha > .9) {
    currentScreen = levelArray[currentScreenY][currentScreenX];
    localPlayer.setX(currentScreen.spawn.x);
    localPlayer.setY(currentScreen.spawn.y);
    updateLevels(currentScreen.level);
    levelData = currentScreen.level;
  }
  /// loop using rAF
  if (alpha > 0.0) {
    window.requestAnimFrame(fadeNewLevel);
  } else {
    pause = false;
  }
}

//update all the projectiles
function updateProjectiles(){
  for(var i = 0; i < projectiles.length; i++){
    //var tempProjectile = projectiles[i];
    projectiles[i].update();
  }
}

// upadte the chasers
function updateEnemies(){
  for (var i = 0; i < enemies.length; i++) {
    //var enemy = enemies[i];
    //pass in enemies to check for inter-enemy collision
    enemies[i].update(enemies);
  }
}

function updateEmitters() {
  for (var i = 0; i < emitters.length; i++) {
    //var emitter = emitters[i];
    emitters[i].update();
  }
}

//draws everything on the canvas
function draw(){
  //wipe it
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  //shifts the canvas based around where the player is
  context.translate(Math.round(canvas.width/2 - localPlayer.getX()), Math.round(canvas.height/2 - localPlayer.getY()));
  context.globalAlpha = 1.0;
  if(pause) {
    context.globalAlpha = 0.6;
  }
  // draw the layers. background first. otherwise doesn't really matter
  drawBackground();
  drawEnemies();
  drawPlayer();
  drawEmitters();
  drawProjectiles();
  // keep the context bueno
  context.restore();
}

function drawBackground(){
  // the coordinates for each type of tile
  var grassSprite = {x : 0, y : 0};
  var rockSprite = {x : 0, y : 96};
  var rockSprite2 = {x: 48, y: 96};
  var grassSprite2 = {x : 0, y : 48};
  var voidSprite = {x : 48, y: 0};
  for(var y = 0; y < levelData.length; y++){
    for(var x = 0; x < levelData[0].length; x++){
      var tileNum = levelData[y][x];
      //so. draw the appropriate sprite. at an x and y coordinate * 48 since that's how
      //many pixels we want each sprite to take up
      // by using Mod we can make tiles solid if we want.
      if (tileNum % 10 === 0) {
        context.drawImage(backgroundSprites, grassSprite.x, grassSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if (tileNum % 10 === 1) {
        context.drawImage(backgroundSprites, rockSprite.x, rockSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if (tileNum % 10 === 2) {
        context.drawImage(backgroundSprites, grassSprite2.x, grassSprite2.y, backgroundTileSize, backgroundTileSize, Math.round(x*tileSize*scale), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if (tileNum % 10 === 3) {
        context.drawImage(backgroundSprites, rockSprite2.x, rockSprite2.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else {
        context.drawImage(backgroundSprites, voidSprite.x, voidSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
    }
  }
}

// only draw the player if he has health. otherwise reset him (or her)
function drawPlayer(){
  if(localPlayer.getHealth() <= 0) {
    localPlayer.setX(100);
    localPlayer.setY(300);
    localPlayer.setHealth(100);
    healthBar.style.width = '100%';
    healthBar.style.backgroundColor = '#00ff00';
  } else {
    localPlayer.draw(context);
  }
}

// draw the enemy if he has health. otherwise remove him from the array and update the players enemies
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

function drawEmitters() {
  for (var i = 0; i < emitters.length; i++) {
    var emitter = emitters[i];
    if (emitter.getToRemove()) {
      emitters.splice(i, 1);
    } else {
      emitter.draw(context);
    }
  }
}

function drawProjectiles(){
  //handle the player projectiles
  var temp = localPlayer.getProjectiles()
  for(var i = 0; i < temp.length; i++) {
    var tempProjectile = temp[i];
    if(tempProjectile.getToRemove()){
      temp.splice(i, 1);
    }
    else{
      tempProjectile.draw(context);
    }
  }
  localPlayer.setProjectiles(temp);
  //set projectiles to the global
  projectiles = temp.slice();
  // now handle enemies projectiles
  for(var j = 0; j < enemies.length; j++) {
    // if they can even shoot
    if(enemies[j].hasOwnProperty('getProjectiles')) {
      var enemyProj = enemies[j].getProjectiles();
      for(var k = 0; k < enemyProj.length; k++) {
        var tempProjectile = enemyProj[k];
        if(tempProjectile.getToRemove()){
          enemyProj.splice(k, 1);
        }
        else{
          tempProjectile.draw(context);
        }
      }
      enemies[j].setProjectiles(enemyProj);
      projectiles = projectiles.concat(enemyProj.slice());
    }
  }
}

//adds a chaser to the game
function addChaser(chaserX, chaserY){
  enemies.push(new Chaser(this, chaserX, chaserY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}

//adds a shooter to the game
function addShooter(shooterX, shooterY){
  enemies.push(new Shooter(this, shooterX, shooterY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}

// adds a shielder to the game
function addShielder(shielderX, shielderY) {
  enemies.push(new Shielder(this, shielderX, shielderY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}

function addBoss(bossX, bossY) {
  enemies.push(new Boss(this, bossX, bossY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}

function addBuffer(bufferX, bufferY) {
  enemies.push(new Buffer(this, bufferX, bufferY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}

// this is almost always going to be called somewhere other than here
function addEmitter(emitterX, emitterY, amount, life, color) {
  emitters.push(new Emitter(this, levelData, emitterX, emitterY, amount, life, color));
}

function updateLevels(newLevel) {
  // update the players level
  localPlayer.setLevel(newLevel);
  // reset all the arrays since we are starting from scratch
  enemies = [];
  projectiles = [];
  emitters = [];
}
