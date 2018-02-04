
class SyndicateItem
{
    constructor (name, standingCost, platPrice)
    {
        this.name = name;
        this.standingCost = standingCost;

        this.marketURL = undefined;

        this.platPrice = platPrice;

        if (this.platPrice != undefined)
            this.platPrice_last_update = Date.now();
        else
            this.platPrice_last_update = 0;
    }

    async fetchPlatPrice()
    {
        if (this.marketURL == undefined)
            return undefined;


        this.platPrice_last_update = Date.now();
    }

    get platPerStanding()
    {
        if (this.platPrice == undefined || this.standingCost == undefined)
            return undefined;

        return this.platPrice / this.standingCost;
    }
}

module.exports = SyndicateItem;