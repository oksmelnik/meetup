var Meetup = require("meetup")
var mup = new Meetup()
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

const bodyParser = require('body-parser')
const Router = require('express').Router

server.listen(3002, () =>console.log('Express API listening on port 3002'))
app.use(bodyParser.json());

var topicsCounter = {}


const router = new Router()

this.country = 'nl'

app.get('/country/:id', (req, res) => {
    this.country = req.params.id
    res.send(200)
})

mup.stream("/2/rsvps", stream => {
    stream.on("data", item => {

        // inside of our stream ev ent handler (!) we retrieve the group topics
        const topicNames = item.group.group_topics.map(topic => topic.topic_name)


        if (item.group.group_country === this.country) {

            console.log('------------------')
            console.log(item.group)

            topicNames.forEach(name => {
                if (topicsCounter[name]) {
                    topicsCounter[name]++
                } else {
                    topicsCounter[name] = 1
                }
            })

            const arrayOfTopics = Object.keys(topicsCounter)

            arrayOfTopics.sort((topicA, topicB) => {
                if (topicsCounter[topicA] > topicsCounter[topicB]) {
                    return -1
                }
                else if (topicsCounter[topicB] > topicsCounter[topicA]) {
                    return 1
                } else {
                    return 0
                }
            })

            const top10 = arrayOfTopics.slice(0, 10)

            const topicsCounts = top10.map(topic => ({
              topic,
              count: topicsCounter[topic]
            }))

            io.emit('action', {
                type: 'ADD_RSVP',
                payload: item
            })

            io.emit('action', {
                type: 'UPDATE_TOPIC',
                payload: topicsCounts
            })
        }
    }).on("error", e => {
        console.log("error! " + e)
    });
});
