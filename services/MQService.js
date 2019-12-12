const env = process.env;
var amqp = require('amqplib/callback_api');
const mqHost = env.MQ_HOST || 'amqp://localhost';



class MQService {
    constructor() {
        this.conn = null;
        this.channel = null;
        this.hotelAvailabilityQueue = null;
    }

    async connection(host) {
        return new Promise(async (resolv, reject) => {
            amqp.connect(host, async (error0, connection) => {
                if (error0) return reject(error0)
                else {
                    this.conn = connection;
                    this.channel = await this.createChannel()
                    this.hotelAvailabilityQueue = await this.declareQueue("availability")
                    resolv(this)
                }
            });
        });
    }

    availability(sessionID, startDate, endDate, city, eventId) {
        return this.channel.sendToQueue('availability',
            Buffer.from(JSON.stringify({ sessionID, startDate, endDate, city, eventId }), 'utf8'), {
            });

    }

    async declareQueue(name) {
        return new Promise((resolv, reject) => {
            this.channel.assertQueue(name, {
                exclusive: true
            }, (error2, q) => {
                if (error2) return reject(error2);
                else resolv(q)

            });
        })
    }

    async onHotelAvailability(callback) {

        var q = await this.declareQueue("availabilityResults")

        this.channel.consume(q.queue, function (msg) {
            callback(JSON.parse(msg.content.toString()))
        }, {
                noAck: true
            });
    }

    async  createChannel() {
        return new Promise((resolv, reject) => {
            this.conn.createChannel(function (error1, channel) {
                if (error1) return reject(error1);
                else resolv(channel)
            })
        });
    }
}
module.exports = MQService;