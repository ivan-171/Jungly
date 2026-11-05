# QA real — Frontera Viva 0.6

Fecha: 5 de noviembre de 2026. Versión probada: `index.html` autocontenido de esta entrega.

## Resultado

- **16 pruebas del motor aprobadas.**
- **74 comprobaciones de interfaz aprobadas en Chromium headless shell 145.0.7632.6.**
- **68 comprobaciones de interfaz aprobadas en WebKit 26.5 / Playwright webkit-2336.**
- **Cero errores JavaScript de página** registrados en las dos tandas de interfaz.
- **504 partidas simuladas completas**, siete estrategias, 72 semillas base por estrategia y paso fijo de 1/30 s. Se añadieron 24 controles sin órdenes del jugador.
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
| Farmeo intensivo | 72 | 10 | 13.89% | 7.90 | 21.94 | 0.65 | 2.53 | 1.06 |
| Defensa | 72 | 55 | 76.39% | 8.08 | 19.86 | 0.08 | 6.29 | 4.00 |
| Gankeos frecuentes | 72 | 52 | 72.22% | 8.03 | 19.58 | 0.15 | 6.47 | 3.93 |
| Contrajungla | 72 | 16 | 22.22% | 8.13 | 25.26 | 0.67 | 2.11 | 1.40 |
| Objetivos neutrales | 72 | 19 | 26.39% | 7.68 | 19.81 | 0.44 | 3.56 | 1.65 |
| Mixta | 72 | 32 | 44.44% | 8.11 | 19.78 | 0.19 | 6.00 | 2.99 |
| Aleatoria válida | 72 | 23 | 31.94% | 4.01 | 5.94 | 0.88 | 5.78 | 1.86 |

*Gankeos es un proxy: bajas de soldados causadas por el héroe, separadas al menos cinco segundos. No cuenta cada visita a un frente sin baja.

Medias globales:

- Duración: **195 s de simulación**; todas completaron 195 s.
- Victorias: 207 de 504 (41.07%). Tablas: 1.
- Nivel propio/rival: 7.42 / 8.12.
- Campamentos propios/rival: 18.88 / 19.93.
- Muertes propias/rival: 0.44 / 0.15.
- Daño recibido: 1402.21 PV; los héroes se curan y pueden reaparecer.
- Viaje: 73.16 s, un 37.5% de la partida.
- Objetivos especiales obtenidos: 2.01.
- Cambios de dueño: 4.67. Hubo conquistas en 493 de 504 partidas.
- Primera conquista en partidas con conquista: 79.67 s de media.
- Terminaron con 0 o 6 aldeas: 197/504. Primer control completo observado: 64.93 s. Control completo antes de 60 s: 0 partidas.
- Victorias tras haber tenido menos de tres aldeas en un muestreo de cinco segundos: 35.
- Control sin órdenes: 6/24 victorias. Permanecer quieto aún puede ganar por la guerra autónoma; no garantiza derrota.

El JSON contiene cada semilla, ambos niveles, muertes, campamentos, daño, gankeos, objetivos, viaje, control territorial medio/mínimo/máximo, territorio a los 60 s, primera conquista y primer control completo.

### Interpretación y límites del balance

Las intervenciones tienen efecto medible: defender o gankear supera al control sin órdenes y al farmeo aislado. Las siete estrategias pueden ganar y perder, pero **no tienen fuerza equivalente**. Defensa y gankeos siguen favorecidos; farmeo intensivo, contrajungla y priorización rígida de objetivos pierden territorio con más frecuencia. Esto no se oculta mediante ajustes del resultado final.

Se investigaron iteraciones sin conquistas y otras con cascadas rápidas. Se corrigieron logística de posiciones conquistadas, concentración de reservas, resistencia de la última aldea y prioridad del rival por las batallas. Aun así, 197/504 partidas terminan con control completo: el efecto acumulativo territorial sigue siendo relevante. No se declara el balance cerrado ni se infiere diversión humana a partir de tasas de victoria.

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

SHA-256 del HTML auditado: `e0e54e7a97f4c081913abd3a727bba680f36c98c9a9cba7cbb04da1464688a84`.
