var enableSound = false;
var debug = true;
class metaverse {

    e_click = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    a_post = {};

    translate = {};

    getLangSetting = (l_set) => {
        return new Promise((resolve) => {
            const uri = chrome.runtime.getURL('src/json/lang/' + l_set + '.json');
            fetch(uri)
                .then((response) => response.json()) //assuming file contains json
                .then((json) => {
                    this.translate = json;
                    resolve(true);
                });
        });
    }

    showNewPost = (mutation, c_this) => {

        let element = document.querySelector("a.s-btn.d-block");

        if (element != null) {

            this.playSound();
            element.dispatchEvent(this.e_click);

        }
    }

    playSound = () => {
        if (enableSound) {

            var myAudio = new Audio(chrome.runtime.getURL("src/sound/received_post.mp3"));
            myAudio.play();

        }
    }

    /**
     * play sound for test purpouse
     */

    playSoundStart = () => {
        console.log(enableSound);
        if (enableSound) {

            // var myAudio = new Audio(chrome.runtime.getURL("src/sound/start.mp3"));
            // myAudio.play();

        }
    }

    PostAnal = (l_set) => {
        return new Promise((resolve) => {

            var mined = {};
            let post = document.getElementsByClassName('s-prose js-post-body');

            let p_char = 0;
            let c_char = 0;
            let c_img = 0;

            if (typeof post[0] !== 'undefined') {

                let post_content_exp = '';

                let data = this.evaluateNodePost(post[0]);

                p_char = data.p_char;
                c_char = data.c_char;
                c_img = data.c_img;
                post_content_exp = data.exp;

                if (!post_content_exp.replace(/\s/g, '').length) {
                    post_content_exp = '';
                }

                /**
                 * Analisis content Post and User
                 */

                if(this.evalPostOwner()<30){
                    mined.newuser = this.translate.qa.newuser;
                }

                if (p_char > 40 && p_char < 130) {
                    mined.content = this.translate.qa.content1;
                } else if (p_char < 40) {
                    mined.content = this.translate.qa.content2;
                }

                if (c_char == 0) {
                    mined.post = this.translate.qa.post1;
                } else if (c_char < 50) {
                    mined.post = this.translate.qa.post2;
                }

                if ((c_char + p_char) < 130) {
                    mined.spam = this.translate.qa.spam; //"Apparently this post may be spam!";
                }

                let newStringSTR = post_content_exp.replace(/[^A-Za-z0-9]/g, '');
                newStringSTR = newStringSTR.replace(/\s/g, '');
                let char_count = newStringSTR.length;

                let newStringSC = post_content_exp.replace(/[A-Za-z0-9]/g, "");
                newStringSC = newStringSC.replaceAll(/\s/g, '');
                let spchar_count = newStringSC.length;

                console.log(data);
                console.log('p_char: ' + p_char, 'c_char: ' + c_char, 'post_content_exp: ' + post_content_exp);
                console.log('char_count: ' + char_count, 'spchar_count: ' + spchar_count);
                console.log(mined);

                let interpreter = parseInt((spchar_count * 100) / char_count);
                console.log(c_char, interpreter);

                if (c_char <= 25 && interpreter >= 9) {
                    mined.noformatcode = this.translate.qa.noformatcode; //"Apparently this post contains raw code!";
                }

                if ((c_char == 0 || p_char == 0) && c_img > 0) {
                    mined.onlyimg = this.translate.qa.onlyimg; //"Apparently this post contains raw code!";
                }

                if (post_content_exp > 0) {
                    let defined_lan = (l_set == 'es') ? 'Español' : 'English';

                    chrome.i18n.detectLanguage(post_content_exp, (result) => {

                        let lang = {};
                        lang.rel = result.isReliable;
                        lang.exp = {};

                        for (var i = 0; i < result.languages.length; i++) {
                            lang.exp[result.languages[i].language] = result.languages[i].percentage;
                        }

                        mined.a_lang = lang;

                        if (typeof lang.exp[l_set] == 'undefined') {

                            mined.notlang = this.translate.qa.notlang1;//'Apparently this post is not in the Accepted Language!; defined Laguage: ' + defined_lan;

                        } else if (lang.exp.es < 60) {

                            mined.notlang = this.translate.qa.notlang2;//'Apparently, this publication contains information in a language other than the accepted one!; defined Laguage: ' + defined_lan;

                        }

                        this.a_post = mined;

                        resolve(true);
                    });
                } else {


                    this.a_post = mined;

                    resolve(true);
                }


            }
        });

    }

    evalPostOwner = () => {
        let own = document.body.querySelector(".post-signature.owner");
        let points = 0;
        if (own !== null) {
            let owner_detail = own.querySelector(".reputation-score");
            let raw_point = owner_detail.textContent;
            raw_point = raw_point.replace(/,/g, '');
            const expo = ['k', 'm'];
            if (expo.some(v => raw_point.includes(v))) {
                if (v == 'k') {
                    points = parseInt(raw_point.replace(/\D/g, "")) * 1000;
                } else {
                    points = parseInt(raw_point.replace(/\D/g, "")) * 1000000;
                }
            } else {
                points = parseInt(raw_point.replace(/\D/g, ""));
            }
        }
        return points;
    }


    evaluateNodePost = (element) => {

        let result = { p_char: 0, c_char: 0, c_img: 0, exp: '' };
        var c_this = this;

        NodeList.prototype.forEach = Array.prototype.forEach
        var children = element.childNodes;

        children.forEach(function (item) {
            if (typeof item.tagName !== 'undefined') {
                //console.log(item.childElementCount, item.textContent.length, item, item.tagName);
                console.log(item.tagName);
                if (item.childElementCount >= 1 && item.tagName !== 'PRE' && item.tagName !== 'EM') {
                    result = c_this.countCharacters(result, item);
                    let node = c_this.evaluateNodePost(item);
                    result.p_char += node.p_char;
                    result.c_char += node.c_char;
                    result.c_img += node.c_img;
                    result.exp += ' ' + node.exp;
                } else {
                    result = c_this.countCharacters(result, item);
                }
            }
        });

        return result;

    }

    countCharacters = (result, item) => {
        let seek_code = null;
        switch (item.tagName) {
            case 'P':
                result.exp += ' ' + item.textContent;
                result.p_char += item.textContent.length;
                seek_code = item.children;
                Array.from(seek_code).forEach((subelem) => {
                    let tag = subelem.tagName;
                    if (tag == 'IMG') {
                        result.c_img++;
                    }
                });
                break;
            case 'STRONG':
                result.exp += ' ' + item.textContent;
                result.p_char += item.textContent.length;
                break;

            case 'EM':
                result.exp += ' ' + item.textContent;
                result.p_char += item.textContent.length;
                break;

            case 'PRE':
                seek_code = item.children;
                Array.from(seek_code).forEach((subelem) => {
                    let tag = subelem.tagName;
                    if (tag == 'CODE') {
                        result.c_char += subelem.textContent.length;
                    }
                });
                break;
            case 'BLOCKQUOTE':
                result.exp += ' ' + item.textContent;
                result.p_char += item.textContent.length;
                result.c_char += item.textContent.length;
                break;

            case 'IMG':
                result.c_img++;
                break;
        }
        return result;
    }





    injectElement = (mutation, c_this) => {

    }

}

window.onload = init;
async function init() {
    /**
     * to enable play sound
     */

    let uri = getC_Url();
    var mt = new metaverse();
    document.body.addEventListener("click", function () {

        enableSound = true;

        mt.playSoundStart();

    }, { once: true });


    chrome.runtime.sendMessage({ getUrlConfig: true }, (response) => {
        if (typeof response.atsu_setting.uri_conf[uri] !== 'undefined') {

            /**
             * Set config to the current windows
             */
            let config = response.atsu_setting.uri_conf[uri];

            if (config.enable) {


                var l_set = config.lang_sel.toLowerCase();
                mt.getLangSetting(l_set).then(() => {

                    mt.PostAnal(l_set);


                    /**
                     * enable High ligh link color
                     */

                    if (config.colors) {
                        enableHighLighColorLink(config.rgb_colors);
                    }

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

                    let qa_post = '';

                    /**
                     * enable lang Detection
                     */
                    if (config.lang_dt) {
                        qa_post += enableLangDetection(mt);
                    }

                    /**
                     * enable absence of MRE
                     */
                    if (config.mre) {
                        qa_post += enableMREDetection(mt);
                    }

                    /**
                     * enable absence of MRE
                     */
                    if (config.post_fc) {
                        qa_post += enableDetectFullCodePost(mt);
                    }

                    console.log(config, qa_post);

                    qa_post += postquality(mt);

                    if (qa_post != '') {
                        atsu_suggest = `<div id="sidebar" class="show-votes" role="complementary" aria-label="sidebar">
                                        <div class="s-sidebarwidget s-sidebarwidget__yellow s-anchors s-anchors__grayscale mb16" data-tracker="cb=1">
                                            <ul class="d-block p0 m0">
                                                <div class="s-sidebarwidget--header s-sidebarwidget__small-bold-text fc-light d:fc-black-900 bb bbw1">
                                                 `+ mt.translate.atsu_sugestion + `
                                                </div>
                                                ` + qa_post + `
                                            </ul>
                                        </div>
                                    </div>`;
                        let selected = document.getElementById('sidebar');
                        let template = document.createElement('template');
                        template.innerHTML = atsu_suggest;
                        selected.parentNode.replaceChild(template.content.firstChild, selected);
                    }
                });
            }
        } else {
            console.log('no hay configuracion para esta URL', response);
        }
    });



};

function getC_Url() {
    let urlRegex = /(https?:\/\/[^/]*)/;
    let url = window.location.href;
    return url.match(urlRegex)[1];
}


function enableAutoPOST() {
    console.log('Show New Posts is runing');
    let element = document.getElementById('question-mini-list');
    cronodetector(element, 'showNewPost');
}

function enableRichComments() {
    console.log('Enable Rich Comments');
    let element = document.getElementById('question-mini-list');
    cronodetector(element, 'showNewPost');
}

function enableLangDetection(mt) {
    console.log('POST Language Detection is runing');
    let notlang = '';

    if (typeof mt.a_post.notlang !== 'undefined') {
        notlang = `<li class="s-sidebarwidget--item d-flex px16">
                        <div class="flex--item1 fl-shrink0">
                            <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                                viewBox="0 0 14 14">
                                <path
                                    d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                                </path>
                            </svg>
                        </div>
                        <div class="flex--item wmn0 ow-break-word">
                            <span class="js-gps-track fc-danger" id="atsu-notlang">` + mt.a_post.notlang + `</span>
                        </div>
                    </li>`;
    }
    return notlang;
}

function enableMREDetection(mt) {
    console.log('POST MRE Detection is runing');

    let post = '';

    if (typeof mt.a_post.post !== 'undefined') {
        post = `<li class="s-sidebarwidget--item d-flex px16">
                        <div class="flex--item1 fl-shrink0">
                            <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                                viewBox="0 0 14 14">
                                <path
                                    d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                                </path>
                            </svg>
                        </div>
                        <div class="flex--item wmn0 ow-break-word">
                            <span class="js-gps-track fc-danger" id="atsu-post-mre">` + mt.a_post.post + `</span>
                        </div>
                    </li>`;
    }

    return post;
}

function enableDetectFullCodePost(mt) {
    console.log('POST Full Code Detection is runing');

    let content = '';

    console.log(mt.a_post, mt.a_post.content);

    if (typeof mt.a_post.content !== 'undefined') {
        content = `<li class="s-sidebarwidget--item d-flex px16">
                    <div class="flex--item1 fl-shrink0">
                        <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                            viewBox="0 0 14 14">
                            <path
                                d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                            </path>
                        </svg>
                    </div>
                    <div class="flex--item wmn0 ow-break-word">
                        <span class="js-gps-track fc-danger" id="atsu-post-fc">` + mt.a_post.content + `</span>
                    </div>
                </li>`;
    }

    return content;
}

function postquality(mt) {

    let noformatcode = '';

    let spam = '';

    let images = '';

    let newuser = '';

    if (typeof mt.a_post.noformatcode !== 'undefined') {
        noformatcode = `<li class="s-sidebarwidget--item d-flex px16">
                            <div class="flex--item1 fl-shrink0">
                                <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                                    viewBox="0 0 14 14">
                                    <path
                                        d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                                    </path>
                                </svg>
                            </div>
                            <div class="flex--item wmn0 ow-break-word">
                                <span class="js-gps-track fc-danger" id="atsu-noformatcode">` + mt.a_post.noformatcode + `</span>
                            </div>
                        </li>`;
    }

    if (typeof mt.a_post.spam !== 'undefined') {
        spam = `<li class="s-sidebarwidget--item d-flex px16">
                    <div class="flex--item1 fl-shrink0">
                        <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                            viewBox="0 0 14 14">
                            <path
                                d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                            </path>
                        </svg>
                    </div>
                    <div class="flex--item wmn0 ow-break-word">
                        <span class="js-gps-track fc-danger" id="atsu-spam">` + mt.a_post.spam + `</span>
                    </div>
                </li>`;
    }

    if (typeof mt.a_post.onlyimg !== 'undefined') {
        images = `<li class="s-sidebarwidget--item d-flex px16">
                    <div class="flex--item1 fl-shrink0">
                        <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                            viewBox="0 0 14 14">
                            <path
                                d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                            </path>
                        </svg>
                    </div>
                    <div class="flex--item wmn0 ow-break-word">
                        <span class="js-gps-track fc-danger" id="atsu-spam">` + mt.a_post.onlyimg + `</span>
                    </div>
                </li>`;
    }

    if (typeof mt.a_post.newuser !== 'undefined') {
        newuser = `<li class="s-sidebarwidget--item d-flex px16">
                    <div class="flex--item1 fl-shrink0">
                        <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                            viewBox="0 0 14 14">
                            <path
                                d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                            </path>
                        </svg>
                    </div>
                    <div class="flex--item wmn0 ow-break-word">
                        <span class="js-gps-track fc-danger" id="atsu-spam">` + mt.a_post.newuser + `</span>
                    </div>
                </li>`;
    }

    return noformatcode + spam + images + newuser;
}

function enableHighLighColorLink(rgb_colors) {
    console.log('enableHighLighColorLink', rgb_colors);
    setColorLink([rgb_colors.normal, rgb_colors.visited, rgb_colors.closed]);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

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
        const special_post = ['[cerrada]', '[closed]', '[duplicada]', 'duplicated'];
        let title = link.innerHTML;
        if (special_post.some(v => title.includes(v))) {
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
        const special_post = ['[cerrada]', '[closed]', '[duplicada]', 'duplicated'];
        let title = link.innerHTML;
        if (special_post.some(v => title.includes(v))) {
            link.style.color = null;
        }
    });
}

function cronodetector(element, functionName) {

    let mt = new metaverse();
    // Select the node that will be observed for mutations
    const targetNode = element; //document.getElementById('add-comment-' + post_id);
    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false };
    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
            mt[functionName](mutation, this);
            //injectElement(mutation, this);
        }
    };
    // Create an observer instance linked to the callback function
    // Start observing the target node for configured mutations
    if (targetNode instanceof HTMLElement) {
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

}
