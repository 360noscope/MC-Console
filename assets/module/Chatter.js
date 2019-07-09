module.exports = function () {
    function minesaga(res, done) {
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
        };
        const decoratedText = [], stripedText = [];
        if (res.extra == undefined) {
            if (res.text != '') {
                decoratedText.push('<span style="color:' + colorMatch[res['color']] + '; white-space: nowrap;">' + res.text + '</span><br>');
                stripedText.push(res.text);
            }
        } else {
            const msgBlock = res.extra;
            if (msgBlock.length == 1) {
                const msgObj = msgBlock[0];
                if (msgObj.hasOwnProperty('extra')) {
                    const msgList = msgObj['extra'];
                    msgList.forEach(element => {
                        if (element['text'] != '') {
                            if (element['color'] == undefined) {
                                decoratedText.push('<span style="color:' + colorMatch['white'] + '; white-space: nowrap;">' + element['text'] + '</span>');
                                stripedText.push(element['text']);
                            } else {
                                decoratedText.push('<span style="color:' + colorMatch[element['color']] + '; white-space: nowrap;">' + element['text'] + '</span>');
                                stripedText.push(element['text']);
                            }
                        }
                    });
                } else {
                    if (msgObj != '') {
                        decoratedText.push('<span style="color:' + colorMatch[msgObj['color']] + '; white-space: nowrap;">' + msgObj['text'] + '</span>');
                        stripedText.push(msgObj['text']);
                    }
                }
                decoratedText.push('<br>');
            } else {
                //Payout and balance msg come from here
                msgBlock.forEach(element => {
                    if (element['text'] != '') {
                        if (element['color'] == undefined) {
                            decoratedText.push('<span style="color:' + colorMatch['white'] + '; white-space: nowrap;">' + element['text'] + '</span>');
                            stripedText.push(element['text']);
                        } else {
                            decoratedText.push('<span style="color:' + colorMatch[element['color']] + '; white-space: nowrap;">' + element['text'] + '</span>');
                            stripedText.push(element['text']);
                        }
                    }
                });
                decoratedText.push('<br>');
            }
            /*$(chatBox).animate({
                scrollTop: $(chatBox).get(0).scrollHeight
            }, 1000);*/
        }
        done({
            'decoratedChat': decoratedText.join(''),
            'stripedText': stripedText.join('')
        });
    }

    function catchEvent(msg) {
        const pattern = {
            'payout': /Your payout: \$(\d{0,3},)?(\d{3},)?\d{0,3}/g,
            'balance': /Balance: \$(\d{0,3},)?(\d{3},)?\d{0,3}/g,
            'hub': /You're now connected to hub-/g,
            'inside': /You're now connected to the /g,
            'money': /\$(\d{0,3},)?(\d{3},)?\d{0,3}/g
        },
            data = {};
        if (pattern['payout'].test(msg)) {
            data['type'] = 'Payout';
            data['result'] = msg.match(pattern['money'])[0];
        } else if (pattern['balance'].test(msg)) {
            data['type'] = 'Balance';
            data['result'] = msg.match(pattern['money'])[0];
        } else if (pattern['hub'].test(msg)) {
            data['type'] = 'Hub';
            data['result'] = '';
        } else if (pattern['inside'].test(msg)) {
            data['type'] = 'Inside';
            data['result'] = '';
        }
        return data;
    }

    return {
        minesaga: minesaga,
        catchEvent: catchEvent
    }
}