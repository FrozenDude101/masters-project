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

    state = new ThunkWrapper(state);
    history = [state.clone()];
}

let history = [];
let executeInterval = null;
function execute() {
    if (state === null) {
        setupState();
        displayState();
    }
    executeInterval = setInterval(() => {
        if (state.canStep()) {
            let e = step();
            if (e) {
                clearInterval(executeInterval);
                addError(e);
                state = null;
            }
        } else {
            clearInterval(executeInterval);
            displayState();
            displayResult();
            state = null;
        }
    }, 1);
}

let stepInterval = null;
function start() {
    if (state === null) {
        setupState();
        displayState();
    }
    stepInterval = setInterval(() => {
        if (state.canStep()) {
            let e = step();
            if (e) {
                clearInterval(stepInterval);
                addError(e);
                state = null;
            }
        } else {
            clearInterval(stepInterval);
            displayState();
            displayResult();
            state = null;
        }
    }, 1000);
}
function stop() {
    clearInterval(stepInterval);
}

function step() {
    if (state === null) {
        setupState();
        displayState();
        return;
    }
    if (!state.canStep()) {
        displayResult();
        return;
    }
    let pre = ""+state;
    while (""+state === pre && state.canStep()) {
        state = state.step();
        state.normaliseWrappers();
    }
    history.push(state.clone());
    displayState();
    return;
}

function reset() {
    state = null;
    displayState();
}