function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

var totalProblemas = 4;

function mostrarProblema(indice) {

  var cards = document.querySelectorAll('.prob-card');
  cards.forEach(function(c) { c.classList.remove('active'); });

  var btns = document.querySelectorAll('.prob-btn');
  btns.forEach(function(b) { b.classList.remove('active'); });

  var dots = document.querySelectorAll('.pdot');
  dots.forEach(function(d) { d.classList.remove('active'); });

  problemaActual = indice;
  var cardTarget = document.getElementById('prob-' + indice);
  if (cardTarget) cardTarget.classList.add('active');
  if (btns[indice]) btns[indice].classList.add('active');
  if (dots[indice]) dots[indice].classList.add('active');
}

function navegarProblema(direccion) {
  var nuevo = problemaActual + direccion;
  if (nuevo < 0) nuevo = totalProblemas - 1;
  if (nuevo >= totalProblemas) nuevo = 0;
  mostrarProblema(nuevo);
}

function showTab(nombre) {
  var paneles = document.querySelectorAll('.sim-panel');
  paneles.forEach(function(p) { p.classList.remove('active'); });

  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function(t) { t.classList.remove('active'); });

  var panelActivo = document.getElementById('tab-' + nombre);
  if (panelActivo) {
    panelActivo.classList.add('active');
    panelActivo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var nombres = ['carburante','precios','transporte','presupuesto','escasez','poder'];
  var idx = nombres.indexOf(nombre);
  var tabsArr = Array.from(tabs);
  if (tabsArr[idx]) tabsArr[idx].classList.add('active');
}

function getNum(id) {
  var val = parseFloat(document.getElementById(id).value);
  return isNaN(val) ? null : val;
}

function mostrarError(idResultado, mensaje) {
  document.getElementById(idResultado).innerHTML =
    '<div class="alert alert-danger">⚠️ ' + mensaje + '</div>';
}

function crearTarjeta(valor, etiqueta) {
  return '<div class="rcard"><div class="rcard-val">' + valor + '</div><div class="rcard-label">' + etiqueta + '</div></div>';
}

function crearAlerta(tipo, mensaje) {
  return '<div class="alert alert-' + tipo + '">' + mensaje + '</div>';
}

function crearBarra(porcentaje) {
  var clase = 'safe';
  if (porcentaje < 50) clase = 'danger';
  else if (porcentaje < 75) clase = 'medium';
  var pct = Math.min(100, Math.max(0, porcentaje));
  return '<div class="progress-bar"><div class="progress-fill ' + clase + '" style="width:' + pct.toFixed(1) + '%"></div></div>';
}

function calcCarburante() {
  var reservaInicial   = getNum('c-reserva-inicial');
  var consumoDiario    = getNum('c-consumo-diario');
  var reabastecimiento = getNum('c-reabastecimiento');
  var nivelCritico     = getNum('c-nivel-critico');

  if (reservaInicial === null || consumoDiario === null || reabastecimiento === null || nivelCritico === null) {
    mostrarError('res-carburante', 'Por favor completa todos los campos.'); return;
  }
  if (consumoDiario === 0) {
    mostrarError('res-carburante', 'El consumo diario no puede ser cero.'); return;
  }

  var netoDiario = consumoDiario - reabastecimiento;
  var diasHastaCritico = null;
  var diasHastaAgotamiento = null;

  if (netoDiario > 0) {
    diasHastaCritico    = Math.ceil((reservaInicial - nivelCritico) / netoDiario);
    diasHastaAgotamiento = Math.ceil(reservaInicial / netoDiario);
  }

  var porcentajeReserva = (reservaInicial / (nivelCritico > 0 ? nivelCritico * 5 : reservaInicial)) * 100;

  var filas = '';
  var reserva = reservaInicial;
  var diasSimular = Math.min(15, diasHastaAgotamiento !== null ? diasHastaAgotamiento + 2 : 15);
  for (var dia = 1; dia <= diasSimular; dia++) {
    reserva = reservaInicial + (reabastecimiento * dia) - (consumoDiario * dia);
    if (reserva < 0) reserva = 0;
    var estado = '🟢 Normal';
    var estiloFila = '';
    if (reserva <= nivelCritico && reserva > 0) { estado = '🟡 Crítico'; estiloFila = 'background:rgba(255,200,0,0.08);'; }
    if (reserva <= 0) { estado = '🔴 Agotado'; estiloFila = 'background:rgba(232,64,64,0.1);'; }
    filas += '<tr style="' + estiloFila + '"><td>Día ' + dia + '</td><td>' + reserva.toFixed(0) + ' L</td><td>' + estado + '</td></tr>';
    if (reserva <= 0) break;
  }

  var alertaTipo = 'success';
  var alertaMsg  = ' La reserva se mantiene por encima del nivel crítico en los próximos días.';
  if (netoDiario <= 0) {
    alertaTipo = 'success'; alertaMsg = ' El reabastecimiento supera al consumo. La reserva es sostenible.';
  } else if (diasHastaCritico !== null && diasHastaCritico <= 3) {
    alertaTipo = 'danger'; alertaMsg = '¡Alerta! La reserva llegará al nivel crítico en aproximadamente ' + diasHastaCritico + ' día(s).';
  } else if (diasHastaCritico !== null) {
    alertaTipo = 'warning'; alertaMsg = ' La reserva llegará al nivel crítico en aproximadamente ' + diasHastaCritico + ' día(s).';
  }

  document.getElementById('res-carburante').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(reservaInicial.toFixed(0) + ' L', 'Reserva inicial') +
      crearTarjeta(netoDiario > 0 ? netoDiario.toFixed(0) + ' L' : '0 L', 'Pérdida neta/día') +
      crearTarjeta(diasHastaCritico !== null ? 'Día ' + diasHastaCritico : '—', 'Nivel crítico') +
      crearTarjeta(diasHastaAgotamiento !== null ? 'Día ' + diasHastaAgotamiento : 'Sostenible', 'Agotamiento') +
    '</div>' +
    crearAlerta(alertaTipo, alertaMsg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;color:var(--azul-cyan);font-family:var(--font-display)">Proyección día a día:</h4>' +
    '<table class="result-table"><thead><tr><th>Día</th><th>Reserva restante</th><th>Estado</th></tr></thead><tbody>' + filas + '</tbody></table>';
}


function agregarProducto() {
  var lista = document.getElementById('productos-lista');
  var fila = document.createElement('div');
  fila.className = 'producto-row';
  fila.innerHTML =
    '<input type="text" class="p-nombre" placeholder="Producto" />' +
    '<input type="number" class="p-precio-ant" placeholder="Precio anterior (Bs)" min="0" />' +
    '<input type="number" class="p-precio-act" placeholder="Precio actual (Bs)" min="0" />' +
    '<input type="number" class="p-cantidad" placeholder="Cantidad/mes" min="0" />';
  lista.appendChild(fila);
}

function calcPrecios() {
  var filas = document.querySelectorAll('.producto-row');
  var gastoAnteriorTotal = 0, gastoActualTotal = 0;
  var filasTabla = '';
  var hayDatos = false;

  filas.forEach(function(fila) {
    var nombre    = fila.querySelector('.p-nombre').value.trim();
    var precioAnt = parseFloat(fila.querySelector('.p-precio-ant').value);
    var precioAct = parseFloat(fila.querySelector('.p-precio-act').value);
    var cantidad  = parseFloat(fila.querySelector('.p-cantidad').value);

    if (nombre && !isNaN(precioAnt) && !isNaN(precioAct) && !isNaN(cantidad)) {
      hayDatos = true;
      var gastoAnt   = precioAnt * cantidad;
      var gastoAct   = precioAct * cantidad;
      var diferencia = gastoAct - gastoAnt;
      var porcAumento = precioAnt > 0 ? ((precioAct - precioAnt) / precioAnt) * 100 : 0;
      gastoAnteriorTotal += gastoAnt;
      gastoActualTotal   += gastoAct;
      var colorDif = porcAumento > 0 ? 'color:#ff8080;font-weight:bold' : 'color:#00e5a0;';
      filasTabla += '<tr><td>' + nombre + '</td><td>' + precioAnt.toFixed(2) + ' Bs</td><td>' + precioAct.toFixed(2) + ' Bs</td><td style="' + colorDif + '">+' + porcAumento.toFixed(1) + '%</td><td>' + cantidad.toFixed(0) + '</td><td>' + gastoAnt.toFixed(2) + ' Bs</td><td>' + gastoAct.toFixed(2) + ' Bs</td><td style="' + colorDif + '">+' + diferencia.toFixed(2) + ' Bs</td></tr>';
    }
  });

  if (!hayDatos) { mostrarError('res-precios', 'Ingresa al menos un producto con todos los datos.'); return; }

  var diferenciaTotalMensual = gastoActualTotal - gastoAnteriorTotal;
  var porcTotalAumento = gastoAnteriorTotal > 0 ? (diferenciaTotalMensual / gastoAnteriorTotal) * 100 : 0;

  var alertaTipo = 'warning', alertaMsg = '⚠️ El alza representa un impacto moderado en el presupuesto familiar.';
  if (porcTotalAumento >= 30) { alertaTipo = 'danger'; alertaMsg = '🚨 Impacto alto: los precios subieron un ' + porcTotalAumento.toFixed(1) + '% en promedio.'; }
  else if (porcTotalAumento < 10) { alertaTipo = 'success'; alertaMsg = '✅ Impacto bajo: el alza es manejable (' + porcTotalAumento.toFixed(1) + '% promedio).'; }

  document.getElementById('res-precios').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(gastoAnteriorTotal.toFixed(2) + ' Bs', 'Gasto anterior') +
      crearTarjeta(gastoActualTotal.toFixed(2) + ' Bs', 'Gasto actual') +
      crearTarjeta('+' + diferenciaTotalMensual.toFixed(2) + ' Bs', 'Diferencia mensual') +
      crearTarjeta('+' + porcTotalAumento.toFixed(1) + '%', 'Aumento total') +
    '</div>' +
    crearAlerta(alertaTipo, alertaMsg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;color:var(--azul-cyan);font-family:var(--font-display)">Detalle por producto:</h4>' +
    '<div style="overflow-x:auto"><table class="result-table"><thead><tr><th>Producto</th><th>P. anterior</th><th>P. actual</th><th>% alza</th><th>Cantidad</th><th>Gasto ant.</th><th>Gasto act.</th><th>Diferencia</th></tr></thead><tbody>' + filasTabla + '</tbody></table></div>';
}


function calcTransporte() {
  var distNormal = getNum('t-dist-normal');
  var distDesvio = getNum('t-dist-desvio');
  var costoPorKm = getNum('t-costo-km');
  var viajesSem  = getNum('t-viajes');

  if (distNormal === null || distDesvio === null || costoPorKm === null || viajesSem === null) {
    mostrarError('res-transporte', 'Por favor completa todos los campos.'); return;
  }
  if (distDesvio < distNormal) {
    mostrarError('res-transporte', 'La distancia con desvío no puede ser menor que la normal.'); return;
  }

  var costoNormalViaje = distNormal * costoPorKm;
  var costoDesvioViaje = distDesvio * costoPorKm;
  var costoAdicViaje   = costoDesvioViaje - costoNormalViaje;
  var costoNormalSem   = costoNormalViaje * viajesSem;
  var costoDesvioSem   = costoDesvioViaje * viajesSem;
  var costoAdicSem     = costoAdicViaje   * viajesSem;
  var costoNormalMes   = costoNormalSem * 4;
  var costoDesvioMes   = costoDesvioSem * 4;
  var costoAdicMes     = costoAdicSem   * 4;
  var porcAumento = costoNormalViaje > 0 ? (costoAdicViaje / costoNormalViaje) * 100 : 0;

  var alertaTipo = 'warning', alertaMsg = 'El desvío aumenta el costo de transporte un ' + porcAumento.toFixed(1) + '%.';
  if (porcAumento >= 50) { alertaTipo = 'danger'; alertaMsg = '🚨 El desvío más que duplica el trayecto. Costo adicional mensual: ' + costoAdicMes.toFixed(2) + ' Bs.'; }
  else if (porcAumento < 15) { alertaTipo = 'success'; alertaMsg = ' El impacto del desvío es bajo (' + porcAumento.toFixed(1) + '%).'; }

  document.getElementById('res-transporte').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(costoNormalViaje.toFixed(2) + ' Bs', 'Costo normal/viaje') +
      crearTarjeta(costoDesvioViaje.toFixed(2) + ' Bs', 'Costo desvío/viaje') +
      crearTarjeta(costoAdicSem.toFixed(2) + ' Bs', 'Extra semanal') +
      crearTarjeta(costoAdicMes.toFixed(2) + ' Bs', 'Extra mensual') +
    '</div>' +
    crearAlerta(alertaTipo, alertaMsg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;color:var(--azul-cyan);font-family:var(--font-display)">Comparativa de costos:</h4>' +
    '<table class="result-table"><thead><tr><th>Periodo</th><th>Ruta normal</th><th>Con desvío</th><th>Gasto adicional</th></tr></thead><tbody>' +
    '<tr><td>Por viaje</td><td>' + costoNormalViaje.toFixed(2) + ' Bs</td><td>' + costoDesvioViaje.toFixed(2) + ' Bs</td><td style="color:#ff8080;font-weight:bold">+' + costoAdicViaje.toFixed(2) + ' Bs</td></tr>' +
    '<tr><td>Por semana</td><td>' + costoNormalSem.toFixed(2) + ' Bs</td><td>' + costoDesvioSem.toFixed(2) + ' Bs</td><td style="color:#ff8080;font-weight:bold">+' + costoAdicSem.toFixed(2) + ' Bs</td></tr>' +
    '<tr><td>Por mes</td><td>' + costoNormalMes.toFixed(2) + ' Bs</td><td>' + costoDesvioMes.toFixed(2) + ' Bs</td><td style="color:#ff8080;font-weight:bold">+' + costoAdicMes.toFixed(2) + ' Bs</td></tr>' +
    '</tbody></table>';
}


function agregarCompra() {
  var lista = document.getElementById('compras-lista');
  var fila = document.createElement('div');
  fila.className = 'compra-row';
  fila.innerHTML =
    '<input type="text" class="comp-nombre" placeholder="Producto" />' +
    '<input type="number" class="comp-precio" placeholder="Precio (Bs)" min="0" />' +
    '<input type="number" class="comp-cantidad" placeholder="Cantidad" min="0" />';
  lista.appendChild(fila);
}

function calcPresupuesto() {
  var presupuesto = getNum('pres-total');
  if (presupuesto === null) { mostrarError('res-presupuesto', 'Ingresa el presupuesto familiar.'); return; }

  var filas = document.querySelectorAll('.compra-row');
  var totalCompra = 0, filasTabla = '', hayDatos = false;

  filas.forEach(function(fila) {
    var nombre   = fila.querySelector('.comp-nombre').value.trim();
    var precio   = parseFloat(fila.querySelector('.comp-precio').value);
    var cantidad = parseFloat(fila.querySelector('.comp-cantidad').value);
    if (nombre && !isNaN(precio) && !isNaN(cantidad)) {
      hayDatos = true;
      var subtotal = precio * cantidad;
      totalCompra += subtotal;
      filasTabla += '<tr><td>' + nombre + '</td><td>' + precio.toFixed(2) + ' Bs</td><td>' + cantidad.toFixed(0) + '</td><td>' + subtotal.toFixed(2) + ' Bs</td></tr>';
    }
  });

  if (!hayDatos) { mostrarError('res-presupuesto', 'Ingresa al menos un producto con todos sus datos.'); return; }

  var saldo    = presupuesto - totalCompra;
  var alcanza  = saldo >= 0;
  var porcentajeUsado = Math.min(100, (totalCompra / presupuesto) * 100);
  var nivelGasto = porcentajeUsado > 100 ? 'excedido' : porcentajeUsado > 80 ? 'alto' : porcentajeUsado > 50 ? 'medio' : 'bajo';
  var nivelTextos = { bajo: '🟢 Bajo', medio: '🟡 Medio', alto: '🟠 Alto', excedido: '🔴 Excedido' };

  var alertaTipo = alcanza ? 'success' : 'danger';
  var alertaMsg  = alcanza
    ? ' El presupuesto alcanza. Saldo restante: ' + saldo.toFixed(2) + ' Bs.'
    : ' El presupuesto NO alcanza. Faltan ' + Math.abs(saldo).toFixed(2) + ' Bs para cubrir la compra.';

  document.getElementById('res-presupuesto').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(presupuesto.toFixed(2) + ' Bs', 'Presupuesto') +
      crearTarjeta(totalCompra.toFixed(2) + ' Bs', 'Total compra') +
      crearTarjeta((alcanza ? '' : '-') + Math.abs(saldo).toFixed(2) + ' Bs', alcanza ? 'Saldo restante' : 'Monto faltante') +
      crearTarjeta(nivelTextos[nivelGasto], 'Nivel de gasto') +
    '</div>' +
    '<p style="font-size:0.8rem;color:var(--color-muted);margin:0.5rem 0">Uso del presupuesto: ' + porcentajeUsado.toFixed(1) + '%</p>' +
    crearBarra(porcentajeUsado) +
    crearAlerta(alertaTipo, alertaMsg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;color:var(--azul-cyan);font-family:var(--font-display)">Detalle de la compra:</h4>' +
    '<table class="result-table"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>' +
    filasTabla +
    '<tr style="font-weight:bold;background:rgba(10,42,74,0.5)"><td colspan="3">Total</td><td>' + totalCompra.toFixed(2) + ' Bs</td></tr>' +
    '</tbody></table>';
}

function calcEscasez() {
  var demandaNormal = getNum('e-demanda-normal');
  var aumentoPct    = getNum('e-aumento');
  var stock         = getNum('e-stock');
  var familias      = getNum('e-familias');

  if (demandaNormal === null || aumentoPct === null || stock === null || familias === null) {
    mostrarError('res-escasez', 'Por favor completa todos los campos.'); return;
  }

  var nuevaDemanda  = demandaNormal + demandaNormal * (aumentoPct / 100);
  var diferencia    = nuevaDemanda - demandaNormal;
  var stockRestante = stock - nuevaDemanda;
  var stockAlcanza  = stockRestante >= 0;
  var porcentajeStock = Math.min(100, (stock / nuevaDemanda) * 100);
  var unidadPorFamiliaNormal = familias > 0 ? (demandaNormal / familias).toFixed(2) : '—';
  var unidadPorFamiliaPanico = familias > 0 ? (nuevaDemanda / familias).toFixed(2) : '—';

  var alertaTipo = stockAlcanza ? 'success' : 'danger';
  var alertaMsg  = stockAlcanza
    ? ' El stock es suficiente. Sobrante: ' + stockRestante.toFixed(0) + ' unidades.'
    : ' ¡El stock NO alcanza! Déficit de ' + Math.abs(stockRestante).toFixed(0) + ' unidades.';

  document.getElementById('res-escasez').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(demandaNormal.toFixed(0), 'Demanda normal') +
      crearTarjeta(nuevaDemanda.toFixed(0), 'Nueva demanda') +
      crearTarjeta('+' + diferencia.toFixed(0), 'Aumento real') +
      crearTarjeta(stockAlcanza ? '+' + stockRestante.toFixed(0) : stockRestante.toFixed(0), stockAlcanza ? 'Stock sobrante' : 'Déficit de stock') +
    '</div>' +
    '<p style="font-size:0.8rem;color:var(--color-muted);margin:0.5rem 0">Stock cubre el ' + porcentajeStock.toFixed(1) + '% de la nueva demanda</p>' +
    crearBarra(porcentajeStock) +
    crearAlerta(alertaTipo, alertaMsg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;color:var(--azul-cyan);font-family:var(--font-display)">Comparativa de demanda:</h4>' +
    '<table class="result-table"><thead><tr><th>Indicador</th><th>Normal</th><th>Con rumor</th></tr></thead><tbody>' +
    '<tr><td>Demanda total</td><td>' + demandaNormal.toFixed(0) + ' unid.</td><td>' + nuevaDemanda.toFixed(0) + ' unid.</td></tr>' +
    '<tr><td>Unidades/familia</td><td>' + unidadPorFamiliaNormal + '</td><td>' + unidadPorFamiliaPanico + '</td></tr>' +
    '<tr><td>Stock disponible</td><td colspan="2">' + stock.toFixed(0) + ' unidades</td></tr>' +
    '<tr><td>Resultado</td><td colspan="2" style="' + (stockAlcanza ? 'color:#00e5a0' : 'color:#ff8080') + ';font-weight:bold">' + (stockAlcanza ? '✅ Suficiente' : '🚨 Insuficiente') + '</td></tr>' +
    '</tbody></table>';
}

function calcPoderAdq() {
  var ingreso  = getNum('pa-ingreso');
  var gastoAnt = getNum('pa-gasto-ant');
  var gastoAct = getNum('pa-gasto-act');

  if (ingreso === null || gastoAnt === null || gastoAct === null) {
    mostrarError('res-poder', 'Por favor completa todos los campos.'); return;
  }
  if (ingreso <= 0) { mostrarError('res-poder', 'El ingreso debe ser mayor a cero.'); return; }

  var aumentoGasto   = gastoAct - gastoAnt;
  var porcPerdida    = gastoAnt > 0 ? (aumentoGasto / gastoAnt) * 100 : 0;
  var saldoAnterior  = ingreso - gastoAnt;
  var saldoActual    = ingreso - gastoAct;
  var porcGastoAntes = (gastoAnt / ingreso) * 100;
  var porcGastoAhora = (gastoAct / ingreso) * 100;

  var nivelAfectacion = 'Baja', alertaTipo = 'success';
  if (porcPerdida >= 30) { nivelAfectacion = 'Muy alta'; alertaTipo = 'danger'; }
  else if (porcPerdida >= 20) { nivelAfectacion = 'Alta'; alertaTipo = 'danger'; }
  else if (porcPerdida >= 10) { nivelAfectacion = 'Moderada'; alertaTipo = 'warning'; }

  var alertaMsg = saldoActual < 0
    ? ' La familia gasta más de lo que ingresa. Déficit: ' + Math.abs(saldoActual).toFixed(2) + ' Bs.'
    : ' Pérdida de poder adquisitivo del ' + porcPerdida.toFixed(1) + '%. Nivel: ' + nivelAfectacion + '.';
  if (saldoActual >= 0 && porcPerdida < 10) {
    alertaMsg = ' El impacto es bajo (' + porcPerdida.toFixed(1) + '%). La familia aún puede ahorrar.';
  }

  document.getElementById('res-poder').innerHTML =
    '<div class="result-cards">' +
      crearTarjeta(ingreso.toFixed(2) + ' Bs', 'Ingreso mensual') +
      crearTarjeta('+' + aumentoGasto.toFixed(2) + ' Bs', 'Aumento del gasto') +
      crearTarjeta(porcPerdida.toFixed(1) + '%', 'Pérdida poder adq.') +
      crearTarjeta(nivelAfectacion, 'Nivel afectación') +
    '</div>' +
    crearAlerta(alertaTipo, alertaMsg) +
    '<h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;color:var(--azul-cyan);font-family:var(--font-display)">Comparativa antes y después:</h4>' +
    '<table class="result-table"><thead><tr><th>Indicador</th><th>Antes</th><th>Ahora</th></tr></thead><tbody>' +
    '<tr><td>Gasto mensual</td><td>' + gastoAnt.toFixed(2) + ' Bs</td><td>' + gastoAct.toFixed(2) + ' Bs</td></tr>' +
    '<tr><td>% del ingreso gastado</td><td>' + porcGastoAntes.toFixed(1) + '%</td><td>' + porcGastoAhora.toFixed(1) + '%</td></tr>' +
    '<tr><td>Saldo disponible</td><td>' + saldoAnterior.toFixed(2) + ' Bs</td><td style="' + (saldoActual < 0 ? 'color:#ff8080;font-weight:bold' : '') + '">' + saldoActual.toFixed(2) + ' Bs</td></tr>' +
    '</tbody></table>';
}

function clearForm(escenario) {
  if (escenario === 'carburante') {
    ['c-reserva-inicial','c-consumo-diario','c-reabastecimiento','c-nivel-critico'].forEach(function(id){ document.getElementById(id).value = ''; });
    document.getElementById('res-carburante').innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';
  }
  if (escenario === 'precios') {
    document.getElementById('productos-lista').innerHTML = '<div class="producto-row"><input type="text" class="p-nombre" placeholder="Producto (ej: Arroz)" /><input type="number" class="p-precio-ant" placeholder="Precio anterior (Bs)" min="0" /><input type="number" class="p-precio-act" placeholder="Precio actual (Bs)" min="0" /><input type="number" class="p-cantidad" placeholder="Cantidad/mes" min="0" /></div>';
    document.getElementById('res-precios').innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';
  }
  if (escenario === 'transporte') {
    ['t-dist-normal','t-dist-desvio','t-costo-km','t-viajes'].forEach(function(id){ document.getElementById(id).value = ''; });
    document.getElementById('res-transporte').innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';
  }
  if (escenario === 'presupuesto') {
    document.getElementById('pres-total').value = '';
    document.getElementById('compras-lista').innerHTML = '<div class="compra-row"><input type="text" class="comp-nombre" placeholder="Producto" /><input type="number" class="comp-precio" placeholder="Precio (Bs)" min="0" /><input type="number" class="comp-cantidad" placeholder="Cantidad" min="0" /></div>';
    document.getElementById('res-presupuesto').innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';
  }
  if (escenario === 'escasez') {
    ['e-demanda-normal','e-aumento','e-stock','e-familias'].forEach(function(id){ document.getElementById(id).value = ''; });
    document.getElementById('res-escasez').innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';
  }
  if (escenario === 'poder') {
    ['pa-ingreso','pa-gasto-ant','pa-gasto-act'].forEach(function(id){ document.getElementById(id).value = ''; });
    document.getElementById('res-poder').innerHTML = '<p class="result-placeholder">Los resultados aparecerán aquí después de calcular.</p>';
  }
}

function cargarCaso(numeroCaso) {
  if (numeroCaso === 1) {
    showTab('carburante');
    document.getElementById('c-reserva-inicial').value  = 10000;
    document.getElementById('c-consumo-diario').value   = 1200;
    document.getElementById('c-reabastecimiento').value = 300;
    document.getElementById('c-nivel-critico').value    = 2000;
    calcCarburante();
    document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
  }
  if (numeroCaso === 2) {
    showTab('precios');
    clearForm('precios');
    setTimeout(function() {
      var lista = document.getElementById('productos-lista');
      lista.innerHTML = '';
      var productos = [
        { nombre: 'Arroz', ant: 8,  act: 11, cant: 10 },
        { nombre: 'Papa',  ant: 7,  act: 10, cant: 8  },
        { nombre: 'Aceite',ant: 12, act: 18, cant: 4  }
      ];
      productos.forEach(function(p) {
        var fila = document.createElement('div');
        fila.className = 'producto-row';
        fila.innerHTML = '<input type="text" class="p-nombre" value="' + p.nombre + '" /><input type="number" class="p-precio-ant" value="' + p.ant + '" min="0" /><input type="number" class="p-precio-act" value="' + p.act + '" min="0" /><input type="number" class="p-cantidad" value="' + p.cant + '" min="0" />';
        lista.appendChild(fila);
      });
      calcPrecios();
    }, 50);
    document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
  }
  if (numeroCaso === 3) {
    showTab('transporte');
    document.getElementById('t-dist-normal').value = 10;
    document.getElementById('t-dist-desvio').value = 16;
    document.getElementById('t-costo-km').value    = 2;
    document.getElementById('t-viajes').value      = 5;
    calcTransporte();
    document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
  }
  if (numeroCaso === 4) {
    showTab('presupuesto');
    document.getElementById('pres-total').value = 500;
    setTimeout(function() {
      var lista = document.getElementById('compras-lista');
      lista.innerHTML = '';
      var fila = document.createElement('div');
      fila.className = 'compra-row';
      fila.innerHTML = '<input type="text" class="comp-nombre" value="Compra total del mes" /><input type="number" class="comp-precio" value="580" min="0" /><input type="number" class="comp-cantidad" value="1" min="0" />';
      lista.appendChild(fila);
      calcPresupuesto();
    }, 50);
    document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
  }
  if (numeroCaso === 5) {
    showTab('escasez');
    document.getElementById('e-demanda-normal').value = 100;
    document.getElementById('e-aumento').value        = 40;
    document.getElementById('e-stock').value          = 120;
    document.getElementById('e-familias').value       = 50;
    calcEscasez();
    document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', function() {

  var secciones = document.querySelectorAll('section[id], main[id]');
  var navLinks  = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function() {
    var actual = '';
    secciones.forEach(function(sec) {
      if (window.scrollY >= sec.offsetTop - 80) { actual = sec.getAttribute('id'); }
    });
    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href === '#' + actual) {
        link.style.color = 'var(--azul-cyan)';
      } else {
        link.style.color = '';
      }
    });
  });

 
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });
});
