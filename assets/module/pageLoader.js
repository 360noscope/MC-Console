module.exports = function (document) {
    const tables = require('../module/tableMan.js')(document);
    const manageAccount = (done) => {
        $(document).find('#page-content').load('../html/accountManage.html', () => {
            tables.listAccount((res) => {
                done(res);
            });
        });
    }

    const accountForm = (done) => {
        $(document).find('.jconfirm-content').load('../html/accountForm.html', () => {
            done();
        });
    }

    const manageServer = (done) => {
        $(document).find('#page-content').load('../html/serverManage.html', () => {
            tables.listServer(function (res) {
                done(res);
            });
        });
    }
    /*
        function manageConsole(doneLoadAccount) {
            var accountList = {}, serverList = {};
            fs.readFile('./assets/data/servers.json', function (err, data) {
                if (err) { console.log(err); }
                var serverdata = JSON.parse(data);
                $(document).find('#page-content').load('../html/clientConsole.html', function () {
                    fs.readFile('./assets/data/accounts.json', function (err, data) {
                        if (err) { alert(err); }
                        var accounts = JSON.parse(data), cardCounter = 1;
                        Object.keys(accounts).forEach(function (element) {
                            $.get("../html/accountCard.html", function (data) {
                                var cardID = 'card-' + cardCounter,
                                    servSelectID = 'accServer-' + cardCounter,
                                    realmSelectID = 'accRealm-' + cardCounter;
                                $(document).find('div[id="ccList"]').append(data);
                                $(document).find('div[id="card"]').prop('id', cardID);
                                var cardContent = $(document).find('div[id="' + cardID + '"] > div > div > div > div');
                                cardContent.find('div.server-selector > select').attr('id', servSelectID);
                                cardContent.find('div.realm-selector > select').attr('id', realmSelectID);
                                cardContent.find('div.acc-email').text(element);
                                cardContent.find('div.acc-time').text('18:00');
                                Object.keys(serverdata).forEach(function (element) {
                                    cardContent.find('select[id="' + servSelectID + '"]').append($("<option />").val(element).text(element));
                                    serverList[element] = serverdata[element];
                                });
                                var selectedServ = cardContent.find('select[id="' + servSelectID + '"]').val();
                                $.each(serverdata[selectedServ]['realms'], function (i, item) {
                                    cardContent.find('select[id="' + realmSelectID + '"]').append($("<option />").val(item).text(item));
                                });
                                accountList[cardID] = {
                                    email: element,
                                    password: accounts[element]['password'],
                                    status: accounts[element]['status']
                                };
                                cardCounter++;
                            });
                        });
                        doneLoadAccount({ accList: accountList, servList: serverList });
                    });
                });
            });
        }
    */
    function consoleModal(container, doneLoad) {
        $.get('../html/console.html', function (data) {
            container.setContent(data);
            doneLoad();
        });
    }

    function consoleOnlineSwitch(cardParent) {
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
    }

    function consoleOfflineSwitch(cardParent) {
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
    }

    return {
        manageAccount: manageAccount,
        accountForm: accountForm,
        manageServer: manageServer,
        //manageConsole: manageConsole,
        consoleModal: consoleModal,
        consoleOnlineSwitch: consoleOnlineSwitch,
        consoleOfflineSwitch: consoleOfflineSwitch
    }
}