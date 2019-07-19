module.exports = function () {
    const tables = require('../module/tableMan')();
    const Database = require('../module/Database')();
    const logger = require('../module/Logger')();
    const manageAccount = (done) => {
        $(document).find('#page-content').load('../html/accountManage.html', () => {
            tables.listAccount((res) => {
                done(res);
            });
        });
    }

    const accountForm = (container, done) => {
        $.get('../html/accountForm.html', function (data) {
            container.setContent(data);
            done();
        });
    }

    const manageServer = (done) => {
        $(document).find('#page-content').load('../html/serverManage.html', () => {
            tables.listServer((res) => {
                done(res);
            });
        });
    }

    const serverForm = (container, done) => {
        $.get('../html/serverForm.html', function (data) {
            container.setContent(data);
            done();
        });
    }

    const manageConsole = (botter, done) => {
        const accountList = {}, serverList = {};
        $('#page-content').load('../html/clientConsole.html', () => {
            Database.readData('accounts', '*', (accRes) => {
                Database.readData('servers', '*', (serverRes) => {
                    let cardCounter = 1;
                    for (accKey in accRes) {
                        $.get("../html/accountCard.html", function (data) {
                            var cardID = 'card-' + cardCounter;
                            $('div#ccList').append(data);
                            $('div#card').prop('id', cardID);
                            const cardContent = $('div#' + cardID);
                            cardContent.find('div.acc-email').text(accKey);
                            cardContent.find('div.acc-time').text('18:00');
                            const serverSelector = cardContent.find('select.server-selector');
                            const realmSelector = cardContent.find('select.realm-selector');
                            for (serverKey in serverRes) {
                                serverSelector.append($("<option />").val(serverKey).text(serverKey));
                                serverList[serverKey] = serverRes[serverKey];
                            }
                            const selectedServ = serverSelector.val();
                            $.each(serverRes[selectedServ]['realms'], function (i, item) {
                                realmSelector.append($("<option />").val(item).text(item));
                            });
                            accountList[cardID] = {
                                email: accKey,
                                password: accRes[accKey]['password'],
                                status: accRes[accKey]['status']
                            };
                            const botStatus = botter.getBotCardStatus(cardID);
                            if (botStatus == 'online') {
                                displayOnlineCard(cardID, botter);
                            }
                            cardCounter++;
                        });
                    }
                    if (Object.keys(accRes).length === 0 && accRes.constructor === Object) {
                        $.get('../html/emptyCC.html', function (data) {
                            $('div[id="ccList"]').append(data);
                        });
                    }
                    done({ 'accList': accountList, 'servList': serverList });
                });
            });
        });
    };

    const displayOnlineCard = (card, botter) => {
        const cardContent = $('div#' + card);
        const loginInfo = botter.getBotLoginInfo(botter.getBotName(card));
        consoleOnlineSwitch('div#' + card);
        const accStep = botter.getBotStep(botter.getBotName(card));
        if (accStep == 'hub') {
            cardContent.find('div.acc-status').text('Queueing on ' + loginInfo['realm'] + '...');
        } else if (accStep == 'inside') {
            cardContent.find('div.acc-status').text('Stalking your chunk...');
        }
        cardContent.find('select.server-selector select').val(loginInfo['host']);
        cardContent.find('select.realm-selector select').val(loginInfo['realm']);
        cardContent.find('select').prop('disabled', true);
    };

    const consoleModal = (container, doneLoad) => {
        $.get('../html/console.html', function (data) {
            container.setContent(data);
            doneLoad();
        });
    };

    const consoleOnlineSwitch = (id) => {
        const card = $(id + ' > div > div > div > div');
        $(id + ' > div').attr('class', 'card border-left-success shadow h-100 py-2');
        card.find('i.actionBtnIcon').attr('class', 'fas fa-stop actionBtnIcon');
        card.find('span.actionBtnText').text('Stop Agent!');
        card.find('a.actionBtn').removeClass('btn-success').addClass('btn-danger')
            .removeClass('offline').addClass('online');
        card.find('a.lConsole').remove();
        const consoleBtn = '<a href="#" class="btn btn-info btn-icon-split mb-3 lConsole">' +
            '<span class="icon text-white-50">' +
            '<i class="far fa-window-maximize"></i>' +
            '</span><span class="text">Open Console</span></a>';
        $(consoleBtn).insertAfter(card.find('a.actionBtn'));
    };

    const consoleOfflineSwitch = (id) => {
        const card = $(id + ' > div > div > div > div');
        $(id + ' > div').attr('class', 'card border-left-danger shadow h-100 py-2');
        card.find('a.actionBtn').removeClass('btn-danger').addClass('btn-success')
            .removeClass('online').addClass('offline');
        card.find('i.actionBtnIcon').attr('class', 'fas fa-play actionBtnIcon');
        card.find('span.actionBtnText').text('Start Agent!');
        card.find('a.lConsole').remove();
    };

    const chatLog = (done) => {
        $(document).find('#page-content').load('../html/chatLogConsole.html', () => {
            const logSelectorGroup = $('div#logSelectorGroup');
            const logSelector = $('select#logSelector');
            const logDisplay = $('div#logDisplay');
            const accSelector = $('div#logManageCard select#logAccount');
            const logPanel = $('div#logManageCard');
            logSelectorGroup.hide();
            logDisplay.hide();
            Database.readData('accounts', '*', (res) => {
                for (key in res) {
                    accSelector.append($("<option />").val(key).text(key));
                }
                $(document).off('click', '#searchLog').on('click', '#searchLog', (e) => {
                    logger.listLogFile(accSelector.find('option:selected').val(), (res) => {
                        logPanel.append('');
                        res.forEach((log) => {
                            logSelector.append($("<option />").val(log).text(log));
                        });
                        logSelectorGroup.show();
                        $(document).off('click', 'button#openLog').on('click', 'button#openLog', (e) => {
                            logger.readChatLog(logSelector.find('option:selected').val(), (res)=>{

                            });
                            logDisplay.show();
                        });
                    });
                });
                done();
            });
        });
    };

    return {
        manageAccount: manageAccount,
        accountForm: accountForm,
        manageServer: manageServer,
        manageConsole: manageConsole,
        consoleModal: consoleModal,
        consoleOnlineSwitch: consoleOnlineSwitch,
        consoleOfflineSwitch: consoleOfflineSwitch,
        serverForm: serverForm,
        chatLog: chatLog
    }
}