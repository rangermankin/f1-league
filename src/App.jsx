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

// Full 2026 race calendar
const RACE_CALENDAR = [
  {r:1,  name:"Australian GP",        circuit:"Albert Park Circuit, Melbourne",                date:"8 Mar"},
  {r:2,  name:"Chinese GP",           circuit:"Shanghai International Circuit",                date:"15 Mar"},
  {r:3,  name:"Japanese GP",          circuit:"Suzuka Circuit",                                date:"29 Mar"},
  {r:4,  name:"Bahrain GP",           circuit:"Bahrain International Circuit, Sakhir",         date:"12 Apr"},
  {r:5,  name:"Saudi Arabian GP",     circuit:"Jeddah Corniche Circuit",                       date:"19 Apr"},
  {r:6,  name:"Miami GP",             circuit:"Miami International Autodrome",                 date:"3 May"},
  {r:7,  name:"Canadian GP",          circuit:"Circuit Gilles Villeneuve, Montreal",           date:"24 May"},
  {r:8,  name:"Monaco GP",            circuit:"Circuit de Monaco",                             date:"7 Jun"},
  {r:9,  name:"Barcelona-Catalunya GP",circuit:"Circuit de Barcelona-Catalunya",               date:"14 Jun"},
  {r:10, name:"Austrian GP",          circuit:"Red Bull Ring, Spielberg",                      date:"28 Jun"},
  {r:11, name:"British GP",           circuit:"Silverstone Circuit",                           date:"5 Jul"},
  {r:12, name:"Belgian GP",           circuit:"Circuit de Spa-Francorchamps",                  date:"19 Jul"},
  {r:13, name:"Hungarian GP",         circuit:"Hungaroring, Mogyorod",                         date:"26 Jul"},
  {r:14, name:"Dutch GP",             circuit:"Circuit Zandvoort",                             date:"23 Aug"},
  {r:15, name:"Italian GP",           circuit:"Monza Circuit",                                 date:"6 Sep"},
  {r:16, name:"Spanish GP",           circuit:"Madring, Madrid",                               date:"13 Sep"},
  {r:17, name:"Azerbaijan GP",        circuit:"Baku City Circuit",                             date:"26 Sep"},
  {r:18, name:"Singapore GP",         circuit:"Marina Bay Street Circuit",                     date:"11 Oct"},
  {r:19, name:"United States GP",     circuit:"Circuit of the Americas, Austin TX",            date:"25 Oct"},
  {r:20, name:"Mexico City GP",       circuit:"Autodromo Hermanos Rodriguez",                  date:"1 Nov"},
  {r:21, name:"Sao Paulo GP",         circuit:"Interlagos Circuit",                            date:"8 Nov"},
  {r:22, name:"Las Vegas GP",         circuit:"Las Vegas Strip Circuit",                       date:"21 Nov"},
  {r:23, name:"Qatar GP",             circuit:"Lusail International Circuit",                  date:"29 Nov"},
  {r:24, name:"Abu Dhabi GP",         circuit:"Yas Marina Circuit",                            date:"6 Dec"},
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

// Storage keys
const predKey  = i => "f1-preds-"+i;
const lockKey  = i => "f1-prelocked-"+i;
const STORAGE_KEYS = ["f1-config","f1-results",...Array.from({length:NUM_PLAYERS},(_,i)=>predKey(i)),...Array.from({length:NUM_PLAYERS},(_,i)=>lockKey(i))];

// ─── SCORING ──────────────────────────────────────────────────────────────────
// Pre-season: 45% (~440 pts)
// Constructors 11×20=220, Drivers 22×10=220
const scoreConRank = d => d===0?20:d===1?16:d===2?11:d===3?7:d<=6?4:0;
const scoreDrvRank = d => d===0?10:d<=2?8:d<=5?5:d<=10?2:0;
// Quarterly: 35% (352 pts unchanged)
const scoreQCon = d => d===0?4:d===1?3:d===2?2:d===3?1:0;
const scoreQDrv = d => d===0?2:d<=2?1:0;
// Bonus: 20% (~205 pts)
// Clinch 35 each, Deps 35 (7/slot), H2H 55 (5/team), Wins 45 (15/driver), Improve 20

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
  c.constructorsRanking=results.constructorsConfirmed?calcRanking(preds.constructorsRanking,results.constructorsRanking,scoreConRank):null;
  c.driversRanking=results.driversConfirmed?calcRanking(preds.driversRanking,results.driversRanking,scoreDrvRank):null;
  c.quarterly={};
  QUARTERS.forEach(q=>{
    const ql=results.quarterly?.[q]?.locked;
    c.quarterly[q]={
      constructors:ql?calcRanking(preds.quarterly?.[q]?.constructors,results.quarterly?.[q]?.constructors||[],scoreQCon):null,
      drivers:ql?calcRanking(preds.quarterly?.[q]?.drivers,results.quarterly?.[q]?.drivers||[],scoreQDrv):null,
    };
  });
  c.constructorsClinch=results.constructorsClinchDate?scoreClinch(preds.constructorsClinchDate,results.constructorsClinchDate):null;
  c.driversClinch=results.driversClinchDate?scoreClinch(preds.driversClinchDate,results.driversClinchDate):null;
  c.departures=results.departuresConfirmed?scoreDeps(preds.departures,results.departures):null;
  c.headToHead=results.h2hConfirmed?scoreH2H(preds.headToHead,results.headToHead):null;
  c.topWins=results.winsConfirmed?scoreWins(preds.topWins,results.topWins):null;
  c.biggestImprovement=results.improvementConfirmed?scoreImprove(preds.biggestImprovement,results.biggestImprovement):null;
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
function shortName(name="",maxLen=8){
  const parts=name.split(" ");
  if(name.length<=maxLen) return name;
  return parts[0].slice(0,maxLen);
}

// ─── SMALL UI ─────────────────────────────────────────────────────────────────
function Tag({children,color}){
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:3,fontSize:10,fontFamily:MONO,letterSpacing:"0.08em",background:"#1a1a1a",color:color||MUTED,border:"1px solid "+BORDER2}}>{children}</span>;
}
function Sec({title,sub,pts}){
  return(
    <div style={{marginTop:28,marginBottom:14,paddingBottom:8,borderBottom:"1px solid "+BORDER2}}>
      <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:13,fontWeight:700,color:TEXT,fontFamily:MONO,letterSpacing:"0.04em",textTransform:"uppercase"}}>{title}</span>
        {pts&&<Tag color={ACCENT}>{pts}</Tag>}
      </div>
      {sub&&<div style={{fontSize:11,color:MUTED,marginTop:3}}>{sub}</div>}
    </div>
  );
}
function Lbl({children}){
  return <div style={{fontSize:10,color:MUTED,marginBottom:6,letterSpacing:"0.1em",fontFamily:MONO,textTransform:"uppercase"}}>{children}</div>;
}
function ConfirmBtn({confirmed,onConfirm,onUnconfirm}){
  if(confirmed) return <button onClick={onUnconfirm} style={{background:"none",border:"1px solid "+BORDER2,color:MUTED,padding:"4px 12px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:MONO}}>UNCONFIRM</button>;
  return <button onClick={onConfirm} style={{background:ACCENT,border:"none",color:"#fff",padding:"4px 12px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:MONO}}>CONFIRM RESULTS</button>;
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
    <div style={{border:"1px solid "+BORDER,borderRadius:4,maxHeight:440,overflowY:"auto",fontSize:12}}>
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
            style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderTop,borderBottom,background:rowBg,opacity:isDragging?0.4:disabled?0.6:1,cursor:disabled?"default":"grab",transition:"border-color 0.1s"}}>
            <span style={{color:DIM,width:20,textAlign:"right",fontFamily:MONO,fontSize:10,flexShrink:0}}>{i+1}</span>
            {!disabled&&<span style={{color:DIM,fontSize:11,flexShrink:0,userSelect:"none"}}>::</span>}
            <span style={{flex:1,color:TEXT,userSelect:"none"}}>{item}</span>
            {!disabled&&(
              <>
                <button onClick={()=>move(i,-1)} disabled={i===0} style={{background:"none",border:"none",color:i===0?BORDER2:MUTED,cursor:i===0?"default":"pointer",fontSize:13,padding:"0 3px"}}>↑</button>
                <button onClick={()=>move(i,1)} disabled={i===items.length-1} style={{background:"none",border:"none",color:i===items.length-1?BORDER2:MUTED,cursor:i===items.length-1?"default":"pointer",fontSize:13,padding:"0 3px"}}>↓</button>
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
    <div style={{display:"flex",gap:10}}>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:MUTED,marginBottom:4,fontFamily:MONO}}>{selected.length}/{max} SELECTED</div>
        <div style={{border:"1px solid "+BORDER,borderRadius:4,minHeight:36}}>
          {selected.length===0&&<div style={{padding:"8px 10px",color:DIM,fontSize:11}}>None selected</div>}
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
                style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderTop,borderBottom,background:isDragging?"#0a2a0a":"#0a1a0a",opacity:isDragging?0.4:1,cursor:disabled?"default":"grab"}}>
                <span style={{color:DIM,width:16,fontSize:10,fontFamily:MONO,flexShrink:0}}>{i+1}</span>
                {!disabled&&<span style={{color:DIM,fontSize:11,flexShrink:0,userSelect:"none"}}>::</span>}
                <span style={{flex:1,fontSize:12,color:TEXT,userSelect:"none"}}>{item}</span>
                {!disabled&&<button onClick={()=>toggle(item)} style={{background:"none",border:"none",color:"#e55",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px"}}>x</button>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:MUTED,marginBottom:4,fontFamily:MONO}}>AVAILABLE</div>
        <div style={{border:"1px solid "+BORDER,borderRadius:4,maxHeight:220,overflowY:"auto"}}>
          {all.filter(x=>!selected.includes(x)).map((item,i,arr)=>(
            <div key={item} onClick={()=>toggle(item)}
              style={{padding:"5px 8px",fontSize:12,color:selected.length<max&&!disabled?"#aaa":DIM,cursor:selected.length<max&&!disabled?"pointer":"default",borderBottom:i<arr.length-1?"1px solid "+BORDER:"none",background:CARD}}>
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
    style={{background:INPUTBG,border:"1px solid "+BORDER2,color:TEXT,padding:"7px 10px",borderRadius:4,fontSize:12,fontFamily:MONO,outline:"none"}}/>;
}
function NumIn({value,onChange,placeholder,disabled}){
  return <input type="number" value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} min={0}
    style={{background:INPUTBG,border:"1px solid "+BORDER2,color:TEXT,padding:"7px 10px",borderRadius:4,fontSize:12,fontFamily:MONO,outline:"none",width:120}}/>;
}
function Sel({value,options,onChange,disabled}){
  return(
    <select value={value||""} onChange={e=>onChange(e.target.value)} disabled={disabled}
      style={{background:INPUTBG,border:"1px solid "+BORDER2,color:value?TEXT:MUTED,padding:"7px 10px",borderRadius:4,fontSize:12,width:"100%",outline:"none"}}>
      <option value="">Select...</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── PREDICTION FORM ──────────────────────────────────────────────────────────
function PredForm({data,onChange,teams,drivers,preSeasonLocked}){
  const dn=drivers.map(d=>d.name);
  function up(f,v){onChange({...data,[f]:v});}
  function upQ(q,f,v){onChange({...data,quarterly:{...data.quarterly,[q]:{...data.quarterly?.[q],[f]:v}}});}
  return(
    <div style={{color:TEXT,paddingBottom:40}}>
      <div style={{padding:"8px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,marginBottom:4,fontSize:11,color:"#8888cc",fontFamily:MONO,display:"flex",justifyContent:"space-between"}}>
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
      <Sec title="Bonus: Departures" sub="First 5 drivers to leave F1 in 2026, in order. Drag to reorder." pts="MAX 35 PTS"/>
      <PickList all={dn} selected={data.departures||[]} onChange={v=>up("departures",v)} max={5} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Head to Head" sub="Which driver wins within each team across the season" pts="MAX 55 PTS"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {teams.map(tm=>{
          const opts=drivers.filter(d=>d.team===tm).map(d=>d.name);
          return(
            <div key={tm} style={{background:CARD,padding:"8px 10px",borderRadius:4,border:"1px solid "+BORDER}}>
              <div style={{fontSize:10,color:MUTED,marginBottom:4,fontFamily:MONO}}>{tm}</div>
              <Sel value={data.headToHead?.[tm]||""} options={opts} onChange={v=>up("headToHead",{...data.headToHead,[tm]:v})} disabled={preSeasonLocked}/>
            </div>
          );
        })}
      </div>
      <Sec title="Bonus: Top 3 Win Leaders" sub="Three drivers with most race wins (any order). 15 pts each." pts="MAX 45 PTS"/>
      <PickList all={dn} selected={data.topWins||[]} onChange={v=>up("topWins",v)} max={3} disabled={preSeasonLocked}/>
      <Sec title="Bonus: Biggest Team Improvement" sub="Rank teams 1-11 by improvement (1 = most improved). Score = 20 minus (2 × your predicted rank for the actual winner)." pts="MAX 20 PTS"/>
      <RankList items={data.biggestImprovement||[...teams]} onChange={v=>up("biggestImprovement",v)} disabled={preSeasonLocked}/>
      <Sec title="Tiebreaker: Safety Cars" sub="Total safety car deployments across the 2026 season" pts="TIEBREAKER"/>
      <NumIn value={data.safetyCarGuess} onChange={v=>up("safetyCarGuess",v)} placeholder="e.g. 28" disabled={preSeasonLocked}/>
      {QUARTERS.map(q=>{
        const qLocked=data.quarterly?.[q]?.locked;
        const qDrivers=reconcileDrivers(data.quarterly?.[q]?.drivers,dn);
        const qConstructors=data.quarterly?.[q]?.constructors||[...teams];
        return(
          <div key={q}>
            <div style={{marginTop:28,padding:"8px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,marginBottom:4,fontSize:11,color:"#8888cc",fontFamily:MONO,display:"flex",justifyContent:"space-between"}}>
              <span>{q} — {Q_WHEN[q]}</span>
              {qLocked&&<span style={{color:"#e8a060"}}>LOCKED</span>}
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

// ─── RESULTS FORM ─────────────────────────────────────────────────────────────
function ResultsForm({data,onChange,teams,drivers}){
  const dn=drivers.map(d=>d.name);
  function up(f,v){onChange({...data,[f]:v});}
  function upQ(q,f,v){onChange({...data,quarterly:{...data.quarterly,[q]:{...data.quarterly?.[q],[f]:v}}});}
  return(
    <div style={{color:TEXT,paddingBottom:40}}>
      <Sec title="Final: Constructors Championship" sub="Actual final standings"/>
      <RankList items={data.constructorsRanking||[...teams]} onChange={v=>up("constructorsRanking",v)} disabled={data.constructorsConfirmed}/>
      <div style={{marginTop:8}}><ConfirmBtn confirmed={data.constructorsConfirmed} onConfirm={()=>up("constructorsConfirmed",true)} onUnconfirm={()=>up("constructorsConfirmed",false)}/></div>
      <Sec title="Final: Drivers Championship" sub="Actual final standings"/>
      <RankList items={data.driversRanking||[...dn]} onChange={v=>up("driversRanking",v)} disabled={data.driversConfirmed}/>
      <div style={{marginTop:8}}><ConfirmBtn confirmed={data.driversConfirmed} onConfirm={()=>up("driversConfirmed",true)} onUnconfirm={()=>up("driversConfirmed",false)}/></div>
      <Sec title="Bonus: Constructors Clinch Date" sub={"Actual date — season runs "+SEASON_DATES}/>
      <DateIn value={data.constructorsClinchDate} onChange={v=>up("constructorsClinchDate",v)}/>
      <Sec title="Bonus: Drivers Clinch Date" sub={"Actual date — season runs "+SEASON_DATES}/>
      <DateIn value={data.driversClinchDate} onChange={v=>up("driversClinchDate",v)}/>
      <Sec title="Bonus: Departures" sub="Actual order drivers left F1 (up to 5)"/>
      <PickList all={dn} selected={data.departures||[]} onChange={v=>up("departures",v)} max={5} disabled={data.departuresConfirmed}/>
      <div style={{marginTop:8}}><ConfirmBtn confirmed={data.departuresConfirmed} onConfirm={()=>up("departuresConfirmed",true)} onUnconfirm={()=>up("departuresConfirmed",false)}/></div>
      <Sec title="Bonus: Head to Head Winners"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {teams.map(tm=>{
          const opts=drivers.filter(d=>d.team===tm).map(d=>d.name);
          return(
            <div key={tm} style={{background:CARD,padding:"8px 10px",borderRadius:4,border:"1px solid "+BORDER}}>
              <div style={{fontSize:10,color:MUTED,marginBottom:4,fontFamily:MONO}}>{tm}</div>
              <Sel value={data.headToHead?.[tm]||""} options={opts} onChange={v=>up("headToHead",{...data.headToHead,[tm]:v})} disabled={data.h2hConfirmed}/>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8}}><ConfirmBtn confirmed={data.h2hConfirmed} onConfirm={()=>up("h2hConfirmed",true)} onUnconfirm={()=>up("h2hConfirmed",false)}/></div>
      <Sec title="Bonus: Top 3 Win Leaders"/>
      <PickList all={dn} selected={data.topWins||[]} onChange={v=>up("topWins",v)} max={3} disabled={data.winsConfirmed}/>
      <div style={{marginTop:8}}><ConfirmBtn confirmed={data.winsConfirmed} onConfirm={()=>up("winsConfirmed",true)} onUnconfirm={()=>up("winsConfirmed",false)}/></div>
      <Sec title="Bonus: Most Improved Team"/>
      <Sel value={data.biggestImprovement||""} options={teams} onChange={v=>up("biggestImprovement",v)} disabled={data.improvementConfirmed}/>
      <div style={{marginTop:8}}><ConfirmBtn confirmed={data.improvementConfirmed} onConfirm={()=>up("improvementConfirmed",true)} onUnconfirm={()=>up("improvementConfirmed",false)}/></div>
      <Sec title="Tiebreaker: Safety Cars"/>
      <NumIn value={data.safetyCars} onChange={v=>up("safetyCars",v)} placeholder="actual count"/>
      {QUARTERS.map(q=>{
        const qDrivers=reconcileDrivers(data.quarterly?.[q]?.drivers,dn);
        const qConstructors=data.quarterly?.[q]?.constructors||[...teams];
        return(
          <div key={q}>
            <div style={{marginTop:28,padding:"8px 12px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,marginBottom:4,fontSize:11,color:"#8888cc",fontFamily:MONO,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{q} RESULTS — {Q_RACES[q]} ({Q_DATES[q]})</span>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                <input type="checkbox" checked={!!data.quarterly?.[q]?.locked} onChange={e=>upQ(q,"locked",e.target.checked)} style={{accentColor:ACCENT}}/>
                <span style={{color:data.quarterly?.[q]?.locked?"#e8a060":MUTED}}>{data.quarterly?.[q]?.locked?"LOCKED":"LOCK RESULTS"}</span>
              </label>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Constructors</Lbl><RankList items={qConstructors} onChange={v=>upQ(q,"constructors",v)} disabled={data.quarterly?.[q]?.locked}/></div>
              <div><Lbl>Drivers</Lbl><RankList items={qDrivers} onChange={v=>upQ(q,"drivers",v)} disabled={data.quarterly?.[q]?.locked}/></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPARISON COMPONENTS ────────────────────────────────────────────────────
function deltaColor(off){return off===0?GREEN:off<=2?YELLOW:RED;}

function RankCompare({predList,actualList,scoreFn}){
  if(!actualList||!actualList.length) return <div style={{fontSize:11,color:MUTED,padding:"12px 0"}}>No confirmed results yet.</div>;
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr 70px 55px 44px",padding:"5px 10px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2,fontSize:10,color:MUTED,fontFamily:MONO}}>
        <span>#</span><span>ENTRY</span><span style={{textAlign:"right"}}>ACTUAL</span><span style={{textAlign:"right"}}>OFF</span><span style={{textAlign:"right"}}>PTS</span>
      </div>
      {predList.map((item,pi)=>{
        const ai=actualList.indexOf(item);
        const off=ai===-1?null:Math.abs(pi-ai);
        const pts=off===null?0:scoreFn(off);
        const col=off===null?DIM:deltaColor(off);
        const sign=off===null?"":ai===pi?"+0":ai>pi?"+"+(ai-pi):""+(ai-pi);
        return(
          <div key={item} style={{display:"grid",gridTemplateColumns:"28px 1fr 70px 55px 44px",padding:"6px 10px",borderBottom:pi<predList.length-1?"1px solid "+BORDER:"none",background:pi%2===0?CARD:"#0d0d0d",alignItems:"center"}}>
            <span style={{color:DIM,fontFamily:MONO,fontSize:10}}>{pi+1}</span>
            <span style={{color:TEXT}}>{item}</span>
            <span style={{textAlign:"right",color:ai===-1?DIM:MUTED,fontFamily:MONO,fontSize:11}}>{ai===-1?"—":"#"+(ai+1)}</span>
            <span style={{textAlign:"right",color:col,fontFamily:MONO,fontSize:11,fontWeight:off===0?700:400}}>{off===null?"—":sign}</span>
            <span style={{textAlign:"right",color:pts>0?ACCENT:DIM,fontFamily:MONO,fontSize:11}}>{off===null?"—":pts}</span>
          </div>
        );
      })}
    </div>
  );
}

function ClinchCompare({predDate,actualDate}){
  if(!actualDate) return <div style={{fontSize:11,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  const pts=scoreClinch(predDate,actualDate);
  const daysOff=predDate?Math.round(Math.abs((new Date(predDate)-new Date(actualDate))/864e5)):null;
  const col=daysOff===null?DIM:daysOff===0?GREEN:daysOff<=7?YELLOW:RED;
  return(
    <div style={{display:"flex",gap:16,alignItems:"center",padding:"10px 14px",background:CARD,border:"1px solid "+BORDER,borderRadius:4,fontSize:12}}>
      <div style={{flex:1}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>YOUR PICK</div><div style={{color:TEXT}}>{predDate||"—"}</div></div>
      <div style={{flex:1}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>ACTUAL</div><div style={{color:TEXT}}>{actualDate}</div></div>
      <div style={{textAlign:"right"}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>DAYS OFF</div><div style={{color:col,fontFamily:MONO,fontWeight:700}}>{daysOff===null?"—":daysOff===0?"exact":daysOff+" days"}</div></div>
      <div style={{textAlign:"right"}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>PTS</div><div style={{color:pts>0?ACCENT:DIM,fontFamily:MONO,fontWeight:700}}>{pts??0}</div></div>
    </div>
  );
}

function DepsCompare({predList,actualList,confirmed}){
  if(!confirmed||!actualList||!actualList.length) return <div style={{fontSize:11,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  const n=Math.min(5,actualList.length);
  const ppSlot=Math.round(35/n);
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr 90px 55px 44px",padding:"5px 10px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2,fontSize:10,color:MUTED,fontFamily:MONO}}>
        <span>#</span><span>YOUR PICK</span><span style={{textAlign:"right"}}>ACTUAL POS</span><span style={{textAlign:"right"}}>OFF</span><span style={{textAlign:"right"}}>PTS</span>
      </div>
      {predList.slice(0,n).map((drv,pi)=>{
        const ai=actualList.indexOf(drv);
        const off=ai===-1?null:Math.abs(pi-ai);
        const pts=ai===-1?0:Math.max(0,ppSlot-off);
        const col=off===null?DIM:deltaColor(off);
        const sign=off===null?"":ai===pi?"+0":ai>pi?"+"+(ai-pi):""+(ai-pi);
        return(
          <div key={pi} style={{display:"grid",gridTemplateColumns:"28px 1fr 90px 55px 44px",padding:"6px 10px",borderBottom:pi<n-1?"1px solid "+BORDER:"none",background:pi%2===0?CARD:"#0d0d0d",alignItems:"center"}}>
            <span style={{color:DIM,fontFamily:MONO,fontSize:10}}>{pi+1}</span>
            <span style={{color:TEXT}}>{drv}</span>
            <span style={{textAlign:"right",color:ai===-1?DIM:MUTED,fontFamily:MONO,fontSize:11}}>{ai===-1?"not departed":"#"+(ai+1)}</span>
            <span style={{textAlign:"right",color:col,fontFamily:MONO,fontSize:11,fontWeight:off===0?700:400}}>{off===null?"—":sign}</span>
            <span style={{textAlign:"right",color:pts>0?ACCENT:DIM,fontFamily:MONO,fontSize:11}}>{pts}</span>
          </div>
        );
      })}
    </div>
  );
}

function H2HCompare({predMap,actualMap,confirmed,teams}){
  if(!confirmed||!actualMap||!Object.keys(actualMap).some(k=>actualMap[k])) return <div style={{fontSize:11,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      <div style={{display:"grid",gridTemplateColumns:"110px 1fr 1fr 30px",padding:"5px 10px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2,fontSize:10,color:MUTED,fontFamily:MONO,gap:8}}>
        <span>TEAM</span><span>YOUR PICK</span><span>ACTUAL</span><span></span>
      </div>
      {teams.map((tm,i)=>{
        const pick=predMap?.[tm]||"—";
        const actual=actualMap?.[tm]||"—";
        const correct=pick===actual&&pick!=="—"&&actual!=="—";
        return(
          <div key={tm} style={{display:"grid",gridTemplateColumns:"110px 1fr 1fr 30px",padding:"6px 10px",borderBottom:i<teams.length-1?"1px solid "+BORDER:"none",background:i%2===0?CARD:"#0d0d0d",alignItems:"center",gap:8}}>
            <span style={{color:MUTED,fontSize:11,fontFamily:MONO}}>{tm}</span>
            <span style={{color:TEXT,fontSize:12}}>{pick}</span>
            <span style={{color:actual==="—"?DIM:TEXT,fontSize:12}}>{actual}</span>
            <span style={{textAlign:"right",fontSize:13,color:actual==="—"?DIM:correct?GREEN:RED}}>{actual==="—"?"":correct?"✓":"✗"}</span>
          </div>
        );
      })}
    </div>
  );
}

function WinsCompare({predList,actualList,confirmed}){
  if(!confirmed||!actualList||!actualList.length) return <div style={{fontSize:11,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  return(
    <div style={{border:"1px solid "+BORDER,borderRadius:4,overflow:"hidden",fontSize:12}}>
      {predList.map((drv,i)=>{
        const hit=actualList.includes(drv);
        return(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 30px 44px",padding:"6px 10px",borderBottom:i<predList.length-1?"1px solid "+BORDER:"none",background:i%2===0?CARD:"#0d0d0d",alignItems:"center",gap:8}}>
            <span style={{color:TEXT}}>{drv}</span>
            <span style={{textAlign:"right",fontSize:13,color:hit?GREEN:RED}}>{hit?"✓":"✗"}</span>
            <span style={{textAlign:"right",fontFamily:MONO,color:hit?ACCENT:DIM,fontSize:11}}>{hit?15:0}</span>
          </div>
        );
      })}
    </div>
  );
}

function ImproveCompare({predList,actual,confirmed}){
  if(!confirmed||!actual) return <div style={{fontSize:11,color:MUTED,padding:"8px 0"}}>No result confirmed yet.</div>;
  const pos=predList.indexOf(actual);
  const pts=scoreImprove(predList,actual);
  const col=pts>=16?GREEN:pts>=10?YELLOW:RED;
  return(
    <div style={{display:"flex",gap:16,alignItems:"center",padding:"10px 14px",background:CARD,border:"1px solid "+BORDER,borderRadius:4,fontSize:12}}>
      <div style={{flex:1}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>MOST IMPROVED (ACTUAL)</div><div style={{color:TEXT,fontWeight:600}}>{actual}</div></div>
      <div style={{flex:1}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>YOUR PREDICTED RANK</div><div style={{color:col,fontFamily:MONO,fontWeight:700}}>#{pos===-1?"not ranked":pos+1}</div></div>
      <div style={{textAlign:"right"}}><div style={{color:MUTED,fontSize:10,fontFamily:MONO,marginBottom:2}}>PTS</div><div style={{color:pts>0?ACCENT:DIM,fontFamily:MONO,fontSize:16,fontWeight:800}}>{pts}</div></div>
    </div>
  );
}

// ─── COMPARE PANEL ────────────────────────────────────────────────────────────
function ComparePanel({allPreds,results,players,teams,drivers}){
  const [who,setWho]=useState(0);
  const preds=allPreds[who];
  const dn=drivers.map(d=>d.name);
  const [open,setOpen]=useState({});
  if(!preds||!results) return null;

  const sections=[
    {key:"con",label:"Constructors Ranking",confirmed:results.constructorsConfirmed,node:<RankCompare predList={preds.constructorsRanking||[...teams]} actualList={results.constructorsConfirmed?results.constructorsRanking:[]} scoreFn={scoreConRank}/>},
    {key:"drv",label:"Drivers Ranking",confirmed:results.driversConfirmed,node:<RankCompare predList={preds.driversRanking||[...dn]} actualList={results.driversConfirmed?results.driversRanking:[]} scoreFn={scoreDrvRank}/>},
    ...QUARTERS.flatMap(q=>[
      {key:"q"+q+"c",label:q+" Constructors ("+Q_RACES[q]+")",confirmed:!!results.quarterly?.[q]?.locked,node:<RankCompare predList={preds.quarterly?.[q]?.constructors||[...teams]} actualList={results.quarterly?.[q]?.locked?results.quarterly[q].constructors:[]} scoreFn={scoreQCon}/>},
      {key:"q"+q+"d",label:q+" Drivers ("+Q_RACES[q]+")",confirmed:!!results.quarterly?.[q]?.locked,node:<RankCompare predList={reconcileDrivers(preds.quarterly?.[q]?.drivers,dn)} actualList={results.quarterly?.[q]?.locked?results.quarterly[q].drivers:[]} scoreFn={scoreQDrv}/>},
    ]),
    {key:"ccon",label:"Constructors Clinch Date",confirmed:!!results.constructorsClinchDate,node:<ClinchCompare predDate={preds.constructorsClinchDate} actualDate={results.constructorsClinchDate}/>},
    {key:"cdrv",label:"Drivers Clinch Date",confirmed:!!results.driversClinchDate,node:<ClinchCompare predDate={preds.driversClinchDate} actualDate={results.driversClinchDate}/>},
    {key:"dep",label:"Driver Departures",confirmed:results.departuresConfirmed,node:<DepsCompare predList={preds.departures||[]} actualList={results.departures||[]} confirmed={results.departuresConfirmed}/>},
    {key:"h2h",label:"Head to Head",confirmed:results.h2hConfirmed,node:<H2HCompare predMap={preds.headToHead} actualMap={results.headToHead} confirmed={results.h2hConfirmed} teams={teams}/>},
    {key:"wins",label:"Top 3 Win Leaders",confirmed:results.winsConfirmed,node:<WinsCompare predList={preds.topWins||[]} actualList={results.topWins||[]} confirmed={results.winsConfirmed}/>},
    {key:"imp",label:"Biggest Team Improvement",confirmed:results.improvementConfirmed,node:<ImproveCompare predList={preds.biggestImprovement||[...teams]} actual={results.biggestImprovement} confirmed={results.improvementConfirmed}/>},
  ];

  return(
    <div style={{marginTop:24,border:"1px solid "+BORDER2,borderRadius:6,overflow:"hidden"}}>
      <div style={{padding:"10px 14px",background:"#0a0a14",borderBottom:"1px solid #1e1e3a",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:"#8888cc",fontFamily:MONO,marginRight:4}}>BREAKDOWN FOR</span>
        {players.map((name,i)=>(
          <button key={i} onClick={()=>setWho(i)}
            style={{background:who===i?ACCENT:CARD,border:"1px solid "+(who===i?ACCENT:BORDER2),color:"#fff",padding:"3px 12px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:MONO}}>
            {name}
          </button>
        ))}
      </div>
      {sections.map(s=>(
        <div key={s.key} style={{borderBottom:"1px solid "+BORDER}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",background:CARD,cursor:"pointer"}}
            onClick={()=>setOpen(o=>({...o,[s.key]:!o[s.key]}))}>
            <span style={{fontSize:12,color:s.confirmed?TEXT:MUTED}}>{s.label}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {!s.confirmed&&<Tag color={DIM}>PENDING</Tag>}
              <span style={{color:MUTED,fontSize:12}}>{open[s.key]?"▾":"▸"}</span>
            </div>
          </div>
          {open[s.key]&&<div style={{padding:"12px 14px",background:BG}}>{s.node}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function Leaderboard({allPreds,results,players,teams,drivers}){
  const scores=allPreds.map(p=>calcAllScores(p,results));
  const [expanded,setExpanded]=useState({});
  const [showCompare,setShowCompare]=useState(false);
  const anyResults=scores.some(s=>s.total>0);
  const maxTotal=Math.max(...scores.map(s=>s.total),1);
  const now=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const colGrid="1fr "+players.map(()=>"62px").join(" ");

  const catLabel={
    constructorsRanking:"Constructors Ranking",driversRanking:"Drivers Ranking",
    constructorsClinch:"Constructors Clinch Date",driversClinch:"Drivers Clinch Date",
    departures:"Driver Departures",headToHead:"Head to Head",
    topWins:"Top 3 Win Leaders",biggestImprovement:"Biggest Improvement"
  };

  function ScoreRow({label,vals,indent}){
    const pad=indent?"4px 20px":"6px 12px";
    const rowBg=indent?BG:CARD;
    const maxV=Math.max(...vals.filter(v=>v!==null));
    return(
      <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:pad,borderBottom:"1px solid "+BORDER,background:rowBg,fontSize:indent?11:12}}>
        <span style={{color:indent?MUTED:TEXT}}>{label}</span>
        {vals.map((v,i)=>{
          const isTop=v!==null&&v===maxV&&v>0;
          return <span key={i} style={{textAlign:"right",fontFamily:MONO,color:v===null?"#333":isTop?ACCENT:MUTED,fontSize:11}}>{v!==null?v:"—"}</span>;
        })}
      </div>
    );
  }

  return(
    <div>
      <div style={{marginBottom:16,padding:"8px 14px",background:"#0a0a0a",border:"1px solid "+BORDER2,borderRadius:6,fontSize:11,color:MUTED,fontFamily:MONO,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <span>Standings as of {now} — confirmed results only</span>
        <span style={{color:DIM}}>Season: {SEASON_DATES}</span>
      </div>
      {!anyResults&&(
        <div style={{padding:"10px 14px",background:"#0a0a0a",border:"1px solid "+BORDER,borderRadius:6,fontSize:11,color:MUTED,fontFamily:MONO,marginBottom:20}}>
          No results confirmed yet. Scores appear once results are entered and confirmed in the Results tab.
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat("+players.length+", 1fr)",gap:12,marginBottom:24}}>
        {scores.map((s,i)=>{
          const rank=scores.filter(x=>x.total>s.total).length+1;
          return(
            <div key={i} style={{background:CARD,border:"1px solid "+(rank===1&&anyResults?ACCENT:BORDER),borderRadius:6,padding:16,textAlign:"center"}}>
              {anyResults&&<div style={{fontSize:10,color:rank===1?ACCENT:DIM,fontFamily:MONO,marginBottom:4}}>{"#"+rank}</div>}
              <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{players[i]}</div>
              <div style={{fontSize:36,fontWeight:800,color:anyResults?ACCENT:DIM,fontFamily:MONO,lineHeight:1}}>{s.total}</div>
              <div style={{fontSize:10,color:MUTED,marginTop:4}}>pts</div>
              <div style={{marginTop:10,height:3,background:BORDER,borderRadius:2}}>
                <div style={{height:"100%",background:anyResults?ACCENT:DIM,borderRadius:2,width:anyResults?((s.total/maxTotal)*100)+"%":"0%",transition:"width 0.6s ease"}}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{border:"1px solid "+BORDER,borderRadius:6,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"8px 12px",background:"#0a0a0a",borderBottom:"1px solid "+BORDER2}}>
          <span style={{fontSize:10,color:MUTED,fontFamily:MONO}}>CATEGORY</span>
          {players.map((name,i)=><span key={i} style={{textAlign:"right",fontSize:10,color:MUTED,fontFamily:MONO,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shortName(name)}</span>)}
        </div>
        {Object.entries(catLabel).map(([k,lbl])=>(
          <ScoreRow key={k} label={lbl} vals={scores.map(s=>s.cats[k]??null)}/>
        ))}
        <div style={{background:"#0a0a0a",padding:"4px 12px 2px",borderBottom:"1px solid "+BORDER}}>
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
              <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"6px 12px",borderBottom:"1px solid "+BORDER,background:CARD,cursor:"pointer",fontSize:12}}
                onClick={()=>setExpanded(e=>({...e,[q]:!e[q]}))}>
                <span style={{color:hasAny?TEXT:DIM}}>{q+" — "+Q_RACES[q]+" "+(expanded[q]?"▾":"▸")}</span>
                {qVals.map((v,i)=><span key={i} style={{textAlign:"right",fontFamily:MONO,fontSize:11,color:v!==null?ACCENT:"#333"}}>{v!==null?v:"—"}</span>)}
              </div>
              {expanded[q]&&(
                <>
                  <ScoreRow label="Constructors" vals={scores.map(s=>s.cats.quarterly?.[q]?.constructors??null)} indent={true}/>
                  <ScoreRow label="Drivers" vals={scores.map(s=>s.cats.quarterly?.[q]?.drivers??null)} indent={true}/>
                </>
              )}
            </div>
          );
        })}
        <div style={{display:"grid",gridTemplateColumns:colGrid,gap:4,padding:"10px 12px",background:"#0a0a0a"}}>
          <span style={{fontSize:12,fontWeight:700,color:TEXT,fontFamily:MONO}}>TOTAL</span>
          {scores.map((s,i)=><span key={i} style={{textAlign:"right",fontSize:13,fontWeight:800,fontFamily:MONO,color:anyResults?ACCENT:DIM}}>{s.total}</span>)}
        </div>
      </div>
      {anyResults&&scores.every(s=>s.total===scores[0].total)&&(
        <div style={{marginTop:12,padding:"10px 14px",background:"#1a0a00",border:"1px solid #6a2a00",borderRadius:6,fontSize:12,color:"#e8a060"}}>
          ALL TIED — Tiebreaker: closest to actual safety car count.
          {" "}({players.map((n,i)=>n+": "+(allPreds[i]?.safetyCarGuess||"??")).join(" | ")})
        </div>
      )}
      <div style={{marginTop:20}}>
        <button onClick={()=>setShowCompare(s=>!s)}
          style={{width:"100%",background:showCompare?"#0a0a14":CARD,border:"1px solid "+(showCompare?"#1e1e3a":BORDER2),color:showCompare?"#8888cc":MUTED,padding:"10px 14px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:MONO,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>PREDICTION BREAKDOWN — see what each player got right or wrong</span>
          <span>{showCompare?"▾":"▸"}</span>
        </button>
        {showCompare&&<ComparePanel allPreds={allPreds} results={results} players={players} teams={teams} drivers={drivers}/>}
      </div>
    </div>
  );
}

// ─── RULES ────────────────────────────────────────────────────────────────────
function Rules(){
  const block={marginBottom:24,padding:"16px 18px",background:CARD,border:"1px solid "+BORDER,borderRadius:6};
  const h={fontSize:11,fontWeight:700,color:TEXT,fontFamily:MONO,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:"1px solid "+BORDER2};
  const row={display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BORDER,fontSize:12};
  return(
    <div style={{maxWidth:720,color:TEXT}}>
      <div style={{...block,background:"#0a0a14",border:"1px solid #1e1e3a"}}>
        <div style={{fontSize:14,fontWeight:700,color:ACCENT,fontFamily:MONO,marginBottom:6}}>F1 2026 PREDICTION LEAGUE</div>
        <div style={{fontSize:12,color:"#8888cc",lineHeight:1.8}}>
          <p style={{marginTop:0}}>Four players go head to head predicting the 2026 Formula 1 season across three scoring phases.</p>
          <p><span style={{color:TEXT,fontWeight:600}}>Pre-season</span> is your biggest swing — lock in your full constructors and drivers championship rankings before Race 1 and earn up to 440 points based on how close you land. The further off you are, the fewer points you get, so confident picks pay off.</p>
          <p><span style={{color:TEXT,fontWeight:600}}>Quarterly standings</span> run across four race blocks throughout the season. Before each block you predict where every constructor and driver sits in the championship at that point. With 88 points available per quarter across 24 races, this is where the standings shift race by race.</p>
          <p><span style={{color:TEXT,fontWeight:600}}>Bonus categories</span> reward getting the details right — championship clinch dates, head-to-head battles within each team, which drivers leave F1, the top win leaders, and which team improves the most. Worth up to 225 points combined.</p>
          <p style={{marginBottom:0}}>All predictions lock before they score and cannot be changed once locked. Scores only appear after the admin confirms results. The player with the most points at the end of Abu Dhabi wins.</p>
        </div>
      </div>

      <div style={block}>
        <div style={h}>How to Play</div>
        <div style={{fontSize:12,color:MUTED,lineHeight:1.0}}>
          {[
            ["1. Set up player names","Go to Setup and enter names for all four players. This only needs to be done once."],
            ["2. Enter pre-season predictions","Each player fills out their own predictions in the Predictions tab before Race 1 - Australian GP (Mar 8). This includes the full constructors and drivers championship rankings, all bonus categories, and Q1 quarterly standings."],
            ["3. Lock pre-season predictions","Before Race 1 - Australian GP starts, each player locks their pre-season predictions using the LOCK PRE-SEASON button. Locked predictions cannot be changed."],
            ["4. Submit quarterly predictions","After each quarter ends, players have a window to submit their next quarterly standings prediction before the next quarter begins. Lock each quarter independently using the LOCK Q1/Q2/Q3/Q4 buttons."],
            ["5. Admin confirms results","After each scored event (quarter end, bonus category outcome), the admin enters results in the Results tab and clicks CONFIRM RESULTS. Scores only appear after confirmation."],
            ["6. Check the leaderboard","Visit the Leaderboard tab at any time to see current standings. Expand the Prediction Breakdown section to see a category-by-category analysis for any player."],
          ].map(([step,desc],i,arr)=>(
            <div key={step} style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:12,padding:"10px 0",borderBottom:i<arr.length-1?"1px solid "+BORDER:"none",alignItems:"start"}}>
              <span style={{color:ACCENT,fontFamily:MONO,fontSize:11}}>{step}</span>
              <span style={{color:MUTED,lineHeight:1.6}}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={block}>
        <div style={h}>Key Dates</div>
        {[
          ["Season start","Mar 8, 2026 — Australian GP, Albert Park"],
          ["Pre-season lock","Before Mar 8 — all pre-season predictions and Q1 quarterly must be locked"],
          ["Q1 ends / Q2 lock window","After May 24 (Race 7 - Canadian GP), before Jun 7 (Race 8 - Monaco GP)"],
          ["Q2 ends / Q3 lock window","After Jul 26 (Race 13 - Hungarian GP), before Aug 23 (Race 14 - Dutch GP)"],
          ["Q3 ends / Q4 lock window","After Oct 25 (Race 19 - United States GP), before Nov 1 (Race 20 - Mexico City GP)"],
          ["Season end","Dec 6, 2026 — Abu Dhabi GP, Yas Marina"],
        ].map(([k,v])=>(
          <div key={k} style={row}>
            <span style={{color:MUTED,fontFamily:MONO,fontSize:11}}>{k}</span>
            <span style={{color:TEXT,textAlign:"right",maxWidth:"60%"}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={h}>Quarter Boundaries</div>
        {[["Q1","Races 1-7","Mar 8 - May 24","Australia → Canada"],["Q2","Races 8-13","Jun 7 - Jul 26","Monaco → Hungary"],["Q3","Races 14-19","Aug 23 - Oct 25","Dutch → United States"],["Q4","Races 20-24","Nov 1 - Dec 6","Mexico City → Abu Dhabi"]].map(([q,races,dates,gps])=>(
          <div key={q} style={{...row,gap:8,alignItems:"center"}}>
            <span style={{color:ACCENT,fontFamily:MONO,fontSize:11,minWidth:24}}>{q}</span>
            <span style={{color:MUTED,fontSize:11,minWidth:70}}>{races}</span>
            <span style={{color:TEXT,flex:1}}>{gps}</span>
            <span style={{color:MUTED,fontSize:11,textAlign:"right"}}>{dates}</span>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={h}>2026 Race Calendar</div>
        {RACE_CALENDAR.map((race,i)=>{
          const q=race.r<=7?"Q1":race.r<=13?"Q2":race.r<=19?"Q3":"Q4";
          const qColor={Q1:"#3a5a3a",Q2:"#3a3a6a",Q3:"#6a4a1a",Q4:"#6a1a1a"};
          return(
            <div key={race.r} style={{display:"grid",gridTemplateColumns:"28px 1fr 80px 28px",gap:8,padding:"5px 0",borderBottom:i<RACE_CALENDAR.length-1?"1px solid "+BORDER:"none",alignItems:"center",fontSize:11}}>
              <span style={{color:DIM,fontFamily:MONO,textAlign:"right"}}>{race.r}</span>
              <span style={{color:TEXT}}>{race.name}</span>
              <span style={{color:MUTED,textAlign:"right"}}>{race.date}</span>
              <span style={{background:qColor[q],color:TEXT,fontSize:9,fontFamily:MONO,padding:"1px 4px",borderRadius:2,textAlign:"center"}}>{q}</span>
            </div>
          );
        })}
      </div>

      <div style={block}>
        <div style={h}>Scoring — Pre-Season Rankings (45% of total, ~440 pts)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>CONSTRUCTORS — 11 entries, max 20 pts each (220 total)</div>
            {[["Exact","20"],["1 off","16"],["2 off","11"],["3 off","7"],["4-6 off","4"],["7+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+BORDER,fontSize:11}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>DRIVERS — 22 entries, max 10 pts each (220 total)</div>
            {[["Exact","10"],["1-2 off","8"],["3-5 off","5"],["6-10 off","2"],["11+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+BORDER,fontSize:11}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={block}>
        <div style={h}>Scoring — Quarterly Predictions (35% of total, 352 pts)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>CONSTRUCTORS — 11 entries, max 4 pts each (44 per quarter)</div>
            {[["Exact","4"],["1 off","3"],["2 off","2"],["3 off","1"],["4+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+BORDER,fontSize:11}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:10,color:MUTED,fontFamily:MONO,marginBottom:6}}>DRIVERS — 22 entries, max 2 pts each (44 per quarter)</div>
            {[["Exact","2"],["1-2 off","1"],["3+","0"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+BORDER,fontSize:11}}>
                <span style={{color:MUTED}}>{k}</span><span style={{color:TEXT,fontFamily:MONO}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={block}>
        <div style={h}>Scoring — Bonus Categories (20% of total, ~205 pts)</div>
        {[
          ["Constructors Clinch Date","35 pts","Exact: 35 | 2 days: 30 | 5 days: 25 | 1 week: 20 | 2 weeks: 16 | 3 weeks: 12 | 1 month: 8 | 6 weeks: 5 | 2 months: 2"],
          ["Drivers Clinch Date","35 pts","Same proximity tiers as constructors clinch."],
          ["Driver Departures","35 pts","First 5 drivers to leave F1 in order. 7 pts per slot, minus 1 per position off. If fewer than 5 depart, points scale to actual departures."],
          ["Head to Head","55 pts","5 pts per correct intra-team prediction, all 11 teams."],
          ["Top 3 Win Leaders","45 pts","15 pts per correct driver (order does not matter)."],
          ["Biggest Team Improvement","20 pts","Rank all 11 teams by predicted improvement. Score = 20 minus (2 × your rank for the actual winner). Predicted 1st = 20, 2nd = 18, 3rd = 16, etc."],
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
        <div style={{fontSize:11,color:MUTED,lineHeight:1.0}}>
          {[
            ["Locks","Pre-season predictions (including Q1 quarterly) must be locked before Race 1 - Australian GP (Mar 8). Each subsequent quarter locks independently between quarters. Once locked, predictions cannot be changed."],
            ["Results","The admin confirms results in the Results tab. Scores only appear after confirmation. Results can be unconfirmed and corrected if needed before the season ends."],
            ["Mid-season driver changes","If a driver is replaced mid-season, the replacement inherits that seat slot for scoring purposes. Head-to-head picks apply to whoever races in that seat across the full season."],
            ["Tiebreaker","If total scores are equal at season end, the winner is the player closest to the actual total number of safety car deployments across the 2026 season. This must be submitted pre-season."],
            ["Team withdrawal","If a team withdraws from the championship entirely, the player with the lowest score at that point wins (chaos rule)."],
            ["Independence","All players score independently against the results. Clinch dates, head-to-head, and bonus categories are not scored relative to other players."],
          ].map(([k,v],i,arr)=>(
            <div key={k} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:12,padding:"10px 0",borderBottom:i<arr.length-1?"1px solid "+BORDER:"none",alignItems:"start"}}>
              <span style={{color:TEXT,fontFamily:MONO,fontSize:11}}>{k}</span>
              <span style={{color:MUTED,lineHeight:1.6}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function Setup({config,onSave,onReset}){
  const [names,setNames]=useState(config.playerNames||DEFAULT_PLAYER_NAMES);
  const [confirmReset,setConfirmReset]=useState(false);
  return(
    <div style={{maxWidth:520}}>
      <Sec title="Player Names"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {Array.from({length:NUM_PLAYERS},(_,i)=>(
          <div key={i}>
            <Lbl>Player {i+1}</Lbl>
            <input value={names[i]||""} onChange={e=>{const n=[...names];n[i]=e.target.value;setNames(n);}}
              style={{background:INPUTBG,border:"1px solid "+BORDER2,color:TEXT,padding:"8px 12px",borderRadius:4,fontSize:13,width:"100%",outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
      </div>
      <button onClick={()=>onSave(names)} style={{marginTop:14,background:ACCENT,border:"none",color:"#fff",padding:"8px 20px",borderRadius:4,fontSize:12,cursor:"pointer",fontFamily:MONO}}>
        SAVE NAMES
      </button>
      <div style={{marginTop:32,paddingTop:24,borderTop:"1px solid "+BORDER2}}>
        <div style={{fontSize:10,color:MUTED,fontFamily:MONO,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Danger Zone</div>
        {!confirmReset?(
          <button onClick={()=>setConfirmReset(true)} style={{background:"none",border:"1px solid #4a1a1a",color:"#cc4444",padding:"7px 16px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:MONO}}>RESET ALL DATA</button>
        ):(
          <div style={{padding:"14px",background:"#120808",border:"1px solid #6a2222",borderRadius:6}}>
            <div style={{fontSize:12,color:"#cc6666",marginBottom:12}}>This will erase all predictions, results, locks, and player names. Cannot be undone.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{onReset();setConfirmReset(false);}} style={{background:"#8a0000",border:"none",color:"#fff",padding:"7px 16px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:MONO}}>YES, RESET EVERYTHING</button>
              <button onClick={()=>setConfirmReset(false)} style={{background:"none",border:"1px solid "+BORDER2,color:MUTED,padding:"7px 16px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:MONO}}>CANCEL</button>
            </div>
          </div>
        )}
      </div>
      <div style={{marginTop:24,padding:"12px 14px",background:CARD,border:"1px solid "+BORDER,borderRadius:6,fontSize:11,color:MUTED,lineHeight:1.9}}>
        <div style={{color:TEXT,fontWeight:600,marginBottom:6,fontFamily:MONO,fontSize:10}}>2026 CALENDAR</div>
        <div>Q1: Races 1-7 — Mar 8 to May 24 (Australia → Canada)</div>
        <div>Q2: Races 8-13 — Jun 7 to Jul 26 (Monaco → Hungary)</div>
        <div>Q3: Races 14-19 — Aug 23 to Oct 25 (Dutch → United States)</div>
        <div>Q4: Races 20-24 — Nov 1 to Dec 6 (Mexico City → Abu Dhabi)</div>
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({tabs,active,onSelect}){
  return(
    <div style={{display:"flex",gap:1,marginBottom:24,borderBottom:"1px solid "+BORDER2,flexWrap:"wrap"}}>
      {tabs.map(t=>(
        <button key={t} onClick={()=>onSelect(t)}
          style={{background:"none",border:"none",borderBottom:t===active?"2px solid "+ACCENT:"2px solid transparent",color:t===active?TEXT:MUTED,padding:"8px 14px",cursor:"pointer",fontSize:11,fontFamily:MONO,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:-1}}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("Predictions");
  const [predTab,setPredTab]=useState(0);
  const [config,setConfig]=useState({playerNames:[...DEFAULT_PLAYER_NAMES],teams:DEFAULT_TEAMS,drivers:DEFAULT_DRIVERS});
  const [allPreds,setAllPreds]=useState(Array(NUM_PLAYERS).fill(null));
  const [results,setResults]=useState(null);
  const [preLocked,setPreLocked]=useState(Array(NUM_PLAYERS).fill(false));
  const [saved,setSaved]=useState(false);

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
  function handlePred(i,v){
    const next=[...allPreds];next[i]=v;setAllPreds(next);save(predKey(i),v);
  }
  function handleResults(v){setResults(v);save("f1-results",v);}
  function handleConfig(names){
    const nc={...config,playerNames:names};setConfig(nc);save("f1-config",nc);
  }
  function lockPreSeason(i){
    const next=[...preLocked];next[i]=true;setPreLocked(next);save(lockKey(i),true);
  }
  function lockQuarter(i,q){
    const updated={...allPreds[i],quarterly:{...allPreds[i].quarterly,[q]:{...allPreds[i].quarterly?.[q],locked:true}}};
    handlePred(i,updated);
  }

  const currentPred=allPreds[predTab];
  const currentLocked=preLocked[predTab];

  if(loading) return <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:MUTED,fontFamily:MONO}}>LOADING...</div>;

  return(
    <div style={{background:BG,minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:TEXT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;} input,select{color-scheme:dark;} ::-webkit-scrollbar{width:6px;height:6px;} ::-webkit-scrollbar-track{background:#0a0a0a;} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}"}</style>
      <div style={{borderBottom:"1px solid "+BORDER,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#050505"}}>
        <div>
          <span style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:ACCENT,letterSpacing:"0.12em"}}>F1 PREDICT</span>
          <span style={{fontFamily:MONO,fontSize:11,color:MUTED,marginLeft:12,letterSpacing:"0.08em"}}>2026 SEASON</span>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          {saved&&<span style={{fontFamily:MONO,fontSize:10,color:"#4a8a4a"}}>SAVED</span>}
          <span style={{fontFamily:MONO,fontSize:10,color:MUTED}}>nick.raynor@proton.me</span>
          <a href="https://discord.com/users/199650499308290051" target="_blank" rel="noreferrer" style={{fontFamily:MONO,fontSize:10,color:MUTED,textDecoration:"none"}}>Discord</a>
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"24px"}}>
        <Nav tabs={["Predictions","Results","Leaderboard","Rules","Setup"]} active={tab} onSelect={setTab}/>

        {tab==="Rules"&&<Rules/>}
        {tab==="Setup"&&<Setup config={config} onSave={handleConfig} onReset={handleReset}/>}

        {tab==="Predictions"&&currentPred&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
              {config.playerNames.map((name,i)=>(
                <button key={i} onClick={()=>setPredTab(i)}
                  style={{background:predTab===i?ACCENT:CARD,border:"1px solid "+(predTab===i?ACCENT:BORDER),color:"#fff",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:MONO}}>
                  {name}
                </button>
              ))}
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
            <PredForm data={currentPred} onChange={v=>handlePred(predTab,v)} teams={config.teams} drivers={config.drivers} preSeasonLocked={currentLocked}/>
          </div>
        )}

        {tab==="Results"&&results&&(
          <div>
            <div style={{marginBottom:16,padding:"10px 14px",background:"#0a0a14",border:"1px solid #1e1e3a",borderRadius:6,fontSize:11,color:"#8888cc",fontFamily:MONO}}>
              ADMIN — Confirm each category once results are final. Scores only appear after confirmation.
            </div>
            <ResultsForm data={results} onChange={handleResults} teams={config.teams} drivers={config.drivers}/>
          </div>
        )}

        {tab==="Leaderboard"&&(
          <Leaderboard allPreds={allPreds} results={results} players={config.playerNames} teams={config.teams} drivers={config.drivers}/>
        )}
      </div>
    </div>
  );
}
