var express = require('express')
var cors = require('cors')
var session = require('express-session')
const app = express()

const MQService = require('./services/MQService');

const port = 3050

let mqService = new MQService();

app.use(cors())
var sessionStore = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
})

app.use(sessionStore)

app.get('/hotel/availability', async function (req, res) {
    mqService.availability(req.sessionID, req.query.startDate, req.query.endDate, req.query.city, req.query.eventId)
    res.status(200)
})

app.get('hotel/availability/results', function (req, res) {
    var value = req.session.hotels
    if (value) {
        delete req.session.hotels
    }
    res.send(value)
})

app.listen(port, async () => {
    await mqService.connection('');
    await mqService.onHotelAvailability((data) => {
        console.log("im here", arguments)
        sessionStore[data.sessionID]["hotels"] = data.hotels;
    })
})
