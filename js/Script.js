var langs = [
    ['العربية', ['ar-IQ', 'العراق'],
        ['ar-EG', 'مصر']
    ],
    ['English', ['en-US', 'United States'],
        ['en-GB', 'United Kingdom']
    ]
];

for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 1;
updateCountry();
select_dialect.selectedIndex = 0;
showInfo('info_start');
start_button.style.webkitAnimationPlayState = "paused";

function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

function showInfo(s) {
    if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    }
    else {
        info.style.visibility = 'hidden';
    }
}

function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
}

var recognizing = false;
var ignore_onend;
var final_transcript = '';
var start_timestamp;

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
}
else {
    start_button.style.display = 'inline-block;'
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
        showInfo('info_speak_now');
        start_button.style.webkitAnimationPlayState = "running";
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            start_button.style.webkitAnimationPlayState = "paused";
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            start_button.style.webkitAnimationPlayState = "paused";
            showInfo('info_no_microphone')
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            }
            else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };
    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        start_button.style.webkitAnimationPlayState = "paused";
        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('final_span'));
            window.getSelection().addRange(range);
        }
    };
    recognition.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            }
            else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);
    };
}

var twoLine = /\n\n/g;
var oneLine = /\n/g;

function linebreak(s) {
    return s.replace(twoLine, '<p></p>').replace(oneLine, '<br>');
}

var firstChar = /\S/;

function capitalize(s) {
    return s.replace(firstChar, function (m) {
        return m.toUpperCase();
    });
}

function startButton(event) {
    if (recognizing) {
        recognition.stop()
        start_button.style.color = 'black';
        return;
    }
    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_button.style.color = 'red';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
}
