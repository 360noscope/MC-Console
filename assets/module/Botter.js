module.exports = function (eventEmit) {
    const bots = {}, connectInfos = {};
    const mineflayer = require('mineflayer');
    const Database = require('../module/Database')();
    const chatter = require('../module/Chatter')();

    const minesagaJoin = (data) => {
        const serverOption = {
            version: '1.8.8',
            host: data['host'],
            username: data['email'],
            password: data['password']
        };
        const bot = mineflayer.createBot(serverOption);
        bot.on('error', function (err) {
            console.log(err);
        });
        bot.on('kicked', function (reason, loggedIn) {
            console.log("You're kicked because " + reason);
            Database.updateData('accounts', { 'key': data['email'], 'data': { 'status': 'offline' } }, () => {
                eventEmit.emit('Logout', { 'username': bot.username, 'isManual': false });
            });
        });
        bot.on('end', function () {
            console.log('User disconected!');
            let isManual = false;
            if (connectInfos.hasOwnProperty(bot.username)) {
                isManual = false;
            } else {
                isManual = true;
            }
            Database.updateData('accounts', { 'key': data['email'], 'data': { 'status': 'offline' } }, () => {
                eventEmit.emit('Logout', { 'username': bot.username, 'isManual': isManual });
            });
        });
        bot.on('login', function () {
            eventEmit.emit('Login', { 'name': bot.username });
            Database.updateData('accounts', { 'key': data['email'], 'data': { 'status': 'online' } }, () => {
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
                            eventEmit.emit(eventResult['type'], { 'name': bot.username, 'eventResult': eventResult['result'] });
                        }
                        eventEmit.emit('chatMsg', chatData['decoratedChat']);
                    });
                });
                const accInfo = {
                    'host': data['host'],
                    'email': data['email'],
                    'password': data['password'],
                    'realm': data['realm'],
                    'cardId': data['cardId']
                };
                bots[bot.username] = { 'username': bot.username, 'bot': bot, 'loginInfo': accInfo };
            });
        });
    };

    const minesagaReconnect = (username) => {
        const checkConnection = () => {
            let connStatus = navigator.onLine ? 'online' : 'offline';
            console.log(connStatus);
            if (connStatus == 'online') {
                const loginInfo = bots[username]['loginInfo'];
                minesagaJoin(loginInfo['loginInfo']);
            }
        };
        checkConnection();
        $(window).on('offline', checkConnection);
        $(window).on('online', checkConnection);
    };

    const botChat = (name, msg) => {
        const bot = bots[name]['bot'];
        bot.chat(msg);
    };

    const botDisconnect = (name) => {
        const bot = bots[name]['bot'];
        bot.end();
        delete bots[name];
    };

    const displayBotStatus = (key) => {
        let result = 'offline';
        if (bots.hasOwnProperty(key)) {
            result = bots[key];
        }
        return result;
    };

    const displayBotConnectInfo = (username) => {
        return connectInfos[username];
    };

    return {
        minesagaJoin: minesagaJoin,
        minesagaReconnect: minesagaReconnect,
        botChat: botChat,
        botDisconnect: botDisconnect,
        displayBotStatus: displayBotStatus,
        displayBotConnectInfo: displayBotConnectInfo
    }
}