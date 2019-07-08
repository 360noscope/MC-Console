module.exports = function () {
    function minesaga(box, res) {
        const colorMatch = {
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
        if (res.extra == undefined) {
            if (res.text != '') {
                chatBox.append('<span style="color:' + colorMatch[res['color']] + '; white-space: nowrap;">' + res.text + '</span><br>');
            }
        } else {
            const msgBlock = res.extra;
            if (msgBlock.length == 1) {
                const msgObj = msgBlock[0];
                if (msgObj.hasOwnProperty('extra')) {
                    const textOnly = [], msgList = msgObj['extra'];
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
                    if (msgObj != '') {
                        chatBox.append('<span style="color:' + colorMatch[msgObj['color']] + '; white-space: nowrap;">' + msgObj['text'] + '</span><br>');
                    }
                }
            } else {
                const textOnly = [];
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
                chatBox.append(textOnly.join(''));
            }
            $(chatBox).animate({
                scrollTop: $(chatBox).get(0).scrollHeight
            }, 1000);
        }
    }

    function catchEvent(msgData) {
        const pattern = {
            'payout': /Your payout: \$(\d{0,3},)?(\d{3},)?\d{0,3}/g,
            'balance': /Balance: \$(\d{0,3},)?(\d{3},)?\d{0,3}/g,
            'hub': /You're now connected to hub-/g,
            'inside': /You're now connected to the /g
        },
            data = {}, moneyPattern = /\$(\d{0,3},)?(\d{3},)?\d{0,3}/g;
        if (msgData.extra != undefined && msgData.extra.length > 1) {
            const realMsg = msgData.extra, text = [];
            realMsg.forEach(element => {
                if (element['text'] != '') {
                    text.push(element['text']);
                }
            });
            if (pattern['payout'].test(text.join(''))) {
                data['type'] = 'payout';
                data['result'] = text.join('').match(moneyPattern)[0];
            } else if (pattern['balance'].test(text.join(''))) {
                data['type'] = 'balance';
                data['result'] = text.join('').match(moneyPattern)[0];
            } else if (pattern['hub'].test(text.join(''))) {
                data['type'] = 'Hub';
                data['result'] = '';
            } else if (pattern['inside'].test(text.join(''))) {
                data['type'] = 'Inside';
                data['result'] = '';
            }
        }
        return data;
    }

    return {
        minesaga: minesaga,
        catchEvent: catchEvent
    }
}