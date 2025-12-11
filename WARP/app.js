/* ---------------------------------------------------------
   CONSTANTS + STARTUP DATA
--------------------------------------------------------- */

const SALARY_DATA = {
  "Software Engineer": 150000,
  "Designer": 120000,
  "Product Manager": 140000,
  "Salesperson": 110000
};

let currentCash = 1_000_000;
let rolesTimeline = {};
let hires = [];

const candidateComp = {
  "Resume_1.pdf": {
    baseSalary: 150000,
    equityGrant: 20000,
    signingBonus: 10000,
    payrollTaxRate: 0.11,
    benefitsMonthly: 850
  },
  "Resume_2.pdf": {
    baseSalary: 180000,
    equityGrant: 50000,
    signingBonus: 15000,
    payrollTaxRate: 0.11,
    benefitsMonthly: 900
  },
  "Resume_3.pdf": {
    baseSalary: 130000,
    equityGrant: 10000,
    signingBonus: 5000,
    payrollTaxRate: 0.11,
    benefitsMonthly: 800
  }
};

const parsedProfiles = {
  "parthiv_shah": {
    summary:
      "High-agency full-stack engineer with startup instincts, ML exposure, and strong execution speed.",
    radar: { capability: 88, proximity: 65, attention: 35, runway: 55 },
    tier: "Hire"
  },

  "abiye_berhanu": {
    summary:
      "Structured engineer with deep academic strength and production experience.",
    radar: { capability: 92, proximity: 40, attention: 50, runway: 35 },
    tier: "Consider"
  },

  "yunseok_hwang": {
    summary:
      "Repeat founder with zero-to-one execution ability and extremely low attention cost.",
    radar: { capability: 90, proximity: 95, attention: 15, runway: 70 },
    tier: "Top Hire"
  }
};

const attentionCost = {
  low: 2,
  medium: 4,
  high: 8
};

const tierThemes = {
  "Top Hire": {
    color: "#4ade80",
    bg: "rgba(74, 222, 128, 0.15)",
    border: "#4ade80"
  },
  "Hire": {
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.15)",
    border: "#60a5fa"
  },
  "Consider": {
    color: "#facc15",
    bg: "rgba(250, 204, 21, 0.15)",
    border: "#facc15"
  },
  "No Hire": {
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.15)",
    border: "#f87171"
  }
};


/* ---------------------------------------------------------
   COMP BREAKDOWN
--------------------------------------------------------- */

function computeCompBreakdown(candidateId) {
  const comp = candidateComp[candidateId];
  if (!comp) return null;

  const monthlyBase = comp.baseSalary / 12;
  const monthlyTaxes = monthlyBase * comp.payrollTaxRate;
  const monthlyEquity = comp.equityGrant / 12;
  const monthlyBonus = comp.signingBonus / 12;

  const totalMonthly =
    monthlyBase +
    monthlyTaxes +
    monthlyEquity +
    monthlyBonus +
    comp.benefitsMonthly;

  return {
    ...comp,
    monthlyBase,
    monthlyTaxes,
    monthlyEquity,
    monthlyBonus,
    totalMonthly
  };
}

function renderCompBreakdown(candidateId) {
  const d = computeCompBreakdown(candidateId);
  if (!d) return "";

  return `
    <div class="comp-breakdown">
      <h3>Compensation Breakdown</h3>

      <p><strong>Base Salary:</strong> $${d.baseSalary.toLocaleString()}</p>
      <p><strong>Equity Value:</strong> $${d.equityGrant.toLocaleString()} / yr</p>
      <p><strong>Signing Bonus:</strong> $${d.signingBonus.toLocaleString()}</p>

      <hr>

      <p><strong>Monthly Base:</strong> $${d.monthlyBase.toFixed(0)}</p>
      <p><strong>Payroll Taxes:</strong> $${d.monthlyTaxes.toFixed(0)}</p>
      <p><strong>Benefits:</strong> $${d.benefitsMonthly.toFixed(0)}</p>
      <p><strong>Equity (monthly):</strong> $${d.monthlyEquity.toFixed(0)}</p>
      <p><strong>Bonus (monthly):</strong> $${d.monthlyBonus.toFixed(0)}</p>

      <hr>
      <p><strong>Total Monthly Cost:</strong> $${d.totalMonthly.toFixed(0)}</p>
    </div>
  `;
}


/* ---------------------------------------------------------
   NETWORK SCORE + PDF PARSING
--------------------------------------------------------- */

function computeNetworkProximity(text) {
  const clean = text.toLowerCase();
  let score = 0;

  const warpCompanies = ["stripe", "dropbox", "meta", "aws", "google", "microsoft"];
  warpCompanies.forEach(c => { if (clean.includes(c)) score += 20; });

  if (clean.includes("chapel hill")) score += 10;
  if (clean.includes("founder")) score += 15;
  if (clean.includes("collaborated")) score += 10;

  return Math.min(score, 100);
}

async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(" ") + " ";
  }
  return text.toLowerCase();
}

function detectResumeOwner(text) {
  if (text.includes("parthiv")) return "parthiv_shah";
  if (text.includes("abiye")) return "abiye_berhanu";
  if (text.includes("yunseok") || text.includes("hwang") || text.includes("nije"))
    return "yunseok_hwang";
  return null;
}


/* ---------------------------------------------------------
   TIMELINE + BURN RATE
--------------------------------------------------------- */

function renderTimeline() {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  for (let m = 0; m < 6; m++) {
    const col = document.createElement("div");
    col.className = "timeline-col";
    col.innerHTML = `<strong>Month ${m + 1}</strong><br/>`;

    (rolesTimeline[m] || []).forEach(role => {
      const card = document.createElement("div");
      card.className = "role-card";
      card.innerText = role;
      col.appendChild(card);
    });

    container.appendChild(col);
  }
}

function updateBurn() {
  let totalMonthlyBurn = 0;

  Object.values(rolesTimeline).forEach(monthRoles => {
    monthRoles.forEach(role => {
      totalMonthlyBurn += SALARY_DATA[role] / 12;
    });
  });

  const runway = Math.floor(currentCash / totalMonthlyBurn);

  document.getElementById("burnRate").innerText =
    `Burn Rate: $${Math.round(totalMonthlyBurn).toLocaleString()}/month`;

  document.getElementById("runway").innerText =
    `Runway: ${runway} months`;
}


/* ---------------------------------------------------------
   IMPACT TABLE
--------------------------------------------------------- */

function renderImpactTable() {
  const table = document.getElementById("impactTable");
  table.innerHTML = "";

  hires.forEach(h => {
    const row = document.createElement("div");
    row.className = "impact-row";

    row.innerHTML = `
      <div>${h.role}</div>
      <div>${h.ramp} mo</div>
      <div>${attentionCost[h.attention]} hrs/wk</div>
      <div>$${Math.round(h.salary / 12).toLocaleString()}</div>
      <div>${h.capability}</div>
    `;
    table.appendChild(row);
  });
}


/* ---------------------------------------------------------
   RESUME UPLOAD HANDLER
--------------------------------------------------------- */

let chart = null;

document.getElementById("resumeUpload")
  .addEventListener("change", async e => {

    const file = e.target.files[0];
    let text = await extractPDFText(file);
    const profileKey = detectResumeOwner(text);

    if (!profileKey) return alert("Unable to detect resume owner.");

    const profile = parsedProfiles[profileKey];

    // Compute dynamic proximity
    profile.radar.proximity = computeNetworkProximity(text);

    // Update summary text
    document.getElementById("summaryText").innerText = profile.summary;

    // Prepare radar data
    const labels = [
      "Execution Capability",
      "Network Leverage",
      "Attention Cost",
      "Ramp Time"
    ];

    const scores = [
      profile.radar.capability,
      profile.radar.proximity,
      profile.radar.attention,
      profile.radar.runway
    ];

    // Theme based on tier
    const theme = tierThemes[profile.tier];

    // Tier label
    const tierEl = document.getElementById("tierLabel");
    tierEl.innerText = profile.tier;
    tierEl.style.color = theme.color;
    tierEl.style.background = theme.bg;
    tierEl.style.border = `1px solid ${theme.border}`;

    // Draw radar
    if (chart) chart.destroy();
    
    const ctx = document.getElementById("radarChart");
    chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [{
          label: profileKey.toUpperCase(),
          data: scores,
          borderColor: "#ffdd55",
          backgroundColor: "rgba(255,221,85,0.12)",
          borderWidth: 2,
          pointBackgroundColor: "#ffdd55",
          pointRadius: 5,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
    
        layout: {
          padding: { top: 40, bottom: 40, left: 40, right: 40 }
        },
    
        scales: {
          r: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255,255,255,0.10)" },
            angleLines: { color: "rgba(255,255,255,0.15)" },
            pointLabels: {
              color: "#fff",
              font: { size: 16, weight: "600" },
              padding: 20           // <-- EXTRA spacing from center
            },
            ticks: { display: false }
          }
        },
        plugins: { legend: { display: false } }
      }
    });    

    document.getElementById("insightSection").classList.remove("hidden");

    // Compute worth score
    const worthScore = Math.round(
      profile.radar.capability * 0.45 +
      profile.radar.proximity * 0.25 +
      (100 - profile.radar.attention) * 0.20 +
      (100 - profile.radar.runway) * 0.10
    );

    document.getElementById("scoreBadge").innerText = worthScore;

    // Recommendation
    const rec =
      worthScore >= 80 ? "⭐ Strong Hire"
      : worthScore >= 60 ? "✔ Consider"
      : "❌ Not a Fit Right Now";

    document.getElementById("recommendation").innerText = rec;

    // Viral insight
    let viralText = "";
    if (profile.radar.capability >= 85 && profile.radar.attention <= 30) {
      viralText = "High-signal hire. Likely generates strong internal referrals.";
    } else if (profile.radar.proximity >= 70) {
      viralText = "High network leverage. Likely shared across founder networks.";
    } else {
      viralText = "Solid hire with moderate virality.";
    }

    document.getElementById("viralInsight").innerText = viralText;
});


/* ---------------------------------------------------------
   EVENT HOOKS FOR ROLES + IMPACT
--------------------------------------------------------- */

document.getElementById("addRoleBtn").onclick = () => {
  const role = document.getElementById("rolePicker").value;
  const month = parseInt(document.getElementById("monthPicker").value);

  if (!rolesTimeline[month]) rolesTimeline[month] = [];
  rolesTimeline[month].push(role);

  renderTimeline();
  updateBurn();
};

document.getElementById("addImpactRoleBtn").onclick = () => {
  const role = document.getElementById("rolePicker").value;
  const ramp = parseInt(document.getElementById("rampPicker").value);
  const attention = document.getElementById("attentionPicker").value;
  const capability = document.getElementById("capabilityPicker").value;
  const salary = SALARY_DATA[role];

  hires.push({ role, ramp, attention, capability, salary });

  renderImpactTable();
};
