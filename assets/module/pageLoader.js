module.exports = function (document, fs) {
    const tables = require('../module/tableMan.js')(document, fs);
    function manageAccount(doneLoad) {
        $(document).find('#page-content').load('../html/accountManage.html', function () {
            tables.listAccount(function (res) {
                doneLoad(res);
            });
        });
    }

    function accountForm(doneLoad) {
        $(document).find('.jconfirm-content').load('../html/accountForm.html', function () {
            doneLoad();
        });
    }

    function manageConsole() {
        $(document).find('#page-content').load('../html/clientConsole.html', function () {
            fs.readFile('./assets/data/accounts.json', function (err, data) {
                if (err) { alert(err); }
                var accounts = JSON.parse(data), cardCounter = 1;
                Object.keys(accounts).forEach(function (element) {
                    $.get("../html/accountCard.html", function (data) {
                        var cardEmailId = 'accEmail' + cardCounter,
                            cardTimeId = 'onlineTime' + cardCounter,
                            cardId = 'card-' + element.replace('@', '_');
                        $(document).find('div[id="ccList"]').append(data);
                        $(document).find('div[id="accEmail"]').prop('id', cardEmailId);
                        $(document).find('div[id="' + cardEmailId + '"]').text(element);
                        $(document).find('div[id="onlineTime"]').prop('id', cardTimeId);
                        $(document).find('div[id="card"]').prop('id', cardId);
                        $(document).find('div[id="' + cardId + '"]').addClass(accounts[element]['status']);
                        cardCounter++;
                    });
                });
            });
        });
    }

    function consoleCardSwitch(selectedCard) {
        var card = selectedCard.parents().eq(4);
        var child = selectedCard.parents().eq(3);
        var btnClass = selectedCard.attr('class').split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        var childClass = child.attr('class').split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        var cardClass = card.attr('class').split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        var accountStatus = cardClass[3];
        var accountEmail = card.attr('id').split('-')[1].replace('_', '@');
        if (accountStatus == 'offline') {
            cardClass[3] = 'online';
            card.attr('class', cardClass.join(' '))
            childClass[1] = 'border-left-success';
            child.attr('class', childClass.join(' '))
            btnClass[1] = 'btn-danger';
            selectedCard.attr('class', btnClass.join(' '));
           
        }
    }

    return {
        manageAccount: manageAccount,
        accountForm: accountForm,
        manageConsole: manageConsole,
        consoleCardSwitch: consoleCardSwitch
    }
}