// ---------------- CONFIG ----------------
const NPC_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv";
const LOCATION_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv";

// ---------------- GLOBALS ----------------
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

// ---------------- LANDING PAGE ----------------
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

// ---------------- SEARCH & FILTER ----------------
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

// ---------------- SORT ----------------
function sortNPCs(column){
    if(currentSort.column === column) currentSort.ascending = !currentSort.ascending;
    else { currentSort.column = column; currentSort.ascending = true; }

    const sorted = [...document.querySelectorAll("#npcTable tbody tr")];
    sorted.sort((a,b)=>{
        const valA = a.dataset[column].toLowerCase();
        const valB = b.dataset[column].toLowerCase();
        if(valA < valB) return currentSort.ascending ? -1 : 1;
        if(valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    const tbody = document.querySelector("#npcTable tbody");
    tbody.innerHTML="";
    sorted.forEach(row=>tbody.appendChild(row));
}

// ---------------- NPC TABLE ----------------
function renderNPCTable(npcs){
    const container = document.getElementById("npcList");
    container.innerHTML="";
    const table = document.createElement("table");
    table.id="npcTable";

    // Header
    const thead = document.createElement("thead");
    const headers = ["Name","Surname","Age","Race","Gender","Last Known Location"];
    const tr = document.createElement("tr");
    headers.forEach(h=>{
        const th = document.createElement("th");
        th.textContent=h;
        th.addEventListener("click",()=>sortNPCs(h));
        tr.appendChild(th);
    });
    thead.appendChild(tr);
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
            <td>${npc["Name"]}</td>
            <td>${npc["Surname"]}</td>
            <td>${npc["Age"]}</td>
            <td>${npc["Race"]}</td>
            <td>${npc["Gender"]}</td>
            <td>${npc["Last Known Location"]}</td>
        `;
        tr.addEventListener("click",()=>openNPCCard(npc));
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------- NPC CARD OVERLAY ----------------
function openNPCCard(npc){
    const overlay = document.getElementById("npcOverlay");
    overlay.innerHTML=`
        <div class="overlayContent">
            <button class="backBtn" onclick="closeNPCCard()">← Back</button>
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

function closeNPCCard(){
    document.getElementById("npcOverlay").style.display="none";
}

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
        div.addEventListener("click",()=>openLocationOverlay(loc));
        container.appendChild(div);
    });
}

function openLocationOverlay(loc){
    const overlay = document.getElementById("locationOverlay");
    overlay.innerHTML=`
        <div class="overlayContent">
            <button class="backBtn" onclick="closeLocationOverlay()">← Back</button>
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

function closeLocationOverlay(){
    document.getElementById("locationOverlay").style.display="none";
}

// ---------------- INITIALIZATION ----------------
async function init(){
    // Load NPCs and filter
    NPCS = await loadCSV(NPC_CSV);
    NPCS = NPCS.filter(n=> n["Active/Inactive"] === "Active"); // Only Active NPCs
    LOCATIONS = await loadCSV(LOCATION_CSV);

    populateNPCFilters();
    renderNPCTable(NPCS);
    renderLocationList(LOCATIONS);
}

// ---------------- FILTER POPULATE ----------------
function populateNPCFilters(){
    const races = ["All", ...new Set(NPCS.map(n=>n["Race"]).filter(r=>r))];
    const genders = ["All", ...new Set(NPCS.map(n=>n["Gender"]).filter(g=>g))];
    const locations = ["All", ...new Set(NPCS.map(n=>n["Last Known Location"]).filter(l=>l))];

    const raceSel = document.getElementById("raceFilter");
    races.forEach(r=>{
        const opt = document.createElement("option");
        opt.value=r;
        opt.textContent=r;
        raceSel.appendChild(opt);
    });

    const genderSel = document.getElementById("genderFilter");
    genders.forEach(g=>{
        const opt = document.createElement("option");
        opt.value=g;
        opt.textContent=g;
        genderSel.appendChild(opt);
    });

    const locSel = document.getElementById("locationFilter");
    locations.forEach(l=>{
        const opt = document.createElement("option");
        opt.value=l;
        opt.textContent=l;
        locSel.appendChild(opt);
    });
}

// ---------------- DOM READY ----------------
document.addEventListener("DOMContentLoaded",()=>{
    init();

    document.getElementById("landingNPCBtn").addEventListener("click",showNPCPage);
    document.getElementById("landingLocationBtn").addEventListener("click",showLocationPage);

    document.getElementById("npcSearch").addEventListener("input",applyNPCFilters);
    document.getElementById("raceFilter").addEventListener("change",applyNPCFilters);
    document.getElementById("genderFilter").addEventListener("change",applyNPCFilters);
    document.getElementById("locationFilter").addEventListener("change",applyNPCFilters);

    document.getElementById("backToLandingNPC").addEventListener("click",showLandingPage);
    document.getElementById("backToLandingLocation").addEventListener("click",showLandingPage);
});
