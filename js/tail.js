class Tail
{
	constructor(params)
	{
		this.renderer = params.renderer;
		this.mesh = params.renderer.getTailMesh();
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

	checkHeadCollision(x, y)
	{
		return ((x == this.x) && (y == this.y));
	}

	deploy(x, y, mod)
	{
		this.x = x;
		this.y = y;
		this.renderer.deployTail(this, x, y + mod)
	}

	hide()
	{
		this.mesh.position.x = -10;
		this.mesh.position.y = -10;
	}
}