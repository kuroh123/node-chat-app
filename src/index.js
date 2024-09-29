const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { generateLocation } = require('./utils/locations')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {
    console.log("Websocket connection!") // First connection when user joins

    socket.on('join', ({ username, room }) => {
        socket.join(room) // user joins in unique room, any event triggers with respect to this room will be happening in this room only
        
        socket.emit('message', generateMessage('Welcome!')) // emits message when user joins
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`)) // emits message to other users only when this user joins
    })

    socket.on('sendMessage', (message, callback) => { //listen for emitted message from client
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        
        io.emit('message', generateMessage(message)) // emit this message to every user 
        callback('Delivered!')
    })

    socket.on('sendLocation', (location, callback) => { // listen for emitted location from client
        io.emit('locationMessage', generateLocation(`https://google.com/maps?q=${location.lat},${location.long}`)) // emit this location to every user 
        callback()
    })

    socket.on('disconnect', () => { // listen for disconnect event
        io.emit('message', generateMessage('A user has left!')) // emit message to every user
    })
}) 

server.listen(PORT, () => {
    console.log('listening on PORT', PORT)
})