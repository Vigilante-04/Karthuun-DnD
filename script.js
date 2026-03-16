// ---------------- Google Drive Image Helper ----------------
function driveLinkToDirect(url){
    if(!url) return "";
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
}

// ---------------- CSV Loader ----------------
async function loadCSV(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Failed to fetch CSV");
    const text = await res.text();
    const lines = text.split("\n").filter(l=>l.trim()!=="");
    const headers = lines[0].split(",").map(h=>h.trim());
    return lines.slice(1).map(line=>{
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h,i)=> obj[h]=cols[i]||"");
        return obj;
    });
}

// ---------------- Sort Helper ----------------
function sortByColumn(array, key){
    return array.sort((a,b)=>{
        const A = (a[key]||"").toLowerCase();
        const B = (b[key]||"").toLowerCase();
        return A < B ? -1 : A > B ? 1 : 0;
    });
}

// ---------------- Filter Helper ----------------
function filterData(data, searchText, dropdownFilters={}){
    return data.filter(item=>{
        const searchMatch = searchText
            ? Object.values(item).some(v=>v.toLowerCase().includes(searchText.toLowerCase()))
            : true;
        const dropdownMatch = Object.entries(dropdownFilters).every(([k,v])=>{
            return !v || item[k]===v;
        });
        return searchMatch && dropdownMatch;
    });
}

// ---------------- List Builder ----------------
function buildList(containerId, data, columns, smallImgKey){
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const table = document.createElement("table");
    table.className="list-table";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    columns.forEach(col=>{
        const th = document.createElement("th");
        th.textContent = col;
        th.onclick=()=>{ 
            const sorted = sortByColumn(data, col);
            buildList(containerId, sorted, columns, smallImgKey);
        };
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach(item=>{
        const tr = document.createElement("tr");
        if(smallImgKey){
            const tdImg = document.createElement("td");
            const img = document.createElement("img");
            img.src = driveLinkToDirect(item[smallImgKey]);
            img.className="small-img";
            tdImg.appendChild(img);
            tr.appendChild(tdImg);
        }
        columns.forEach(col=>{
            if(col!==smallImgKey){
                const td = document.createElement("td");
                td.textContent = item[col] || "";
                tr.appendChild(td);
            }
        });
        tr.onclick=()=> showPopup(item);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------- Popup ----------------
function showPopup(data){
    const popup = document.getElementById("cardPopup");
    const content = popup.querySelector(".card-content");
    content.innerHTML=`
        <span class="close-btn" onclick="closePopup()">×</span>
        ${data["Picture"] ? `<img class="full-img" src="${driveLinkToDirect(data["Picture"])}">` : ""}
        ${Object.entries(data).map(([k,v])=>{
            if(k!=="Picture") return `<p><strong>${k}:</strong> ${v}</p>`;
        }).join("")}
    `;
    popup.style.display="flex";
}

function closePopup(){
    document.getElementById("cardPopup").style.display="none";
}

// ---------------- Dropdown Search Handler ----------------
function attachSearch(inputId, dropdowns, data, containerId, columns, smallImgKey){
    const input = document.getElementById(inputId);
    const dd = dropdowns || {};
    input.addEventListener("input", ()=>{
        const filterObj = {};
        Object.entries(dd).forEach(([k,sel])=> filterObj[k] = sel.value);
        const filtered = filterData(data, input.value, filterObj);
        buildList(containerId, filtered, columns, smallImgKey);
    });
    Object.entries(dd).forEach(([k,sel])=>{
        sel.addEventListener("change", ()=>{
            const filterObj = {};
            Object.entries(dd).forEach(([k,sel])=> filterObj[k] = sel.value);
            const filtered = filterData(data, input.value, filterObj);
            buildList(containerId, filtered, columns, smallImgKey);
        });
    });
}
