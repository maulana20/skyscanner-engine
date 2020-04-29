# skyscanner-engine
SkyScanner API Connection Engine For Flight Schedule Search

## Setup ##

* npm install
* npm install -g nodemon

## Run ##

### Development ###

* nodemon index.js

## API ##


### __Create Search Session__ ###


* PATH: /search/create-session
* METHOD: POST
* QUERY: -
* PARAMS: 
    - origin
    - destination
    - depart_date
    - return_date (optional)
    - adult
    - child (optional, default: 0)
    - infant (optional, default: 0)
* RESPONSE: 
    
        {
            "status": "SUCCESS",
            "message": "Search session created",
            "content": {
                "session_code": "fbe465bd-ecce-4dc9-8903-f749bb0c1e51"
            },
            "reason": null
        }


### __Get Search Result__ ###


* PATH: /search/result
* METHOD: GET
* QUERY:
    - session_code
* PARAMS: -
* RESPONSE:

        {
            "status": "SUCCESS",
            "message": "Search result retrieved successfully",
            "content": {
                "depart_schedule": {
                    "search_status": "COMPLETE",
                    "search_progress": 1,
                    "airline_dic": {
                        "JT": {
                            "code": "JT",
                            "name": "Lion Air",
                            "image_url": "https://s1.apideeplink.com/images/airlines/JT.png"
                        },
                        ...
                    },
                    "itineraries": [
                        {
                            "price": 1139200,
                            "operator": "JT",
                            "route": "BTH-UPG",
                            "departure_datetime": "2020-03-15T08:35:00",
                            "arrival_datetime": "2020-03-15T16:30:00",
                            "stop": 1,
                            "key": "BTH-UPG#2020-03-15#1;0;0~~1139200~~JT 373#BTH-CGK#2020-03-15T08:35:00;2020-03-15T10:20:00~~JT 892#CGK-UPG#2020-03-15T13:10:00;2020-03-15T16:30:00",
                            "segments": [
                                {
                                    "route": "BTH-CGK",
                                    "operator": "JT",
                                    "airline": "JT 373",
                                    "departure_datetime": "2020-03-15T08:35:00",
                                    "arrival_datetime": "2020-03-15T10:20:00"
                                },
                                {
                                    "route": "CGK-UPG",
                                    "operator": "JT",
                                    "airline": "JT 892",
                                    "departure_datetime": "2020-03-15T13:10:00",
                                    "arrival_datetime": "2020-03-15T16:30:00"
                                }
                            ]
                        },
                        ...
                    ]
                }
            },
            "reason": null
        }
        

###  __Search Airport__ ###


* PATH: /airport/search
* METHOD: GET
* QUERY:
    - keyword (min: 3 characters)
* PARAMS: -
* RESPONSE:

        {
            "status": "SUCCESS",
            "message": "Search result retrieved successfully",
            "content": [
                {
                    "code": "PDG",
                    "name": "Padang",
                    "type": "Airport",
                    "country": "Indonesia"
                },
                ...
            ],
            "reason": null
        }


### __Get Cached Price__ ###


* PATH: /cache/price
* METHOD: GET
* QUERY:
    - origin
    - destination
    - date
* PARAMS: -
* RESPONSE:

        {
            "status": "SUCCESS",
            "message": "Price retrieved successfully",
            "content": {
                "2020-02-11T00:00:00": 608629,
                "2020-02-12T00:00:00": 608629,
                ...
            }
        }
