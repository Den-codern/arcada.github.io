const KEYS = {
 LEFT:37,
 RIGHT:39,
 SPACE:32
}


let game = {

 ctx: null,
 running:true,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    score:0,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    sounds:{
      bump:null
    },
	init() {
        this.ctx = document.getElementById('mycanvas').getContext('2d');
        this.setEvent();
        this.textRender();
	},
setEvent() {
       window.addEventListener("keydown", e => {
            if (e.keyCode === KEYS.SPACE) {
            	this.platform.fire();
            } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
                this.platform.start(e.keyCode);
            }
        });
        window.addEventListener("keyup", e => {
            this.platform.stop();
        });
},
	preload(callback) {
		let loaded = 0;
		let req =  Object.keys(this.sprites).length;
		 req +=  Object.keys(this.sounds).length;
		let onSrcLoad = () => {
               ++loaded;
               if(loaded >= req) {
                 callback();
               }
            }
       this.preloadSprites(onSrcLoad);
       this.preloadAudion(onSrcLoad);
	},

    preloadSprites(onSrcLoad) {
       for(let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = "img/" + key + ".png";
            this.sprites[key].addEventListener("load",onSrcLoad);
        }
    },
    preloadAudion(onSrcLoad) {
    	 for(let key in this.sounds) {
            this.sounds[key] = new Audio("sounds/" + key + ".mp3");
            this.sounds[key].addEventListener("canplaythrough",onSrcLoad,{once:true});
        }
    },
create() {
	for(let row = 0;row < this.rows;row++) {
        for(let col = 0;col < this.cols;col++) {
               this.blocks.push({
               	active:true,
               	 width: 60,
                height: 20,
               	x:64 * col + 65,
               	y:24 * row + 35
               });
        }
	}
},
update() {
	this.platform.collideWorldBounds();
	this.platform.move();
	this.ball.move();
	this.ball.collideWorldBounse();
    this.collideBlocks();
    this.collidePlatform();

	
},
addScore() {
 ++this.score;
 if(this.score >= this.blocks.length) {
       this.end("Вы победили");
 }
},
collideBlocks() {
      for(let block of this.blocks) {
      	if(block.active) {
             if(this.ball.collide(block)) {
              this.ball.bumpBlock(block);
              this.addScore();
              this.sounds.bump.play();
         }
      	}
        
	};    
},
collidePlatform() {
if(this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
       this.sounds.bump.play();
	};
},
	run() {
    if(this.running) {
		window.requestAnimationFrame(() => {
			this.update();
			this.render();
			this.run();
		})
	}

	},

	render() {
		this.ctx.drawImage(this.sprites.background,0,0);
		this.ctx.drawImage(this.sprites.ball,this.ball.frame * this.ball.width,0,this.ball.width,this.ball.height,this.ball.x,this.ball.y,this.ball.width,this.ball.height);
		this.ctx.drawImage(this.sprites.platform,this.platform.x,this.platform.y);
         this.blocksRender();
         
         this.ctx.fillText("Score: " + this.score,15,20);
	},

	textRender(){
       this.ctx.font = "20px  Arial"
         this.ctx.fillStyle = "#ffffff"
         
	},

	blocksRender() {
            for(let block of this.blocks) {
 	             if(block.active) {
            this.ctx.drawImage(this.sprites.block,block.x,block.y,);
        }
         }
	},

	start:function() {
		this.init();
		this.preload(() => {
			this.create();
			this.run();
		});
	},
	random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    end(massege) {
    	this.running = false;
    	alert(massege);
    	window.location.reload();
    }
}

game.ball = {
	 dx: 0,
    dy: 0,
    velocity: 3,
    frame:0,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    bumpBlock(block) {
          this.dy *= -1;
          block.active = false;
    },
  bumpPlatform(platform) {
  	if(platform.dx) {
     this.x += platform.dx;
  	}
  	if(this.dy > 0) {
        this.dy = -this.velocity;
        let touchX = this.x + this.width / 2;
        this.dx = this.velocity * platform.getTouchOffset(touchX);
  	}
  	
  	},
  	collideWorldBounse() {
  		let x = this.x + this.dx;
    	let y = this.y + this.dy;


    	let ballLeft = x;
    	let ballRight = ballLeft + this.width;
    	let ballTop = y;
    	let ballBottom = ballTop + this.height;

    	let worldLeft = 0;
    	let worldRight = 640;
    	let worldTop = 0;
    	let worldBottom = 360;


    	if(ballLeft < worldLeft) {
    		this.x = 0;
           this.dx = this.velocity;
            game.sounds.bump.play();
    	}else if(ballRight > worldRight) {
    		this.x = worldRight - this.width;
            this.dx = -this.velocity
             game.sounds.bump.play();
    	}else if(ballTop < worldTop) {
           this.dy = this.velocity;
            game.sounds.bump.play();
    	}else if(ballBottom > worldBottom) {
    		 game.end("Вы проиграли");
        }
    	
      
    },

    collide(element) {
    	let x = this.x + this.dx;
    	let y = this.y + this.dy;
            if(x + this.width > element.x &&
            	x < element.x + element.width &&
            	y + this.height > element.y &&
            	y < element.y + element.height) {
            	return true;
            }else {
            	return false;
            }
    },
    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, this.velocity);
        this.animate();
       
    },
    animate(){
       setInterval(() => {
        	++this.frame;
        	if(this.frame > 3) {
               this.frame = 0;
        	}
        },100)
    },

    move() {
        if (this.dy) {
            this.y += this.dy;
        }
        if (this.dx) {
            this.x += this.dx;
        }
    }
};

game.platform = {
	width: 100,
    height: 14,
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    ball: game.ball,
    fire() {
        if (this.ball) {
            this.ball.start();
            this.ball = null;
        }
    },
    start(direction) {
        if (direction === KEYS.LEFT) {
            this.dx = -this.velocity;
        } else if (direction === KEYS.RIGHT) {
            this.dx = this.velocity;
        }
    },
    stop() {
        this.dx = 0;
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                this.ball.x += this.dx;
            }
        }
    },
     getTouchOffset(x) {
        let diff = (this.x + this.width) - x;
        let offset = this.width - diff;
        let result = 2 * offset / this.width;
        return result - 1;
    },

   collideWorldBounds() {
        let x = this.x + this.dx;
        let platformLeft = x;
        let platformRight = platformLeft + this.width;
        let worldLeft = 0;
        let worldRight = 640;

        if (platformLeft < worldLeft || platformRight > worldRight) {
            this.dx = 0;
        }
    }


};




window.addEventListener('load',function() {
	game.start();
})


