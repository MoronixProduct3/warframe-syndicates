const restify = require('restify');
const DataCacher = require('./data_cacher');

const port = process.env.PORT || 80;

const dataStore = new DataCacher('cache.json', 5);

const server = restify.createServer();

server.get('syndicates', (req, res, next) => {
    if(dataStore.data)
        res.send(200, dataStore.data);
    else
        res.send(503, 'HTTP 503: Just wait, we are gathering data!');
    return next();
});

server.listen(port, ()=> {
    console.log(`api is running on port ${port}`);
});