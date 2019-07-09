module.exports = function (eventEmit) {
    const bots = {};
    const mineflayer = require('mineflayer');
    const chatter = require('../module/Chatter.js')();
    const probe = require('dns');
    const minesagaJoin = (data, done) => {
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
            alert('Cannot join: ' + err);
        });
        bot.on('kicked', function (reason, loggedIn) {
            console.log("You're kicked because " + reason);
        });
        bot.on('end', function () {
            console.log('Account disconected!');
            eventEmit.emit('Logout', '');
        });
        bot.on('login', function () {
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
            done();
        });
    };

    const minesagaReconnect = (option, done) => {

    };

    function minesagaReconnect(option, done) {
        done(mineflayer.createBot(option));
    }

    function botChat(id, msg) {
        const bot = bots[id];
        bot.chat(msg);
    }

    function botDisconnect(id) {
        const bot = bots[id];
        bot.end();
        delete bots[id];
    }

    return {
        minesagaJoin: minesagaJoin,
        minesagaReconnect: minesagaReconnect,
        botChat: botChat,
        botDisconnect: botDisconnect
    }
}