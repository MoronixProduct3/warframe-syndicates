var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request-promise');
var Item = require('./item.js');

const defaultSyndicates = JSON.parse(fs.readFileSync(__dirname + '/syndicates.json','utf8'));

const WIKI_ROOT = 'http://warframe.wikia.com/wiki/';
const STANDING_REGEX = /(^\d+(?:,\d{3})*) Standing/;
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
     * This method forces to update from the wiki
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
                // Compute the standing cost
                var standingDigits = itemStandingCostString.trimLeft().match(STANDING_REGEX)[1];
                var standingCost = parseInt(standingDigits.replace(/\D/,''));

                // Adding item to the list
                tempItemList.push(new Item(itemName.trim(), standingCost));
            }
        });

        // Set the new list
        this.offerings = tempItemList;

        // Update lastFetch update
        this.offerings_last_update = Date.now();
    }


}

module.exports = Syndicate;