require('datatables.net-bs4')();
require('datatables.net-buttons-bs4')();
require('datatables.net-responsive-bs4')();
require('datatables.net-rowgroup-bs4')();
const fs = require('fs');
const loader = require('../module/pageLoader.js')(document, fs);
const modal = require('../module/modalLoader.js')(document, loader, fs);
var accountTable;
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

$(document).on('click', '#addAccount', function (e) {
    e.preventDefault();
    modal.accountModal();
});