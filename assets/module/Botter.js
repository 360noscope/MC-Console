module.exports = function (eventEmit) {
    const bots = {}, botCardpairs = {};
    const mineflayer = require('mineflayer');
    const Database = require('../module/Database')();
    const chatter = require('../module/Chatter')();
    const logger = require('../module/Logger')();

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
                                bots[bot.username]['step'] = 'hub';
                                bot.chat('/joinqueue ' + data['realm']);
                            } else if (eventResult['type'] == 'Inside') {
                                bots[bot.username]['step'] = 'inside';
                                bot.chat('/bal');
                            }
                            logger.writeChatLog(bot.player.username, chatData['stripedText']);
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
                bots[bot.username] = { 'bot': bot, 'loginInfo': accInfo, 'step': '' };
            });
        });
    };

    const minesagaReconnect = (username) => {
        const checkConnection = () => {
            let connStatus = navigator.onLine ? 'online' : 'offline';
            console.log(connStatus);
            if (connStatus == 'online') {
                const loginInfo = bots[username]['loginInfo'];
                minesagaJoin(loginInfo);
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
        if (bots.hasOwnProperty(getBotName(cardBot))) {
            bots[getBotName(cardBot)]['bot'].chat('/bal');
            result = 'online';
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
        return Object.keys(botCardpairs).find(key => botCardpairs[key] === card); //botcardpair is undefined
    };

    const removeBotCard = (botName) => {
        delete botCardpairs[botName];
    };

    const getBotStep = (botName) => {
        return bots[botName]['step'];
    };

    const getBotLoginInfo = (botName) => {
        return bots[botName]['loginInfo'];
    };

    return {
        minesagaJoin: minesagaJoin,
        minesagaReconnect: minesagaReconnect,
        botChat: botChat,
        botDisconnect: botDisconnect,
        getBotCardStatus: getBotCardStatus,
        matchBotCard: matchBotCard,
        getBotName: getBotName,
        getBotCard: getBotCard,
        getBotStep: getBotStep,
        getBotLoginInfo: getBotLoginInfo,
        removeBotCard: removeBotCard
    }
}