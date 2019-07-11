module.exports = function (eventEmit) {
    const accounts = require('./Accounts.js')();
    const accountModal = (action, email) => {
        let boxTitle = 'Add new minecraft account';
        if (action == 'edit') {
            boxTitle = 'Update account password';
        }
        const accountBox = $.confirm({
            title: boxTitle,
            animation: 'bottom',
            columnClass: 'col-md-6',
            containerFluid: true,
            buttons: {
                confirm: {
                    text: 'Save',
                    btnClass: 'btn btn-success',
                    action: () => {
                        accounts.writeAccountData(action, () => {
                            eventEmit.emit('updateAccount', '');
                            accountBox.close();
                        });
                        return false;
                    }
                },
                cancel: {
                    text: 'Cancel',
                    btnClass: 'btn btn-danger',
                    action: () => {
                    }
                }
            },
            onOpenBefore: () => {
                accountBox.showLoading();
            },
            onContentReady: () => {
                loader.accountForm(accountBox, () => {
                    if (action == 'edit') {
                        $(document).find('#accountEmail').attr('disabled', 'disabled');
                        $(document).find('#accountEmail').val(email);
                        $(document).find('#accountPass').attr('placeholder', '[Keep same password]');
                        $(document).find('#confirmPass').attr('placeholder', '[Keep same password]');
                    }
                    accountBox.hideLoading();
                });
            }
        });
    }

    const deleteAccountModal = (accountKey) => {
        $.confirm({
            title: 'Delete Account',
            animation: 'bottom',
            columnClass: 'col-md-6',
            containerFluid: true,
            content: 'Do you want to delete selected account?',
            buttons: {
                confirm: {
                    text: 'OK',
                    btnClass: 'btn btn-danger',
                    action: () => {
                        accounts.deleteAccountData(accountKey, () => {
                            eventEmit.emit('updateAccount', '');
                        });
                    }
                },
                cancel: {
                    text: 'Cancel',
                    btnClass: 'btn btn-warning',
                    action: () => {

                    }
                }
            }
        });
    }

    const consoleModal = (loader, done) => {
        const consoleBox = $.confirm({
            title: 'Console',
            animation: 'bottom',
            theme: 'dark',
            content: '',
            columnClass: 'col-md-8',
            containerFluid: true,
            buttons: {
                confirm: {
                    text: 'Save',
                    btnClass: 'btn btn-success',
                    isHidden: true,
                    action: function () {
                        return false;
                    }
                },
                cancel: {
                    text: 'Close',
                    btnClass: 'btn btn-danger',
                    action: function () {

                    }
                }
            },
            onClose: function () {
                eventEmit.emit('consoleClose');
            },
            onContentReady: function () {
                loader.consoleModal(consoleBox, function () {
                    done(consoleBox);
                });
            }
        });
    }

    return {
        accountModal: accountModal,
        deleteAccountModal: deleteAccountModal,
        consoleModal: consoleModal
    }
}