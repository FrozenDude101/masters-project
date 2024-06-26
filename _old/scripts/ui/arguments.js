const ARGUMENT_TEMPLATE = 
`
<select class="argument-type" id="argument-type-{n}">
    <option>None</option>
    <option>Integer</option>
    <option>Float</option>
    <option>String</option>
    <option>Function</option>
</select>
<input class="argument-input" id="argument-value-{n}">
`;
const ARGUMENT_CONTAINER      = document.getElementById("argument-container");
const ARGUMENT_TITLE          = document.getElementById("argument-title");
const ARGUMENT_COUNT          = document.getElementById("argument-count");
const REQUIRED_ARGUMENT_COUNT = document.getElementById("required-argument-count");
const REMOVE_ARGUMENT         = document.getElementById("remove-argument");

const NOT_ENOUGH_ARGUMENTS_COLOUR = "#FFF";
const TOO_MANY_ARGUMENTS_COLOUR   = "#F00";
const CORRECT_ARGUMENTS_COLOUR    = "#2D0";

let argumentCount = 0;
let requiredArgumentCount = -1;

function addArgument() {
    updateArgumentCount(argumentCount+1);

    let div = document.createElement("div");
    div.classList.add("argument");
    div.id = `argument-${argumentCount}`;

    let html = ARGUMENT_TEMPLATE.replaceAll("{n}", argumentCount);
    div.innerHTML = html;

    ARGUMENT_CONTAINER.appendChild(div);
    REMOVE_ARGUMENT.disabled = false;
}
function removeArgument() {
    updateArgumentCount(argumentCount-1);

    ARGUMENT_CONTAINER.removeChild(ARGUMENT_CONTAINER.children[argumentCount]);
    if (!argumentCount) REMOVE_ARGUMENT.disabled = true;
}

function updateArgumentCount(n) {
    argumentCount = n;
    ARGUMENT_COUNT.innerHTML = argumentCount;

    updateArgumentCountColour();
}
function updateRequiredArgumentCount(n) {
    requiredArgumentCount = n;
    REQUIRED_ARGUMENT_COUNT.innerHTML = n === -1 ? "" : "/" + n;

    updateArgumentCountColour();
}
function updateArgumentCountColour() {
    if (requiredArgumentCount === -1 || requiredArgumentCount > argumentCount) {
        ARGUMENT_TITLE.style.color = NOT_ENOUGH_ARGUMENTS_COLOUR;
    } else if (requiredArgumentCount === argumentCount) {
        ARGUMENT_TITLE.style.color = CORRECT_ARGUMENTS_COLOUR;
    } else {
        ARGUMENT_TITLE.style.color = TOO_MANY_ARGUMENTS_COLOUR;
    }
}