module.exports = function () {
    const fs = require('fs');
    const path = require('path');
    const { remote } = require('electron');

    const createDatabase = () => {
        //Creating database when first launching app
        const dataPath = path.join(remote.app.getPath('appData'), '/mcconsole/');
        const pathList = {
            'accounts': path.join(dataPath, '/accounts.json'),
            'servers': path.join(dataPath, '/servers.json')
        };
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }
        for (key in pathList) {
            if (!fs.existsSync(pathList[key])) {
                fs.writeFileSync(pathList[key], JSON.stringify({}));
            }
        }
    };

    const readData = (table, key, done) => {
        const dataPath = path.join(remote.app.getPath('appData'), '/mcconsole/');
        const tableList = {
            'accounts': 'accounts.json',
            'servers': 'servers.json'
        };
        if (key != '*') {
            fs.readFile(path.join(dataPath, tableList[table]), 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                }
                const result = JSON.parse(data)[key];
                if (result == undefined) {
                    done(false);
                } else {
                    done(result);
                }
            });
        } else {
            fs.readFile(path.join(dataPath, tableList[table]), 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                }
                done(JSON.parse(data));
            });
        }
    };

    const writeData  = () => {

    };

    return {
        createDatabase: createDatabase,
        readData: readData
    }
}
