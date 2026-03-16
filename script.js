// ---------------- Tabs ----------------
const buttons = document.querySelectorAll(".tabButton");
buttons.forEach(btn=>{
    btn.addEventListener("click",()=>{
        buttons.forEach(b=>b.classList.remove("active"));
        document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.target).classList.add("active");
    });
});

// ---------------- CSV URLs ----------------
const NPC_SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv";

const LOCATION_SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv";

// ---------------- Helpers ----------------
function driveLinkToDirect(url) {
    if(!url) return "";
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if(match){
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
}

async function loadCSV(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Failed to load CSV: "+res.status);
    const text = await res.text();
    const lines = text.split("\n").filter(l=>l.trim()!=="");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line=>{
        const cols = line.split(",");
        let obj={};
        headers.forEach((h,i)=> obj[h.trim()]=cols[i]||"");
        return obj;
    });
}

// ---------------- Build NPC Cards ----------------
async function buildNPCs(){
    const npcs = await loadCSV(NPC_SHEET_CSV_URL);
    const locations = await loadCSV(LOCATION_SHEET_CSV_URL);
    const container = document.getElementById("npcContainer");
    container.innerHTML = "";

    npcs.forEach(npc=>{
        const location = locations.find(l => l["Location Name"].trim() === npc["Last Known Location"].trim());
        const bgImg = location ? driveLinkToDirect(location["Location Image"]) : "";
        const npcImg = driveLinkToDirect(npc["Picture"]);

        const card = document.createElement("div");
        card.className="card";
        card.innerHTML=`
            ${bgImg ? `<img class="background" src="${bgImg}">` : ""}
            ${npcImg ? `<img class="npcImage" src="${npcImg}">` : ""}
            <div class="info">
                <h2>${npc["Title/Alias"]} ${npc["Name"]} ${npc["Surname"]}</h2>
                <p>Status: ${npc["Status"]}</p>
                <p>Race: ${npc["Race"]}</p>
                <p>Gender: ${npc["Gender"]}</p>
                <p>Faction: ${npc["Faction/Affiliation"]}</p>
                <p>Role: ${npc["Occupation/Role"]}</p>
                <p>Met: ${npc["Location Met"]}</p>
                <p>Last Known Location: ${npc["Last Known Location"]}</p>
                <p>Relationship & Knowledge: ${npc["Relationship & Knowledge of"]}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// ---------------- Build Locations ----------------
async function buildLocations(){
    const locations = await loadCSV(LOCATION_SHEET_CSV_URL);
    const container = document.getElementById("locationContainer");
    container.innerHTML = "";
    locations.forEach(loc=>{
        const div = document.createElement("div");
        div.style.marginBottom="20px";
        div.innerHTML=`
            <h3>${loc["Location Name"]}</h3>
            ${loc["Location Image"] ? `<img src="${driveLinkToDirect(loc["Location Image"])}" style="width:300px;border:2px solid #ccc;">` : ""}
        `;
        container.appendChild(div);
    });
}

// ---------------- Initialize ----------------
buildNPCs().catch(e=>console.error(e));
buildLocations().catch(e=>console.error(e));
