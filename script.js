// ===============================
// CONFIG
// ===============================
const CONFIG = {
    sheets: {
        npcs: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=0&single=true&output=csv",
        locations: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=30016903&single=true&output=csv",
        monsters: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=1165462310&single=true&output=csv",
        items: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMWKaNuiGKg_JmWT6G-eIm_2b9djoLisLoLkoRXvVDjo9xvUBK3HJrhnilNSA4kNMO9PxVYqlZz69U/pub?gid=1492959337&single=true&output=csv"
    }
};

// ===============================
// IMAGE PIPELINE (PRODUCTION)
// ===============================
function getDriveId(url) {
    const match = url?.match(/[-\w]{25,}/);
    return match ? match[0] : null;
}

function img(url, size = 300) {
    if (!url) return "images/placeholder.png";

    const id = getDriveId(url);
    if (!id) return url;

    return `https://images.weserv.nl/?url=drive.google.com/uc?id=${id}&w=${size}&q=80`;
}

// ===============================
// CSV PARSER
// ===============================
async function fetchCSV(url) {
    const res = await fetch(url);
    const text = await res.text();

    const rows = text.split("\n").map(r => r.split(","));
    const headers = rows.shift();

    return rows.map(r => {
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = r[i]?.trim());
        return obj;
    });
}

// ===============================
// NAVIGATION
// ===============================
function setupNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;

    nav.innerHTML = `
        <button onclick="go('index.html')">🏠 Home</button>
        <button onclick="go('npcs.html')">NPCs</button>
        <button onclick="go('locations.html')">Locations</button>
        <button onclick="go('monsters.html')">Monsters</button>
        <button onclick="go('items.html')">Items</button>
    `;
}

function go(page) {
    window.location.href = page;
}

// ===============================
// POPUP SYSTEM
// ===============================
function showPopup(html) {
    const el = document.getElementById("popupContent");
    document.getElementById("popup").style.display = "block";
    el.innerHTML = html;
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// ===============================
// NPC SYSTEM
// ===============================
async function loadNPCs() {
    let data = await fetchCSV(CONFIG.sheets.npcs);

    // Only ACTIVE NPCs
    data = data.filter(n => n["Active/Inactive"] === "Active");

    buildNPCList(data);
}

function buildNPCList(data) {
    const container = document.getElementById("list");

    container.innerHTML = data.map(n => `
        <div class="row" onclick='openNPC(${JSON.stringify(n)})'>
            <img src="${img(n["Picture"], 80)}">
            <span>${n.Name}</span>
            <span>${n.Surname}</span>
            <span>${n.Age}</span>
            <span>${n.Race}</span>
            <span>${n.Gender}</span>
            <span>${n["Last Known Location"]}</span>
        </div>
    `).join("");
}

function openNPC(n) {
    showPopup(`
        <div class="card">
            <img src="${img(n["Picture"], 800)}">
            <h2>${n.Name} ${n.Surname}</h2>
            <p>${n["Title/Alias"]}</p>
            <p><b>Race:</b> ${n.Race}</p>
            <p><b>Gender:</b> ${n.Gender}</p>
            <p><b>Location:</b> ${n["Last Known Location"]}</p>
        </div>
    `);
}

// ===============================
// LOCATIONS
// ===============================
async function loadLocations() {
    const data = await fetchCSV(CONFIG.sheets.locations);

    document.getElementById("list").innerHTML = data.map(l => `
        <div class="row" onclick='openLocation(${JSON.stringify(l)})'>
            <img src="${img(l["Location Image"], 80)}">
            <span>${l["Location Name"]}</span>
        </div>
    `).join("");
}

function openLocation(l) {
    showPopup(`
        <div class="card">
            <img src="${img(l["Location Image"], 800)}">
            <h2>${l["Location Name"]}</h2>
            <p>${l.Description}</p>
            <div class="hex">Hex Map Coming Soon</div>
        </div>
    `);
}

// ===============================
// MONSTERS
// ===============================
async function loadMonsters() {
    const data = await fetchCSV(CONFIG.sheets.monsters);

    document.getElementById("list").innerHTML = data.map(m => `
        <div class="row" onclick='openMonster(${JSON.stringify(m)})'>
            <img src="${img(m.Image, 80)}">
            <span>${m["Monster Name"]}</span>
            <span>${m["Monster Type"]}</span>
            <span>${m.CR}</span>
        </div>
    `).join("");
}

function openMonster(m) {
    showPopup(`
        <div class="card monster">
            <img src="${img(m.Image, 800)}">
            <h2>${m["Monster Name"]}</h2>
            <p>${m["Monster Type"]} | CR ${m.CR}</p>

            <div class="stats">
                <span>HP: ${m["Stats HP"]}</span>
                <span>AC: ${m["Stats AC"]}</span>
                <span>STR: ${m["Stats STR"]}</span>
                <span>DEX: ${m["Stats DEX"]}</span>
                <span>CON: ${m["Stats CON"]}</span>
                <span>INT: ${m["Stats INT"]}</span>
                <span>WIS: ${m["Stats WIS"]}</span>
                <span>CHA: ${m["Stats CHA"]}</span>
            </div>

            <p><b>Actions:</b></p>
            <ul>
                <li>${m["Action 01"]}</li>
                <li>${m["Action 02"]}</li>
                <li>${m["Action 03"]}</li>
                <li>${m["Action 04"]}</li>
            </ul>

            <p><b>Lore:</b> ${m.Lore}</p>
            <p><b>Tactics:</b> ${m.Tactics}</p>
        </div>
    `);
}

// ===============================
// ITEMS
// ===============================
async function loadItems() {
    const data = await fetchCSV(CONFIG.sheets.items);

    document.getElementById("list").innerHTML = data.map(i => `
        <div class="row" onclick='openItem(${JSON.stringify(i)})'>
            <img src="${img(i.Image, 80)}">
            <span>${i.Name}</span>
            <span>${i.Type}</span>
            <span>${i.Cost}</span>
            <span>${i.Weight}</span>
            <span>${i.Attributes}</span>
        </div>
    `).join("");
}

function openItem(i) {
    showPopup(`
        <div class="card">
            <img src="${img(i.Image, 800)}">
            <h2>${i.Name}</h2>
            <p><b>Type:</b> ${i.Type}</p>
            <p><b>Cost:</b> ${i.Cost}</p>
            <p><b>Weight:</b> ${i.Weight}</p>
            <p>${i.Description}</p>
        </div>
    `);
}
