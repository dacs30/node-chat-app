// Client side JS

// server (emit) -> client (receive) --acknowledgement--> server
// client (emit) -> server (receive) --acknowledgement--> client

const socket = io();

// Elements for message
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

// Elements for the geolocation
const $sendLocationButton = document.querySelector('#send-location');

// Elements for the message display
const $messages = document.querySelector('#messages');

// Elements for templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}); // getting the query string to get the username and room
const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // get the heigh of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    //height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far down are we?
    const scrollOffset = ($messages.scrollTop + visibleHeight)*2;

    if (containerHeight - newMessageHeight < scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// this is where the message appears
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,  
        createdAt: moment(message.createdAt).format('H:mma')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (mapsUrl) => {
    console.log(mapsUrl);
    const html = Mustache.render(locationTemplate, {
        username: mapsUrl.username,
        url: mapsUrl.url,
        createdAt: moment(mapsUrl.createdAt).format('H:mma')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault(); // do not refresh the page
    // disable the message field
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = event.target.elements.message.value // get our input

    socket.emit('sendMessage', message, (error) => {

        // enable the message field again
        // and clearing the input field
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
        }
        console.log('Message delivered!')
    });
});

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('You do not support this feature');
    };

    // disable the button till the process is completed
    $sendLocationButton.setAttribute('disabled', 'disabled')

    // callback 
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            logitude: position.coords.longitude
        }, () => {
            // enabling the button again after the location is sent
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!')
        });
    });
});

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/' // back to the login page
    }
});
