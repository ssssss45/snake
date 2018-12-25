class SoundManager
{
	constructor(params)
	{
		this.sounds = params.sounds;
		this.soundLoadedEvent = params.soundLoadedEventName;

		//сортировка звуков по id
		this.sounds.sort(function (a, b)
		{	
			if (a.id > b.id) {
				return 1;
			}

			if (a.id < b.id) {
				return -1;
			}
		});

		//закидывание звуков в загрузчик
		var loaderArray = [];
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				loaderArray.push(this.sounds[i].files[j])	;
			}
		}

		PIXI.loader
			.add(loaderArray)
			.load(this.loaded.bind(this))
	}
/*
██╗      ██████╗  █████╗ ██████╗ ███████╗██████╗ 
██║     ██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
██║     ██║   ██║███████║██║  ██║█████╗  ██║  ██║
██║     ██║   ██║██╔══██║██║  ██║██╔══╝  ██║  ██║
███████╗╚██████╔╝██║  ██║██████╔╝███████╗██████╔╝
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═════╝ 
*/
	loaded()
	{
		this.soundArray = [];
		for (var i = 0; i < this.sounds.length; i++)
		{
			this.soundArray[i] = [];

			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j] = PIXI.sound.Sound.from(PIXI.loader.resources[this.sounds[i].files[j]]);

				this.soundArray[i][j].muted = false;
				if (this.sounds[i].loop)
				{
					this.soundArray[i][j].loop = true;
				}
			}
			var playFunc = getPlayFunction(this.soundArray[i],this.sounds[i].playRandom);
			this.sounds[i].playFunc = playFunc;

			//создание слушателей на события проигрывания
			if (this.sounds[i].playEvent != undefined)
			{
				for (var j = 0; j < this.sounds[i].playEvent.length; j++)
				{
					document.addEventListener(this.sounds[i].playEvent[j], playFunc);	
				}
			}

			//создание слушателей на события остановки
			if (this.sounds[i].stopEvent != undefined)
			{
				for (var j = 0; j < this.sounds[i].stopEvent.length; j++)
				{
					var func = getStopFunction(this.soundArray[i]);
					document.addEventListener(this.sounds[i].stopEvent[j], func);	
				}
			}
		}

		function getPlayFunction(soundArray, playRandom)
		{
			var i = 0;
			return function()
			{
				if (playRandom == true)
				{
					var max = soundArray.length - 1;
					soundArray[Math.floor(Math.random() * (max - 0 + 1)) + 0].play()
				}
				else
				{
					soundArray[i].play();
					i++;
					if (i == soundArray.length)
					{
						i = 0;
					}
				}
			}
		}

		function getStopFunction(soundArray)
		{
			return function()
			{
				for (var i = 0; i < soundArray.length; i++)
				{
					soundArray[i].stop();
				}
			}
		}

		var event = new CustomEvent(this.soundLoadedEvent);
		document.dispatchEvent(event);
	}

/*
██████╗ ██╗   ██╗    ██╗██████╗ 
██╔══██╗╚██╗ ██╔╝    ██║██╔══██╗
██████╔╝ ╚████╔╝     ██║██║  ██║
██╔══██╗  ╚██╔╝      ██║██║  ██║
██████╔╝   ██║       ██║██████╔╝
╚═════╝    ╚═╝       ╚═╝╚═════╝ 
*/

	muteById(id)
	{
		for (var i = 0; i < this.soundArray[id].length; i++)
		{
			this.soundArray[id][i].muted = !this.soundArray[id][i].muted;		
		}
	}

	playById(id)
	{
		this.sounds[id].playFunc();
	}

	pauseById(id)
	{
		var random = this.getRandomInt(0, this.soundArray[id].length - 1);
		this.soundArray[id][random].pause();
	}

	resumeById(id)
	{
		var random = this.getRandomInt(0, this.soundArray[id].length - 1);
		this.soundArray[id][random].resume();
	}

	stopById(id)
	{
		for (var i = 0; i < this.soundArray[id].length; i++)
		{
			this.soundArray[id][i].stop();		
		}
	}

	setVolumeById(id, volume)
	{
		for (var i = 0; i < this.soundArray[id].length; i++)
		{
			this.soundArray[id][i].volume = volume;		
		}
	}
/*
 █████╗ ██╗     ██╗     
██╔══██╗██║     ██║     
███████║██║     ██║     
██╔══██║██║     ██║     
██║  ██║███████╗███████╗
╚═╝  ╚═╝╚══════╝╚══════╝
*/

	pauseAll()
	{
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j].pause();
			}
		}
	}

	resumeAll()
	{
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j].resume();
			}
		}
	}

	stopAll()
	{
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j].stop();
			}
		}
	}

	muteAll()
	{
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j].muted = true;
			}
		}
	}

	unmuteAll()
	{
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j].muted = false;
			}
		}
	}

	setVolumeToAll(volume)
	{
		for (var i = 0; i < this.sounds.length; i++)
		{
			for (var j = 0; j < this.sounds[i].files.length; j++)
			{
				this.soundArray[i][j].volume = volume;
			}
		}
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}