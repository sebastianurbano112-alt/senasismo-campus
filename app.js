'use strict';
const $=s=>document.querySelector(s); const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}},remove(k){try{localStorage.removeItem(k)}catch{}}};
const details={antes:'Conoce las zonas seguras, rutas y puntos de reunión indicados por tu campus. Prepara una mochila de emergencia y consulta qué apoyos de comunicación estarán disponibles durante los simulacros.',durante:'Mantén la calma. Aléjate de ventanas y objetos que puedan caer. Sigue el protocolo vigente de tu institución y las indicaciones de los responsables de seguridad.',despues:'Cuando sea seguro y las autoridades lo indiquen, sigue las rutas autorizadas. Mantente atento a información oficial y solicita ayuda por los medios habilitados si la necesitas.'};
document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>{const d=$('#detail');d.hidden=false;d.textContent=details[b.dataset.detail];d.focus()}));
$('#lsp').addEventListener('click',()=>{$('#lsp-status').textContent='El video LSP aprobado aún no está disponible. Consulta la alternativa textual visible.'});
// Las declaraciones son voluntarias y se conservan localmente para el evento de ejemplo.
function renderDeclaration() {
  let record;
  try { record = JSON.parse(store.get('practiceDeclaration') || 'null'); } catch { record = null; }
  if (!record || record.event !== 'SIM-001') { $('#declaration').textContent = 'Sin declaración de práctica. Esto no significa que la persona esté a salvo.'; return; }
  const understood = record.understoodAt ? 'Entendí: '+record.understoodAt+'. Esta declaración no demuestra comprensión. ' : '';
  const safe = record.safeAt ? 'Declaraste estar a salvo: '+record.safeAt+'. ' : 'Seguridad no declarada o declaración retirada. ';
  $('#declaration').textContent = 'Evento de práctica '+record.event+'. '+understood+safe+'Guardado solo en este navegador; no se notificó a ninguna brigada.';
}
function saveDeclaration(kind) {
  let record;
  try { record = JSON.parse(store.get('practiceDeclaration') || 'null'); } catch { record = null; }
  if (!record || record.event !== 'SIM-001') record = {event:'SIM-001'};
  record[kind] = new Date().toLocaleString('es-PE');
  if (!store.set('practiceDeclaration', JSON.stringify(record))) { $('#declaration').textContent = 'No se pudo guardar la declaración en este navegador. No se envió a una brigada.'; return; }
  renderDeclaration();
}
$('#understood').addEventListener('click', () => saveDeclaration('understoodAt'));
$('#safe').addEventListener('click', () => saveDeclaration('safeAt'));
const withdrawSafe = document.createElement('button');
withdrawSafe.type = 'button';
withdrawSafe.className = 'button secondary';
withdrawSafe.textContent = 'Retirar declaración de seguridad';
$('#safe').after(withdrawSafe);
withdrawSafe.addEventListener('click', () => {
  let record;
  try { record = JSON.parse(store.get('practiceDeclaration') || 'null'); } catch { record = null; }
  if (!record || !record.safeAt) {
    $('#declaration').textContent = 'No hay declaración de seguridad guardada. No se notificó a una brigada.';
    return;
  }
  delete record.safeAt;
  if (!store.set('practiceDeclaration', JSON.stringify(record))) {
    $('#declaration').textContent = 'No se pudo retirar la declaración local. No se notificó a una brigada.';
    return;
  }
  renderDeclaration();
});
renderDeclaration();
// La evolución del evento es un ejercicio local, sin fuente ni reloj institucional.
const eventMeta = document.createElement('div');
eventMeta.innerHTML = '<dt>Último cambio de práctica</dt><dd id="event-updated">Sin cambios registrados</dd>';
$('#version').closest('dl').append(eventMeta);
const phases = {activo:'Activo', actualizado:'Actualización', cerrado:'Cerrado'};
let eventDemo;
try { eventDemo = JSON.parse(store.get('eventDemo') || 'null'); } catch { eventDemo = null; }
if (!eventDemo || !phases[eventDemo.phase] || !Number.isInteger(eventDemo.version)) {
  eventDemo = {phase:'activo', version:1, changedAt:'', previous:''};
}
function renderEventDemo() {
  const phase = eventDemo.phase;
  $('#phase').value = phase;
  $('#event-state').textContent = 'Estado: '+phases[phase];
  $('#version').textContent = 'v'+eventDemo.version+' · Datos de práctica';
  $('#event-title').textContent = phase === 'cerrado' ? 'Simulacro cerrado en Campus Demo' : phase === 'actualizado' ? 'Actualización del simulacro' : 'Simulacro en Campus Demo';
  $('#event-text').textContent = phase === 'cerrado' ? 'El evento de práctica ha terminado. Una solicitud abierta no se cierra automáticamente.' : 'Mantén la calma. Aléjate de ventanas y objetos que puedan caer.';
  $('#event-updated').textContent = eventDemo.changedAt ? eventDemo.changedAt+' · '+eventDemo.previous+' → '+phases[phase]+' · hora local del dispositivo' : 'Sin cambios registrados en este navegador';
}
$('#update-phase').addEventListener('click', () => {
  const phase = $('#phase').value;
  if (!phases[phase]) return;
  if (phase === eventDemo.phase) {
    $('#phase-msg').textContent = 'La fase de práctica no cambió; se conserva la versión '+eventDemo.version+'.';
    return;
  }
  const next = {phase, version:eventDemo.version+1, previous:phases[eventDemo.phase], changedAt:new Date().toLocaleString('es-PE')};
  const saved = store.set('eventDemo', JSON.stringify(next));
  eventDemo = next;
  renderEventDemo();
  $('#phase-msg').textContent = saved ? 'Cambio de práctica guardado solo en este navegador. No se emitió un aviso real.' : 'Cambio de práctica visible solo en esta sesión; no se pudo guardar en el navegador.';
});
renderEventDemo();
for(const [id,cls] of [['large','large-text'],['contrast','high-contrast']]){const e=$('#'+id);e.checked=store.get(id)==='1';document.body.classList.toggle(cls,e.checked);e.addEventListener('change',()=>{document.body.classList.toggle(cls,e.checked);store.set(id,e.checked?'1':'0')})}
$('#vibrate').addEventListener('click',()=>{let ok=false;try{ok=!!navigator.vibrate&&navigator.vibrate([150,100,150])}catch{}$('#vibrate-msg').textContent=ok?'Prueba solicitada. La percepción física requiere comprobación en el dispositivo.':'Vibración no disponible o no autorizada en este dispositivo. La información textual sigue disponible.'});
const guide='Guía de práctica: identifica las rutas oficiales del campus, mantén la calma y sigue las indicaciones de las autoridades. No es un paquete institucional aprobado.';$('#save-guide').addEventListener('click',()=>{$('#guide-msg').textContent=store.set('guide',guide)?'Guía textual de ejemplo guardada en este navegador.':'No fue posible guardar la guía en este navegador.'});$('#view-guide').addEventListener('click',()=>{$('#guide-msg').textContent=store.get('guide')||'Aún no hay una guía guardada.'});
// La descarga es una guía de ejemplo autocontenida, no un paquete institucional aprobado.
const downloadGuide = document.createElement('button');
downloadGuide.type = 'button';
downloadGuide.className = 'button secondary';
downloadGuide.textContent = 'Descargar guía de práctica (.txt)';
$('#view-guide').after(downloadGuide);
downloadGuide.addEventListener('click', () => {
  try {
    const text = 'SEÑASISMO CAMPUS — GUÍA DE PRÁCTICA\n\n'
      + 'Documento académico de ejemplo. No es un protocolo institucional aprobado y no contiene información en tiempo real.\n\n'
      + 'Antes: identifica las rutas, puntos de reunión y apoyos de comunicación indicados por tu institución.\n'
      + 'Durante: sigue las indicaciones oficiales disponibles para tu campus.\n'
      + 'Después: consulta a las autoridades y solicita apoyo mediante los canales oficiales.\n\n'
      + 'La página de práctica no envía solicitudes a una brigada ni reemplaza los canales oficiales.\n';
    const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'guia-practica-senasismo.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#guide-msg').textContent = 'Se solicitó la descarga de una guía de ejemplo. Comprueba que el archivo se guardó en tu dispositivo.';
  } catch {
    $('#guide-msg').textContent = 'No se pudo preparar la descarga. La guía de ejemplo sigue disponible en esta página.';
  }
});
// La confirmación utiliza exactamente los datos revisados y solo crea un caso por operación.
let reviewedRequest = null;
let confirmationInProgress = false;
// Identificación de zona separada de la referencia; ambos datos son ficticios.
const areaLabel = document.createElement('label');
areaLabel.htmlFor = 'practice-area';
areaLabel.textContent = 'Zona de práctica';
const areaInput = document.createElement('select');
areaInput.id = 'practice-area';
for (const label of ['Selecciona una zona', 'Zona A', 'Zona B', 'Otra zona']) {
  const option = document.createElement('option');
  option.value = label === 'Selecciona una zona' ? '' : label;
  option.textContent = label;
  areaInput.append(option);
}
document.querySelector('label[for="zone"]').before(areaLabel, areaInput);
const locationNote = document.createElement('p');
locationNote.className = 'fine';
locationNote.textContent = 'Indica la zona y la referencia manualmente. No se obtiene ni se rastrea tu ubicación automática.';
areaInput.after(locationNote);
const locationDemo = document.createElement('div');
locationDemo.innerHTML = '<label class="check"><input type="checkbox" id="location-consent-demo"> Simular consentimiento para ubicación de ejemplo</label><button class="button secondary" type="button" id="location-demo">Simular ubicación</button><p class="fine" id="location-demo-status" role="status">La ubicación automática es ficticia. Puedes usar la zona manual sin conceder permisos.</p>';
locationNote.after(locationDemo);
let sampleLocation = null;
$('#location-demo').addEventListener('click', () => {
  if (!$('#location-consent-demo').checked) {
    $('#location-demo-status').textContent = 'Activa el consentimiento de práctica o continúa con una zona manual. No se solicitó acceso al dispositivo.'; return;
  }
  sampleLocation = {area:'Zona A', precision:'aproximada, ejemplo', time:new Date().toLocaleString('es-PE'), capturedAt:Date.now()};
  $('#practice-area').value = sampleLocation.area;
  $('#location-demo-status').textContent = 'Ubicación ficticia: '+sampleLocation.area+' · Precisión '+sampleLocation.precision+' · Hora '+sampleLocation.time+'. No se consultó el GPS.';
  invalidateReview();
});
$('#location-consent-demo').addEventListener('change', () => {
  if (!$('#location-consent-demo').checked) { sampleLocation = null; $('#location-demo-status').textContent = 'Consentimiento de práctica retirado. No hay seguimiento de ubicación.'; invalidateReview(); }
});
function invalidateReview() {
  reviewedRequest = null;
  $('#review').hidden = true;
}
for (const id of ['need', 'practice-area', 'zone', 'note']) {
  $('#'+id).addEventListener('input', invalidateReview);
  $('#'+id).addEventListener('change', invalidateReview);
}
$('#support-form').addEventListener('submit', e => {
  e.preventDefault();
  const need = $('#need').value;
  const area = $('#practice-area').value;
  const zone = $('#zone').value.trim();
  const note = $('#note').value.trim();
  $('#need').setAttribute('aria-invalid', String(!need));
  $('#practice-area').setAttribute('aria-invalid', String(!area));
  $('#zone').setAttribute('aria-invalid', String(!zone));
  if (!need || !area || !zone) {
    invalidateReview();
    $('#form-error').textContent = 'Selecciona el tipo de apoyo y la zona e ingresa una referencia de ejemplo.';
    (!need ? $('#need') : !area ? $('#practice-area') : $('#zone')).focus();
    return;
  }
  $('#form-error').textContent = '';
  const selectedLocation = sampleLocation && sampleLocation.area === area && $('#location-consent-demo').checked ? sampleLocation : null;
  if (selectedLocation && Date.now() - selectedLocation.capturedAt > 300000) {
    $('#form-error').textContent = 'La ubicación de ejemplo tiene más de cinco minutos. Simúlala de nuevo o retira el consentimiento y usa la zona manual.'; return;
  }
  reviewedRequest = {need, area, zone, note, event:'SIM-001', eventPhase:phases[eventDemo.phase], locationDemo:selectedLocation};
  $('#review-text').textContent = 'Evento de práctica: '+reviewedRequest.event+' ('+reviewedRequest.eventPhase+'). Necesidad: '+need+'. Zona: '+area+'. Referencia: '+zone+'. Nota: '+(note||'Sin nota')+'. '+(selectedLocation ? 'Ubicación ficticia confirmada: '+selectedLocation.precision+' · '+selectedLocation.time+'. ' : 'Ubicación manual. ')+'Estos datos permanecen en este navegador.';
  $('#review').hidden = false;
  $('#confirm').focus();
});
$('#edit').addEventListener('click', () => { invalidateReview(); $('#need').focus(); });
$('#confirm').addEventListener('click', () => {
  if (!reviewedRequest || confirmationInProgress) return;
  if (reviewedRequest.locationDemo && Date.now() - reviewedRequest.locationDemo.capturedAt > 300000) {
    invalidateReview();
    $('#request-status').textContent = 'La ubicación ficticia quedó antigua. Simúlala de nuevo o usa una zona manual y vuelve a revisar.'; return;
  }
  if (reviewedRequest.eventPhase !== phases[eventDemo.phase]) {
    invalidateReview();
    $('#request-status').textContent = 'La fase del simulacro cambió. Revisa la solicitud nuevamente antes de guardarla.';
    return;
  }
  confirmationInProgress = true;
  let activeCase;
  try { activeCase = JSON.parse(store.get('labCase') || 'null'); } catch { activeCase = null; }
  if (activeCase && !['cerrado','cancelada'].includes(activeCase.state)) {
    $('#request-status').textContent = 'Ya existe una práctica activa ('+activeCase.id+'). Revísala en el laboratorio antes de iniciar otra.';
    confirmationInProgress = false;
    return;
  }
  const record = {id:'DEMO-'+Date.now(), ...reviewedRequest, time:new Date().toLocaleString('es-PE'), createdAt:Date.now()};
  const saved = store.set('request', JSON.stringify(record));
  if (saved) {
    // La nueva necesidad retira la declaración de seguridad solo cuando puede guardarse.
    let declaration;
    try { declaration = JSON.parse(store.get('practiceDeclaration') || 'null'); } catch { declaration = null; }
    let safetyUpdated = true;
    if (declaration?.safeAt) {
      delete declaration.safeAt;
      safetyUpdated = store.set('practiceDeclaration', JSON.stringify(declaration));
    }
    if (safetyUpdated) renderDeclaration();
    else $('#declaration').textContent = 'No se pudo actualizar la declaración de seguridad local. Revísala manualmente.';
    invalidateReview();
    // Crear el caso antes de aceptar otra interacción evita duplicados en esta sesión.
    renderLab();
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
<article class="sim-card"><h3>2. Mesa de brigada de ejemplo</h3><label for="lab-filter">Filtrar el estado local</label><select id="lab-filter"><option value="todos">Todos</option><option value="pendiente">Pendiente</option><option value="recibido">Recibido en práctica</option><option value="asignado">Asignado</option><option value="atencion">En atención</option><option value="cerrado">Cerrado</option></select><div id="lab-queue" role="status"></div><button class="button secondary" id="lab-take">Asignar a brigada ficticia</button><button class="button secondary" id="lab-ack">Registrar acuse simulado</button><label for="lab-destination">Destino de ejemplo</label><select id="lab-destination"><option value="">Selecciona destino</option><option>Equipo de apoyo ficticio</option><option>Seguridad ficticia</option></select><label for="lab-reason">Motivo de derivación</label><input id="lab-reason" maxlength="100" placeholder="Motivo de práctica"><button class="button secondary" id="lab-transfer">Practicar derivación</button><button class="button secondary" id="lab-accept-transfer">Simular aceptación de derivación</button><label for="lab-result">Resultado de práctica</label><select id="lab-result"><option value="">Selecciona resultado</option><option>Orientación proporcionada</option><option>Derivado a otro equipo</option><option>Práctica cancelada</option></select><button class="button secondary" id="lab-close">Cerrar caso simulado</button><p id="lab-brigade" role="status"></p></article>
<article class="sim-card"><h3>3. Revisión de contenido</h3><p>Ensaya el ciclo de borrador, revisión y publicación ficticia.</p><label for="draft-phase">Fase del ejercicio</label><select id="draft-phase"><option>Preparación</option><option>Simulacro</option><option>Cierre</option></select><label for="draft-action">Instrucción de ejemplo</label><textarea id="draft-action" rows="3" maxlength="180" placeholder="Escribe una instrucción de prueba"></textarea><button class="button secondary" id="draft-save">Guardar borrador</button><button class="button secondary" id="draft-review">Registrar revisión simulada</button><button class="button secondary" id="draft-publish">Publicar en el simulador</button><p id="draft-status" role="status"></p></article></div>
<div class="detail" style="margin-top:1.5rem"><h3>Roles y límites de la práctica</h3><p>Comunidad: consulta y practica una solicitud. Brigada ficticia: ensaya asignación, acuse, derivación y cierre. Equipo de contenidos: crea y revisa un borrador. La selección es libre y no constituye control de acceso.</p><p>Para una operación real se requerirían permisos institucionales, autenticación, almacenamiento compartido, controles de concurrencia, validación lingüística y acuses verificables.</p></div>`;
// HU24 y HU40: representación visual con datos ficticios, sin conexión institucional.
const institutionalDemo = document.createElement('div');
institutionalDemo.className = 'simgrid';
institutionalDemo.style.marginTop = '1.5rem';
institutionalDemo.innerHTML = `<article class="sim-card" aria-labelledby="directory-demo-title"><h3 id="directory-demo-title">Directorio de práctica</h3><p><strong>Ejemplo ficticio:</strong> los contactos no son reales y no sirven para solicitar ayuda. Consulta los canales oficiales de tu institución ante una emergencia.</p><label for="directory-filter">Filtrar contacto ficticio</label><select id="directory-filter"><option value="todos">Todos los equipos</option><option value="orientacion">Orientación ficticia</option><option value="accesibilidad">Accesibilidad ficticia</option><option value="brigada">Brigada ficticia</option></select><div id="directory-results" role="status" aria-live="polite"></div></article><article class="sim-card" aria-labelledby="role-demo-title"><h3 id="role-demo-title">Vista de roles de práctica</h3><p><strong>Simulación visual:</strong> elegir un rol no inicia sesión ni concede permisos reales.</p><label for="role-preview">Selecciona un rol ficticio</label><select id="role-preview"><option value="comunidad">Comunidad</option><option value="brigada">Brigada ficticia</option><option value="contenido">Equipo de contenido ficticio</option></select><div id="role-description" role="status" aria-live="polite"></div></article>`;
lab.append(institutionalDemo);
document.querySelector('#apoyo').before(lab);
const demoDirectory = [
  {type:'orientacion', title:'Orientación ficticia', detail:'Ejemplo de orientación del campus. Sin contacto ni servicio asociado.'},
  {type:'accesibilidad', title:'Accesibilidad ficticia', detail:'Ejemplo de apoyo para la comunicación. Sin contacto ni servicio asociado.'},
  {type:'brigada', title:'Brigada ficticia', detail:'Ejemplo de coordinación de práctica. No recibe solicitudes.'}
];
function renderDirectoryDemo() {
  const selected = $('#directory-filter').value;
  const target = $('#directory-results');
  target.replaceChildren();
  demoDirectory.filter(item => selected === 'todos' || item.type === selected).forEach(item => {
    const entry = document.createElement('div');
    const title = document.createElement('strong');
    const description = document.createElement('p');
    title.textContent = item.title;
    description.textContent = item.detail;
    entry.append(title, description);
    target.append(entry);
  });
}
const roleDescriptions = {
  comunidad:'Comunidad: consulta la información de práctica y ensaya una solicitud local.',
  brigada:'Brigada ficticia: explora la mesa de ejemplo y ensaya sus estados sin gestionar casos reales.',
  contenido:'Equipo de contenido ficticio: ensaya borradores y revisiones sin publicar avisos oficiales.'
};
function renderRoleDemo() { $('#role-description').textContent = roleDescriptions[$('#role-preview').value] + ' Esta vista no autentica ni autoriza acciones.'; }
$('#directory-filter').addEventListener('change', renderDirectoryDemo);
$('#role-preview').addEventListener('change', renderRoleDemo);
renderDirectoryDemo();
renderRoleDemo();
// Seguimiento accesible del caso simulado junto al formulario de la persona usuaria.
const caseTracking = document.createElement('div');
caseTracking.innerHTML = '<h4>Seguimiento de práctica</h4><p id="tracking-status" role="status" aria-live="polite"></p><p id="tracking-history"></p><h4>Cierres de práctica guardados</h4><p class="fine">Se conservan hasta diez cierres locales; no son registros oficiales.</p><p id="closed-history" role="status"></p><button type="button" class="textbutton" id="clear-closed-history">Eliminar cierres de práctica guardados</button><p><a href="#laboratorio">Ver la coordinación de práctica</a></p><p><a href="#directory-demo-title">Ver alternativas de ejemplo (no son contactos reales)</a></p><p class="fine">Los estados y mensajes son ficticios y solo existen en este navegador.</p>';
$('#request-status').after(caseTracking);
function readClosedHistory() {
  try { const records=JSON.parse(store.get('practiceClosedHistory') || '[]'); return Array.isArray(records) ? records : []; } catch { return []; }
}
function renderClosedHistory() {
  const records=readClosedHistory();
  $('#closed-history').textContent=records.length ? records.map(record => 'Caso '+record.id+' · '+record.time+' · Resultado de práctica: '+record.result).join(' | ') : 'No hay cierres de práctica guardados.';
}
$('#clear-closed-history').addEventListener('click', () => { store.remove('practiceClosedHistory'); renderClosedHistory(); });
renderClosedHistory();
// Panel de alcance exclusivamente visual: no implementa autorización ni sincronización reales.
const scopeDemo = document.createElement('div');
scopeDemo.innerHTML = '<p class="fine"><strong>Ámbito de práctica:</strong> las restricciones y la conexión son ficticias. No hay inicio de sesión, permisos reales ni sincronización entre dispositivos.</p><label class="check"><input type="checkbox" id="scope-authorized" checked> Simular autorización para Campus Demo</label><label for="scope-campus">Campus de ejemplo</label><select id="scope-campus"><option>Campus Demo</option><option>Otro campus ficticio</option></select><label for="scope-event">Evento de ejemplo</label><select id="scope-event"><option>SIM-001</option><option>SIM-002</option></select><label for="scope-zone">Zona asignada de ejemplo</label><select id="scope-zone"><option>Todas las zonas</option><option>Zona A</option><option>Zona B</option><option>Otra zona</option></select><button type="button" class="button secondary" id="scope-sync">Simular sincronización</button><p id="scope-status" role="status"></p>';
$('#lab-filter').before(scopeDemo);
let exercise=null; try{exercise=JSON.parse(store.get('labCase')||'null')}catch{};
let draft=null; try{draft=JSON.parse(store.get('labDraft')||'null')}catch{};
function copyCase(){let saved;try{saved=JSON.parse(store.get('request')||'null')}catch{};if(saved&&(!exercise||exercise.id!==saved.id)){exercise={...saved,state:'pendiente',version:1,owner:'Sin asignar',messages:[],transfer:'Sin derivación'};persistCase()} }
function persistCase(){store.set('labCase',JSON.stringify(exercise))}
const practiceStates = {pendiente:'Guardado local · Pendiente de confirmar', recibido:'Recibido en práctica', asignado:'Asignado en práctica', atencion:'En atención simulada', cerrado:'Cerrado en práctica', cancelada:'Cancelado en práctica', cancelacion_pendiente:'Cancelación de práctica pendiente'};
function renderLab() {
  copyCase();
  const box=$('#lab-case'), queue=$('#lab-queue'), tracking=$('#tracking-status');
  const simulatedOnline = $('#practice-connection').checked;
  const lastSync = store.get('panelPracticeSync');
  $('#scope-status').textContent = 'Conexión simulada: '+(simulatedOnline ? 'disponible' : 'sin conexión')+'. Última sincronización de práctica: '+(lastSync || 'ninguna')+'. No representa conexión ni sincronización real.';
  if (!exercise) {
    box.textContent='No hay solicitudes de práctica guardadas.';
    queue.textContent='La cola de ejemplo está vacía. Esto no informa sobre una emergencia real.';
    tracking.textContent='No hay una solicitud de práctica guardada.';
    $('#tracking-history').textContent='';
    return;
  }
  const status = practiceStates[exercise.state] || 'Estado de práctica no reconocido';
  const update = exercise.updatedAt ? ' · Último cambio local: '+exercise.updatedAt : '';
  const lastMessage = exercise.messages?.at(-1) || 'Sin mensajes de práctica.';
  box.textContent='Caso '+exercise.id+' · '+exercise.need+' · '+exercise.zone+' · '+status+' · Responsable de ejemplo: '+exercise.owner+' · Versión '+exercise.version+update+'. '+lastMessage;
  const pendingAck = exercise.ackPending ? ' Acuse de atención ficticio pendiente de entrega simulada; no hay recepción confirmada.' : '';
  tracking.textContent='Caso '+exercise.id+' · '+status+' · Evento de práctica: '+(exercise.event||'SIM-001')+' · Zona: '+(exercise.area||'No especificada')+' · Referencia: '+exercise.zone+' · Responsable ficticio: '+exercise.owner+update+'. '+lastMessage+pendingAck+' '+exercise.transfer+'. No se ha enviado a una brigada real. Para apoyo real, consulta los canales oficiales de tu institución.';
  const history = Array.isArray(exercise.history) ? exercise.history : [];
  $('#tracking-history').textContent = history.length ? 'Historial local de práctica: '+history.map(entry=>entry.time+' — '+entry.action).join(' | ') : 'Sin historial detallado para este caso guardado anteriormente.';
  const allowed = $('#scope-authorized').checked && $('#scope-campus').value === 'Campus Demo' && $('#scope-event').value === (exercise.event || 'SIM-001') && ($('#scope-zone').value === 'Todas las zonas' || $('#scope-zone').value === exercise.area);
  if (!allowed) { queue.textContent='Acceso de práctica denegado para este ámbito ficticio. No se muestran datos del caso en esta mesa. Esto no es un control de acceso real.'; return; }
  const visible=$('#lab-filter').value==='todos'||$('#lab-filter').value===exercise.state;
  const age = Number.isFinite(exercise.createdAt) ? Math.max(0,Math.floor((Date.now()-exercise.createdAt)/60000))+' min de práctica' : 'Antigüedad no disponible';
  queue.textContent=visible ? 'Caso '+exercise.id+' · Necesidad: '+exercise.need+' · Zona: '+(exercise.area||'No indicada')+' · Referencia: '+exercise.zone+' · Antigüedad: '+age+' · Estado: '+status+' · Registrado: '+exercise.time+' · '+exercise.transfer : 'Ningún caso coincide con el filtro. Esto no demuestra ausencia de necesidad.';
}
function stampCase(action) { exercise.updatedAt = new Date().toLocaleString('es-PE'); if (!Array.isArray(exercise.history)) exercise.history = []; exercise.history.push({time:exercise.updatedAt,action}); }

const receiptDemo = document.createElement('div');
receiptDemo.innerHTML = '<h4>Recepción y conexión de práctica</h4><p>Los controles siguientes simulan respuestas en este navegador; no existe un servicio conectado.</p><label class="check"><input type="checkbox" id="practice-connection" checked> Simular conexión disponible</label><button class="button secondary" type="button" id="practice-receipt">Simular acuse de recepción</button><button class="button secondary" type="button" id="practice-cancel-receipt">Simular confirmación de cancelación</button><p id="practice-receipt-status" role="status"></p>';
$('#lab-case').after(receiptDemo);
$('#practice-receipt').addEventListener('click', () => {
  if (!exercise || exercise.state !== 'pendiente') { $('#practice-receipt-status').textContent = 'Primero guarda un caso pendiente de práctica.'; return; }
  if (!$('#practice-connection').checked) { $('#practice-receipt-status').textContent = 'Sin conexión simulada: el caso permanece pendiente. No se promete recepción ni atención.'; return; }
  exercise.state = 'recibido'; stampCase('Acuse de recepción ficticio'); persistCase(); renderLab();
  $('#practice-receipt-status').textContent = 'Recepción simulada con identificador y hora. Ningún servicio real recibió el caso.';
});
$('#practice-cancel-receipt').addEventListener('click', () => {
  if (!exercise || exercise.state !== 'cancelacion_pendiente') { $('#practice-receipt-status').textContent = 'No hay cancelación pendiente de práctica.'; return; }
  if (!$('#practice-connection').checked) { $('#practice-receipt-status').textContent = 'La cancelación sigue pendiente porque la conexión simulada está desactivada.'; return; }
  exercise.state = 'cancelada'; exercise.version++; stampCase('Acuse ficticio de cancelación'); persistCase(); renderLab();
  $('#practice-receipt-status').textContent = 'Cancelación confirmada solo en la práctica. No se contactó a ningún servicio.';
});
for (const id of ['scope-authorized','scope-campus','scope-event','scope-zone','practice-connection']) $('#'+id).addEventListener('change', renderLab);
$('#scope-sync').addEventListener('click', () => {
  if (!$('#practice-connection').checked) { $('#scope-status').textContent = 'Sin conexión simulada: no se actualizó la sincronización de práctica.'; return; }
  const when = new Date().toLocaleString('es-PE');
  if (!store.set('panelPracticeSync',when)) { $('#scope-status').textContent = 'No se pudo guardar la sincronización de práctica en este navegador.'; return; }
  renderLab();
});

// Cola separada y precargada: datos y prioridades didácticos, sin casos reales.
const priorityDemo = document.createElement('section');
priorityDemo.setAttribute('aria-labelledby','priority-demo-title');
priorityDemo.className = 'detail';
priorityDemo.innerHTML = '<h4 id="priority-demo-title">Ordenar cola ficticia</h4><p>Estos casos y categorías son ejemplos académicos. La prioridad se asignó para el ejercicio; no representa un protocolo aprobado ni un diagnóstico.</p><label for="priority-order">Orden de ejemplo</label><select id="priority-order"><option value="rules">Categoría de ejemplo y antigüedad</option><option value="age">Antigüedad: primero el más antiguo</option></select><label for="priority-zone">Zona de ejemplo</label><select id="priority-zone"><option value="all">Todas las zonas</option><option value="Zona A">Zona A</option><option value="Zona B">Zona B</option></select><label for="priority-state">Estado de ejemplo</label><select id="priority-state"><option value="all">Todos los estados</option><option value="Pendiente">Pendiente</option><option value="En atención">En atención</option></select><button type="button" class="button secondary" id="priority-reset">Restablecer filtros de ejemplo</button><p id="priority-summary" role="status" aria-live="polite"></p><ul id="priority-list"></ul><p class="fine">Los casos incompletos permanecen visibles como pendientes de clasificación, incluso al filtrar, para no perderlos en el ejercicio.</p>';
$('#lab-queue').after(priorityDemo);
const sampleQueue = [
  {id:'EJ-01', need:'Información accesible', zone:'Zona A', state:'Pendiente', age:12, category:2},
  {id:'EJ-02', need:'Acompañamiento', zone:'Zona B', state:'Pendiente', age:25, category:1},
  {id:'EJ-03', need:'Orientación para evacuar', zone:'Zona A', state:'En atención', age:8, category:1},
  {id:'EJ-04', need:'Necesidad por completar', zone:'Zona no indicada', state:'Pendiente de clasificación', age:18, category:null}
];
function renderPriorityDemo() {
  const zone=$('#priority-zone').value, state=$('#priority-state').value, order=$('#priority-order').value;
  const rows=sampleQueue.filter(item => item.category === null || ((zone === 'all' || item.zone === zone) && (state === 'all' || item.state === state)));
  rows.sort((a,b) => order === 'age' ? b.age-a.age : ((a.category ?? 99)-(b.category ?? 99) || b.age-a.age));
  $('#priority-summary').textContent = 'Orden: '+(order === 'age' ? 'antigüedad' : 'categoría ficticia y antigüedad')+'. Zona: '+(zone === 'all' ? 'todas' : zone)+'. Estado: '+(state === 'all' ? 'todos' : state)+'. '+rows.length+' casos de ejemplo visibles.';
  const list=$('#priority-list'); list.replaceChildren();
  rows.forEach(item => {
    const li=document.createElement('li');
    li.textContent=item.id+' · '+item.need+' · '+item.zone+' · '+item.state+' · '+item.age+' min de ejemplo · '+(item.category === null ? 'Pendiente de clasificación' : 'Categoría ficticia '+item.category);
    list.append(li);
  });
}
for (const id of ['priority-order','priority-zone','priority-state']) $('#'+id).addEventListener('change',renderPriorityDemo);
$('#priority-reset').addEventListener('click',() => { $('#priority-order').value='rules'; $('#priority-zone').value='all'; $('#priority-state').value='all'; renderPriorityDemo(); });
renderPriorityDemo();

// Plantillas didácticas: nunca se presentan como orientación aprobada o enviada.
const messageDemo = document.createElement('div');
messageDemo.innerHTML = '<h4>Mensaje estructurado de práctica</h4><p>Elige una plantilla ficticia para ensayar la revisión. No se envía a ninguna persona.</p><label for="practice-message">Plantilla de ejemplo</label><select id="practice-message"><option value="">Selecciona una plantilla</option><option value="review">Estamos revisando tu solicitud de práctica</option><option value="update">Consulta el seguimiento de práctica</option><option value="closing">El simulacro de práctica terminó</option><option value="unapproved">Instrucción sin revisión (ejemplo bloqueado)</option></select><button class="button secondary" id="practice-message-send">Registrar mensaje de práctica</button><p id="practice-message-status" role="status"></p>';
$('#lab-brigade').before(messageDemo);
$('#practice-message-send').addEventListener('click', () => {
  if (!exercise || !['asignado','atencion'].includes(exercise.state)) {
    $('#practice-message-status').textContent = 'Primero asigna un caso de práctica.'; return;
  }
  const choice = $('#practice-message').value;
  if (!choice) { $('#practice-message-status').textContent = 'Selecciona una plantilla de ejemplo.'; return; }
  if (choice === 'unapproved') {
    $('#practice-message-status').textContent = 'Ejemplo retenido para revisión: la instrucción no cuenta con aprobación. No se registró ni envió.'; return;
  }
  if (choice === 'closing' && eventDemo.phase !== 'cerrado') {
    $('#practice-message-status').textContent = 'Ejemplo retenido para revisión: la fase de práctica todavía no está cerrada. No se registró ni envió.'; return;
  }
  const templates = {review:'Estamos revisando tu solicitud de práctica.', update:'Consulta el seguimiento de práctica.', closing:'El simulacro de práctica terminó.'};
  const message = templates[choice];
  if (!message) { $('#practice-message-status').textContent = 'Selecciona una plantilla válida de práctica.'; return; }
  stampCase('Mensaje ficticio de '+exercise.owner+': '+message);
  exercise.messages.push('Mensaje de práctica de '+exercise.owner+' ('+exercise.updatedAt+'): '+message);
  persistCase(); renderLab();
  $('#practice-message-status').textContent = 'Mensaje registrado solo en este navegador. No fue enviado ni aprobado institucionalmente.';
});

$('#lab-filter').addEventListener('change',renderLab);$('#lab-save').addEventListener('click',()=>{if(!exercise)return $('#lab-feedback').textContent='Primero guarda una solicitud de prueba.';let z=$('#lab-update').value.trim();if(!z)return $('#lab-feedback').textContent='Escribe una referencia de ejemplo.';if(['cerrado','cancelada','cancelacion_pendiente'].includes(exercise.state))return $('#lab-feedback').textContent='El caso terminó o tiene una cancelación pendiente; revisa su estado antes de actualizarlo.';exercise.zone=z;exercise.version++;stampCase('Referencia actualizada en práctica');persistCase();renderLab();$('#lab-feedback').textContent='Referencia actualizada en este navegador; no se ha enviado a nadie.'});
const cancelReview = document.createElement('div');
cancelReview.hidden = true;
cancelReview.innerHTML = '<p id="cancel-review-text"></p><button type="button" class="button primary" id="confirm-cancel-practice">Confirmar solicitud de cancelación</button> <button type="button" class="button secondary" id="keep-practice">Conservar solicitud</button>';
$('#lab-cancel').after(cancelReview);
let pendingCancel = null;
function dismissCancel() { pendingCancel = null; cancelReview.hidden = true; }
$('#lab-cancel').addEventListener('click', () => {
  if (!exercise) { dismissCancel(); $('#lab-feedback').textContent='No hay solicitud para cancelar.'; return; }
  if (['cerrado','cancelada','cancelacion_pendiente'].includes(exercise.state)) { dismissCancel(); $('#lab-feedback').textContent='El caso ya terminó o tiene una cancelación pendiente.'; return; }
  pendingCancel = {id:exercise.id, version:exercise.version, state:exercise.state};
  $('#cancel-review-text').textContent = '¿Solicitar la cancelación de la práctica '+exercise.id+'? La confirmación será simulada y no se notificará a una brigada.';
  cancelReview.hidden = false; $('#confirm-cancel-practice').focus();
});
$('#keep-practice').addEventListener('click', () => { dismissCancel(); $('#lab-feedback').textContent='La solicitud conserva su estado de práctica.'; $('#lab-cancel').focus(); });
$('#confirm-cancel-practice').addEventListener('click', () => {
  if (!pendingCancel || !exercise || exercise.id !== pendingCancel.id || exercise.version !== pendingCancel.version || exercise.state !== pendingCancel.state) {
    dismissCancel(); $('#lab-feedback').textContent='El caso cambió. Revisa la cancelación nuevamente.'; return;
  }
  exercise.state='cancelacion_pendiente'; exercise.version++; stampCase('Cancelación ficticia pendiente');
  persistCase(); dismissCancel(); renderLab();
  $('#lab-feedback').textContent='Cancelación pendiente de acuse simulado; no se ha contactado a un servicio.';
});
// Ejercicio de conflicto: ambas acciones se ejecutan en este navegador y no coordinan equipos reales.
const otherTake = document.createElement('button');
otherTake.type = 'button'; otherTake.className = 'button secondary';
otherTake.textContent = 'Simular toma por otra brigada';
$('#lab-take').after(otherTake);
function simulateTake(owner) {
  if (!exercise) { $('#lab-brigade').textContent='Primero crea una solicitud de práctica.'; return; }
  if (!$('#practice-connection').checked) {
    $('#lab-brigade').textContent='Sin conexión simulada: no se puede confirmar una asignación. El caso conserva su responsable anterior; usa la contingencia de práctica.'; return;
  }
  if (exercise.state === 'asignado' || exercise.state === 'atencion') {
    $('#lab-brigade').textContent='Conflicto simulado: el caso ya está asignado a '+exercise.owner+'. Se conserva el responsable existente.'; return;
  }
  if (exercise.state !== 'recibido') { $('#lab-brigade').textContent='Primero simula el acuse de recepción del caso antes de asignarlo.'; return; }
  exercise.owner=owner; exercise.state='asignado'; stampCase('Asignación ficticia a '+owner); persistCase(); renderLab();
  $('#lab-brigade').textContent='Asignación confirmada solo en la práctica por '+owner+'. No hay servicio compartido ni exclusividad real entre dispositivos.';
}
$('#lab-take').addEventListener('click', () => simulateTake('Brigada ficticia'));
otherTake.addEventListener('click', () => simulateTake('Otra brigada ficticia'));
const deliverAck = document.createElement('button');
deliverAck.type='button'; deliverAck.className='button secondary';
deliverAck.textContent='Simular entrega del acuse de atención';
$('#lab-ack').after(deliverAck);
$('#lab-ack').addEventListener('click', () => {
  if (!exercise || exercise.state !== 'asignado') { $('#lab-brigade').textContent='Primero asigna un caso de práctica.'; return; }
  if (exercise.ackPending) { $('#lab-brigade').textContent='Ya hay un acuse ficticio pendiente para este caso.'; return; }
  exercise.ackPending = {caseId:exercise.id, owner:exercise.owner};
  stampCase('Acuse de atención ficticio pendiente'); persistCase(); renderLab();
  $('#lab-brigade').textContent='Acuse ficticio preparado para '+exercise.id+'. Permanece pendiente hasta simular su entrega; no se ha enviado a nadie.';
});
deliverAck.addEventListener('click', () => {
  if (!exercise || !exercise.ackPending || exercise.state !== 'asignado') { $('#lab-brigade').textContent='Primero prepara un acuse para un caso asignado.'; return; }
  if (!$('#practice-connection').checked) { $('#lab-brigade').textContent='Sin conexión simulada: el acuse ficticio permanece pendiente y no se afirma recepción.'; return; }
  if (exercise.ackPending.caseId !== exercise.id || exercise.ackPending.owner !== exercise.owner) { $('#lab-brigade').textContent='El caso o responsable cambió; el acuse ficticio no se ha entregado.'; return; }
  const owner=exercise.owner; delete exercise.ackPending; exercise.state='atencion';
  stampCase('Entrega simulada de acuse de atención por '+owner);
  exercise.messages.push('Acuse de atención simulado de '+owner+' ('+exercise.updatedAt+'): estamos revisando el caso.');
  persistCase(); renderLab();
  $('#lab-brigade').textContent='Entrega del acuse simulada solo en este navegador. No se ha contactado a una brigada ni prometido un tiempo de llegada.';
});
$('#lab-transfer').addEventListener('click', () => {
  const target=$('#lab-destination').value, reason=$('#lab-reason').value.trim();
  const allowedTargets=['Equipo de apoyo ficticio','Seguridad ficticia'];
  if (!exercise || !['asignado','atencion'].includes(exercise.state) || !allowedTargets.includes(target) || !reason) { $('#lab-brigade').textContent='Selecciona un caso asignado, un destino de ejemplo y un motivo.'; return; }
  if (exercise.transferTarget) { $('#lab-brigade').textContent='Ya hay una derivación ficticia pendiente; se conserva el responsable y destino anteriores.'; return; }
  if (exercise.ackPending) { $('#lab-brigade').textContent='Primero completa el acuse de atención pendiente antes de derivar el caso de práctica.'; return; }
  if (target === exercise.owner) { $('#lab-brigade').textContent='Elige un destino ficticio distinto del responsable actual.'; return; }
  exercise.transfer='Derivación pendiente a '+target+'; motivo: '+reason;
  exercise.transferTarget=target; exercise.transferReason=reason;
  stampCase('Derivación ficticia pendiente a '+target+'; motivo: '+reason); persistCase(); renderLab();
  $('#lab-brigade').textContent=$('#practice-connection').checked ? 'Derivación de práctica pendiente: el responsable anterior se conserva hasta la aceptación simulada.' : 'Sin conexión simulada: derivación de práctica pendiente. Conserva al responsable anterior y consulta los canales oficiales de tu institución.';
});
$('#lab-accept-transfer').addEventListener('click',()=>{
  if(!exercise || !['asignado','atencion'].includes(exercise.state) || !exercise.transferTarget) return $('#lab-brigade').textContent='Primero registra una derivación pendiente en la práctica.';
  if(!$('#practice-connection').checked) return $('#lab-brigade').textContent='Sin conexión simulada: no se puede confirmar la aceptación. La derivación sigue pendiente y conserva al responsable anterior.';
  const target = exercise.transferTarget;
  const reason = exercise.transferReason || 'Motivo de práctica registrado anteriormente';
  exercise.owner = target;
  exercise.transfer = 'Derivación aceptada en práctica por '+target+'; motivo: '+reason;
  delete exercise.transferTarget;
  delete exercise.transferReason;
  stampCase('Aceptación ficticia de derivación por '+target+'; motivo: '+reason);
  persistCase(); renderLab();
  $('#lab-brigade').textContent='Aceptación simulada guardada solo en este navegador; no se notificó a ningún equipo.';
});
const closeReview = document.createElement('div');
closeReview.hidden = true;
closeReview.innerHTML = '<p id="close-review-text"></p><button type="button" class="button primary" id="confirm-close">Confirmar cierre de práctica</button> <button type="button" class="button secondary" id="cancel-close">Volver sin cerrar</button>';
$('#lab-close').after(closeReview);
let pendingClose = null;
function dismissClose() { pendingClose = null; closeReview.hidden = true; }
$('#lab-result').addEventListener('change', dismissClose);
$('#lab-close').addEventListener('click', () => {
  const result = $('#lab-result').value;
  if (exercise?.transferTarget) { dismissClose(); $('#lab-brigade').textContent = 'La derivación sigue pendiente. Completa su aceptación de práctica antes de cerrar el caso.'; return; }
  if (!exercise || !['asignado','atencion'].includes(exercise.state) || !result) {
    dismissClose(); $('#lab-brigade').textContent = 'Selecciona un caso asignado y un resultado.'; return;
  }
  pendingClose = {id:exercise.id, result};
  $('#close-review-text').textContent = 'Revisa el cierre de práctica del caso '+exercise.id+': '+result+'. No se notificará a una brigada real.';
  closeReview.hidden = false; $('#confirm-close').focus();
});
$('#cancel-close').addEventListener('click', () => { dismissClose(); $('#lab-brigade').textContent = 'El caso conserva su estado de práctica.'; $('#lab-close').focus(); });
$('#confirm-close').addEventListener('click', () => {
  if (!pendingClose || !exercise || exercise.transferTarget || exercise.id !== pendingClose.id || !['asignado','atencion'].includes(exercise.state) || $('#lab-result').value !== pendingClose.result) {
    dismissClose(); $('#lab-brigade').textContent = 'El caso o el resultado cambió. Revisa el cierre nuevamente.'; return;
  }
  const result = pendingClose.result;
  exercise.state = 'cerrado'; exercise.messages.push('Resultado simulado: '+result);
  stampCase('Cierre ficticio: '+result);
  const history=readClosedHistory();
  history.push({id:exercise.id,time:exercise.updatedAt,result});
  const archived=store.set('practiceClosedHistory',JSON.stringify(history.slice(-10)));
  persistCase(); dismissClose(); renderLab(); renderClosedHistory();
  $('#lab-brigade').textContent = archived ? 'Caso de práctica cerrado localmente. No se notificó a una brigada.' : 'Caso cerrado en práctica, pero no se pudo guardar el historial de cierres en este navegador.';
});
$('#draft-save').addEventListener('click',()=>{let action=$('#draft-action').value.trim();if(!action)return $('#draft-status').textContent='Escribe una instrucción de ejemplo.';draft={phase:$('#draft-phase').value,action,version:(draft?.version||0)+1,state:'borrador'};store.set('labDraft',JSON.stringify(draft));$('#draft-status').textContent='Borrador de prueba v'+draft.version+' guardado; no está aprobado ni publicado.'});$('#draft-review').addEventListener('click',()=>{if(!draft)return $('#draft-status').textContent='Primero crea un borrador de prueba.';draft.state='revision-simulada';store.set('labDraft',JSON.stringify(draft));$('#draft-status').textContent='Revisión registrada como ejercicio; no sustituye una revisión experta ni autoriza una alerta.'});$('#draft-publish').addEventListener('click',()=>{if(!draft||draft.state!=='revision-simulada')return $('#draft-status').textContent='Debes guardar y revisar el borrador de práctica.';draft.state='publicado-solo-en-practica';store.set('labDraft',JSON.stringify(draft));$('#draft-status').textContent='Versión '+draft.version+' mostrada solo en esta práctica: '+draft.action+' No se emitió un aviso real.'});
$('#support-form').addEventListener('submit',()=>setTimeout(renderLab,50));$('#confirm').addEventListener('click',()=>setTimeout(renderLab,50));$('#clear-request').addEventListener('click',()=>{exercise=null;store.remove('labCase');renderLab()});renderLab();
