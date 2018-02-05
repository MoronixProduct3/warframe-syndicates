
class SyndicateItem
{
    constructor (name, standingCost, platPrice)
    {
        this.name = name;
        this.standingCost = standingCost;
        this.marketURL = undefined;

        this.platPrice = platPrice || undefined;
        if (this.platPrice != undefined)
            this.platPrice_lastUpdate = Date.now();
        else
            this.platPrice_lastUpdate = 0;
    }

    setPlatPrice(plat)
    {
        this.platPrice = plat;
        this.platPrice_lastUpdate = Date.now();
    }

    get platPerStanding()
    {
        if (this.platPrice == undefined || this.standingCost == undefined)
            return undefined;

        return this.platPrice / this.standingCost;
    }
}

module.exports = SyndicateItem;