module.exports = function (document, fs) {
    function isEmptyForm(edit) {
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

    function isEmailExists(doneCheck) {
        var result = false;
        fs.readFile('./assets/data/accounts.json', function (err, data) {
            if (err) { alert(err); }
            var fileData = JSON.parse(data);
            if (fileData.hasOwnProperty($(document).find('#accountEmail').val())) {
                result = true;
            }
            doneCheck(result);
        });
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
        fs.readFile('./assets/data/accounts.json', function (err, data) {
            if (err) { alert(err); }
            var accountData = JSON.parse(data);
            if (accountData[selectedEmail]['status'] != 'online') {

            } else {
                $.alert({
                    title: 'Error!',
                    content: "Selected account is still online!",
                });
            }
        });
        fs.writeFile('./assets/data/accounts.json', JSON.stringify(accountData), function (err) {
            if (err) { alert(err); }
            doneDelete();
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