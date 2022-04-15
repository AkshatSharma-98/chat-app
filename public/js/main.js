const chatForm = document.getElementById('chatForm')
const chatMessages = document.querySelector('.chat-messages')

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

// Join chatroom
socket.emit('joinRoom', {username, room})

// Get Room and Users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message', message => {
    outputMessage(message)
    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get message text
    const msg = e.target.elements.msg.value

    // Emit message to the server
    socket.emit('chatMessage', msg)

    // clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

// Output Message to DOM
function outputMessage(message) {
    const element = document.createElement('div')
    element.classList.add('chat-message')
    element.innerHTML = `
        <p class="user">${message.username} <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
    `
    document.querySelector('.chat-messages').appendChild(element)
}

function outputRoomName(room) {
    const RoomName = document.getElementById('room-name')
    RoomName.textContent = room
}

function outputUsers(users) {
    const Users = document.getElementById('users')
    Users.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}