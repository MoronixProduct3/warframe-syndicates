const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request-promise');
const Item = require('./item.js');
const wfMarket = require('./market.js');

const defaultSyndicates = JSON.parse(fs.readFileSync(__dirname + '/syndicates.json','utf8'));

const WIKI_ROOT = 'http://warframe.wikia.com/wiki/';
const STANDING_REGEX = /(^\d+(?:,\d{3})*) Standing/;
const STANDING_NON_DIGIT_REGEX = /\D/;
const ITEM_NAME_REGEX = /\(.*\)/;
const SYNDICATE_OFFERING_SELECTOR = '.syn-offer-box';
const SYNDICATE_OFFERING_STANDING_SELECTOR = '.syn-standing-cost';
const SYNDICATE_OFFERING_NAME_SELECTOR = '.syn-offer-name';

class Syndicate
{
    constructor(handle)
    {
        let model = defaultSyndicates.find(x => x.handle == handle);

        this.handle = model.handle;
        this.name = model.name;
        this.wikiURL = model.wiki_url;
        this.wikiID = model.wiki_id;
        this.type = model.type;

        this.offerings = [];            // List of items sold by the syndicate
        this.offerings_last_update = 0; // Time of the last wiki fetch
    }

    /**
     * Will set the offerings of the syndicate in the offerings member.
     * This method forces to update from the wiki.
     * This method does not update prices
     */
    async fetchOfferings()
    {
        let url = WIKI_ROOT + this.wikiURL;

        // Fetch the syndicate wiki page
        var body = await request(url);


        // Finding all syndicate offerings
        var $ = cheerio.load(body);

        var offerTags = $(SYNDICATE_OFFERING_SELECTOR);
        

        // Filling the offerings list
        let tempItemList = [];

        offerTags.each( function() 
        {
            var itemName = $(this).find(SYNDICATE_OFFERING_NAME_SELECTOR).text();

            var itemStandingCostString = $(this).find(SYNDICATE_OFFERING_STANDING_SELECTOR).text();

            if (itemName && itemStandingCostString)
            {
                // Remove item name extensions ex: Chromatic Blade (Excalibur) -> Chromatic Blade
                itemName = itemName.replace(ITEM_NAME_REGEX, '').trim();

                // Compute the standing cost
                var standingDigits = itemStandingCostString.trimLeft().match(STANDING_REGEX)[1];
                var standingCost = parseInt(standingDigits.replace(STANDING_NON_DIGIT_REGEX, ''));

                // Adding item to the list
                tempItemList.push(new Item(itemName, standingCost));
            }
        });

        // Set the new list
        this.offerings = tempItemList;

        // Update lastFetch update
        this.offerings_last_update = Date.now();
    }

    /**
     * This method will update the prices of all items in the syndicate
     */
    async fetchPrices()
    {
        // Making sure the lookup table is loaded
        try { wfMarket.getMarketURL(''); }
        catch(e) { await wfMarket.fetchItemLookup(); }

        var pricePromises = [];

        for (var item of this.offerings)
        {
            item.marketURL = wfMarket.getMarketURL(item.name);
            
            if (item.marketURL)
            {
                var pp = wfMarket.fetchPlatPrice(item.marketURL);

                pp.then( function(price) {
                    this.item.setPlatPrice(price);
                }.bind({item:item}));

                pricePromises.push(pp);
            }
        }

        await Promise.all(pricePromises);

        return this.offerings;
    }

    /**
     * This method sorts the offerings from best to worst
     * All of the items with no offers go to the top
     * The ones that are not tradable go to the bottom
     */
    sortOfferings()
    {
        this.offerings.sort( (a, b) => b.compareTo(a) );
    }

    /**
     * This method builds the entire offerings list with prices
     */
    async fetchOfferingsAndPrices()
    {
        var offer_p = this.fetchOfferings();
        var table_p = wfMarket.fetchItemLookup();

        await Promise.all([offer_p, table_p]);

        await this.fetchPrices();

        this.sortOfferings();

        return this.offerings;
    }

    /**
     * This static method returns an array with a copy of all the syndicates
     */
    static getAllSyndicates()
    {
        var output = [];

        for (var synd of defaultSyndicates)
            output.push(new Syndicate(synd.handle));

        return output;
    }

    /**
     * This method gets all the syndicates and populates them with prices
     * This call can take around 3 mins to resolve
     */
    static async getAllSyndicatesAndItems()
    {
        var syndicates = Syndicate.getAllSyndicates();

        for (var syndi of syndicates)
        {
            await syndi.fetchOfferingsAndPrices();
        }

        return syndicates;
    }
}

module.exports = Syndicate;