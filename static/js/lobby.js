$(function() {
    let socket = io();
    socket.emit('new player');

    socket.on('main menu', function(id) {
        if (id === socket.id) {
            window.location.href = '/';
        }
    })
});
