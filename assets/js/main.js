require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();

const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const loader = require('../module/pageLoader.js')(document, fs);
const modal = require('../module/modalLoader.js')(document, loader, fs);
const accounts = require('../module/Accounts.js')(document, fs);
var accountTable, serverTable, accountScreenList, serverScreenList;
$(document).ready(function () {
});

$(document).on('click', '#manageAccount', function (e) {
    e.preventDefault();
    loader.manageAccount(function (res) {
        accountTable = res;
    });
});

$(document).on('click', '#editAccount', function (e) {
    e.preventDefault();
    var selectedAcc = accountTable.row($(this).parents('tr')).data();
    modal.accountModal(true, selectedAcc);
});

$(document).on('click', '#deleteAccount', function (e) {
    e.preventDefault();
    var selectedAcc = accountTable.row($(this).parents('tr')).data();
    accounts.deleteMcAccount(selectedAcc['email'], function () {
        loader.manageAccount(function (res) {
            accountTable = res;
        });
    });
});

$(document).on('click', '#addAccount', function (e) {
    e.preventDefault();
    modal.accountModal();
});

$(document).on('click', '#cClient', function (e) {
    e.preventDefault();
    loader.manageConsole(function (res) {
        accountScreenList = res['accList'];
        serverScreenList = res['servList'];
    });
});

$(document).on('change', 'select[id^="accServer-"]', function (e) {
    e.preventDefault();
    var selectorParent = $(event.target).parent().parent();
    $.each(serverScreenList[$(e.target).val()]['realms'], function (i, item) {
        selectorParent.find('select[id^="accRealm-"]').empty().append($("<option />").val(item).text(item));
    });
});

//Botting part
const botEventEmit = new EventEmitter();
const botter = require('../module/Botter.js')(botEventEmit);
$(document).on('click', 'div[id^="card-"] > div > div > div > div a.offline', function (e) {
    e.preventDefault();
    const realParent = $(this);
    const selectedAccount = accountScreenList[$(this).parents().eq(4).attr('id')],
        server = realParent.parents().eq(4).find('select[id^="accServer-"]').val(),
        realm = realParent.parents().eq(4).find('select[id^="accRealm-"]').val();
    let payoutCounter = 0, totalPayout = 0;
    const data = {
        'server': serverScreenList[server]['address'],
        'account': selectedAccount,
        'realm': realm,
        'cardId': realParent.parents().eq(4).attr('id')
    };

    const payoutMsg = (msg) => {
        $(realParent.parent().find('div.acc-payout').children().get(1)).text(msg);
        payoutCounter++;
        totalPayout += parseInt(msg.substring(1).replace(/\,/g, ''), 10);
        const avgPayout = (totalPayout / payoutCounter).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        $(realParent.parent().find('div.acc-avg-payout').children().get(1)).text('$' + avgPayout);
    };
    botEventEmit.on('Payout', payoutMsg);

    const balanceMsg = (msg) => {
        $(realParent.parent().find('div.acc-balance').children().get(1)).text(msg);
    };
    botEventEmit.on('Balance', balanceMsg);

    const loginMsg = () => {
        realParent.parent().find('div.acc-status').text('Waiting in hub...');
        realParent.parents().eq(4).find('select[id^="accServer-"]').prop('disabled', true);
        realParent.parents().eq(4).find('select[id^="accRealm-"]').prop('disabled', true);
    };
    botEventEmit.on('Login', loginMsg);

    const hubMsg = () => {
        realParent.parent().find('div.acc-status').text('Queueing on ' + realm + '...');
    };
    botEventEmit.on('Hub', hubMsg);

    const insideMsg = () => {
        realParent.parent().find('div.acc-status').text('Stalking your chunk...');
    };
    botEventEmit.on('Inside', insideMsg);

    const logoutMsg = () => {
        loader.consoleOfflineSwitch(realParent);
        realParent.parent().find('div.acc-status').text('');
        $(realParent.parent().find('div.acc-balance').children().get(1)).text('-');
        $(realParent.parent().find('div.acc-payout').children().get(1)).text('-');
        $(realParent.parent().find('div.acc-avg-payout').children().get(1)).text('-');
        realParent.parents().eq(4).find('select[id^="accServer-"]').prop('disabled', false);
        realParent.parents().eq(4).find('select[id^="accRealm-"]').prop('disabled', false);
        botEventEmit.removeListener('Logout', logoutMsg);
    };
    botEventEmit.on('Logout', logoutMsg);

    if (server == 'minesaga') {
        botter.minesagaJoin(data, function () {
            loader.consoleOnlineSwitch(realParent);
        });
    }

    $(document).on('click', 'a.lConsole', function (e) {
        e.preventDefault();
        const cardId = $(this).parents().eq(4).attr('id');
        modal.consoleModal(botEventEmit, function (cmodal) {
            cmodal.$body.find('form#chatForm #parentCardID').val(cardId);
            const chatboxPopulate = (msg) => {
                cmodal.$body.find('#chatBox').append(msg);
                cmodal.$body.find('#chatBox').animate({
                    scrollTop: $(chatBox).get(0).scrollHeight
                }, 500);
            };
            const removeChatEvent = () => {
                botEventEmit.removeListener('chatMsg', chatboxPopulate);
            };
            botEventEmit.on('chatMsg', chatboxPopulate);
            botEventEmit.on('consoleClose', removeChatEvent);
        });
    });

    $(document).on('submit', 'form[id^="chatForm"]', function (e) {
        const botId = $(this).parent().find('#parentCardID').val();
        e.preventDefault();
        if ($(this).parent().find('#msgInput').val() != '') {
            botter.botChat(botId, $(this).parent().find('#msgInput').val());
            $(this).parent().find('#msgInput').val('');
        }
    });

    $(document).on('click', 'div[id^="card-"] > div > div > div > div a.online', function (e) {
        e.preventDefault();
        botter.botDisconnect($(this).parents().eq(4).attr('id'));
        botEventEmit.removeListener('Payout', payoutMsg);
        botEventEmit.removeListener('Balance', balanceMsg);
        botEventEmit.removeListener('Login', loginMsg);
        botEventEmit.removeListener('Hub', hubMsg);
        botEventEmit.removeListener('Inside', insideMsg);
    });
});
//end botting part

$(document).on('click', '#manageServer', function (e) {
    e.preventDefault();
    loader.manageServer(function (res) {
        serverTable = res;
    });
});