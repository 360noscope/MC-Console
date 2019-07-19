module.exports = () => {
    const fs = require('fs');
    const path = require('path');
    const { remote } = require('electron');
    const crypto = require('crypto');
    const mojangAPI = require('mojang-api');

    const encrypter = (msg) => {
        const iv = crypto.randomBytes(16);
        const key = crypto.randomBytes(32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(msg);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    const decrypter = (code) => {
        const textParts = code.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const key = crypto.createHash('sha256').update(String(uid)).digest('base64').substr(0, 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        const decryptedMsg = decrypted.toString();
        return decryptedMsg;
    }

    const writeChatLog = (username, msg) => {
        const date = new Date();
        const stringDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
        const chatPath = path.join(remote.app.getPath('appData'), '/mcconsole/log/chat-'
            + username + '_' + stringDate + '.mccon');
        if (!fs.existsSync(chatPath)) {
            const newChatLog = {
                'created_date': stringDate,
                'username': username,
                'chat_data': []
            }
            fs.writeFileSync(chatPath, JSON.stringify(newChatLog));
        }
        const msgWithStamp = date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() +
            '-' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '|' + msg + '\r\n';
        fs.readFile(chatPath, 'utf-8', (err, data) => {
            if (err) { console.log(err); }
            const chatObj = JSON.parse(data);
            const msgLine = encrypter(msgWithStamp);
            chatObj['chat_data'].push(msgLine);
            fs.writeFile(chatPath, JSON.stringify(chatObj), (err) => {
                if (err) { console.log(err); }
            });
        });
    };

    const listLogFile = (email, done) => {
        const chatPath = path.join(remote.app.getPath('appData'), '/mcconsole/log/');
        fs.readdir(chatPath, (err, files) => {
            if (err) { console.log(err); }
            files.forEach((file) => {
                const dataPath = path.join(chatPath, file);
                fs.readFile(dataPath, (err, data) => {
                    if (err) { console.log(err); }
                    const logList = [];
                    if (JSON.parse(data)['email'] == email) {
                        logList.push(file);
                    }
                    done(logList);
                });
            });
        });
    };

    const readChatLog = (name) => {
        const chatPath = path.join(remote.app.getPath('appData'), '/mcconsole/log/' + name);
        fs.readFile(chatPath, (err, data) => {
            if (err) { console.log(err); }
            const chatData = JSON.parse(data)['chat_data'];
            chatData.forEach((msg) => {

            });
        });
    };

    return {
        writeChatLog: writeChatLog,
        decrypter: decrypter,
        listLogFile: listLogFile,
        readChatLog: readChatLog
    }
};