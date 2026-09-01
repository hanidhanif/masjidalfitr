const FALLBACK = {lat:-4.5167, lon:129.9031, label:"Bandaneira, Indonesia"};
const PRAYERS = [
  ["Fajr","Subuh","الفجر","☼"],["Dhuhr","Dzuhur","الظهر","☀"],["Asr","Ashar","العصر","◒"],["Maghrib","Maghrib","المغرب","☾"],["Isha","Isya","العشاء","◐"]
];
let state={location:FALLBACK,timings:null, dateKey:null, next:null, scheduleStart:null, scheduleEnd:null};

const $=s=>document.querySelector(s);
function pad(n){return String(n).padStart(2,"0")}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2800)}
function localDate(){const d=new Date();return `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`}
function dateLabel(d){return new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d)}
function timeNow(){return new Date().toLocaleTimeString("id-ID",{hour12:false})}
function timeToDate(t,day=new Date()){const [h,m]=t.split(":").map(Number);const d=new Date(day);d.setHours(h,m,0,0);return d}
function formatCountdown(ms){let s=Math.max(0,Math.floor(ms/1000));let h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;return `${pad(h)}:${pad(m)}:${pad(s)}`}

async function fetchPrayer(lat,lon){
  const now=new Date();
  const dd=pad(now.getDate()), mm=pad(now.getMonth()+1), yy=now.getFullYear();
  // 20 = Kementerian Agama Republik Indonesia
  const url=`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yy}?latitude=${lat}&longitude=${lon}&method=20`;
  const res=await fetch(url,{cache:"no-store"});
  if(!res.ok) throw new Error("Gagal mengambil jadwal");
  const json=await res.json();
  return json.data;
}
function render(data){
  state.timings=data.timings; state.dateKey=localDate();
  $("#gregorianDate").textContent=dateLabel(new Date());
  $("#hijriDate").textContent=`${data.date.hijri.weekday.ar}, ${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} H`;
  $("#timezone").textContent=data.meta?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone;
  $("#locationText").textContent=state.location.label;
  const vals=PRAYERS.map(([key])=>({key,keyLabel:PRAYERS.find(x=>x[0]===key)[1],time:data.timings[key]}));
  $("#prayerGrid").innerHTML=vals.map(x=>`<article class="prayer-card" data-key="${x.key}"><span class="arabic">${PRAYERS.find(p=>p[0]===x.key)[2]}</span><h3>${x.keyLabel}</h3><time>${x.time}</time></article>`).join("");
  chooseNext();
}
function chooseNext(){
  if(!state.timings)return;
  const now=new Date();
  let next=null;
  for(const [key,label] of PRAYERS){
    const t=state.timings[key]; if(!t)continue;
    const dt=timeToDate(t,now);
    if(dt>now){next={key,label,time:t,dt};break}
  }
  if(!next){
    const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
    // after Isha, countdown points to tomorrow's Fajr; fetch tomorrow only if needed later
    next={key:"Fajr",label:"Subuh",time:null,dt:null,tomorrow:true};
  }
  state.next=next; updateCountdown();
}
function updateCountdown(){
  if(!state.next)return;
  const now=new Date();
  if(state.next.tomorrow && !state.next.dt){
    // Use approximate rollover until tomorrow's data is loaded.
    const target=new Date(now);target.setDate(target.getDate()+1);target.setHours(5,0,0,0);
    $("#nextName").textContent="Subuh";
    $("#nextTime").textContent="besok";
    $("#countdown").textContent=formatCountdown(target-now);
    $("#progressBar").style.width="0%";
    return;
  }
  const ms=state.next.dt-now;
  if(ms<=0){chooseNext();return}
  $("#nextName").textContent=state.next.label;
  $("#nextTime").textContent=state.next.time;
  $("#countdown").textContent=formatCountdown(ms);
  const prayerCards=document.querySelectorAll(".prayer-card");
  prayerCards.forEach(c=>c.classList.toggle("active",c.dataset.key===state.next.key));
  const prevTimes=PRAYERS.map(([k])=>state.timings[k]).filter(Boolean).map(t=>timeToDate(t,now));
  const idx=PRAYERS.findIndex(p=>p[0]===state.next.key);
  const prev=idx>0?timeToDate(state.timings[PRAYERS[idx-1][0]],now):new Date(now.getTime()-3600000);
  const total=state.next.dt-prev;const elapsed=now-prev;
  $("#progressBar").style.width=`${Math.max(0,Math.min(100,elapsed/total*100))}%`;
  $("#progressText").textContent=`Menuju ${state.next.label}`;
}
function haversineQibla(lat,lon){
  const kaabaLat=21.4225*Math.PI/180, kaabaLon=39.8262*Math.PI/180;
  const p=lat*Math.PI/180,l=lon*Math.PI/180;
  const y=Math.sin(kaabaLon-l);
  const x=Math.cos(p)*Math.tan(kaabaLat)-Math.sin(p)*Math.cos(kaabaLon-l);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
async function load(lat=state.location.lat,lon=state.location.lon,label=state.location.label){
  state.location={lat,lon,label};
  try{
    const data=await fetchPrayer(lat,lon);
    localStorage.setItem("alfitr-last",JSON.stringify({location:state.location,data}));
    render(data);
    $("#qiblaDegree").textContent=Math.round(haversineQibla(lat,lon));
  }catch(e){
    const cached=localStorage.getItem("alfitr-last");
    if(cached){const c=JSON.parse(cached);state.location=c.location;render(c.data);toast("Koneksi gagal • menampilkan jadwal terakhir")}
    else toast("Jadwal belum dapat dimuat. Periksa koneksi internet.");
  }
}
function requestLocation(){
  if(!navigator.geolocation){toast("Browser tidak mendukung lokasi otomatis.");return}
  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude,longitude}=pos.coords;
    await load(latitude,longitude,"Lokasi perangkat");
    toast("Lokasi perangkat berhasil digunakan.");
  },()=>toast("Izin lokasi ditolak • memakai Bandaneira."));
}
function init(){
  $("#year").textContent=new Date().getFullYear();
  $("#liveClock").textContent=timeNow();
  setInterval(()=>{$("#liveClock").textContent=timeNow();updateCountdown()},1000);
  $("#refreshBtn").onclick=()=>load();
  $("#locateBtn").onclick=requestLocation;
  $("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("alfitr-theme",document.body.classList.contains("dark")?"dark":"light")};
  if(localStorage.getItem("alfitr-theme")==="dark")document.body.classList.add("dark");
  load();
}
init();
