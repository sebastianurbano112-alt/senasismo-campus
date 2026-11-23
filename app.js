'use strict';
const $=s=>document.querySelector(s); const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}},remove(k){try{localStorage.removeItem(k)}catch{}}};
const details={antes:'Conoce las zonas seguras, rutas y puntos de reunión indicados por tu campus. Prepara una mochila de emergencia y consulta qué apoyos de comunicación estarán disponibles durante los simulacros.',durante:'Mantén la calma. Aléjate de ventanas y objetos que puedan caer. Sigue el protocolo vigente de tu institución y las indicaciones de los responsables de seguridad.',despues:'Cuando sea seguro y las autoridades lo indiquen, sigue las rutas autorizadas. Mantente atento a información oficial y solicita ayuda por los medios habilitados si la necesitas.'};
document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>{const d=$('#detail');d.hidden=false;d.textContent=details[b.dataset.detail];d.focus()}));
$('#lsp').addEventListener('click',()=>{$('#lsp-status').textContent='El video LSP aprobado aún no está disponible. Consulta la alternativa textual visible.'});
$('#understood').addEventListener('click',()=>{$('#declaration').textContent='Declaración guardada solo en esta sesión de práctica. No demuestra comprensión ni fue enviada.'});$('#safe').addEventListener('click',()=>{$('#declaration').textContent='Estado de práctica: declaraste estar a salvo. No se notificó a ninguna brigada.'});
let v=1;$('#update-phase').addEventListener('click',()=>{const phase=$('#phase').value;v++;$('#event-state').textContent='Estado: '+phase;$('#version').textContent='v'+v+' · Datos de práctica';$('#event-title').textContent=phase==='cerrado'?'Simulacro cerrado en Campus Demo':phase==='actualizado'?'Actualización del simulacro':'Simulacro en Campus Demo';$('#event-text').textContent=phase==='cerrado'?'El evento de práctica ha terminado. Una solicitud abierta no se cierra automáticamente.':'Mantén la calma. Aléjate de ventanas y objetos que puedan caer.';$('#phase-msg').textContent='Fase de práctica actualizada. No se ha emitido un aviso real.'});
for(const [id,cls] of [['large','large-text'],['contrast','high-contrast']]){const e=$('#'+id);e.checked=store.get(id)==='1';document.body.classList.toggle(cls,e.checked);e.addEventListener('change',()=>{document.body.classList.toggle(cls,e.checked);store.set(id,e.checked?'1':'0')})}
$('#vibrate').addEventListener('click',()=>{let ok=false;try{ok=!!navigator.vibrate&&navigator.vibrate([150,100,150])}catch{}$('#vibrate-msg').textContent=ok?'Prueba solicitada. La percepción física requiere comprobación en el dispositivo.':'Vibración no disponible o no autorizada en este dispositivo. La información textual sigue disponible.'});
const guide='Guía de práctica: identifica las rutas oficiales del campus, mantén la calma y sigue las indicaciones de las autoridades. No es un paquete institucional aprobado.';$('#save-guide').addEventListener('click',()=>{$('#guide-msg').textContent=store.set('guide',guide)?'Guía textual de ejemplo guardada en este navegador.':'No fue posible guardar la guía en este navegador.'});$('#view-guide').addEventListener('click',()=>{$('#guide-msg').textContent=store.get('guide')||'Aún no hay una guía guardada.'});
// La confirmación utiliza exactamente los datos revisados y solo crea un caso por operación.
let reviewedRequest = null;
let confirmationInProgress = false;
function invalidateReview() {
  reviewedRequest = null;
  $('#review').hidden = true;
}
for (const id of ['need', 'zone', 'note']) {
  $('#'+id).addEventListener('input', invalidateReview);
  $('#'+id).addEventListener('change', invalidateReview);
}
$('#support-form').addEventListener('submit', e => {
  e.preventDefault();
  const need = $('#need').value;
  const zone = $('#zone').value.trim();
  const note = $('#note').value.trim();
  $('#need').setAttribute('aria-invalid', String(!need));
  $('#zone').setAttribute('aria-invalid', String(!zone));
  if (!need || !zone) {
    invalidateReview();
    $('#form-error').textContent = 'Selecciona un tipo de apoyo e ingresa una referencia de ejemplo.';
    (!need ? $('#need') : $('#zone')).focus();
    return;
  }
  $('#form-error').textContent = '';
  reviewedRequest = {need, zone, note};
  $('#review-text').textContent = 'Necesidad: '+need+'. Referencia: '+zone+'. Nota: '+(note||'Sin nota')+'.';
  $('#review').hidden = false;
  $('#confirm').focus();
});
$('#edit').addEventListener('click', () => { invalidateReview(); $('#need').focus(); });
$('#confirm').addEventListener('click', () => {
  if (!reviewedRequest || confirmationInProgress) return;
  confirmationInProgress = true;
  const record = {id:'DEMO-'+Date.now(), ...reviewedRequest, time:new Date().toLocaleString('es-PE')};
  const saved = store.set('request', JSON.stringify(record));
  if (saved) {
    invalidateReview();
    $('#request-status').textContent = 'Simulación '+record.id+' guardada localmente. No fue enviada ni recibida por una brigada.';
  } else {
    $('#request-status').textContent = 'No fue posible guardar la simulación. Puedes volver a intentarlo.';
  }
  confirmationInProgress = false;
});
$('#clear-request').addEventListener('click', () => {
  store.remove('request');
  $('#support-form').reset();
  invalidateReview();
  $('#form-error').textContent = '';
  $('#request-status').textContent = 'La simulación local fue eliminada.';
});

// Entorno académico: los roles, estados y mensajes siguientes son simulados y locales.
const lab=document.createElement('section');
lab.className='section pale';lab.id='laboratorio';lab.setAttribute('aria-labelledby','lab-title');
lab.innerHTML=`<div class="section-head"><div><p class="eyebrow dark">LABORATORIO ACADÉMICO</p><h2 id="lab-title">Practica la coordinación.</h2></div><p>Datos de ejemplo en este dispositivo. Ninguna acción comunica con una brigada ni modifica protocolos reales.</p></div>
<div class="notice"><strong>Simulación:</strong> los roles y aprobaciones son didácticos. No hay autenticación ni un servicio de emergencia conectado.</div>
<div class="simgrid" style="margin-top:1.5rem"><article class="sim-card"><h3>1. Solicitud de práctica</h3><p>Usa el formulario de apoyo de la página para crear un caso ficticio. Aquí puedes revisarlo, actualizarlo o cancelar la práctica.</p><div id="lab-case" role="status"></div><label for="lab-update">Nueva referencia de ejemplo</label><input id="lab-update" maxlength="80" placeholder="Ejemplo: zona B"><button class="button secondary" id="lab-save">Actualizar referencia</button> <button class="button secondary" id="lab-cancel">Cancelar práctica</button><p id="lab-feedback" role="status"></p></article>
<article class="sim-card"><h3>2. Mesa de brigada de ejemplo</h3><label for="lab-filter">Filtrar el estado local</label><select id="lab-filter"><option value="todos">Todos</option><option value="pendiente">Pendiente</option><option value="asignado">Asignado</option><option value="atencion">En atención</option><option value="cerrado">Cerrado</option></select><div id="lab-queue" role="status"></div><button class="button secondary" id="lab-take">Asignar a brigada ficticia</button><button class="button secondary" id="lab-ack">Registrar acuse simulado</button><label for="lab-destination">Destino de ejemplo</label><select id="lab-destination"><option value="">Selecciona destino</option><option>Equipo de apoyo ficticio</option><option>Seguridad ficticia</option></select><label for="lab-reason">Motivo de derivación</label><input id="lab-reason" maxlength="100" placeholder="Motivo de práctica"><button class="button secondary" id="lab-transfer">Practicar derivación</button><label for="lab-result">Resultado de práctica</label><select id="lab-result"><option value="">Selecciona resultado</option><option>Orientación proporcionada</option><option>Derivado a otro equipo</option><option>Práctica cancelada</option></select><button class="button secondary" id="lab-close">Cerrar caso simulado</button><p id="lab-brigade" role="status"></p></article>
<article class="sim-card"><h3>3. Revisión de contenido</h3><p>Ensaya el ciclo de borrador, revisión y publicación ficticia.</p><label for="draft-phase">Fase del ejercicio</label><select id="draft-phase"><option>Preparación</option><option>Simulacro</option><option>Cierre</option></select><label for="draft-action">Instrucción de ejemplo</label><textarea id="draft-action" rows="3" maxlength="180" placeholder="Escribe una instrucción de prueba"></textarea><button class="button secondary" id="draft-save">Guardar borrador</button><button class="button secondary" id="draft-review">Registrar revisión simulada</button><button class="button secondary" id="draft-publish">Publicar en el simulador</button><p id="draft-status" role="status"></p></article></div>
<div class="detail" style="margin-top:1.5rem"><h3>Roles y límites de la práctica</h3><p>Comunidad: consulta y practica una solicitud. Brigada ficticia: ensaya asignación, acuse, derivación y cierre. Equipo de contenidos: crea y revisa un borrador. La selección es libre y no constituye control de acceso.</p><p>Para una operación real se requerirían permisos institucionales, autenticación, almacenamiento compartido, controles de concurrencia, validación lingüística y acuses verificables.</p></div>`;
document.querySelector('#apoyo').before(lab);
let exercise=null; try{exercise=JSON.parse(store.get('labCase')||'null')}catch{};
let draft=null; try{draft=JSON.parse(store.get('labDraft')||'null')}catch{};
function copyCase(){let saved;try{saved=JSON.parse(store.get('request')||'null')}catch{};if(saved&&(!exercise||exercise.id!==saved.id)){exercise={...saved,state:'pendiente',version:1,owner:'Sin asignar',messages:[],transfer:'Sin derivación'};persistCase()} }
function persistCase(){store.set('labCase',JSON.stringify(exercise))}
function renderLab(){copyCase();const box=$('#lab-case'),queue=$('#lab-queue');if(!exercise){box.textContent='No hay solicitudes de práctica guardadas.';queue.textContent='La cola de ejemplo está vacía. Esto no informa sobre una emergencia real.';return}box.textContent='Caso '+exercise.id+' · '+exercise.need+' · '+exercise.zone+' · Estado simulado: '+exercise.state+' · Responsable: '+exercise.owner+' · Versión '+exercise.version+'. '+(exercise.messages.at(-1)||'');const visible=$('#lab-filter').value==='todos'||$('#lab-filter').value===exercise.state;queue.textContent=visible?'Caso '+exercise.id+' · '+exercise.need+' · '+exercise.zone+' · '+exercise.state+' · '+exercise.time+' · '+exercise.transfer:'Ningún caso coincide con el filtro. El filtro no elimina datos.'}
$('#lab-filter').addEventListener('change',renderLab);$('#lab-save').addEventListener('click',()=>{if(!exercise)return $('#lab-feedback').textContent='Primero guarda una solicitud de prueba.';let z=$('#lab-update').value.trim();if(!z)return $('#lab-feedback').textContent='Escribe una referencia de ejemplo.';exercise.zone=z;exercise.version++;persistCase();renderLab();$('#lab-feedback').textContent='Referencia actualizada en este navegador; no se ha enviado a nadie.'});
$('#lab-cancel').addEventListener('click',()=>{if(!exercise)return $('#lab-feedback').textContent='No hay solicitud para cancelar.';if(!confirm('¿Cancelar esta solicitud de práctica local?'))return;exercise.state='cancelada';exercise.version++;persistCase();renderLab();$('#lab-feedback').textContent='Práctica cancelada localmente; no existe acuse de un servicio.'});
$('#lab-take').addEventListener('click',()=>{if(!exercise||exercise.state!=='pendiente')return $('#lab-brigade').textContent='Se necesita un caso pendiente para practicar la asignación.';exercise.owner='Brigada ficticia';exercise.state='asignado';persistCase();renderLab();$('#lab-brigade').textContent='Asignación solo local. No garantiza exclusividad entre dispositivos.'});
$('#lab-ack').addEventListener('click',()=>{if(!exercise||exercise.state!=='asignado')return $('#lab-brigade').textContent='Primero asigna un caso de práctica.';exercise.messages.push('Acuse ficticio: estamos revisando el caso.');exercise.state='atencion';persistCase();renderLab();$('#lab-brigade').textContent='Acuse de práctica registrado localmente; no fue enviado.'});
$('#lab-transfer').addEventListener('click',()=>{let target=$('#lab-destination').value,reason=$('#lab-reason').value.trim();if(!exercise||!['asignado','atencion'].includes(exercise.state)||!target||!reason)return $('#lab-brigade').textContent='Selecciona un caso asignado, un destino y un motivo.';exercise.transfer='Derivación pendiente a '+target+'; motivo: '+reason;persistCase();renderLab();$('#lab-brigade').textContent='La derivación es ficticia y el responsable anterior se conserva.'});
$('#lab-close').addEventListener('click',()=>{let result=$('#lab-result').value;if(!exercise||!['asignado','atencion'].includes(exercise.state)||!result)return $('#lab-brigade').textContent='Selecciona un caso asignado y un resultado.';if(!confirm('¿Cerrar este caso de práctica?'))return;exercise.state='cerrado';exercise.messages.push('Resultado simulado: '+result);persistCase();renderLab();$('#lab-brigade').textContent='Caso de práctica cerrado localmente.'});
$('#draft-save').addEventListener('click',()=>{let action=$('#draft-action').value.trim();if(!action)return $('#draft-status').textContent='Escribe una instrucción de ejemplo.';draft={phase:$('#draft-phase').value,action,version:(draft?.version||0)+1,state:'borrador'};store.set('labDraft',JSON.stringify(draft));$('#draft-status').textContent='Borrador de prueba v'+draft.version+' guardado; no está aprobado ni publicado.'});$('#draft-review').addEventListener('click',()=>{if(!draft)return $('#draft-status').textContent='Primero crea un borrador de prueba.';draft.state='revision-simulada';store.set('labDraft',JSON.stringify(draft));$('#draft-status').textContent='Revisión registrada como ejercicio; no sustituye una revisión experta ni autoriza una alerta.'});$('#draft-publish').addEventListener('click',()=>{if(!draft||draft.state!=='revision-simulada')return $('#draft-status').textContent='Debes guardar y revisar el borrador de práctica.';draft.state='publicado-solo-en-practica';store.set('labDraft',JSON.stringify(draft));$('#draft-status').textContent='Versión '+draft.version+' mostrada solo en esta práctica: '+draft.action+' No se emitió un aviso real.'});
$('#support-form').addEventListener('submit',()=>setTimeout(renderLab,50));$('#confirm').addEventListener('click',()=>setTimeout(renderLab,50));$('#clear-request').addEventListener('click',()=>{exercise=null;store.remove('labCase');renderLab()});renderLab();
