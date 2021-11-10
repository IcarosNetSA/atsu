var enableSound = false;

class Metaverse {

    c_e_click = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    translate = {};

    c_uri = null;

    post_id = null;

    getC_Url = () => {
        let urlRegex = /(https?:\/\/[^/]*)/;
        let url = window.location.href;
        return url.match(urlRegex)[1];
    }

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

    setColorLink = (setColors) => {

        let style = document.createElement('style');
        style.setAttribute('id', 'atsu-style');

        style.innerHTML = `
                            a.question-hyperlink,
                            a.answer-hyperlink {
                                font-family: Calibri;
                                font-weight: 400;
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

        let elementExists = document.getElementById("atsu-style");

        if (elementExists) {
            elementExists.innerHTML = style.innerHTML;
        } else {
            document.head.appendChild(style);
        }

        let links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

        links_questions.forEach(link => {
            const special_post = ['[cerrada]', '[closed]', '[duplicada]', 'duplicated'];
            let title = link.innerHTML;
            if (special_post.some(v => title.includes(v))) {
                link.style.color = setColors[2];
            }
        });
    }

    removeColorsLink = () => {

        let elementExists = document.getElementById("atsu-style");

        if (elementExists) {
            elementExists.remove();
        }

        let links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

        links_questions.forEach(link => {
            const special_post = ['[cerrada]', '[closed]', '[duplicada]', 'duplicated'];
            let title = link.innerHTML;
            if (special_post.some(v => title.includes(v))) {
                link.style.color = null;
            }
        });
    }

    enableHighLighColorLink = (rgb_colors) => {

        this.setColorLink([rgb_colors.normal, rgb_colors.visited, rgb_colors.closed]);
    }

    cronodetector = (element, functionName) => {

        console.log('Inicializando cronodetector', element, functionName);

        let c_this = this;

        const targetNode = element;

        const config = { attributes: false, childList: true, subtree: false };

        const callback = function (mutationsList, observer) {

            for (const mutation of mutationsList) {
                c_this[functionName](mutation, this);
            }

        };

        if (targetNode instanceof HTMLElement) {
            const observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
        }

    }

    playSound = (sound) => {

        if (enableSound) {

            var myAudio = new Audio(sound);
            myAudio.play();

        }

    }

    showNewPost = (mutation, c_this) => {

        let element = document.querySelector("a.s-btn.d-block");

        if (element != null) {

            this.playSound(chrome.runtime.getURL("src/sound/received_post.mp3"));
            element.dispatchEvent(this.c_e_click);

        }

    }

    enableAutoPOST = () => {
        console.log('Show New Posts is runing');
        let element = document.getElementById('question-mini-list');
        this.cronodetector(element, 'showNewPost');
    }

    PostAnal = (lang_set) => {

        return new Promise((resolve) => {

            let post = document.getElementsByClassName('s-prose js-post-body');

            if (typeof post[0] !== 'undefined') {

                let eval_node = null;

                eval_node = this.evaluateNodePost(post[0]);

                eval_node.lang = lang_set;

                if (!eval_node.exp.replace(/\s/g, '').length) {
                    eval_node.exp = '';
                }

                eval_node.points = this.evalPostOwner();

                this.PostBuildSuggestion(eval_node).then(() => {

                    resolve(true);

                });
            }
        });
    }

    evaluateNodePost = (element) => {

        let result = { p_char: 0, c_char: 0, c_img: 0, exp: '' };
        let c_this = this;

        NodeList.prototype.forEach = Array.prototype.forEach
        let children = element.childNodes;

        children.forEach(function (item) {
            if (typeof item.tagName !== 'undefined') {
                if (item.childElementCount >= 1 && item.tagName !== 'PRE' && item.tagName !== 'EM' && item.tagName !== 'ASIDE') {
                    result = c_this.countCharacters(result, item);
                    let node = c_this.evaluateNodePost(item);
                    result.p_char += node.p_char;
                    result.c_char += node.c_char;
                    result.c_img += node.c_img;
                    result.exp += ' ' + node.exp;
                } else {
                    if (item.tagName !== 'ASIDE') {
                        result = c_this.countCharacters(result, item);
                    }
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

    evalPostOwner = () => {

        let own = document.body.querySelector(".post-signature.owner");
        let points = 0;

        if (own !== null) {

            let owner_detail = own.querySelector(".reputation-score");
            let raw_point = owner_detail.textContent;
            raw_point = raw_point.replace(/,/g, '');
            let letter = raw_point.replace(/\d+/g, '');
            letter = letter.replace(/\./g, '');

            const expo = ['k', 'm'];

            if (expo.some(v => raw_point.includes(v))) {

                if (letter == 'k') {
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

    PostBuildSuggestion = (eval_node,) => {
        return new Promise((resolve) => {

            let mined = {};

            if (eval_node.points < 30) {
                mined.newuser = this.translate.qa.newuser;
            }

            if (eval_node.p_char > 40 && eval_node.p_char < 130) {
                mined.content = this.translate.qa.content1;
            } else if (eval_node.p_char < 40) {
                mined.content = this.translate.qa.content2;
            }

            if (eval_node.c_char == 0) {
                mined.post = this.translate.qa.post1;
            } else if (eval_node.c_char < 50) {
                mined.post = this.translate.qa.post2;
            }

            if ((eval_node.c_char + eval_node.p_char) < 200 && eval_node.points < 5) {
                mined.spam = this.translate.qa.spam;
            }

            let newStringSTR = eval_node.exp.replace(/[^A-Za-z0-9]/g, '');
            newStringSTR = newStringSTR.replace(/\s/g, '');
            let char_count = newStringSTR.length;


            let newStringSC = eval_node.exp.replace(/[A-Za-z0-9]/g, "");
            newStringSC = newStringSC.replaceAll(/\s/g, '');
            let spchar_count = newStringSC.length;

            let interpreter = parseInt((spchar_count * 100) / char_count);

            if (!Number.isNaN(interpreter)) {
                if (eval_node.c_char <= 25 && interpreter >= 9) {
                    mined.noformatcode = this.translate.qa.noformatcode;
                }
            }

            if ((eval_node.c_char == 0 || eval_node.p_char == 0) && eval_node.c_img > 0) {
                mined.onlyimg = this.translate.qa.onlyimg;
            }

            if (eval_node.exp != '') {

                chrome.i18n.detectLanguage(eval_node.exp, (result) => {

                    let lang = {};
                    lang.rel = result.isReliable;
                    lang.exp = {};

                    for (var i = 0; i < result.languages.length; i++) {
                        lang.exp[result.languages[i].language] = result.languages[i].percentage;
                    }

                    mined.a_lang = lang;

                    if (typeof lang.exp[eval_node.lang] == 'undefined') {

                        mined.notlang = this.translate.qa.notlang1;

                    } else if (lang.exp[eval_node.lang] < 60) {

                        mined.notlang = this.translate.qa.notlang2;

                    }

                    this.a_post = mined;

                    resolve(true);
                });

            } else {

                this.a_post = mined;

                resolve(true);
            }
        });
    }

    HtmlLangDetection = () => {

        console.log('POST Language Detection is runing');

        let notlang = '';

        if (typeof this.a_post.notlang !== 'undefined') {

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
                                <span class="js-gps-track fc-warning" id="atsu-notlang">` + this.a_post.notlang + `</span>
                            </div>
                        </li>`;

        }

        return notlang;

    }

    HtmlMREDetection = () => {

        console.log('POST MRE Detection is runing');

        let post = '';

        if (typeof this.a_post.post !== 'undefined') {

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
                                <span class="js-gps-track fc-warning" id="atsu-post-mre">` + this.a_post.post + `</span>
                            </div>
                        </li>`;

        }

        return post;
    }

    HtmlDetectFullCodePost = () => {

        console.log('POST Full Code Detection is runing');

        let content = '';

        if (typeof this.a_post.content !== 'undefined') {
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
                            <span class="js-gps-track fc-warning" id="atsu-post-fc">` + this.a_post.content + `</span>
                        </div>
                    </li>`;
        }

        return content;

    }

    HtmlPostQuality = () => {

        let noformatcode = '';

        let spam = '';

        let images = '';

        let newuser = '';

        if (typeof this.a_post.noformatcode !== 'undefined') {

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
                                    <span class="js-gps-track fc-warning" id="atsu-noformatcode">` + this.a_post.noformatcode + `</span>
                                </div>
                            </li>`;

        }

        if (typeof this.a_post.spam !== 'undefined') {

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
                            <span class="js-gps-track fc-danger" style="font-weight: bold;" >` + this.a_post.spam + `</span>
                        </div>
                    </li>`;

        }

        if (typeof this.a_post.onlyimg !== 'undefined') {

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
                            <span class="js-gps-track fc-warning" >` + this.a_post.onlyimg + `</span>
                        </div>
                    </li>`;

        }

        if (typeof this.a_post.newuser !== 'undefined') {

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
                            <span class="js-gps-track fc-warning" >` + this.a_post.newuser + `</span>
                        </div>
                    </li>`;

        }

        return noformatcode + spam + images + newuser;

    }

    InjectSuggestionHtml = (config) => {

        let qa_post = '';

        if (config.lang_dt) {

            qa_post += this.HtmlLangDetection();

        }

        if (config.mre) {

            qa_post += this.HtmlMREDetection();

        }

        if (config.post_fc) {

            qa_post += this.HtmlDetectFullCodePost();

        }

        qa_post += this.HtmlPostQuality();

        if (qa_post != '') {

            let atsu_suggest = `<div id="sidebar" class="show-votes" role="complementary" aria-label="sidebar">
                                        <div class="s-sidebarwidget s-sidebarwidget__yellow s-anchors s-anchors__grayscale mb16" data-tracker="cb=1">
                                            <ul class="d-block p0 m0">
                                                <div class="s-sidebarwidget--header s-sidebarwidget__small-bold-text fc-light d:fc-black-900 bb bbw1">
                                                 `+ this.translate.atsu_sugestion + `
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

    }

    isNumeric = (str) => {

        if (typeof str != "string") { return false; }
        return !isNaN(str) && !isNaN(parseFloat(str));

    }

    enableRichComments = () => {

        console.log('Enable Rich Comments is Runing');

        let post_url_data = window.location.href.split('/');
        let post_id = post_url_data[4];

        if (typeof post_id !== 'undefined') {

            this.post_id = post_id;

            if (this.isNumeric(post_id)) {

                var post_tittle = '';

                if (typeof post_url_data[5] !== 'undefined') {
                    post_tittle = post_url_data[5].replaceAll('-', ' ');
                }

                console.log('ATSU is Working in POST: ' + post_id + ' ' + post_tittle);

                let element = document.getElementById('add-comment-' + post_id);

                this.cronodetector(element, 'startCommentEngine');

            }
        }
    }

    startCommentEngine = (mutation, c_this) => {

        this.addPostCommentButtons(mutation, c_this).then(() => {

            this.addEventListenerToCommentEngine();

        });

    }

    addPostCommentButtons = (mutation, c_this) => {

        return new Promise(async (resolve) => {

            const uri = chrome.runtime.getURL('src/html/modal_comment.html');
            let modal_html;
            await fetch(uri)
                .then((response) => {

                    return response.text();

                })
                .then((html) => {

                    var parser = new DOMParser();
                    modal_html = parser.parseFromString(html, "text/html");

                });

            modal_html = await this.injectComments(modal_html);

            let atsu_btn = modal_html.body.innerHTML;

            mutation.target.querySelector(".s-btn.s-btn__primary").insertAdjacentHTML('afterend', atsu_btn);

            let help = document.getElementsByClassName('js-comment-help-link');
            help[0].style.display = "none";
            help[0].style.visibility = "hidden";

            let comment_input = document.getElementsByClassName('s-textarea js-comment-text-input');

            comment_input[0].rows = "5";

            c_this.disconnect();

            resolve(true);
        });
    }

    injectComments = async (modal_html) => {

        let comments = this.buildComments();
        let com = Object.entries(comments);

        com.forEach((entry) => {

            const [key, value] = entry;

            let tempRow = document.createElement('tr');
            let row = `<td>` + value + `</td>`;

            if (key == 0 || ket == 1) {
                row += `<td></td><td></td>`;
            } else {
                row += `<td>Edit</td><td>Remove</td>`;
            }

            tempRow.innerHTML = row;

            modal_html.getElementById("atsu-comment-content-question").appendChild(tempRow);

        });

        return modal_html;

    }

    buildComments = () => {

        let comments = {};

        if (typeof this.a_post !== 'undefined') {

            comments[0] = this.translate.comment[0] + ',';

            if (typeof this.a_post.newuser !== 'undefined') {

                let text = this.translate.comment[1].replace("{site}", '<a href="' + this.c_uri + '">Sitio</a>');
                comments[0] += text + ',';

            }

            comments[0] += this.translate.comment[2] + ',';

            if (typeof this.a_post.content !== 'undefined') {

                comments[0] += this.translate.comment[3] + ',';

            }

            comments[0] += this.translate.comment[4] + ',';

            if (typeof this.a_post.post !== 'undefined') {

                comments[0] += this.translate.comment[5] + ',';

            }

            if (typeof this.a_post.noformatcode !== 'undefined') {

                comments[0] += this.translate.comment[6] + ',';

            }

            comments[0] += this.translate.comment[7] + ',';

            if (typeof this.a_post.onlyimg !== 'undefined') {

                comments[0] += this.translate.comment[8] + ',';

            }

            comments[0] += this.translate.comment[9] + '.';

            if (typeof this.a_post.notlang !== 'undefined') {

                comments[1] = this.translate.comment[99];

            }

        }

        // Obtener Comentarios almacenados

        console.log(this.a_post, comments);

        return comments;
    }

    addEventListenerToCommentEngine = () => {

        let comment_list = document.querySelectorAll('#atsu-comment-content-question > tr > td');
        comment_list.forEach(comment_row => {
            comment_row.addEventListener('click', (e) => {

                let comment_box = document.querySelector('#add-comment-' + this.post_id + ' > div > div.w75.fl-grow1 > div > textarea');
                comment_box.value = e.target.textContent;

                let cancel = document.getElementById('atsu-modal-comment-cancel');

                if (cancel != null) {

                    cancel.dispatchEvent(this.c_e_click);

                }

                comment_box.focus();
                comment_box.setSelectionRange(comment_box.value.length, comment_box.value.length);
            });
        });
    }
}

var mt = new Metaverse();

window.onload = init;

async function init() {

    let uri = mt.getC_Url();

    mt.c_uri = uri;

    document.body.addEventListener("click", function () {

        enableSound = true;

    }, { once: true });

    chrome.runtime.sendMessage({ getUrlConfig: true }, (response) => {

        if (typeof response.atsu_setting.uri_conf[uri] !== 'undefined') {

            let config = response.atsu_setting.uri_conf[uri];

            if (config.enable) {

                if (config.colors) {
                    mt.enableHighLighColorLink(config.rgb_colors);
                }

                if (config.new_post) {
                    mt.enableAutoPOST();
                }

                if (config.comment) {
                    mt.enableRichComments();
                }

                let lang_set = config.lang_sel.toLowerCase();

                mt.getLangSetting(lang_set).then(() => {

                    mt.PostAnal(lang_set).then(() => {

                        mt.InjectSuggestionHtml(config);

                    });
                });
            }
        } else {
            console.log('no hay configuracion para esta URL', response);
        }
    });
};

//==================================================================================================//

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    if (msg.hasOwnProperty('setcolors')) {
        console.log('%c ATSU is coloring the links of this URL.', 'color: #f6b26b');
        mt.setColorLink(msg.setcolors);
    }

    if (msg.hasOwnProperty('removecolors')) {
        console.log('%c ATSU is removing the colors of the links of this URL.', 'color: #f6b26b');
        mt.removeColorsLink();
    }

    if (msg.hasOwnProperty('reload')) {
        console.log('%c ATSU Refreshing the website.', 'color: #f6b26b');
        window.location.reload();
    }

    return false;

});
