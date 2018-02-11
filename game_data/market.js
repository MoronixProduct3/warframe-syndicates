const request = require('request-promise');
const RpsQue = require('rps-queue');

/**
 * This File is used to interface with the Warframe market API.
 * https://warframe.market/
 * 
 * API documentation:
 * https://docs.google.com/document/d/1121cjBNN4BeZdMBGil6Qbuqse-sWpEXPpitQH5fb_Fo/edit?usp=drive_web
 */

const WF_MARKET_API = 'https://api.warframe.market/v1/';
const WF_MARKET_ITEMS = 'items';
const WF_MARKET_ORDERS = '/orders';
const WF_MARKET_STATS = '/statistics';
const API_RETRIES = 5;

const WF_MARKET_OPTIONS =
{
    baseURl: WF_MARKET_API,
    method : 'GET',
    headers:
    {
        'language' : 'en',
        'platform' : 'pc'
    }
}

// Throtling structure to respect the 3 rps limit on the API
const requestQue = new RpsQue({
    requestsPerSecond: 3  // rps was reduced because of interval jitter causing bursts of requests
});


// The list containing the WF market URLs
var itemTable = undefined;
var itemTable_lastUpdate = 0;

/**
 * This function update the URL lookup table
 */
module.exports.fetchItemLookup = async function ()
{
    var response = await requestQue.add( () => 
        request(WF_MARKET_API + WF_MARKET_ITEMS, WF_MARKET_OPTIONS) );

    itemTable = JSON.parse(response).payload.items.en;

    itemTable_lastUpdate = Date.now();

    return itemTable;
}

/**
 * This function fetches the URL used to obtain an item's details
 */
module.exports.getMarketURL = function(itemName)
{
    if(! itemTable)
        throw new Error("Item table has not yet been fetched. Call fetchItemLookup() to load the table");

    var matchingItem = itemTable.find( item => item.item_name == itemName);
    // First check for exact match than try to find submatch
    if (!matchingItem)
        matchingItem = itemTable.find( item => item.item_name.match(itemName) != null);

    if (matchingItem)
        return matchingItem.url_name;

    return undefined;
}

/**
 * This function fetches the current plat price of an item
 * This is computed by averaging the lowest sell prices
 * @param {string} itemURL The URL name of the item to evaluate
 * @param {number} [nbOffers=3] The number of prices to average to get the price
 */
module.exports.fetchPlatPrice = async function (itemURL, nbOffers)
{
    var ressourceURL = WF_MARKET_API + WF_MARKET_ITEMS + '/' +itemURL + WF_MARKET_ORDERS;
 
    for (var failedTries = 0; failedTries < API_RETRIES; ++failedTries)
    {
        try {
            var response = await requestQue.add( () =>
                request(ressourceURL, WF_MARKET_OPTIONS));
        }
        catch(e) {
            response = null;
            for (var i = failedTries; i > 0; --i)
                requestQue.add(() => {});   // Empty time slots
            continue;
        }
        break;
    }
    if (response == null)
        throw new Error('Failed to fetch ' + ressourceURL + ' after ' + API_RETRIES + ' tries');

    var orders = JSON.parse(response).payload.orders;

    // Filter only the online pc/en sell orders
    orders = orders.filter( (order) => 
        order.platform == 'pc' &&
        order.region == 'en' &&
        order.order_type == 'sell' &&
        order.user.status != 'offline');

    if(orders.length < 1)
    {
        // Currently no sell offers
        return 'no offer';
    }

    // Sort by plat price
    orders.sort((a, b) => a.platinum - b.platinum);

    if (nbOffers == undefined)
        nbOffers = 3;

    // Mean of the selected offers
    var mean = 0;
    for (var i = 0; i < nbOffers && i < orders.length; ++i)
    {
        mean += orders[i].platinum;
    }
    return Math.round(mean / i);
}