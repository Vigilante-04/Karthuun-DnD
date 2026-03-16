// ---------------- Tabs ----------------

const buttons = document.querySelectorAll(".tabButton");

buttons.forEach(btn=>{
btn.addEventListener("click",()=>{
buttons.forEach(b=>b.classList.remove("active"))
document.querySelectorAll("section").forEach(s=>s.classList.remove("active"))

btn.classList.add("active")
document.getElementById(btn.dataset.target).classList.add("active")
})
})


// ---------------- CSV URLs ----------------

const NPC_SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv"

const LOCATION_SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv"


// ---------------- Global Data ----------------

let NPCS = []
let LOCATIONS = []


// ---------------- Helpers ----------------

function driveLinkToDirect(url){

if(!url) return ""

let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)

if(match){
return `https://drive.google.com/uc?export=view&id=${match[1]}`
}

return url
}


// CSV loader using PapaParse

function loadCSV(url){

return new Promise((resolve,reject)=>{

Papa.parse(url,{
download:true,
header:true,
skipEmptyLines:true,
complete:(results)=>{

const cleaned = results.data.map(row=>{
let obj={}
Object.keys(row).forEach(k=>{
obj[k.trim()] = (row[k]||"").trim()
})
return obj
})

resolve(cleaned)

},
error:reject
})

})

}


// ---------------- Build NPC Cards ----------------

function renderNPCs(list){

const container = document.getElementById("npcContainer")
container.innerHTML=""

list.forEach(npc=>{

const location = LOCATIONS.find(l =>
l["Location Name"]?.toLowerCase() === npc["Last Known Location"]?.toLowerCase()
)

const bgImg = location ? driveLinkToDirect(location["Location Image"]) : ""
const npcImg = driveLinkToDirect(npc["Picture"])

const card = document.createElement("div")
card.className="card"

card.innerHTML = `
${bgImg ? `<img class="background" src="${bgImg}">` : ""}
${npcImg ? `<img class="npcImage" src="${npcImg}">` : ""}

<div class="info">

<h2>${npc["Title/Alias"] || ""} ${npc["Name"] || ""} ${npc["Surname"] || ""}</h2>

<p><b>Status:</b> ${npc["Status"]}</p>
<p><b>Race:</b> ${npc["Race"]}</p>
<p><b>Faction:</b> ${npc["Faction/Affiliation"]}</p>
<p><b>Role:</b> ${npc["Occupation/Role"]}</p>

<p><b>Met:</b> ${npc["Location Met"]}</p>

<p><b>Last Known:</b>
<span class="locationLink">${npc["Last Known Location"]}</span>
</p>

<p>${npc["Relationship & Knowledge of"]}</p>

</div>
`

container.appendChild(card)

})

}


// ---------------- Build Locations ----------------

function renderLocations(){

const container = document.getElementById("locationContainer")

container.innerHTML=""

LOCATIONS.forEach(loc=>{

const div = document.createElement("div")
div.className="locationCard"

div.innerHTML=`

<h3>${loc["Location Name"]}</h3>

${loc["Location Image"] ? `<img src="${driveLinkToDirect(loc["Location Image"])}">` : ""}

`

container.appendChild(div)

})

}


// ---------------- Search & Filters ----------------

function populateFactionFilter(){

const select = document.getElementById("factionFilter")

const factions = [...new Set(NPCS.map(n=>n["Faction/Affiliation"]).filter(Boolean))]

factions.sort()

factions.forEach(f=>{
const opt = document.createElement("option")
opt.value=f
opt.textContent=f
select.appendChild(opt)
})

}


function applyFilters(){

const search = document.getElementById("searchBox").value.toLowerCase()
const faction = document.getElementById("factionFilter").value

let filtered = NPCS.filter(npc=>{

const name =
`${npc["Title/Alias"]} ${npc["Name"]} ${npc["Surname"]}`.toLowerCase()

const matchesSearch = name.includes(search)

const matchesFaction =
!faction || npc["Faction/Affiliation"] === faction

return matchesSearch && matchesFaction

})

renderNPCs(filtered)

}


// ---------------- Initialize ----------------

async function init(){

NPCS = await loadCSV(NPC_SHEET_CSV_URL)
LOCATIONS = await loadCSV(LOCATION_SHEET_CSV_URL)

populateFactionFilter()

renderNPCs(NPCS)
renderLocations()

document.getElementById("searchBox").addEventListener("input",applyFilters)
document.getElementById("factionFilter").addEventListener("change",applyFilters)

}

init()
