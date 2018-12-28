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

		this.spriteData = params.spriteData;

		this.halfPI = Math.PI / 2;

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

		this.tailRotationArray = [];
		this.tailRotationArray[66] = -this.halfPI;
		this.tailRotationArray[258] = Math.PI;
		this.tailRotationArray[36] = -this.halfPI;
		this.tailRotationArray[132] = 0;
		this.tailRotationArray[72] = 0;
		this.tailRotationArray[264] = this.halfPI;
		this.tailRotationArray[48] = Math.PI;
		this.tailRotationArray[144] = this.halfPI;

		this.S = 0;
		this.W = 1;
		this.N = 2;
		this.E = 3;

		this.dirs = this.directions();
		this.onWindowResize();
	}


	drawField()
	{
		this.bonusTexture = this.getTextures(this.spriteData.bonusSprite.x, this.spriteData.bonusSprite.y, this.spriteData.spriteSize)
		this.headTexture = this.getTextures(this.spriteData.headSprite.x, this.spriteData.headSprite.y, this.spriteData.spriteSize)
		this.straightTexture = this.getTextures(this.spriteData.straigntSprite.x, this.spriteData.straigntSprite.y, this.spriteData.spriteSize)
		this.turnTexture = this.getTextures(this.spriteData.turnSprite.x, this.spriteData.turnSprite.y, this.spriteData.spriteSize)
		this.tailTexture = this.getTextures(this.spriteData.tailSprite.x, this.spriteData.tailSprite.y, this.spriteData.spriteSize)
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
		this.bonus.texture = this.bonusTexture;
		this.head.texture = this.headTexture;

		document.dispatchEvent(event);
	}

	getTextures(x, y, size)
	{
		var spriteSheet = new PIXI.Sprite(PIXI.loader.resources[this.images.spritesheet].texture);
		this.pixi.stage.addChild(spriteSheet);
		var texture = new PIXI.Texture(
	          	PIXI.loader.resources[this.images.spritesheet].texture,
	          	new PIXI.Rectangle(x * size, y * size, size, size)
	        );
		spriteSheet.destroy();

		return texture;
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
	move(dirArray, hx, hy)
	{
		if (this.particlesShown)
		{
			this.moveParticles();
		}
//движение
		this.dirs = this.directions(this.direction);
		this.head.x += this.dirs.x * this.blockSize;
		this.head.y += this.dirs.y * this.blockSize;
//поворот текстуры головы
		switch(this.direction)
		{
			case this.W: this.head.rotation = Math.PI; break;
			case this.E: this.head.rotation = 0; break;
			case this.S: this.head.rotation = this.halfPI; break;
			case this.N: this.head.rotation = -this.halfPI; break;
		}

		for (var i = 0; i < this.tail.length; i++)
		{
			if (this.tail[i].active)
			{
				this.tail[i].sprite.visible = true;
				var dirs = this.directions(dirArray[i + 1]);

				this.tail[i].sprite.x += dirs.x * this.blockSize;
				this.tail[i].sprite.y += dirs.y * this.blockSize;

				//замена текстуры тела
				if ((i == 0) && (this.tail.length > 1))
				{
					let temp = {x : hx, y : hy};
					this.determineSegmentTexture(temp, this.tail[1], this.tail[0]);
				}
				else
				if ((i == this.tail.length - 1) || ((i == this.tail.length - 2) && (!this.tail[this.tail.length - 1].active)))
				{
					this.tail[i].sprite.texture = this.tailTexture;
					switch(dirArray[i])
					{
						case this.W: this.tail[i].sprite.rotation = Math.PI; break;
						case this.E: this.tail[i].sprite.rotation = 0; break;
						case this.S: this.tail[i].sprite.rotation = this.halfPI; break;
						case this.N: this.tail[i].sprite.rotation = -this.halfPI; break;
					}
				}
				else
				{
					this.determineSegmentTexture(this.tail[i - 1], this.tail[i + 1], this.tail[i])
				}
			}
		}
	}

	determineSegmentTexture(prevSprite, nextSprite, target)
	{
		if (prevSprite.x == nextSprite.x)
		{
			target.sprite.texture = this.straightTexture;
			target.sprite.rotation = Math.PI / 2;
		}
		else
		if (prevSprite.y == nextSprite.y)
		{
			target.sprite.texture = this.straightTexture;
			target.sprite.rotation = 0;
		}
		else
		{
			target.sprite.texture = this.turnTexture;
			let descision = 0;
//определение нужного поворота углового сегмента
			if (prevSprite.x != target.x)
			{
				if (prevSprite.x > target.x)
				{
					descision += 4;
				}
				else
				{
					descision += 16;
				}
			}

			if (nextSprite.x != target.x)
			{
				if (nextSprite.x > target.x)
				{
					descision += 64;
				}
				else
				{
					descision += 256;
				}
			}

			if (prevSprite.y != target.y)
			{
				if (prevSprite.y > target.y)
				{
					descision += 8;
				}
				else
				{
					descision += 2;
				}
			}

			if (nextSprite.y != target.y)
			{
				if (nextSprite.y > target.y)
				{
					descision += 128;
				}
				else
				{
					descision += 32;
				}
			}

			target.sprite.rotation = this.tailRotationArray[descision];
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
		sprite.pivot.x = 0.5;
		sprite.pivot.y = 0.5;
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
		tail.visible = false;
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
					x: this.head.x,
					y: this.head.y
				}	
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}