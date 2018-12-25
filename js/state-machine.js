class StateMachine
{
	constructor()
	{
		this.state = 0;

		this.Loading = 0;
		this.Welcome = 1;
		this.Paused = 2;
		this.GameOver = 3;
		this.Resetting = 4;
		this.Playing = 5;
		this.NewGame = 6;
		this.Ending = 7;
	}

	setMenu()
	{
		if (this.state == this.Welcome)
		{
			this.state = this.Menu;
			var event = new CustomEvent("Snake-game: menu");
			document.dispatchEvent(event);
		}
	}

	setPaused()
	{
		if (this.state == this.Playing)
		{
			this.state = this.Paused;
			var event = new CustomEvent("Snake-game: paused");
			document.dispatchEvent(event);
		}

		else

		{
			if (this.state == this.Paused)
			{
				this.state = this.Playing;
				var event = new CustomEvent("Snake-game: unpaused");
				document.dispatchEvent(event);
			}
		}
	}

	setGameOver()
	{
		if (this.state == this.Ending)
		{
			this.state = this.GameOver;
			var event = new CustomEvent("Snake-game: game over");
			document.dispatchEvent(event);
		}
	}

	setNewGame()
	{
		if ((this.state == this.Welcome) || (this.state == this.GameOver))
		{
			this.state = this.NewGame;
			var event = new CustomEvent("Snake-game: new game");
			document.dispatchEvent(event);
		}
	}

	setWelcome()
	{
		if (this.state == this.Loading)
		{
			this.state = this.Welcome;
			var event = new CustomEvent("Snake-game: welcome");
			document.dispatchEvent(event);
		}
	}

	setPlaying()
	{
		if (this.state == this.NewGame)
		{
			this.state = this.Playing;
			var event = new CustomEvent("Snake-game: playing");
			document.dispatchEvent(event);
		}
	}

	setEndingAnimation()
	{
		if (this.state == this.Playing)
		{
			this.state = this.Ending;
			var event = new CustomEvent("Snake-game: ending animation");
			document.dispatchEvent(event);
		}
	}
}