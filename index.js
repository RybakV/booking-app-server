const fs = require('fs');
const http = require('http');
const host = 'localhost';
const port = 4000;

//SETTINGS
const offerSettings = {
    mapCenter: [35.6804334,139.7689218],
    mapZoom: 13,
    mapMaxZoom: 13,
    offerType: [
        {name: 'palace',en: 'Palace', ua: 'Палац'},
        {name: 'flat',en: 'Apartment', ua: 'Квартира'},
        {name: 'house',en: 'House', ua: 'Будинок'},
        {name: 'bungalow',en: 'Bungalow', ua: 'Бунгало'}
    ],
    offerTypePrice: {
        default: 0,
        palace: 10000,
        house: 5000,
        flat: 1000,
        bungalow: 0,
    },
    guestsFromRooms: {
        0: [0],
        1: [1,2],
        2: [1,2,3],
        3: [1,2,3],
        4: [4],
        5: [4,5,6],
    },
    // temporary data base
    authorsNames: ['Ben','joe','Sam'],
    titles: ['Good apartment','Nice green house','Hotel room', 'Duplex for all', 'Be my guest', 'Party house', 'Small room for the rest', 'Grandmas penthouse'],
    quantity: 45,
    price: {
        min: 1000,
        max: 8000,
    },
    checkins: ['12:00',' 13:00', '14:00'],
    checkouts: ['12:00',' 13:00', '14:00'],
    features: ['wifi', 'dishwasher','parking', 'washer', 'elevator', 'conditioner'],
    descriptions: [
        'Beautiful place for vacay.',
        'Good place for conferences.',
        'Nice and cheap choice for tourists.',
        'Rent for few days only.',
        'Safe kids area is available on the territory.'
    ],
    photos: ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'],
    avatarsQuantity: {
        min: 1,
        max: 8,
    },
    rooms: {
        min: 1,
        max: 5,
    },
    guests: {
        min: 1,
        max: 6,
    },
    location: {
        x: {
            min: 35.65000,
            max: 35.70000
        },
        y: {
            min: 139.70000,
            max: 139.80000
        }
    }
}

// UTILITIES
function getrandomNumber(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomLocationNumber(min, max){
    min = Math.ceil(min * 100000);
    max = Math.floor(max * 100000);
    return Math.floor(Math.random() * (max - min + 1) + min)/100000;
}

function getRandomArrayData(arr, num){
    const res = [];
    for(let i = 0; i < num; ){
        const random = Math.floor(Math.random() * arr.length);
        if(res.indexOf(arr[random]) !== -1){
            continue;
        }
        res.push(arr[random]);
        i++;
    }
    return res;
}

function getLocation(){
    return {
        x: getRandomLocationNumber(offerSettings.location.x.min, offerSettings.location.x.max),
        y: getRandomLocationNumber(offerSettings.location.y.min, offerSettings.location.y.max)
    }
}

// DATA GENERATION
function GetOffer(i){
    this.id = i;
    this.author = offerSettings.authorsNames[getrandomNumber(0, offerSettings.authorsNames.length -1)];

    let avatarIndex = getrandomNumber(offerSettings.avatarsQuantity.min,offerSettings.avatarsQuantity.max);
    this.avatarUrl = `./img/avatars/user${avatarIndex<10 ? '0'+avatarIndex : avatarIndex}.png`;

    let location = getLocation();
    this.location = location;

    this.offer = {};
    this.offer.title = offerSettings.titles[getrandomNumber(0, offerSettings.titles.length -1)];
    this.offer.address = location;
    this.offer.price = getrandomNumber(offerSettings.price.min, offerSettings.price.max);
    this.offer.type = offerSettings.offerType[getrandomNumber(0, offerSettings.offerType.length -1)];
    this.offer.rooms = `${getrandomNumber(offerSettings.rooms.min,offerSettings.rooms.max)}`;
    this.offer.guests = `${getrandomNumber(offerSettings.guests.min,offerSettings.guests.max)}`;
    this.offer.checkin = offerSettings.checkins[getrandomNumber(0, offerSettings.checkins.length -1)];
    this.offer.checkout = offerSettings.checkouts[getrandomNumber(0, offerSettings.checkouts.length -1)];
    this.offer.features = getRandomArrayData(offerSettings.features, getrandomNumber(1, offerSettings.features.length));
    this.offer.description = offerSettings.descriptions[getrandomNumber(0, offerSettings.descriptions.length -1)];
    this.offer.photos = getRandomArrayData(offerSettings.photos, getrandomNumber(1, offerSettings.photos.length));
}
const offers = [];
function getStartData(){
    for(let i = 0; i < offerSettings.quantity; i++) {
        let item = new GetOffer(i);
        offers.push(item);
    }
}
getStartData();

// SERVER REQUESTS
fs.writeFileSync('data.txt', JSON.stringify(offers));

http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requeted-With, Content-Type, Accept, Authorization, RBR");
    res.writeHead(200, {'Content-Type': 'application/json'});
    const url = req.url;

    if(url ==='/offers') {
        const dataTxt = fs.readFileSync('data.txt', 'utf8');
        res.end(dataTxt);
    }
    else if(url ==='/offer') {

        const txtData = fs.readFileSync('data.txt', 'utf8');
        const txtDataJson = JSON.parse(txtData);

        let responseString = '';
        req.on("data", (data) => {
            let stringData = data.toString('utf8');
            let stringDataParse = JSON.parse(stringData);
            stringDataParse.id = txtDataJson.length;

            txtDataJson.push(stringDataParse);
            console.log(txtDataJson);
            fs.writeFileSync('data.txt', JSON.stringify(txtDataJson));

            responseString = JSON.stringify(txtDataJson);
        });
        req.on('end', () => {
            res.end(responseString);
        });
    }
    else {
        res.write('Wrong route');
        res.end();
    }

}).listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
