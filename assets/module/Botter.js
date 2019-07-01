module.exports = function (document) {
    var socket = io("http://localhost:3000");
    var botList = {};
    function joinServer(data) {
        socket.emit('joinServer', data);
        socket.on('chatMsg', function (res) {
            console.log(res);
            var msgObjList = res.extra, message = '';
                msgObjList.forEach(function (entry) {
                    message += (entry['text'] + ' ');
                });
           /* if ($('#chatBox').length > 0) {
                
                $('#chatBox').append(res['user'] + ' : ' + res['message'] + '<br>');
            }*/
        });

    }

    function leaveServer(email) {
        socket.emit('ServerDisconnect', email);
    }

    return {
        joinServer: joinServer,
        leaveServer: leaveServer
    }
}