chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.hasOwnProperty('setcolors')) {
        console.log('%c ATSU is coloring the links of this URL.', 'color: #f6b26b');
        setColorLink(msg.setcolors);
    }
});

function setColorLink(setColors) {

    var style = document.createElement('style');
    style.setAttribute('id', 'atsu-style');

    style.innerHTML = `
                        a.question-hyperlink,
                        a.answer-hyperlink {
                            font-family: Calibri;
                            font-weight: 100;
                            font-style: italic;
                        }
                        
                        a.question-hyperlink,
                        a.answer-hyperlink {
                            color: `+ setColors[0] + `;
                        }
                        
                        a.question-hyperlink:visited,
                        a.answer-hyperlink:visited  {
                            color: `+ setColors[1] + ` !important;
                        }
                        `;

    var elementExists = document.getElementById("atsu-style");

    if (elementExists) {
        elementExists.innerHTML = style.innerHTML;
    } else {
        document.head.appendChild(style);
    }

    var links_questions = document.getElementsByClassName("question-hyperlink");
    var values = [].map.call(links_questions, function (element) {
        let herf = element.href;
        let title = element.innerHTML
        console.log(title);
        if (title.indexOf('[cerrada]') !== -1) {
            element.style.color = setColors[2];
        }
    });

}
