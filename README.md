# SimuCrisis Bolivia

Proyecto final de Programación Web I — Lucy Cosme Ticona

---

## Que es

Pagina web para simular situaciones economicas del contexto boliviano: escasez de carburante, alza de precios, bloqueos de ruta, presupuesto familiar y poder adquisitivo. Se ingresan datos y el sistema calcula los resultados usando formulas matematicas basicas.

---

## Links

- Pagina: https://lucycosme.github.io/ENFRENTANDO-LA-CRISIS/
- Repositorio: https://github.com/LucyCosme/ENFRENTANDO-LA-CRISIS

---

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Google Fonts (Orbitron, Exo 2)

Sin frameworks ni librerias externas.

---

## Simuladores

**1. Carburante**
Calcula cuantos dias dura la reserva segun el consumo y reabastecimiento diario.
```
Pérdida neta/día = Consumo diario − Reabastecimiento diario
Días hasta nivel crítico = (Reserva inicial − Nivel crítico) / Pérdida neta
```

**2. Precios de Alimentos**
Compara el gasto antes y despues del alza en productos basicos.
```
Diferencia por producto = (Precio actual − Precio anterior) × Cantidad
Aumento total (%) = (Σ Diferencias / Gasto anterior total) × 100
```

**3. Transporte**
Calcula el gasto extra por bloqueos o desvios en la ruta.
```
Costo extra/viaje = (Dist. desvío − Dist. normal) × Costo por km
Costo extra mensual = Costo extra/viaje × Viajes/semana × 4
```

**4. Presupuesto Familiar**
Verifica si el presupuesto alcanza para la lista de compras.
```
Total compra = Σ (Precio × Cantidad)
Saldo = Presupuesto − Total compra
```

**5. Rumor de Escasez**
Simula como las compras por panico pueden agotar el stock.
```
Nueva demanda = Demanda normal × (1 + % aumento / 100)
Déficit = Nueva demanda − Stock disponible
```

**6. Poder Adquisitivo**
Mide cuanto poder de compra se pierde cuando suben los precios pero el ingreso no cambia.
```
Pérdida (%) = (Gasto actual − Gasto anterior) / Gasto anterior × 100
Saldo = Ingreso − Gasto actual
```

---

## Casos de estudio

| # | Caso | Resultado |
|---|---|---|
| 01 | Reserva de Carburante | Nivel crítico en el día 8 |
| 02 | Alza de Precios (Arroz, Papa, Aceite) | Aumento de 102 Bs |
| 03 | Transporte con Desvío (10 km a 16 km) | 60 Bs extra por semana |
| 04 | Presupuesto (500 Bs vs 580 Bs) | Faltan 80 Bs |
| 05 | Rumor de Escasez (+40%) | Demanda 140 unid., stock insuficiente |

---

## Estructura

```
ENFRENTANDO-LA-CRISIS/
├── index.html
├── css/
│   └── estilos.css
├── js/
│   └── script.js
└── img/
```

---

## programadora

Lucy Cosme Ticona — Programación Web I
