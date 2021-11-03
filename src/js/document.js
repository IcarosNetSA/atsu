window.onload = init;
async function init() {
    let uri = getC_Url();
    chrome.runtime.sendMessage({ getUrlConfig: true }, (response) => {
        if (typeof response.atsu_setting.uri_conf[uri] !== 'undefined') {

            /**
             * Set config to the current windows
             */
            let config = response.atsu_setting.uri_conf[uri];

            if (config.enable) {

                /**
                 * enable Auto Post View
                 */
                if (config.new_post) {
                    enableAutoPOST();
                }

                /**
                 * enable Rich Comment in PostWebPage
                 */
                if (config.comment) {
                    enableRichComments();
                }

                /**
                 * enable lang Detection
                 */
                if (config.lang_dt) {
                    enableLangDetection(config.lang_sel);
                }

                /**
                 * enable absence of MRE
                 */
                if (config.mre) {
                    enableMREDetection();
                }

                /**
                 * enable absence of MRE
                 */
                if (config.post_fc) {
                    enableDetectFullCodePost();
                }

                /**
                 * enable High ligh link color
                 */
                if (config.colors) {
                    enableHighLighColorLink(config.rgb_colors);
                }

            }

        } else {
            console.log('no hay configuracion para esta URL', response);
        }
    })
};

function getC_Url() {
    let urlRegex = /(https?:\/\/[^/]*)/;
    let url = window.location.href;
    return url.match(urlRegex)[1];
}


function enableAutoPOST() {
    console.log('enableAutoPOST');
}

function enableRichComments() {
    console.log('enableRichComments');
}

function enableLangDetection(lang) {
    console.log('enableLangDetection', lang);
}

function enableMREDetection() {
    console.log('enableMREDetection');
}

function enableDetectFullCodePost() {
    console.log('enableDetectFullCodePost');
}

function enableHighLighColorLink(rgb_colors) {
    console.log('enableHighLighColorLink', rgb_colors);
    setColorLink([rgb_colors.normal, rgb_colors.visited, rgb_colors.closed]);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg)
    if (msg.hasOwnProperty('setcolors')) {
        console.log('%c ATSU is coloring the links of this URL.', 'color: #f6b26b');
        window.setColorLink(msg.setcolors);
    }
    if (msg.hasOwnProperty('removecolors')) {
        console.log('%c ATSU is removing the colors of the links of this URL.', 'color: #f6b26b');
        window.removeColorsLink();
    }
    if (msg.hasOwnProperty('reload')) {
        console.log('%c ATSU Refreshing the website.', 'color: #f6b26b');
        window.location.reload();
    }
    return false;
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

    var links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

    links_questions.forEach(link => {
        let title = link.innerHTML
        if (title.indexOf('[cerrada]') !== -1) {
            link.style.color = setColors[2];
        }
    });
}

function removeColorsLink() {

    var elementExists = document.getElementById("atsu-style");

    if (elementExists) {
        elementExists.remove();
    }

    var links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

    links_questions.forEach(link => {
        let title = link.innerHTML
        if (title.indexOf('[cerrada]') !== -1) {
            link.style.color = null;
        }
    });
}
