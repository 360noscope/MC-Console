module.exports = function () {
    function minesaga(res, box) {
        var msgData = res.data, colorMatch = {
            'dark_red': '#AA0000',
            'red': '#FF5555',
            'gold': '#FFAA00',
            'yellow': '#FFFF55',
            'dark_green': '#00AA00',
            'green': '#55FF55',
            'aqua': '#55FFFF',
            'dark_aqua': '#00AAAA',
            'dark_blue': '#0000AA',
            'blue': '#5555FF',
            'light_purple': '#FF55FF',
            'dark_purple': '#AA00AA',
            'white': '#FFFFFF',
            'gray': '#AAAAAA',
            'dark_gray': '#555555',
            'black': '#000000'
        }, chatBox = box.find('#chatBox');
        if (msgData.extra == undefined) {
            if (msgData.text != '') {
                chatBox.append('<span style="color:' + colorMatch[msgData['color']] + '; white-space: nowrap;">' + msgData.text + '</span><br>');
            }
        } else {
            var msgBlock = msgData.extra;
            if (msgBlock.length == 1) {
                var msgObj = msgBlock[0];
                if (msgObj.hasOwnProperty('extra')) {
                    var textOnly = [], msgList = msgObj['extra'];
                    msgList.forEach(element => {
                        if (element['text'] != '') {
                            if (element['color'] == undefined) {
                                textOnly.push('<span style="color:' + colorMatch['white'] + '; white-space: nowrap;">' + element['text'] + '</span>');
                            } else {
                                textOnly.push('<span style="color:' + colorMatch[element['color']] + '; white-space: nowrap;">' + element['text'] + '</span>');
                            }
                        }
                    });
                    textOnly.push('<br>');
                    if (chatBox.length > 0) {
                        chatBox.append(textOnly.join(''));
                    }
                } else {
                    if (chatBox.length > 0) {
                        if (msgObj != '') {
                            chatBox.append('<span style="color:' + colorMatch[msgObj['color']] + '; white-space: nowrap;">' + msgObj['text'] + '</span><br>');
                        }
                    }
                }
            } else {
                var textOnly = [];
                msgBlock.forEach(element => {
                    if (element['text'] != '') {
                        if (element['color'] == undefined) {
                            textOnly.push('<span style="color:' + colorMatch['white'] + '; white-space: nowrap;">' + element['text'] + '</span>');
                        } else {
                            textOnly.push('<span style="color:' + colorMatch[element['color']] + '; white-space: nowrap;">' + element['text'] + '</span>');
                        }
                    }
                });
                textOnly.push('<br>');
                if (chatBox.length > 0) {
                    chatBox.append(textOnly.join(''));
                }
            }
            $(chatBox).animate({
                scrollTop: $(chatBox).get(0).scrollHeight
            }, 2000);
        }
    }
    return { minesaga: minesaga }
}