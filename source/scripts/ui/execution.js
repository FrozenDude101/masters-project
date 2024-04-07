const CODE_INPUT = document.getElementById("code-input");

let parseTimeout = null;
CODE_INPUT.addEventListener("input", () => {
    clearTimeout(parseTimeout);
    parseTimeout = setTimeout(() => {
        let text = CODE_INPUT.value;
        Parser.main(text);
        parseMainInput(false);
    }, 1000);
});

CODE_INPUT.dispatchEvent(new InputEvent("input"));

function setupState() {
    clearErrors();

    state = Program.getFunction("main");

    cols = {"0": document.getElementById("cc0")}
    rows = {"": document.getElementById("cr")}
    titles = {}
    bodies = {}
    states = {}
    marked = [];
    typeCols = {}
    typeTitles = {}
    typeBodies = {}

    states["0"] = state;

    let container = createContainer("0");
    cols["0"].innerHTML = "";
    cols["0"].appendChild(container);

    titles["0"].innerHTML += ""+states["0"];
    titles["0"].appendChild(createTypeButton("0"));
}

let executeInterval = null;
function execute() {
    if (!states["0"]) {
        setupState();
        displayState();
    }
    executeInterval = setInterval(() => {
        if (states["0"].canStep()) {
            let e = step();
            if (e) {
                clearInterval(executeInterval);
                addError(e);
                states["0"] = null;
            }
        } else {
            clearInterval(executeInterval);
            displayState();
            displayResult();
            states["0"] = null;
        }
    }, 1);
}

let stepInterval = null;
function start() {
    if (states["0"] === null) {
        setupState();
        displayState();
    }
    stepInterval = setInterval(() => {
        if (states["0"].canStep()) {
            let e = step();
            if (e) {
                clearInterval(stepInterval);
                addError(e);
                states["0"] = null;
            }
        } else {
            clearInterval(stepInterval);
            displayState();
            displayResult();
            states["0"] = null;
        }
    }, 1000);
}
function stop() {
    clearInterval(stepInterval);
}

function step() {
    if (!states["0"]) {
        setupState();
        displayState();
        return;
    }
    if (!states["0"].canStep()) {
        displayResult(states["0"]);
        return;
    }
    let pre = ""+states["0"];
    while (""+states["0"] === pre && states["0"].canStep()) {
        states["0"] = states["0"].step();
    }
    displayState();
    return;
}

function reset() {
    states["0"] = null;
    displayState();
}