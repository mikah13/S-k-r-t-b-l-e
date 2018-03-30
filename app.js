let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();

let server = http.Server(app);
let io = socketIO(server);
const PORT = process.env.PORT || 3000;
app.use('/static', express.static(__dirname + '/static'));
// Routing

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/public/signup.html'));
});

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
})

app.get('/over', function(request, response) {
    response.sendFile(path.join(__dirname, '/public/gameover.html'));
});

function getId(obj, turn) {

    for (let val in obj) {
        if (obj[val].id === turn) {
            return val;
        }
    }
    return null;
}
function getPlayersLength(obj) {
    let count = 0;
    for (let val in obj) {
        count++;
    }
    return count;
}
function resetPlayer(player, word) {
    player.clickX = new Array();
    player.clickY = new Array();
    player.clickDrag = new Array();
    player.clickColor = new Array();
    player.lineWidth = new Array();
    player.word = word;
}
function checkGuessed(players, turn, socket) {
    for (let val in players) {

        if (players[val].guess === false && players[socket.id].id != turn) {

            return false;
        }
    }
    return true;
}
function getDrawing(players, turn) {
    for (let val in players) {

        if (players[val].id === turn) {

            return players[val].data;
        }
    }
    return null;
}
const MAX = 10;
let words = ["ability", "achieve", "acquire", "actions", "actress"];
let players = {};
let number = 0;
let turn = 0;
let name;
let curWord = words[Math.floor(Math.random() * words.length)];

io.on('connection', function(socket) {
    socket.on('new player', function(n) {
        if (n === null || n.trim() === '') {
            n = words[Math.floor(Math.random() * words.length)];
        }
        name = n;

    });
    socket.on('start game', function(data) {
        if (number <= MAX) {
            players[socket.id] = {
                name: name,
                data: data,
                id: number,
                guess: false
            }
            number++;
        } else {
            io.emit('main menu', socket.id)
        }
        io.emit('show word', {
            word: curWord,
            player: getId(players, turn)
        });

        io.emit('draw', getDrawing(players, turn));
        io.emit('connect message', players[socket.id].name);
        io.emit('add new player', players);
    })

    socket.on('next-turn', function() {
        for (let val in players) {
            // players[val].clickX = new Array();
            // players[val].clickY = new Array();
            // players[val].clickDrag = new Array();
            // players[val].clickColor = new Array();
            // players[val].lineWidth = new Array();
            // players[val].word = '';
            // players[val].guess = false;
        }

        turn++;
        if (turn >= number) {
            turn = 0;
        }
        io.emit('reset all');

        curWord = words[Math.floor(Math.random() * words.length)];

        io.emit('show word', {
            word: curWord,
            player: getId(players, turn)
        });
        // let count = 0;
        // var lastUpdateTime = (new Date()).getTime();
        // let x = setInterval(function() {
        //     io.emit('countdown', count);
        //     count++;
        //     var currentTime = (new Date()).getTime();
        //     var timeDifference = currentTime - lastUpdateTime;
        //     if (count === 5) {
        //         clearInterval(x);
        //         if (getPlayersLength(players) > 1) {
        //             socket.emit('next');
        //         }
        //     }
        //     lastUpdateTime = currentTime;
        // }, 1000);

    })

    // socket.on('add coord', function(x, y, z, t, u) {
    //     if (players[socket.id] !== undefined) {
    //         let player = players[socket.id];
    //         if (player.id === turn) {
    //             player.clickX.push(x);
    //             player.clickY.push(y);
    //             player.clickDrag.push(z);
    //             player.clickColor.push(t);
    //             player.lineWidth.push(u);
    //         }
    //     }
    // })

    socket.on('redraw', function(data) {

        if (data.id === getId(players, turn)) {
            players[data.id].data = data;
            io.emit('draw', data);
        }
    })

    socket.on('reset', function(id) {
        // players[socket.id].clickX = new Array();
        // players[socket.id].clickY = new Array();
        // players[socket.id].clickDrag = new Array();
        // players[socket.id].clickColor = new Array();
        // players[socket.id].lineWidth = new Array();
        if (players[id].id === turn) {
            io.emit('reset all');
        }
    })
    socket.on('disconnect', function() {
        if (players[socket.id] !== undefined) {
            if (getId(players, turn) === socket.id) {
                io.emit('reset all');
                curWord = words[Math.floor(Math.random() * words.length)];
                io.emit('show word', {
                    word: curWord,
                    player: getId(players, turn)
                });
            }
            for (let prop in players) {
                if (players[prop].id > players[socket.id].id) {
                    players[prop].id--;
                }
            }
            let msg = `Player ${players[socket.id].name} has left`;
            io.emit('disconnect', msg);
            io.emit('home-page', socket.id);
            delete players[socket.id];
            number--;
            if (number < 2) {
                io.emit('game-over');
            }
        }
    });

    socket.on('chat message', function(msg) {
        if (msg.trim() !== '') {
            if (!players[socket.id].guess && players[socket.id].id != turn) {

                if (msg.trim().toLowerCase() === curWord) {
                    players[socket.id].guess = true;
                    io.emit('chat message', players[socket.id].name + " guessed the word!");
                } else {
                    io.emit('chat message', players[socket.id].name + ": " + msg);
                }
                if (checkGuessed(players, turn, socket) === true) {

                    io.emit('next', socket.id);
                }
            }

        }
    });

});

server.listen(PORT, function() {});
