module.exports = function (document, fs) {
    function listAccount(doneList) {
        var accountTable, tableData = [];
        fs.readFile('./assets/data/accounts.json', function (err, data) {
            if (err) { console.log(err); }
            var accountData = JSON.parse(data);
            Object.keys(accountData).forEach(function (element) {
                var entry_data = accountData[element];
                var entry = {
                    email: element,
                    created_date: entry_data['created_date']
                };
                tableData.push(entry);
            });
            if ($.fn.DataTable.isDataTable($(document).find('#accountTable'))) {
                $(document).find('#accountTable').DataTable().clear().destroy();
            }
            accountTable = $(document).find('#accountTable').DataTable({
                data: tableData,
                info: false,
                processing: true,
                autoWidth: true,
                dom: '<"row"<"col-3"l><"col-3 mt-4"><"col-6"f>>rtp',
                columns: [
                    { data: 'email' },
                    { data: 'created_date' }
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
            doneList(accountTable);
        });
    }
    function listServer(doneList) {
        var serverTable, tableData = [];
        fs.readFile('./assets/data/servers.json', function (err, data) {
            if (err) { console.log(err); }
            var serverData = JSON.parse(data);
            Object.keys(serverData).forEach(function (element) {
                var entry_data = serverData[element];
                var entry = {
                    name: element,
                    address: entry_data['address']
                };
                tableData.push(entry);
            });
            if ($.fn.DataTable.isDataTable($(document).find('#accountTable'))) {
                $(document).find('#serverTable').DataTable().clear().destroy();
            }
            serverTable = $(document).find('#serverTable').DataTable({
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
            doneList(serverTable);
        });
    }
    return {
        listAccount: listAccount,
        listServer: listServer
    }
}