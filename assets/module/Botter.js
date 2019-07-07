module.exports = function () {
    const mineflayer = require('mineflayer');
    function minesagaJoin(data, finishJoin) {
        var email = data['account']['email'],
            pass = data['account']['password'],
            server = data['server'];
        var serverOption = {
            version: '1.8.8',
            host: server,
            username: email,
            password: pass
        };
        finishJoin(mineflayer.createBot(serverOption));
    }

    return {
        minesagaJoin: minesagaJoin
    }
}