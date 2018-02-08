const restify = require('restify');
const DataCacher = require('./data_cacher');

const port = process.env.PORT || 80;

const dataStore = new DataCacher('cache.json', 5);

const server = restify.createServer();

server.get('syndicates', (req, res, next) => {
    res.send(200, dataStore.data);
    return next();
});

server.listen(port, ()=> {
    console.log(`api is running on port ${port}`);
});