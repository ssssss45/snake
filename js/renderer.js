class Renderer
{
	constructor(params, stateMachine)
	{
		this.stateMachine = stateMachine;
		this.height = params.gameHeight;
		this.width = params.gameWidth;
		this.blockSize = params.blockSize;
		this.framesPerStep = params.framesPerStep;
		//this.moveDistance  = this.blockSize / (this.framesPerStep);
		//this.moveDelay = params.gameSpeed / params.animationFps;
		this.gameStep = params.gameSpeed;

		//this.collisionCameraJump = params.collisionCameraJump;

		this.startX = params.startX;
		this.startY = params.startY;
		this.startDirection = params.initialDirection;
		this.initialTail = params.initialTail;

		this.paused = false;
		this.animationStopped = false;;

		//this.maxDimension = Math.min(this.totalWidth, this.totalHeight)

		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
		this.pixi = new PIXI.Application({width : this.width * this.blockSize, height: this.height * this.blockSize});
		document.body.appendChild(this.pixi.view);

		this.bgContainer = new PIXI.Container();
		this.pixi.stage.addChild(this.bgContainer);

		this.gameContainer = new PIXI.Container();
		this.pixi.stage.addChild(this.gameContainer);

		this.unusedTails = [];

		document.addEventListener("Snake-game: new game",
			this.start.bind(this));
		document.addEventListener("Snake-game:pause-pressed",
			this.pause.bind(this));
		document.addEventListener("Snake-game: ending animation",
			this.cameraJumpStart.bind(this));
		document.addEventListener("Snake-game: bonus taken",
			this.emitOnBonus.bind(this));

		let draw = this.drawField.bind(this);
		this.images = params.images;
		var loader = PIXI.loader
			.add(this.images.spritesheet)
			.add(this.images.wall)
			.add(this.images.ground)
			.load(this.drawField.bind(this));

		this.S = 0;
		this.W = 1;
		this.N = 2;
		this.E = 3;

		this.dirs = this.directions();
		this.onWindowResize();
	}


	drawField()
	{
		
		//постройка стен
		for (var i = 0; i < this.width; i++)
		{
			for (var j = 0; j < this.height; j++)
			{
				let sprite = new PIXI.Sprite();

				if ((i == 0) || (i == this.width - 1) || (j == 0) || (j == this.height - 1) )
				{
					sprite.texture = PIXI.loader.resources[this.images.wall].texture;
				}
				else
				{
					sprite.texture = PIXI.loader.resources[this.images.ground].texture;	
				}
				sprite.height = this.blockSize;
				sprite.width = this.blockSize;
				sprite.x = i * this.blockSize;
				sprite.y = j * this.blockSize;

				this.bgContainer.addChild(sprite);
			}
		}
		var event = new CustomEvent("Snake-game: renderer-ready");
		this.head = this.getTailSprite();
		this.bonus = this.getTailSprite();

		document.dispatchEvent(event);
	}

	onWindowResize()
	{
	/*	this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
	    this.camera.aspect = this.screenWidth / this.screenHeight;
	    this.camera.updateProjectionMatrix();
	    this.scale = this.viewPortWidth / this.screenWidth;
	    this.scaleY = this.totalWidth / this.screenWidth;

	    this.tiltIncriment = this.totalWidth / this.maxCamTilt / (this.screenWidth / this.totalWidth / 2);

	    this.renderer.setSize( window.innerWidth, window.innerHeight );

		this.setCam();

		if ((this.stateMachine.state != this.stateMachine.Loading) && (this.stateMachine.state != this.stateMachine.Welcome))
		{
			this.renderer.render(this.scene, this.camera);
		}*/
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
		this.head.x = (this.startX + 0.5) * this.blockSize;
		this.head.y = (this.startY + 1.5) * this.blockSize;
		
		this.tail = [];

		this.direction = this.startDirection;
		this.lastDir = this.startDirection;
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
		if (this.particlesShown)
		{
			this.moveParticles();
		}
//движение
		this.dirs = this.directions(this.direction);
		this.head.x += this.dirs.x * this.blockSize;
		this.head.y += this.dirs.y * this.blockSize;

		for (var i = 0; i < this.tail.length; i++)
		{
			if (this.tail[i].active)
			{
				var dirs = this.directions(dirArray[i + 1]);
				this.tail[i].sprite.x += dirs.x * this.blockSize;
				this.tail[i].sprite.y += dirs.y * this.blockSize;
			}
		}
	}

	setDir(dir)
	{
		this.direction = dir;
	}

	returnCanvas()
	{
		return this.pixi.view;
	}

	pause()
	{
		this.paused = !this.paused;
	}
//генерация бонуса
	spawnBonus(x,y)
	{
		this.bonus.position.x = (x + 0.5) * this.blockSize;
		this.bonus.position.y = (y + 0.5) * this.blockSize;
	}
//получение модификаторов для x и y из направлений
	directions(dir)
	{
		var result = {};
		switch (dir)
		{
			case this.S: result.x = 0; result.y = 1; break;
			case this.W: result.x = -1; result.y = 0; break;
			case this.N: result.x = 0; result.y = -1; break;
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
//создание нового куска хвоста
	getTailSprite(tail)
	{
		let sprite = new PIXI.Sprite()
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		sprite.x = -10;
		sprite.y = -10;
		sprite.width = this.blockSize;
		sprite.height = this.blockSize;
		sprite.texture = PIXI.loader.resources[this.images.wall].texture;
		this.gameContainer.addChild(sprite);

		return sprite;
	}
//установка нового куска хвоста на поле
	deployTail(tail, x, y)
	{
		tail.sprite.x = (x + 0.5) * this.blockSize;
		tail.sprite.y = (y + 0.5) * this.blockSize;
		this.tail.push(tail);
		tail.active = false;
	}

//тряска камеры при столкновении
	cameraJumpStart()
	{
		var event = new CustomEvent("Snake-game: ending animation finished");

		document.dispatchEvent(event);
		
	}

	cameraJump()
	{

	}
//выброс частиц при подборе бонуса
	emitOnBonus()
	{

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