const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)

const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)
        // Welcome Current user
        socket.emit('message', formatMessage(user.username, 'Welcome To ChatApp'))

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(user.username, `${user.username} has entered the chat`))

        // Send Users And Room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, `${user.username} has left the chat`))
            socket.broadcast.to(user.room).emit('message', formatMessage(user.username, `${user.username} has entered the chat`))
        }
    })
})

const PORT = process.env.PORT || 3080

server.listen(PORT, () => console.log(`Server Running on port ${PORT}`))