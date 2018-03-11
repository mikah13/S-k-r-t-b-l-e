$(function() {
    var socket = io();
    var canvas = document.getElementById('canvas');

    canvas.width = 800;
    canvas.height = 500;
    var context = canvas.getContext('2d');
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;

    socket.emit('new player');
    function addClick(x, y, dragging) {
        socket.emit('add coord', x, y, dragging);
    }
    $('#canvas').mousedown(function(e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        paint = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        socket.emit('redraw');
    });
    $('#canvas').mousemove(function(e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            socket.emit('redraw');
        }
    });

    $('#canvas').mouseup(function(e) {
        paint = false;
    });

    socket.on('draw', function(players) {
        for (let player in players) {
            console.log(players[player]);
            context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
            context.strokeStyle = "#df4b26";
            context.lineJoin = "round";
            context.lineWidth = 5;

            for (var i = 0; i < players[player].clickX.length; i++) {
                context.beginPath();
                if (players[player].clickDrag[i] && i) {
                    context.moveTo(players[player].clickX[i - 1], players[player].clickY[i - 1]);
                } else {
                    context.moveTo(players[player].clickX[i] - 1, players[player].clickY[i]);
                }
                context.lineTo(players[player].clickX[i], players[player].clickY[i]);
                context.closePath();
                context.stroke();
            }

        }
    })
    function redraw() {

        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
        context.strokeStyle = "#df4b26";
        context.lineJoin = "round";
        context.lineWidth = 5;

        for (var i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }

    }

    $('form').submit(function() {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('disconnect', function(msg) {
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('connect message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('a', function() {
        console.log("every1");
    })
});
