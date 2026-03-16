// GOOGLE SHEET CSV URLs

const NPC_SHEET =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv"

const LOCATION_SHEET =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv"


let NPCS=[]
let LOCATIONS=[]


// CSV loader

async function loadCSV(url){

return new Promise((resolve,reject)=>{

Papa.parse(url,{

download:true,
header:true,
skipEmptyLines:true,

complete:(res)=>{

const clean = res.data.map(r=>{

let obj={}

Object.keys(r).forEach(k=>{
obj[k.trim()] = (r[k]||"").trim()
})

return obj

})

resolve(clean)

},

error:reject

})

})

}


// Convert Google Drive share → image

function driveImage(url){

if(!url) return ""

let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)

if(match){

return `https://lh3.googleusercontent.com/d/${match[1]}`

}

return ""

}


// Find location background

function getLocationImage(name){

let loc = LOCATIONS.find(l=>
l["Location Name"]?.toLowerCase() === name?.toLowerCase()
)

if(!loc) return ""

return driveImage(loc["Location Image"])

}


// Render NPC cards

function renderNPCs(list){

const container=document.getElementById("npcContainer")
container.innerHTML=""

list.forEach(npc=>{

const portrait = driveImage(npc["Picture"])
const bg = getLocationImage(npc["Last Known Location"])

const card=document.createElement("div")
card.className="card"

card.innerHTML=`

<div class="cardBackground" style="background-image:url('${bg}')"></div>

<div class="cardOverlay"></div>

<img class="npcPortrait"
src="${portrait}"
loading="lazy"
onerror="this.style.display='none'">

<div class="cardContent">

<h2>${npc["Title/Alias"]||""} ${npc["Name"]||""} ${npc["Surname"]||""}</h2>

<div class="meta">

<span>${npc["Race"]}</span>
<span>${npc["Status"]}</span>
<span>${npc["Faction/Affiliation"]}</span>

</div>

<div class="role">${npc["Occupation/Role"]||""}</div>

<button class="loreBtn">Lore</button>

<div class="lore">

<p><b>Met:</b> ${npc["Location Met"]}</p>

<p><b>Last Seen:</b> ${npc["Last Known Location"]}</p>

<p>${npc["Relationship & Knowledge of"]||""}</p>

</div>

</div>
`

container.appendChild(card)

})

activateLoreButtons()

}


// Lore expand

function activateLoreButtons(){

document.querySelectorAll(".loreBtn").forEach(btn=>{

btn.onclick=()=>{

const lore=btn.nextElementSibling

lore.classList.toggle("open")

}

})

}


// Filters

function applyFilters(){

let search=document.getElementById("searchBox").value.toLowerCase()
let status=document.getElementById("statusFilter").value

let filtered=NPCS.filter(n=>{

let name=`${n["Title/Alias"]} ${n["Name"]} ${n["Surname"]}`.toLowerCase()

let matchesSearch=name.includes(search)

let matchesStatus=!status || n["Status"]===status

return matchesSearch && matchesStatus

})

renderNPCs(filtered)

}


// INIT

async function init(){

NPCS = await loadCSV(NPC_SHEET)
LOCATIONS = await loadCSV(LOCATION_SHEET)

renderNPCs(NPCS)

document.getElementById("searchBox").addEventListener("input",applyFilters)
document.getElementById("statusFilter").addEventListener("change",applyFilters)

}

init()
