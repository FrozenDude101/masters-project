const BACKDROP    = document.getElementById("backdrop");
const HIGHLIGHTS  = document.getElementById("highlights");

HIGHLIGHTS.style.width = CODE_INPUT.clientWidth + "px";
HIGHLIGHTS.style.height = (CODE_INPUT.clientHeight-1) + "px";

CODE_INPUT.addEventListener("scroll", () => {
    let scrollTop = CODE_INPUT.scrollTop;
    HIGHLIGHTS.scrollTop = scrollTop;

    // Fixes mis-aligned highlights when fully scrolled.
    if (Math.abs(CODE_INPUT.scrollHeight - CODE_INPUT.scrollTop - CODE_INPUT.clientHeight) < 1) {
        HIGHLIGHTS.style.marginTop = "0px";
    } else {
        HIGHLIGHTS.style.marginTop = "";
    }
});
CODE_INPUT.addEventListener("input", () => {
    let text = CODE_INPUT.value;
    let highlightedText = applyHighlights(text);
    HIGHLIGHTS.innerHTML = highlightedText;
});

function applyHighlights(text) {
    return text;
}