$(function() {
    let socket = io();
    $("#done").on('click',function(){
        let name = $('#name').val();
        socket.emit('start-game',name);

    })

});
