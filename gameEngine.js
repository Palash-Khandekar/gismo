let canvasWidth = 960;
let canvasHeight = 720;

let obstacles = [];
let bases = [];

let obstaclesCount = 20;

let xMountain = 150;
let yMountain = 100;
let mountainWidth = 100;
let mountainHeight = 50;

let tankWidth = 20;

let gameOver = false;
let speed = 1;
let deadTanks = [];

let gameWindow = function(game) {
  let colorRed = game.color(249, 67, 54);
  let colorBlue = game.color(66, 80, 244);
  let colorMountain = game.color(183, 154, 97);

  let t = 0;

  let leftMovement = false;
  let upMovement = false;
  let rightMovement = false;
  let downMovement = false;

  game.preload = function() {};

  game.setup = function() {
    canvas = game.createCanvas(canvasWidth, canvasHeight);
    canvas.class("box-shadow");
    canvas.mousePressed(mousePressedOnCanvas);
    game.strokeWeight(2);
    game.stroke(84, 56, 71);
    game.angleMode(game.DEGREES);

    // Bases
    bases = [...bases, new Base(game, 0, colorRed), new Base(game, 1, colorBlue)];
    // Obstacles
    for(let i = 0; i < obstaclesCount; i++){
      while (true){
        let x = __getRandomIntInclusive(10, canvasWidth - 80)
        let y = __getRandomIntInclusive(120, canvasHeight - 220);
        let width = __getRandomIntInclusive(50, 100);
        let height = __getRandomIntInclusive(50, 100)

        let hit =  false;

        for(let base of bases){
          for(let tank of base.tanks){
            hit = game.collideRectRect(x,y,width,height,tank.x,tank.y,tank.width,tank.height);
            if (hit === true){
              break;
            }
          }
          if (hit === true){
            break;
          }
        }

        if(hit === false){
          for(let obstacle of obstacles){
            hit = game.collideRectRect(x,y,width,height,obstacle.x,obstacle.y,obstacle.width,obstacle.height);
            if (hit === true){
              break;
            }
          }
        }

        if (hit === false){
          obstacles = [...obstacles, new Mountain(game, x, y, width, height, colorMountain)];
          break;
        }
      }
    }
  };

  game.draw = function() {
    
    // movement through nn
    for (var i = 0; i < speed; i++) {
      t += 1;
      bases.forEach(function(base) {
        let indexBase = bases.indexOf(base); 
        let opponentBase = (indexBase === 0) ? bases[1] : bases[0];
        base.tanks.forEach(function(tank){
          let friendlyTanks = base.tanks.filter(t => t !=  tank);
          tank.train();
          let direction = tank.predictMovementDirection();
          tank.checkForCollisionAndMove(obstacles.concat(opponentBase, opponentBase.tanks, base, friendlyTanks), direction);

          if (t % 60 === 0) {
            tank.moveTurret();
            t = 0;
          }
        });
      });
    }

    // movement through keyboard
    // let opponentBase = bases[1];
    // if (bases[0].tanks[0] != undefined)
    // if (game.keyIsDown(game.LEFT_ARROW)) {
    //     if (!(bases[0].tanks[0].__checkCollision(obstacles.concat(opponentBase, opponentBase.tanks), 0)) || leftMovement){
    //       bases[0].tanks[0].x -=1;
    //       leftMovement = false;
    //       upMovement = false;
    //       downMovement = false;
    //       rightMovement = false;
    //     } else {
    //       leftMovement = false;
    //       upMovement = true;
    //       downMovement = true;
    //       rightMovement = true;
    //     }
    // } else if (game.keyIsDown(game.RIGHT_ARROW)) {
    //     if (!(bases[0].tanks[0].__checkCollision(obstacles.concat(opponentBase, opponentBase.tanks), 1)) || rightMovement){
    //       bases[0].tanks[0].x += 1;
    //       leftMovement = false;
    //       upMovement = false;
    //       downMovement = false;
    //       rightMovement = false;
    //     } else {
    //       leftMovement = true;
    //       upMovement = true;
    //       downMovement = true;
    //       rightMovement = false;
    //     }
    // } else if (game.keyIsDown(game.UP_ARROW)) {
    //     if (!(bases[0].tanks[0].__checkCollision(obstacles.concat(opponentBase, opponentBase.tanks), 2)) || upMovement){
    //       bases[0].tanks[0].y -= 1;
    //       leftMovement = false;
    //       upMovement = false;
    //       downMovement = false;
    //       rightMovement = false;
    //     } else{
    //       leftMovement = true;
    //       upMovement = false;
    //       downMovement = true;
    //       rightMovement = true;
    //     }
    // } else if (game.keyIsDown(game.DOWN_ARROW)) {
    //     if (!(bases[0].tanks[0].__checkCollision(obstacles.concat(opponentBase, opponentBase.tanks), 3)) || downMovement){
    //       bases[0].tanks[0].y += 1;
    //       leftMovement = false;
    //       upMovement = false;
    //       downMovement = false;
    //       rightMovement = false;
    //     } else {
    //       leftMovement = true;
    //       upMovement = true;
    //       downMovement = false;
    //       rightMovement = true;
    //     }
    // }


    display();
    checkGameResult();
    // game.noLoop();
  };

  display = function() {
    game.background(242, 230, 193);
    obstacles.forEach(function(obstacle) {
      obstacle.display();
    });

    bases.forEach(function(base) {
      let indexBase = bases.indexOf(base);
      let opponentBase = (indexBase === 0) ? bases[1] : bases[0];
      base.tanks.forEach(function(tank){
        let friendlyTanks = base.tanks.filter(t => t !=  tank)
        tank.bullets.forEach(function(bullet){
          bullet.display();
          bullet.update();
          if(bullet.collide(obstacles.concat(opponentBase, opponentBase.tanks, base, friendlyTanks))) {
            tank.bullets.splice(tank.bullets.indexOf(bullet), 1);
          }
        });
      });
      base.display(obstacles);
    });
  };

  checkGameResult = function(){
    if((bases[0].health === 0 && bases[1].health === 0) || (bases[0].tanks.length === 0 && bases[1].tanks.length === 0)){
      console.log("It's a tie");
      gameOver = true;
      game.noLoop();
    }
    bases.forEach(function(base){
      if (base.tanks.length === 0 || base.health <= 0){
        let baseIndex = (bases.indexOf(base) == 0) ? "Blue" : "Red";
        console.log("Winner Winner Chicken Dinner!!\nTeam " + baseIndex + " won");
        gameOver = true;
        game.noLoop();
      }
    });

    if(gameOver){
      bases.forEach(function(base){
          deadTanks = (base.tanks.length === 0) ? 
                        [...deadTanks, ...base.deadTanks] :
                        [...deadTanks, ...base.deadTanks, ...base.tanks];
      });
    }
  }

  game.keyPressed = function() { 
    if (game.keyCode === 65) {
      bases[0].tanks[0].turretAngle -= 45;
    } else if (game.keyCode === 68) {
      bases[0].tanks[0].turretAngle += 45;
    }
  }; 
};
let cnv = new p5(gameWindow, "gameWindow");

function __getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function toggleFOV(){
  bases.forEach(function(base) {
    base.tanks.forEach(function(tank){
      tank.showFOV = (tank.showFOV) ? false : true;
    });
  });
}

function mousePressedOnCanvas(){
  bases.forEach(function(base) {
    base.tanks.forEach(function(tank){
      tank.fire();
    });
  });
}