function Bullet(dir1, dir2, speed, position) {
  var bullet = {};

  bullet.radius = 0.3;
  bullet.speed = speed;
  bullet.zSpeed = dir1 * speed;
  bullet.xSpeed = dir2 * speed;

  bullet.material = {
    bullet: new THREE.MeshLambertMaterial({ color: 'orange' })
  };

  // ======>> Bullet building
  bullet.bulleter = new THREE.Mesh(new THREE.SphereGeometry(bullet.radius), bullet.material.bullet );

  bullet.move = function(){
    this.bulleter.position.z += this.zSpeed/10;
    this.bulleter.position.x += this.xSpeed/10;
  };

  bullet.hit = function(tanks,cb){
    for(var tank in tanks){
      if(tank !== tanks._id && tank !== '_id'){
        var dx = Math.abs(tanks[tank].tanker.position.x - this.bulleter.position.x);
        var dy = Math.abs(tanks[tank].tanker.position.y - this.bulleter.position.y);
        var dz = Math.abs(tanks[tank].tanker.position.z - this.bulleter.position.z);
        
        if(dx < 0.5 && dy < 0.5 && dz < 0.5) {
          // console.log('hit', tank)
          cb(tank,this)
        }
      }
    }
  }

  return bullet;
}