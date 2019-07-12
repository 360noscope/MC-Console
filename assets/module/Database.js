module.exports = function () {
    const fs = require('fs');
    const path = require('path');
    const { remote } = require('electron');

    const dataPath = path.join(remote.app.getPath('appData'), '/mcconsole/');
    const createDatabase = () => {
        //Creating database when first launching app
        const pathList = {
            'accounts': path.join(dataPath, '/accounts.json'),
            'servers': path.join(dataPath, '/servers.json')
        };
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }
        for (key in pathList) {
            if (!fs.existsSync(pathList[key])) {
                if (key == 'servers') {
                    const westernPromo = {}
                    westernPromo["minesaga"] = {
                        "address": "minesaga.org",
                        "port": "",
                        "realms": [
                            "western",
                            "space",
                            "mystic",
                            "jurassic",
                            "kingdom"
                        ]
                    };
                    fs.writeFileSync(pathList[key], JSON.stringify(westernPromo));
                } else {
                    fs.writeFileSync(pathList[key], JSON.stringify({}));
                }
            }
        }
    };

    const tableList = {
        'accounts': 'accounts.json',
        'servers': 'servers.json'
    };

    const readData = (table, key, done) => {
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

    const writeData = (table, input, done) => {
        fs.readFile(path.join(dataPath, tableList[table]), 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            const oldData = JSON.parse(data);
            oldData[input['key']] = input['data'];
            fs.writeFile(path.join(dataPath, tableList[table]), JSON.stringify(oldData), (err) => {
                if (err) { alert(err); }
                done();
            });
        });
    };

    const updateData = (table, input, done) => {
        fs.readFile(path.join(dataPath, tableList[table]), 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            const oldData = JSON.parse(data);
            for (key in input['data']) {
                oldData[input['key']][key] = input['data'][key];
            }
            fs.writeFile(path.join(dataPath, tableList[table]), JSON.stringify(oldData), (err) => {
                if (err) { alert(err); }
                done();
            });
        });
    };

    const deleteData = (table, key, done) => {
        fs.readFile(path.join(dataPath, tableList[table]), 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            const oldData = JSON.parse(data);
            delete oldData[key];
            fs.writeFile(path.join(dataPath, tableList[table]), JSON.stringify(oldData), (err) => {
                if (err) { alert(err); }
                done();
            });
        });
    };

    return {
        createDatabase: createDatabase,
        readData: readData,
        writeData: writeData,
        updateData: updateData,
        deleteData: deleteData
    }
}
