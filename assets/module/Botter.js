module.exports = function (eventEmit) {
    const bots = {};
    const mineflayer = require('mineflayer');
    const chatter = require('../module/Chatter.js')();

    let manualLogout = false, retryConnection = false;
    const minesagaJoin = (data) => {
        const email = data['account']['email'],
            pass = data['account']['password'],
            server = data['server'];
        const serverOption = {
            version: '1.8.8',
            host: server,
            username: email,
            password: pass
        };
        const bot = mineflayer.createBot(serverOption);
        bot.on('error', function (err) {
            console.log('Cannot join: ' + err);
        });
        bot.on('kicked', function (reason, loggedIn) {
            console.log("You're kicked because " + reason);
            eventEmit.emit('Logout', manualLogout);
        });
        bot.on('end', function () {
            console.log('User disconected!');
            eventEmit.emit('Logout', manualLogout);
            if (manualLogout == false) {
                retryConnection = true;
            }
        });
        bot.on('login', function () {
            retryConnection = false;
            eventEmit.emit('Login', '');
            console.log(email + ' account just connected!');
            bot.on('message', function (res) {
                chatter.minesaga(res, function (chatData) {
                    const eventResult = chatter.catchEvent(chatData['stripedText']);
                    if (eventResult.hasOwnProperty('type')) {
                        if (eventResult['type'] == 'Payout') {
                            bot.chat('/bal');
                        } else if (eventResult['type'] == 'Hub') {
                            bot.chat('/joinqueue ' + data['realm']);
                        } else if (eventResult['type'] == 'Inside') {
                            bot.chat('/bal');
                        }
                        eventEmit.emit(eventResult['type'], eventResult['result']);
                    }
                    eventEmit.emit('chatMsg', chatData['decoratedChat']);
                });
            });
            bots[data['cardId']] = bot;
        });
    };

    const minesagaReconnect = (option) => {
        let connStatus = '';
        const checkConnection = () => {
            connStatus = navigator.onLine ? 'online' : 'offline';
        };
        checkConnection();
        console.log(connStatus);
        if (connStatus == 'online' && retryConnection == true) {
            console.log(option);
        } else if (connStatus == 'offline' && retryConnection == true) {
            console.log('internet still out');
        }
        return connStatus;
    };
    $(window).on('offline', minesagaReconnect);
    $(window).on('online', minesagaReconnect);


    const botChat = (id, msg) => {
        const bot = bots[id];
        bot.chat(msg);
    };

    const botDisconnect = (id) => {
        manualLogout = true;
        const bot = bots[id];
        bot.end();
        delete bots[id];
    };

    return {
        minesagaJoin: minesagaJoin,
        minesagaReconnect: minesagaReconnect,
        botChat: botChat,
        botDisconnect: botDisconnect
    }
}