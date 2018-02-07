
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

    compareTo(other)
    {
        if(! (other instanceof SyndicateItem))
            throw new Error('Cannot compare SyndicateItem to something else');

        if (this.platPrice == undefined)
        {
            if (other.platPrice == undefined)
                return 0;
            return -1;
        }
        if (this.platPrice == 'no offer')
        {
            if (other.platPrice == 'no offer')
                return 0;
            return 1;
        }

        if (other.platPrice == undefined)
            return 1;
        if (other.platPrice == 'no offer')
            return -1;
        return this.platPerStanding - other.platPerStanding;
    }

    get platPerStanding()
    {
        if (this.platPrice == undefined || this.standingCost == undefined)
            return undefined;

        return this.platPrice / this.standingCost;
    }
}

module.exports = SyndicateItem;