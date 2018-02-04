const Syndicate = require('./syndicate.js');
const wfMarket = require('./market.js');

wfMarket.fetchItemLookup().then( () => 
{
    var itemURL = wfMarket.getMarketURL('Telos Akbolto');

    console.log(itemURL);
});
