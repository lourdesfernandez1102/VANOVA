var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var STEPS=[["Recibido","Equipo recibido y registrado en el taller."],["Diagnóstico","Revisión técnica completa del equipo."],["Presupuesto","Te enviamos el presupuesto cerrado para aprobar."],["Reparación","Sustituimos las piezas y ajustamos el equipo."],["Reparado","Control de calidad final de todas las funciones."],["Entregado","Listo para recoger en el mostrador."]];
var orders={"VAN-94820":{n:"Carlos Mendoza",dev:"Apple iPhone 14 Pro",fase:4,sym:"Pantalla rota",price:129}};
var sel={type:"Móvil",brand:"Apple",date:null,time:null};
var SYM=["Pantalla rota o táctil que no responde","La batería se agota rápido","No enciende o pantalla negra","Cámaras o cristal trasero roto","Conector de carga flojo o dañado","Mojado o contacto con líquido","Otro problema"];
var VIEWS=["inicio","cita","confirmada","seguimiento","ayuda"],last=null;

function go(){
  var h=(location.hash||"#inicio").slice(1);if(VIEWS.indexOf(h)<0)h="inicio";
  VIEWS.forEach(function(v){$("v-"+v).classList.toggle("on",v===h)});
  Array.prototype.forEach.call(document.querySelectorAll("nav a"),function(a){a.classList.toggle("on",a.dataset.v===h||(h==="confirmada"&&a.dataset.v==="cita"))});
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",go);

function chips(id,list,key){
  var box=$(id);box.innerHTML="";
  list.forEach(function(t){var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=t;
    b.setAttribute("aria-pressed",sel[key]===t);
    b.onclick=function(){sel[key]=t;chips(id,list,key);summary()};box.appendChild(b)});
}
chips("gType",["Móvil","Tablet","Portátil"],"type");
chips("gBrand",["Apple","Samsung","Xiaomi","Google Pixel","Huawei","Otra marca"],"brand");
chips("gTime",["10:00","11:30","12:30","16:30","17:30","19:00"],"time");
(function(){
  var d=new Date(),box=$("gDate"),D=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],M=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  for(var i=0;i<7;i++){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i);if(x.getDay()===0)continue;
    var b=document.createElement("button");b.type="button";b.className="chip";
    b.dataset.v=D[x.getDay()]+" "+x.getDate()+" "+M[x.getMonth()];
    b.innerHTML=D[x.getDay()]+"<b>"+x.getDate()+"</b>"+M[x.getMonth()];b.setAttribute("aria-pressed","false");
    b.onclick=function(){sel.date=this.dataset.v;Array.prototype.forEach.call(box.children,function(c){c.setAttribute("aria-pressed",c===b2(this))}.bind(this));summary()};
    box.appendChild(b)}
  function b2(x){return x}
  box.onclick=function(e){var t=e.target.closest(".chip");if(!t)return;Array.prototype.forEach.call(box.children,function(c){c.setAttribute("aria-pressed",c===t)})};
})();
$("syms").innerHTML=SYM.map(function(s,i){return '<label class="sym"><input type="checkbox" value="'+s+'"> '+s+'</label>'}).join("");
function syms(){return Array.prototype.map.call(document.querySelectorAll("#syms input:checked"),function(i){return i.value})}
document.addEventListener("change",function(e){if(e.target.closest("#syms"))summary()});
$("fm").oninput=summary;
function summary(){
  var p=[sel.brand+" ("+sel.type+")",$("fm").value.trim(),sel.date&&sel.time?sel.date+", "+sel.time+" h":""].filter(Boolean);
  $("sumTxt").textContent=p.join(" · ")+" · Revisión gratuita";
}

$("confirm").onclick=function(){
  var n=$("fn").value.trim(),t=$("ft").value.trim(),e=$("fe").value.trim(),m=$("fm").value.trim(),er=$("err");
  var msg=!n?"Escribe tu nombre.":!/^[0-9+ ]{9,15}$/.test(t)?"El teléfono debe tener entre 9 y 15 dígitos.":!/^\S+@\S+\.\S+$/.test(e)?"Revisa el correo electrónico.":!m?"Indica el modelo del equipo.":!syms().length?"Marca al menos un síntoma.":!sel.date||!sel.time?"Elige fecha y hora.":"";
  if(msg){er.textContent=msg;return}
  er.textContent="";
  var c;do{c="VAN-"+(10000+Math.floor(Math.random()*89999))}while(orders[c]);
  orders[c]={n:n,dev:sel.brand+" "+m,fase:1,sym:syms().join(", "),price:0};last=c;
  $("cCode").textContent=c;
  $("cDet").innerHTML="<b>Equipo:</b> "+esc(sel.brand+" "+m)+"<br><b>Cliente:</b> "+esc(n)+"<br><b>Motivo:</b> "+esc(syms().join(", "))+"<br><b>Ingreso:</b> "+esc(sel.date+" a las "+sel.time+" h");
  var q="";for(var i=0;i<81;i++){var r=Math.floor(i/9),k=i%9,corner=(r<3&&k<3)||(r<3&&k>5)||(r>5&&k<3);q+='<i class="'+((corner||Math.random()>.55)?"k":"")+'"></i>'}
  $("qr").innerHTML=q;$("goTrack").onclick=function(){$("tCode").value=c;track(c)};
  location.hash="confirmada";
};
$("copy").onclick=function(){var b=this;try{navigator.clipboard.writeText($("cCode").textContent);b.textContent="Código copiado"}catch(x){b.textContent="Selecciona y copia el código"}};

function track(c){
  c=(c||$("tCode").value).trim().toUpperCase();var o=orders[c],r=$("tRes");
  if(!o){r.innerHTML='<p class="err">No encontramos ese código. Revisa que tenga el formato VAN-12345.</p>';return}
  var h='<div class="card" style="margin-top:14px"><h3>'+c+' <span class="tag">Fase '+o.fase+' de 6</span></h3><p class="sub" style="margin:6px 0 0"><b>'+esc(o.dev)+'</b><br>Titular: '+esc(o.n)+'</p></div><h2 style="margin-top:6px">Progreso de la reparación</h2><div class="tl">';
  STEPS.forEach(function(s,i){var n=i+1,st=n<o.fase?"done":n===o.fase?"now":"next";
    var extra=n===3&&o.price&&o.fase>=3?'<p><b>Presupuesto: '+o.price+' €</b> · aprobado</p>':"";
    h+='<div class="step '+st+'"><div class="dot">'+(st==="done"?"✓":n)+'</div><div class="sb"><h3>'+s[0]+'<span>'+(st==="now"?"En proceso":st==="done"?"Completado":"Pendiente")+'</span></h3><p>'+s[1]+'</p>'+extra+'</div></div>'});
  h+='</div><button class="btn s" id="adv">Avanzar una fase (solo demo)</button>';
  r.innerHTML=h;
  $("adv").onclick=function(){if(o.fase<6){o.fase++;if(o.fase>=3&&!o.price)o.price=89;track(c)}};
}
$("tGo").onclick=function(){track()};
$("tCode").onkeydown=function(e){if(e.key==="Enter")track()};
$("homeGo").onclick=function(){$("tCode").value=$("homeCode").value;location.hash="seguimiento";track($("homeCode").value)};
go();
