class Game
{
	constructor(params)
	{
		this.height = params.gameHeight;
		this.width = params.gameWidth;

		this.framesPerStep = params.framesPerStep;

		this.renderer = new Renderer(params);
		this.canvas = this.renderer.returnCanvas();
		//контроллер
		this.keycon = new keyboardController();
		this.keycon.attach(this.canvas);
		this.keycon.addKeyToController("left",[37]);
		this.keycon.addKeyToController("right",[39]);
		this.keycon.addKeyToController("up",[38]);
		this.keycon.addKeyToController("down",[40]);
		this.keycon.addTouchToController("touch",[Infinity,-Infinity,Infinity,-Infinity]);
		this.keycon.addTouchToController("cick",[Infinity,-Infinity,Infinity,-Infinity]);

		this.scoreContainer = document.getElementsByClassName(params.scoreContainer)[0];
		this.gameOverMessage = document.getElementsByClassName(params.gameOverMessage)[0];
		this.welcomeMessage = document.getElementsByClassName(params.welcomeMessage)[0];
		this.finalScore = document.getElementsByClassName(params.finalScore)[0];
		this.pauseButton = document.getElementsByClassName(params.pauseButton)[0];
		this.pauseMessage = document.getElementsByClassName(params.pauseMessage)[0];
		this.camButton = document.getElementsByClassName(params.camButton)[0];
		this.newGameButton = document.getElementsByClassName(params.newGameButton)[0];
		this.loadingMessage = document.getElementsByClassName(params.loadingMessage)[0];
		this.loadingProgress = document.getElementsByClassName(params.loadingProgress)[0];

		this.scoreContainer.style.visibility = "hidden";
		this.pauseButton.style.visibility = "hidden";
		this.camButton.style.visibility = "hidden";
		this.gameOverMessage.style.visibility = "hidden";
		this.finalScore.style.visibility = "hidden";
		this.pauseMessage.style.visibility = "hidden";

		this.gameSpeed = params.gameSpeed;
		this.framesPerStep = params.framesPerStep;
		this.animationTime = this.gameSpeed / params.framesPerStep;
		this.startX = params.startX;
		this.startY = params.startY;
		this.startTail = params.initialTail;
		this.startDirection = params.initialDirection;
		this.followCamControls = false;
		this.walls = params.walls;

		this.assetManager = new AssetManager({assets:[
		          {
		            type : "tail",
		            number : 10,
		            params : {
		            	renderer : this.renderer,
		            	x : -10,
		            	y : -10
		            },
		            assetClass : Tail
		          }]});

		var waitForEvent = params.sound_manager_data.soundLoadedEventName;

		this.stateMachine = new StateMachine();

		//слушатели на события контроллера
		this.canvas.addEventListener("controls:activate",
			this.activateListenerActions.bind(this));
		this.canvas.addEventListener("controls:deactivate",
			this.deactivateListenerActions.bind(this));
		this.canvas.addEventListener("controls:touch",
			this.touchEventHandler.bind(this));
		this.canvas.addEventListener("controls:click",
			this.clickEventHandler.bind(this));
		this.canvas.addEventListener("controls:touch moved", this.touchEventHandler.bind(this));

		document.addEventListener("Snake-game:pause-pressed",
			this.pausePressed.bind(this));
		document.addEventListener("Snake-game:switch-camera",
			this.switchCamera.bind(this));
		document.addEventListener("Snake-game:new-game",
			this.gameStart.bind(this));
		document.addEventListener("Snake-game: game over",
			this.gameOver.bind(this));
		document.addEventListener("Snake-game: ending animation finished",
			this.endingFinishedHandler.bind(this));
		document.addEventListener(waitForEvent,
			this.loadedHandler.bind(this));

		this.soundManager = new SoundManager(params.sound_manager_data);

		this.tail = [];
		this.leftActive = false;
		this.rightActive = false;
		this.downActive = false;
		this.upActive = false;
		this.paused = false;

		this.S = 0;
		this.W = 1;
		this.N = 2;
		this.E = 3;
	}

	loadedHandler()
	{
		this.stateMachine.setWelcome();
		this.newGameButton.style.visibility = "visible";
		this.welcomeMessage.style.visibility = "visible";
		this.loadingProgress.style.visibility = "hidden";
		this.loadingMessage.style.visibility = "hidden";
	}

	activateListenerActions(event)
	{
		switch(event.detail.action)
		{
			case "down": this.downActive = true; break;
			case "up":  this.upActive = true; break;
			case "right": this.rightActive = true; break;
			case "left": this.leftActive = true; break;
		}
	}

	deactivateListenerActions(event)
	{
		switch(event.detail.action)
		{
			case "down": this.downActive = false; break;
			case "up": this.upActive = false; break;
			case "left": this.leftActive = false; break;
			case "right": this.rightActive = false; break;
		}
	}

	touchEventHandler(event)
	{
		if (this.stateMachine.state == this.stateMachine.Playing)
		{
			this.touch = event.detail.touch;
		}
	}

	clickEventHandler(event)
	{
		if (this.stateMachine.state == this.stateMachine.Playing)
		{
			this.touch = event.detail.click;	
		}
	}

/*
███████╗████████╗ █████╗ ██████╗ ████████╗
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
███████╗   ██║   ███████║██████╔╝   ██║   
╚════██║   ██║   ██╔══██║██╔══██╗   ██║   
███████║   ██║   ██║  ██║██║  ██║   ██║   
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
*/
	gameStart()
	{
		this.stateMachine.setNewGame();
		//отдаём ассеты менеджеру
		this.reset();
		//установка видимости элементов
		this.scoreContainer.style.visibility = "visible";
		this.pauseButton.style.visibility = "visible";
		this.camButton.style.visibility = "visible";
		this.welcomeMessage.style.visibility = "hidden";
		this.newGameButton.style.visibility = "hidden";
		this.gameOverMessage.style.visibility = "hidden";
		this.finalScore.style.visibility = "hidden";

		this.turnCountdown = -1;
		this.animationCountdown = this.animationTime;
		this.frames = this.framesPerStep;
		var date = new Date();
		this.previousTime = date.getTime();
		
		this.dirs = [];
		this.tailLength = this.startTail;
		this.direction = this.startDirection;
		this.newDirection = this.startDirection;

		this.touch = undefined;

		this.x = this.startX;
		this.y = this.startY;

		var dirs = this.directions(this.startDirection);
//расстановка начальной змеи
		for (var i = 0; i <= this.tailLength; i++)
		{
			if (i != this.tailLength)
			{
				var tail = this.assetManager.getAssetByType("tail")
				this.tail.push(tail);
				tail.deploy(this.x - dirs.x * (i + 1), this.y - dirs.y * (i + 1) + 1, 0);	
				tail.active = true;			
			}

			this.dirs.push(this.direction)
		}

		this.turn = 0;
		this.score = 0;
		this.scoreContainer.innerHTML = "Счёт: " + this.score;
		this.spawnBonus();

		this.stateMachine.setPlaying()
		this.gameStep();
	}

	reset()
	{
		while (this.tail.length > 0)
		{
			var tail = this.tail[0];
			tail.active = false;
			tail.hide();
			this.assetManager.returnAsset(tail);
			this.tail.shift();
		}
	}
/*
███████╗████████╗███████╗██████╗ 
██╔════╝╚══██╔══╝██╔════╝██╔══██╗
███████╗   ██║   █████╗  ██████╔╝
╚════██║   ██║   ██╔══╝  ██╔═══╝ 
███████║   ██║   ███████╗██║     
╚══════╝   ╚═╝   ╚══════╝╚═╝     
*/
	gameStep()
	{
		var clearDir = true;
		var collision = false;

		if ((this.stateMachine.state == this.stateMachine.Playing)||(this.stateMachine.state == this.stateMachine.Paused))
		{
			requestAnimationFrame( this.gameStep.bind(this));
		}

		if (this.followCamControls)
		{
			//управление в режиме камеры от третьего лица
			if (this.touch != undefined)
			{
				if (this.touch.clientX < this.renderer.totalWidth / 2)
				{
					this.leftActive = true;
				}
				else
				{
					this.rightActive = true;
				}
				this.touch = undefined;
			}

			if (this.leftActive)
			{
				this.leftActive = false;
				this.turn = -1;
			}

			if (this.rightActive)
			{
				this.rightActive = false;
				this.turn = 1;
			}
		}
		else
		{
			//управление в режиме камеры сверху
			if ((this.leftActive) && (this.direction != 3))
			{
				this.newDirection = 1;
			}

			if ((this.rightActive) && (this.direction != 1))
			{
				this.newDirection = 3;
			}

			if ((this.upActive) && (this.direction != 0))
			{
				this.newDirection = 2;
			}

			if ((this.downActive) && (this.direction != 2))
			{
				this.newDirection = 0;
			}	
		}

		var date = new Date();
		var dif = date.getTime() - this.previousTime;

		if (!this.paused)
		{
			this.turnCountdown -= dif;
			this.animationCountdown -= dif;
		}

		this.previousTime = date.getTime();
//переключение направлений
		if (this.turnCountdown < 0)
		{
			if (this.followCamControls)
			{
				this.direction += this.turn;

				if (this.direction == -1)
				{
					this.direction = 3;
				}

				if (this.direction == 4)
				{
					this.direction = 0;
				}
				this.turn = 0;
			}
			else
			{
				if (this.touch != undefined)
				{
					this.newDirection = this.getDirectionFromAngle(this.renderer.getHeadCoords(), {x:this.touch.clientX, y:this.touch.clientY}, this.direction);
					this.touch = undefined
				}

				this.direction = this.newDirection;	
			}



			for (var i = 0; i < this.tailLength; i++)
			{
				if (this.tail[i].active)
				{
					this.tail[i].updateCoords(this.dirs[i + 1])
				}

				if (this.tail[i].checkHeadCollision(this.x, this.y))
				{
					collision = true;
				}
			}

			if (this.tailToActivate != undefined)
			{
				this.tailToActivate.active = true;
				this.tailToActivate = undefined;
			}

			//обработка подбора бонусов
			if ((this.x == this.bonusX) && (this.y == this.bonusY))
			{
				this.score ++;
				this.scoreContainer.innerHTML = "Счёт: " + this.score;

				//генерация нового бонуса
				this.spawnBonus();

				//увеличение хвоста
				var last = this.tail[this.tail.length - 1];
				var tail = this.assetManager.getAssetByType("tail")
				this.tail.push(tail);

				if (this.tail.length > 1)
				{
					tail.deploy(last.x, last.y, 1);
				}
				else
				{
					tail.deploy(this.x, this.y, 1);	
				}
				this.tailLength ++;
				clearDir = false;
				this.tailToActivate = tail;

				var event = new CustomEvent("Snake-game: bonus taken");
				document.dispatchEvent(event);
			}

			switch(this.direction)
			{
				case 0: this.y += 1; break;
				case 1: this.x -= 1; break;
				case 2: this.y -= 1; break;
				case 3: this.x += 1; break;				
			}	

			for (var i = 0; i < this.walls.length; i++)
			{
				if ((this.walls[i].x == this.x)&&(this.walls[i].y == this.y))
				{
					collision = true;
				}
			}

			if ((this.x == -1) || (this.y == -1) || (this.x == this.width) || (this.y == this.height) || (collision))
			{
				this.stateMachine.setEndingAnimation();
			}

			this.turnCountdown = this.gameSpeed;
			this.animationCountdown = -this.animationTime;
			var diff = this.framesPerStep - this.frames;
			if (diff > 0)
			{
				for (var i = 0; i < diff; i++)
				{
					this.renderer.move(this.dirs);
				}
			}

			this.renderer.setDir(this.direction);
			if (clearDir)
			{
				this.dirs.pop();
			}
			this.dirs.unshift(this.direction);

			this.frames = 0;
		}

		if ((this.animationCountdown <= 0))
		{
			this.frames ++;
			if (this.frames <= this.framesPerStep)
			{
				this.renderer.move(this.dirs);
			}
			this.animationCountdown += this.animationTime;	
		}
	}

	spawnBonus()
	{
		var check = true;
		
		while (check)
		{	
			this.bonusX = this.getRandomInt(1, this.width - 2);
			this.bonusY = this.getRandomInt(1, this.height - 2);
			this.renderer.spawnBonus(this.bonusX, this.bonusY);	
	
			check = false;
			for (var i = 0; i < this.walls.length; i++)
			{
				if ((this.bonusX == this.walls[i].x) && (this.bonusY == this.walls[i].y))
				{
					check = true;
				}
			}
		}
	}

	getDirectionFromAngle(s1, s2, currentDir)
	{
		var angle = findAngle(s1.x, s1.y, s2.x, s2.y);
		var direction

		if ((angle > 0) && (angle <= 180) && ((currentDir == this.W) || (currentDir == this.E)))
		{
			direction = this.S;
		}
		else
		if ((currentDir == this.W) || (currentDir == this.E))
		{
			direction = this.N;	
		}

		if ((angle > -90) && (angle <= 90) && ((currentDir == this.S) || (currentDir == this.N)))
		{
			direction = this.E;
		}
		else
		if ((currentDir == this.S) || (currentDir == this.N))
		{
			direction = this.W;	
		}

		return direction;

		function findAngle(x1, y1, x2, y2)
		{
			var p1 = {
				x: x1,
				y: y1
			};

			var p2 = {
				x: x2,
				y: y2
			};
			// angle in degrees
			return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
		}
	}

	switchCamera()
	{
		this.followCamControls = !this.followCamControls;
		this.turn = 0;
		this.newDirection = this.direction
	}

	pausePressed()
	{
		this.stateMachine.setPaused();
		this.paused = !this.paused;

		if (this.paused)
		{
			this.pauseMessage.style.visibility = "visible";
			this.soundManager.pauseAll();
		}
		else
		{
			this.soundManager.resumeAll();
			this.pauseMessage.style.visibility = "hidden";
		}
	}

	endingFinishedHandler()
	{
		this.stateMachine.setGameOver();
	}

	gameOver()
	{
		this.pauseButton.style.visibility = "hidden";
		this.gameOverMessage.style.visibility = "visible";
		this.finalScore.style.visibility = "visible";
		this.finalScore.innerHTML = "Ваш счёт: " + this.score;
		this.newGameButton.style.visibility = "visible";
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

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
}