module.exports = function (eventEmit) {
    const bots = {}, connectInfos = {};
    const mineflayer = require('mineflayer');
    const chatter = require('../module/Chatter.js')();

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
            eventEmit.emit('Logout', manualLogout);
        });
        bot.on('end', function () {
            console.log('User disconected!');
            let isManual = false;
            if (connectInfos.hasOwnProperty(bot.username)) {
                isManual = false;
            } else {
                isManual = true;
            }
            eventEmit.emit('Logout', { 'username': bot.username, 'isManual': isManual });
        });
        bot.on('login', function () {
            eventEmit.emit('Login', '');
            console.log(data['email'] + ' account just connected!');
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
            bots[data['cardId']] = { 'username': bot.username, 'bot': bot };
            const accInfo = {
                'host': data['host'],
                'email': data['email'],
                'password': data['password'],
                'realm': data['realm'],
                'cardId': data['cardId']
            };
            connectInfos[bot.username] = { 'loginInfo': accInfo, 'id': data['cardId'] };
        });
    };

    const minesagaReconnect = (username) => {
        const checkConnection = () => {
            let connStatus = navigator.onLine ? 'online' : 'offline';
            console.log(connStatus);
            if (connStatus == 'online') {
                const loginInfo = connectInfos[username];
                const id = loginInfo['id'];
                delete bots[id];
                minesagaJoin(loginInfo['loginInfo']);
            }
        };
        checkConnection();
        $(window).on('offline', checkConnection);
        $(window).on('online', checkConnection);
    };

    const botChat = (id, msg) => {
        const bot = bots[id]['bot'];
        bot.chat(msg);
    };

    const botDisconnect = (id) => {
        manualLogout = true;
        const bot = bots[id]['bot'];
        const botUsername = bot.username;
        bot.end();
        delete bots[id];
        delete connectInfos[botUsername];
    };

    return {
        minesagaJoin: minesagaJoin,
        minesagaReconnect: minesagaReconnect,
        botChat: botChat,
        botDisconnect: botDisconnect
    }
}