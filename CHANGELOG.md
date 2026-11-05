# Cambios 0.6

- Reconstrucción del bucle móvil a partir de la auditoría del HTML 0.5: se conservan movimiento táctil, ataques automáticos, progresión, campamentos, rival y guerra territorial.
- Eliminados oro, compras de soldados, fortificaciones, enfermerías, suministros, caravanas, ofensivas y panel de gestión. No queda una tienda oculta.
- Guerra autónoma de tres frentes, oleadas visibles, conquistas por tropas, refugios y concentración de reservas; protección de posiciones recién capturadas y logística gradual.
- Ocho campamentos iniciales, cuatro medianos, dos grandes y dos objetivos neutrales automáticos.
- Rival por utilidad con riesgo, exploración, memoria limitada, retirada, curación, invasión y respuesta a batallas. Aleatoriedad de IA separada de la de guerra y por héroe.
- Progresión simétrica, reglas compartidas, atribución estricta del último golpe y botín único por campamento.
- Partidas de 195 segundos; resultados por territorio y desempate de influencia visible.
- Dirección Ink & Ember: sprites SVG propios, terreno cartográfico, árboles rojizos, marfil, carbón, oro y ciruela. Sin emojis como personajes ni descargas externas.
- Pantalla inicial HTML, HUD compacto, tres controles de pulgar, cámara con seguimiento, drag sin orden, mapa global de inspección y joystick opcional.
- Pausa real para ayuda y pérdida de foco; cancelación de punteros, multitouch y orientación. Safe areas y DPR interno máximo 2.
- Paso fijo de 30 Hz, render limitado a 45 Hz, fondo cacheado y contingentes acotados.
- Tests reproducibles del motor, pruebas de interfaz en Chromium y WebKit y simulaciones de siete estrategias. Informes JSON incluidos.

## Errores corregidos durante el desarrollo

- Un campo de duración de respawn de campamentos se confundía con la cuenta atrás de un héroe: impedía dañarlos. Se restringió la inmunidad a héroes reapareciendo.
- Los frentes de la primera iteración no producían conquistas: se ajustaron resistencia, asedio, oleadas y utilidad de intervenir.
- Las conquistas iniciales acumulaban tropas demasiado deprisa: se ralentizaron posiciones capturadas y se concentraron reservas de facciones reducidas.
- Un test de arrastre sintético intentaba capturar un pointer inexistente: se sustituyó por entrada táctil real en Chromium y puntero nativo en WebKit.
- La comprobación de la cámara en WebKit se adelantaba al siguiente frame: el test ahora espera a que aparezca el control de recentrado.
- Se normalizó el instante final a 195 para evitar residuos de coma flotante.
