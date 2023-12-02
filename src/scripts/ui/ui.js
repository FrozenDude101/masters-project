const FUNCTION_SELECTOR = document.getElementById("function-selector");
const NO_SELECTION      = "Select a function.";

FUNCTION_SELECTOR.addEventListener("change", () => {
    if (FUNCTION_SELECTOR.value === NO_SELECTION) {
        updateRequiredArgumentCount(-1);
        return;
    }

    let fT = Program.get(FUNCTION_SELECTOR.value);
    let p = fT.patterns[0];
    updateRequiredArgumentCount(p.length);
});