const NPC_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv";
const LOCATION_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv";

let NPCS=[], LOCATIONS=[];

// Auto convert any Google Drive link to direct view
function driveImage(url){
    if(!url) return "";
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if(match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    return url;
}

async function loadCSV(url){
    return new Promise((resolve,reject)=>{
        Papa.parse(url,{
            download:true,
            header:true,
            skipEmptyLines:true,
            complete:(res)=>{
                const clean=res.data.map(r=>{
                    let obj={}
                    Object.keys(r).forEach(k=>{
                        obj[k.trim()] = (r[k]||"").trim();
                    });
                    return obj;
                });
                resolve(clean);
            },
            error:reject
        })
    })
}

// Get location image
function getLocationImage(name){
    let loc = LOCATIONS.find(l=>l["Location Name"]?.toLowerCase()===name?.toLowerCase());
    if(!loc) return "";
    return driveImage(loc["Location Image"]);
}

// Render NPC list
function renderList(npcs){
    const container=document.getElementById("npcList");
    container.innerHTML="";
    npcs.forEach(npc=>{
        const li=document.createElement("li");
        li.innerHTML=`<img class="npcThumb" src="${driveImage(npc["Picture"])}"><span>${npc["Name"]||npc["Title/Alias"]||""}</span>`;
        li.onclick=()=>showFullCard(npc);
        container.appendChild(li);
    });
}

// Show full card overlay
function showFullCard(npc){
    const overlay=document.getElementById("npcOverlay");
    const card=document.getElementById("fullCard");
    const bg = getLocationImage(npc["Last Known Location"]);
    const portrait = driveImage(npc["Picture"]);
    card.innerHTML=`
        ${bg?`<img class="cardBackground" src="${bg}">`:''}
        <img class="npcPortrait" src="${portrait}">
        <div class="cardContent">
            <h2>${npc["Title/Alias"]||""} ${npc["Name"]||""} ${npc["Surname"]||""}</h2>
            <div class="meta">
                <span>${npc["Race"]}</span>
                <span>${npc["Sex"]||npc["Gender"]}</span>
                <span>${npc["Faction/Affiliation"]}</span>
                <span>${npc["Last Known Location"]}</span>
            </div>
            <div class="role">${npc["Occupation/Role"]||""}</div>
            <button class="loreBtn">Lore</button>
            <div class="lore">
                <p><b>Met:</b> ${npc["Location Met"]||""}</p>
                <p>${npc["Relationship & Knowledge of"]||""}</p>
            </div>
        </div>
    `;
    overlay.style.display="flex";
    activateLoreButtons();
}

// Close overlay
document.getElementById("closeOverlay").onclick=()=>document.getElementById("npcOverlay").style.display="none";

// Expand lore
function activateLoreButtons(){
    document.querySelectorAll(".loreBtn").forEach(btn=>{
        btn.onclick=()=>btn.nextElementSibling.classList.toggle("open");
    });
}

// Filters
function applyFilters(){
    let search=document.getElementById("searchBox").value.toLowerCase();
    let faction=document.getElementById("factionFilter").value;
    let sex=document.getElementById("sexFilter").value;
    let race=document.getElementById("raceFilter").value;
    let location=document.getElementById("locationFilter").value;

    const filtered=NPCS.filter(n=>{
        let name=`${n["Title/Alias"]||""} ${n["Name"]||""} ${n["Surname"]||""}`.toLowerCase();
        return (
            name.includes(search) &&
            (!faction||n["Faction/Affiliation"]===faction) &&
            (!sex||n["Sex"]===sex||n["Gender"]===sex) &&
            (!race||n["Race"]===race) &&
            (!location||n["Last Known Location"]===location)
        );
    });
    renderList(filtered);
}

// Populate filter dropdowns dynamically
function populateFilters(){
    const factions=[...new Set(NPCS.map(n=>n["Faction/Affiliation"]).filter(Boolean))];
    const sexes=[...new Set(NPCS.map(n=>n["Sex"]||n["Gender"]).filter(Boolean))];
    const races=[...new Set(NPCS.map(n=>n["Race"]).filter(Boolean))];
    const locations=[...new Set(NPCS.map(n=>n["Last Known Location"]).filter(Boolean))];

    const fill=(arr,id)=>{
        const select=document.getElementById(id);
        arr.forEach(v=>{
            const opt=document.createElement("option");
            opt.value=v; opt.textContent=v;
            select.appendChild(opt);
        });
    }

    fill(factions,"factionFilter");
    fill(sexes,"sexFilter");
    fill(races,"raceFilter");
    fill(locations,"locationFilter");
}

// Initialize
async function init(){
    NPCS = await loadCSV(NPC_CSV);
    LOCATIONS = await loadCSV(LOCATION_CSV);
    renderList(NPCS);
    populateFilters();

    document.getElementById("searchBox").addEventListener("input",applyFilters);
    document.getElementById("factionFilter").addEventListener("change",applyFilters);
    document.getElementById("sexFilter").addEventListener("change",applyFilters);
    document.getElementById("raceFilter").addEventListener("change",applyFilters);
    document.getElementById("locationFilter").addEventListener("change",applyFilters);
}

init();
