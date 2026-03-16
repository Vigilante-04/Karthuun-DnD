// ---------------- Tabs ----------------

document.querySelectorAll(".tabButton").forEach(btn=>{

btn.addEventListener("click",()=>{

document.querySelectorAll(".tabButton").forEach(b=>b.classList.remove("active"))
document.querySelectorAll("section").forEach(s=>s.classList.remove("active"))

btn.classList.add("active")
document.getElementById(btn.dataset.target).classList.add("active")

})

})


// ---------------- CSV URLs ----------------

const NPC_SHEET =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv"

const LOCATION_SHEET =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv"


// ---------------- Data ----------------

let NPCS = []
let LOCATIONS = []


// ---------------- CSV Loader ----------------

async function loadCSV(url){

return new Promise((resolve,reject)=>{

Papa.parse(url,{
download:true,
header:true,
skipEmptyLines:true,

complete:(results)=>{

const clean = results.data.map(r=>{
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


// ---------------- Image System ----------------

function driveImage(id){

if(!id) return ""

return `https://lh3.googleusercontent.com/d/${id}`

}


function preloadImages(list){

list.forEach(src=>{
if(!src) return
const img = new Image()
img.src = src
})

}


// ---------------- NPC Rendering ----------------

function renderNPCs(list){

const container = document.getElementById("npcContainer")
container.innerHTML=""

list.forEach(npc=>{

const location = LOCATIONS.find(l=>
l["Location Name"]?.toLowerCase() === npc["Last Known Location"]?.toLowerCase()
)

const npcImg = driveImage(npc["Picture"])
const bgImg = location ? driveImage(location["Location Image"]) : ""

const card = document.createElement("div")
card.className="card"

card.innerHTML = `

${bgImg ? `<img class="background" src="${bgImg}" loading="lazy">` : ""}

${npcImg ? `<img class="npcImage" src="${npcImg}" loading="lazy" onerror="this.style.display='none'">` : ""}

<div class="info">

<h2>${npc["Title/Alias"]||""} ${npc["Name"]||""} ${npc["Surname"]||""}</h2>

<p><b>Status:</b> ${npc["Status"]}</p>
<p><b>Race:</b> ${npc["Race"]}</p>
<p><b>Faction:</b> ${npc["Faction/Affiliation"]}</p>
<p><b>Role:</b> ${npc["Occupation/Role"]}</p>

<p><b>Met:</b> ${npc["Location Met"]}</p>
<p><b>Last Known:</b> ${npc["Last Known Location"]}</p>

<p>${npc["Relationship & Knowledge of"]}</p>

</div>

`

container.appendChild(card)

})

}


// ---------------- Locations ----------------

function renderLocations(){

const container = document.getElementById("locationContainer")
container.innerHTML=""

LOCATIONS.forEach(loc=>{

const img = driveImage(loc["Location Image"])

const div = document.createElement("div")
div.className="locationCard"

div.innerHTML = `

<h3>${loc["Location Name"]}</h3>

${img ? `<img src="${img}" loading="lazy">` : ""}

`

container.appendChild(div)

})

}


// ---------------- Initialize ----------------

async function init(){

NPCS = await loadCSV(NPC_SHEET)
LOCATIONS = await loadCSV(LOCATION_SHEET)

const images = []

NPCS.forEach(n=>images.push(driveImage(n["Picture"])))
LOCATIONS.forEach(l=>images.push(driveImage(l["Location Image"])))

preloadImages(images)

renderNPCs(NPCS)
renderLocations()

}

init()
