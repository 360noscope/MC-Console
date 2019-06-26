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
    return { manageAccount: manageAccount, accountForm: accountForm }
}