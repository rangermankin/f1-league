import { useState, useEffect } from "react";

const SUPABASE_URL = "https://knjvofhoamlvnmqtoiuq.supabase.co";
const SUPABASE_KEY = "sb_publishable_QhKPtZS7VKyyVRLCflqEPg_ATs7igEY";

const db = {
  async get(key) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}&select=value`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const rows = await res.json();
    return rows.length ? { value: JSON.stringify(rows[0].value) } : null;
  },
  async set(key, value) {
    await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ key, value: JSON.parse(value), updated_at: new Date().toISOString() })
    });
  },
  async delete(key) {
    await fetch(`${SUPABASE_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

const NUM_PLAYERS = 4;
const DEFAULT_PLAYER_NAMES = ["Player 1","Player 2","Player 3","Player 4"];

const DEFAULT_TEAMS = [
  "Red Bull","Ferrari","Mercedes","McLaren","Aston Martin",
  "Alpine","Williams","Racing Bulls","Haas","Audi","Cadillac"
];
const DEFAULT_DRIVERS = [
  {name:"Max Verstappen",team:"Red Bull"},{name:"Isack Hadjar",team:"Red Bull"},
  {name:"Charles Leclerc",team:"Ferrari"},{name:"Lewis Hamilton",team:"Ferrari"},
  {name:"Kimi Antonelli",team:"Mercedes"},{name:"George Russell",team:"Mercedes"},
  {name:"Lando Norris",team:"McLaren"},{name:"Oscar Piastri",team:"McLaren"},
  {name:"Fernando Alonso",team:"Aston Martin"},{name:"Lance Stroll",team:"Aston Martin"},
  {name:"Pierre Gasly",team:"Alpine"},{name:"Franco Colapinto",team:"Alpine"},
  {name:"Alexander Albon",team:"Williams"},{name:"Carlos Sainz Jr.",team:"Williams"},
  {name:"Liam Lawson",team:"Racing Bulls"},{name:"Arvid Lindblad",team:"Racing Bulls"},
  {name:"Esteban Ocon",team:"Haas"},{name:"Oliver Bearman",team:"Haas"},
  {name:"Gabriel Bortoleto",team:"Audi"},{name:"Nico Hulkenberg",team:"Audi"},
  {name:"Sergio Perez",team:"Cadillac"},{name:"Valtteri Bottas",team:"Cadillac"},
];

const H2H_PAIRS = {
  "Red Bull":      ["Max Verstappen","Isack Hadjar"],
  "Ferrari":       ["Charles Leclerc","Lewis Hamilton"],
  "Mercedes":      ["Kimi Antonelli","George Russell"],
  "McLaren":       ["Lando Norris","Oscar Piastri"],
  "Aston Martin":  ["Fernando Alonso","Lance Stroll"],
  "Alpine":        ["Pierre Gasly","Franco Colapinto"],
  "Williams":      ["Alexander Albon","Carlos Sainz Jr."],
  "Racing Bulls":  ["Liam Lawson","Arvid Lindblad"],
  "Haas":          ["Esteban Ocon","Oliver Bearman"],
  "Audi":          ["Gabriel Bortoleto","Nico Hulkenberg"],
  "Cadillac":      ["Sergio Perez","Valtteri Bottas"],
};

const RACE_CALENDAR = [
  {r:1,  name:"Australian GP",         date:"8 Mar"},  {r:2,  name:"Chinese GP",            date:"15 Mar"},
  {r:3,  name:"Japanese GP",           date:"29 Mar"}, {r:4,  name:"Bahrain GP",             date:"12 Apr"},
  {r:5,  name:"Saudi Arabian GP",      date:"19 Apr"}, {r:6,  name:"Miami GP",               date:"3 May"},
  {r:7,  name:"Canadian GP",           date:"24 May"}, {r:8,  name:"Monaco GP",              date:"7 Jun"},
  {r:9,  name:"Barcelona-Catalunya GP",date:"14 Jun"}, {r:10, name:"Austrian GP",            date:"28 Jun"},
  {r:11, name:"British GP",            date:"5 Jul"},  {r:12, name:"Belgian GP",             date:"19 Jul"},
  {r:13, name:"Hungarian GP",          date:"26 Jul"}, {r:14, name:"Dutch GP",               date:"23 Aug"},
  {r:15, name:"Italian GP",            date:"6 Sep"},  {r:16, name:"Spanish GP",             date:"13 Sep"},
  {r:17, name:"Azerbaijan GP",         date:"26 Sep"}, {r:18, name:"Singapore GP",           date:"11 Oct"},
  {r:19, name:"United States GP",      date:"25 Oct"}, {r:20, name:"Mexico City GP",         date:"1 Nov"},
  {r:21, name:"Sao Paulo GP",          date:"8 Nov"},  {r:22, name:"Las Vegas GP",           date:"21 Nov"},
  {r:23, name:"Qatar GP",              date:"29 Nov"}, {r:24, name:"Abu Dhabi GP",           date:"6 Dec"},
];

const QUARTERS = ["Q1","Q2","Q3","Q4"];
const Q_RACES  = {Q1:"Races 1-7",Q2:"Races 8-13",Q3:"Races 14-19",Q4:"Races 20-24"};
const Q_DATES  = {Q1:"Mar 8 - May 24",Q2:"Jun 7 - Jul 26",Q3:"Aug 23 - Oct 25",Q4:"Nov 1 - Dec 6"};
const Q_WHEN   = {Q1:"Lock before Race 1 - Australian GP (Mar 8)",Q2:"Lock after Q1, before Race 8 - Monaco GP (Jun 7)",Q3:"Lock after Q2, before Race 14 - Dutch GP (Aug 23)",Q4:"Lock after Q3, before Race 20 - Mexico City GP (Nov 1)"};
const SEASON_DATES = "Mar 8 – Dec 6, 2026";

const BG="#080808",CARD="#101010",BORDER="#1e1e1e",BORDER2="#2a2a2a";
const TEXT="#e8e8e8",MUTED="#666",DIM="#444",ACCENT="#e10600";
const INPUTBG="#0d0d0d",MONO="'DM Mono','Courier New',monospace";
const GREEN="#4a8a4a",YELLOW="#a08030",RED="#8a3a3a";

const PLAYER_COLORS=["#e10600","#38bdf8","#f59e0b","#4ade80"];
const RACE_ABBR=["AUS","CHN","JPN","BHR","SAU","MIA","CAN","MON","BCN","AUT","GBR","BEL","HUN","NLD","ITA","SPA","AZE","SGP","USA","MEX","BRA","LVG","QAT","ABD"];
const Q_IDX={Q1:[0,6],Q2:[7,12],Q3:[13,18],Q4:[19,23]};

const predKey  = i => "f1-preds-"+i;
const lockKey  = i => "f1-prelocked-"+i;
const STORAGE_KEYS = ["f1-config","f1-results",...Array.from({length:NUM_PLAYERS},(_,i)=>predKey(i)),...Array.from({length:NUM_PLAYERS},(_,i)=>lockKey(i))];

// ─── BREAKPOINT HOOK ─────────────────────────────────────────────────────────
function useIsMobile(bp=620){
  const [mobile,setMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<bp);
  useEffect(()=>{
    function check(){setMobile(window.innerWidth<bp);}
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[bp]);
  return mobile;
}

// ─── SCORING ──────────────────────────────────────────────────────────────────
const scoreConRank = d => d===0?20:d===1?16:d===2?11:d===3?7:d<=6?4:0;
const scoreDrvRank = d => d===0?10:d<=2?8:d<=5?5:d<=10?2:0;
const scoreQCon = d => d===0?4:d===1?3:d===2?2:d===3?1:0;
const scoreQDrv = d => d===0?2:d<=2?1:0;

function scoreClinch(p,a){
  if(!p||!a) return null;
  const d=Math.abs((new Date(p)-new Date(a))/864e5);
  if(d===0)return 35;if(d<=2)return 30;if(d<=5)return 25;if(d<=7)return 20;
  if(d<=14)return 16;if(d<=21)return 12;if(d<=30)return 8;if(d<=42)return 5;
  if(d<=60)return 2;return 0;
}
function scoreDeps(pred=[],actual=[]){
  if(!actual.length) return null;
  const n=Math.min(pred.length,actual.length);
  const pp=Math.round(35/n);
  return pred.slice(0,n).reduce((t,d,i)=>{
    const ai=actual.indexOf(d);
    return ai===-1?t:t+Math.max(0,pp-Math.abs(i-ai));
  },0);
}
function scoreH2H(pred={},actual={}){
  if(!Object.keys(actual).some(k=>actual[k])) return null;
  return Object.keys(pred).reduce((t,tm)=>t+(actual[tm]&&pred[tm]===actual[tm]?5:0),0);
}
function scoreWins(pred=[],actual=[]){
  if(!actual.length) return null;
  return pred.reduce((t,d)=>t+(actual.includes(d)?15:0),0);
}
function scoreImprove(pred=[],actual){
  if(!actual) return null;
  const pos=pred.indexOf(actual);
  return pos===-1?0:Math.max(0,20-pos*2);
}
function calcRanking(pred=[],actual=[],fn){
  if(!actual||!actual.length) return null;
  return pred.reduce((t,item,pi)=>{
    const ai=actual.indexOf(item);
    return ai===-1?t:t+fn(Math.abs(pi-ai));
  },0);
}
function calcAllScores(preds,results){
  if(!preds||!results) return {total:0,cats:{}};
  const c={};
  c.constructorsRanking=results.constructorsRanking?.length?calcRanking(preds.constructorsRanking,results.constructorsRanking,scoreConRank):null;
  c.driversRanking=results.driversRanking?.length?calcRanking(preds.driversRanking,results.driversRanking,scoreDrvRank):null;
  c.quarterly={};
  QUARTERS.forEach(q=>{
    const qr=results.quarterly?.[q];
    const hasData=qr?.hasData===true;
    c.quarterly[q]={
      constructors:hasData?calcRanking(preds.quarterly?.[q]?.constructors,qr?.constructors||[],scoreQCon):null,
      drivers:hasData?calcRanking(preds.quarterly?.[q]?.drivers,qr?.drivers||[],scoreQDrv):null,
    };
  });
  c.constructorsClinch=results.constructorsClinchDate?scoreClinch(preds.constructorsClinchDate,results.constructorsClinchDate):null;
  c.driversClinch=results.driversClinchDate?scoreClinch(preds.driversClinchDate,results.driversClinchDate):null;
  c.departures=results.departuresConfirmed?scoreDeps(preds.departures,results.departures):null;
  const h2hAnySet=results.headToHead&&Object.values(results.headToHead).some(v=>v);
  c.headToHead=h2hAnySet?scoreH2H(preds.headToHead,results.headToHead):null;
  c.topWins=results.winsConfirmed?scoreWins(preds.topWins,results.topWins):null;
  c.biggestImprovement=results.biggestImprovement?scoreImprove(preds.biggestImprovement,results.biggestImprovement):null;
  const vals=[c.constructorsRanking,c.driversRanking,
    ...QUARTERS.flatMap(q=>[c.quarterly[q].constructors,c.quarterly[q].drivers]),
    c.constructorsClinch,c.driversClinch,c.departures,c.headToHead,c.topWins,c.biggestImprovement];
  return{total:vals.reduce((t,v)=>t+(v??0),0),cats:c};
}
function reconcileDrivers(stored,canonical){
  if(!stored||!stored.length) return [...canonical];
  const known=stored.filter(n=>canonical.includes(n));
  const missing=canonical.filter(n=>!known.includes(n));
  return [...known,...missing];
}
function mkPreds(teams,drivers){
  const dn=drivers.map(d=>d.name);
  const h2h={};
  teams.forEach(tm=>{const td=drivers.filter(d=>d.team===tm);h2h[tm]=td[0]?.name||"";});
  const q={};QUARTERS.forEach(k=>{q[k]={constructors:[...teams],drivers:[...dn],locked:false};});
  return{constructorsRanking:[...teams],driversRanking:[...dn],departures:[],constructorsClinchDate:"",driversClinchDate:"",headToHead:h2h,topWins:[],biggestImprovement:[...teams],safetyCarGuess:"",quarterly:q};
}
function mkResults(teams,drivers){
  const dn=drivers.map(d=>d.name);
  const h2h={};teams.forEach(tm=>{h2h[tm]="";});
  const q={};QUARTERS.forEach(k=>{q[k]={constructors:[...teams],drivers:[...dn],locked:false};});
  return{constructorsRanking:[...teams],constructorsConfirmed:false,driversRanking:[...dn],driversConfirmed:false,departures:[],departuresConfirmed:false,constructorsClinchDate:"",driversClinchDate:"",headToHead:h2h,h2hConfirmed:false,topWins:[],winsConfirmed:false,biggestImprovement:"",improvementConfirmed:false,safetyCars:"",quarterly:q};
}
function patchPreds(preds,teams,drivers){
  if(!preds) return preds;
  const dn=drivers.map(d=>d.name);
  const q={};
  QUARTERS.forEach(k=>{
    const stored=preds.quarterly?.[k]||{};
    q[k]={...stored,drivers:reconcileDrivers(stored.drivers,dn),constructors:stored.constructors&&stored.constructors.length===teams.length?stored.constructors:[...teams]};
  });
  return{...preds,quarterly:q};
}
function shortName(name=""){
  const parts=name.trim().split(" ");
  return parts[0];
}

// ─── SMALL UI ─────────────────────────────────────────────────────────────────
function Tag({children,color}){
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:3,fontSize:10,fontFamily:MONO,letterSpacing:"0.08em",background:"#1a1a1a",color:color||MUTED,border:"1px solid "+BORDER2}}>{children}</span>;
}
function Sec({title,sub,pts}){
  return(
    <div style={{marginTop:24,marginBottom:12,paddingBottom:8,borderBottom:"1px solid "+BORDER2}}>
      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:12,fontWeight:700,color:TEXT,fontFamily:MONO,letterSpacing:"0.04em",textTransform:"uppercase"}}>{title}</span>
        {pts&&<Tag color={ACCENT}>{pts}</Tag>}
      </div>
      {sub&&<div style={{fontSize:11,color:MUTED,marginTop:3,lineHeight:1.4}}>{sub}</div>}
    </div>
  );
}
function Lbl({children}){
  return <div style={{fontSize:10,color:MUTED,marginBottom:6,letterSpacing:"0.1em",fontFamily:MONO,textTransform:"uppercase"}}>{children}</div>;
}
function ConfirmBtn({confirmed,onConfirm,onUnconfirm}){
  if(confirmed) return <button onClick={onUnconfirm} style={{background:"none",border:"1px solid "+BORDER2,color:MUTED,padding:"6px 14px",borderRadius:3,cursor:"pointer",fontSize:11,fontFamily:MONO}}>UNCONFIRM</button>;
  return <button onClick={onConfirm} style={{background:ACCENT,border:"none",color:"#fff",padding:"6px 14px",borderRadius:3,cursor:"pointer",fontSize:11,fontFamily:MONO}}>CONFIRM RESULTS</button>;
}

// ─── DRAG RANK LIST ───────────────────────────────────────────────────────────
function RankList({items=[],onChange,disabled}){
  const [dragIdx,setDragIdx]=useState(null);
  const [overIdx,setOverIdx]=useState(null);
  function hDS(e,i){setDragIdx(i);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(i));}
  function hDO(e,i){e.preventDefault();e.dataTransfer.dropEffect="move";setOverIdx(i);}
  function hDrop(e,i){
    e.preventDefault();
    if(dragIdx===null||dragIdx===i){setDragIdx(null);setOverIdx(null);return;}
    const n=[...items];const[m]=n.splice(dragIdx,1);n.splice(i,0,m);onChange(n);
    setDragIdx(null);setOverIdx(null);
  }
  function hDE(){setDragIdx(null);setOverIdx(null);}
  function move(i,dir){const n=[...items];const j=i+dir;if(j<0||j>=n.length)return;[n[i],n[j]]=[n[j],n[i]];onChange(n);}
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,maxHeight:480,overflowY:"auto",fontSize:13}}>
      {items.map((item,i)=>{
        const isDragging=dragIdx===i;
        const isOver=overIdx===i&&dragIdx!==null&&dragIdx!==i;
        const showAbove=isOver&&dragIdx>i;
        const showBelow=isOver&&dragIdx<i;
        const rowBg=isDragging?"#1a0a0a":i%2===0?CARD:"#0d0d0d";
        const borderTop=showAbove?"2px solid "+ACCENT:"2px solid transparent";
        const borderBottom=showBelow?"2px solid "+ACCENT:i<items.length-1?"1px solid "+BORDER:"none";
        return(
          <div key={item} draggable={!disabled}
            onDragStart={disabled?undefined:(e)=>hDS(e,i)}
            onDragOver={disabled?undefined:(e)=>hDO(e,i)}
            onDrop={disabled?undefined:(e)=>hDrop(e,i)}
            onDragEnd={disabled?undefined:hDE}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 10px",borderTop,borderBottom,background:rowBg,opacity:isDragging?0.4:disabled?0.6:1,cursor:disabled?"default":"grab",minHeight:44}}>
            <span style={{color:DIM,width:22,textAlign:"right",fontFamily:MONO,fontSize:11,flexShrink:0}}>{i+1}</span>
            {!disabled&&<span style={{color:DIM,fontSize:12,flexShrink:0,userSelect:"none"}}>::</span>}
            <span style={{flex:1,color:TEXT,userSelect:"none"}}>{item}</span>
            {!disabled&&(
              <>
                <button onClick={()=>move(i,-1)} disabled={i===0}
                  style={{background:"none",border:"none",color:i===0?BORDER2:MUTED,cursor:i===0?"default":"pointer",fontSize:18,padding:"0 6px",minWidth:36,minHeight:36}}>↑</button>
                <button onClick={()=>move(i,1)} disabled={i===items.length-1}
                  style={{background:"none",border:"none",color:i===items.length-1?BORDER2:MUTED,cursor:i===items.length-1?"default":"pointer",fontSize:18,padding:"0 6px",minWidth:36,minHeight:36}}>↓</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PICK LIST ────────────────────────────────────────────────────────────────
function PickList({all=[],selected=[],onChange,max,disabled}){
  const [dragIdx,setDragIdx]=useState(null);
  const [overIdx,setOverIdx]=useState(null);
  function toggle(item){
    if(disabled) return;
    if(selected.includes(item)) onChange(selected.filter(x=>x!==item));
    else if(selected.length<max) onChange([...selected,item]);
  }
  function hDS(e,i){setDragIdx(i);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(i));}
  function hDO(e,i){e.preventDefault();e.dataTransfer.dropEffect="move";setOverIdx(i);}
  function hDrop(e,i){
    e.preventDefault();
    if(dragIdx===null||dragIdx===i){setDragIdx(null);setOverIdx(null);return;}
    const n=[...selected];const[m]=n.splice(dragIdx,1);n.splice(i,0,m);onChange(n);
    setDragIdx(null);setOverIdx(null);
  }
  function hDE(){setDragIdx(null);setOverIdx(null);}
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div>
        <div style={{fontSize:10,color:MUTED,marginBottom:4,fontFamily:MONO}}>{selected.length}/{max} SELECTED</div>
        <div style={{border:"1px solid "+BORDER,borderRadius:4,minHeight:36}}>
          {selected.length===0&&<div style={{padding:"10px",color:DIM,fontSize:12}}>None selected</div>}
          {selected.map((item,i)=>{
            const isDragging=dragIdx===i;
            const isOver=overIdx===i&&dragIdx!==null&&dragIdx!==i;
            const borderTop=isOver&&dragIdx>i?"2px solid "+ACCENT:"2px solid transparent";
            const borderBottom=isOver&&dragIdx<i?"2px solid "+ACCENT:i<selected.length-1?"1px solid "+BORDER:"none";
            return(
              <div key={item} draggable={!disabled}
                onDragStart={disabled?undefined:(e)=>hDS(e,i)}
                onDragOver={disabled?undefined:(e)=>hDO(e,i)}
                onDrop={disabled?undefined:(e)=>hDrop(e,i)}
                onDragEnd={disabled?undefined:hDE}
                style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderTop,borderBottom,background:isDragging?"#0a2a0a":"#0a1a0a",opacity:isDragging?0.4:1,cursor:disabled?"default":"grab",minHeight:44}}>
                <span style={{color:DIM,width:16,fontSize:11,fontFamily:MONO,flexShrink:0}}>{i+1}</span>
                {!disabled&&<span style={{color:DIM,fontSize:12,flexShrink:0,userSelect:"none"}}>::</span>}
                <span style={{flex:1,fontSize:13,color:TEXT,userSelect:"none"}}>{item}</span>
                {!disabled&&<button onClick={()=>toggle(item)} style={{background:"none",border:"none",color:"#e55",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 6px",minWidth:36,minHeight:36}}>×</button>}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:MUTED,marginBottom:4,fontFamily:MONO}}>AVAILABLE</div>
        <div style={{border:"1px solid "+BORDER,borderRadius:4,maxHeight:240,overflowY:"auto"}}>
          {all.filter(x=>!selected.includes(x)).map((item,i,arr)=>(
            <div key={item} onClick={()=>toggle(item)}
              style={{padding:"10px",fontSize:13,color:selected.length<max&&!disabled?"#aaa":DIM,cursor:selected.length<max&&!disabled?"pointer":"default",borderBottom:i<arr.length-1?"1px solid "+BORDER:"none",background:CARD,minHeight:44,display:"flex",alignItems:"center"}}>
              + {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateIn({value,onChange,disabled}){
  return <input type="date" value={value||""} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{background:INPUTBG,border:"1px solid "+BORDER2,color:TEXT,padding:"10px 12px",borderRadius:4,fontSize:14,fontFamily:MONO,outline:"none",width:"100%",maxWidth:260}}/>;
}
function NumIn({value,onChange,placeholder,disabled}){
  return <input type="number" value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} min={0}
    style={{background:INPUTBG,border:"1px solid "+BORDER2,color:TEXT,padding:"10px 12px",borderRadius:4,fontSize:14,fontFamily:MONO,outline:"none",width:140}}/>;
}
function Sel({value,options,onChange,disabled}){
  return(
    <select value={value||""} onChange={e=>onChange(e.target.value)} disabled={disabled}
      style={{background:INPUTBG,border:"1px solid "+BORDER2,color:value?TEXT:MUTED,padding:"10px 12px",borderRadius:4,fontSize:13,width:"100%",outline:"none"}}>
      <option value="">Select...</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── PREDICTION FORM ──────────────────────────────────────────────────────────
function PredForm({data,onChange,teams,drivers,preSeasonLocked,isMobile}){
  const dn=drivers.map(d=>d.name);
  function up(f,v){onChange({...data,[f]:v});}
  function upQ(q,f,v){onChange({...data,quarterly:{...data.quarterly,[q]:{...data.quarterly?.[q],[f]:v}}});}
  return(
    <div style={{color:TEXT,paddingBottom:60}}>
      <div style={{padding:"8px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,marginBottom:4,fontSize:11,color:"#8888cc",fontFamily:MONO,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
        <span>PRE-SEASON — Lock before Race 1 - Australian GP (Mar 8, 2026)</span>
        {preSeasonLocked&&<span style={{color:"#e8a060"}}>LOCKED</span>}
      </div>
      <Sec title="Constructors Championship" sub="Final ranking at end of 2026 season" pts="MAX 220 PTS"/>
      <RankList items={data.constructorsRanking||[...teams]} onChange={v=>up("constructorsRanking",v)} disabled={preSeasonLocked}/>
      <Sec title="Drivers Championship" sub="Final ranking at end of 2026 season" pts="MAX 220 PTS"/>
      <RankList items={data.driversRanking||[...dn]} onChange={v=>up("driversRanking",v)} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Constructors Clinch Date" sub={"Date the constructors championship is clinched — season runs "+SEASON_DATES} pts="MAX 35 PTS"/>
      <DateIn value={data.constructorsClinchDate} onChange={v=>up("constructorsClinchDate",v)} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Drivers Clinch Date" sub={"Date the drivers championship is clinched — season runs "+SEASON_DATES} pts="MAX 35 PTS"/>
      <DateIn value={data.driversClinchDate} onChange={v=>up("driversClinchDate",v)} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Departures" sub="First 5 drivers to leave F1 in 2026, in order." pts="MAX 35 PTS"/>
      <PickList all={dn} selected={data.departures||[]} onChange={v=>up("departures",v)} max={5} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Head to Head" sub="Which driver wins within each team across the season" pts="MAX 55 PTS"/>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
        {teams.map(tm=>{
          const opts=drivers.filter(d=>d.team===tm).map(d=>d.name);
          return(
            <div key={tm} style={{background:CARD,padding:"10px",borderRadius:4,border:"1px solid "+BORDER}}>
              <div style={{fontSize:10,color:MUTED,marginBottom:6,fontFamily:MONO}}>{tm}</div>
              <Sel value={data.headToHead?.[tm]||""} options={opts} onChange={v=>up("headToHead",{...data.headToHead,[tm]:v})} disabled={preSeasonLocked}/>
            </div>
          );
        })}
      </div>
      <Sec title="Bonus: Top 3 Win Leaders" sub="Three drivers with most race wins (any order). 15 pts each." pts="MAX 45 PTS"/>
      <PickList all={dn} selected={data.topWins||[]} onChange={v=>up("topWins",v)} max={3} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Biggest Team Improvement" sub="Rank teams 1-11 by improvement (1 = most improved)." pts="MAX 20 PTS"/>
      <RankList items={data.biggestImprovement||[...teams]} onChange={v=>up("biggestImprovement",v)} disabled={preSeasonLocked}/>
      <Sec title="Tiebreaker: Safety Cars" sub="Total safety car deployments across the 2026 season" pts="TIEBREAKER"/>
      <NumIn value={data.safetyCarGuess} onChange={v=>up("safetyCarGuess",v)} placeholder="e.g. 28" disabled={preSeasonLocked}/>
      {QUARTERS.map(q=>{
        const qLocked=data.quarterly?.[q]?.locked;
        const qDrivers=reconcileDrivers(data.quarterly?.[q]?.drivers,dn);
        const qConstructors=data.quarterly?.[q]?.constructors||[...teams];
        function copyFromPreSeason(){
          onChange({...data,quarterly:{...data.quarterly,[q]:{...data.quarterly?.[q],constructors:[...(data.constructorsRanking||[...teams])],drivers:[...(data.driversRanking||[...dn])]}}});
        }
        return(
          <div key={q}>
            <div style={{marginTop:24,padding:"8px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,marginBottom:4,fontSize:11,color:"#8888cc",fontFamily:MONO,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
              <span>{q} — {Q_WHEN[q]}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {!qLocked&&<button onClick={copyFromPreSeason} style={{background:"none",border:"1px solid #1e1e3a",color:"#6666aa",padding:"4px 10px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:MONO,minHeight:32}}>COPY FROM PRE-SEASON</button>}
                {qLocked&&<span style={{color:"#e8a060"}}>LOCKED</span>}
              </div>
            </div>
            <Sec title={q+" — Constructors Standings"} sub={"Predicted order after "+Q_RACES[q]+" ("+Q_DATES[q]+")"} pts="MAX 44 PTS"/>
            <RankList items={qConstructors} onChange={v=>upQ(q,"constructors",v)} disabled={qLocked}/>
            <Sec title={q+" — Drivers Standings"} sub={"Predicted order after "+Q_RACES[q]+" ("+Q_DATES[q]+")"} pts="MAX 44 PTS"/>
            <RankList items={qDrivers} onChange={v=>upQ(q,"drivers",v)} disabled={qLocked}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── STANDINGS SYNC ───────────────────────────────────────────────────────────

function StandingsSync({data,onChange,teams,drivers}){
  const dn=drivers.map(d=>d.name);
  const [status,setStatus]=useState("idle");
  const [log,setLog]=useState("");
  const [preview,setPreview]=useState(null); // summary of what will be applied

  async function sync(){
    setStatus("loading");setLog("");
    try{
      const res=await fetch("/api/sync-standings");
      if(!res.ok) throw new Error("HTTP "+res.status);
      const parsed=await res.json();
      if(parsed.error) throw new Error(parsed.error);
      if(!parsed.final) throw new Error("Unexpected response shape");

      // Names coming from route are already canonical — just build ranked+ptsMap
      function extractSection(arr, canonical){
        if(!arr||!arr.length) return null;
        const entries=arr.filter(e=>canonical.includes(e.name));
        if(!entries.length||entries.every(e=>e.pts===0)) return null;
        const names=entries.map(e=>e.name);
        const missing=canonical.filter(n=>!names.includes(n));
        const ptsMap={};entries.forEach(e=>{ptsMap[e.name]=e.pts;});
        return{ranked:[...names,...missing],ptsMap};
      }

      const newData={...data};

      // Save current standings as prev before overwriting
      if(data.standingsPts){
        newData.prevStandingsPts=data.standingsPts;
      }
      const newPts={};

      // Final
      const fd=extractSection(parsed.final?.drivers,dn);
      const fc=extractSection(parsed.final?.constructors,teams);
      if(fd){newData.driversRanking=reconcileDrivers(fd.ranked,dn);newPts.finalDrivers=fd.ptsMap;}
      if(fc){newData.constructorsRanking=fc.ranked;newPts.finalConstructors=fc.ptsMap;}

      // Quarterly
      const newQuarterly={...data.quarterly};
      const appliedQuarters=[];
      const skippedQuarters=[];
      QUARTERS.forEach(q=>{
        const qData=parsed[q];
        const qd=extractSection(qData?.drivers,dn);
        const qc=extractSection(qData?.constructors,teams);
        if(qd&&qc){
          newQuarterly[q]={...newQuarterly[q],hasData:true,drivers:reconcileDrivers(qd.ranked,dn),constructors:qc.ranked};
          newPts[q+"Drivers"]=qd.ptsMap;
          newPts[q+"Constructors"]=qc.ptsMap;
          appliedQuarters.push(q);
        } else {
          skippedQuarters.push(q);
        }
      });
      newData.quarterly=newQuarterly;
      newData.standingsPts={...data.standingsPts,...newPts};

      // Q1 snapshot — lock once Q2 data arrives
      const q1Constructors=newQuarterly.Q1?.hasData?newQuarterly.Q1.constructors:null;
      const q2HasData=newQuarterly.Q2?.hasData;
      if(q1Constructors&&q2HasData&&!data.q1Snapshot){
        newData.q1Snapshot=q1Constructors;
      }

      // Most improved — compare current final vs Q1 snapshot
      const baseline=newData.q1Snapshot||data.q1Snapshot;
      const currentStandings=newData.constructorsRanking;
      if(baseline&&currentStandings&&q2HasData){
        let bestTeam=null,bestGain=-Infinity,bestQ1Pos=-1;
        teams.forEach(tm=>{
          const q1Pos=baseline.indexOf(tm);
          const curPos=currentStandings.indexOf(tm);
          if(q1Pos===-1||curPos===-1) return;
          const gain=q1Pos-curPos;
          if(gain>bestGain||(gain===bestGain&&q1Pos>bestQ1Pos)){
            bestGain=gain;bestTeam=tm;bestQ1Pos=q1Pos;
          }
        });
        if(bestTeam) newData.biggestImprovement=bestTeam;
      }

      // H2H — names already canonical from route
      if(parsed.headToHead){
        const newH2H={...data.headToHead};
        Object.entries(parsed.headToHead).forEach(([team,winner])=>{
          if(winner&&dn.includes(winner)) newH2H[team]=winner;
        });
        newData.headToHead=newH2H;
      }

      // Store full per-race data for the Standings Chart
      if(parsed.raceData) newData.raceData=parsed.raceData;

      onChange(newData);

      const h2hCount=parsed.headToHead?Object.values(parsed.headToHead).filter(Boolean).length:0;
      const improvedMsg=newData.biggestImprovement?" + Most Improved ("+newData.biggestImprovement+")":"";
      const snapshotMsg=newData.q1Snapshot&&!data.q1Snapshot?" + Q1 snapshot locked":"";
      const msg="Applied: Final"+(appliedQuarters.length?" + "+appliedQuarters.join(", "):"")+(h2hCount?" + H2H ("+h2hCount+"/11)":"")+improvedMsg+snapshotMsg+(skippedQuarters.length?" | Skipped: "+skippedQuarters.join(", "):"");
      setLog(msg);
      setStatus("done");
    }catch(e){
      setStatus("error");setLog("Error: "+e.message);
    }
  }

  return(
    <div style={{marginBottom:24,padding:"14px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6}}>
      <div style={{fontSize:11,color:"#8888cc",fontFamily:MONO,marginBottom:10,letterSpacing:"0.06em"}}>SYNC STANDINGS FROM THE-RACE.COM</div>
      <div style={{fontSize:11,color:MUTED,fontFamily:MONO,marginBottom:12,lineHeight:1.6}}>
        Fetches live points and updates all standings. Quarterly sections score independently using only races in that range — partial data scores immediately. H2H updates based on current season totals.
      </div>
      <button onClick={sync} disabled={status==="loading"}
        style={{background:status==="loading"?"#1a1a2a":ACCENT,border:"none",color:"#fff",padding:"10px 18px",borderRadius:4,cursor:status==="loading"?"default":"pointer",fontSize:12,fontFamily:MONO,minHeight:44,opacity:status==="loading"?0.7:1}}>
        {status==="loading"?"FETCHING...":"SYNC ALL STANDINGS"}
      </button>
      {status==="loading"&&<div style={{fontSize:11,color:MUTED,fontFamily:MONO,marginTop:8}}>Fetching live data, this takes ~10 seconds...</div>}
      {status==="error"&&<div style={{fontSize:11,color:"#cc4444",fontFamily:MONO,marginTop:8}}>{log}</div>}
      {status==="done"&&<div style={{fontSize:11,color:"#4a8a4a",fontFamily:MONO,marginTop:8}}>{log}</div>}
    </div>
  );
}

// ─── STANDINGS TABLE (Results display with pts + delta) ───────────────────────
function StandingsTable({items,ptsMap,prevPtsMap,onChange,q1Snapshot,showImprovement}){
  // delta = change in pts from prev sync (not position change)
  function delta(name){
    if(!ptsMap||!prevPtsMap) return null;
    const cur=ptsMap[name]??0;
    const prev=prevPtsMap[name]??0;
    return cur-prev;
  }
  // position change vs Q1 snapshot (for improvement column)
  function posChange(name){
    if(!q1Snapshot||!items) return null;
    const q1Pos=q1Snapshot.indexOf(name);
    const curPos=items.indexOf(name);
    if(q1Pos===-1||curPos===-1) return null;
    return q1Pos-curPos; // positive = climbed
  }
  const hasData=ptsMap&&Object.values(ptsMap).some(v=>v>0);
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      <div style={{display:"grid",gridTemplateColumns:showImprovement?"28px 1fr 50px 44px 44px":"28px 1fr 50px 44px",padding:"5px 10px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2,fontSize:10,color:MUTED,fontFamily:MONO}}>
        <span>#</span><span>ENTRY</span>
        <span style={{textAlign:"right"}}>{showImprovement?"Q1":"PTS"}</span>
        <span style={{textAlign:"right"}}>{showImprovement?"NOW":"±"}</span>
        {showImprovement&&<span style={{textAlign:"right"}}>MOVE</span>}
      </div>
      {items.map((item,i)=>{
        const pts=ptsMap?.[item]??null;
        const d=delta(item);
        const pc=showImprovement?posChange(item):null;
        const dColor=d===null?DIM:d>0?"#4a8a4a":d<0?"#8a3a3a":MUTED;
        const pcColor=pc===null?DIM:pc>0?"#4a8a4a":pc<0?"#8a3a3a":MUTED;
        return(
          <div key={item} style={{display:"grid",gridTemplateColumns:showImprovement?"28px 1fr 50px 44px 44px":"28px 1fr 50px 44px",padding:"8px 10px",borderBottom:i<items.length-1?"1px solid "+BORDER:"none",background:i%2===0?CARD:"#0d0d0d",alignItems:"center"}}>
            <span style={{color:DIM,fontFamily:MONO,fontSize:10}}>{i+1}</span>
            <span style={{color:TEXT}}>{item}</span>
            <span style={{textAlign:"right",fontFamily:MONO,color:hasData?TEXT:DIM,fontSize:11}}>{pts!==null&&hasData?pts:"—"}</span>
            <span style={{textAlign:"right",fontFamily:MONO,color:dColor,fontSize:11}}>{d===null||!hasData?"—":d===0?"—":d>0?"+"+d:d}</span>
            {showImprovement&&<span style={{textAlign:"right",fontFamily:MONO,color:pcColor,fontSize:11}}>{pc===null?"—":pc===0?"—":pc>0?"▲"+pc:"▼"+Math.abs(pc)}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── RESULTS FORM ─────────────────────────────────────────────────────────────
function ResultsForm({data,onChange,teams,drivers,isMobile}){
  const dn=drivers.map(d=>d.name);
  function up(f,v){onChange({...data,[f]:v});}
  function upQ(q,f,v){onChange({...data,quarterly:{...data.quarterly,[q]:{...data.quarterly?.[q],[f]:v}}});}
  return(
    <div style={{color:TEXT,paddingBottom:60}}>
      <StandingsSync data={data} onChange={onChange} teams={teams} drivers={drivers}/>
      <Sec title="Final: Constructors Championship"/>
      <StandingsTable items={data.constructorsRanking||[...teams]} ptsMap={data.standingsPts?.finalConstructors} prevPtsMap={data.prevStandingsPts?.finalConstructors} onChange={v=>up("constructorsRanking",v)} q1Snapshot={data.q1Snapshot} showImprovement={!!data.q1Snapshot}/>
      <Sec title="Final: Drivers Championship"/>
      <StandingsTable items={data.driversRanking||[...dn]} ptsMap={data.standingsPts?.finalDrivers} prevPtsMap={data.prevStandingsPts?.finalDrivers} onChange={v=>up("driversRanking",v)}/>
      <Sec title="Bonus: Constructors Clinch Date" sub={"Season runs "+SEASON_DATES}/>
      <DateIn value={data.constructorsClinchDate} onChange={v=>up("constructorsClinchDate",v)}/>
      <Sec title="Bonus: Drivers Clinch Date" sub={"Season runs "+SEASON_DATES}/>
      <DateIn value={data.driversClinchDate} onChange={v=>up("driversClinchDate",v)}/>
      <Sec title="Bonus: Departures"/>
      <PickList all={dn} selected={data.departures||[]} onChange={v=>up("departures",v)} max={5} disabled={data.departuresConfirmed}/>
      <div style={{marginTop:10}}><ConfirmBtn confirmed={data.departuresConfirmed} onConfirm={()=>up("departuresConfirmed",true)} onUnconfirm={()=>up("departuresConfirmed",false)}/></div>
      <Sec title="Bonus: Head to Head Winners" sub="Auto-updated by sync. Manual override available."/>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
        {teams.map(tm=>{
          const opts=drivers.filter(d=>d.team===tm).map(d=>d.name);
          return(
            <div key={tm} style={{background:CARD,padding:"10px",borderRadius:4,border:"1px solid "+BORDER}}>
              <div style={{fontSize:10,color:MUTED,marginBottom:6,fontFamily:MONO}}>{tm}</div>
              <Sel value={data.headToHead?.[tm]||""} options={opts} onChange={v=>up("headToHead",{...data.headToHead,[tm]:v})}/>
            </div>
          );
        })}
      </div>
      <Sec title="Bonus: Top 3 Win Leaders"/>
      <PickList all={dn} selected={data.topWins||[]} onChange={v=>up("topWins",v)} max={3} disabled={data.winsConfirmed}/>
      <div style={{marginTop:10}}><ConfirmBtn confirmed={data.winsConfirmed} onConfirm={()=>up("winsConfirmed",true)} onUnconfirm={()=>up("winsConfirmed",false)}/></div>
      <Sec title="Bonus: Most Improved Team" sub="Q1 baseline vs current standings. Locked once Q2 data available."/>
      <div style={{padding:"12px",background:CARD,border:"1px solid "+BORDER,borderRadius:4,fontSize:12}}>
        {data.biggestImprovement&&data.q1Snapshot?(()=>{
          const q1Pos=data.q1Snapshot.indexOf(data.biggestImprovement)+1;
          const curPos=(data.constructorsRanking||[]).indexOf(data.biggestImprovement)+1;
          const move=q1Pos-curPos;
          return(
            <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center"}}>
              <span style={{color:TEXT,fontWeight:600}}>{data.biggestImprovement}</span>
              <span style={{color:MUTED,fontFamily:MONO,fontSize:11}}>P{q1Pos} → P{curPos}</span>
              <span style={{color:move>0?"#4a8a4a":move<0?"#8a3a3a":MUTED,fontFamily:MONO,fontWeight:700,fontSize:13}}>{move>0?"▲"+move:move<0?"▼"+Math.abs(move):"—"}</span>
            </div>
          );
        })()
        :data.biggestImprovement
          ?<span style={{color:TEXT}}>{data.biggestImprovement}</span>
          :<span style={{color:MUTED}}>Calculated automatically once Q2 races begin.</span>
        }
      </div>
      <Sec title="Tiebreaker: Safety Cars"/>
      <NumIn value={data.safetyCars} onChange={v=>up("safetyCars",v)} placeholder="actual count"/>
      {QUARTERS.map(q=>{
        const qDrivers=reconcileDrivers(data.quarterly?.[q]?.drivers,dn);
        const qConstructors=data.quarterly?.[q]?.constructors||[...teams];
        const hasData=data.quarterly?.[q]?.hasData;
        return(
          <div key={q}>
            <div style={{marginTop:24,padding:"8px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,marginBottom:4,fontSize:11,color:"#8888cc",fontFamily:MONO}}>
              <span>{q} RESULTS — {Q_RACES[q]} ({Q_DATES[q]})</span>
              {hasData&&<span style={{color:"#4a8a4a",marginLeft:8}}>LIVE</span>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><Lbl>Constructors</Lbl>
                <StandingsTable items={qConstructors} ptsMap={data.standingsPts?.[q+"Constructors"]} prevPtsMap={data.prevStandingsPts?.[q+"Constructors"]}/>
              </div>
              <div><Lbl>Drivers</Lbl>
                <StandingsTable items={qDrivers} ptsMap={data.standingsPts?.[q+"Drivers"]} prevPtsMap={data.prevStandingsPts?.[q+"Drivers"]}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPARISON COMPONENTS ────────────────────────────────────────────────────
function deltaColor(off){return off===0?GREEN:off<=2?YELLOW:RED;}

function RankCompare({predList,actualList,scoreFn,isMobile}){
  if(!actualList||!actualList.length) return <div style={{fontSize:12,color:MUTED,padding:"12px 0"}}>No confirmed results yet.</div>;
  return(
    <div style={{overflowX:"auto"}}>
      <div style={{minWidth:isMobile?280:400,border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
        <div style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 50px 44px",padding:"5px 10px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2,fontSize:10,color:MUTED,fontFamily:MONO}}>
          <span>#</span><span>ENTRY</span><span style={{textAlign:"right"}}>ACT</span><span style={{textAlign:"right"}}>OFF</span><span style={{textAlign:"right"}}>PTS</span>
        </div>
        {predList.map((item,pi)=>{
          const ai=actualList.indexOf(item);
          const off=ai===-1?null:Math.abs(pi-ai);
          const pts=off===null?0:scoreFn(off);
          const col=off===null?DIM:deltaColor(off);
          const sign=off===null?"":ai===pi?"+0":ai>pi?"+"+(ai-pi):""+(ai-pi);
          return(
            <div key={item} style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 50px 44px",padding:"7px 10px",borderBottom:pi<predList.length-1?"1px solid "+BORDER:"none",background:pi%2===0?CARD:"#0d0d0d",alignItems:"center"}}>
              <span style={{color:DIM,fontFamily:MONO,fontSize:10}}>{pi+1}</span>
              <span style={{color:TEXT,fontSize:12}}>{item}</span>
              <span style={{textAlign:"right",color:ai===-1?DIM:MUTED,fontFamily:MONO,fontSize:11}}>{ai===-1?"—":"#"+(ai+1)}</span>
              <span style={{textAlign:"right",color:col,fontFamily:MONO,fontSize:11,fontWeight:off===0?700:400}}>{off===null?"—":sign}</span>
              <span style={{textAlign:"right",color:pts>0?ACCENT:DIM,fontFamily:MONO,fontSize:11}}>{off===null?"—":pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClinchCompare({predDate,actualDate}){
  if(!actualDate) return <div style={{fontSize:12,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  const pts=scoreClinch(predDate,actualDate);
  const daysOff=predDate?Math.round(Math.abs((new Date(predDate)-new Date(actualDate))/864e5)):null;
  const col=daysOff===null?DIM:daysOff===0?GREEN:daysOff<=7?YELLOW:RED;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"12px",background:CARD,border:"1px solid "+BORDER,borderRadius:4,fontSize:12}}>
      <div><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>YOUR PICK</div><div style={{color:TEXT}}>{predDate||"—"}</div></div>
      <div><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>ACTUAL</div><div style={{color:TEXT}}>{actualDate}</div></div>
      <div><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>DAYS OFF</div><div style={{color:col,fontFamily:MONO,fontWeight:700}}>{daysOff===null?"—":daysOff===0?"exact":daysOff+" days"}</div></div>
      <div><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>PTS</div><div style={{color:pts>0?ACCENT:DIM,fontFamily:MONO,fontWeight:700,fontSize:16}}>{pts??0}</div></div>
    </div>
  );
}

function DepsCompare({predList,actualList,confirmed}){
  if(!confirmed||!actualList||!actualList.length) return <div style={{fontSize:12,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  const n=Math.min(5,actualList.length);
  const ppSlot=Math.round(35/n);
  return(
    <div style={{overflowX:"auto"}}>
      <div style={{minWidth:280,border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
        {predList.slice(0,n).map((drv,pi)=>{
          const ai=actualList.indexOf(drv);
          const off=ai===-1?null:Math.abs(pi-ai);
          const pts=ai===-1?0:Math.max(0,ppSlot-off);
          const col=off===null?DIM:deltaColor(off);
          const sign=off===null?"":ai===pi?"+0":ai>pi?"+"+(ai-pi):""+(ai-pi);
          return(
            <div key={pi} style={{display:"grid",gridTemplateColumns:"24px 1fr 50px 44px",padding:"8px 10px",borderBottom:pi<n-1?"1px solid "+BORDER:"none",background:pi%2===0?CARD:"#0d0d0d",alignItems:"center",gap:6}}>
              <span style={{color:DIM,fontFamily:MONO,fontSize:10}}>{pi+1}</span>
              <span style={{color:TEXT}}>{drv}</span>
              <span style={{textAlign:"right",color:col,fontFamily:MONO,fontSize:11,fontWeight:off===0?700:400}}>{off===null?"—":sign}</span>
              <span style={{textAlign:"right",color:pts>0?ACCENT:DIM,fontFamily:MONO,fontSize:11}}>{pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function H2HCompare({predMap,actualMap,confirmed,teams}){
  if(!confirmed||!actualMap||!Object.keys(actualMap).some(k=>actualMap[k])) return <div style={{fontSize:12,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      {teams.map((tm,i)=>{
        const pick=predMap?.[tm]||"—";
        const actual=actualMap?.[tm]||"—";
        const correct=pick===actual&&pick!=="—"&&actual!=="—";
        return(
          <div key={tm} style={{padding:"8px 10px",borderBottom:i<teams.length-1?"1px solid "+BORDER:"none",background:i%2===0?CARD:"#0d0d0d"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{color:MUTED,fontSize:10,fontFamily:MONO}}>{tm}</span>
              {actual!=="—"&&<span style={{fontSize:14,color:correct?GREEN:RED}}>{correct?"✓":"✗"}</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{color:DIM,fontSize:9,fontFamily:MONO,marginBottom:2}}>YOUR PICK</div><div style={{color:TEXT,fontSize:12}}>{pick}</div></div>
              <div><div style={{color:DIM,fontSize:9,fontFamily:MONO,marginBottom:2}}>ACTUAL</div><div style={{color:actual==="—"?DIM:TEXT,fontSize:12}}>{actual}</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WinsCompare({predList,actualList,confirmed}){
  if(!confirmed||!actualList||!actualList.length) return <div style={{fontSize:12,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      {predList.map((drv,i)=>{
        const hit=actualList.includes(drv);
        return(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 30px 44px",padding:"8px 10px",borderBottom:i<predList.length-1?"1px solid "+BORDER:"none",background:i%2===0?CARD:"#0d0d0d",alignItems:"center",gap:8}}>
            <span style={{color:TEXT}}>{drv}</span>
            <span style={{textAlign:"right",fontSize:14,color:hit?GREEN:RED}}>{hit?"✓":"✗"}</span>
            <span style={{textAlign:"right",fontFamily:MONO,color:hit?ACCENT:DIM,fontSize:11}}>{hit?15:0}</span>
          </div>
        );
      })}
    </div>
  );
}

function ImproveCompare({predList,actual,confirmed}){
  if(!confirmed||!actual) return <div style={{fontSize:12,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  const pos=predList.indexOf(actual);
  const pts=scoreImprove(predList,actual);
  const col=pts>=16?GREEN:pts>=10?YELLOW:RED;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"12px",background:CARD,border:"1px solid "+BORDER,borderRadius:4,fontSize:12}}>
      <div style={{gridColumn:"1/-1"}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>MOST IMPROVED (ACTUAL)</div><div style={{color:TEXT,fontWeight:600,fontSize:14}}>{actual}</div></div>
      <div><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>YOUR PREDICTED RANK</div><div style={{color:col,fontFamily:MONO,fontWeight:700}}>#{pos===-1?"not ranked":pos+1}</div></div>
      <div><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:4}}>PTS</div><div style={{color:pts>0?ACCENT:DIM,fontFamily:MONO,fontSize:20,fontWeight:800}}>{pts}</div></div>
    </div>
  );
}

// ─── COMPARE PANEL ────────────────────────────────────────────────────────────
function ComparePanel({allPreds,results,players,teams,drivers,isMobile}){
  const [who,setWho]=useState(0);
  const preds=allPreds[who];
  const dn=drivers.map(d=>d.name);
  const [open,setOpen]=useState({});
  if(!preds||!results) return null;

  const sections=[
    {key:"con",label:"Constructors Ranking",confirmed:!!(results.constructorsRanking?.length),node:<RankCompare predList={preds.constructorsRanking||[...teams]} actualList={results.constructorsRanking||[]} scoreFn={scoreConRank} isMobile={isMobile}/>},
    {key:"drv",label:"Drivers Ranking",confirmed:!!(results.driversRanking?.length),node:<RankCompare predList={preds.driversRanking||[...dn]} actualList={results.driversRanking||[]} scoreFn={scoreDrvRank} isMobile={isMobile}/>},
    ...QUARTERS.flatMap(q=>[
      {key:"q"+q+"c",label:q+" Constructors",confirmed:!!results.quarterly?.[q]?.hasData,node:<RankCompare predList={preds.quarterly?.[q]?.constructors||[...teams]} actualList={results.quarterly?.[q]?.hasData?results.quarterly[q].constructors:[]} scoreFn={scoreQCon} isMobile={isMobile}/>},
      {key:"q"+q+"d",label:q+" Drivers",confirmed:!!results.quarterly?.[q]?.hasData,node:<RankCompare predList={reconcileDrivers(preds.quarterly?.[q]?.drivers,dn)} actualList={results.quarterly?.[q]?.hasData?results.quarterly[q].drivers:[]} scoreFn={scoreQDrv} isMobile={isMobile}/>},
    ]),
    {key:"ccon",label:"Constructors Clinch Date",confirmed:!!results.constructorsClinchDate,node:<ClinchCompare predDate={preds.constructorsClinchDate} actualDate={results.constructorsClinchDate}/>},
    {key:"cdrv",label:"Drivers Clinch Date",confirmed:!!results.driversClinchDate,node:<ClinchCompare predDate={preds.driversClinchDate} actualDate={results.driversClinchDate}/>},
    {key:"dep",label:"Driver Departures",confirmed:results.departuresConfirmed,node:<DepsCompare predList={preds.departures||[]} actualList={results.departures||[]} confirmed={results.departuresConfirmed}/>},
    {key:"h2h",label:"Head to Head",confirmed:!!(results.headToHead&&Object.values(results.headToHead).some(v=>v)),node:<H2HCompare predMap={preds.headToHead} actualMap={results.headToHead} confirmed={!!(results.headToHead&&Object.values(results.headToHead).some(v=>v))} teams={teams}/>},
    {key:"wins",label:"Top 3 Win Leaders",confirmed:results.winsConfirmed,node:<WinsCompare predList={preds.topWins||[]} actualList={results.topWins||[]} confirmed={results.winsConfirmed}/>},
    {key:"imp",label:"Biggest Team Improvement",confirmed:!!results.biggestImprovement,node:<ImproveCompare predList={preds.biggestImprovement||[...teams]} actual={results.biggestImprovement} confirmed={!!results.biggestImprovement}/>},
  ];

  return(
    <div style={{marginTop:16,border:"1px solid "+BORDER2,borderRadius:6,overflow:"hidden"}}>
      <div style={{padding:"10px 12px",background:"#0a0a14",borderBottom:"1px solid #1e1e3a"}}>
        <div style={{fontSize:10,color:"#8888cc",fontFamily:MONO,marginBottom:8}}>BREAKDOWN FOR</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {players.map((name,i)=>(
            <button key={i} onClick={()=>setWho(i)}
              style={{background:who===i?ACCENT:CARD,border:"1px solid "+(who===i?ACCENT:BORDER2),color:"#fff",padding:"6px 14px",borderRadius:3,cursor:"pointer",fontSize:11,fontFamily:MONO,minHeight:36}}>
              {shortName(name)}
            </button>
          ))}
        </div>
      </div>
      {sections.map(s=>(
        <div key={s.key} style={{borderBottom:"1px solid "+BORDER}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:CARD,cursor:"pointer",minHeight:48}}
            onClick={()=>setOpen(o=>({...o,[s.key]:!o[s.key]}))}>
            <span style={{fontSize:13,color:s.confirmed?TEXT:MUTED}}>{s.label}</span>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {!s.confirmed&&<Tag color={DIM}>PENDING</Tag>}
              <span style={{color:MUTED,fontSize:16}}>{open[s.key]?"▾":"▸"}</span>
            </div>
          </div>
          {open[s.key]&&<div style={{padding:"12px",background:BG}}>{s.node}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function Leaderboard({allPreds,results,players,teams,drivers,isMobile}){
  const computedResults=buildResultsFromRaceData(results);
  const scores=allPreds.map(p=>calcAllScores(p,computedResults));
  const [expanded,setExpanded]=useState({});
  const [showCompare,setShowCompare]=useState(false);
  const anyResults=scores.some(s=>s.total>0);
  const maxTotal=Math.max(...scores.map(s=>s.total),1);
  const now=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  const catLabel={
    constructorsRanking:"Constructors Ranking",driversRanking:"Drivers Ranking",
    constructorsClinch:"Constructors Clinch Date",driversClinch:"Drivers Clinch Date",
    departures:"Driver Departures",headToHead:"Head to Head",
    topWins:"Top 3 Win Leaders",biggestImprovement:"Biggest Improvement"
  };

  // On mobile: show one score card at a time in a carousel-like paginator
  const [cardIdx,setCardIdx]=useState(0);
  const sorted=[...scores.map((s,i)=>({s,i,rank:scores.filter(x=>x.total>s.total).length+1}))].sort((a,b)=>b.s.total-a.s.total);

  // Column grid — on mobile use a horizontally scrollable table
  const colGrid="1fr "+players.map(()=>"52px").join(" ");

  function ScoreRow({label,vals,indent}){
    const pad=indent?"4px 16px":"6px 10px";
    const rowBg=indent?BG:CARD;
    const maxV=Math.max(...vals.filter(v=>v!==null));
    return(
      <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:pad,borderBottom:"1px solid "+BORDER,background:rowBg}}>
        <span style={{color:indent?MUTED:TEXT,fontSize:11}}>{label}</span>
        {vals.map((v,i)=>{
          const isTop=v!==null&&v===maxV&&v>0;
          return <span key={i} style={{textAlign:"right",fontFamily:MONO,color:v===null?"#333":isTop?ACCENT:MUTED,fontSize:11}}>{v!==null?v:"—"}</span>;
        })}
      </div>
    );
  }

  return(
    <div>
      <div style={{marginBottom:12,padding:"8px 12px",background:"#0a0a0a",border:"1px solid "+BORDER2,borderRadius:6,fontSize:10,color:MUTED,fontFamily:MONO}}>
        Standings as of {now} — confirmed results only
      </div>
      {!anyResults&&(
        <div style={{padding:"10px 12px",background:"#0a0a0a",border:"1px solid "+BORDER,borderRadius:6,fontSize:12,color:MUTED,fontFamily:MONO,marginBottom:16}}>
          No results confirmed yet.
        </div>
      )}

      {/* Score cards — 2×2 on mobile */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4, 1fr)",gap:isMobile?8:12,marginBottom:20}}>
        {sorted.map(({s,i,rank})=>(
          <div key={i} style={{background:CARD,border:"1px solid "+(rank===1&&anyResults?ACCENT:BORDER),borderRadius:6,padding:isMobile?12:16,textAlign:"center"}}>
            {anyResults&&<div style={{fontSize:10,color:rank===1?ACCENT:DIM,fontFamily:MONO,marginBottom:2}}>{"#"+rank}</div>}
            <div style={{fontSize:isMobile?10:10,color:MUTED,fontFamily:MONO,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shortName(players[i])}</div>
            <div style={{fontSize:isMobile?28:32,fontWeight:800,color:anyResults?ACCENT:DIM,fontFamily:MONO,lineHeight:1}}>{s.total}</div>
            <div style={{fontSize:9,color:MUTED,marginTop:2}}>pts</div>
            <div style={{marginTop:8,height:3,background:BORDER,borderRadius:2}}>
              <div style={{height:"100%",background:anyResults?ACCENT:DIM,borderRadius:2,width:anyResults?((s.total/maxTotal)*100)+"%":"0%",transition:"width 0.6s ease"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Score table — horizontally scrollable on mobile */}
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{minWidth:isMobile?340:500,border:"1px solid "+BORDER,borderRadius:6,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"8px 10px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2}}>
            <span style={{fontSize:10,color:MUTED,fontFamily:MONO}}>CATEGORY</span>
            {players.map((name,i)=><span key={i} style={{textAlign:"right",fontSize:10,color:MUTED,fontFamily:MONO,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shortName(name)}</span>)}
          </div>
          {Object.entries(catLabel).map(([k,lbl])=>(
            <ScoreRow key={k} label={lbl} vals={scores.map(s=>s.cats[k]??null)}/>
          ))}
          <div style={{background:"#0a0a0a",padding:"4px 10px 2px",borderBottom:"1px solid "+BORDER}}>
            <span style={{fontSize:10,color:MUTED,fontFamily:MONO}}>QUARTERLY</span>
          </div>
          {QUARTERS.map(q=>{
            const qVals=scores.map(s=>{
              const qc=s.cats.quarterly?.[q];
              const hasData=qc?.constructors!==null||qc?.drivers!==null;
              return hasData?((qc?.constructors??0)+(qc?.drivers??0)):null;
            });
            const hasAny=qVals.some(v=>v!==null);
            return(
              <div key={q}>
                <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"7px 10px",borderBottom:"1px solid "+BORDER,background:CARD,cursor:"pointer"}}
                  onClick={()=>setExpanded(e=>({...e,[q]:!e[q]}))}>
                  <span style={{color:hasAny?TEXT:DIM,fontSize:11}}>{q+" "+(expanded[q]?"▾":"▸")}</span>
                  {qVals.map((v,i)=><span key={i} style={{textAlign:"right",fontFamily:MONO,fontSize:11,color:v!==null?ACCENT:"#333"}}>{v!==null?v:"—"}</span>)}
                </div>
                {expanded[q]&&(
                  <>
                    <ScoreRow label="Con." vals={scores.map(s=>s.cats.quarterly?.[q]?.constructors??null)} indent={true}/>
                    <ScoreRow label="Drv." vals={scores.map(s=>s.cats.quarterly?.[q]?.drivers??null)} indent={true}/>
                  </>
                )}
              </div>
            );
          })}
          <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"10px 10px",background:"#0a0a0a"}}>
            <span style={{fontSize:12,fontWeight:700,color:TEXT,fontFamily:MONO}}>TOTAL</span>
            {scores.map((s,i)=><span key={i} style={{textAlign:"right",fontSize:13,fontWeight:800,fontFamily:MONO,color:anyResults?ACCENT:DIM}}>{s.total}</span>)}
          </div>
        </div>
      </div>

      {anyResults&&scores.every(s=>s.total===scores[0].total)&&(
        <div style={{marginTop:12,padding:"10px 12px",background:"#1a0a00",border:"1px solid #6a2a00",borderRadius:6,fontSize:12,color:"#e8a060",lineHeight:1.5}}>
          ALL TIED — Tiebreaker: closest to actual safety car count.
          {" "}({players.map((n,i)=>shortName(n)+": "+(allPreds[i]?.safetyCarGuess||"??")).join(" | ")})
        </div>
      )}

      <div style={{marginTop:16}}>
        <button onClick={()=>setShowCompare(s=>!s)}
          style={{width:"100%",background:showCompare?"#0a0a14":CARD,border:"1px solid "+(showCompare?"#1e1e3a":BORDER2),color:showCompare?"#8888cc":MUTED,padding:"12px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:MONO,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",minHeight:48}}>
          <span>PREDICTION BREAKDOWN</span>
          <span style={{fontSize:16}}>{showCompare?"▾":"▸"}</span>
        </button>
        {showCompare&&<ComparePanel allPreds={allPreds} results={results} players={players} teams={teams} drivers={drivers} isMobile={isMobile}/>}
      </div>
    </div>
  );
}


// ─── STANDINGS CHART ──────────────────────────────────────────────────────────
function rankAtRace(entries,from,to,R){
  if(R<=from) return null;
  const end=Math.min(R,to+1);
  const ranked=entries
    .map(e=>({name:e.name,pts:e.racePts.slice(from,end).reduce((a,b)=>a+b,0)}))
    .sort((a,b)=>b.pts-a.pts);
  return ranked.some(e=>e.pts>0)?ranked:null;
}
function h2hAtRace(raceData,R){
  const driverPts={};
  raceData.drivers.forEach(e=>{
    driverPts[e.name]=e.racePts.slice(0,R).reduce((a,b)=>a+b,0);
  });
  const h2h={};
  for(const[team,[d1,d2]] of Object.entries(H2H_PAIRS)){
    const p1=driverPts[d1]??0,p2=driverPts[d2]??0;
    h2h[team]=(p1===0&&p2===0)?"":(p1>=p2?d1:d2);
  }
  return h2h;
}
function raceOccurred(raceData,R){
  const idx=R-1;
  return raceData.drivers.some(e=>e.racePts[idx]>0)||
         raceData.constructors.some(e=>e.racePts[idx]>0);
}
function buildResultsFromRaceData(results){
  const raceData=results?.raceData;
  if(!raceData) return results;
  let lastR=0;
  for(let R=1;R<=24;R++) if(raceOccurred(raceData,R)) lastR=R;
  if(!lastR) return results;
  const finalDrivers=rankAtRace(raceData.drivers,0,23,lastR);
  const finalConstructors=rankAtRace(raceData.constructors,0,23,lastR);
  const quarterly={};
  QUARTERS.forEach(q=>{
    const[from,to]=Q_IDX[q];
    const qDrv=rankAtRace(raceData.drivers,from,to,lastR);
    const qCon=rankAtRace(raceData.constructors,from,to,lastR);
    quarterly[q]={
      hasData:!!(qDrv&&qCon),
      drivers:qDrv?qDrv.map(d=>d.name):[],
      constructors:qCon?qCon.map(c=>c.name):[],
    };
  });
  return{
    ...results,
    constructorsRanking:finalConstructors?finalConstructors.map(c=>c.name):[],
    driversRanking:finalDrivers?finalDrivers.map(d=>d.name):[],
    quarterly,
    headToHead:h2hAtRace(raceData,lastR),
  };
}

function StandingsChart({allPreds,results,players,isMobile}){
  const raceData=results?.raceData;

  const snapshots=[];
  if(raceData){
    for(let R=1;R<=24;R++){
      if(!raceOccurred(raceData,R)) continue;
      const finalDrivers=rankAtRace(raceData.drivers,0,23,R);
      const finalConstructors=rankAtRace(raceData.constructors,0,23,R);
      if(!finalDrivers&&!finalConstructors) continue;
      const quarterly={};
      QUARTERS.forEach(q=>{
        const[from,to]=Q_IDX[q];
        const qDrv=rankAtRace(raceData.drivers,from,to,R);
        const qCon=rankAtRace(raceData.constructors,from,to,R);
        quarterly[q]={
          hasData:!!(qDrv&&qCon),
          drivers:qDrv?qDrv.map(d=>d.name):[],
          constructors:qCon?qCon.map(c=>c.name):[],
        };
      });
      const partialResults={
        ...results,
        constructorsRanking:finalConstructors?finalConstructors.map(c=>c.name):[],
        driversRanking:finalDrivers?finalDrivers.map(d=>d.name):[],
        quarterly,
        headToHead:h2hAtRace(raceData,R),
      };
      const scores=allPreds.map(p=>calcAllScores(p,partialResults).total);
      snapshots.push({race:R,scores});
    }
  }

  const W=680,H=300;
  const PAD={top:24,right:100,bottom:44,left:44};
  const cW=W-PAD.left-PAD.right;
  const cH=H-PAD.top-PAD.bottom;
  const maxScore=Math.max(...snapshots.flatMap(s=>s.scores),50);
  const yMax=Math.ceil((maxScore+40)/100)*100;
  const xPos=r=>PAD.left+((r-1)/23)*cW;
  const yPos=s=>PAD.top+cH-(s/yMax)*cH;
  const yTicks=[];
  for(let y=0;y<=yMax;y+=100) yTicks.push(y);

  const rawLabels=snapshots.length>0?allPreds.map((_,pi)=>({pi,y:yPos(snapshots[snapshots.length-1].scores[pi])})):[];
  rawLabels.sort((a,b)=>a.y-b.y);
  for(let i=1;i<rawLabels.length;i++){
    if(rawLabels[i].y-rawLabels[i-1].y<14) rawLabels[i].y=rawLabels[i-1].y+14;
  }
  const labelY={};
  rawLabels.forEach(l=>{labelY[l.pi]=l.y;});

  const colGrid="40px 1fr "+players.map(()=>"52px").join(" ");

  if(!raceData){
    return(
      <div style={{padding:"48px 24px",textAlign:"center",color:MUTED,fontFamily:MONO,fontSize:12,border:"1px solid "+BORDER,borderRadius:6}}>
        No race data yet. Go to Results and sync standings first.
      </div>
    );
  }
  if(snapshots.length===0){
    return(
      <div style={{padding:"48px 24px",textAlign:"center",color:MUTED,fontFamily:MONO,fontSize:12,border:"1px solid "+BORDER,borderRadius:6}}>
        Race data found but no scored races yet.
      </div>
    );
  }

  return(
    <div style={{color:TEXT,paddingBottom:60}}>
      <div style={{marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        {players.map((name,i)=>(
          <span key={i} style={{fontSize:11,fontFamily:MONO,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:16,height:2,background:PLAYER_COLORS[i],display:"inline-block",borderRadius:1,flexShrink:0}}/>
            <span style={{color:PLAYER_COLORS[i]}}>{shortName(name)}</span>
            <span style={{color:MUTED}}>{snapshots[snapshots.length-1].scores[i]} pts</span>
          </span>
        ))}
      </div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:24}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",minWidth:isMobile?420:"auto",display:"block"}}>
          {yTicks.map(y=>(
            <g key={y}>
              <line x1={PAD.left} x2={PAD.left+cW} y1={yPos(y)} y2={yPos(y)}
                stroke={y===0?BORDER2:BORDER} strokeWidth={y===0?1:0.5} strokeDasharray={y>0?"4,4":undefined}/>
              <text x={PAD.left-6} y={yPos(y)+4} textAnchor="end"
                fill={MUTED} fontSize={9} fontFamily="DM Mono,monospace">{y}</text>
            </g>
          ))}
          {RACE_CALENDAR.map(r=>{
            const x=xPos(r.r);
            const hasData=snapshots.some(s=>s.race===r.r);
            const showLabel=[1,4,8,13,16,20,24].includes(r.r);
            return(
              <g key={r.r}>
                {hasData&&<line x1={x} x2={x} y1={PAD.top} y2={PAD.top+cH} stroke="#1a1a1a" strokeWidth={1}/>}
                <line x1={x} x2={x} y1={PAD.top+cH} y2={PAD.top+cH+(hasData?6:3)}
                  stroke={hasData?TEXT:BORDER2} strokeWidth={hasData?1.5:0.5}/>
                {showLabel&&<text x={x} y={PAD.top+cH+16} textAnchor="middle"
                  fill={hasData?TEXT:DIM} fontSize={8} fontFamily="DM Mono,monospace">
                  {RACE_ABBR[r.r-1]}
                </text>}
                {hasData&&<text x={x} y={PAD.top+cH+28} textAnchor="middle"
                  fill={DIM} fontSize={7} fontFamily="DM Mono,monospace">R{r.r}</text>}
              </g>
            );
          })}
          {allPreds.map((_,pi)=>{
            const pts=snapshots.map(s=>({r:s.race,s:s.scores[pi]}));
            if(!pts.length) return null;
            const d=pts.map((p,i)=>`${i===0?"M":"L"}${xPos(p.r)},${yPos(p.s)}`).join(" ");
            return(
              <g key={pi}>
                <path d={d} fill="none" stroke={PLAYER_COLORS[pi]} strokeWidth={2.5}
                  strokeLinejoin="round" strokeLinecap="round"/>
                {pts.map(p=>(
                  <circle key={p.r} cx={xPos(p.r)} cy={yPos(p.s)} r={3.5}
                    fill={PLAYER_COLORS[pi]} stroke={BG} strokeWidth={1.5}/>
                ))}
              </g>
            );
          })}
          {allPreds.map((_,pi)=>{
            const ly=labelY[pi];
            if(ly===undefined) return null;
            const lastX=xPos(snapshots[snapshots.length-1].race);
            const dotY=yPos(snapshots[snapshots.length-1].scores[pi]);
            return(
              <g key={pi}>
                <line x1={lastX+4} x2={PAD.left+cW+6} y1={dotY} y2={ly+2}
                  stroke={PLAYER_COLORS[pi]} strokeWidth={0.75} strokeDasharray="2,2" opacity={0.4}/>
                <text x={PAD.left+cW+9} y={ly+4} fill={PLAYER_COLORS[pi]}
                  fontSize={10} fontFamily="DM Mono,monospace" fontWeight={700}>
                  {shortName(players[pi])}
                </text>
                <text x={PAD.left+cW+9} y={ly+15} fill={PLAYER_COLORS[pi]}
                  fontSize={9} fontFamily="DM Mono,monospace" opacity={0.8}>
                  {snapshots[snapshots.length-1].scores[pi]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:8,letterSpacing:"0.1em"}}>RACE BY RACE</div>
      <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"6px 12px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2,fontSize:9,color:MUTED,fontFamily:MONO}}>
          <span>#</span><span>RACE</span>
          {players.map((n,i)=><span key={i} style={{textAlign:"right",color:PLAYER_COLORS[i]}}>{shortName(n)}</span>)}
        </div>
        {snapshots.map((entry,idx,arr)=>{
          const race=RACE_CALENDAR.find(r=>r.r===entry.race);
          const prev=idx>0?arr[idx-1]:null;
          return(
            <div key={entry.race} style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"9px 12px",borderBottom:idx<arr.length-1?"1px solid "+BORDER:"none",background:idx%2===0?CARD:"#0d0d0d",alignItems:"center"}}>
              <span style={{color:DIM,fontFamily:MONO,fontSize:10}}>R{entry.race}</span>
              <span style={{color:TEXT,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{race?.name||"Race "+entry.race}</span>
              {entry.scores.map((s,pi)=>{
                const delta=prev?s-prev.scores[pi]:null;
                return(
                  <span key={pi} style={{textAlign:"right",fontFamily:MONO,fontSize:11,color:PLAYER_COLORS[pi],fontWeight:600}}>
                    {s}{delta!==null&&delta>0&&<span style={{color:"#4a8a4a",fontSize:9}}> +{delta}</span>}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RULES ────────────────────────────────────────────────────────────────────
function Rules({isMobile}){
  const block={marginBottom:20,padding:"14px",background:CARD,border:"1px solid "+BORDER,borderRadius:6};
  const h={fontSize:11,fontWeight:700,color:TEXT,fontFamily:MONO,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:"1px solid "+BORDER2};
  const row={display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BORDER,fontSize:12,gap:8};
  return(
    <div style={{color:TEXT,paddingBottom:60}}>
      <div style={{...block,background:"#0a0a14",border:"1px solid #1e1e3a"}}>
        <div style={{fontSize:13,fontWeight:700,color:ACCENT,fontFamily:MONO,marginBottom:8}}>F1 2026 PREDICTION LEAGUE</div>
        <div style={{fontSize:12,color:"#8888cc",lineHeight:1.8}}>
          <p style={{marginTop:0}}>Four players go head to head predicting the 2026 Formula 1 season across three scoring phases.</p>
          <p><span style={{color:TEXT,fontWeight:600}}>Pre-season</span> is your biggest swing — lock in your full constructors and drivers championship rankings before Race 1 and earn up to 440 points based on how close you land.</p>
          <p><span style={{color:TEXT,fontWeight:600}}>Quarterly standings</span> run across four race blocks throughout the season. With 88 points available per quarter across 24 races, this is where the standings shift race by race.</p>
          <p><span style={{color:TEXT,fontWeight:600}}>Bonus categories</span> reward getting the details right — championship clinch dates, head-to-head battles within each team, which drivers leave F1, the top win leaders, and which team improves the most. Worth up to 225 points combined.</p>
          <p style={{marginBottom:0}}>All predictions lock before they score and cannot be changed once locked. The player with the most points at the end of Abu Dhabi wins.</p>
        </div>
      </div>

      <div style={block}>
        <div style={h}>How to Play</div>
        {[
          ["1. Setup","Go to Setup and enter names for all four players."],
          ["2. Enter predictions","Each player fills in their own predictions before Race 1 - Australian GP (Mar 8)."],
          ["3. Lock pre-season","Each player locks using the LOCK PRE-SEASON button before Race 1 starts."],
          ["4. Quarterly updates","After each quarter ends, submit and lock next quarterly predictions before the next quarter begins."],
          ["5. Admin confirms results","After each scored event, the admin enters results in the Results tab and clicks CONFIRM. Scores only appear after confirmation."],
          ["6. Check the leaderboard","View standings and expand Prediction Breakdown to see category-by-category analysis."],
        ].map(([step,desc],i,arr)=>(
          <div key={step} style={{padding:"8px 0",borderBottom:i<arr.length-1?"1px solid "+BORDER:"none"}}>
            <div style={{color:ACCENT,fontFamily:MONO,fontSize:11,marginBottom:3}}>{step}</div>
            <div style={{color:MUTED,fontSize:12,lineHeight:1.5}}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={h}>Key Dates</div>
        {[
          ["Season start","Mar 8, 2026 — Australian GP"],
          ["Pre-season lock","Before Mar 8 — all pre-season and Q1 locked"],
          ["Q1 ends / Q2 lock","After May 24 (Race 7 - Canadian GP), before Jun 7 (Race 8 - Monaco GP)"],
          ["Q2 ends / Q3 lock","After Jul 26 (Race 13 - Hungarian GP), before Aug 23 (Race 14 - Dutch GP)"],
          ["Q3 ends / Q4 lock","After Oct 25 (Race 19 - United States GP), before Nov 1 (Race 20 - Mexico City GP)"],
          ["Season end","Dec 6, 2026 — Abu Dhabi GP"],
        ].map(([k,v])=>(
          <div key={k} style={{...row,flexDirection:isMobile?"column":"row",gap:isMobile?2:8}}>
            <span style={{color:MUTED,fontFamily:MONO,fontSize:11,flexShrink:0}}>{k}</span>
            <span style={{color:TEXT,fontSize:12}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={h}>Quarter Boundaries</div>
        {[["Q1","Races 1-7","Mar 8 - May 24","Australia to Canada"],["Q2","Races 8-13","Jun 7 - Jul 26","Monaco to Hungary"],["Q3","Races 14-19","Aug 23 - Oct 25","Dutch to United States"],["Q4","Races 20-24","Nov 1 - Dec 6","Mexico City to Abu Dhabi"]].map(([q,races,dates,gps])=>(
          <div key={q} style={{...row,flexDirection:"column",gap:2}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:ACCENT,fontFamily:MONO,fontSize:11}}>{q} — {races}</span>
              <span style={{color:MUTED,fontSize:11}}>{dates}</span>
            </div>
            <span style={{color:TEXT,fontSize:12}}>{gps}</span>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={h}>Full Race Calendar</div>
        {RACE_CALENDAR.map((race,i)=>{
          const q=race.r<=7?"Q1":race.r<=13?"Q2":race.r<=19?"Q3":"Q4";
          const qColor={Q1:"#2a4a2a",Q2:"#2a2a4a",Q3:"#4a3a1a",Q4:"#4a1a1a"};
          return(
            <div key={race.r} style={{display:"grid",gridTemplateColumns:"24px 1fr 50px 28px",gap:6,padding:"6px 0",borderBottom:i<RACE_CALENDAR.length-1?"1px solid "+BORDER:"none",alignItems:"center",fontSize:12}}>
              <span style={{color:DIM,fontFamily:MONO,fontSize:10,textAlign:"right"}}>{race.r}</span>
              <span style={{color:TEXT}}>{race.name}</span>
              <span style={{color:MUTED,textAlign:"right",fontSize:11}}>{race.date}</span>
              <span style={{background:qColor[q],color:TEXT,fontSize:9,fontFamily:MONO,padding:"2px 4px",borderRadius:2,textAlign:"center"}}>{q}</span>
            </div>
          );
        })}
      </div>

      <div style={block}>
        <div style={h}>Scoring — Pre-Season (~440 pts)</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
          <div>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>CONSTRUCTORS (11 entries, max 20 pts each)</div>
            {[["Exact","20"],["1 off","16"],["2 off","11"],["3 off","7"],["4-6 off","4"],["7+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BORDER,fontSize:12}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:isMobile?16:0}}>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>DRIVERS (22 entries, max 10 pts each)</div>
            {[["Exact","10"],["1-2 off","8"],["3-5 off","5"],["6-10 off","2"],["11+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BORDER,fontSize:12}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={block}>
        <div style={h}>Scoring — Quarterly (352 pts)</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
          <div>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>CONSTRUCTORS — 11 entries, max 4 pts</div>
            {[["Exact","4"],["1 off","3"],["2 off","2"],["3 off","1"],["4+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BORDER,fontSize:12}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:isMobile?16:0}}>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>DRIVERS — 22 entries, max 2 pts</div>
            {[["Exact","2"],["1-2 off","1"],["3+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BORDER,fontSize:12}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={block}>
        <div style={h}>Scoring — Bonus (~225 pts)</div>
        {[
          ["Constructors Clinch Date","35 pts","Exact: 35 | 2d: 30 | 5d: 25 | 1w: 20 | 2w: 16 | 3w: 12 | 1mo: 8 | 6w: 5 | 2mo: 2"],
          ["Drivers Clinch Date","35 pts","Same proximity tiers."],
          ["Driver Departures","35 pts","First 5 drivers to leave in order. 7 pts/slot minus 1 per position off."],
          ["Head to Head","55 pts","5 pts per correct intra-team pick, all 11 teams."],
          ["Top 3 Win Leaders","45 pts","15 pts per correct driver, any order."],
          ["Biggest Improvement","20 pts","20 minus (2 × your predicted rank for the actual winner)."],
        ].map(([k,pts,desc])=>(
          <div key={k} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+BORDER}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,gap:8}}>
              <span style={{fontSize:12,color:TEXT,fontWeight:600}}>{k}</span>
              <Tag color={ACCENT}>{pts}</Tag>
            </div>
            <div style={{fontSize:11,color:MUTED,lineHeight:1.6}}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={h}>General Rules</div>
        {[
          ["Locks","Pre-season predictions (including Q1) must be locked before Race 1 - Australian GP (Mar 8). Each quarter locks independently. Locked predictions cannot be changed."],
          ["Results","Admin confirms results in the Results tab. Scores only appear after confirmation. Results can be unconfirmed and corrected."],
          ["Driver changes","Mid-season replacements inherit the seat slot. H2H picks apply to whoever races in that seat all season."],
          ["Tiebreaker","Tied scores are broken by closest total safety car count prediction, submitted pre-season."],
          ["Team withdrawal","If a team withdraws entirely, the player with the lowest score at that point wins."],
        ].map(([k,v],i,arr)=>(
          <div key={k} style={{padding:"8px 0",borderBottom:i<arr.length-1?"1px solid "+BORDER:"none"}}>
            <div style={{color:TEXT,fontFamily:MONO,fontSize:11,marginBottom:3}}>{k}</div>
            <div style={{color:MUTED,fontSize:12,lineHeight:1.5}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function Setup({config,onSave,onReset}){
  const [names,setNames]=useState(config.playerNames||DEFAULT_PLAYER_NAMES);
  const [confirmReset,setConfirmReset]=useState(false);
  useEffect(()=>{setNames(config.playerNames||DEFAULT_PLAYER_NAMES);},[config.playerNames]);
  return(
    <div style={{paddingBottom:60}}>
      <Sec title="Player Names"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {Array.from({length:NUM_PLAYERS},(_,i)=>(
          <div key={i}>
            <Lbl>Player {i+1}</Lbl>
            <input value={names[i]||""} onChange={e=>{const n=[...names];n[i]=e.target.value;setNames(n);}}
              style={{background:INPUTBG,border:"1px solid "+BORDER2,color:TEXT,padding:"10px 12px",borderRadius:4,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
      </div>
      <button onClick={()=>onSave(names)} style={{marginTop:14,background:ACCENT,border:"none",color:"#fff",padding:"12px 24px",borderRadius:4,fontSize:13,cursor:"pointer",fontFamily:MONO,minHeight:44}}>
        SAVE NAMES
      </button>
      <div style={{marginTop:32,paddingTop:24,borderTop:"1px solid "+BORDER2}}>
        <div style={{fontSize:10,color:MUTED,fontFamily:MONO,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Danger Zone</div>
        {!confirmReset?(
          <button onClick={()=>setConfirmReset(true)} style={{background:"none",border:"1px solid #4a1a1a",color:"#cc4444",padding:"12px 18px",borderRadius:4,fontSize:12,cursor:"pointer",fontFamily:MONO,minHeight:44}}>RESET ALL DATA</button>
        ):(
          <div style={{padding:"14px",background:"#120808",border:"1px solid #6a2222",borderRadius:6}}>
            <div style={{fontSize:12,color:"#cc6666",marginBottom:14,lineHeight:1.5}}>This will erase all predictions, results, locks, and player names. Cannot be undone.</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>{onReset();setConfirmReset(false);}} style={{background:"#8a0000",border:"none",color:"#fff",padding:"12px 16px",borderRadius:4,fontSize:12,cursor:"pointer",fontFamily:MONO,minHeight:44}}>YES, RESET EVERYTHING</button>
              <button onClick={()=>setConfirmReset(false)} style={{background:"none",border:"1px solid "+BORDER2,color:MUTED,padding:"12px 16px",borderRadius:4,fontSize:12,cursor:"pointer",fontFamily:MONO,minHeight:44}}>CANCEL</button>
            </div>
          </div>
        )}
      </div>
      <div style={{marginTop:24,padding:"12px 14px",background:CARD,border:"1px solid "+BORDER,borderRadius:6,fontSize:11,color:MUTED,lineHeight:2}}>
        <div style={{color:TEXT,fontWeight:600,marginBottom:6,fontFamily:MONO,fontSize:10}}>2026 CALENDAR</div>
        <div>Q1: Races 1-7 — Mar 8 to May 24 (Australia to Canada)</div>
        <div>Q2: Races 8-13 — Jun 7 to Jul 26 (Monaco to Hungary)</div>
        <div>Q3: Races 14-19 — Aug 23 to Oct 25 (Dutch to United States)</div>
        <div>Q4: Races 20-24 — Nov 1 to Dec 6 (Mexico City to Abu Dhabi)</div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────────────────────
const NAV_TABS = ["Predictions","Leaderboard","Standings Chart","Rules","Setup","Results"];
const NAV_ICONS = {"Predictions":"⚑","Results":"✓","Leaderboard":"▲","Standings Chart":"◈","Rules":"≡","Setup":"⚙"};
const NAV_SHORT = {"Predictions":"Picks","Results":"Results","Leaderboard":"Scores","Standings Chart":"Chart","Rules":"Rules","Setup":"Setup"};

function BottomNav({active,onSelect}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#050505",borderTop:"1px solid "+BORDER2,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {NAV_TABS.map(t=>(
        <button key={t} onClick={()=>onSelect(t)}
          style={{flex:1,background:"none",border:"none",borderTop:t===active?"2px solid "+ACCENT:"2px solid transparent",color:t===active?TEXT:MUTED,padding:"8px 4px",cursor:"pointer",fontSize:9,fontFamily:MONO,letterSpacing:"0.04em",textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:52}}>
          <span style={{fontSize:16}}>{NAV_ICONS[t]}</span>
          <span>{NAV_SHORT[t]}</span>
        </button>
      ))}
    </div>
  );
}

function TopNav({active,onSelect}){
  return(
    <div style={{display:"flex",gap:1,marginBottom:24,borderBottom:"1px solid "+BORDER2,flexWrap:"wrap"}}>
      {NAV_TABS.map(t=>(
        <button key={t} onClick={()=>onSelect(t)}
          style={{background:"none",border:"none",borderBottom:t===active?"2px solid "+ACCENT:"2px solid transparent",color:t===active?TEXT:MUTED,padding:"8px 14px",cursor:"pointer",fontSize:11,fontFamily:MONO,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:-1}}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const PASSPHRASE = "f1brain2026";

function PassphraseGate({onUnlock}){
  const [val,setVal]=useState("");
  const [err,setErr]=useState(false);
  function attempt(){
    if(val.trim().toLowerCase()===PASSPHRASE){onUnlock();}
    else{setErr(true);setVal("");}
  }
  return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:340,padding:32,background:CARD,border:"1px solid "+BORDER2,borderRadius:8}}>
        <div style={{fontFamily:MONO,fontSize:14,fontWeight:700,color:ACCENT,letterSpacing:"0.12em",marginBottom:4}}>F1 PREDICT</div>
        <div style={{fontFamily:MONO,fontSize:10,color:MUTED,marginBottom:24}}>2026 SEASON</div>
        <div style={{fontSize:11,color:MUTED,fontFamily:MONO,marginBottom:8,letterSpacing:"0.06em"}}>PASSPHRASE</div>
        <input
          type="password"
          value={val}
          onChange={e=>{setVal(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&attempt()}
          autoFocus
          style={{background:INPUTBG,border:"1px solid "+(err?"#8a3a3a":BORDER2),color:TEXT,padding:"10px 12px",borderRadius:4,fontSize:14,fontFamily:MONO,outline:"none",width:"100%",boxSizing:"border-box",marginBottom:8}}
        />
        {err&&<div style={{fontSize:11,color:"#cc4444",fontFamily:MONO,marginBottom:8}}>Incorrect passphrase.</div>}
        <button onClick={attempt}
          style={{width:"100%",background:ACCENT,border:"none",color:"#fff",padding:"12px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:MONO,marginTop:4,minHeight:44}}>
          ENTER
        </button>
      </div>
    </div>
  );
}

export default function App(){
  const isMobile=useIsMobile(620);
  const [unlocked,setUnlocked]=useState(()=>localStorage.getItem("f1brain-auth")===PASSPHRASE);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("Predictions");
  const [predTab,setPredTab]=useState(0);
  const [config,setConfig]=useState({playerNames:[...DEFAULT_PLAYER_NAMES],teams:DEFAULT_TEAMS,drivers:DEFAULT_DRIVERS});
  const [allPreds,setAllPreds]=useState(Array(NUM_PLAYERS).fill(null));
  const [results,setResults]=useState(null);
  const [preLocked,setPreLocked]=useState(Array(NUM_PLAYERS).fill(false));
  const [saved,setSaved]=useState(false);
  const [showLocks,setShowLocks]=useState(false);

  async function loadAll(){
    try{
      const keys=["f1-config","f1-results",...Array.from({length:NUM_PLAYERS},(_,i)=>predKey(i)),...Array.from({length:NUM_PLAYERS},(_,i)=>lockKey(i))];
      const results_=await Promise.allSettled(keys.map(k=>db.get(k)));
      const get=(r)=>r.status==="fulfilled"&&r.value?JSON.parse(r.value.value):null;
      const cfg=get(results_[0])||{playerNames:[...DEFAULT_PLAYER_NAMES],teams:DEFAULT_TEAMS,drivers:DEFAULT_DRIVERS};
      const res=get(results_[1]);
      const drvs=cfg.drivers||DEFAULT_DRIVERS;
      const tms=cfg.teams||DEFAULT_TEAMS;
      setConfig(cfg);
      setResults(res||mkResults(tms,drvs));
      const preds=Array.from({length:NUM_PLAYERS},(_,i)=>{
        const raw=get(results_[2+i]);
        return patchPreds(raw||mkPreds(tms,drvs),tms,drvs);
      });
      setAllPreds(preds);
      const locks=Array.from({length:NUM_PLAYERS},(_,i)=>get(results_[2+NUM_PLAYERS+i])??false);
      setPreLocked(locks);
    }catch(e){
      const preds=Array.from({length:NUM_PLAYERS},()=>mkPreds(DEFAULT_TEAMS,DEFAULT_DRIVERS));
      setAllPreds(preds);
      setResults(mkResults(DEFAULT_TEAMS,DEFAULT_DRIVERS));
    }
  }

  useEffect(()=>{loadAll().then(()=>setLoading(false));}, []);

  async function save(key,val){
    try{await db.set(key,JSON.stringify(val));}catch(e){}
    setSaved(true);setTimeout(()=>setSaved(false),1500);
  }
  async function handleReset(){
    for(const key of STORAGE_KEYS){try{await db.delete(key);}catch(e){}}
    const preds=Array.from({length:NUM_PLAYERS},()=>mkPreds(DEFAULT_TEAMS,DEFAULT_DRIVERS));
    setConfig({playerNames:[...DEFAULT_PLAYER_NAMES],teams:DEFAULT_TEAMS,drivers:DEFAULT_DRIVERS});
    setAllPreds(preds);setResults(mkResults(DEFAULT_TEAMS,DEFAULT_DRIVERS));
    setPreLocked(Array(NUM_PLAYERS).fill(false));
    setSaved(true);setTimeout(()=>setSaved(false),1500);
  }
  function handlePred(i,v){const next=[...allPreds];next[i]=v;setAllPreds(next);save(predKey(i),v);}
  function handleResults(v){setResults(v);save("f1-results",v);}
  function handleConfig(names){const nc={...config,playerNames:names};setConfig(nc);save("f1-config",nc);}
  function lockPreSeason(i){const next=[...preLocked];next[i]=true;setPreLocked(next);save(lockKey(i),true);}
  function lockQuarter(i,q){
    const updated={...allPreds[i],quarterly:{...allPreds[i].quarterly,[q]:{...allPreds[i].quarterly?.[q],locked:true}}};
    handlePred(i,updated);
  }

  const currentPred=allPreds[predTab];
  const currentLocked=preLocked[predTab];

if(!unlocked) return <PassphraseGate onUnlock={()=>{localStorage.setItem("f1brain-auth",PASSPHRASE);setUnlocked(true);}}/>;
  if(loading) return <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:MUTED,fontFamily:MONO}}>LOADING...</div>;

  const headerPad=isMobile?"10px 14px":"14px 24px";

  return(
    <div style={{background:BG,minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:TEXT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;} input,select{color-scheme:dark;} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:#0a0a0a;} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}"}</style>

      {/* Header */}
      <div style={{borderBottom:"1px solid "+BORDER,padding:headerPad,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#050505",position:"sticky",top:0,zIndex:50}}>
        <div>
          <span style={{fontFamily:MONO,fontSize:isMobile?12:13,fontWeight:700,color:ACCENT,letterSpacing:"0.12em"}}>F1 PREDICT</span>
          <span style={{fontFamily:MONO,fontSize:10,color:MUTED,marginLeft:10,letterSpacing:"0.08em"}}>2026</span>
        </div>
        <div style={{display:"flex",gap:isMobile?8:16,alignItems:"center"}}>
          {saved&&<span style={{fontFamily:MONO,fontSize:10,color:"#4a8a4a"}}>SAVED</span>}
          {!isMobile&&<span style={{fontFamily:MONO,fontSize:10,color:MUTED}}>nick.raynor@proton.me</span>}
          {!isMobile&&<a href="https://discord.com/users/199650499308290051" target="_blank" rel="noreferrer" style={{fontFamily:MONO,fontSize:10,color:MUTED,textDecoration:"none"}}>Discord</a>}
        </div>
      </div>

      {/* Main content */}
      <div style={{maxWidth:960,margin:"0 auto",padding:isMobile?"14px 12px":"24px",paddingBottom:isMobile?80:24}}>
        {!isMobile&&<TopNav active={tab} onSelect={setTab}/>}

        {tab==="Rules"&&<Rules isMobile={isMobile}/>}
        {tab==="Setup"&&<Setup config={config} onSave={handleConfig} onReset={handleReset}/>}

        {tab==="Predictions"&&currentPred&&(
          <div>
            {/* Player selector */}
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:10}}>
              <div style={{display:"flex",gap:6,minWidth:"max-content",paddingBottom:2}}>
                {config.playerNames.map((name,i)=>(
                  <button key={i} onClick={()=>setPredTab(i)}
                    style={{background:predTab===i?ACCENT:CARD,border:"1px solid "+(predTab===i?ACCENT:BORDER),color:"#fff",padding:"8px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:MONO,whiteSpace:"nowrap",minHeight:40}}>
                    {isMobile?shortName(name):name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lock controls — collapsible on mobile */}
            {isMobile?(
              <div style={{marginBottom:12}}>
                <button onClick={()=>setShowLocks(s=>!s)}
                  style={{width:"100%",background:CARD,border:"1px solid "+BORDER2,color:MUTED,padding:"8px 12px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:MONO,textAlign:"left",display:"flex",justifyContent:"space-between"}}>
                  <span>LOCK CONTROLS</span>
                  <span>{showLocks?"▾":"▸"}</span>
                </button>
                {showLocks&&(
                  <div style={{background:"#0a0a0a",border:"1px solid "+BORDER,borderTop:"none",borderRadius:"0 0 4px 4px",padding:"10px 12px",display:"flex",gap:6,flexWrap:"wrap"}}>
                    {!currentLocked
                      ?<button onClick={()=>lockPreSeason(predTab)} style={{background:"none",border:"1px solid #6a2a00",color:"#e8a060",padding:"8px 12px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:MONO,minHeight:40}}>LOCK PRE-SEASON</button>
                      :<Tag color="#e8a060">PRE-SEASON LOCKED</Tag>
                    }
                    {QUARTERS.map(q=>{
                      const qLocked=currentPred.quarterly?.[q]?.locked;
                      return qLocked
                        ?<Tag key={q} color="#60a060">{q+" LOCKED"}</Tag>
                        :<button key={q} onClick={()=>lockQuarter(predTab,q)} style={{background:"none",border:"1px solid #2a4a2a",color:"#60a060",padding:"8px 10px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:MONO,minHeight:40}}>{"LOCK "+q}</button>;
                    })}
                  </div>
                )}
              </div>
            ):(
              <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{flex:1}}/>
                {!currentLocked
                  ?<button onClick={()=>lockPreSeason(predTab)} style={{background:"none",border:"1px solid #6a2a00",color:"#e8a060",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:MONO}}>LOCK PRE-SEASON</button>
                  :<Tag color="#e8a060">PRE-SEASON LOCKED</Tag>
                }
                {QUARTERS.map(q=>{
                  const qLocked=currentPred.quarterly?.[q]?.locked;
                  return qLocked
                    ?<Tag key={q} color="#60a060">{q+" LOCKED"}</Tag>
                    :<button key={q} onClick={()=>lockQuarter(predTab,q)} style={{background:"none",border:"1px solid #2a4a2a",color:"#60a060",padding:"6px 10px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:MONO}}>{"LOCK "+q}</button>;
                })}
              </div>
            )}

            <PredForm data={currentPred} onChange={v=>handlePred(predTab,v)} teams={config.teams} drivers={config.drivers} preSeasonLocked={currentLocked} isMobile={isMobile}/>
          </div>
        )}

        {tab==="Results"&&results&&(
          <div>
            <div style={{marginBottom:14,padding:"10px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,fontSize:11,color:"#8888cc",fontFamily:MONO,lineHeight:1.5}}>
              ADMIN — Confirm each category once results are final.
            </div>
            <ResultsForm data={results} onChange={handleResults} teams={config.teams} drivers={config.drivers} isMobile={isMobile}/>
          </div>
        )}

        {tab==="Leaderboard"&&(
          <Leaderboard allPreds={allPreds} results={results} players={config.playerNames} teams={config.teams} drivers={config.drivers} isMobile={isMobile}/>
        )}

        {tab==="Standings Chart"&&results&&(
          <StandingsChart allPreds={allPreds} results={results} players={config.playerNames} isMobile={isMobile}/>
        )}
      </div>

      {/* Bottom nav on mobile */}
      {isMobile&&<BottomNav active={tab} onSelect={setTab}/>}
    </div>
  );
}
