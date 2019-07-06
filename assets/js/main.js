require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();

const fs = require('fs');
var socket = io("http://localhost:4500");
const loader = require('../module/pageLoader.js')(document, fs);
const modal = require('../module/modalLoader.js')(document, loader, fs, socket);
const accounts = require('../module/Accounts.js')(document, fs);
const chatter = require('../module/Chatter.js')();
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

$(document).on('click', 'div[id^="card-"] > div > div > div > div a.offline', function (e) {
    e.preventDefault();
    var cardParent = $(this).parents().eq(4);
    var selectedAccount = accountScreenList[cardParent.attr('id')],
        server = cardParent.find('select[id^="accServer-"]').val(),
        realm = cardParent.find('select[id^="accRealm-"]').val();
    loader.consoleOnlineSwitch($(this));
    socket.emit('joinServer', {
        'server': serverScreenList[server]['address'],
        'realm': realm,
        'account': selectedAccount
    });
    socket.on('joinError', function (res) {
        alert('Failed to connect selected Account!');
    });
});

$(document).on('click', 'div[id^="card-"] > div > div > div > div a.online', function (e) {
    e.preventDefault();
    var cardParent = $(this).parents().eq(4);
    var selectedAccount = accountScreenList[cardParent.attr('id')];
    socket.emit('ServerDisconnect', selectedAccount['email']);
    loader.consoleOfflineSwitch($(this));
});

$(document).on('click', 'a.lConsole', function (e) {
    e.preventDefault();
    var cardParent = $(this).parent();
    var selectedEmail = accountScreenList[$(this).parents().eq(4).attr('id')]['email'];
    var server = cardParent.find('select[id^="accServer-"]').val();
    modal.accountConsoleModal(function (cmodal) {
        cmodal.$body.find('#chatEmail').val(selectedEmail);
        socket.on('chatMsg', function (res) {
            if (server == 'minesaga') {
                chatter.minesaga(res, cmodal.$body);
            }
        });
    });
});

$(document).on('submit', 'form[id^="chatForm"]', function (e) {
    e.preventDefault();
    var boxEmail = $(this).parent().find('#chatEmail').val();
    if ($('#msgInput').val() != '') {
        socket.emit('sendChat', { 'email': boxEmail, 'message': $(this).parent().find('#msgInput').val() });
        $(this).parent().find('#msgInput').val('');
    }
});

$(document).on('click', '#manageServer', function (e) {
    e.preventDefault();
    loader.manageServer(function (res) {
        serverTable = res;
    });
});