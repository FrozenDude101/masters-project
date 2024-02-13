function setupState() {
    clearErrors();
    if (FUNCTION_SELECTOR.value === NO_SELECTION) {
        addError("No function selected.");
    }

    state = Program.get(FUNCTION_SELECTOR.value);

    for (let i = 1; i <= argumentCount; i++) {
        let type = document.getElementById(`argument-type-${i}`).value;
        let value = document.getElementById(`argument-value-${i}`).value;

        switch (type) {
            case "Function":
                state = new ApplicationThunk(state, Program.get(value));
                break;
            case "Integer":
                state = new ApplicationThunk(state, new LiteralThunk(parseInt(value), new LiteralType("Integer")));
                break;
            case "Float":
                state = new ApplicationThunk(state, new LiteralThunk(parseFloat(value), new LiteralType("Float")));
                break;
            case "String":
                state = new ApplicationThunk(state, new LiteralThunk(value), new LiteralType("String"));
                break;
            case "None":
                addError(`No type specified for argument ${i}.`);
                break;
        }
    }

    if (hasErrors())
        state = null;

    states["0"] = new ThunkWrapper(state);

    let container = createContainer("0");
    cols["0"].innerHTML = "";
    cols["0"].appendChild(container);

    titles["0"].innerHTML += ""+states["0"];
    titles["0"].appendChild(createTypeButton("0"));
}

let history = [];
let executeInterval = null;
function execute() {
    if (states["0"] === null) {
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
        displayResult();
        return;
    }
    let pre = ""+states["0"];
    while (""+states["0"] === pre && states["0"].canStep()) {
        states["0"] = states["0"].step();
        states["0"].normaliseWrappers();
    }
    history.push(states["0"].clone());
    displayState();
    return;
}

function reset() {
    states["0"] = null;
    displayState();
}