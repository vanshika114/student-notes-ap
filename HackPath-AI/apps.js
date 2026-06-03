function analyzeRisk() {

    const company =
        document.getElementById("company").value;

    const employees =
        Number(document.getElementById("employees").value);

    const cloud =
        document.getElementById("cloud").value;

    const data =
        document.getElementById("data").value;

    let riskScore = 40;

    let threats = [];

    if (employees > 100) {
        riskScore += 15;
        threats.push("Large attack surface");
    }

    if (cloud !== "None") {
        riskScore += 10;
        threats.push("Cloud misconfiguration");
    }

    if (data === "Yes") {
        riskScore += 25;
        threats.push("Data breach risk");
        threats.push("Insider threats");
    }

    if (
        company.toLowerCase().includes("fintech")
    ) {
        riskScore += 15;
        threats.push("Financial fraud attacks");
        threats.push("Credential theft");
    }

    if (riskScore > 100)
        riskScore = 100;

    let controls = `
✅ Multi-Factor Authentication
✅ Endpoint Protection
✅ Data Encryption
✅ Security Awareness Training
✅ SIEM Monitoring
`;

    let report = `
🏢 COMPANY

${company}

━━━━━━━━━━━━━━━━━━━━

📊 CYBER RISK SCORE

${riskScore}/100

━━━━━━━━━━━━━━━━━━━━

⚠ POTENTIAL THREATS

${threats.join("\n")}

━━━━━━━━━━━━━━━━━━━━

🛡 RECOMMENDED CONTROLS

${controls}

━━━━━━━━━━━━━━━━━━━━

📋 COMPLIANCE CHECKLIST

• ISO 27001
• SOC 2
• GDPR

━━━━━━━━━━━━━━━━━━━━

🎯 SECURITY SUMMARY

This organization should prioritize
identity security, cloud security,
and continuous monitoring.

`;

    document.getElementById("result")
        .innerHTML =
        `<div class="score">${riskScore}/100</div>${report}`;
}