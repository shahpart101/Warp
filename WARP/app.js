// Hardcoded parsed profiles
const parsedProfiles = {
    "parthiv_shah": {
      summary: "Strong full-stack engineer with startup experience, ML exposure, and high founder leverage.",
      radar: {
        capability: 85,
        proximity: 50,
        attention: 25,
        runway: 45
      }
    },
  
    "roommate": {
      summary: "Generalist engineer with solid fundamentals and strong culture fit.",
      radar: {
        capability: 65,
        proximity: 60,
        attention: 35,
        runway: 40
      }
    }
  };
  
  let chart;
  
  // Upload listener
  document.getElementById("resumeUpload").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const name = file.name.toLowerCase();
  
    let profile = null;
  
    if (name.includes("parthiv")) {
      profile = parsedProfiles["parthiv_shah"];
    } else if (name.includes("roommate")) {
      profile = parsedProfiles["roommate"];
    } else {
      alert("No parser for this resume — rename to include 'parthiv' or 'roommate'");
      return;
    }
  
    // Show parsed summary
    document.getElementById("parsedSummary").classList.remove("hidden");
    document.getElementById("summaryText").innerText = profile.summary;
  
    // Radar chart
    const radarData = profile.radar;
    const labels = ["Capability", "Proximity", "Founder Attention Cost", "Runway Impact"];
    const scores = [
      radarData.capability,
      radarData.proximity,
      radarData.attention,
      radarData.runway
    ];
  
    if (chart) chart.destroy();
  
    const ctx = document.getElementById("radarChart");
    chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "Candidate Profile",
          data: scores,
          borderColor: "#5b7cff",
          backgroundColor: "rgba(91, 124, 255, 0.3)"
        }]
      },
      options: { responsive: true }
    });
  
    document.getElementById("chartContainer").classList.remove("hidden");
  
    // Worth-It Score
    const worthScore = Math.round(
      radarData.capability * 0.45 +
      radarData.proximity * 0.25 +
      (100 - radarData.attention) * 0.20 +
      (100 - radarData.runway) * 0.10
    );
  
    document.getElementById("scoreValue").innerText = worthScore;
  
    let rec = "";
    if (worthScore >= 80) rec = "⭐ Strong Hire";
    else if (worthScore >= 60) rec = "✔ Consider";
    else rec = "❌ Not a Fit Right Now";
  
    document.getElementById("recommendation").innerText = rec;
    document.getElementById("scoreContainer").classList.remove("hidden");
  });

