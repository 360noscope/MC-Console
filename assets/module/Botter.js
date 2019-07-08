module.exports = function (eventEmit, chatter) {
    const bots = {};
    const mineflayer = require('mineflayer');
    function minesagaJoin(data, finishJoin) {
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
            console.log('Server disconected! reconnect in 10 seconds');
        });
        bot.on('login', function () {
            //join queue selected realm
            bot.chat('/joinqueue ' + data['realm']);
            bot.on('message', function (res) {
                const moneyResult = chatter.catchMoney(res);
                if(moneyResult['type'] == 'payout'){
                    bot.chat('/bal')
                }
                eventEmit.emit(moneyResult['type'], moneyResult['result']);
                eventEmit.emit('chatMsg', res);
            });
            bots[data['cardId']] = bot;
            finishJoin();
        });
    }

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