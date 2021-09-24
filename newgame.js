// random security stuff

var allowPressKeys = true
var begun = false;

var directions = ""


// score

var scoreMultiplier = 0;
var speed = 50;
var score = 0

var wallSliding = false

// fancy sound 😉

var powerUpSound = new Audio("audio/pickup.mp3");

// Check if browser supports the canvas

function checkSupported() {
  canvas = document.getElementById('canvas')
  if (canvas.getContext) {
    ctx = canvas.getContext('2d')
    this.gridSize = 10
  }
}

// prepare the game to played

function init() {
  clearVar()
  powerUpSound = new Audio("audio/pickup.mp3")
  start()
}

// start the game

function start() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  this.currentPosition = {
    'x': canvas.width / 2,
    'y': canvas.height / 2
  }
  snakeBody = []
  snakeLength = 3
  updateScore()
  makeFoodItem()
  makePowerItem()
  drawSnake()
  direction = 'right'
  begun = true
  play()
}

// store old speed to easily switch between speeds no matter what it was before pausing

var oldSpeed = 50;

// restart the game

function restart() {
  speed = 50
  pause()
  start()
}

// pause the game

function pause() {
  oldSpeed = speed
  speed = 50000
  allowPressKeys = false
}

// begin the actual game

function play() {
  speed = oldSpeed
  moveSnakeRepeat()
  allowPressKeys = true
}

// timer

function wait(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

// Repeat ze snake

async function moveSnakeRepeat() {
  if (speed > 50) speed = 50
  await wait(speed);
  moveSnake()
  requestAnimationFrame(moveSnakeRepeat)
}

// Draw ze snake

function drawSnake() {
  if (snakeBody.some(hasEatenItself)) {
    gameOver()
    return false
  }
  snakeBody.push([currentPosition['x'], currentPosition['y']])
  ctx.fillStyle = "rgb(0,150,0)"
  ctx.fillRect(currentPosition['x'], currentPosition['y'], gridSize, gridSize)
  if (snakeBody.length > snakeLength) {
    var itemToRemove = snakeBody.shift()
    ctx.clearRect(itemToRemove[0], itemToRemove[1], gridSize, gridSize)
  }

  if (currentPosition['x'] == suggestedPoint[0] && currentPosition['y'] == suggestedPoint[1]) {
    makeFoodItem()
    snakeLength += 1
    updateScore()
  }

  if (currentPosition['x'] == suggestedPointPower[0] && currentPosition['y'] == suggestedPointPower[1]) {
    powerUpSound.play()
    makePowerItem()
  }

}


// A lot of movement stuff to make sure it moves on the grid

function leftPosition() {
  return currentPosition['x'] - gridSize
}

function rightPosition() {
  return currentPosition['x'] + gridSize
}

function upPosition() {
  return currentPosition['y'] - gridSize
}

function downPosition() {
  return currentPosition['y'] + gridSize
}

// Even more movement controlling direction

function whichWayToGo(axisType) {
  if (!wallSliding) {
    if (axisType == 'x') {
      a = (currentPosition['x'] > canvas.width) ? moveLeft() : moveRight()
    } else {
      a = (currentPosition['y'] > canvas.height) ? moveUp() : moveDown()
    }
    if (axisType == 'x') {
      a = (currentPosition['x'] < canvas.width) ? moveLeft() : moveRight()
    } else {
      a = (currentPosition['y'] < canvas.height) ? moveUp() : moveDown()
    }
  } else {
    if (axisType == 'x') {
      a = (currentPosition['x'] > canvas.width / 2) ? moveLeft() : moveRight()
    } else {
      a = (currentPosition['y'] > canvas.height / 2) ? moveUp() : moveDown()
    }
  }
}

// Actual call functions to decide which function to use

function moveUp() {
  if (upPosition() >= 0) {
    executeMove('up', 'y', upPosition())
  } else {
    whichWayToGo('x')
  }
}

function moveDown() {
  if (downPosition() < canvas.height) {
    executeMove('down', 'y', downPosition())
  } else {
    whichWayToGo('x')
  }
}

function moveLeft() {
  if (leftPosition() >= 0) {
    executeMove('left', 'x', leftPosition())
  } else {
    whichWayToGo('y')
  }
}

function moveRight() {
  if (rightPosition() < canvas.width) {
    executeMove('right', 'x', rightPosition())
  } else {
    whichWayToGo('y')
  }
}

// MOVE

function executeMove(dirValue, axisType, axisValue) {
  direction = dirValue
  currentPosition[axisType] = axisValue
  drawSnake()
}

// Create Items

function makeFoodItem() {
  suggestedPoint = [Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize]
  if (snakeBody.some(hasPoint)) {
    return makeFoodItem()
  } else {
    ctx.fillStyle = "rgb(200,0,0)"
    ctx.fillRect(suggestedPoint[0], suggestedPoint[1], gridSize, gridSize)
  }
}

// Async so we can use await to use our timer

async function makePowerItem() {
  suggestedPointPower = [Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize, Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize]
  if (snakeBody.some(hasPoint)) {
    makePowerItem()
  } else {
    ctx.fillStyle = "rgb(0,50,200)"
    if (begun) {
      var randomPicker = Math.floor(Math.random() * 4 + 1)
      if (randomPicker != 0) {
        switch (randomPicker) {
          case 1:
            document.getElementById("currentpowerup").innerText = "Current PowerUp: Random Color"

            var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            ctx.fillStyle = randomColor
            break;
          case 2:
            setTimeout(function() {
              scoreMultiplier = 0
              document.getElementById("currentpowerup").innerText = "Current PowerUp: NONE"
            }, 15000)
            scoreMultiplier += 10
            updateMultiScore()
            document.getElementById("currentpowerup").innerText = "Current PowerUp: +10"
            break
          case 3:
            document.getElementById("currentpowerup").innerText = "Current PowerUp: SPEED"
            speed = 10
            await wait(2500)
            speed = 50
            document.getElementById("currentpowerup").innerText = "Current PowerUp: NONE"
            break
          case 4:
            document.getElementById("currentpowerup").innerText = "Current PowerUp: WALL SLIDING"
            setTimeout(function() {
              wallSliding = false;
              document.getElementById("currentpowerup").innerText = "Current PowerUp: NONE"
            }, 15000)
            wallSliding = true
            break
        }
      } else console.log("Error")
    }
    return ctx.fillRect(suggestedPointPower[0], suggestedPointPower[1], gridSize, gridSize)
  }
}

// Collision checks

function hasPoint(element, index, array) {
  return (element[0] == suggestedPoint[0] && element[1] == suggestedPoint[1])
}

function hasEatenItself(element, index, array) {
  return (element[0] == currentPosition['x'] && element[1] == currentPosition['y'])
}

// SCORE STUFF AND DEATHs

function clearVar() {
  score = 0
  scoreMultiplier = 0
  document.getElementById('score').innerText = score
  speed = 50
}

function gameOver() {
  alert("YOU DIED, YOU FOOL.")
  speed = 0
  pause()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  document.getElementById('play_menu')
    .style.display = 'none'
  document.getElementById('restart_menu')
    .style.display = 'block'
}
var newscore = 0

function updateMultiScore() {
  newscore += scoreMultiplier
}

function updateScore() {
  score = (snakeLength - 3) * 10
  document.getElementById('score').innerText = newscore + score
}


// MORE MOVEMENT!!!!!!!!!!!

document.onkeydown = function(event) {
  if (!allowPressKeys) {
    return null
  }
  var keyCode
  if (event == null) {
    keyCode = window.event.keyCode
  } else {
    keyCode = event.keyCode
  }

  switch (keyCode) {
    case 37:
      if (direction != "right") {
        moveLeft()
      }
      break

    case 38:
      if (direction != "down") {
        moveUp()
      }
      break

    case 39:
      if (direction != "left") {
        moveRight()
      }
      break

    case 40:
      if (direction != "up") {
        moveDown()
      }
      break

    default:
      break
  }
}
// EVEN MOOOOOOOOOOOOOORE!!!!
function moveSnake() {
  switch (direction) {
    case 'up':
      moveUp()
      break

    case 'down':
      moveDown()
      break

    case 'left':
      moveLeft()
      break

    case 'right':
      moveRight()
      break
  }
}