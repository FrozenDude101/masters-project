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
                state = new ApplicationThunk(state, new LiteralThunk(parseInt(value)));
                break;
            case "Float":
                state = new ApplicationThunk(state, new LiteralThunk(parseFloat(value)));
                break;
            case "String":
                state = new ApplicationThunk(state, new LiteralThunk(value));
                break;
            case "None":
                addError(`No type specified for argument ${i}.`);
                break;
        }
    }

    if (hasErrors())
        state = null;

}

let executeInterval = null;
function execute() {
    setupState();
    executeInterval = setInterval(() => {
        if (state instanceof Thunk) {
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
function step() {
    if (state === null) {
        setupState();
        displayState();
        return;
    }
    try {
        state = state.step();
    } catch (e) {
        return e;
    }
    displayState();
    return null;
}