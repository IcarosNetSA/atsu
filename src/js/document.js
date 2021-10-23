document.addEventListener("DOMContentLoaded", function () {
    function setColorLink(color_normal,color_visited,color_closed){
        var style = document.createElement('style');
        style.innerHTML = `
                            a.question-hyperlink,
                            a.answer-hyperlink {
                                font-family: Calibri;
                                font-weight: 100;
                                font-style: italic;
                            }
                            
                            a.question-hyperlink,
                            a.answer-hyperlink {
                                color: `+color_normal+`;
                            }
                            
                            a.question-hyperlink:visited,
                            a.answer-hyperlink:visited  {
                                color: `+color_visited+` !important;
                            }
                            `;
        document.head.appendChild(style);
        var links_questions = document.getElementsByClassName("question-hyperlink");
        var values = [].map.call(links_questions, function(element) {
                let herf = element.href;
                let title = element.innerHTML
                console.log(title);
                if(title.indexOf('[cerrada]') !== -1){
                    element.style.color = color_closed;
                }
            });
    }
});