module.exports = function (document, fs) {
    const Database = require('../module/Database')();
    const isEmptyForm = (edit) => {
        var result = false;
        $(document).find('form#accountForm :input').each(function () {
            if (edit == false) {
                if ($.trim($(this).val()) == '') {
                    result = true;
                }
            } else {
                if ($(this)[0].id != 'accountPass' && $(this)[0].id != 'confirmPass') {
                    if ($.trim($(this).val()) == '') {
                        result = true;
                    }
                }
            }
        });
        return result;
    }

    const isEmailExists = (done) => {
        var result = false;
        Database.readData('accounts', key, ()=>{

        });
        done(result);

    }

    function insertMcAccount(doneInsert) {
        fs.readFile('./assets/data/accounts.json', function (err, data) {
            if (err) { alert(err); }
            var day = new Date();
            var stringDay = day.getDay() + '/' + (day.getMonth() + 1) + '/' + day.getFullYear();
            var fileData = JSON.parse(data);
            fileData[$(document).find('#accountEmail').val()] = {
                password: $(document).find('#accountPass').val(),
                created_date: stringDay,
                status: 'offline'
            };
            fs.writeFile('./assets/data/accounts.json', JSON.stringify(fileData), function (err) {
                if (err) { alert(err); }
                doneInsert();
            });
        });
    }

    function updateMcAccount(selectedEmail, doneUpdate) {
        var editPass = $(document).find('#accountPass').val();
        fs.readFile('./assets/data/accounts.json', function (err, data) {
            if (err) { alert(err); }
            var accountData = JSON.parse(data);
            if (accountData[selectedEmail]['status'] != 'online') {
                if ($.trim(editPass) != '') {
                    accountData[selectedEmail]['password'] = editPass;
                }
            } else {
                $.alert({
                    title: 'Error!',
                    content: "Selected account is still online!",
                });
            }
            fs.writeFile('./assets/data/accounts.json', JSON.stringify(accountData), function (err) {
                if (err) { alert(err); }
                doneUpdate();
            });
        });
    }

    function deleteMcAccount(selectedEmail, doneDelete) {
        var accountBox;
        accountBox = $.confirm({
            title: 'Delete Account',
            animation: 'bottom',
            columnClass: 'col-md-6',
            containerFluid: true,
            content: 'Do you want to delete selected account?',
            buttons: {
                confirm: {
                    text: 'OK',
                    btnClass: 'btn btn-danger',
                    action: function () {
                        fs.readFile('./assets/data/accounts.json', function (err, data) {
                            if (err) { alert(err); }
                            var accountData = JSON.parse(data);
                            if (accountData[selectedEmail]['status'] != 'online') {
                                delete accountData[selectedEmail];
                            } else {
                                $.alert({
                                    title: 'Error!',
                                    content: "Selected account is still online!",
                                });
                            }
                            fs.writeFile('./assets/data/accounts.json', JSON.stringify(accountData), function (err) {
                                if (err) { alert(err); }
                                accountBox.close();
                                doneDelete();
                            });
                        });
                        return false;
                    }
                },
                cancel: {
                    text: 'Cancel',
                    btnClass: 'btn btn-warning',
                    action: function () {

                    }
                }
            }
        });


    }

    return {
        isEmptyForm: isEmptyForm,
        insertMcAccount: insertMcAccount,
        isEmailExists: isEmailExists,
        updateMcAccount: updateMcAccount,
        deleteMcAccount: deleteMcAccount
    }
}