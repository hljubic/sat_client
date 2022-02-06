import axios from "axios";

let username;
let interval = 3;
let link = window.document.location.href;

let trackingEvents = false;

const API_BASE = 'https://tracker.hljubic.com/';
// const API_BASE = 'http://localhost/student_activity_backend/public/';

chrome.storage.sync.get(["aaiUser", "oldUsername"], function (result) {
    username = result.aaiUser ? result.aaiUser.uid : (result.oldUsername ? "old__" + result.oldUsername : null);
});

let element = document.getElementsByTagName("body")[0];

let basic_events = [];
let mouse_moves = [];
let keyboard_events = [];

shouldTrack();

function trackEvents() {
    if (trackingEvents)
        return;

    trackingEvents = true;

    element.addEventListener("mouseup", function (e) {
        let marked_text = '';

        if (window.getSelection) {
            marked_text = window.getSelection().toString();
        } else if (document.selection) {
            marked_text = document.selection.createRange().text;
        }

        if (marked_text.trim() !== "")
            basic_events.push({type: 'marked_text', value: marked_text});
    });

    element.addEventListener("cut", function (e) {
        basic_events.push({type: 'manipulation', value: 'cut'})
    });

    element.addEventListener("copy", function (e) {
        basic_events.push({type: 'manipulation', value: 'copy'})
    });

    element.addEventListener("paste", function (e) {
        basic_events.push({type: 'manipulation', value: 'paste'})
    });

    element.addEventListener("mousemove", function (e) {
        mouse_moves.push(e.screenX + "," + e.screenY + "|" + e.clientX + "," + e.clientY);
    });

    element.addEventListener("click", function (e) {
        basic_events.push({type: 'mouse_click', value: 'left'})
    });

    element.addEventListener("contextmenu", function (e) {
        basic_events.push({type: 'mouse_click', value: 'right'})
    });

    element.addEventListener("dblclick", function (e) {
        basic_events.push({type: 'mouse_click', value: 'double'})
    });

    element.addEventListener("wheel", function (e) {
        basic_events.push({type: 'mouse_scroll', value: e.deltaX + "," + e.deltaY})
    });

    element.addEventListener("keyup", function (e) {
        keyboard_events.push(e.key + "|" + e.ctrlKey + "," + e.metaKey);
    });

    setInterval(function () {
        if (basic_events.length === 0 && mouse_moves.length === 0 && keyboard_events.length === 0) {
            storeEvent('unactivity', interval);
        } else {
            storeEvent('activity', interval);
        }

        if (basic_events.length > 0) storeEvents(basic_events);
        if (mouse_moves.length > 0) storeEvent('mouse_move', mouse_moves);
        if (keyboard_events.length > 0) storeEvent('keyboard_event', keyboard_events);

        storeEvent('inner_size', window.innerWidth + "," + window.innerHeight);

        basic_events = [];
        mouse_moves = [];
        keyboard_events = [];
    }, interval * 1000);
}

function storeEvent(type, value) {
    storeEvents([{type: type, value: value}])
}

function storeEvents(events) {
    if (!alreadyTracking) {
        return;
    }

    if (events === null || events.value === null || events.value === "")
        return;

    axios.post(API_BASE + 'store', {
        username: username,
        link: link,
        events: events
    });
}

let alreadyTracking = false;

setInterval(function () {
    shouldTrack();
}, interval * 1000);

function shouldTrack() {
    chrome.storage.sync.get(["shouldTrack"], function (result) {
        if (!alreadyTracking && result.shouldTrack) {
            trackEvents();
            addNotifyTrack();

            alreadyTracking = true;
        }

        if (alreadyTracking && !result.shouldTrack) {
            removeNotifyTrack();

            alreadyTracking = false;

            /*
            element.removeEventListener("mouseup", null);
            element.removeEventListener("cut", null);
            element.removeEventListener("copy", null);
            element.removeEventListener("paste", null);
            element.removeEventListener("mousemove", null);
            element.removeEventListener("click", null);
            element.removeEventListener("contextmenu", null);
            element.removeEventListener("dblclick", null);
            element.removeEventListener("wheel", null);
            element.removeEventListener("keyup", null);
             */
        }
    });
}

function addNotifyTrack() {
    let track = document.createElement("P");
    track.id = 'alert_track_tracking';
    track.style.position = 'fixed';
    track.style.width = '100%';
    track.style.background = '#069';
    track.style.color = 'white';
    track.style.padding = '10px';
    track.style.textAlign = 'center';
    track.style.zIndex = '1';
    track.style.margin = '0';
    track.style.bottom = '0';
    track.style.fontFamily = '"Open Sans",Arial,"Lucida Grande",sans-serif';
    track.innerHTML = "Ako vidite ovu plavu traku to znači da se vaše aktivnosti spremaju! Preporučamo da restartirate Chrome nakon testa.";

    element.insertBefore(track, element.firstChild);
}

function removeNotifyTrack() {
    document.getElementById("alert_track_tracking").outerHTML = '';
}