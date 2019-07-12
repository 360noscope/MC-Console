module.exports = function () {
    const tables = require('../module/tableMan')();
    const Database = require('../module/Database')();
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
                            var cardID = 'card-' + cardCounter,
                                servSelectID = 'accServer-' + cardCounter,
                                realmSelectID = 'accRealm-' + cardCounter;
                            $('div[id="ccList"]').append(data);
                            $('div[id="card"]').prop('id', cardID);
                            const cardContent = $('div[id="' + cardID + '"] > div > div > div > div');
                            cardContent.find('div.server-selector > select').attr('id', servSelectID);
                            cardContent.find('div.realm-selector > select').attr('id', realmSelectID);
                            cardContent.find('div.acc-email').text(accKey);
                            cardContent.find('div.acc-time').text('18:00');
                            const serverSelector = cardContent.find('select[id="' + servSelectID + '"]');
                            const realmSelector = cardContent.find('select[id="' + realmSelectID + '"]');
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
                            const botInfo = botter.displayBotStatus(cardID);
                            if (botInfo != 'offline') {
                                const connInfo = botter.displayBotConnectInfo(botInfo.username);
                                displayOnlineCard(cardContent, connInfo, serverSelector, realmSelector);
                                botInfo.chat('/bal');
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

    const displayOnlineCard = (cardContent, conInfo, serverselector, realmselector) => {
        const childElement = cardContent.find('a.offline');
        consoleOnlineSwitch(childElement);
        childElement.parents().eq(4).find('select[id^="accServer-"]').prop('disabled', true);
        childElement.parents().eq(4).find('select[id^="accRealm-"]').prop('disabled', true);
        cardContent.find('div.acc-status').text('Stalking your chunk...');

    };

    const consoleModal = (container, doneLoad) => {
        $.get('../html/console.html', function (data) {
            container.setContent(data);
            doneLoad();
        });
    };

    const consoleOnlineSwitch = (cardParent) => {
        var card = cardParent.parents().eq(4);
        var cardID = card.attr('id');
        var cardColorSel = $('#' + cardID + ' > div');
        var button = cardParent.parent().children().first();
        cardColorSel.attr('class', 'card border-left-success shadow h-100 py-2');
        var cardBtnSign = button.children().first().find('i'),
            cardBtnText = button.children().last();
        button.removeClass('btn-success').addClass('btn-danger')
            .removeClass('offline').addClass('online');
        cardBtnSign.attr('class', 'fas fa-stop');
        cardBtnText.text('Stop Agent!');
        var buttonParent = cardParent.parent(),
            consoleBtn = '<a href="#" class="btn btn-info btn-icon-split mb-3 lConsole">' +
                '<span class="icon text-white-50">' +
                '<i class="far fa-window-maximize"></i>' +
                '</span><span class="text">Open Console</span></a>';
        buttonParent.find('a.lConsole').remove();
        $(consoleBtn).insertAfter(buttonParent.children().first());
    };

    const consoleOfflineSwitch = (cardParent) => {
        var card = cardParent.parents().eq(4);
        var cardID = card.attr('id');
        var cardColorSel = $('#' + cardID + ' > div');
        var button = cardParent.parent().children().first();
        cardColorSel.attr('class', 'card border-left-danger shadow h-100 py-2');
        var cardBtnSign = button.children().first().find('i'),
            cardBtnText = button.children().last();
        button.removeClass('btn-danger').addClass('btn-success')
            .removeClass('online').addClass('offline');
        cardBtnSign.attr('class', 'fas fa-play');
        cardBtnText.text('Start Agent!');
        var buttonParent = cardParent.parent();
        buttonParent.find('a.lConsole').remove();
    };

    return {
        manageAccount: manageAccount,
        accountForm: accountForm,
        manageServer: manageServer,
        manageConsole: manageConsole,
        consoleModal: consoleModal,
        consoleOnlineSwitch: consoleOnlineSwitch,
        consoleOfflineSwitch: consoleOfflineSwitch,
        serverForm: serverForm
    }
}