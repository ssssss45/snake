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
//обновление координат в зависимости от направления
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
//установка активного состояния
	activate()
	{
		this.active = true;
	}
//снятие активного состояния, сокрытие спрайта
	deactivate()
	{
		this.active = false;
		this.sprite.visible = false;
	}
//проверка столкновения головы с сегментом
	checkHeadCollision(x, y)
	{
		return ((x == this.x) && (y == this.y));
	}
//установка сегмента на поле
	deploy(x, y, mod)
	{
		this.x = x;
		this.y = y;
		this.renderer.deployTail(this, x, y)
	}
//сокрытие спрайта сегмента
	hide()
	{
		this.sprite.visible = false;
	}
}