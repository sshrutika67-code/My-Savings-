const STORAGE_KEY = "pink100_entries_v1";
const grid = document.getElementById("daysGrid");
const dialog = document.getElementById("entryDialog");
const amountInput = document.getElementById("amountInput");
const entries = loadEntries();
let activeDay = null;

function loadEntries(){
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}
function saveEntries(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
function money(value){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value);
}
function amountFor(day){ return Number(entries[day]?.amount || 0); }
function render(){
  grid.innerHTML = "";
  let total = 0, savedDays = 0, yearTotal = 0;
  const thisYear = new Date().getFullYear();
  for(let day=1; day<=100; day++){
    const entry = entries[day];
    const amount = amountFor(day);
    const saved = !!entry && amount > 0;
    if(saved){ total += amount; savedDays++; if(Number(entry.year) === thisYear) yearTotal += amount; }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day" + (saved ? " saved" : "");
    button.setAttribute("aria-label", `Day ${day}${saved ? `, saved ${money(amount)}` : ", empty"}`);
    const number = document.createElement("span"); number.className="number"; number.textContent=`Day ${day}`;
    button.appendChild(number);
    if(saved){ const value=document.createElement("span"); value.className="value"; value.textContent=money(amount); button.appendChild(value); }
    button.addEventListener("click",()=>openEntry(day));
    grid.appendChild(button);
  }
  document.getElementById("allTotal").textContent = money(total);
  document.getElementById("yearTotal").textContent = money(yearTotal);
  document.getElementById("yearLabel").textContent = String(thisYear);
  document.getElementById("daysCount").textContent = `${savedDays} of 100 days saved`;
  const percent = savedDays;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("progressText").textContent = `${percent}% completed`;
}
function openEntry(day){
  activeDay = day;
  document.getElementById("dialogTitle").textContent = `Day ${day}`;
  amountInput.value = entries[day]?.amount ?? "";
  dialog.showModal();
  setTimeout(()=>amountInput.focus(),50);
}
function closeEntry(){ dialog.close(); activeDay=null; }
document.getElementById("closeDialog").addEventListener("click",closeEntry);
document.getElementById("clearEntry").addEventListener("click",()=>{
  if(activeDay !== null){ delete entries[activeDay]; saveEntries(); render(); }
  closeEntry();
});
document.getElementById("entryForm").addEventListener("submit",(event)=>{
  event.preventDefault();
  if(activeDay === null) return;
  const value = Number(amountInput.value);
  if(amountInput.value.trim() === "" || !Number.isFinite(value) || value <= 0){
    delete entries[activeDay];
  } else {
    entries[activeDay] = {amount:value, year:new Date().getFullYear()};
  }
  saveEntries(); render(); closeEntry();
});
dialog.addEventListener("click",(event)=>{ if(event.target === dialog) closeEntry(); });
document.getElementById("yearLabel").textContent = String(new Date().getFullYear());
render();
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
