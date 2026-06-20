let currentInput = "0";
let previousInput = "";
let hasEvaluated = false;
let history = [];

const mainDisplay = document.getElementById("mainDisplay");
const equationDisplay = document.getElementById("equationDisplay");
const historyList = document.getElementById("historyList");
const emptyHistoryMsg = document.getElementById("emptyHistoryMsg");

function appendNum(n) {
    if (hasEvaluated) {
        currentInput = n;
        hasEvaluated = false;
    } else {
        currentInput = currentInput === "0" ? n : currentInput + n;
    }
    updateUI();
}

function appendOperator(op) {
    hasEvaluated = false;
    const last = currentInput.slice(-1);

    if ("+-*/%".includes(last)) {
        currentInput = currentInput.slice(0, -1) + op;
    } else {
        if (currentInput === "0" && op === "-") {
            currentInput = "-";
        } else if (currentInput !== "0") {
            currentInput += op;
        }
    }
    updateUI();
}

function appendDecimal() {
    if (hasEvaluated) {
        currentInput = "0.";
        hasEvaluated = false;
        updateUI();
        return;
    }
    let parts = currentInput.split(/[+\-*/%]/);
    let last = parts[parts.length - 1];

    if (!last.includes(".")) {
        currentInput += ".";
    }
    updateUI();
}

function calculate() {
    if (currentInput === "0" || currentInput === "-") return;

    try {
        let expr = currentInput.replace(/%/g, "/100");
        let result = Function("return " + expr)();

        if (!isFinite(result)) throw Error();

        result = Math.round(result * 1e12) / 1e12;

        saveHistory(currentInput, result);

        previousInput = currentInput + " =";
        currentInput = String(result);
        hasEvaluated = true;

        updateUI();
    } catch {
        currentInput = "Error";
        updateUI();
        setTimeout(clearAll, 1200);
    }
}

function clearAll() {
    currentInput = "0";
    previousInput = "";
    hasEvaluated = false;
    updateUI();
}

function backspace() {
    if (hasEvaluated) {
        clearAll();
        return;
    }
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
    updateUI();
}

function toggleSign() {
    if (hasEvaluated) return;
    if (currentInput === "0") return;

    if (currentInput.startsWith("-")) {
        currentInput = currentInput.slice(1);
    } else {
        currentInput = "-" + currentInput;
    }
    updateUI();
}

function updateUI() {
    let visualInput = currentInput.replace(/\*/g, " × ").replace(/\//g, " ÷ ").replace(/\+/g, " + ").replace(/\-/g, " − ");
    let visualEquation = previousInput.replace(/\*/g, " × ").replace(/\//g, " ÷ ").replace(/\+/g, " + ").replace(/\-/g, " − ");

    mainDisplay.textContent = visualInput;
    equationDisplay.textContent = visualEquation;
}

function saveHistory(expr, res) {
    history.unshift({ expr, res });
    if (history.length > 20) history.pop();

    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";

    if (history.length === 0) {
        emptyHistoryMsg.style.display = "block";
        return;
    }

    emptyHistoryMsg.style.display = "none";

    history.forEach((h, i) => {
        const div = document.createElement("div");
        let niceExpr = h.expr.replace(/\*/g, "×").replace(/\//g, "÷");
        // Added 'history-item-expr' class for premium dark mode support
        div.innerHTML = `<span class="history-item-expr" style="font-size: 13px;">${niceExpr} =</span><br><strong>${h.res}</strong>`;
        div.onclick = () => loadHistory(i);
        historyList.appendChild(div);
    });
}

function loadHistory(i) {
    currentInput = String(history[i].res);
    previousInput = "";
    hasEvaluated = true;
    updateUI();
}

function clearHistory() {
    history = [];
    localStorage.removeItem("history");
    renderHistory();
    clearAll(); // Clears main display and resets to '0' instantly
}

function toggleTheme() {
    document.documentElement.classList.toggle("dark");
}

window.onload = () => {
    history = JSON.parse(localStorage.getItem("history")) || [];
    renderHistory();
};