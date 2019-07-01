require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();

const fs = require('fs');
const loader = require('../module/pageLoader.js')(document, fs);
const modal = require('../module/modalLoader.js')(document, loader, fs);
const accounts = require('../module/Accounts.js')(document, fs);
const botter = require('../module/Botter.js')(document);
var accountTable, serverTable, accountScreenList, serverScreenList,
    botList = {};
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
    botter.joinServer({
        'server': serverScreenList[server]['address'],
        'realm': realm,
        'account': selectedAccount
    });
});

$(document).on('click', 'div[id^="card-"] > div > div > div > div a.online', function (e) {
    e.preventDefault();
    var cardParent = $(this).parents().eq(4);
    var selectedAccount = accountScreenList[cardParent.attr('id')];
    botter.leaveServer(selectedAccount['email']);
    loader.consoleOfflineSwitch($(this));
});

$(document).on('click', 'a.lConsole', function (e) {
    e.preventDefault();
    modal.accountConsoleModal();
});

$(document).on('click', '#manageServer', function (e) {
    e.preventDefault();
    loader.manageServer(function (res) {
        serverTable = res;
    });
});