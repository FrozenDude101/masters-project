const FUNCTION_SELECTOR = document.getElementById("function-selector");
const NO_SELECTION      = "Select a function.";

const SCROLLABLE_CONTAINER = document.getElementById("scrollable-container")
const ERROR_CONTAINER = document.getElementById("error-container");

SCROLLABLE_CONTAINER.style.maxWidth = SCROLLABLE_CONTAINER.clientWidth + "px";
ERROR_CONTAINER.style.width = ERROR_CONTAINER.clientWidth + "px";

const RETURN_TYPE  = document.getElementById("return-type");
const RETURN_VALUE = document.getElementById("return-value");

let state = null;

FUNCTION_SELECTOR.addEventListener("change", () => {
    if (FUNCTION_SELECTOR.value === NO_SELECTION) {
        updateRequiredArgumentCount(-1);
        return;
    }

    let fT = Program.get(FUNCTION_SELECTOR.value);
    let p = fT.patterns[0];
    updateRequiredArgumentCount(p.length());
});

function addError(e) {
    let element = document.createElement("div");
    element.classList.add("error-message");
    element.innerHTML = e;

    ERROR_CONTAINER.appendChild(element);
}
function clearErrors() {
    ERROR_CONTAINER.innerHTML = "";
}
function hasErrors() {
    return ERROR_CONTAINER.children.length !== 0;
}

function displayState() {
    cytoscapeContainer.innerHTML = ""+state;
}
function displayResult() {
    RETURN_VALUE.value = state;
    RETURN_TYPE.value = state.type;
}