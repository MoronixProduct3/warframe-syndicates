# warframe-syndicates-api
A simple api that gathers the items offered by each syndicate.

Syndicate items are pulled from the warframe [wiki](http://warframe.wikia.com/).  
Item prices are obtained from [Warframe Market](https://warframe.market/).

Item prices are an average of the 3 lowest prices of the current online sellers

## API
To get the current list simply `GET` [http://api.royal-destiny.com:80/syndicates](http://api.royal-destiny.com:80/syndicates)

Expected output structure:
```json
"syndicates":
[
    {
        "handle" : "meridian",
        "name" : "Steel Meridian",
        "wikiURL" : "Steel_Meridian",
        "wikiID" : 567077,
        "type" : "faction",
        "offerings" :
        [
            {
                "name" : "Vaykor Marelok",
                "standingCost" : 100000,
                "marketURL" : "vaykor_marelok",
                "platPrice" : 180,
                "platPrice_lastUpdate" : 1518291183979
            }
        ],
        "offerings_last_update" : 1518291183979
    }
]
```
