module.exports = function () {
    const Database = require('../module/Database')();
    const isEmptyForm = (action) => {
        let result = false;
        $('form#accountForm :input').each(function () {
            if (action == 'new') {
                if ($.trim($(this).val()) == '') {
                    result = true;
                }
            } else if (action == 'edit') {
                if ($(this)[0].id != 'accountPass' && $(this)[0].id != 'confirmPass') {
                    if ($.trim($(this).val()) == '') {
                        result = true;
                    }
                }
            }
        });
        return result;
    }

    const isEmailExists = (action, done) => {
        let result = false;
        const email = $('form#accountForm input#accountEmail').val();
        if (action == 'new') {
            Database.readData('accounts', email, (res) => {
                if (res != false) {
                    result = true;
                }
                done(result);
            });
        } else if (action == 'edit') {
            done(result);
        }
    }

    const writeAccountData = (action, done) => {
        if (isEmptyForm(action)) {
            $.alert({
                title: 'Error!',
                content: "There're empty field!",
            });
        } else {
            isEmailExists(action, (res) => {
                if (res) {
                    $.alert({
                        title: 'Error!',
                        content: "Email is already exists!",
                    });
                } else {
                    if ($('form#accountForm input#accountPass').val() != $('form#accountForm input#confirmPass').val()) {
                        $.alert({
                            title: 'Error!',
                            content: "You enter different password in both password field!",
                        });
                    } else {
                        const date = new Date();
                        const stringDate = date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
                        if (action == 'new') {
                            const inputData = {
                                'key': $('form#accountForm input#accountEmail').val(),
                                'data': {
                                    'password': $('form#accountForm input#accountPass').val(),
                                    'created_date': stringDate,
                                    'status': 'offline'
                                }
                            };
                            Database.writeData('accounts', inputData, () => {
                                done();
                            });
                        } else if (action == 'edit') {
                            if ($.trim($('form#accountForm input#accountPass').val()) != '') {
                                const inputData = {
                                    'key': $('form#accountForm input#accountEmail').val(),
                                    'data': {
                                        'password': $('form#accountForm input#accountPass').val()
                                    }
                                };
                                Database.updateData('accounts', inputData, () => {
                                    done();
                                });
                            }
                            done();
                        }
                    }
                }
            });
        }
    }

    const deleteAccountData = (accKey, done) => {
        Database.readData('accounts', accKey, (res) => {
            if (res['status'] == 'online') {
                $.alert({
                    title: 'Error!',
                    content: "Account still online!",
                });
            } else {
                Database.deleteData('accounts', accKey, () => {
                    done();
                });
            }
        });
    };

    return {
        writeAccountData: writeAccountData,
        deleteAccountData: deleteAccountData
    }
}