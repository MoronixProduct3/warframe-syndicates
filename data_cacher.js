const Syndicate = require('./game_data/syndicate');
const path = require('path');
const fs = require('fs');

class DataCacher
{
    constructor (filePath, updateIntervalMin)
    {
        var proposedPath = path.resolve(filePath);
        var pathObj = path.parse(proposedPath);

        if (!fs.existsSync(pathObj.dir))
            throw new Error(`Path to "${pathObj.dir}" does not exist`);

        if (updateIntervalMin < 3)
            throw new Error('Cannot update syndicates faster than every 3 min');

        this.filePath = path.resolve(filePath);
        this.updateIntervalMin = updateIntervalMin;

        this._data = {syndicates:[]};
        this._Qdata = null;

        // Load syndicates from file if it exists
        if (fs.existsSync(this.filePath))
        {
            this._data = JSON.parse(fs.readFileSync(this.filePath,'utf8'));
        }
        
        this.start();
    }

    /**
     * Starts updating the data at prescribed intervals
     */
    start()
    {
        this._timer = setInterval(
            this.updateData.bind(this),
            60000 * this.updateIntervalMin);
        this._isStarted = true;

        this.updateData();
    }

    stop() {
		clearInterval(this._timer);
		this._isStarted = false;
	}

    get data()
    {
        if (this._Qdata != null)
        {
            this._data = this._Qdata;
            this._Qdata = null;    
        }

        return this._data;
    }

    async updateData()
    {
        var time = new Date();
        console.log(time.toUTCString()+ ' - Starting fetch');

        var buildingData = {syndicates:[]};
        buildingData.syndicates = await Syndicate.getAllSyndicatesAndItems();

        fs.writeFile(this.filePath, JSON.stringify(buildingData), 'utf8', () =>
            console.log('Cache file updated')
        );

        this._Qdata = buildingData;

        time = new Date();
        console.log(time.toUTCString()+ ' - Finnish fetch');

        return this._Qdata;
    }
}

module.exports = DataCacher;