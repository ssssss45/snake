class Tail
{
	constructor(params)
	{
		this.renderer = params.renderer;
		this.sprite = params.renderer.getTailSprite();
		this.sprite.visible = false;
		this.x = params.x;
		this.y = params.y;
		this.active = false;
	}

	updateCoords(dir)
	{
		switch(dir)
		{
			case 0: this.y += 1; break;
			case 1: this.x -= 1; break;
			case 2: this.y -= 1; break;
			case 3: this.x += 1; break;				
		}	
	}

	activate()
	{
		this.active = true;
	}

	deactivate()
	{
		this.active = false;
		this.sprite.visible = false;
	}

	checkHeadCollision(x, y)
	{
		return ((x == this.x) && (y == this.y));
	}

	deploy(x, y, mod)
	{
		this.x = x;
		this.y = y;
		this.renderer.deployTail(this, x, y)
	}

	hide()
	{
		this.sprite.x = -10;
		this.sprite.y = -10;
	}
}