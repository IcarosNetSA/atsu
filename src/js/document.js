
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

    var links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

    links_questions.forEach(link => {
        let title = link.innerHTML
        if (title.indexOf('[cerrada]') !== -1) {
            link.style.color = setColors[2];
        }
    });
}

function isNumeric(str) {
    if (typeof str != "string") { return false; }
    return !isNaN(str) && !isNaN(parseFloat(str));
}

var post_url_data = window.location.href.split('/');
var post_id = post_url_data[4];

if (typeof post_id !== 'undefined') {
    if (isNumeric(post_id)) {
        var post_tittle = post_url_data[5].replaceAll('-', ' ');
        console.log('ATSU is Working in POST: ' + post_id + ' ' + post_tittle);


        // Select the node that will be observed for mutations
        const targetNode = document.getElementById('add-comment-' + post_id);

        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };
        console.log(targetNode, config);

        // Callback function to execute when mutations are observed
        const callback = function (mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            for (const mutation of mutationsList) {
                if ('s-btn s-btn__primary' == mutation.target.className) {
                    console.log(mutation.target.className);
                    let list = document.getElementsByClassName('js-comment-help-link s-btn s-btn__link ta-left px2');
                    console.log(list, list[0], mutation);

                    let atsu_btn = `
                                    <button 
                                    type="button" 
                                    class="s-btn js-modal-open" 
                                    id="atsu-post-comment"
                                    data-togle="s-modal"
                                    data-target="#atsu-modal"
                                    style="margin-top:5px; border: 3px solid rgb(246, 178, 107); color: rgb(194, 123, 160); font-style: italic;">
                                    Auto Com. &amp; Help
                                    </button>
                    
                    
                                    <div data-controller="s-modal" data-s-modal-return-element="#atsu-post-comment">
                                        <aside class="s-modal" id="atsu-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description" aria-hidden="true" data-controller="s-modal" data-s-modal-target="modal" data-s-modal-return-element=".js-modal-open[data-target='#atsu-modal']" data-s-modal-remove-when-hidden="false">
                                            <div class="s-modal--dialog" role="document">
                                                <h1 class="s-modal--header" id="modal-title">Example title</h1>
                                                <p class="s-modal--body" id="modal-description">Nullam ornare lectus vitae lacus sagittis, at sodales leo viverra. Suspendisse nec nulla dignissim elit varius tempus. Cras viverra neque at imperdiet vehicula. Curabitur condimentum id dolor vitae ultrices. Pellentesque scelerisque nunc sit amet leo fringilla bibendum. Etiam feugiat imperdiet mi, eu blandit arcu cursus a. Pellentesque cursus massa id dolor ullamcorper, at condimentum nunc ultrices.</p>
                                                <div class="d-flex gs8 gsx s-modal--footer">
                                                    <button class="flex--item s-btn s-btn__primary" type="button">Save changes</button>
                                                    <button class="flex--item s-btn" type="button" data-action="s-modal#hide">Cancel</button>
                                                </div>
                                                <button class="s-modal--close s-btn s-btn__muted js-modal-close" type="button" aria-label="Close" data-action="s-modal#hide">
                                                    <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg>
                                                </button>
                                            </div>
                                        </aside>
                                        <aside class="s-modal" id="atsu-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description" aria-hidden="true" data-controller="s-modal" data-s-modal-target="modal" data-s-modal-return-element=".js-modal-open[data-target='#atsu-modal']" data-s-modal-remove-when-hidden="false">
                                            <div class="s-modal--dialog" role="document">
                                                <h1 class="s-modal--header" id="modal-title">Example title</h1>
                                                <p class="s-modal--body" id="modal-description">Nullam ornare lectus vitae lacus sagittis, at sodales leo viverra. Suspendisse nec nulla dignissim elit varius tempus. Cras viverra neque at imperdiet vehicula. Curabitur condimentum id dolor vitae ultrices. Pellentesque scelerisque nunc sit amet leo fringilla bibendum. Etiam feugiat imperdiet mi, eu blandit arcu cursus a. Pellentesque cursus massa id dolor ullamcorper, at condimentum nunc ultrices.</p>
                                                <div class="d-flex gs8 gsx s-modal--footer">
                                                    <button class="flex--item s-btn s-btn__primary" type="button">Save changes</button>
                                                    <button class="flex--item s-btn" type="button" data-action="s-modal#hide">Cancel</button>
                                                </div>
                                                <button class="s-modal--close s-btn s-btn__muted js-modal-close" type="button" aria-label="Close" data-action="s-modal#hide">
                                                    <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg>
                                                </button>
                                            </div>
                                        </aside>
                                        </div>
                                    `;


                    mutation.target.insertAdjacentHTML('afterend', atsu_btn);

                    let help = document.getElementsByClassName('js-comment-help-link');
                    help[0].style.display = "none";
                    help[0].style.visibility = "hidden";
                    let comment_input = document.getElementsByClassName('s-textarea js-comment-text-input');
                    comment_input[0].rows = "5";

                    document.querySelector("#atsu-post-comment").addEventListener("click", function (e) {
                        Stacks.showModal(document.querySelector("#atsu-modal"));
                    });


                    //obtenemos el POST

                    /*
                    let post = document.getElementsByClassName('s-prose js-post-body');
                    var p_char = 0;
                    var c_char = 0;
                    let post_content = post[0].children;
                    Array.from(post_content).forEach((elem) => {
                        let tag = elem.tagName;
                        switch (tag) {
                            case 'P':
                                p_char += elem.textContent.length;
                                break;
                            case 'PRE':
                                let seek_code = elem.children;
                                Array.from(seek_code).forEach((subelem) => {
                                    let tag = subelem.tagName;
                                    if (tag == 'CODE') {
                                        c_char += subelem.textContent.length;
                                    }
                                });
                                break;
                        }
                    });



                    //Analisis POST:

                    if (p_char <= 25) {
                        //parece que le falta una mejor explicacion.
                    }
                    if (c_char <= 25) {
                        //parece que le falta una mejor Codigo.
                    }
                    if ((c_char + p_char) <= 100) {
                        //parece que span.
                    }

                    /*
                    .each(elem=>{
                        console.log(elem);
                    });
                    */



                    //new-contributor-indicator


                    this.disconnect();
                }
            }
        };

        // Create an observer instance linked to the callback function


        // Start observing the target node for configured mutations

        if (targetNode instanceof HTMLElement) {
            const observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
        }


        // Later, you can stop observing
        //observer.disconnect();


        /*
        
        let comments_link = document.getElementsByClassName("js-add-link");
        comments_link[0].addEventListener('click', event => {

        });
        */


    }
}






