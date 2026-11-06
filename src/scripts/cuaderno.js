// Cuaderno de Pádel: lógica original de index.html (ver docs/CUADERNO.md). Solo se quitó el enlace a un plan privado.
(() => {
"use strict";
/* ---------- constantes ---------- */
const PLAN = {1:"Bandeja",2:"Físico fútbol → pádel + bolas bajas",3:"Víbora y potencia",4:"Paredes, defensa de nevera y mental",5:"Partido"};
const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const COLS = ["partidos","torneos","entrenos","fisico","mental"];
const INSTANCIAS = ["Fase de grupos","32avos","16avos","Octavos","Cuartos","Semifinal","Final","Campeón"];
const FICHA_DEF = {nombre:"",edad:"",altura:"",posicion:"",categoria:"",objetivo:"",
  estilo:"",origen:"",desafio:"",
  horario:"Lunes a viernes, 10:00",metaBandejas:"7",metaSplit:"80",metaEnf:"30"};

const SPECS = {
  partidos:[
    {sec:"Datos del partido"},
    {k:"fecha",label:"Fecha",type:"date"},
    {k:"tipo",label:"Tipo",type:"select",options:["Amistoso","Americano","Liga","Torneo"]},
    {k:"companero",label:"Compañero",type:"text"},
    {k:"rivales",label:"Rivales",type:"text"},
    {k:"ronda",label:"Ronda (si es de torneo)",type:"select",options:["—","Zona","32avos","16avos","Octavos","Cuartos","Semifinal","Final"]},
    {sec:"Resultado"},
    {k:"resultado",label:"Games por set",type:"score",full:true},
    {k:"gano",label:"¿Cómo terminó?",type:"select",options:["Ganado","Perdido"],hint:"Se completa solo con el resultado"},
    {sec:"Números"},
    {k:"enf",label:"Errores no forzados",type:"number",min:0,max:99,hint:"Contalos o estimalos al terminar"},
    {k:"winners",label:"Winners",type:"number",min:0,max:99},
    {sec:"Lo que se puede contar (de cada 10)"},
    {k:"saques",label:"Primeros saques adentro",type:"number",min:0,max:10,pct:true,hint:"De cada 10 saques, cuántos entraron"},
    {k:"restos",label:"Restos adentro",type:"number",min:0,max:10,pct:true},
    {k:"globos",label:"Globos que pasaron al rival",type:"number",min:0,max:10,pct:true},
    {k:"bandejasP",label:"Bandejas que quedaron profundas",type:"number",min:0,max:10,pct:true,hint:"Dejá vacío lo que no contaste"},
    {sec:"Cabeza"},
    {k:"nevera",label:"Cuánta nevera recibiste",type:"range",min:0,max:5,def:2,hint:"0 nada, 5 me la tiraron toda"},
    {k:"respNevera",label:"Cómo respondiste a la nevera",type:"range",min:1,max:5,def:3,hint:"1 me desordené, 5 la usé a mi favor"},
    {k:"ansiedad",label:"Ansiedad en el partido",type:"range",min:1,max:10,def:5},
    {k:"nota",label:"Nota general",type:"range",min:1,max:10,def:6},
    {sec:"Lo que notaste"},
    {k:"lectura",label:"Lectura del rival (primeros games)",type:"textarea",full:true,ph:"Quién es el más débil, a dónde no les gusta recibir, cómo sacan…"},
    {k:"funciono",label:"Lo que funcionó",type:"textarea"},
    {k:"mejorar",label:"A mejorar",type:"textarea"}
  ],
  entrenos:[
    {sec:"La sesión"},
    {k:"fecha",label:"Fecha",type:"date"},
    {k:"foco",label:"Foco del día",type:"select",options:[...Object.values(PLAN),"Otro"]},
    {k:"tipo",label:"Tipo",type:"select",options:["Clase","Cancha libre","Partido de práctica","Físico"]},
    {k:"minutos",label:"Minutos",type:"number",min:0,max:600,def:60},
    {sec:"Técnica"},
    {k:"potencia",label:"Canalización de potencia",type:"range",min:1,max:5,def:3,hint:"Peso del cuerpo hacia adelante, impacto adelante"},
    {k:"bandejas",label:"Bandejas profundas (de 10)",type:"number",min:0,max:10,pct:true,hint:"Dejalo vacío si no las mediste"},
    {k:"bajas",label:"Bolas bajas que salieron bien (de 10)",type:"number",min:0,max:10,pct:true},
    {k:"globosE",label:"Globos que pasaron (de 10)",type:"number",min:0,max:10,pct:true},
    {k:"sensacion",label:"Sensaciones",type:"range",min:1,max:5,def:3},
    {k:"golpes",label:"Golpes trabajados",type:"checks",full:true,options:["Golpe de derecha","Golpe de revés","Juego de fondo","Empuñadura","Bandeja","Víbora","Bolas bajas (agacharse)","Paredes","Volea","Saque","Remate","Globo"]},
    {sec:"Notas"},
    {k:"notas",label:"Notas del entreno",type:"textarea",full:true,ph:"Qué te dijo el profe, qué ajustaste, qué sentiste…"}
  ],
  fisico:[
    {sec:"Movilidad"},
    {k:"fecha",label:"Fecha",type:"date"},
    {k:"split",label:"Split step (% de golpes rivales)",type:"range",min:0,max:100,step:10,def:50,hint:"Meta: 80%"},
    {k:"explosivo",label:"Frenadas y arranques cortos (3-4 m)",type:"range",min:1,max:5,def:3},
    {sec:"Articulaciones"},
    {k:"rodilla",label:"Molestia en rodillas",type:"range",min:0,max:10,def:0,hint:"0 nada, 10 no puedo jugar"},
    {k:"tobillo",label:"Molestia en tobillos",type:"range",min:0,max:10,def:0},
    {k:"superficie",label:"Superficie",type:"select",options:["Sintético con arena","Cemento","Indoor"]},
    {sec:"Trabajo hecho"},
    {k:"trabajo",label:"Trabajo hecho",type:"checks",full:true,options:["Split step","Desplazamiento lateral","Arranques 3-4 m","Frenada y recuperación","Movilidad de cadera","Fortalecimiento de tobillo","Fortalecimiento de rodilla","Elongación"]},
    {k:"notas",label:"Notas",type:"textarea",full:true}
  ],
  torneos:[
    {sec:"Datos del torneo"},
    {k:"nombre",label:"Nombre del torneo",type:"text",ph:"Torneo de primavera"},
    {k:"club",label:"Club",type:"text"},
    {k:"fecha",label:"Empieza",type:"date"},
    {k:"fechaFin",label:"Termina",type:"date",hint:"Los partidos de tipo Torneo entre estas fechas se agrupan acá"},
    {k:"categoria",label:"Categoría",type:"select",options:["6ta","5ta","4ta","7ma","Suma","Libre"]},
    {k:"companero",label:"Compañero",type:"text"},
    {k:"formato",label:"Formato",type:"select",options:["Zonas + eliminación","Eliminación directa","Americano","Liga"]},
    {k:"cuadro",label:"Tamaño del cuadro: la llave empieza en",type:"select",options:["Auto","32avos","16avos","Octavos","Cuartos","Semifinal"],hint:"32avos = 64 parejas, 16avos = 32, octavos = 16. Auto lo toma de tu primer partido de llave"},
    {sec:"Cómo va"},
    {k:"instancia",label:"Estado",type:"select",options:["En juego",...INSTANCIAS],hint:"Dejalo en juego: se actualiza solo cuando perdés en una llave o ganás la final"},
    {k:"puntos",label:"Puntos de ranking",type:"number",min:0,max:9999},
    {sec:"Objetivo y balance"},
    {k:"objetivo",label:"Objetivo antes del torneo",type:"textarea",ph:"Llegar a cuartos, no más de 12 errores no forzados por partido…"},
    {k:"balance",label:"Balance después del torneo",type:"textarea",ph:"Qué salió bien, qué pasó en el partido que perdiste…"}
  ],
  mental:[
    {sec:"La situación"},
    {k:"fecha",label:"Fecha",type:"date"},
    {k:"tipo",label:"Situación",type:"select",options:["Frustración","Nevera / aislamiento","Mi compañero falla","Lectura del rival","Rutina entre puntos","Otro"]},
    {k:"control",label:"Control emocional",type:"range",min:1,max:10,def:5},
    {k:"situacion",label:"Qué pasó",type:"textarea",full:true},
    {sec:"Reflexión"},
    {k:"senti",label:"Qué sentí",type:"textarea"},
    {k:"hice",label:"Qué hice",type:"textarea"},
    {k:"proxima",label:"Qué voy a hacer la próxima",type:"textarea",full:true}
  ],
  ficha:[
    {k:"nombre",label:"Nombre",type:"text"},{k:"edad",label:"Edad",type:"text"},{k:"altura",label:"Altura",type:"text"},
    {k:"posicion",label:"Posición",type:"text"},{k:"categoria",label:"Categoría actual",type:"text"},{k:"objetivo",label:"Objetivo",type:"text"},
    {k:"origen",label:"Deporte de origen",type:"text"},{k:"horario",label:"Horario de entreno",type:"text"},
    {k:"estilo",label:"Estilo de juego",type:"textarea"},{k:"desafio",label:"Principal desafío mental",type:"textarea"},
    {k:"metaBandejas",label:"Meta bandejas profundas (de 10)",type:"text"},{k:"metaSplit",label:"Meta split step (%)",type:"text"},
    {k:"metaEnf",label:"Meta baja de errores no forzados (%)",type:"text"}
  ]
};
const NAMES = {partidos:"Partido",torneos:"Torneo",entrenos:"Entrenamiento",fisico:"Físico",mental:"Mental"};

/* ---------- estado ---------- */
const S = {partidos:[],torneos:[],entrenos:[],fisico:[],mental:[],ficha:{...FICHA_DEF},mode:"loading",open:null,editing:null,confirm:null,filter:"todos",loaded:new Set(),opened:new Set(),closed:new Set(),chart:"rend",day:null};
let db=null;

/* ---------- utilidades ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2,"0");
const iso = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today = () => iso(new Date());
const parse = s => { const [y,m,d]=String(s||"").split("-").map(Number); return new Date(y||1970,(m||1)-1,d||1); };
const monday = d => { const x=new Date(d); const w=(x.getDay()+6)%7; x.setDate(x.getDate()-w); x.setHours(0,0,0,0); return x; };
const fmtD = s => { const d=parse(s); return {dia:DIAS[d.getDay()],num:d.getDate()+" "+MESES[d.getMonth()],y:d.getFullYear()}; };
const num = v => v===""||v==null||isNaN(+v) ? null : +v;
const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
const r1 = v => v==null ? "–" : (Math.round(v*10)/10).toString().replace(".",",");
const newId = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const sorted = col => [...S[col]].sort((a,b)=> (b.fecha||"").localeCompare(a.fecha||"") || (b.creado||0)-(a.creado||0));
const asc = col => [...S[col]].sort((a,b)=> (a.fecha||"").localeCompare(b.fecha||"") || (a.creado||0)-(b.creado||0));
let toastT; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2400); }
function setStatus(m){ document.getElementById("status").textContent=m; }

/* ---------- almacenamiento ---------- */
const LS="padel-cuaderno-v1";
function lsLoad(){ try{ const o=JSON.parse(localStorage.getItem(LS)||"{}"); COLS.forEach(c=>S[c]=o[c]||[]); if(o.ficha) S.ficha={...FICHA_DEF,...o.ficha}; }catch(e){} }
function lsSave(){ try{ localStorage.setItem(LS,JSON.stringify({partidos:S.partidos,torneos:S.torneos,entrenos:S.entrenos,fisico:S.fisico,mental:S.mental,ficha:S.ficha})); }catch(e){} }

async function saveEntry(col,id,data){
  if(db){ await db.collection(col).doc(id).set(data); }
  else { const i=S[col].findIndex(x=>x.id===id); const row={...data,id}; if(i>=0) S[col][i]=row; else S[col].push(row); lsSave(); render(); }
}
async function deleteEntry(col,id){
  if(db){ await db.collection(col).doc(id).delete(); }
  else { S[col]=S[col].filter(x=>x.id!==id); lsSave(); render(); }
}
async function saveFicha(data){
  if(db){ await db.doc("perfil/ficha").set(data); }
  else { S.ficha={...FICHA_DEF,...data}; lsSave(); render(); }
}

async function start(){
  let timer=setTimeout(()=>{ if(S.mode==="loading"){ setStatus("Sin conexión con tus datos todavía…"); } },10000);
  let use=null;
  try{ use = window.claude && window.claude.use ? await window.claude.use("db") : null; }catch(e){ use=null; }
  if(!use){ clearTimeout(timer); S.mode="local"; lsLoad(); setStatus("Guardado en este navegador"); render(); return; }
  db=use; S.mode="db"; render();
  const done = () => { if(S.loaded.size>=COLS.length+1){ clearTimeout(timer); setStatus("Guardado en la nube ✓"); } };
  COLS.forEach(c=>{
    db.collection(c).onSnapshot(snap=>{
      S[c]=snap.docs.map(d=>({...d.data(),id:d.id}));
      if(!snap.metadata.fromCache){ S.loaded.add(c); done(); }
      render();
    },err=>{ setStatus("Error al leer "+c+": "+err.code); });
  });
  db.doc("perfil/ficha").onSnapshot(snap=>{
    S.ficha={...FICHA_DEF,...(snap.exists?snap.data():{})};
    if(!snap.metadata.fromCache){ S.loaded.add("ficha"); done(); }
    render();
  },err=>setStatus("Error al leer la ficha: "+err.code));
}

/* ---------- resultado set por set ---------- */
function parseResultado(str){
  const sets=[]; let tercero="set";
  String(str||"").trim().split(/\s+/).forEach(tok=>{
    let m=tok.match(/^\[(\d+)-(\d+)\]$/); if(m){ sets.push({a:m[1],b:m[2]}); tercero="super"; return; }
    m=tok.match(/^(\d+)-(\d+)(?:\((\d+)-(\d+)\))?$/); if(m) sets.push({a:m[1],b:m[2],tbA:m[3]||"",tbB:m[4]||""});
  });
  return {sets,tercero};
}
function scoreHTML(col,f){
  const editing=S.editing&&S.editing.col===col?S[col].find(x=>x.id===S.editing.id):null;
  let sets=[],tercero="set";
  if(editing){ if(Array.isArray(editing.sets)){ sets=editing.sets; tercero=editing.tercero||"set"; } else ({sets,tercero}=parseResultado(editing.resultado)); }
  const g=(i,w)=>esc((sets[i]||{})[w]||"");
  const row=(i,label)=>`<div class="setrow" data-row="${i}">${label}
      <input class="g" id="${col}-s${i}a" inputmode="numeric" maxlength="2" data-i="${i}" data-w="a" value="${g(i,"a")}" aria-label="${i+1}º set, games nuestros">
      <span class="dash">–</span>
      <input class="g" id="${col}-s${i}b" inputmode="numeric" maxlength="2" data-i="${i}" data-w="b" value="${g(i,"b")}" aria-label="${i+1}º set, games de ellos">
      <span class="tb" data-tb="${i}" hidden>Tie-break <input id="${col}-s${i}ta" inputmode="numeric" maxlength="2" data-i="${i}" data-w="tbA" value="${g(i,"tbA")}" aria-label="Tie-break, puntos nuestros"> – <input id="${col}-s${i}tb" inputmode="numeric" maxlength="2" data-i="${i}" data-w="tbB" value="${g(i,"tbB")}" aria-label="Tie-break, puntos de ellos"></span></div>`;
  return `<div class="field full"><span class="lab">${esc(f.label)}</span><div class="score" data-score>
    <div class="scorehead"><span></span><span>Nosotros</span><span></span><span>Ellos</span><span></span></div>
    ${row(0,`<span class="sl">1er set</span>`)}
    ${row(1,`<span class="sl">2do set</span>`)}
    ${row(2,`<select id="${col}-tercero" data-tercero aria-label="Cómo se definió"><option value="set"${tercero==="set"?" selected":""}>3er set</option><option value="super"${tercero==="super"?" selected":""}>Súper TB</option></select>`)}
    <div class="scoresum" data-sum><span class="hint">Cargá los games del primer set.</span></div>
  </div></div>`;
}
function setState(a,b,tbA,tbB,isSuper){
  // devuelve {done, winner:"a"|"b"|null, needTb}
  if(a===""||b==="") return {done:false};
  a=+a; b=+b;
  if(isSuper){ const mx=Math.max(a,b); if(mx>=10&&Math.abs(a-b)>=2) return {done:true,winner:a>b?"a":"b"}; return {done:false}; }
  const needTb=(a===7&&b===6)||(a===6&&b===7)||(a===6&&b===6);
  if(needTb){ if(a===6&&b===6) return {done:false,needTb:true};
    return {done:true,winner:a>b?"a":"b",needTb:true}; }
  const mx=Math.max(a,b), mn=Math.min(a,b);
  if((mx===6&&mn<=4)||(mx===7&&mn===5)) return {done:true,winner:a>b?"a":"b"};
  return {done:false,invalid:mx>7||(mx===7&&mn<5)};
}
function readScore(sc){
  const val=(i,w)=>{ const el=sc.querySelector(`input[data-i="${i}"][data-w="${w}"]`); return el?el.value.trim():""; };
  const tercero=sc.querySelector("[data-tercero]").value;
  const sets=[]; let wa=0,wb=0; const parts=[];
  for(let i=0;i<3;i++){
    const row=sc.querySelector(`[data-row="${i}"]`); if(row.hidden) break;
    const a=val(i,"a"), b=val(i,"b"); if(a===""&&b==="") break;
    const isSuper=i===2&&tercero==="super";
    const st=setState(a,b,val(i,"tbA"),val(i,"tbB"),isSuper);
    const set={a,b}; let txt=isSuper?`[${a}-${b}]`:`${a}-${b}`;
    if(st.needTb&&!isSuper){ set.tbA=val(i,"tbA"); set.tbB=val(i,"tbB"); if(set.tbA!==""||set.tbB!=="") txt+=`(${set.tbA}-${set.tbB})`; }
    sets.push(set); parts.push(txt);
    if(st.done){ st.winner==="a"?wa++:wb++; }
  }
  const winner = wa===2?"Ganado":wb===2?"Perdido":null;
  return {sets,tercero,str:parts.join(" "),wa,wb,winner};
}
function updateScore(sc){
  const val=(i,w)=>{ const el=sc.querySelector(`input[data-i="${i}"][data-w="${w}"]`); return el?el.value.trim():""; };
  const tercero=sc.querySelector("[data-tercero]").value;
  let wa=0,wb=0,prevDone=true,msg="";
  for(let i=0;i<3;i++){
    const row=sc.querySelector(`[data-row="${i}"]`);
    const visible = i===0 || (prevDone && wa<2 && wb<2);
    row.hidden=!visible;
    const isSuper=i===2&&tercero==="super";
    const st=visible?setState(val(i,"a"),val(i,"b"),val(i,"tbA"),val(i,"tbB"),isSuper):{done:false};
    sc.querySelector(`[data-tb="${i}"]`).hidden=!(visible&&st.needTb&&!isSuper);
    row.querySelectorAll("input.g").forEach(x=>x.classList.toggle("won",!!(st.done&&st.winner===x.dataset.w)));
    if(visible&&st.invalid) msg=`Revisá el ${i+1}º set: un set termina 6-4 o menos, 7-5 o 7-6 con tie-break.`;
    if(st.done){ st.winner==="a"?wa++:wb++; }
    prevDone = visible && st.done;
  }
  const r=readScore(sc); const sum=sc.querySelector("[data-sum]");
  const form=sc.closest("form"); const gano=form&&form.elements.gano;
  if(r.winner&&gano) gano.value=r.winner;
  if(msg) sum.innerHTML=`<span class="pill bad">${esc(msg)}</span>`;
  else if(!r.str) sum.innerHTML=`<span class="hint">Cargá los games del primer set.</span>`;
  else sum.innerHTML=`<span>Resultado <b>${esc(r.str)}</b></span><span>Sets <b>${r.wa}-${r.wb}</b></span>${r.winner?`<span class="pill ${r.winner==="Ganado"?"good":"bad"}">${r.winner}</span>`:`<span class="hint">Seguí con el próximo set</span>`}`;
}
function advance(sc,el){
  const v=el.value; if(!v) return;
  // un dígito alcanza salvo que pueda venir 10+ (súper tie-break)
  const isSuper=el.dataset.i==="2"&&sc.querySelector("[data-tercero]").value==="super";
  if(isSuper&&(v==="1")) return;
  const inputs=[...sc.querySelectorAll("input")].filter(x=>!x.closest("[hidden]"));
  const i=inputs.indexOf(el); if(i>=0&&inputs[i+1]) inputs[i+1].focus();
}

/* ---------- formularios ---------- */
function fieldHTML(col,f,val){
  if(f.sec) return `<div class="fsec"><h4>${esc(f.sec)}</h4></div>`;
  if(f.type==="select"||f.type==="range"){
    const opts=f.type==="select"?f.options:(()=>{const a=[];for(let v=f.min;v<=f.max;v+=(f.step||1))a.push(v);return a;})();
    const cls=f.type==="range"?"opts scale":"opts";
    const longSel=f.type==="select"&&(f.options.length>3||f.options.join("").length>24);
    const wide=f.full||(f.type==="range"&&(f.max-f.min)/(f.step||1)>=6)||longSel;
    return `<div class="field${wide?" full":""}"><span class="lab">${esc(f.label)}</span><div class="${cls}" role="radiogroup">${opts.map((o,i)=>`<label><input type="radio" id="${col}-${f.k}-${i}" name="${f.k}" value="${esc(o)}"${String(o)===String(val)?" checked":""}><span>${esc(o)}</span></label>`).join("")}</div>${f.hint?`<span class="hint">${esc(f.hint)}</span>`:""}</div>`;
  }
  if(f.type==="number") return `<div class="field${f.full?" full":""}"><label for="${col}-${f.k}">${esc(f.label)}</label><div class="stepper"><button type="button" class="btn" data-act="step" data-d="-1" aria-label="Restar">−</button><input type="text" inputmode="numeric" id="${col}-${f.k}" name="${f.k}" value="${esc(val)}" data-min="${f.min}" data-max="${f.max}" placeholder="–"><button type="button" class="btn" data-act="step" data-d="1" aria-label="Sumar">+</button>${f.pct?`<span class="pct">${val!==""&&val!=null?Math.round(+val*10)+"%":"–"}</span>`:""}</div>${f.hint?`<span class="hint">${esc(f.hint)}</span>`:""}</div>`;
  const id=col+"-"+f.k; const full=f.full?" full":"";
  const hint=f.hint?`<span class="hint">${esc(f.hint)}</span>`:"";
  if(f.type==="textarea") return `<div class="field${full}"><label for="${id}">${esc(f.label)}</label><textarea id="${id}" name="${f.k}" placeholder="${esc(f.ph||"")}">${esc(val)}</textarea>${hint}</div>`;
  if(f.type==="select") return `<div class="field${full}"><label for="${id}">${esc(f.label)}</label><select id="${id}" name="${f.k}">${f.options.map(o=>`<option${o===val?" selected":""}>${esc(o)}</option>`).join("")}</select>${hint}</div>`;
  if(f.type==="range") return `<div class="field${full}"><label for="${id}">${esc(f.label)}</label><div class="rng"><input type="range" id="${id}" name="${f.k}" min="${f.min}" max="${f.max}" step="${f.step||1}" value="${esc(val)}"><output for="${id}">${esc(val)}</output></div>${hint}</div>`;
  if(f.type==="score") return scoreHTML(col,f);
  if(f.type==="checks"){ const v=Array.isArray(val)?val:[]; return `<div class="field${full}"><span class="lab">${esc(f.label)}</span><div class="checks">${f.options.map((o,i)=>`<label><input type="checkbox" id="${id}-${i}" name="${f.k}" value="${esc(o)}"${v.includes(o)?" checked":""}>${esc(o)}</label>`).join("")}</div>${hint}</div>`; }
  const extra=f.type==="number"?` min="${f.min}" max="${f.max}" inputmode="numeric"`:"";
  return `<div class="field${full}"><label for="${id}">${esc(f.label)}</label><input type="${f.type}" id="${id}" name="${f.k}" value="${esc(val)}" placeholder="${esc(f.ph||"")}"${extra}>${hint}</div>`;
}
function defaults(col){
  const o={}; SPECS[col].forEach(f=>{ if(f.sec) return; o[f.k]= f.type==="date"?today(): f.type==="checks"?[]: f.def!=null?f.def: f.type==="select"?f.options[0]:""; });
  if(col==="partidos"&&S.ctx){ const t=S.torneos.find(x=>x.id===S.ctx.torneoId); if(t){ o.tipo="Torneo"; o.companero=t.companero||""; const fin=t.fechaFin||t.fecha; o.fecha=o.fecha<t.fecha?t.fecha:o.fecha>fin?fin:o.fecha; } }
  if(col==="entrenos"){ const w=new Date().getDay(); if(PLAN[w]) o.foco=PLAN[w]; if(w===2) o.tipo="Físico"; }
  return o;
}
function formHTML(col){
  const editing = S.editing && S.editing.col===col ? S[col].find(x=>x.id===S.editing.id) : null;
  const v = editing ? {...defaults(col),...editing} : defaults(col);
  return `<div class="formcard"><form id="form-${col}" data-col="${col}">
    ${SPECS[col].map(f=>fieldHTML(col,f,v[f.k])).join("")}
    <div class="formactions"><button type="button" class="btn" data-act="cancel">Cancelar</button><button type="submit" class="btn primary">${editing?"Guardar cambios":"Guardar"}</button></div>
  </form></div>`;
}
function readForm(form,col){
  const o={};
  SPECS[col].forEach(f=>{
    if(f.sec) return;
    if(f.type==="score"){ const sc=readScore(form.querySelector("[data-score]")); o.resultado=sc.str; o.sets=sc.sets; o.tercero=sc.tercero; }
    else if(f.type==="checks") o[f.k]=[...form.querySelectorAll(`input[name="${f.k}"]:checked`)].map(i=>i.value);
    else { const el=form.elements[f.k]; let val=el.value; if(f.type==="number"||f.type==="range") val = val===""?null:+val; o[f.k]=val; }
  });
  return o;
}

/* ---------- gráficos ---------- */
function lineChart(series,{yMin=0,yMax,goal,goalLabel,labels}){
  const W=Math.round(Math.min(940,Math.max(340,(window.innerWidth||600)-32))),H=W<600?170:190,L=34,R=14,T=14,B=28; const n=labels.length;
  if(n<2) return null;
  const x=i=>L+(n===1?0:i*(W-L-R)/(n-1)); const y=v=>T+(1-(v-yMin)/(yMax-yMin))*(H-T-B);
  const ticks=[]; const step=(yMax-yMin)/5; for(let i=0;i<=5;i++) ticks.push(yMin+i*step);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img">`;
  ticks.forEach(t=>{ s+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L-6}" y="${y(t)+4}" text-anchor="end">${Math.round(t)}</text>`; });
  const every=Math.ceil(n/7); labels.forEach((lb,i)=>{ if(i%every===0||i===n-1) s+=`<text class="axis" x="${x(i)}" y="${H-8}" text-anchor="${i===n-1?"end":i===0?"start":"middle"}">${esc(lb)}</text>`; });
  if(goal!=null){ s+=`<line class="goal" x1="${L}" x2="${W-R}" y1="${y(goal)}" y2="${y(goal)}"/><text class="goaltxt" x="${W-R}" y="${y(goal)-6}" text-anchor="end">${esc(goalLabel)}</text>`; }
  series.forEach((ser,si)=>{
    const pts=ser.values.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
    if(!pts.length) return;
    const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
    if(si===0 && pts.length>1) s+=`<path class="a1" d="${d} L${pts[pts.length-1][0]} ${y(yMin)} L${pts[0][0]} ${y(yMin)} Z"/>`;
    s+=`<path class="l${si+1}" d="${d}"/>`;
    pts.forEach((p,i)=>{ const last=i===pts.length-1; s+=`<circle class="d${si+1}" cx="${p[0]}" cy="${p[1]}" r="${last?5:3}"/>`; });
  });
  return s+"</svg>";
}
function chartCard(title,sub,svg,emptyMsg,legend){
  return `<div class="chart"><div class="ch"><h3>${esc(title)}</h3><span class="pill">${esc(sub)}</span></div>${legend||""}${svg||`<div class="empty">${esc(emptyMsg)}</div>`}</div>`;
}
const shortD = s => { const d=parse(s); return d.getDate()+"/"+(d.getMonth()+1); };

/* ---------- métricas ---------- */
function metrics(){
  const now=new Date(); const mon=monday(now); const monS=iso(mon); const sun=new Date(mon); sun.setDate(sun.getDate()+6); const sunS=iso(sun);
  const inWeek=r=>r.fecha>=monS&&r.fecha<=sunS;
  const weekE=S.entrenos.filter(inWeek), weekP=S.partidos.filter(inWeek);
  const doneDays=new Set(weekE.map(r=>parse(r.fecha).getDay()));
  const matchDays=new Set(weekP.map(r=>parse(r.fecha).getDay()));
  const mStart=iso(new Date(now.getFullYear(),now.getMonth(),1));
  const minutosMes=S.entrenos.filter(r=>r.fecha>=mStart).reduce((a,r)=>a+(num(r.minutos)||0),0);
  const P=asc("partidos"); const ganados=P.filter(p=>p.gano==="Ganado").length;
  const enfVals=P.map(p=>num(p.enf)).filter(v=>v!=null);
  const enfBase=enfVals.length>=4?avg(enfVals.slice(0,3)):null; const enfRec=enfVals.length?avg(enfVals.slice(-3)):null;
  const band=asc("entrenos").map(e=>num(e.bandejas)).filter(v=>v!=null); const bandRec=band.length?avg(band.slice(-5)):null;
  const spl=asc("fisico").map(f=>num(f.split)).filter(v=>v!=null); const splRec=spl.length?avg(spl.slice(-3)):null;
  return {mon,doneDays,matchDays,weekCount:doneDays.size,minutosMes,ganados,jugados:P.length,enfBase,enfRec,bandRec,splRec,enfVals};
}

/* ---------- vistas ---------- */
const pctOf=v=>v==null||v===""||isNaN(+v)?null:Math.round(+v*10);
const CONTEOS=[["saques","Saques"],["restos","Restos"],["globos","Globos"],["bandejasP","Bandejas"]];
function rendimiento(p){ const parts=[]; const n=k=>num(p[k]);
  if(n("nota")!=null) parts.push(n("nota")/10);
  if(n("respNevera")!=null) parts.push((n("respNevera")-1)/4);
  if(n("ansiedad")!=null) parts.push(1-(n("ansiedad")-1)/9);
  CONTEOS.forEach(([k])=>{ if(n(k)!=null) parts.push(n(k)/10); });
  return parts.length?Math.round(avg(parts)*100):null; }
function weekStrip(m){
  const w=new Date().getDay(); const mon=monday(new Date());
  const days=[1,2,3,4,5].map(d=>{ const st=m.doneDays.has(d)?"done":m.matchDays.has(d)?"match":""; const tip=PLAN[d]+(st==="done"?" · entrenado":st==="match"?" · partido":"");
    return `<button type="button" class="wd ${st}${d===w?" today":""}${S.day===d?" sel":""}" data-act="day" data-d="${d}" aria-pressed="${S.day===d}" title="${esc(tip)}"><span class="wl">${DIAS[d]}</span><span class="dot"></span></button>`; }).join("");
  const hoy=PLAN[w]?`<p class="wtoday">Hoy: ${esc(PLAN[w])}</p>`:"";
  let panel="";
  if(S.day){ const dt=new Date(mon); dt.setDate(dt.getDate()+S.day-1); const ds=iso(dt); const f=fmtD(ds);
    const rows=["entrenos","partidos","fisico","mental"].flatMap(c=>S[c].filter(r=>r.fecha===ds).map(r=>({col:c,r})));
    const largo=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][S.day];
    panel=`<div class="wpanel"><div class="wph"><div><b>${largo} ${esc(f.num)}</b><span>Plan: ${esc(PLAN[S.day])}</span></div><button class="btn small" data-act="day" data-d="${S.day}">Cerrar</button></div>
      ${rows.length?`<div class="list">${rows.map(x=>entryHTML(x.col,x.r,false)).join("")}</div>`:`<p class="wnone">${ds>iso(new Date())?"Todavía no llegó este día.":"No cargaste nada este día."}</p>`}</div>`; }
  return `<div class="wkbox"><div class="wk">${days}</div><div class="wfoot">${hoy||"<span></span>"}<div class="wlegend"><span><i class="dot done"></i>Entrenado</span><span><i class="dot match"></i>Partido</span></div></div>${panel}</div>`;
}
function vInicio(){
  const m=metrics(); const F=S.ficha;
  const metaB=num(F.metaBandejas)||7, metaS=num(F.metaSplit)||80, metaE=num(F.metaEnf)||30;
  const nE=asc("partidos").filter(p=>num(p.enf)!=null).length; let enfNote=nE?`Por partido · últimos ${Math.min(3,nE)}`:"Sin partidos cargados", enfCls="";
  if(m.enfBase!=null&&m.enfRec!=null){ const ch=(m.enfRec-m.enfBase)/m.enfBase*100; enfNote=(ch<=0?"":"+")+Math.round(ch)+"% vs. al inicio"; enfCls=ch<=-metaE?"good":ch<0?"warn":"bad"; }
  const pend = 5 - [1,2,3,4,5].filter(d=>m.doneDays.has(d)).length;
  const P=asc("partidos").slice(-15), E=asc("entrenos").filter(e=>num(e.bandejas)!=null).slice(-15), Fi=asc("fisico").slice(-15);
  const enfMax=Math.max(20,...P.map(p=>num(p.enf)||0)); const enfTop=Math.ceil(enfMax/5)*5;
  const c1=lineChart([{values:P.map(p=>num(p.enf))}],{yMax:enfTop,labels:P.map(p=>shortD(p.fecha)),
    goal:m.enfBase!=null?m.enfBase*(1-metaE/100):null,goalLabel:`Meta −${metaE}%`});
  const c2=lineChart([{values:E.map(e=>num(e.bandejas))}],{yMax:10,goal:metaB,goalLabel:`Meta ${metaB}/10`,labels:E.map(e=>shortD(e.fecha))});
  const c3=lineChart([{values:Fi.map(f=>num(f.split))}],{yMax:100,goal:metaS,goalLabel:`Meta ${metaS}%`,labels:Fi.map(f=>shortD(f.fecha))});
  const c4=lineChart([{values:P.map(p=>num(p.respNevera)!=null?num(p.respNevera)*2:null)},{values:P.map(p=>num(p.ansiedad))}],{yMax:10,labels:P.map(p=>shortD(p.fecha))});
  const lg=`<div class="legend"><span><i style="background:var(--court)"></i>Respuesta a la nevera (×2)</span><span><i style="background:var(--warn)"></i>Ansiedad</span></div>`;
  const c5=lineChart([{values:P.map(p=>rendimiento(p))}],{yMax:100,labels:P.map(p=>shortD(p.fecha))});
  const CHS={rend:[c5,"Rendimiento del partido en %. Cargá 2 partidos para ver la curva.",""],enf:[c1,"Errores no forzados por partido. Cargá 2 partidos para ver la curva.",""],band:[c2,"Bandejas profundas de 10. Anotalas en 2 entrenos para ver la curva.",""],split:[c3,"Split step en % de golpes rivales. Cargá 2 registros físicos.",""],nev:[c4,"Nevera y ansiedad. Aparece cuando tengas 2 partidos cargados.",lg]};
  const cur=CHS[S.chart]||CHS.rend; const chartBody=(cur[0]?cur[2]:"")+(cur[0]||`<div class="empty">${esc(cur[1])}</div>`);
  return `
  <section class="sechead"><div><h2>Semana del ${m.mon.getDate()} de ${MESES[m.mon.getMonth()]}</h2>
    <p class="lede">${pend>0?`${pend===1?"Queda 1 día":"Quedan "+pend+" días"} del plan · 10:00`:"Semana completa"}</p></div>
    <div class="row"><a class="btn primary" href="#entrenos" data-new="entrenos">+ Entrenamiento</a><a class="btn ball" href="#partidos" data-new="partidos">+ Partido</a></div></section>
  ${weekStrip(m)}
  <section class="kpis">
    <a class="kpi" href="#entrenos" title="Ver tus entrenamientos"><span class="lab">Esta semana</span><span class="val">${m.weekCount}<small>/5</small></span><span class="note">Días entrenados</span></a>
    <a class="kpi" href="#partidos" title="Ver tus partidos"><span class="lab">Partidos</span><span class="val">${m.ganados}<small>–${m.jugados-m.ganados}</small></span><span class="note">${m.jugados?Math.round(m.ganados/m.jugados*100)+"% ganados":"Todavía sin partidos"}</span></a>
    <button type="button" class="kpi" data-act="chart" data-c="enf" data-scroll="1" title="Ver la evolución de tus errores"><span class="lab">Errores</span><span class="val">${r1(m.enfRec)}</span><span class="note${enfCls?" "+enfCls:""}">${esc(enfNote)}</span></button>
    <button type="button" class="kpi" data-act="chart" data-c="band" data-scroll="1" title="Ver la evolución de tus bandejas"><span class="lab">Bandejas</span><span class="val">${m.bandRec!=null?Math.round(m.bandRec*10)+"<small>%</small>":"–"}</span><span class="note">Profundas · meta ${metaB*10}%</span></button>
  </section>
  <section class="chart"><div class="sechead" style="align-items:center"><h3>Evolución</h3><div class="chartnav">${[["rend","Rendimiento %"],["enf","Errores"],["band","Bandejas"],["split","Split step"],["nev","Nevera"]].map(([k,l])=>`<button class="chip" data-act="chart" data-c="${k}" aria-pressed="${(S.chart||"enf")===k}">${l}</button>`).join("")}</div></div>
    ${chartBody}
  </section>
  <section><div class="sechead"><h3>Lo último que cargaste</h3><a class="btn small" href="#historial">Ver todo el historial</a></div>
    <div style="margin-top:10px">${histList(3)}</div></section>`;
}

function entrySummary(col,r){
  const j = a => (a||[]).join(", ");
  const meta = arr => `<div class="meta">${arr.filter(x=>x[1]!==""&&x[1]!=null&&x[1]!=="–").map(([k,v])=>`<span>${esc(k)} <b>${esc(v)}</b></span>`).join("")}</div>`;
  const txt = arr => arr.filter(x=>x[1]).map(([k,v])=>`<p><em>${esc(k)}:</em> ${esc(v)}</p>`).join("");
  if(col==="partidos") return {t:`<span class="tag ${r.gano==="Ganado"?"win":"loss"}">${esc(r.gano)}</span>${esc(r.torneoId&&S.torneos.find(t=>t.id===r.torneoId)?S.torneos.find(t=>t.id===r.torneoId).nombre:r.tipo)}${r.ronda&&r.ronda!=="—"?" · "+esc(r.ronda):""}${r.rivales?" vs. "+esc(r.rivales):""} <span style="font-family:var(--mono);font-weight:500">${esc(r.resultado)}</span>`,
    b:meta([["Con",r.companero],["Rendimiento",rendimiento(r)!=null?rendimiento(r)+"%":""],["Errores",r.enf],...CONTEOS.map(([k,l])=>[l,pctOf(r[k])!=null?pctOf(r[k])+"%":""]),["Winners",r.winners],["Nevera",r.nevera!=null?r.nevera+"/5":""],["Respuesta",r.respNevera!=null?r.respNevera+"/5":""],["Ansiedad",r.ansiedad!=null?r.ansiedad+"/10":""],["Nota",r.nota!=null?r.nota+"/10":""]])+txt([["Lectura del rival",r.lectura],["Funcionó",r.funciono],["A mejorar",r.mejorar]])};
  if(col==="entrenos") return {t:`<span class="tag">${esc(r.tipo)}</span>${esc(r.foco)}`,
    b:meta([["Min",r.minutos],["Potencia",r.potencia!=null?r.potencia+"/5":""],["Bandejas",pctOf(r.bandejas)!=null?pctOf(r.bandejas)+"%":""],["Bolas bajas",pctOf(r.bajas)!=null?pctOf(r.bajas)+"%":""],["Globos",pctOf(r.globosE)!=null?pctOf(r.globosE)+"%":""],["Sensación",r.sensacion!=null?r.sensacion+"/5":""],["Golpes",j(r.golpes)]])+txt([["Notas",r.notas]])};
  if(col==="torneos"){ const pt=torneoPartidos(r); const f=torneoFase(r,pt);
    return {t:`<span class="tag ${f.champ?"win":f.ended?"":"live"}">${esc(f.estado)}</span>${esc(r.nombre||"Torneo")}`,
    b:meta([["Club",r.club],["Con",r.companero],["Récord",pt.length?recordT(pt).txt:""]])+`<p><a href="#torneos/${esc(r.id)}">Abrir torneo →</a></p>`}; }
  if(col==="fisico") return {t:`<span class="tag">Físico</span>${esc(j(r.trabajo)||"Registro físico")}`,
    b:meta([["Split step",r.split!=null?r.split+"%":""],["Explosividad",r.explosivo!=null?r.explosivo+"/5":""],["Rodillas",r.rodilla!=null?r.rodilla+"/10":""],["Tobillos",r.tobillo!=null?r.tobillo+"/10":""],["Superficie",r.superficie]])+txt([["Notas",r.notas]])+((num(r.rodilla)>=5||num(r.tobillo)>=5)?`<p><span class="pill bad">Molestia alta: bajá la carga y consultá si sigue</span></p>`:"")};
  return {t:`<span class="tag">Mental</span>${esc(r.tipo)}`,
    b:meta([["Control",r.control!=null?r.control+"/10":""]])+txt([["Qué pasó",r.situacion],["Sentí",r.senti],["Hice",r.hice],["La próxima",r.proxima]])};
}
function keyLine(col,r){
  const k=[]; const has=v=>v!==""&&v!=null;
  if(col==="partidos"){ if(has(r.enf)) k.push(r.enf+" errores"); const rd=rendimiento(r); if(rd!=null) k.push(rd+"%"); }
  if(col==="entrenos"){ if(has(r.minutos)) k.push(r.minutos+"′"); if(has(r.bandejas)) k.push(r.bandejas+"/10 band."); }
  if(col==="fisico"){ if(has(r.split)) k.push(r.split+"% split"); if(num(r.rodilla)>=5||num(r.tobillo)>=5) k.push("⚠ molestia"); }
  if(col==="mental"){ if(has(r.control)) k.push("control "+r.control+"/10"); }
  if(col==="torneos"){ const pt=torneoPartidos(r); if(pt.length){ const g=pt.filter(p=>p.gano==="Ganado").length; k.push(g+"–"+(pt.length-g)); } }
  return k;
}
function entryHTML(col,r,showActs=true){
  const d=fmtD(r.fecha); const s=entrySummary(col,r);
  const isConf=S.confirm&&S.confirm.id===r.id;
  const acts=!showActs?"":isConf?`<div class="confirm acts">¿Borrar? <button class="btn small danger" data-act="del" data-col="${col}" data-id="${esc(r.id)}">Sí, borrar</button><button class="btn small" data-act="nodel">No</button></div>`
    :`<div class="acts"><button class="btn small" data-act="edit" data-col="${col}" data-id="${esc(r.id)}">Editar</button><button class="btn small" data-act="ask" data-id="${esc(r.id)}">Borrar</button></div>`;
  const open = S.opened.has(r.id)||isConf;
  return `<details class="entry" data-col="${col}" data-id="${esc(r.id)}"${open?" open":""}><summary><span class="date"><b>${d.dia}</b>${d.num}</span><span class="t">${s.t}</span><span class="k">${keyLine(col,r).map(x=>`<span>${esc(x)}</span>`).join("")}</span></summary><div class="body">${s.b}${acts}</div></details>`;
}
function listSection(col,title,lede,emptyMsg,extra=""){
  const rows=sorted(col); const open=S.open===col;
  return `<section class="sechead"><div><h2>${title}</h2><p class="lede">${lede}</p></div>
    ${open?"":`<button class="btn primary" data-act="new" data-col="${col}">+ Nuevo registro</button>`}</section>
    ${open?formHTML(col):""}
    ${extra}
    <section>${rows.length?`<div class="list">${rows.map(r=>entryHTML(col,r)).join("")}</div>`:`<div class="emptybox">${emptyMsg}</div>`}</section>`;
}
function vPartidos(){
  const P=sorted("partidos"); let extra="";
  if(P.length){ const best=P.filter(p=>p.funciono).slice(0,1)[0], todo=P.filter(p=>p.mejorar).slice(0,1)[0];
    if(best||todo) extra=`<div class="banner">${todo?`<b>Para el próximo partido:</b> ${esc(todo.mejorar)}`:""}${best&&todo?"<br>":""}${best?`<b>Lo que te viene funcionando:</b> ${esc(best.funciono)}`:""}</div>`; }
  return listSection("partidos","Diario de partidos","Cargalo apenas termines.","Todavía no cargaste partidos. El viernes es día de partido: tocá <b>+ Nuevo registro</b> al terminar.",extra);
}
function vEntrenos(){
  const w=new Date().getDay();
  const extra=PLAN[w]?`<div class="banner">Hoy toca <b>${esc(PLAN[w])}</b> a las 10:00. Al cargar el entreno, el foco ya viene elegido.</div>`:"";
  return listSection("entrenos","Bitácora de entrenamiento","Lo que trabajaste en cada clase.","Sin entrenamientos cargados. Después de la clase de las 10:00, anotá el foco, los minutos y cuántas bandejas de 10 quedaron profundas.",extra);
}
function vFisico(){
  const tips=`<details class="guide"><summary>Guía: fútbol → pádel</summary><div class="lib">
    <div class="libcard"><span class="k">Split step</span><p style="margin:0;font-size:14px">Saltito de activación justo cuando el rival impacta. Caés con los pies al ancho de hombros y el peso adelante, listo para salir para cualquier lado.</p></div>
    <div class="libcard"><span class="k">3-4 metros explosivos</span><p style="margin:0;font-size:14px">En pádel no hay piques largos como en el fútbol. Primer paso corto y rápido, frenada en dos apoyos y recuperación al centro.</p></div>
    <div class="libcard"><span class="k">Cuidado articular</span><p style="margin:0;font-size:14px">En sintético con arena, desplazamiento lateral con pasos cruzados cortos, sin girar la rodilla con el pie clavado. Si una molestia pasa de 5/10, bajá la carga.</p></div></div></details>`;
  return listSection("fisico","Adaptación física","Split step, arranques cortos y articulaciones.","Sin registros físicos. El martes es día de físico: anotá tu split step estimado y cómo están las articulaciones.",tips);
}
function vMental(){
  const lib=`<details class="guide"><summary>Biblioteca táctica y mental</summary><div class="lib">
    <div class="libcard"><span class="k">Plan anti nevera</span><ol><li>Aceptalo: si te la tiran, es porque te respetan la pegada.</li><li>Bajá un cambio: menos potencia, más globo y bola al medio.</li><li>Pedile a tu compañero que se mueva para que te lleguen pelotas.</li><li>Un punto ganado cuenta igual aunque no hayas pegado fuerte.</li></ol></div>
    <div class="libcard"><span class="k">Rutina entre puntos (20 s)</span><ol><li>Soltá: dale la espalda a la red, mirá las cuerdas.</li><li>Respirá: inhalá en 4, exhalá en 6.</li><li>Decidí: un objetivo simple para el próximo punto.</li><li>Volvé: chocá la paleta con tu compañero.</li></ol></div>
    <div class="libcard"><span class="k">Cuando el compañero falla</span><ul><li>Una frase corta y positiva: "dale, la próxima".</li><li>Nada de gestos ni caras. Él ya sabe que falló.</li><li>Simplificá vos: margen en la red, bola segura.</li></ul></div>
    <div class="libcard"><span class="k">Escaneo de los primeros games</span><ul><li>¿Quién es el más flojo de revés?</li><li>¿Cómo defienden la bandeja: de pared o de volea?</li><li>¿Suben a la red después del globo?</li><li>¿Dónde sacan en los puntos importantes?</li></ul></div>
    <div class="libcard"><span class="k">Frustración</span><ul><li>Error no forzado: pensá "siguiente", no "otra vez".</li><li>Dos errores seguidos: el próximo punto, solo bola al medio y alta.</li><li>Tu frase ancla, escrita en la empuñadura si hace falta.</li></ul></div>
  </div></details>`;
  return listSection("mental","Diario mental","Momentos difíciles y cómo los manejaste.","Sin registros mentales. Después de un partido difícil, anotá un momento puntual: es la mejor forma de aprender a manejar la nevera.","")+lib;
}
function allRows(){
  const out=[]; COLS.forEach(c=>S[c].forEach(r=>out.push({col:c,r})));
  return out.sort((a,b)=>(b.r.fecha||"").localeCompare(a.r.fecha||"")||(b.r.creado||0)-(a.r.creado||0));
}
function histList(limit,filter="todos"){
  let rows=allRows(); if(filter!=="todos") rows=rows.filter(x=>x.col===filter); if(limit) rows=rows.slice(0,limit);
  if(!rows.length) return `<div class="emptybox">${S.mode==="loading"?"Cargando tus registros…":"Acá va a aparecer todo lo que cargues: partidos, entrenamientos, físico y mental, ordenado por fecha."}</div>`;
  return `<div class="list">${rows.map(x=>entryHTML(x.col,x.r,!limit)).join("")}</div>`;
}
function torneoMatches(t,pt){
  const formHere=S.open==="partidos"&&S.ctx&&S.ctx.torneoId===t.id;
  const rows=pt.map(p=>{
    const isConf=S.confirm&&S.confirm.id===p.id;
    const acts=isConf?`<div class="confirm">¿Borrar? <button class="btn small danger" data-act="del" data-col="partidos" data-id="${esc(p.id)}">Sí, borrar</button><button class="btn small" data-act="nodel">No</button></div>`
      :`<div class="acts"><button class="btn small" data-act="tedit" data-t="${esc(t.id)}" data-id="${esc(p.id)}">Editar</button><button class="btn small" data-act="ask" data-id="${esc(p.id)}">Borrar</button></div>`;
    const m=[["Rendimiento",rendimiento(p)!=null?rendimiento(p)+"%":""],["Errores",p.enf],...CONTEOS.map(([k,l])=>[l,pctOf(p[k])!=null?pctOf(p[k])+"%":""]),["Winners",p.winners],["Nevera",p.nevera!=null?p.nevera+"/5":""],["Respuesta",p.respNevera!=null?p.respNevera+"/5":""],["Ansiedad",p.ansiedad!=null?p.ansiedad+"/10":""],["Nota",p.nota!=null?p.nota+"/10":""]].filter(x=>x[1]!==""&&x[1]!=null);
    const tx=[["Lectura del rival",p.lectura],["Funcionó",p.funciono],["A mejorar",p.mejorar]].filter(x=>x[1]);
    const kk=[p.enf!=null&&p.enf!==""?p.enf+" errores":"",rendimiento(p)!=null?rendimiento(p)+"%":""].filter(Boolean);
    const open=S.opened.has(p.id)||isConf;
    return `<details class="tm" data-id="${esc(p.id)}"${open?" open":""}><summary><span class="tmt"><span class="tag ${p.gano==="Ganado"?"win":"loss"}">${esc(p.gano)}</span>${p.ronda&&p.ronda!=="—"?esc(p.ronda)+" · ":""}${esc(fmtD(p.fecha).dia)} ${esc(fmtD(p.fecha).num)}${p.rivales?" vs. "+esc(p.rivales):""} <span style="font-family:var(--mono);font-weight:500">${esc(p.resultado||"")}</span></span><span class="k">${kk.map(x=>`<span>${esc(x)}</span>`).join("")}</span></summary>
      <div class="tmb">${m.length?`<div class="meta">${m.map(([k,v])=>`<span>${esc(k)} <b>${esc(v)}</b></span>`).join("")}</div>`:""}${tx.map(([k,v])=>`<p><em>${esc(k)}:</em> ${esc(v)}</p>`).join("")}${acts}</div></details>`;
  }).join("");
  return cuadroHTML(t,pt)+`<div class="tmatches"><div class="th"><h4>Partidos del torneo · ${pt.length}</h4>${formHere?"":`<button class="btn small primary" data-act="tnew" data-id="${esc(t.id)}">+ Cargar partido</button>`}</div>
    ${rows||(formHere?"":`<div class="none">Todavía no cargaste partidos de este torneo. Tocá <b>+ Cargar partido</b> después de cada uno.</div>`)}
    ${formHere?formHTML("partidos"):""}</div>`;
}
async function avanzarTorneo(p){
  const t=S.torneos.find(x=>x.id===p.torneoId); if(!t) return;
  if(t.instancia&&t.instancia!=="En juego") return;
  let nuevo=null;
  if(p.ronda==="Final") nuevo=p.gano==="Ganado"?"Campeón":"Final";
  else if(p.gano==="Perdido"&&p.ronda&&p.ronda!=="—"&&p.ronda!=="Zona") nuevo=p.ronda==="Zona"?"Fase de grupos":p.ronda;
  if(!nuevo) return;
  const {id,...rest}=t; await saveEntry("torneos",t.id,{...rest,instancia:nuevo});
  toast(nuevo==="Campeón"?"¡Campeón! Torneo actualizado":"Torneo cerrado: llegaste a "+nuevo);
}
const RONDAS=["32avos","16avos","Octavos","Cuartos","Semifinal","Final"];
const RONDA_LBL={"32avos":"32avos","16avos":"16avos","Octavos":"Octavos","Cuartos":"Cuartos","Semifinal":"Semis","Final":"Final"};
function cuadroHTML(t,pt,bare){
  const yo=(S.ficha.nombre||"Vos"), nos=`${yo} / ${t.companero||"compañero"}`;
  const zona=pt.filter(p=>p.ronda==="Zona");
  const llave=pt.filter(p=>RONDAS.includes(p.ronda));
  let start = t.cuadro&&t.cuadro!=="Auto"?t.cuadro:null;
  const firstPlayed=llave.length?RONDAS[Math.min(...llave.map(p=>RONDAS.indexOf(p.ronda)))]:null;
  if(!start) start=firstPlayed||"Octavos";
  if(firstPlayed&&RONDAS.indexOf(firstPlayed)<RONDAS.indexOf(start)) start=firstPlayed;
  const rounds=RONDAS.slice(RONDAS.indexOf(start));
  const K=rounds.length;
  const fueraEnZona=t.instancia==="Fase de grupos";
  const conZona=zona.length>0||t.formato==="Zonas + eliminación";
  const enZona=conZona&&!fueraEnZona&&!llave.length&&!t.clasificado&&(!t.instancia||t.instancia==="En juego");
  // zona
  let zonaHTML="";
  if(zona.length||t.formato==="Zonas + eliminación"){
    const zg=zona.filter(p=>p.gano==="Ganado").length;
    const est=fueraEnZona?`<span class="pill bad">Eliminado en zona</span>`:!enZona?`<span class="pill good">Clasificado ✓</span>`:`<span class="pill warn">Jugando la zona</span>`;
    const btns=enZona?`<span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap"><button class="btn small" data-act="zona" data-v="si" data-id="${esc(t.id)}">Pasamos de zona</button><button class="btn small" data-act="zona" data-v="no" data-id="${esc(t.id)}">Quedamos afuera</button></span>`
      :(t.clasificado&&!llave.length?`<span style="margin-left:auto"><button class="btn small" data-act="zona" data-v="undo" data-id="${esc(t.id)}">Deshacer</button></span>`:"");
    zonaHTML=`<div class="bk-zona"><div class="zt">Zona <span class="pill">${zg}–${zona.length-zg}</span>${est}${btns}</div>${zona.length?`<ul>${zona.map(p=>`<li><span class="tag ${p.gano==="Ganado"?"win":"loss"}">${p.gano==="Ganado"?"G":"P"}</span>${p.rivales?"vs. "+esc(p.rivales):"Rivales sin cargar"} <b style="font-family:var(--mono)">${esc(p.resultado||"")}</b></li>`).join("")}</ul>`:`<span class="hint">Cargá tus partidos de zona con ronda "Zona".</span>`}</div>`;
  }
  // geometría: cuadro de dos lados que converge en la final
  const half=rounds.map((_,c)=>c<K-1?2**(K-2-c):1);
  const big=half[0]>=8;
  const W=big?170:200, G=big?24:34, SLOT=big?46:66, CH=big?40:52, HEAD=26;
  const totalH=Math.max(half[0]*SLOT, 2*CH+100);
  const nCols=K===1?1:2*(K-1)+1;
  const width=nCols*W+(nCols-1)*G;
  const colL=c=>c*(W+G), colR=c=>(nCols-1-c)*(W+G), colF=(K-1)*(W+G);
  const yS=(c,i)=>HEAD+(i+.5)*totalH/half[c], yF=HEAD+totalH/2;
  const my=[]; let pos=Math.max(0,Math.floor(half[0]/2)-1); for(let c=0;c<K-1;c++){ if(c>0) pos=Math.floor(pos/2); my.push(pos); }
  const sc=(p,side)=>{ if(Array.isArray(p.sets)&&p.sets.length) return p.sets.map(x=>`<i>${esc(side==="a"?x.a:x.b)}</i>`).join(""); return side==="a"?`<i>${esc(p.resultado||"")}</i>`:""; };
  const matchOf=c=>[...llave].reverse().find(p=>p.ronda===rounds[c]);
  let cards="", alive=!fueraEnZona, beat=null, beatShown=false, pendShown=false, nowCol=-1;
  const box=(x,y)=>`left:${x}px;top:${y-CH/2}px;width:${W}px;height:${CH}px`;
  const ghost=st=>`<div class="bk-c ghost" style="${st}"></div>`;
  function mine(c,st){
    const m=matchOf(c);
    if(m){ const g=m.gano==="Ganado"; if(alive&&!g){ alive=false; beat=m.rivales||"Rivales"; }
      return `<div class="bk-c me" style="${st}"><div class="bk-r ${g?"w":""}"><span class="nm">${esc(nos)}</span><span class="sc">${sc(m,"a")}</span></div><div class="bk-r ${g?"":"w"}"><span class="nm">${esc(m.rivales||"Rivales")}</span><span class="sc">${sc(m,"b")}</span></div></div>`; }
    if(alive&&!pendShown&&!enZona){ pendShown=true; nowCol=c;
      return `<div class="bk-c pend" style="${st}"><div class="bk-r"><span class="nm">${esc(nos)}</span></div><div class="bk-r tbd"><span class="nm">Por definir</span></div></div>`; }
    if(beat&&!beatShown){ beatShown=true;
      return `<div class="bk-c riv" style="${st}"><div class="bk-r"><span class="nm">${esc(beat)}</span></div><div class="bk-r tbd"><span class="nm">Por definir</span></div></div>`; }
    return ghost(st);
  }
  for(let c=0;c<K-1;c++){
    for(let i=0;i<half[c];i++){
      const stL=box(colL(c),yS(c,i)); cards+= i===my[c]?mine(c,stL):ghost(stL);
      cards+=ghost(box(colR(c),yS(c,i)));
    }
  }
  cards+=mine(K-1,box(colF,yF));
  const fin=matchOf(K-1); const champ=fin&&fin.ronda==="Final"&&fin.gano==="Ganado";
  cards+=`<div class="bk-c champ ${champ?"":"off"}" style="${box(colF,yF-CH-34)}">${champ?"🏆 Campeones · "+esc(nos):"🏆 Campeón"}</div>`;
  // conectores
  let paths="";
  const won=c=>{ const m=matchOf(c); return m&&m.gano==="Ganado"; };
  for(let c=1;c<K;c++){
    const toFinal=c===K-1;
    const n=toFinal?1:half[c];
    for(let i=0;i<n;i++){
      const srcs=toFinal?[0]:[2*i,2*i+1];
      const y1=toFinal?yF:yS(c,i);
      srcs.forEach(j=>{ const y0=yS(c-1,j);
        const on=j===my[c-1]&&(toFinal||i===my[c])&&won(c-1);
        const xL0=colL(c-1)+W, xL1=toFinal?colF:colL(c), xLm=xL1-G/2;
        paths+=`<path class="${on?"on":""}" d="M${xL0} ${y0} H${xLm} V${y1} H${xL1}"/>`;
        const xR0=colR(c-1), xR1=toFinal?colF+W:colR(c)+W, xRm=xR1+G/2;
        paths+=`<path d="M${xR0} ${y0} H${xRm} V${y1} H${xR1}"/>`; });
    }
  }
  let heads="";
  for(let c=0;c<K-1;c++){ heads+=`<div class="bk-h ${c===nowCol?"now":""}" style="left:${colL(c)}px;width:${W}px">${RONDA_LBL[rounds[c]]}</div><div class="bk-h" style="left:${colR(c)}px;width:${W}px">${RONDA_LBL[rounds[c]]}</div>`; }
  heads+=`<div class="bk-h ${nowCol===K-1?"now":""}" style="left:${colF}px;width:${W}px">${RONDA_LBL[rounds[K-1]]}</div>`;
  const lost=[...llave].reverse().find(p=>p.gano==="Perdido");
  const estado=fueraEnZona?"Eliminado en zona":enZona?"Jugando la zona":champ?"Campeones":!alive&&lost?`Afuera en ${RONDA_LBL[lost.ronda]}`:nowCol>=0?`Próximo: ${RONDA_LBL[rounds[nowCol]]}`:"En juego";
  if(bare) return `<div class="bk-scroll"><div class="bk-in${big?" big":""}" style="width:${width}px;height:${HEAD+totalH}px"><svg width="${width}" height="${HEAD+totalH}" aria-hidden="true">${paths}</svg>${heads}${cards}</div></div>`;
  return `<div class="bk"><div class="th"><h4>Cuadro del torneo</h4>${enZona||fueraEnZona?"":`<span class="pill">${esc(estado)}</span>`}</div>${zonaHTML}
    <div class="bk-scroll"><div class="bk-in${big?" big":""}" style="width:${width}px;height:${HEAD+totalH}px"><svg width="${width}" height="${HEAD+totalH}" aria-hidden="true">${paths}</svg>${heads}${cards}</div></div></div>`;
}
function torneoPartidos(t){ const fin=t.fechaFin&&t.fechaFin>=t.fecha?t.fechaFin:t.fecha; return asc("partidos").filter(p=>p.torneoId?p.torneoId===t.id:(p.tipo==="Torneo"&&p.fecha>=t.fecha&&p.fecha<=fin)); }
const STEP_LBL={"Zona":"Zona","32avos":"32avos","16avos":"16avos","Octavos":"8vos","Cuartos":"4tos","Semifinal":"Semi","Final":"Final"};
function torneoFase(t,pt){
  const zona=pt.filter(p=>p.ronda==="Zona"), llave=pt.filter(p=>RONDAS.includes(p.ronda));
  let start=t.cuadro&&t.cuadro!=="Auto"?t.cuadro:null;
  const first=llave.length?RONDAS[Math.min(...llave.map(p=>RONDAS.indexOf(p.ronda)))]:null;
  if(!start) start=first||"Octavos"; if(first&&RONDAS.indexOf(first)<RONDAS.indexOf(start)) start=first;
  const conZona=zona.length>0||t.formato==="Zonas + eliminación";
  const steps=(conZona?["Zona"]:[]).concat(RONDAS.slice(RONDAS.indexOf(start)));
  const fueraZona=t.instancia==="Fase de grupos";
  const manualFin=t.instancia&&t.instancia!=="En juego";
  let cur=0, ended=false, out=false, estado="", champ=false;
  const enZona=conZona&&!fueraZona&&!llave.length&&!t.clasificado&&!manualFin;
  if(fueraZona){ cur=0; ended=true; out=true; estado="Quedó en zona"; }
  else if(enZona){ cur=0; estado="En juego · Zona"; }
  else if(!llave.length){ cur=conZona?1:0; if(manualFin){ ended=true; estado=t.instancia==="Campeón"?"Campeón":"Llegó a "+t.instancia; } else estado="En juego · "+STEP_LBL[steps[cur]]; }
  else { const last=llave.reduce((a,p)=>RONDAS.indexOf(p.ronda)>=RONDAS.indexOf(a.ronda)?p:a,llave[0]); const i=steps.indexOf(last.ronda);
    if(last.gano==="Ganado"){ if(last.ronda==="Final"){ cur=i; ended=true; champ=true; estado="Campeón"; } else { cur=i+1; estado="En juego · "+STEP_LBL[steps[cur]]; } }
    else { cur=i; ended=true; out=true; estado=last.ronda==="Final"?"Subcampeón":"Llegó a "+STEP_LBL[last.ronda]; } }
  if(manualFin&&!ended){ ended=true; estado=t.instancia==="Campeón"?"Campeón":"Llegó a "+(STEP_LBL[t.instancia]||t.instancia); if(t.instancia==="Campeón") champ=true; }
  return {steps,cur,ended,out,estado,champ,enZona,label:STEP_LBL[steps[cur]]||steps[cur]};
}
function fechasT(t){ const a=fmtD(t.fecha).num; const b=t.fechaFin&&t.fechaFin!==t.fecha?fmtD(t.fechaFin).num:""; return b?`${a} – ${b}`:a; }
function recordT(pt){ const g=pt.filter(p=>p.gano==="Ganado").length; return {g,p:pt.length-g,txt:pt.length?`${g}-${pt.length-g}`:"0-0"}; }
function vTorneos(){
  const T=sorted("torneos"); const open=S.open==="torneos";
  const info=T.map(t=>{ const pt=torneoPartidos(t); return {t,pt,f:torneoFase(t,pt),r:recordT(pt)}; });
  const vivos=info.filter(x=>!x.f.ended), fin=info.filter(x=>x.f.ended);
  const card=x=>`<div class="tcard" data-go="torneos/${esc(x.t.id)}">
      <span class="eb">${esc(x.f.estado)}</span>
      <div><p class="nm">${esc(x.t.nombre||"Torneo")}</p><div class="sb">${esc([x.t.club,fechasT(x.t),x.t.companero?"con "+x.t.companero:""].filter(Boolean).join(" · "))}</div></div>
      <div class="rec">${x.r.txt}<small>récord</small></div>
      <div class="ac"><button class="btn primary" data-act="tnew" data-id="${esc(x.t.id)}">+ Cargar partido</button><span class="go">Ver torneo →</span></div></div>`;
  const row=x=>`<a class="trow" href="#torneos/${esc(x.t.id)}"><span class="n">${esc(x.t.nombre||"Torneo")}</span><span class="d">${esc(fechasT(x.t))}</span><span class="r ${x.f.champ?"win":""}">${esc(x.f.estado)}</span></a>`;
  let foot="";
  if(T.length){ const best=fin.length?fin.reduce((a,x)=>x.f.cur>a.f.cur||x.f.champ?x:a,fin[0]).f:null;
    const pts=T.reduce((a,t)=>a+(num(t.puntos)||0),0); const pj=info.reduce((a,x)=>a+x.pt.length,0), pg=info.reduce((a,x)=>a+x.r.g,0);
    foot=`<footer class="tfoot"><span><b>${T.length}</b> ${T.length===1?"torneo":"torneos"}</span><span><b>${pg}-${pj-pg}</b> en partidos</span><span><b>${info.filter(x=>x.f.champ).length}</b> títulos</span>${best?`<span>mejor: <b>${esc(best.champ?"Campeón":best.label)}</b></span>`:""}<span><b>${pts}</b> pts</span></footer>`; }
  return `<section class="sechead"><div><h2>Torneos</h2></div>${open?"":`<button class="btn" data-act="new" data-col="torneos">+ Nuevo torneo</button>`}</section>
    ${open?formHTML("torneos"):""}
    ${!T.length&&!open?`<div class="emptybox">Todavía no cargaste torneos. Creá uno antes de jugarlo y después cargá cada partido adentro.</div>`:""}
    ${vivos.length?`<section class="tlive">${vivos.map(card).join("")}</section>`:""}
    ${T.length?`<section class="tsec"><h3>Terminados</h3><div class="tlist">${fin.length?fin.map(row).join(""):`<div class="tnone">Cuando cierres un torneo aparece acá, en una línea.</div>`}</div></section>`:""}
    ${foot}`;
}
function matchRow(t,p){
  const isConf=S.confirm&&S.confirm.id===p.id;
  const acts=isConf?`<div class="confirm">¿Borrar? <button class="btn small danger" data-act="del" data-col="partidos" data-id="${esc(p.id)}">Sí, borrar</button><button class="btn small" data-act="nodel">No</button></div>`
    :`<div class="acts"><button class="btn small" data-act="tedit" data-t="${esc(t.id)}" data-id="${esc(p.id)}">Editar</button><button class="btn small" data-act="ask" data-id="${esc(p.id)}">Borrar</button></div>`;
  const m=[["Rendimiento",rendimiento(p)!=null?rendimiento(p)+"%":""],["Errores",p.enf],...CONTEOS.map(([k,l])=>[l,pctOf(p[k])!=null?pctOf(p[k])+"%":""]),["Winners",p.winners],["Nevera",p.nevera!=null?p.nevera+"/5":""],["Respuesta",p.respNevera!=null?p.respNevera+"/5":""],["Ansiedad",p.ansiedad!=null?p.ansiedad+"/10":""],["Nota",p.nota!=null?p.nota+"/10":""]].filter(x=>x[1]!==""&&x[1]!=null);
  const tx=[["Lectura del rival",p.lectura],["Funcionó",p.funciono],["A mejorar",p.mejorar]].filter(x=>x[1]);
  const open=S.opened.has(p.id)||isConf;
  return `<details class="tm" data-id="${esc(p.id)}"${open?" open":""}><summary><span class="tmt"><span class="tag ${p.gano==="Ganado"?"win":"loss"}">${p.gano==="Ganado"?"G":"P"}</span><span class="rv">${p.rivales?esc(p.rivales):"Rivales sin cargar"}</span><span class="sc">${esc(p.resultado||"")}</span></span><span class="k"><span>${esc(fmtD(p.fecha).dia)} ${esc(fmtD(p.fecha).num)}</span></span></summary>
    <div class="tmb">${m.length?`<div class="meta">${m.map(([k,v])=>`<span>${esc(k)} <b>${esc(v)}</b></span>`).join("")}</div>`:""}${tx.map(([k,v])=>`<p><em>${esc(k)}:</em> ${esc(v)}</p>`).join("")}${acts}</div></details>`;
}
function vTorneo(id){
  const t=S.torneos.find(x=>x.id===id);
  if(!t) return `<a class="back" href="#torneos">← Torneos</a><div class="emptybox">${S.mode==="loading"?"Cargando…":"Este torneo ya no existe."}</div>`;
  if(S.open==="torneos"&&S.editing&&S.editing.id===id) return `<a class="back" href="#torneos">← Torneos</a>${formHTML("torneos")}`;
  const pt=torneoPartidos(t), f=torneoFase(t,pt), r=recordT(pt);
  const formHere=S.open==="partidos"&&S.ctx&&S.ctx.torneoId===t.id;
  const steps=`<ol class="steps">${f.steps.map((st,i)=>`<li class="${i<f.cur?"done":i===f.cur?(f.out?"out":f.ended&&f.champ?"done":"cur"):""}"><i></i>${esc(STEP_LBL[st]||st)}</li>`).join("")}</ol>`;
  const acts=formHere?"":f.enZona?`<div class="tacts"><button class="btn primary" data-act="tnew" data-id="${esc(t.id)}">+ Cargar partido</button><button class="btn" data-act="zona" data-v="si" data-id="${esc(t.id)}">Pasamos de zona</button><button class="btn" data-act="zona" data-v="no" data-id="${esc(t.id)}">Quedamos afuera</button></div>`
    :!f.ended?`<div class="tacts"><button class="btn primary" data-act="tnew" data-id="${esc(t.id)}">+ Cargar partido</button>${t.clasificado&&!pt.some(p=>RONDAS.includes(p.ronda))?`<button class="btn" data-act="zona" data-v="undo" data-id="${esc(t.id)}">Deshacer "pasamos"</button>`:""}</div>`:"";
  const cur=f.steps[f.cur];
  const enFase=pt.filter(p=>p.ronda===cur||(cur==="Zona"&&(!p.ronda||p.ronda==="—")));
  const otras=f.steps.filter(st=>st!==cur).map(st=>({st,ps:pt.filter(p=>p.ronda===st)})).filter(x=>x.ps.length);
  const sinR=cur!=="Zona"?pt.filter(p=>!p.ronda||p.ronda==="—"):[];
  if(sinR.length) otras.push({st:"Sin ronda",ps:sinR});
  const fold=(key,title,count,inner,open=false)=>`<details class="fold" data-fold="${key}"${(S.opened.has(key)||open)?" open":""}><summary>${title}${count?`<span class="c">${count}</span>`:""}</summary><div class="in">${inner}</div></details>`;
  const datos=[["Club",t.club],["Categoría",t.categoria],["Compañero",t.companero],["Formato",t.formato],["Cuadro desde",t.cuadro&&t.cuadro!=="Auto"?t.cuadro:""],["Puntos",t.puntos]].filter(x=>x[1]!==""&&x[1]!=null);
  const isConf=S.confirm&&S.confirm.id===t.id;
  const tacts=isConf?`<div class="confirm acts">¿Borrar el torneo? <button class="btn small danger" data-act="del" data-col="torneos" data-id="${esc(t.id)}">Sí, borrar</button><button class="btn small" data-act="nodel">No</button></div>`
    :`<div class="acts"><button class="btn small" data-act="tedit2" data-id="${esc(t.id)}">Editar torneo</button><button class="btn small" data-act="ask" data-id="${esc(t.id)}">Borrar</button></div>`;
  return `<a class="back" href="#torneos">← Torneos</a>
    <section class="thead"><span class="eb ${f.champ?"win":f.ended?"":"live"}">${esc(f.estado)}</span>
      <div class="top"><div><h2>${esc(t.nombre||"Torneo")}</h2><div class="sb">${esc([t.club,fechasT(t),t.companero?"con "+t.companero:""].filter(Boolean).join(" · "))}</div></div><div class="rec">${r.txt}<small>récord</small></div></div></section>
    ${steps}
    ${acts}
    ${formHere?formHTML("partidos"):""}
    <section class="tphase"><h3>${esc(cur==="Zona"?"Zona":STEP_LBL[cur]||cur)}<span>${enFase.length?enFase.length+(enFase.length===1?" partido":" partidos"):""}</span></h3>
      ${enFase.length?enFase.map(p=>matchRow(t,p)).join(""):`<div class="tnone">${f.ended?"Sin partidos en esta fase.":"Todavía no hay partidos en esta fase."}</div>`}</section>
    <div class="tfolds">
      ${otras.map(x=>fold("f-"+t.id+"-"+x.st,STEP_LBL[x.st]||x.st,x.ps.length+(x.ps.length===1?" partido":" partidos"),x.ps.map(p=>matchRow(t,p)).join(""))).join("")}
      ${fold("c-"+t.id,"Cuadro del torneo","",cuadroHTML(t,pt,true))}
      ${fold("d-"+t.id,"Datos del torneo","",((datos.length||t.objetivo||t.balance)?`<dl class="kv">${datos.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}${[["Objetivo",t.objetivo],["Balance",t.balance]].filter(x=>x[1]).map(([k,v])=>`<div class="long"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`:`<p class="hint">Sin datos cargados. Tocá <b>Editar torneo</b> para completarlos.</p>`)+tacts)}
    </div>`;
}
function vHistorial(){
  const counts={todos:allRows().length}; COLS.forEach(c=>counts[c]=S[c].length);
  const labels={todos:"Todo",partidos:"Partidos",torneos:"Torneos",entrenos:"Entrenamientos",fisico:"Físico",mental:"Mental"};
  return `<section><h2>Historial</h2><p class="lede">Todo lo que hiciste, del más reciente al más viejo.</p></section>
  <div class="filters">${Object.keys(labels).map(k=>`<button class="chip" data-act="filter" data-f="${k}" aria-pressed="${S.filter===k}">${labels[k]} · ${counts[k]}</button>`).join("")}</div>
  <section>${histList(0,S.filter)}</section>`;
}
function vFicha(){
  const F=S.ficha; const m=metrics();
  const metaB=num(F.metaBandejas)||7, metaS=num(F.metaSplit)||80, metaE=num(F.metaEnf)||30;
  const pct=(v,goal)=>v==null?0:Math.max(0,Math.min(100,v/goal*100));
  const enfDrop = m.enfBase!=null&&m.enfRec!=null ? (m.enfBase-m.enfRec)/m.enfBase*100 : null;
  if(S.open==="ficha"){
    return `<section><h2>Editar ficha</h2></section><div class="formcard"><form id="form-ficha" data-col="ficha">${SPECS.ficha.map(f=>fieldHTML("ficha",f,F[f.k])).join("")}
      <div class="formactions"><button type="button" class="btn" data-act="cancel">Cancelar</button><button type="submit" class="btn primary">Guardar ficha</button></div></form></div>`;
  }
  const cell=(l,v)=>`<div><div class="lab">${esc(l)}</div><div class="v">${esc(v)}</div></div>`;
  return `<section class="sechead"><div><h2>Ficha técnica${F.nombre?" · "+esc(F.nombre):""}</h2><p class="lede">${esc([F.posicion,F.categoria,F.objetivo?"objetivo "+F.objetivo:""].filter(Boolean).join(" · ")||"Completá tu ficha con Editar ficha.")}</p></div><button class="btn" data-act="new" data-col="ficha">Editar ficha</button></section>
  <div class="fichagrid">${cell("Edad",F.edad+" años")}${cell("Altura",F.altura)}${cell("Posición",F.posicion)}${cell("Categoría",F.categoria)}${cell("Objetivo",F.objetivo)}${cell("Origen",F.origen)}${cell("Horario",F.horario)}${cell("Estilo de juego",F.estilo)}${cell("Desafío mental",F.desafio)}</div>
  <section><h3 style="margin-bottom:12px">Metas a 12 semanas</h3><div class="goals">
    <div class="goal"><span>Bandejas profundas: ${metaB} de 10</span><span class="gv">${r1(m.bandRec)} / ${metaB}</span><div class="bar"><span style="width:${pct(m.bandRec,metaB)}%"></span></div></div>
    <div class="goal"><span>Errores no forzados: −${metaE}%</span><span class="gv">${enfDrop==null?"faltan datos":(enfDrop>=0?"−":"+")+Math.abs(Math.round(enfDrop))+"%"}</span><div class="bar"><span style="width:${pct(enfDrop!=null&&enfDrop>0?enfDrop:0,metaE)}%"></span></div></div>
    <div class="goal"><span>Split step en el ${metaS}% de los golpes rivales</span><span class="gv">${m.splRec==null?"–":Math.round(m.splRec)}% / ${metaS}%</span><div class="bar"><span style="width:${pct(m.splRec,metaS)}%"></span></div></div>
  </div></section>
  <section><h3 style="margin-bottom:10px">Plan semanal</h3>${weekStrip(m)}</section>`;
}

const VIEWS={inicio:vInicio,partidos:vPartidos,torneos:vTorneos,entrenos:vEntrenos,fisico:vFisico,mental:vMental,historial:vHistorial,ficha:vFicha};
function route(){ const h=location.hash.slice(1).split("/")[0]; return VIEWS[h]?h:"inicio"; }
function subId(){ const p=location.hash.slice(1).split("/"); return p[1]?decodeURIComponent(p[1]):null; }
function render(){
  const r=route(); const active=document.activeElement;
  // no re-renderizar mientras se escribe en un formulario abierto
  if(S.open && active && active.form && document.getElementById("view").contains(active) && S._lastRoute===r+(subId()||"")){ return; }
  S._lastRoute=r+(subId()||"");
  document.querySelectorAll("#tabs a").forEach(a=>a.setAttribute("aria-current",a.getAttribute("href")==="#"+r?"page":"false"));
  document.getElementById("view").innerHTML=(r==="torneos"&&subId())?vTorneo(subId()):VIEWS[r]();
  document.querySelectorAll("[data-score]").forEach(updateScore);
}

/* ---------- eventos ---------- */
window.addEventListener("hashchange",()=>{ if(S.keep){ S.keep=false; } else { S.open=null; S.editing=null; S.ctx=null; } S.confirm=null; S._lastRoute=null; render(); window.scrollTo(0,0); });
function goOpen(col,editing){ S.open=col; S.editing=editing||null; S.confirm=null; S._lastRoute=null; if(route()!==col){ S.keep=true; location.hash=col; } else { render(); window.scrollTo(0,0); } }
document.addEventListener("click",async e=>{
  const nw=e.target.closest("[data-new]"); if(nw){ e.preventDefault(); goOpen(nw.dataset.new); return; }
  const b=e.target.closest("[data-act]");
  if(!b){ const g=e.target.closest("[data-go]"); if(g){ location.hash=g.dataset.go; } return; } const act=b.dataset.act;
  if(act==="new"){ S.open=b.dataset.col; S.editing=null; S._lastRoute=null; render(); }
  else if(act==="tnew"){ S.open="partidos"; S.editing=null; S.ctx={torneoId:b.dataset.id}; S.confirm=null; S._lastRoute=null; if(subId()!==b.dataset.id){ S.keep=true; location.hash="torneos/"+b.dataset.id; return; } render(); const f=document.getElementById("form-partidos"); if(f) f.scrollIntoView({block:"start",behavior:"smooth"}); }
  else if(act==="tedit"){ S.open="partidos"; S.editing={col:"partidos",id:b.dataset.id}; S.ctx={torneoId:b.dataset.t}; S.confirm=null; S._lastRoute=null; render(); const f=document.getElementById("form-partidos"); if(f) f.scrollIntoView({block:"start",behavior:"smooth"}); }
  else if(act==="tedit2"){ S.open="torneos"; S.editing={col:"torneos",id:b.dataset.id}; S.confirm=null; S._lastRoute=null; render(); window.scrollTo(0,0); }
  else if(act==="cancel"){ S.open=null; S.editing=null; S.ctx=null; S._lastRoute=null; document.activeElement.blur(); render(); }
  else if(act==="edit"){ goOpen(b.dataset.col,{col:b.dataset.col,id:b.dataset.id}); }
  else if(act==="ask"){ S.confirm={id:b.dataset.id}; render(); }
  else if(act==="nodel"){ S.confirm=null; render(); }
  else if(act==="del"){ S.confirm=null; try{ await deleteEntry(b.dataset.col,b.dataset.id); toast("Registro borrado"); if(b.dataset.col==="torneos"&&subId()===b.dataset.id){ location.hash="torneos"; return; } }catch(err){ toast("No se pudo borrar: "+(err.code||err.message)); } render(); }
  else if(act==="step"){ const inp=b.parentElement.querySelector("input"); const mn=+inp.dataset.min, mx=+inp.dataset.max; let v=inp.value===""?(+b.dataset.d>0?mn-1:mn+1):+inp.value; v=Math.max(mn,Math.min(mx,v+(+b.dataset.d))); inp.value=v; const pc=b.parentElement.querySelector(".pct"); if(pc) pc.textContent=Math.round(v*10)+"%"; }
  else if(act==="zona"){ const t=S.torneos.find(x=>x.id===b.dataset.id); if(t){ const {id,...rest}=t; const v=b.dataset.v;
      const data=v==="si"?{...rest,clasificado:true}:v==="no"?{...rest,clasificado:false,instancia:"Fase de grupos"}:{...rest,clasificado:false};
      try{ await saveEntry("torneos",t.id,data); toast(v==="si"?"¡Adentro! Ya aparecés en la llave":v==="no"?"Torneo cerrado en zona":"Listo"); }catch(err){ toast("No se pudo guardar: "+(err.code||err.message)); } } }
  else if(act==="day"){ const d=+b.dataset.d; S.day=S.day===d?null:d; render(); }
  else if(act==="chart"){ S.chart=b.dataset.c; render(); if(b.dataset.scroll){ const c=document.querySelector(".chart"); if(c) c.scrollIntoView({behavior:"smooth",block:"center"}); } }
  else if(act==="filter"){ S.filter=b.dataset.f; render(); }
});
document.addEventListener("toggle",e=>{ const d=e.target; if(!d.matches||!d.matches("details.entry, details.tm, details.fold")) return; const id=d.dataset.id||d.dataset.fold; if(d.open){ S.opened.add(id); S.closed.delete(id); } else { S.opened.delete(id); S.closed.add(id); } },true);
document.addEventListener("input",e=>{ const sc=e.target.closest("[data-score]"); if(sc){ if(e.target.tagName==="INPUT"){ e.target.value=e.target.value.replace(/\D/g,""); } updateScore(sc); if(e.target.classList.contains("g")&&e.target.value.length>=1) advance(sc,e.target); return; } const pc=e.target.parentElement&&e.target.parentElement.querySelector(".pct"); if(pc){ const v=e.target.value.replace(/\D/g,""); e.target.value=v; pc.textContent=v===""?"–":Math.round(Math.min(10,+v)*10)+"%"; } if(e.target.type==="range"){ const o=e.target.parentElement.querySelector("output"); if(o) o.textContent=e.target.value; } });
document.addEventListener("submit",async e=>{
  e.preventDefault(); const form=e.target; const col=form.dataset.col; const btn=form.querySelector("[type=submit]"); btn.disabled=true;
  try{
    if(col==="ficha"){ await saveFicha(readForm(form,"ficha")); toast("Ficha guardada"); }
    else {
      const data=readForm(form,col); if(!data.fecha){ toast("Poné la fecha"); btn.disabled=false; return; }
      const prev=S.editing?S[col].find(x=>x.id===S.editing.id):null;
      const id=prev?prev.id:newId(); data.creado=prev&&prev.creado?prev.creado:Date.now();
      if(col==="partidos"){ const tid=(S.ctx&&S.ctx.torneoId)||(prev&&prev.torneoId); if(tid) data.torneoId=tid; }
      await saveEntry(col,id,data); toast(prev?"Cambios guardados":NAMES[col]+" guardado");
      if(col==="partidos"&&data.torneoId) await avanzarTorneo(data);
    }
    S.open=null; S.editing=null; S.ctx=null; S._lastRoute=null; document.activeElement && document.activeElement.blur(); render();
  }catch(err){ btn.disabled=false; toast(err && err.code==="quota_exceeded"?"Se llenó el espacio de datos":"No se pudo guardar: "+(err.code||err.message)); }
});

render(); start();
})();
