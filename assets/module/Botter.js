module.exports = function () {
    const mineflayer = require('mineflayer');
    function minesagaJoin(data, doneJoin) {
        var email = data['account']['email'],
            pass = data['account']['password'],
            server = data['server'];
        var serverOption = {
            version: '1.8.8',
            host: server,
            username: email,
            password: pass
        };
        var bot = mineflayer.createBot(serverOption);

        bot.on('error', function (err) {
            console.log('error on join server' + err);
            //socket.emit('joinError', err);
        });

        bot.on('kicked', function (reason, loggedIn) {
            bot = mineflayer.createBot(serverOption);
        });

        bot.on('login', function () {
            //join queue selected realm
            bot.chat('/joinqueue ' + data['realm']);

            doneJoin(bot);
        });
    }

    function minesagaChat(bot, data) {
        bot.chat(data['message']);
    }

    function disconnectServer(bot) {
        bot.end();
    }

    return {
        minesagaJoin: minesagaJoin,
        minesagaChat: minesagaChat,
        disconnectServer: disconnectServer
    }
}