import axios from 'axios';

global.browser = require('webextension-polyfill');

let interval = 10;
let shouldTrack = false;

const API_BASE = 'https://tracker.hljubic.com/';
// const API_BASE = 'http://localhost/student_activity_backend/public/';

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.status === 'complete') {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].url.startsWith('https://eucenje.sum.ba')) {

                    if (tabs.length > 1) {
                        let open_tabs = '';

                        for (let j = 0; j < tabs.length; j++) {
                            open_tabs += tabs[j].url;

                            if (j < tabs.length - 1) // Nemoj nakon zadnjeg taba separator dodat
                                open_tabs += "||**||" // Da se osiguramo da je to jedinstven separator
                        }

                        chrome.storage.sync.get(["aaiUser", "oldUsername"], function (result) {
                            let username = result.aaiUser ? result.aaiUser.uid : (result.oldUsername ? "old__" + result.oldUsername : null);

                            if (shouldTrack) {
                                axios.post(API_BASE + 'store', {
                                    username: username,
                                    link: '__tabs__',
                                    events: [{type: 'multiple_tabs', value: open_tabs}]
                                });
                            }
                        });
                    }
                    break;
                }
            }
        });
    }
});

let openedExam = false;

checkExams();

setInterval(function () {
    checkExams()
}, interval * 1000);

function checkExams() {
    axios.get(API_BASE + 'exams').then(response => {
        let exams = response.data;

        if (exams.length > 0) {
            shouldTrack = true;
            chrome.storage.sync.set({'shouldTrack': true}, null);

            if (!openedExam) {
                for(let i = 0; i < exams.length; i++) {
                    chrome.tabs.create({ url: exams[i].link });
                }

                openedExam = true;
            }
        } else {
            shouldTrack = false;
            chrome.storage.sync.set({'shouldTrack': false}, null);
        }
    });

}
/*
chrome.windows.onFocusChanged.addListener(function (windowId) {
    chrome.windows.get(windowId, function (chromeWindow) {
        chrome.storage.sync.get(["aaiUser", "oldUsername"], function (result) {
            // let username = result.aaiUser ? result.aaiUser.uid : (result.oldUsername ? "old__" + result.oldUsername : null);

            /*
            axios.post(API_BASE + 'store', {
                username: username,
                link: '__focus__',
                events: [{type: 'focus', value: 'changed'}]
            });

        });
    });
});
*/