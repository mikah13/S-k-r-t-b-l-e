var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();

var server = http.Server(app);
var io = socketIO(server);
const PORT = process.env.PORT || 3000;
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.

var players = {};

io.on('connection', function(socket) {

    socket.on('disconnect', function() {
        delete players[socket.id];
        let msg = `Player ${socket.id} has left`;
        io.emit('disconnect',msg);
    });

    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });

});

server.listen(PORT, function() {
    
});
