require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();

const fs = require('fs');
const Database = require('../module/Database')();
const EventEmitter = require('events').EventEmitter;
const loader = require('../module/pageLoader')();
let accountTable, serverTable, accountScreenList, serverScreenList;

$(document).ready(function () {
    Database.createDatabase();
});

//modal part
const modalEvent = new EventEmitter();
const modal = require('../module/modalLoader.js')(modalEvent);
$(document).on('click', '#manageAccount', function (e) {
    e.preventDefault();
    loader.manageAccount((res) => {
        accountTable = res;
    });
});
//end modal part

//account event
modalEvent.on('updateAccount', () => {
    loader.manageAccount((res) => {
        accountTable = res;
    });
});
$(document).on('click', '#addAccount', { 'action': 'new' }, function (e) {
    e.preventDefault();
    modal.accountModal(e.data.action, null, loader);
});
$(document).on('click', '#editAccount', { 'action': 'edit' }, function (e) {
    e.preventDefault();
    const selectedAcc = accountTable.row($(this).parents('tr')).data();
    modal.accountModal(e.data.action, selectedAcc.email, loader);
});
$(document).on('click', '#deleteAccount', function (e) {
    e.preventDefault();
    const selectedAcc = accountTable.row($(this).parents('tr')).data();
    modal.deleteAccountModal(selectedAcc.email);
});
//end account event

$(document).on('click', '#manageServer', (e) => {
    e.preventDefault();
    loader.manageServer((res) => {
        serverTable = res;
    });
});
$(document).on('click', '#addServer', { 'action': 'new' }, (e) => {
    modal.serverModal(e.data.action, null, loader);
});

//Botting part
const botEventEmit = new EventEmitter();
const botter = require('../module/Botter.js')(botEventEmit);
$(document).on('click', '#cClient', (e) => {
    e.preventDefault();
    loader.manageConsole(botter, (res) => {
        accountScreenList = res['accList'];
        serverScreenList = res['servList'];
    });
});
$(document).on('change', 'select[id^="accServer-"]', (e) => {
    e.preventDefault();
    var selectorParent = $(e.target).parent().parent();
    $.each(serverScreenList[$(e.target).val()]['realms'], function (i, item) {
        selectorParent.find('select[id^="accRealm-"]').empty().append($("<option />").val(item).text(item));
    });
});
$(document).on('click', 'div[id^="card-"] > div > div > div > div a.offline', { 'element': 'div[id^="card-"] > div > div > div > div a.offline' }, (e) => {
    e.preventDefault();
    const realParent = $(e.data.element);
    const cardID = realParent.parents().eq(4).attr('id');
    const selectedAccount = accountScreenList[cardID],
        server = realParent.parents().eq(4).find('select[id^="accServer-"]').val(),
        realm = realParent.parents().eq(4).find('select[id^="accRealm-"]').val();
    let payoutCounter = 0, totalPayout = 0;
    const AccountData = {
        'host': serverScreenList[server]['address'],
        'email': selectedAccount['email'],
        'password': selectedAccount['password'],
        'realm': realm,
        'cardId': cardID
    };

    const internet = navigator.onLine ? 'online' : 'offline';
    if (internet == 'online') {
        //account card button function
        const callConsole = (e) => {
            e.preventDefault();
            modal.consoleModal(loader, (cmodal) => {
                cmodal.$body.find('form#chatForm #parentCardID').val(cardID);
                const chatboxPopulate = (msg) => {
                    cmodal.$body.find('#chatBox').append(msg);
                    cmodal.$body.find('#chatBox').animate({
                        scrollTop: $(cmodal.$body.find('#chatBox')).get(0).scrollHeight
                    }, 500);
                };
                const chatSendBtn = (e) => {
                    e.preventDefault();
                    if (cmodal.$body.find('form#chatForm #msgInput').val() != '') {
                        botter.botChat(cardID, cmodal.$body.find('form#chatForm #msgInput').val());
                        cmodal.$body.find('form#chatForm #msgInput').val('');
                    }
                };
                const removeChatEvent = () => {
                    botEventEmit.removeListener('chatMsg', chatboxPopulate);
                    $(document).off('submit', 'form[id^="chatForm"]', chatSendBtn);
                };
                $(document).on('submit', 'form[id^="chatForm"]', chatSendBtn);
                botEventEmit.on('chatMsg', chatboxPopulate);
                botEventEmit.on('consoleClose', removeChatEvent);
            });
        };
        const logoutBtn = (e) => {
            e.preventDefault();
            botter.botDisconnect(cardID);
            botEventEmit.removeListener('Payout', payoutMsg);
            botEventEmit.removeListener('Balance', balanceMsg);
            botEventEmit.removeListener('Login', loginMsg);
            botEventEmit.removeListener('Hub', hubMsg);
            botEventEmit.removeListener('Inside', insideMsg);
        };

        //bot event function
        const payoutMsg = (msg) => {
            $($('div#' + msg['card']).parent().find('div.acc-payout').children().get(1)).text(msg['eventResult']);
            payoutCounter++;
            totalPayout += parseInt(msg['eventResult'].substring(1).replace(/\,/g, ''), 10);
            const avgPayout = (totalPayout / payoutCounter).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            $($('div#' + msg['card']).parent().find('div.acc-avg-payout').children().get(1)).text('$' + avgPayout);
        };
        const balanceMsg = (msg) => {
            $($('div#' + msg['card']).parent().find('div.acc-balance').children().get(1)).text(msg['eventResult']);
        };
        const loginMsg = (msg) => {
            $('div#' + msg['card']).parent().find('div.acc-status').text('Waiting in hub...');
            $('div#' + msg['card']).parents().eq(4).find('select[id^="accServer-"]').prop('disabled', true);
            $('div#' + msg['card']).parents().eq(4).find('select[id^="accRealm-"]').prop('disabled', true);
        };
        const hubMsg = (msg) => {
            loader.consoleOnlineSwitch($('div#' + msg['card']).find('a.offline'));
            $('div#' + msg['card']).parent().find('div.acc-status').text('Queueing on ' + realm + '...');
        };
        const insideMsg = (msg) => {
            $('div#' + msg['card']).parent().find('div.acc-status').text('Stalking your chunk...');
        };
        const logoutMsg = (result) => {
            $('div#' + result['card']).parent().find('div.acc-status').text('');
            $($('div#' + result['card']).parent().find('div.acc-balance').children().get(1)).text('-');
            $($('div#' + result['card']).parent().find('div.acc-payout').children().get(1)).text('-');
            $($('div#' + result['card']).parent().find('div.acc-avg-payout').children().get(1)).text('-');
            $('div#' + result['card']).parents().eq(4).find('select[id^="accServer-"]').prop('disabled', false);
            $('div#' + result['card']).parents().eq(4).find('select[id^="accRealm-"]').prop('disabled', false);
            if (result['isManual'] == true) {
                $(document).off('click', 'div[id^="card-"] > div > div > div > div a.online', logoutBtn);
                $(document).off('click', 'a.lConsole', callConsole);
                botEventEmit.removeListener('Logout', logoutMsg);
                loader.consoleOfflineSwitch($('div#' + result['card']).find('a.online'));
            } else {
                $('div#' + result['card']).parent().find('div.acc-status').text('Will reconnect when internet is back!');
                setTimeout(function () {
                    botter.minesagaReconnect(result['username']);
                }, 10000);
            }
        };

        //bot event listener binding
        botEventEmit.on('Payout', payoutMsg);
        botEventEmit.on('Balance', balanceMsg);
        botEventEmit.on('Login', loginMsg);
        botEventEmit.on('Hub', hubMsg);
        botEventEmit.on('Inside', insideMsg);
        botEventEmit.on('Logout', logoutMsg);

        //account card button listener binding
        $(document).on('click', 'a.lConsole', callConsole);
        $(document).on('click', 'div[id^="card-"] > div > div > div > div a.online', logoutBtn);

        //login method up to selected server
        if (server == 'minesaga') {
            botter.minesagaJoin(AccountData);
        }
    } else {
        alert('Cannot account because internet is down!');
    }
});
//end botting part