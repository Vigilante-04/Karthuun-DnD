// ---------------- CONFIG ----------------
const NPC_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv";
const LOCATION_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv";

let NPCS = [];
let LOCATIONS = [];
let currentSort = { column: "Name", ascending: true };

// ---------------- HELPERS ----------------
function driveLinkToDirect(url){
    if(!url) return "";
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if(match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
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

// ---------------- PAGE SHOW/HIDE ----------------
function showLandingPage(){
    document.getElementById("landingPage").style.display="flex";
    document.getElementById("npcPage").style.display="none";
    document.getElementById("locationPage").style.display="none";
}
function showNPCPage(){
    document.getElementById("landingPage").style.display="none";
    document.getElementById("npcPage").style.display="block";
    document.getElementById("locationPage").style.display="none";
    renderNPCTable(NPCS);
}
function showLocationPage(){
    document.getElementById("landingPage").style.display="none";
    document.getElementById("npcPage").style.display="none";
    document.getElementById("locationPage").style.display="block";
    renderLocationList(LOCATIONS);
}

// ---------------- INIT ----------------
async function init(){
    NPCS = await loadCSV(NPC_CSV);
    NPCS = NPCS.filter(n=> n["Active/Inactive"] === "Active"); // Only Active
    LOCATIONS = await loadCSV(LOCATION_CSV);

    populateNPCFilters();
    showLandingPage();

    // Set random images for landing buttons
    const npcBtn = document.getElementById("landingNPCBtn");
    npcBtn.style.backgroundImage = `url(${driveLinkToDirect(NPCS[Math.floor(Math.random()*NPCS.length)]["Picture"])})`;
    const locBtn = document.getElementById("landingLocationBtn");
    locBtn.style.backgroundImage = `url(${driveLinkToDirect(LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)]["Location Image"])})`;
}

// ---------------- FILTERS ----------------
function populateNPCFilters(){
    const races = ["All", ...new Set(NPCS.map(n=>n["Race"]).filter(r=>r))];
    const genders = ["All", ...new Set(NPCS.map(n=>n["Gender"]).filter(g=>g))];
    const locations = ["All", ...new Set(NPCS.map(n=>n["Last Known Location"]).filter(l=>l))];

    const raceSel = document.getElementById("raceFilter");
    races.forEach(r=> raceSel.appendChild(Object.assign(document.createElement("option"), {value:r, textContent:r})));

    const genderSel = document.getElementById("genderFilter");
    genders.forEach(g=> genderSel.appendChild(Object.assign(document.createElement("option"), {value:g, textContent:g})));

    const locSel = document.getElementById("locationFilter");
    locations.forEach(l=> locSel.appendChild(Object.assign(document.createElement("option"), {value:l, textContent:l})));
}

function applyNPCFilters(){
    const searchText = document.getElementById("npcSearch").value.toLowerCase();
    const raceFilter = document.getElementById("raceFilter").value;
    const genderFilter = document.getElementById("genderFilter").value;
    const locationFilter = document.getElementById("locationFilter").value;

    let filtered = NPCS.filter(npc=>{
        if(searchText && !(`${npc["Name"]} ${npc["Surname"]} ${npc["Title/Alias"]}`.toLowerCase().includes(searchText))) return false;
        if(raceFilter !== "All" && npc["Race"] !== raceFilter) return false;
        if(genderFilter !== "All" && npc["Gender"] !== genderFilter) return false;
        if(locationFilter !== "All" && npc["Last Known Location"] !== locationFilter) return false;
        return true;
    });

    renderNPCTable(filtered);
}

// ---------------- NPC TABLE ----------------
function renderNPCTable(npcs){
    const container = document.getElementById("npcList");
    container.innerHTML="";
    const table = document.createElement("table");
    table.id="npcTable";

    // Headers
    const headers = ["Name","Surname","Age","Race","Gender","Last Known Location"];
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    headers.forEach(h=>{
        const th = document.createElement("th");
        th.textContent=h;
        th.onclick = ()=>sortNPCs(h);
        trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");
    npcs.sort((a,b)=> a["Name"].localeCompare(b["Name"])).forEach(npc=>{
        const tr = document.createElement("tr");
        tr.dataset.Name = npc["Name"];
        tr.dataset.Surname = npc["Surname"];
        tr.dataset.Race = npc["Race"];
        tr.dataset.Gender = npc["Gender"];
        tr.dataset["Last Known Location"] = npc["Last Known Location"];

        tr.innerHTML=`
            <td><img src="${driveLinkToDirect(npc["Picture"])}" class="npcListImg"> ${npc["Name"]}</td>
            <td>${npc["Surname"]}</td>
            <td>${npc["Age"]}</td>
            <td>${npc["Race"]}</td>
            <td>${npc["Gender"]}</td>
            <td>${npc["Last Known Location"]}</td>
        `;
        tr.onclick = ()=>openNPCCard(npc);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function sortNPCs(column){
    const table = document.getElementById("npcTable");
    if(!table) return;
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const asc = currentSort.column === column ? !currentSort.ascending : true;
    currentSort = { column, ascending: asc };
    rows.sort((a,b)=>{
        const valA = a.dataset[column] || "";
        const valB = b.dataset[column] || "";
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    const tbody = table.querySelector("tbody");
    tbody.innerHTML="";
    rows.forEach(r=>tbody.appendChild(r));
}

// ---------------- NPC OVERLAY ----------------
function openNPCCard(npc){
    const overlay = document.getElementById("npcOverlay");
    overlay.innerHTML=`
        <div class="overlayContent">
            <button class="backBtn" onclick="closeNPCCard()">✖</button>
            <div class="npcCard">
                <img src="${driveLinkToDirect(npc["Picture"])}" class="npcImg">
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
        </div>
    `;
    overlay.style.display="flex";
}
function closeNPCCard(){ document.getElementById("npcOverlay").style.display="none"; }

// ---------------- LOCATIONS ----------------
function renderLocationList(locations){
    const container = document.getElementById("locationList");
    container.innerHTML="";
    locations.sort((a,b)=> a["Location Name"].localeCompare(b["Location Name"])).forEach(loc=>{
        const div = document.createElement("div");
        div.className="locationRow";
        div.innerHTML=`
            <img src="${driveLinkToDirect(loc["Location Image"])}" class="locationImg">
            <span>${loc["Location Name"]}</span>
        `;
        div.onclick = ()=>openLocationOverlay(loc);
        container.appendChild(div);
    });
}

function openLocationOverlay(loc){
    const overlay = document.getElementById("locationOverlay");
    overlay.innerHTML=`
        <div class="overlayContent">
            <button class="backBtn" onclick="closeLocationOverlay()">✖</button>
            <div class="locationCard">
                <img src="${driveLinkToDirect(loc["Location Image"])}" class="locationFullImg">
                <div class="mapCircle">Map Coming Soon</div>
                <h2>${loc["Location Name"]}</h2>
                <p>${loc["Description"] || ""}</p>
            </div>
        </div>
    `;
    overlay.style.display="flex";
}

function closeLocationOverlay(){ document.getElementById("locationOverlay").style.display="none"; }

// ---------------- EVENT LISTENERS ----------------
document.addEventListener("DOMContentLoaded",()=>{
    init();

    document.getElementById("landingNPCBtn").onclick = showNPCPage;
    document.getElementById("landingLocationBtn").onclick = showLocationPage;

    document.getElementById("npcSearch").addEventListener("input",applyNPCFilters);
    document.getElementById("raceFilter").addEventListener("change",applyNPCFilters);
    document.getElementById("genderFilter").addEventListener("change",applyNPCFilters);
    document.getElementById("locationFilter").addEventListener("change",applyNPCFilters);

    document.getElementById("backToLandingNPC").onclick = showLandingPage;
    document.getElementById("backToLandingLocation").onclick = showLandingPage;
});
