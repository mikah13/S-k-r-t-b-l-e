$(function() {
    let socket = io();
    let canvas = document.getElementById('canvas');
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var size = (w > h)
        ? h
        : w;
    let context = canvas.getContext('2d');
    context.lineWidth = 5;
    let curColor = "black";
    let prevColor;
    let curLineWidth = 5;
    let paint;
    let mouseDown = 0;
    let data = {
        id: socket.id,
        clickX: new Array(),
        clickY: new Array(),
        clickDrag: new Array(),
        clickColor: new Array(),
        lineWidth: new Array()
    }
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
        curLineWidth = 5;
    })
    $("#small").on('click', function() {
        curLineWidth = 10;
    })
    $("#medium").on('click', function() {
        curLineWidth = 18;
    })
    $("#large").on('click', function() {
        curLineWidth = 25;
    })
    $("#clear").on('click', function() {
        socket.emit('reset',socket.id);
    })
    socket.on('add new player', function(players) {
        data.id = socket.id
        let text = '<ul>';
        for (let val in players) {
            text += `<li>${players[val].name}</li>`;
        }
        $(".leaderboard").html(text + '</ul>');
    })
    socket.on('reset all', function() {
        data.clickX = new Array();
        data.clickY = new Array();
        data.clickDrag = new Array();
        data.clickColor = new Array();
        data.lineWidth = new Array();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    })
    socket.emit('start game', data);
    function addClick(x, y, dragging) {
        data.clickX.push(x);
        data.clickY.push(y);
        data.clickDrag.push(dragging);
        data.clickColor.push(curColor);
        data.lineWidth.push(curLineWidth);
    }
    $('#canvas').mouseout(function(e) {

        paint = mouseDown === 1
            ? true
            : false;
    })
    $('#canvas').mousedown(function(e) {
        ++mouseDown;
        context.beginPath();
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        paint = true;
        addClick(mouseX, mouseY);

        socket.emit('redraw', data);
    });
    $('#canvas').mousemove(function(e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);

            socket.emit('redraw', data);
        }
    });

    $('body').mouseup(function(e) {
        --mouseDown;
        paint = false;
    });

    socket.on('next', function(id) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        if (socket.id === id) {
            socket.emit('next-turn');
        }
    })

    socket.on('show word', function(args) {

        if (socket.id === args.player) {

            $("#word").text(args.word);
        } else {
            let hidden = new Array(args.word.length).fill('_').join('');
            $("#word").text(hidden);
        }
    })
    socket.on('draw', function(data) {

        context.lineJoin = "round";
        for (let i = 0; i < data.clickX.length; i++) {
            context.beginPath();
            if (data.clickDrag[i] && i) {
                context.moveTo(data.clickX[i - 1], data.clickY[i - 1]);
            } else {
                context.moveTo(data.clickX[i] - 1, data.clickY[i]);
            }
            context.lineTo(data.clickX[i], data.clickY[i]);
            context.closePath();
            context.lineWidth = data.lineWidth[i];
            context.strokeStyle = data.clickColor[i];
            context.stroke();
        }

    })

    // Notification and chat

    $('form').submit(function() {
        socket.emit('chat message', $('#inputChat').val());
        $('#inputChat').val('');
        return false;
    });
    socket.on('chat message', function(msg) {
        let chat = document.getElementById("chat");
        let shouldScroll = chat.scrollTop + chat.clientHeight === chat.scrollHeight;

        $('#messages').append($('<li>').append(msg));
        if (!shouldScroll) {
            scrollToBottom();
        }
    });
    function scrollToBottom() {
        let chat = document.getElementById("chat");
        chat.scrollTop = chat.scrollHeight;
    }
    socket.on('disconnect', function(msg) {
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('connect message', function(name) {
        let msg = `Player ${name} has joined!`
        $('#messages').append($('<li>').text(msg));
    }).on('game-over', function() {
        window.location.href = '/';
    }).on('home-page', function(id) {
        if (socket.id === id) {
            window.location.href = '/';
        }
    })

});
