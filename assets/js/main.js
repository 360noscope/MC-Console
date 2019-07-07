require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();

const fs = require('fs');
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
const chatter = require('../module/Chatter.js')();
const botter = require('../module/Botter.js')();
const bots = {};
$(document).on('click', 'div[id^="card-"] > div > div > div > div a.offline', function (e) {
    e.preventDefault();
    const realParent = $(this);
    const selectedAccount = accountScreenList[$(this).parents().eq(4).attr('id')],
        server = $(this).parents().eq(4).find('select[id^="accServer-"]').val(),
        realm = $(this).parents().eq(4).find('select[id^="accRealm-"]').val();
    if (server == 'minesaga') {
        const data = {
            'server': serverScreenList[server]['address'],
            'account': selectedAccount
        };
        botter.minesagaJoin(data, function (bot) {
            bot.on('error', function (err) {
                alert('Cannot join: ' + err);
            });
            bot.on('login', function () {
                loader.consoleOnlineSwitch(realParent);
                //join queue selected realm
                bot.chat('/joinqueue ' + realm);
                //create chat console box
                $(document).on('click', 'a.lConsole', function (e) {
                    e.preventDefault();
                    modal.consoleModal(bot, function (cmodal) {
                        cmodal.$body.find('#parentCardID').val(realParent.parents().eq(4).attr('id'));
                        bot.on('message', function (res) {
                            chatter.minesaga(cmodal.$body, res);
                        });
                    });
                });
                bot.on('kicked', function (reason, loggedIn) {
                    //bot = mineflayer.createBot(serverOption);
                    console.log(reason);
                });
                bots[realParent.parents().eq(4).attr('id')] = bot;
            });
        });
    }
});

$(document).on('click', 'div[id^="card-"] > div > div > div > div a.online', function (e) {
    e.preventDefault();
    const bot = bots[$(this).parents().eq(4).attr('id')];
    bot.end();
    delete bot[$(this).parents().eq(4).attr('id')];
    loader.consoleOfflineSwitch($(this));
});


$(document).on('submit', 'form[id^="chatForm"]', function (e) {
    e.preventDefault();
    var bot = bots[$(this).parent().find('#parentCardID').val()];
    if ($(this).parent().find('#msgInput').val() != '') {
        bot.chat($(this).parent().find('#msgInput').val());
        $(this).parent().find('#msgInput').val('');
    }
});

//end botting part

$(document).on('click', '#manageServer', function (e) {
    e.preventDefault();
    loader.manageServer(function (res) {
        serverTable = res;
    });
});