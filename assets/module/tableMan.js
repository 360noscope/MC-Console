module.exports = function () {
    const Database = require('../module/Database.js')();
    const listAccount = (done) => {
        let accountTable;
        const tableData = [];
        Database.readData('accounts', '*', (res) => {
            for (key in res) {
                const item = res[key];
                let editBtn = null;
                if (item['status'] == 'online') {
                    editBtn = '';
                }
                tableData.push({
                    'email': key,
                    'created_date': item['created_date'],
                    'editBtn': editBtn,
                    'delBtn': editBtn
                });
            }
            if ($.fn.DataTable.isDataTable($('table#accountTable'))) {
                $('table#accountTable').DataTable().clear().destroy();
            }
            accountTable = $('table#accountTable').DataTable({
                data: tableData,
                info: false,
                processing: true,
                autoWidth: true,
                dom: '<"row"<"col-3"l><"col-3 mt-4"><"col-6"f>>rtp',
                columns: [
                    { data: 'email' },
                    { data: 'created_date' },
                    { data: 'editBtn' },
                    { data: 'delBtn' }
                ],
                columnDefs: [
                    {
                        targets: [2],
                        className: "text-center",
                        defaultContent: "<button class='btn btn-warning' id='editAccount'>Update password</button>"
                    },
                    {
                        targets: [3],
                        className: "text-center",
                        defaultContent: "<button class='btn btn-danger' id='deleteAccount'>Delete</button>"
                    }
                ]
            });
            done(accountTable);
        });
    }

    const listServer = (done) => {
        const tableData = [];
        Database.readData('servers', '*', (res) => {
            for (key in res) {
                const item = res[key];
                tableData.push({
                    'name': key,
                    'address': item['address']
                });
            }
            if ($.fn.DataTable.isDataTable($('table#accountTable'))) {
                $('table#serverTable').DataTable().clear().destroy();
            }
            let serverTable = $('table#serverTable').DataTable({
                data: tableData,
                info: false,
                processing: true,
                autoWidth: true,
                dom: '<"row"<"col-3"l><"col-3 mt-4"><"col-6"f>>rtp',
                columns: [
                    { data: 'name' },
                    { data: 'address' }
                ],
                columnDefs: [
                    {
                        targets: [2],
                        className: "text-center",
                        defaultContent: "<button class='btn btn-warning' id='editServer'>Edit</button>"
                    },
                    {
                        targets: [3],
                        className: "text-center",
                        defaultContent: "<button class='btn btn-danger' id='deleteServer'>Delete</button>"
                    }
                ]
            });
            done(serverTable);
        });
    }
    return {
        listAccount: listAccount,
        listServer: listServer
    }
}