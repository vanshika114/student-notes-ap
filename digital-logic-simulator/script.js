function logicOperation(a, b, gate) {
    switch (gate) {
        case "AND":
            return a && b;

        case "OR":
            return a || b;

        case "XOR":
            return a !== b;

        case "NAND":
            return !(a && b);

        case "NOR":
            return !(a || b);

        default:
            return false;
    }
}

function calculate() {
    const a = document.getElementById("a").checked;
    const b = document.getElementById("b").checked;
    const gate = document.getElementById("gate").value;

    const result = logicOperation(a, b, gate);

    document.getElementById("output").textContent = result ? 1 : 0;

    const led = document.getElementById("led");
    led.style.background = result ? "limegreen" : "red";

    generateTruthTable(gate);
}

function generateTruthTable(gate) {
    const table = document.getElementById("truthTable");

    let rows = "";

    const combinations = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
    ];

    combinations.forEach(([a, b]) => {
        const output = logicOperation(
            Boolean(a),
            Boolean(b),
            gate
        );

        rows += `
            <tr>
                <td>${a}</td>
                <td>${b}</td>
                <td>${output ? 1 : 0}</td>
            </tr>
        `;
    });

    table.innerHTML = rows;
}

generateTruthTable("AND");