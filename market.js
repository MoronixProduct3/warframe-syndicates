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
    requestsPerSecond: 3
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

    if (matchingItem)
        return matchingItem.url_name;

    return undefined;
}