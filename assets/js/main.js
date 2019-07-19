require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();

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
    loader.manageConsole(botter, (res) => {
        accountScreenList = res['accList'];
        serverScreenList = res['servList'];
    });
    return false;
});
$(document).on('change', 'select[id^="accServer-"]', (e) => {
    var selectorParent = $(e.target).parent().parent();
    $.each(serverScreenList[$(e.target).val()]['realms'], function (i, item) {
        selectorParent.find('select[id^="accRealm-"]').empty().append($("<option />").val(item).text(item));
    });
    return false;
});
$(document).on('click', 'a.offline', (e) => {
    const cardParent = $(e.target).parents().eq(5);
    const selectedAccount = accountScreenList[cardParent.attr('id')],
        server = cardParent.find('select.server-selector').val(),
        realm = cardParent.find('select.realm-selector').val();
    let payoutCounter = 0, totalPayout = 0;
    const AccountData = {
        'host': serverScreenList[server]['address'],
        'email': selectedAccount['email'],
        'password': selectedAccount['password'],
        'realm': realm,
        'cardId': cardParent.attr('id')
    };

    const internet = navigator.onLine ? 'online' : 'offline';
    if (internet == 'online') {
        //account card button function
        const callConsole = (e) => {
            e.preventDefault();
            modal.consoleModal(loader, cardParent.attr('id'), (cmodal) => {
                const parentId = cmodal.$body.find('form#chatForm input#parentID').val();
                const msgDestination = botter.getBotName(parentId);
                $(document).off('submit', 'form#chatForm').on('submit', 'form#chatForm', { 'name': msgDestination }, function (e) {
                    e.preventDefault();
                    if (cmodal.$body.find('form#chatForm #msgInput').val() != '') {
                        botter.botChat(e.data.name, cmodal.$body.find('form#chatForm #msgInput').val());
                        cmodal.$body.find('form#chatForm #msgInput').val('');
                    }
                });
                const chatboxPopulate = (msg) => {
                    cmodal.$body.find('#chatBox').append(msg);
                    cmodal.$body.find('#chatBox').animate({
                        scrollTop: $(cmodal.$body.find('#chatBox')).get(0).scrollHeight
                    }, 500);
                };
                const removeChatEvent = () => {
                    botEventEmit.removeListener('chatMsg', chatboxPopulate);
                };
                botEventEmit.on('chatMsg', chatboxPopulate);
                botEventEmit.on('consoleClose', removeChatEvent);
            });
        };
        const logoutBtn = (e) => {
            e.preventDefault();
            const selectedBot = botter.getBotName(cardParent.attr('id'));
            botter.botDisconnect(selectedBot);
            botEventEmit.removeListener('Payout', payoutMsg);
            botEventEmit.removeListener('Balance', balanceMsg);
            botEventEmit.removeListener('Login', loginMsg);
            botEventEmit.removeListener('Hub', hubMsg);
            botEventEmit.removeListener('Inside', insideMsg);
        };

        //bot event function
        const payoutMsg = (msg) => {
            const botCard = $('div#' + botter.getBotCard(msg['name']));
            botCard.find('label.acc-payout').text(msg['eventResult']);
            payoutCounter++;
            totalPayout += parseInt(msg['eventResult'].substring(1).replace(/\,/g, ''), 10);
            const avgPayout = (totalPayout / payoutCounter).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            botCard.find('label.acc-avg-payout').text('$' + avgPayout);
        };
        const balanceMsg = (msg) => {
            const botCard = $('div#' + botter.getBotCard(msg['name']));
            botCard.find('label.acc-balance').text(msg['eventResult']);
        };
        const loginMsg = (msg) => {
            console.log('account just connected!');
            botter.matchBotCard(msg['name'], cardParent.attr('id'));
            const botCard = 'div#' + botter.getBotCard(msg['name']);
            loader.consoleOnlineSwitch(botCard);
            $(botCard).find('div.acc-status').text('Waiting in hub...');
            $(botCard).find('select').prop('disabled', true);
        };
        const hubMsg = (msg) => {
            const botCard = $('div#' + botter.getBotCard(msg['name']));
            botCard.find('div.acc-status').text('Queueing on ' + realm + '...');
        };
        const insideMsg = (msg) => {
            const botCard = $('div#' + botter.getBotCard(msg['name']));
            botCard.find('div.acc-status').text('Stalking your chunk...');
        };
        const logoutMsg = (result) => {
            const botCard = 'div#' + botter.getBotCard(result['username']);
            if (result['isManual'] == true) {
                $(botCard).find('div.acc-status').text('');
                $(botCard).find('label.acc-balance').text('-');
                $(botCard).find('label.acc-payout').text('-');
                $(botCard).find('label.acc-avg-payout').text('-');
                $(botCard).find('select').prop('disabled', false);
                loader.consoleOfflineSwitch(botCard);
                botter.removeBotCard(result['username']);
                botEventEmit.removeListener('Logout', logoutMsg);
            } else {
                $(botCard).find('div.acc-status').text('Will reconnect when internet is back!');
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
        $(document).off('click', 'div#' + cardParent.attr('id') + ' a.lConsole', callConsole)
            .on('click', 'div#' + cardParent.attr('id') + ' a.lConsole', callConsole);
        $(document).off('click', 'div#' + cardParent.attr('id') + ' a.online', logoutBtn)
            .on('click', 'div#' + cardParent.attr('id') + ' a.online', logoutBtn);

        //login method up to selected server
        if (server == 'minesaga') {
            botter.minesagaJoin(AccountData);
        }
    } else {
        alert('Cannot account because internet is down!');
    }
    return false;
});
//end botting part

$(document).on('click', '#chatLog', (e) => {
    e.preventDefault();
    loader.chatLog(() => {
    });
});

