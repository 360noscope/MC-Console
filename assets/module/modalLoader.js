module.exports = function (document, loader, fs) {
    const accounts = require('./Accounts.js')(document, fs);
    function accountModal(edit = false, editData = null) {
        var accountBox, boxTitle = 'Add new minecraft account';
        if (edit == true) {
            boxTitle = 'Update account password';
        }
        accountBox = $.confirm({
            title: boxTitle,
            animation: 'bottom',
            columnClass: 'col-md-6',
            containerFluid: true,
            buttons: {
                confirm: {
                    text: 'Save',
                    btnClass: 'btn btn-success',
                    action: function () {
                        if (accounts.isEmptyForm(edit) == false) {
                            if ($.trim($(document).find('#accountPass').val())
                                == $.trim($(document).find('#confirmPass').val())) {
                                if (edit == true) {
                                    accounts.updateMcAccount(editData.email, function () {
                                        loader.manageAccount(function (res) {
                                            accountTable = res;
                                            accountBox.close();
                                        });
                                    });
                                } else {
                                    accounts.isEmailExists(function (res) {
                                        if (res == false) {
                                            accounts.insertMcAccount(function () {
                                                loader.manageAccount(function (res) {
                                                    accountTable = res;
                                                    accountBox.close();
                                                });
                                            });
                                        } else {
                                            $.alert({
                                                title: 'Error!',
                                                content: "This email is already exists!",
                                            });
                                        }
                                    });
                                }
                            } else {
                                $.alert({
                                    title: 'Error!',
                                    content: "Both password box are not match!",
                                });
                            }
                        } else {
                            $.alert({
                                title: 'Error!',
                                content: "There're some empty input box!",
                            });
                        }
                        return false;
                    }
                },
                cancel: {
                    text: 'Cancel',
                    btnClass: 'btn btn-danger',
                    action: function () {

                    }
                }
            },
            onOpenBefore: function () {
                accountBox.showLoading();
            },
            onContentReady: function () {
                loader.accountForm(function () {
                    if (edit == true) {
                        $(document).find('#accountEmail').attr('disabled', 'disabled');
                        $(document).find('#accountEmail').val(editData.email);
                        $(document).find('#accountPass').attr('placeholder', '[Keep same password]');
                        $(document).find('#confirmPass').attr('placeholder', '[Keep same password]');
                    }
                    accountBox.hideLoading();
                });
            }
        });
    }

    function accountConsoleModal() {
        var consoleBox;
        consoleBox = $.confirm({
            title: 'Console',
            animation: 'bottom',
            columnClass: 'col-md-6',
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
            onOpenBefore: function () {
                consoleBox.showLoading();
            },
            onContentReady: function () {
                loader.consoleModal(function () {
                    consoleBox.hideLoading();
                });
            },
        });
    }

    return {
        accountModal: accountModal,
        accountConsoleModal: accountConsoleModal
    }
}