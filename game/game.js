var map = Map(50,50,3,3);
var tank = Tank(1,1,1, 'blue', 0.1);
var tankRed = Tank(1,1,1, 'red', 0.1);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var socket = io();
  socket.on('message',function(d){
    console.log(d);
  });
  socket.on('broadcast',function(d){
    console.log(d);
  })

  window.sendMsg = function(msg){
    socket.emit('send',msg)
  }

var speed = 0;
var spin = 0
var direction = 0;
var speed2 = 0;
var spin2 = 0
var direction2 = 0;

var fire = false;
var noFire = false;
var fire2 = false;
var noFire2 = false;

var timer;
var timer2;
var timerP = 0;

socket.on('move',function(state){
  // if(!isMoving){ 
    tankRed.tanker.position.x = state.x;
    tankRed.tanker.position.y = state.y;
    tankRed.tanker.position.z = state.z;
    tankRed.tanker.rotation.x = state.rx;
    tankRed.tanker.rotation.y = state.ry;
    tankRed.tanker.rotation.z = state.rz;
    fire2 = state.fire;
    noFire2 = state.noFire;
    // speed2 = state.speed;
    // spin2 = state.spin;
    direction2 = state.direction;
    timer2 = state.timer;
  // }
})


//Add tank to map
map.scene.add( tank.tanker );
map.scene.add( tankRed.tanker );

//Initialize Camera position

// camera.position.y = 40;
// camera.position.z = 0; 
// camera.lookAt({x:0, y:0, z:0});

//Set renderer size
renderer.setSize( WIDTH, HEIGHT );
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.BasicShadowMap;

//Append canvas element to body;
document.body.appendChild( renderer.domElement );

//direction system


// var isMoving = false;

//Add event handler
window.onkeydown = function(d){
  // console.log(d.keyCode);
  //W key
  if(d.keyCode === 87){
    speed = -tank.speed;
  }
  //S key
  if(d.keyCode === 83){
    speed = tank.speed;
  }
  //D key
  if(d.keyCode === 68){
    spin = 0.05;
  }
  //A key
  if(d.keyCode === 65){
    spin = -0.05;
  }
  //space
  if (d.keyCode === 32){
    fire = true;
  }
  // isMoving = true;

  //c
  if(d.keyCode === 67){
      var counter = 0;
      setInterval(function(){
        if (counter < 50){
          tank.tanker.position.y += 0.06
          counter++
        }

        if (counter >= 50 && counter < 100){
          tank.tanker.position.y -= 0.06
          counter++
        }
      }, 10)
  }
}
window.onkeyup = function(d){
  //W ke
  if(d.keyCode === 87){
    speed = 0;
  }
  //S ke
  if(d.keyCode === 83){
    speed = 0;
  }
  //D key
  if(d.keyCode === 68){
    spin = 0;
  }
  //A key
  if(d.keyCode === 65){
    spin = 0;  
  }
  //space
  if (d.keyCode === 32){
    fire = false;
  }
  // isMoving = false;
  var pos = {
      x: tank.tanker.position.x,
      y: tank.tanker.position.y,
      z: tank.tanker.position.z,
      rx: tank.tanker.rotation.x,
      ry: tank.tanker.rotation.y,
      rz: tank.tanker.rotation.z,
      speed: speed,
      spin: spin,
      direction: direction,
      fire: fire,
      noFire: noFire,
      timer: timer
    };
  socket.emit('sync',pos);
}



// Start of render and animation
function render() {
  requestAnimationFrame( render );
  timer = Date.now()

  map.light.position.set(-camera.position.x, camera.position.y, camera.position.z);

  //Firing
  if(!noFire && fire){
    tank.fire(direction);
    noFire = true;
    setTimeout(function(){
      noFire = false;
    },250)
  }
  if (Date.now() - timerP >= 250){
    if(!noFire && fire2){
      tankRed.fire(direction2);
      timerP = Date.now();
      noFire2 = true;
      setTimeout(function(){
        noFire2 = false;
      },250)
    }
  }

  //Bullets movement and collision check
  for (var i = 0; i < tank.firedBullets.length; i++){
    if (!tank.firedBullets[i].hit && Math.sqrt(Math.pow((tank.firedBullets[i].bulleter.position.x - tankRed.tanker.position.x), 2) + Math.pow((tank.firedBullets[i].bulleter.position.z - tankRed.tanker.position.z), 2))/10 < 0.2){
      console.log("You have hit the red Tank!!!!")
      tank.firedBullets[i].hit = true;
      map.scene.remove(tank.firedBullets[i].bulleter);
    } else if (!tank.firedBullets[i].hit){
      tank.firedBullets[i].move();
    }
  }  

  for (var i = 0; i < tankRed.firedBullets.length; i++){
    if (!tankRed.firedBullets[i].hit && Math.sqrt(Math.pow((tankRed.firedBullets[i].bulleter.position.x - tank.tanker.position.x), 2) + Math.pow((tankRed.firedBullets[i].bulleter.position.z - tank.tanker.position.z), 2))/10 < 0.2){
      console.log("You have been hit!!!!")
      tankRed.firedBullets[i].hit = true;
      map.scene.remove(tankRed.firedBullets[i].bulleter);
    } else if (!tankRed.firedBullets[i].hit){
      tankRed.firedBullets[i].move();
    }
  }

  direction += spin;
  if (Math.abs(tank.tanker.position.x + Math.cos(direction)*speed) <= map.x/2){
    tank.tanker.position.x += Math.cos(direction)*speed;
  }
  if (Math.abs(tank.tanker.position.z + Math.sin(direction)*speed) <= map.y/2){
    tank.tanker.position.z += Math.sin(direction)*speed
  }

  // tank.tanker.position.z += Math.sin(direction)*speed;
  tank.tanker.rotation.y = -direction;

  //FPS
  camera.position.x = tank.tanker.position.x + Math.cos(direction)*5;
  camera.position.y = tank.tanker.position.y + 2;
  camera.position.z = tank.tanker.position.z + Math.sin(direction)*5;
  camera.rotation.y = Math.PI/2-direction;

  renderer.render( map.scene, camera );


  // if(isMoving){
    var pos = {
      x: tank.tanker.position.x,
      y: tank.tanker.position.y,
      z: tank.tanker.position.z,
      rx: tank.tanker.rotation.x,
      ry: tank.tanker.rotation.y,
      rz: tank.tanker.rotation.z,
      speed: speed,
      spin: spin,
      direction: direction,
      fire: fire,
      noFire: noFire,
      timer: timer
    };
    socket.emit('sync',pos);
  // }
}
render();
