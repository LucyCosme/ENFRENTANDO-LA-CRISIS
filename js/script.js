/* SimuCrisis Bolivia — Script Principal */

/* --- NAVEGACIÓN --- */
function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

function showTab(nombre) {
  document.querySelectorAll('.sim-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + nombre).classList.add('active');
  const idx = ['carburante','precios','transporte','presupuesto','escasez','poder'].indexOf(nombre);
  document.querySelectorAll('.tab')[idx].classList.add('active');
}

/* --- UTILIDADES --- */
function getNum(id) {
  const val = parseFloat(document.getElementById(id).value);
  return isNaN(val) ? null : val;
}

function mostrarError(id, msg) {
  document.getElementById(id).innerHTML = '<div class="alert alert-danger">⚠️ ' + msg + '</div>';
}

function crearTarjeta(val, label) {
  return '<div class="rcard"><div class="rcard-val">' + val + '</div><div class="rcard-label">' + label + '</div></div>';
}

function crearAlerta(tipo, msg) {
  return '<div class="alert alert-' + tipo + '">' + msg + '</div>';
}

function crearBarra(pct) {
  let clase = pct >= 75 ? 'safe' : pct >= 50 ? 'medium' : 'danger';
  return '<div class="progress-bar"><div class="progress-fill ' + clase + '" style="width:' + Math.min(100, pct).toFixed(1) + '%"></div></div>';
}

/* --- ESCENARIO A: CARBURANTE --- */
function calcCarburante() {
  const ri = getNum('c-reserva-inicial');
  const cd = getNum('c-consumo-diario');
  const re = getNum('c-reabastecimiento');
  const nc = getNum('c-nivel-critico');

  if (ri === null || cd === null || re === null || nc === null) return mostrarError('res-carburante', 'Completa todos los campos.');
  if (cd === 0) return mostrarError('res-carburante', 'El consumo diario no puede ser cero.');

  const neto = cd - re;
  const diasCritico = neto > 0 ? Math.ceil((ri - nc) / neto) : null;
  const diasAgota   = neto > 0 ? Math.ceil(ri / neto) : null;

  let filas = '';
  const simDias = Math.min(15, diasAgota !== null ? diasAgota + 2 : 15);
  for (let d = 1; d <= simDias; d++) {
    let r = ri + (re * d) - (cd * d);
    if (r < 0) r = 0;
    let estado = '🟢 Normal', estilo = '';
    if (r <= nc && r > 0) { estado = '🟡 Crítico'; estilo = 'background:#fff8e1;'; }
    if (r <= 0)            { estado = '🔴 Agotado'; estilo = 'background:#fde8e8;'; }
    filas += '<tr style="' + estilo + '"><td>Día ' + d + '</td><td>' + r.toFixed(0) + ' L</td><td>' + estado + '</td></tr>';
    if (r <= 0) break;
  }

  let tipo = 'success', msg = '✅ El reabastecimiento cubre el consumo. La reserva es sostenible.';
  if (neto > 0 && diasCritico !== null && diasCritico <= 3) { tipo = 'danger'; msg = '🚨 ¡Alerta! Nivel crítico en ' + diasCritico + ' día(s).'; }
  else if (neto > 0 && diasCritico !== null)               { tipo = 'warning'; msg = '⚠️ Nivel crítico en aproximadamente ' + diasCritico + ' día(s).'; }

  document.getElementById('res-carburante').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(ri.toFixed(0) + ' L', 'Reserva inicial') +
      crearTarjeta(neto > 0 ? neto.toFixed(0) + ' L' : '0 L', 'Pérdida neta/día') +
      crearTarjeta(diasCritico !== null ? 'Día ' + diasCritico : '—', 'Nivel crítico') +
      crearTarjeta(diasAgota !== null ? 'Día ' + diasAgota : 'Sostenible', 'Agotamiento') +
    '</div>' +
    crearAlerta(tipo, msg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--color-primary)">Proyección día a día:</h4>' +
    '<table class="result-table"><thead><tr><th>Día</th><th>Reserva restante</th><th>Estado</th></tr></thead><tbody>' + filas + '</tbody></table>';
}

/* --- ESCENARIO B: PRECIOS --- */
function agregarProducto() {
  const div = document.createElement('div');
  div.className = 'producto-row';
  div.innerHTML =
    '<input type="text"   class="p-nombre"     placeholder="Producto" />' +
    '<input type="number" class="p-precio-ant" placeholder="Precio anterior (Bs)" min="0" />' +
    '<input type="number" class="p-precio-act" placeholder="Precio actual (Bs)"   min="0" />' +
    '<input type="number" class="p-cantidad"   placeholder="Cantidad/mes"         min="0" />';
  document.getElementById('productos-lista').appendChild(div);
}

function calcPrecios() {
  let gastoAnt = 0, gastoAct = 0, filas = '', hayDatos = false;

  document.querySelectorAll('.producto-row').forEach(function(fila) {
    const nombre = fila.querySelector('.p-nombre').value.trim();
    const pAnt   = parseFloat(fila.querySelector('.p-precio-ant').value);
    const pAct   = parseFloat(fila.querySelector('.p-precio-act').value);
    const cant   = parseFloat(fila.querySelector('.p-cantidad').value);
    if (!nombre || isNaN(pAnt) || isNaN(pAct) || isNaN(cant)) return;
    hayDatos = true;
    const gA = pAnt * cant, gB = pAct * cant, dif = gB - gA;
    const porc = pAnt > 0 ? ((pAct - pAnt) / pAnt) * 100 : 0;
    gastoAnt += gA; gastoAct += gB;
    const color = porc > 0 ? 'color:#a32020;font-weight:bold' : 'color:#1a6e3c;';
    filas += '<tr><td>' + nombre + '</td><td>' + pAnt.toFixed(2) + ' Bs</td><td>' + pAct.toFixed(2) + ' Bs</td>' +
      '<td style="' + color + '">+' + porc.toFixed(1) + '%</td><td>' + cant.toFixed(0) + '</td>' +
      '<td>' + gA.toFixed(2) + ' Bs</td><td>' + gB.toFixed(2) + ' Bs</td>' +
      '<td style="' + color + '">+' + dif.toFixed(2) + ' Bs</td></tr>';
  });

  if (!hayDatos) return mostrarError('res-precios', 'Ingresa al menos un producto completo.');

  const difTotal = gastoAct - gastoAnt;
  const porcTotal = gastoAnt > 0 ? (difTotal / gastoAnt) * 100 : 0;
  let tipo = 'warning', msg = '⚠️ Impacto moderado: +' + porcTotal.toFixed(1) + '% en el gasto.';
  if (porcTotal >= 30) { tipo = 'danger';  msg = '🚨 Impacto alto: +' + porcTotal.toFixed(1) + '% en promedio.'; }
  if (porcTotal <  10) { tipo = 'success'; msg = '✅ Impacto bajo: +' + porcTotal.toFixed(1) + '% en promedio.'; }

  document.getElementById('res-precios').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(gastoAnt.toFixed(2) + ' Bs', 'Gasto anterior') +
      crearTarjeta(gastoAct.toFixed(2) + ' Bs', 'Gasto actual') +
      crearTarjeta('+' + difTotal.toFixed(2) + ' Bs', 'Diferencia mensual') +
      crearTarjeta('+' + porcTotal.toFixed(1) + '%', 'Aumento total') +
    '</div>' + crearAlerta(tipo, msg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--color-primary)">Detalle por producto:</h4>' +
    '<div style="overflow-x:auto"><table class="result-table"><thead><tr><th>Producto</th><th>P. anterior</th><th>P. actual</th><th>% alza</th><th>Cant.</th><th>Gasto ant.</th><th>Gasto act.</th><th>Diferencia</th></tr></thead><tbody>' + filas + '</tbody></table></div>';
}

/* --- ESCENARIO C: TRANSPORTE --- */
function calcTransporte() {
  const dn = getNum('t-dist-normal');
  const dd = getNum('t-dist-desvio');
  const ck = getNum('t-costo-km');
  const vs = getNum('t-viajes');

  if (dn === null || dd === null || ck === null || vs === null) return mostrarError('res-transporte', 'Completa todos los campos.');
  if (dd < dn) return mostrarError('res-transporte', 'La distancia con desvío no puede ser menor que la normal.');

  const cNV = dn * ck, cDV = dd * ck, cAV = cDV - cNV;
  const cNS = cNV * vs, cDS = cDV * vs, cAS = cAV * vs;
  const cNM = cNS * 4,  cDM = cDS * 4,  cAM = cAS * 4;
  const porc = dn > 0 ? (cAV / cNV) * 100 : 0;

  let tipo = 'warning', msg = '⚠️ El desvío aumenta el costo un ' + porc.toFixed(1) + '%.';
  if (porc >= 50) { tipo = 'danger';  msg = '🚨 El desvío incrementa el costo en más del 50%. Gasto extra mensual: ' + cAM.toFixed(2) + ' Bs.'; }
  if (porc <  15) { tipo = 'success'; msg = '✅ Impacto bajo del desvío (' + porc.toFixed(1) + '%).'; }

  document.getElementById('res-transporte').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(cNV.toFixed(2) + ' Bs', 'Costo normal/viaje') +
      crearTarjeta(cDV.toFixed(2) + ' Bs', 'Costo desvío/viaje') +
      crearTarjeta(cAS.toFixed(2) + ' Bs', 'Extra semanal') +
      crearTarjeta(cAM.toFixed(2) + ' Bs', 'Extra mensual') +
    '</div>' + crearAlerta(tipo, msg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--color-primary)">Comparativa de costos:</h4>' +
    '<table class="result-table"><thead><tr><th>Periodo</th><th>Ruta normal</th><th>Con desvío</th><th>Gasto adicional</th></tr></thead><tbody>' +
    '<tr><td>Por viaje</td><td>' + cNV.toFixed(2) + ' Bs</td><td>' + cDV.toFixed(2) + ' Bs</td><td style="color:#a32020;font-weight:bold">+' + cAV.toFixed(2) + ' Bs</td></tr>' +
    '<tr><td>Por semana</td><td>' + cNS.toFixed(2) + ' Bs</td><td>' + cDS.toFixed(2) + ' Bs</td><td style="color:#a32020;font-weight:bold">+' + cAS.toFixed(2) + ' Bs</td></tr>' +
    '<tr><td>Por mes</td><td>'    + cNM.toFixed(2) + ' Bs</td><td>' + cDM.toFixed(2) + ' Bs</td><td style="color:#a32020;font-weight:bold">+' + cAM.toFixed(2) + ' Bs</td></tr>' +
    '</tbody></table>';
}

/* --- ESCENARIO D: PRESUPUESTO --- */
function agregarCompra() {
  const div = document.createElement('div');
  div.className = 'compra-row';
  div.innerHTML =
    '<input type="text"   class="comp-nombre"   placeholder="Producto" />' +
    '<input type="number" class="comp-precio"   placeholder="Precio (Bs)" min="0" />' +
    '<input type="number" class="comp-cantidad" placeholder="Cantidad"    min="0" />';
  document.getElementById('compras-lista').appendChild(div);
}

function calcPresupuesto() {
  const pres = getNum('pres-total');
  if (pres === null) return mostrarError('res-presupuesto', 'Ingresa el presupuesto familiar.');

  let total = 0, filas = '', hayDatos = false;
  document.querySelectorAll('.compra-row').forEach(function(fila) {
    const nombre = fila.querySelector('.comp-nombre').value.trim();
    const precio = parseFloat(fila.querySelector('.comp-precio').value);
    const cant   = parseFloat(fila.querySelector('.comp-cantidad').value);
    if (!nombre || isNaN(precio) || isNaN(cant)) return;
    hayDatos = true;
    const sub = precio * cant;
    total += sub;
    filas += '<tr><td>' + nombre + '</td><td>' + precio.toFixed(2) + ' Bs</td><td>' + cant.toFixed(0) + '</td><td>' + sub.toFixed(2) + ' Bs</td></tr>';
  });

  if (!hayDatos) return mostrarError('res-presupuesto', 'Ingresa al menos un producto completo.');

  const saldo = pres - total;
  const pctUso = Math.min(100, (total / pres) * 100);
  const nivel = pctUso > 100 ? 'Excedido' : pctUso > 80 ? 'Alto' : pctUso > 50 ? 'Medio' : 'Bajo';
  const tipo = saldo >= 0 ? 'success' : 'danger';
  const msg = saldo >= 0
    ? '✅ Presupuesto alcanza. Saldo: ' + saldo.toFixed(2) + ' Bs.'
    : '🚨 Presupuesto insuficiente. Faltan: ' + Math.abs(saldo).toFixed(2) + ' Bs.';

  document.getElementById('res-presupuesto').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(pres.toFixed(2) + ' Bs', 'Presupuesto') +
      crearTarjeta(total.toFixed(2) + ' Bs', 'Total compra') +
      crearTarjeta((saldo >= 0 ? '' : '-') + Math.abs(saldo).toFixed(2) + ' Bs', saldo >= 0 ? 'Saldo restante' : 'Monto faltante') +
      crearTarjeta(nivel, 'Nivel de gasto') +
    '</div>' +
    '<p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.5rem 0">Uso del presupuesto: ' + pctUso.toFixed(1) + '%</p>' +
    crearBarra(pctUso) + crearAlerta(tipo, msg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--color-primary)">Detalle de la compra:</h4>' +
    '<table class="result-table"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>' + filas +
    '<tr style="font-weight:bold;background:var(--color-bg)"><td colspan="3">Total</td><td>' + total.toFixed(2) + ' Bs</td></tr>' +
    '</tbody></table>';
}

/* --- ESCENARIO E: ESCASEZ --- */
function calcEscasez() {
  const dn = getNum('e-demanda-normal');
  const ap = getNum('e-aumento');
  const st = getNum('e-stock');
  const fa = getNum('e-familias');

  if (dn === null || ap === null || st === null || fa === null) return mostrarError('res-escasez', 'Completa todos los campos.');

  const nDem  = dn + dn * (ap / 100);
  const dif   = nDem - dn;
  const sobra = st - nDem;
  const pctSt = Math.min(100, (st / nDem) * 100);
  const alcanza = sobra >= 0;

  const uNormal = fa > 0 ? (dn / fa).toFixed(2) : '—';
  const uPanico = fa > 0 ? (nDem / fa).toFixed(2) : '—';

  const tipo = alcanza ? 'success' : 'danger';
  const msg = alcanza
    ? '✅ Stock suficiente. Sobrante: ' + sobra.toFixed(0) + ' unidades.'
    : '🚨 Stock insuficiente. Déficit: ' + Math.abs(sobra).toFixed(0) + ' unidades.';

  document.getElementById('res-escasez').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(dn.toFixed(0), 'Demanda normal') +
      crearTarjeta(nDem.toFixed(0), 'Nueva demanda') +
      crearTarjeta('+' + dif.toFixed(0), 'Aumento real') +
      crearTarjeta(alcanza ? '+' + sobra.toFixed(0) : sobra.toFixed(0), alcanza ? 'Stock sobrante' : 'Déficit') +
    '</div>' +
    '<p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.5rem 0">Stock cubre el ' + pctSt.toFixed(1) + '% de la nueva demanda</p>' +
    crearBarra(pctSt) + crearAlerta(tipo, msg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--color-primary)">Comparativa:</h4>' +
    '<table class="result-table"><thead><tr><th>Indicador</th><th>Normal</th><th>Con rumor</th></tr></thead><tbody>' +
    '<tr><td>Demanda total</td><td>' + dn.toFixed(0) + ' uds</td><td>' + nDem.toFixed(0) + ' uds</td></tr>' +
    '<tr><td>Uds por familia</td><td>' + uNormal + '</td><td>' + uPanico + '</td></tr>' +
    '<tr><td>Stock disponible</td><td colspan="2">' + st.toFixed(0) + ' unidades</td></tr>' +
    '<tr><td>Resultado</td><td colspan="2" style="' + (alcanza ? 'color:#1a6e3c' : 'color:#a32020') + ';font-weight:bold">' + (alcanza ? '✅ Suficiente' : '🚨 Insuficiente') + '</td></tr>' +
    '</tbody></table>';
}

/* --- ESCENARIO F: PODER ADQUISITIVO --- */
function calcPoderAdq() {
  const ing = getNum('pa-ingreso');
  const gAn = getNum('pa-gasto-ant');
  const gAc = getNum('pa-gasto-act');

  if (ing === null || gAn === null || gAc === null) return mostrarError('res-poder', 'Completa todos los campos.');
  if (ing <= 0) return mostrarError('res-poder', 'El ingreso debe ser mayor a cero.');

  const aum  = gAc - gAn;
  const porc = gAn > 0 ? (aum / gAn) * 100 : 0;
  const sAnt = ing - gAn;
  const sAct = ing - gAc;
  const pGAn = (gAn / ing) * 100;
  const pGAc = (gAc / ing) * 100;

  let nivel = 'Baja', tipo = 'success';
  if (porc >= 30)      { nivel = 'Muy alta'; tipo = 'danger'; }
  else if (porc >= 20) { nivel = 'Alta';     tipo = 'danger'; }
  else if (porc >= 10) { nivel = 'Moderada'; tipo = 'warning'; }

  const msg = sAct < 0
    ? '🚨 La familia gasta más de lo que ingresa. Déficit mensual: ' + Math.abs(sAct).toFixed(2) + ' Bs.'
    : porc < 10
      ? '✅ Impacto bajo (' + porc.toFixed(1) + '%). La familia aún puede ahorrar.'
      : '⚠️ Pérdida del ' + porc.toFixed(1) + '% del poder adquisitivo. Nivel: ' + nivel + '.';

  document.getElementById('res-poder').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(ing.toFixed(2) + ' Bs', 'Ingreso mensual') +
      crearTarjeta('+' + aum.toFixed(2) + ' Bs', 'Aumento del gasto') +
      crearTarjeta(porc.toFixed(1) + '%', 'Pérdida poder adq.') +
      crearTarjeta(nivel, 'Nivel afectación') +
    '</div>' + crearAlerta(tipo, msg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--color-primary)">Comparativa antes y después:</h4>' +
    '<table class="result-table"><thead><tr><th>Indicador</th><th>Antes</th><th>Ahora</th></tr></thead><tbody>' +
    '<tr><td>Gasto mensual</td><td>' + gAn.toFixed(2) + ' Bs</td><td>' + gAc.toFixed(2) + ' Bs</td></tr>' +
    '<tr><td>% del ingreso gastado</td><td>' + pGAn.toFixed(1) + '%</td><td>' + pGAc.toFixed(1) + '%</td></tr>' +
    '<tr><td>Saldo disponible</td><td>' + sAnt.toFixed(2) + ' Bs</td><td style="' + (sAct < 0 ? 'color:#a32020;font-weight:bold' : '') + '">' + sAct.toFixed(2) + ' Bs</td></tr>' +
    '</tbody></table>';
}

/* --- LIMPIAR FORMULARIOS --- */
function clearForm(esc) {
  const placeholders = { carburante: 'res-carburante', precios: 'res-precios', transporte: 'res-transporte', presupuesto: 'res-presupuesto', escasez: 'res-escasez', poder: 'res-poder' };
  document.getElementById(placeholders[esc]).innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';

  if (esc === 'carburante') { ['c-reserva-inicial','c-consumo-diario','c-reabastecimiento','c-nivel-critico'].forEach(id => document.getElementById(id).value = ''); }
  if (esc === 'precios')    { document.getElementById('productos-lista').innerHTML = '<div class="producto-row"><input type="text" class="p-nombre" placeholder="Producto (ej: Arroz)" /><input type="number" class="p-precio-ant" placeholder="Precio anterior (Bs)" min="0" /><input type="number" class="p-precio-act" placeholder="Precio actual (Bs)" min="0" /><input type="number" class="p-cantidad" placeholder="Cantidad/mes" min="0" /></div>'; }
  if (esc === 'transporte') { ['t-dist-normal','t-dist-desvio','t-costo-km','t-viajes'].forEach(id => document.getElementById(id).value = ''); }
  if (esc === 'presupuesto'){ document.getElementById('pres-total').value = ''; document.getElementById('compras-lista').innerHTML = '<div class="compra-row"><input type="text" class="comp-nombre" placeholder="Producto" /><input type="number" class="comp-precio" placeholder="Precio (Bs)" min="0" /><input type="number" class="comp-cantidad" placeholder="Cantidad" min="0" /></div>'; }
  if (esc === 'escasez')    { ['e-demanda-normal','e-aumento','e-stock','e-familias'].forEach(id => document.getElementById(id).value = ''); }
  if (esc === 'poder')      { ['pa-ingreso','pa-gasto-ant','pa-gasto-act'].forEach(id => document.getElementById(id).value = ''); }
}

/* --- CARGAR CASOS DE ESTUDIO --- */
function cargarCaso(n) {
  if (n === 1) {
    showTab('carburante');
    document.getElementById('c-reserva-inicial').value  = 10000;
    document.getElementById('c-consumo-diario').value   = 1200;
    document.getElementById('c-reabastecimiento').value = 300;
    document.getElementById('c-nivel-critico').value    = 2000;
    calcCarburante();
  }
  if (n === 2) {
    showTab('precios');
    document.getElementById('productos-lista').innerHTML = '';
    [{ n:'Arroz',a:8,b:11,c:10 },{ n:'Papa',a:7,b:10,c:8 },{ n:'Aceite',a:12,b:18,c:4 }].forEach(function(p) {
      const div = document.createElement('div'); div.className = 'producto-row';
      div.innerHTML = '<input type="text" class="p-nombre" value="'+p.n+'" /><input type="number" class="p-precio-ant" value="'+p.a+'" min="0" /><input type="number" class="p-precio-act" value="'+p.b+'" min="0" /><input type="number" class="p-cantidad" value="'+p.c+'" min="0" />';
      document.getElementById('productos-lista').appendChild(div);
    });
    calcPrecios();
  }
  if (n === 3) {
    showTab('transporte');
    document.getElementById('t-dist-normal').value = 10;
    document.getElementById('t-dist-desvio').value = 16;
    document.getElementById('t-costo-km').value    = 2;
    document.getElementById('t-viajes').value      = 5;
    calcTransporte();
  }
  if (n === 4) {
    showTab('presupuesto');
    document.getElementById('pres-total').value = 500;
    document.getElementById('compras-lista').innerHTML = '';
    const div = document.createElement('div'); div.className = 'compra-row';
    div.innerHTML = '<input type="text" class="comp-nombre" value="Compra del mes" /><input type="number" class="comp-precio" value="580" min="0" /><input type="number" class="comp-cantidad" value="1" min="0" />';
    document.getElementById('compras-lista').appendChild(div);
    calcPresupuesto();
  }
  if (n === 5) {
    showTab('escasez');
    document.getElementById('e-demanda-normal').value = 100;
    document.getElementById('e-aumento').value        = 40;
    document.getElementById('e-stock').value          = 120;
    document.getElementById('e-familias').value       = 50;
    calcEscasez();
  }
  document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
}

/* --- INICIALIZACIÓN --- */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });
});