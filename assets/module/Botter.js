module.exports = function (eventEmit) {
    const bots = {}, botCardpairs = {};
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
            if (bots.hasOwnProperty(bot.username) != false) {
                isManual = false;
            } else {
                isManual = true;
                removeBotCard(bot.username);
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
                bots[bot.username] = { 'bot': bot, 'loginInfo': accInfo };
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

    const getBotCardStatus = (cardBot) => {
        let result = 'offline';
        if(typeof botCardpairs.botName != undefined){
            if (bots.hasOwnProperty(getBotName(cardBot))) {
                result = bots[key];
            }
        }
        return result;
    };

    const matchBotCard = (botName, card) => {
        botCardpairs[botName] = card;
    };

    const getBotCard = (botName) => {
        return botCardpairs[botName]
    };

    const getBotName = (card) => {
        return Object.keys(botCardPairs).find(key => botCardpairs[key] === card); //botcardpair is undefined
    };

    const removeBotCard = (botName) => {
        delete botCardpairs[botName];
    };

    return {
        minesagaJoin: minesagaJoin,
        minesagaReconnect: minesagaReconnect,
        botChat: botChat,
        botDisconnect: botDisconnect,
        getBotCardStatus: getBotCardStatus,
        matchBotCard: matchBotCard,
        getBotName: getBotName,
        getBotCard: getBotCard
    }
}