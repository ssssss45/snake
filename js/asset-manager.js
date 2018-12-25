class AssetManager
{
	constructor(params)
	{	
		this.assetData = params.assets;

		this.nameArray = [];
		this.assets = [];
		this.usedAssets = [];

		for (var i = 0; i < this.assetData.length; i++)
		{
			this.assets[i] = [];
			this.usedAssets[i] = [];
			this.nameArray.push(this.assetData[i].type);
			this.generateAsset(this.assetData[i].assetClass, this.assetData[i].params, i, this.assetData[i].number);
		}
	}

	generateAsset(assetClass, params, location, number, type)
	{
		if (this.assets[location] == undefined)
		{
			this.assets[location] = [];
			this.usedAssets[location] = [];
			
			this.assetData[location] = {};
			this.assetData[location].type = type;
			this.assetData[location].assetClass = assetClass;
			this.assetData[location].params = params;
			this.assetData[location].number = 0;
		}
		for (var i = 0; i < number; i++)
		{
			var asset = new assetClass(params);
			asset.assetManagerAssetUsedMarker = false;
			this.assets[location].push(asset);
			this.assetData[location].number ++;
		}

		return asset;
	}

	getAssetByType(type)
	{
		var location = this.nameArray.indexOf(type);

		if (this.assets[location].length == 0)
		{
			this.generateAsset(this.assetData[location].assetClass, this.assetData[location].params, location, 1);
		}

		var asset = this.assets[location].pop();

		this.usedAssets[location].push(asset);
		return asset;
	}

	addAsset(type, number, params, assetClass)
	{
		var location = this.nameArray.indexOf(type);
		if (location == -1)
		{
			location = this.nameArray.length;
			this.nameArray[location] = type;
		}

		this.generateAsset(assetClass, params, location, number, type)
	}

	returnAsset(asset)
	{
		var location = locate(this.usedAssets, asset);
		
		if (location != -1)
		{
			this.assets[location.location].push(asset);
			this.usedAssets[location.location].splice(location.index, 1);
		}

		function locate(array, asset)
		{
			for (var i = 0; i < array.length; i++)	
			{
				var tempLoc = array[i].indexOf(asset);
				if (tempLoc > -1)
				{
					var data = {location : i, index : tempLoc}
					return data
				}
			}
			return -1;
		}
	}

	getRandomInt(min, max) 
	{
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}