class Renderer
{
	constructor(params)
	{
		this.height = params.gameHeight;
		this.width = params.gameWidth;
		this.blockSize = params.blockSize;
		this.totalHeight = this.height * this.blockSize;
		this.totalWidth = this.width * this.blockSize;
		this.framesPerStep = params.framesPerStep;
		this.moveDistance  = this.blockSize / (this.framesPerStep);
		this.moveDelay = params.gameSpeed / params.animationFps;
		this.gameStep = params.gameSpeed;
		this.viewPortWidth = this.totalWidth + this.blockSize * 2;
		this.viewPortHeight = this.totalHeight + this.blockSize * 2;
		this.walls = params.walls;

		this.collisionCameraJump = params.collisionCameraJump;

		this.startX = params.startX;
		this.startY = this.height - params.startY - 2;
		this.startDirection = params.initialDirection;
		this.initialTail = params.initialTail;

		this.tiltIncriment = this.totalWidth / params.maxCamTilt / 10000;

		this.paused = false;
		this.animationStopped = false;;

		this.maxDimension = Math.min(this.totalWidth, this.totalHeight)

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera( 75, this.viewPortWidth / this.viewPortHeight, 0.1, 10000 );
		this.camera.position.set(
			(this.viewPortWidth) / 2 ,
			((this.totalHeight) / 2),
			(this.totalHeight) * 0.67
		);
		// this.camera.fov = 90;

		this.camGroup = new THREE.Group();
		this.scene.add(this.camGroup)

		this.followCam = false;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( this.viewPortWidth, this.viewPortHeight );
		document.body.appendChild( this.renderer.domElement );

		this.texLoader = new THREE.TextureLoader();

		this.backMaterial = new THREE.MeshLambertMaterial({color: 0x228b22, side: THREE.DoubleSide, wireframe:false, map: this.texLoader.load(params.backgroundTexture)});
		this.backGeometry = new THREE.PlaneGeometry( this.totalWidth, this.totalHeight, this.width, this.height);

		this.backGround = new THREE.Mesh( this.backGeometry, this.backMaterial ); 
		this.scene.add (this.backGround);
		this.backGround.position.x = (this.totalWidth + this.blockSize) / 2;
		this.backGround.position.y = (this.totalHeight - this.blockSize) / 2;

		this.material = new THREE.MeshLambertMaterial({color: 0xCC0000});
		var boxMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
		this.geometry = new THREE.SphereGeometry( this.blockSize / 2, 32, 32);
		this.head = new THREE.Mesh( this.geometry, this.material );
		
		this.scene.add( this.head );

		this.pi2 = Math.PI / 2;
		this.pi3 = Math.PI / 3;

		this.unusedTails = [];

		var bonusMaterial = new THREE.MeshLambertMaterial({color: 0x99ff});
		var bonusGeometry = new THREE.SphereGeometry( this.blockSize / 4, 32, 32 );
		this.bonus = new THREE.Mesh( bonusGeometry, bonusMaterial );
		this.scene.add( this.bonus );

		document.addEventListener("Snake-game: new game",
			this.start.bind(this));
		document.addEventListener("Snake-game:pause-pressed",
			this.pause.bind(this));
		document.addEventListener("Snake-game:switch-camera",
			this.switchCamera.bind(this));
		document.addEventListener("Snake-game: ending animation",
			this.cameraJumpStart.bind(this));
		document.addEventListener("Snake-game: bonus taken",
			this.emitOnBonus.bind(this));

		const pointLight = new THREE.PointLight(0xFFFFFF);

		// set its position
		pointLight.position.x = this.totalWidth / 2;
		pointLight.position.y = this.totalHeight / 2;
		pointLight.position.z = this.totalHeight;

		// add to the scene
		this.scene.add(pointLight);

		this.head.geometry.verticesNeedUpdate = true;

		// Changes to the normals
		this.head.geometry.normalsNeedUpdate = true;

		var boxGeometry = new THREE.BoxGeometry( this.blockSize, this.blockSize, 100 ); 
		//постройка стен
		for (var i = 0; i < this.width + 2; i++)
		{
			for (var j = 0; j < this.height + 2; j++)
			{
				var wall = false;

				for (var n = 0; n < this.walls.length; n++)
				{
					if ((this.walls[n].x == i - 1) && (this.height - this.walls[n].y == j))
					{
						wall = true;
					}
				}
				if ((i == 0) || (i == this.width + 1) || (j == 0) || (j == this.height + 1) || (wall) )
				{
					var box = new THREE.Mesh( boxGeometry, boxMaterial );
					box.position.x = i * this.blockSize;
					box.position.y = (j - 1) * this.blockSize;
					box.position.z = -this.blockSize;
					this.scene.add(box)	
				}
			}
		}

		//частицы
		this.emitterGroup = new SPE.Group({
        		texture: {
                    value: this.texLoader.load("assets/img/particle.png"),
                    depthTest: true,
					depthWrite: false,
					blending: THREE.AdditiveBlending
                }
        	});
		this.emitter = new SPE.Emitter({
				//duration : 0.1,
				alive : false,
				type: SPE.distributions.SPHERE,
                maxAge: {
                    value: 0.5
                },
        		position: {
                    value: new THREE.Vector3(0, 0, -50),
                    spread: new THREE.Vector3( 0, 0, 0 )
                },
        		acceleration: {
                    value: new THREE.Vector3(-10, -10, -10),
                    spread: new THREE.Vector3( 0, 0, 0 )
                },
        		velocity: {
                    value: new THREE.Vector3(500, 500, 500),
                    spread: new THREE.Vector3(10, 10, 10)
                },
                color: {
                    value: [ new THREE.Color('white'), new THREE.Color('red') ]
                },
                size: {
                    value: 10
                },
        		particleCount: 500
        	});

		this.bonusEmitter = new SPE.Emitter({
				//duration : 0.1,
				alive : false,
				type: SPE.distributions.SPHERE,
                maxAge: {
                    value: 1
                },
        		position: {
                    value: new THREE.Vector3(0, 0, -50),
                    spread: new THREE.Vector3( 0, 0, 0 )
                },
        		acceleration: {
                    value: new THREE.Vector3(-10, -10, -10),
                    spread: new THREE.Vector3( 0, 0, 0 )
                },
        		velocity: {
                    value: new THREE.Vector3(300, 300, 300),
                    spread: new THREE.Vector3(10, 10, 10)
                },
                color: {
                    value: [new THREE.Color('blue') ]
                },
                size: {
                    value: 50
                },
        		particleCount: 50
        	});

		this.emitterGroup.addEmitter(this.emitter);
		this.emitterGroup.addEmitter(this.bonusEmitter);
		this.emitterGroup.mesh.frustumCulled = false;
		this.scene.add(this.emitterGroup.mesh)

		this.S = 0;
		this.W = 1;
		this.N = 2;
		this.E = 3;

		this.dirs = this.directions();
	}
/*
███████╗████████╗ █████╗ ██████╗ ████████╗
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
███████╗   ██║   ███████║██████╔╝   ██║   
╚════██║   ██║   ██╔══██║██╔══██╗   ██║   
███████║   ██║   ██║  ██║██║  ██║   ██║   
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
*/
	start()
	{
		var date = new Date();
		this.previousTime = date.getTime();
		this.ticks = 0;
		this.head.position.x = (this.startX + 1) * this.blockSize;
		this.head.position.y = (this.startY + 1) * this.blockSize;
		this.head.position.z = 0;

		this.camGroup.position.copy( this.head.position );
		
		this.tail = [];

		this.direction = this.startDirection;
		this.rotateCamGroup();
		this.lastDir = this.startDirection;

		this.tiltX = (this.head.position.y - this.viewPortHeight / 2)  * -this.tiltIncriment / this.moveDistance;
		this.tiltY = (this.head.position.x - this.viewPortWidth / 2) * -this.tiltIncriment / this.moveDistance;

		if (!this.followCam)
		{
			this.camera.position.z = (this.totalHeight) * 0.67;
			this.camera.position.x = (this.viewPortWidth) / 2;
			this.camera.position.y = (this.totalHeight) / 2;
			this.camera.rotation.z = 0;	
			this.camera.rotation.x = this.tiltX;
			this.camera.rotation.y = this.tiltY;
		}
		else
		{
			this.camera.position.z = this.blockSize * 4; // top
			this.camera.position.x = 0;
			this.camera.position.y = -this.blockSize * 1.7; // depth
			this.camera.rotation.x = 50 / 180 * Math.PI;
		}

		this.camGroup.rotation.z = 0;
		this.cameraRotateTo = 0;
		this.timeToMove = this.moveDelay;
		this.timeToStep = this.gameStep;
		this.FPS = 0;
		this.particlesShown = false; 
	}
/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝
██╔████╔██║██║   ██║██║   ██║█████╗  
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝
*/
	move(dirArray)
	{
		this.emitterGroup.tick();
		if (this.particlesShown)
		{
			this.moveParticles();
		}
		//движение
		this.dirs = this.directions(this.direction);
		this.head.position.x += this.dirs.x * this.moveDistance;
		this.head.position.y += this.dirs.y * this.moveDistance;
		this.renderer.render(this.scene, this.camera);

		for (var i = 0; i < this.tail.length; i++)
		{
			if (this.tail[i].active)
			{
				var dirs = this.directions(dirArray[i + 1]);
				this.tail[i].mesh.position.x += dirs.x * this.moveDistance;
				this.tail[i].mesh.position.y += dirs.y * this.moveDistance;
			}
		}
		this.rotateCamGroup();

		this.camGroup.rotation.z += this.dif / 8; 

		switch (this.direction)
		{
			case 0: this.tiltX -= this.tiltIncriment; break;
			case 1: this.tiltY += this.tiltIncriment; break;
			case 2: this.tiltX += this.tiltIncriment; break;
			case 3: this.tiltY -= this.tiltIncriment; break;
		}

		if (!this.followCam)
		{
			this.camera.rotation.x = this.tiltX;
			this.camera.rotation.y = this.tiltY;
		}
	}

	rotateCamGroup()
	{
		this.camGroup.position.copy(this.head.position );

		if (this.lastDir != this.direction)
		{
			if (((this.lastDir < this.direction) || ((this.lastDir == 3) && (this.direction == 0))) && !((this.lastDir == 0) && (this.direction == 3)))
			{
				this.cameraRotateTo -= Math.PI / 2;
			}
			else
			{
				this.cameraRotateTo += Math.PI / 2;	
			}

			this.lastDir = this.direction;
	}

		this.dif = this.cameraRotateTo - this.camGroup.rotation.z;
	}

	setDir(dir)
	{
		this.direction = dir;
	}

	returnCanvas()
	{
		return this.renderer.domElement;
	}

	pause()
	{
		this.paused = !this.paused;
	}

	spawnBonus(x,y)
	{
		var realY = this.height - y - 1;
		this.bonus.position.x = (x + 1) * this.blockSize;
		this.bonus.position.y = realY * this.blockSize;
	}

	directions(dir)
	{
		var result = {};
		switch (dir)
		{
			case this.S: result.x = 0; result.y = -1; break;
			case this.W: result.x = -1; result.y = 0; break;
			case this.N: result.x = 0; result.y = 1; break;
			case this.E: result.x = 1; result.y = 0; break;
		}
		return(result);
	}
/*
████████╗ █████╗ ██╗██╗     
╚══██╔══╝██╔══██╗██║██║     
   ██║   ███████║██║██║     
   ██║   ██╔══██║██║██║     
   ██║   ██║  ██║██║███████╗
   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝

*/
	getTailMesh()
	{
		var sphere = new THREE.Mesh( this.geometry, this.material );
		this.scene.add(sphere);
		return sphere;
	}

	deployTail(tail, x, y)
	{
		tail.mesh.position.x = (x + 1) * this.blockSize;
		tail.mesh.position.y = (this.height - y) * this.blockSize;
		tail.mesh.position.z = 0;
		this.tail.push(tail);
	}
/*
 ██████╗ █████╗ ███╗   ███╗███████╗██████╗  █████╗ 
██╔════╝██╔══██╗████╗ ████║██╔════╝██╔══██╗██╔══██╗
██║     ███████║██╔████╔██║█████╗  ██████╔╝███████║
██║     ██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗██╔══██║
╚██████╗██║  ██║██║ ╚═╝ ██║███████╗██║  ██║██║  ██║
 ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
*/
	switchCamera()
	{
		this.followCam = !this.followCam;
		this.camGroup.add(this.camera);
		if (this.followCam)
		{
			this.camera.rotation.x = 0;
			this.camera.rotation.y = 0;

			this.camera.position.z = this.blockSize * 4; // top
			this.camera.position.x = 0;
			this.camera.position.y = -this.blockSize * 1.7; // depth
			this.camera.rotation.x = 50 / 180 * Math.PI;
		
		}
		else
		{
			this.camGroup.remove(this.camera)
			this.camera.position.z = (this.totalHeight) * 0.67;
			this.camera.position.x = (this.viewPortWidth) / 2;
			this.camera.position.y = (this.totalHeight) / 2;
			this.camera.rotation.z = 0;	
			this.camera.rotation.x = this.tiltX;
			this.camera.rotation.y = this.tiltY;
		}
		this.renderer.render(this.scene, this.camera);
	}

	cameraJumpStart()
	{

		var hb = this.blockSize / 2;
		
		this.cameraJumps = this.collisionCameraJump;

		if (this.followCam)
		{
			this.jumpDirections = this.directions(this.N);
		}
		else
		{
			this.jumpDirections = this.directions(this.direction);
		}

		this.emitter.position.value = new THREE.Vector3(this.head.position.x + this.jumpDirections.x * hb, this.head.position.y + this.jumpDirections.y * hb, 0);

		this.emitter.alive = true;
		
		this.wait = 3;

		this.cameraJump();
	}

	cameraJump()
	{
		this.emitterGroup.tick();
		if (Math.abs(this.cameraJumps) > 10)
		{
			requestAnimationFrame( this.cameraJump.bind(this));
		}
		else
		{
			var event = new CustomEvent("Snake-game: ending animation finished");
			document.dispatchEvent(event);
		}

		this.camera.position.x += this.jumpDirections.x * this.cameraJumps / 100;
		this.camera.position.y += this.jumpDirections.y * this.cameraJumps / 100;

		this.wait --;
		if (this.wait == 0)
		{
			this.emitter.alive = false;
			this.cameraJumps /= -1.3;
			this.wait = 3;
		}
		this.renderer.render(this.scene, this.camera)
	}

	emitOnBonus()
	{
		var emitter = this.bonusEmitter;
		emitter.position.value = new THREE.Vector3(this.head.position.x, this.head.position.y, 0);
		emitter.alive = true;

		setTimeout(stop, 500);

		function stop()
		{
			emitter.alive = false;
		}
	}

	getHeadCoords()
	{
		return  {
					x: this.head.position.x,
					y: this.totalHeight - this.head.position.y
				}	
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}