$(function() {
    let socket = io();
    let canvas = document.getElementById('canvas');
    canvas.width = 800;
    canvas.height = 500;
    let context = canvas.getContext('2d');
    context.lineWidth = 5;
    let curColor = "black";
    let prevColor;
    let paint;
    const COLOR_ARRAY = [
        '#FFFFFF',
        '#B1B2B8',
        '#F71313',
        '#E8851D',
        '#FFE814',
        '#10F673',
        '#72DAE4',
        '#1B40E0',
        '#9723DF',
        '#E68FF1',
        '#805413',
        '#000000',
        '#575757',
        '#3D1E0D',
        '#7C3D0A',
        '#CD980D',
        '#19711F',
        '#145985',
        '#02074D',
        '#38082F',
        '#782F6A',
        '#47301B'
    ]
    COLOR_ARRAY.forEach(el => {
        $(".color-board").append(`<button class="color-cell" style="background:${el}"></button>`)

    })
    $(".color-cell").on('click', function(el) {
        curColor = $(this).css('background-color');
        $(".current-color").css('background-color', $(this).css('background-color'));
    })
    $("#brush").on('click', function() {
        curColor = prevColor;
    })
    $("#eraser").on('click', function() {
        prevColor = curColor;
        curColor = 'white';

    })
    $("#xsmall").on('click', function() {
        context.lineWidth = 5;
    })
    $("#small").on('click', function() {
        context.lineWidth = 10;
    })
    $("#medium").on('click', function() {
        context.lineWidth = 20;
    })
    $("#large").on('click', function() {
        context.lineWidth = 25;
    })

    $("#clear").on('click', function() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    })

    socket.emit('new player');
    function addClick(x, y, dragging) {
        socket.emit('add coord', x, y, dragging, curColor);
    }
    $('#canvas').mousedown(function(e) {
        context.beginPath();
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
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
    // $('#canvas').mouseleave(function(e) {
    //     paint = false;
    // });
    $('#canvas').mouseup(function(e) {
        paint = false;
    });
    $('form').submit(function() {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    $("#next-turn").on('click', function() {
        $("#word").text(word);
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        socket.emit('next-turn');
    })
    socket.on('show word', function(word) {
        $("#word").text(word);
    })
    socket.on('draw', function(players) {
        for (let player in players) {
            context.lineJoin = "round";
            for (let i = 0; i < players[player].clickX.length; i++) {
                context.beginPath();
                if (players[player].clickDrag[i] && i) {
                    context.moveTo(players[player].clickX[i - 1], players[player].clickY[i - 1]);
                } else {
                    context.moveTo(players[player].clickX[i] - 1, players[player].clickY[i]);
                }
                context.lineTo(players[player].clickX[i], players[player].clickY[i]);
                context.closePath();
                context.strokeStyle = players[player].clickColor[i];
                context.stroke();
            }

        }
    })

    socket.on('chat message', function(msg) {
        console.log(msg);
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('disconnect', function(msg) {
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('connect message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    })

});
