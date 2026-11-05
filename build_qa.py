from pathlib import Path
import json, hashlib
p=Path(__file__).parent
r=json.loads((p/'tests/simulation-results.json').read_text())
f=json.loads((p/'tests/functional-results.json').read_text())
c=json.loads((p/'tests/mobile-chromium-results.json').read_text())
w=json.loads((p/'tests/mobile-webkit-results.json').read_text())
idle=json.loads((p/'tests/idle-control-results.json').read_text())
assert len(r['results'])>=500
assert all(x['status']=='PASS' for x in f+c['results']+w['results'])
assert not c['errors'] and not w['errors']
names={'farm':'Farmeo intensivo','defense':'Defensa','gank':'Gankeos frecuentes','counter':'Contrajungla','objectives':'Objetivos neutrales','mixed':'Mixta','random':'Aleatoria válida'}
s=r['summary']; games=r['results']
rows=[]
for key,v in r['strategies'].items():
 rows.append(f"| {names[key]} | {v['games']} | {v['wins']} | {v['winRate']:.2f}% | {v['level']:.2f} | {v['camps']:.2f} | {v['deaths']:.2f} | {v['ganks']:.2f} | {v['territory']:.2f} |")
comebacks=sum(x.get('minTerritory',3)<3 and x['win'] for x in games)
early=sum(x.get('fullControlAt') is not None and x['fullControlAt']<60 for x in games)
controls=[x['fullControlAt'] for x in games if x.get('fullControlAt') is not None]
full=sum(x['territory'] in [0,6] for x in games)
text=f'''# QA real — Frontera Viva 0.6

Fecha: 5 de noviembre de 2026. Versión probada: `index.html` autocontenido de esta entrega.

## Resultado

- **{len(f)} pruebas del motor aprobadas.**
- **{len(c['results'])} comprobaciones de interfaz aprobadas en Chromium headless shell 145.0.7632.6.**
- **{len(w['results'])} comprobaciones de interfaz aprobadas en WebKit 26.5 / Playwright webkit-2336.**
- **Cero errores JavaScript de página** registrados en las dos tandas de interfaz.
- **{len(games)} partidas simuladas completas**, siete estrategias, 72 semillas base por estrategia y paso fijo de 1/30 s. Se añadieron {len(idle)} controles sin órdenes del jugador.
- Se abrió y ejecutó el archivo local sin servidor y sin dependencias remotas. Se inspeccionaron visualmente portada vertical, portada horizontal, mapa, pausa y resultados.
- Los scripts se validaron con `node --check`; la página ejecutó su JavaScript en ambos motores.

Los JSON completos están en `tests/`. Las capturas usadas para revisión interna no forman parte del entregable.

## Cobertura funcional

| Requisito | Evidencia |
|---|---|
| Empezar y temporizador | Tap real en botón HTML y avance del reloj en los seis tamaños, ambos motores |
| Tap-to-move | Touchscreen de Playwright, destino y cambio de posición comprobados |
| Drag de cámara | Entrada táctil CDP real en Chromium; puntero nativo en WebKit; control de recentrado visible |
| Selección y ataque automático | Tap real sobre jabalí, simulación del combate y recompensa exacta |
| Muerte y reaparición | Fixture del motor: daño letal, cuenta atrás y regreso cerca de una aldea propia |
| Curación y torre enemiga | Vida crece en aldea aliada y decrece en alcance enemigo |
| Respawn compartido | Campamento agotado no paga dos veces; reaparece y puede pagárselo al otro jungla |
| Recompensa y atribución | Campamentos y duelos por último golpe; torre sin crédito para el jugador |
| Duelo en ambas direcciones | Ambos héroes atacan y consiguen una baja en fixtures separados |
| Guerra autónoma | Soldados causan daño, matan y conquistan sin daño directo de héroes a edificios |
| Conquista y refuerzos | Cambio de dueño, próxima oleada y registro comprobados |
| Victoria y derrota | Fixtures de mayoría, minoría y tablas; ocurren en las simulaciones |
| Paneles y botones | Inicio, ayuda, pausa, ajustes, mapa, recentrado, refugio, resultados y reinicio |
| Pérdida de foco | Evento blur pausa y reanuda; sin avance durante pausa |
| Multitouch/cancelación | Seis casos Chromium: dos dedos y touchCancel no generan órdenes |
| Joystick | Activación, movimiento y liberación de puntero verifican inicio y fin de la orden |
| Visión de la IA | Dos estados con jugador oculto distinto producen la misma elección; memoria caduca |
| Objetivos | Aparición, propietario del beneficio y caducidad de Ascua |

Las fixtures fuerzan situaciones para verificar reglas concretas; no se presentan como pruebas de dificultad o diversión.

## Pantallas

360×740, 375×667, 390×844, 393×852, 430×932 y 844×390, con emulación móvil y deviceScaleFactor 3. En ambos motores se comprobaron botón de inicio dentro del viewport, ausencia de overflow horizontal y botones principales de al menos 44×44 CSS px. Se comprobó además cambiar de orientación durante una partida.

El canvas limita su DPR interno a 2. Se usan `env(safe-area-inset-*)`, `100dvh` y área táctil propia. La emulación usa insets de sistema cero: **no verifica una Dynamic Island, notch o indicador de inicio físicos**.

## Simulaciones de balance

Las semillas iniciales son `171 + índice_de_semilla × 7919`, compartidas por las siete estrategias. Se ejecuta el motor real, sin render y a velocidad de cálculo; no son 504 partidas esperadas en tiempo real. Las estrategias son variantes del mismo planificador por utilidad, no jugadores humanos ni agentes externos.

| Estrategia | Partidas | Victorias | % victoria | Nivel | Camps | Muertes | Gankeos* | Aldeas finales |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
'''+ '\n'.join(rows)+f'''

*Gankeos es un proxy: bajas de soldados causadas por el héroe, separadas al menos cinco segundos. No cuenta cada visita a un frente sin baja.

Medias globales:

- Duración: **{s['duration']:.0f} s de simulación**; todas completaron 195 s.
- Victorias: {s['wins']} de {s['games']} ({s['winRate']:.2f}%). Tablas: {s['draws']}.
- Nivel propio/rival: {s['level']:.2f} / {s['rivalLevel']:.2f}.
- Campamentos propios/rival: {s['camps']:.2f} / {s['rivalCamps']:.2f}.
- Muertes propias/rival: {s['deaths']:.2f} / {s['rivalDeaths']:.2f}.
- Daño recibido: {s['damage']:.2f} PV; los héroes se curan y pueden reaparecer.
- Viaje: {s['travel']:.2f} s, un {s['travel']/195*100:.1f}% de la partida.
- Objetivos especiales obtenidos: {s['objectives']:.2f}.
- Cambios de dueño: {s['captures']:.2f}. Hubo conquistas en {s['gamesWithCapture']} de {s['games']} partidas.
- Primera conquista en partidas con conquista: {s['firstCapture']:.2f} s de media.
- Terminaron con 0 o 6 aldeas: {full}/{len(games)}. Primer control completo observado: {min(controls) if controls else 0:.2f} s. Control completo antes de 60 s: {early} partidas.
- Victorias tras haber tenido menos de tres aldeas en un muestreo de cinco segundos: {comebacks}.
- Control sin órdenes: {sum(x['win'] for x in idle)}/{len(idle)} victorias. Permanecer quieto aún puede ganar por la guerra autónoma; no garantiza derrota.

El JSON contiene cada semilla, ambos niveles, muertes, campamentos, daño, gankeos, objetivos, viaje, control territorial medio/mínimo/máximo, territorio a los 60 s, primera conquista y primer control completo.

### Interpretación y límites del balance

Las intervenciones tienen efecto medible: defender o gankear supera al control sin órdenes y al farmeo aislado. Las siete estrategias pueden ganar y perder, pero **no tienen fuerza equivalente**. Defensa y gankeos siguen favorecidos; farmeo intensivo, contrajungla y priorización rígida de objetivos pierden territorio con más frecuencia. Esto no se oculta mediante ajustes del resultado final.

Se investigaron iteraciones sin conquistas y otras con cascadas rápidas. Se corrigieron logística de posiciones conquistadas, concentración de reservas, resistencia de la última aldea y prioridad del rival por las batallas. Aun así, {full}/{len(games)} partidas terminan con control completo: el efecto acumulativo territorial sigue siendo relevante. No se declara el balance cerrado ni se infiere diversión humana a partir de tasas de victoria.

Las tasas corresponden a estos bots y semillas; no son una predicción de resultados humanos. Comparar el mismo origen aleatorio reduce diferencias iniciales, pero decisiones distintas cambian los acontecimientos posteriores. Las partidas completas y su resumen están disponibles para repetir la auditoría.

## Verificación pendiente

- iPhone físico y Safari iOS real; HTML Viewer concreto y sus permisos de JavaScript.
- Safe areas reales, cambios de barra de Safari, interrupciones telefónicas y suspensión del sistema operativo.
- FPS, consumo de batería, calor y memoria en teléfonos de gama baja. Emular dimensiones no emula su CPU/GPU.
- Sesiones humanas para verificar legibilidad bajo el dedo, curva de aprendizaje, tensión y variedad de rutas.
- Publicación efectiva y visita a una URL de GitHub Pages. Se entrega la entrada preparada, no se afirma haberla publicado.

No se han probado ni añadido gamepad, multijugador ni una interfaz de escritorio. No forman parte de la 0.6 solicitada.

## Reproducción

Consulta los comandos de `README.md`. Las rutas del ejecutable Chromium pueden variar: usa `CHROME_PATH`. WebKit requiere los binarios y dependencias de Playwright. Los tests de motor solo necesitan Node.

SHA-256 del HTML auditado: `{hashlib.sha256((p/'index.html').read_bytes()).hexdigest()}`.
'''
(p/'QA.md').write_text(text)
print('QA written:',len(f)+len(c['results'])+len(w['results']),'checks;',len(games),'simulations')
