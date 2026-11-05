# Decisiones de diseño

## La posición es el recurso

Se elimina la economía del jugador. Farmear, curarse y gankear consumen el mismo recurso escaso: tiempo de desplazamiento y presencia. La guerra resuelve batallas en los otros frentes mientras el héroe elige una ruta.

Las tropas llevan las conquistas a término. Un héroe puede darles superioridad local, pero no pulsar una aldea y destruirla. Así, salvar o abrir un frente tiene una consecuencia visible: la oleada llega, aparece el canal de conquista y cambian estandarte, refugio y refuerzos.

## Curvas comunes

Con nivel `L`, ambos junglas tienen:

- Vida máxima: `182 + 24 × (L − 1)`.
- Ataque: `30 + 5 × (L − 1)` cada 0,68 s.
- Defensa: `8 + 2 × (L − 1)`.
- Daño recibido: `ataque × 100 / (100 + defensa)`.
- PX para el siguiente nivel: `42 + 34 × (L − 1)`.
- Velocidad: 168 unidades/s; recorrer 300 unidades tarda unos 1,79 s.
- Curación territorial: 30 PV/s; recuperar 120 PV requiere 4 s dentro del refugio.
- Reaparición: 6, 7 u 8 s según el tiempo transcurrido; conserva el nivel y vuelve con 80% de vida.

Al subir de nivel solo se añade el incremento de vida máxima, no una curación completa. El tope es nivel 12.

| Campamento | Vida base | Daño / intervalo | PX | Respawn | TTK inicial aprox. |
|---|---:|---|---:|---:|---:|
| I | 145 | 12 / 1,5 s | 32 | 32 s | 2,72 s |
| II | 270 | 22 / 1,45 s | 58 | 41 s | 5,44 s |
| III | 455 | 36 / 1,4 s | 90 | 50 s | 10,20 s |
| Objetivo | 385 | 29 / 1,5 s | 80 + beneficio | 52 s | 8,16 s |

TTK: `(ceil(vida / ataque) − 1) × intervalo`, con primer golpe inmediato. La vida del campamento escala al reaparecer hasta +45% con el tiempo; el daño base no escala. En nivel 1, I y II son alcanzables; III exige progresar o aceptar un riesgo letal. La vista contextual usa una proyección conservadora del daño esperado, no promete un resultado si interviene otro actor.

## Territorio sin compras

Aldea: 190 defensa, radio de torre 83, curación aliada en 75. Oleada base de 2 soldados (17% de 3), con intervalo base de 26 s, pequeñas variaciones y límites por origen y facción. Cada soldado tiene 92 vida, 12 ataque y velocidad 63. La torre golpea cada 1,2 s, prioriza tropas y hace 25 de daño bruto a héroes. No hay eventos que regalen victorias ni compras repetibles.

El intervalo usa el factor logístico `0,5 + aldeas propias / 6`: más posiciones amplían la capacidad total, pero no la multiplican linealmente. Una posición conquistada tarda 12 s en enviar su primera ayuda, produce un solo soldado durante sus primeros 45 s y después usa un intervalo un 18% mayor. La última aldea concentra tres reclutas por oleada y sus defensas reducen más el daño de asedio: multiplicadores 0,22 con una aldea y 0,7 con dos; el resto usa 1. Es una regla automática y simétrica, no una remontada que altere el resultado por decisión del motor.

## Rival con información limitada

La utilidad de un campamento compara PX con viaje, TTK y fracción de salud esperada. Se descartan riesgos altos y posiciones dentro de torres rivales. Las oportunidades de gank tienen en cuenta soldados aliados próximos y amenazas a aldeas propias. Curarse y huir pueden interrumpir el compromiso. La IA reconsidera cada 0,8–1,4 s, pero mantiene objetivos unos 2,5–3,9 s salvo peligro.

La disponibilidad de campamentos procede de observaciones. El rastro del héroe enemigo caduca a los nueve segundos y la persecución termina en el último punto conocido. La visión procede de héroes, soldados, aldeas y Ojo. Cada héroe tiene un generador aleatorio de IA independiente; pensar más veces no cambia por sí solo el azar de las oleadas.

## Móvil y arte

El HUD solo conserva vida, progreso, tiempo, control y avistamientos conocidos. Refugio, Seguir y Mapa ocupan el pulgar. El resto vive en una pausa que detiene el reloj. El mapa global inspecciona y el arrastre nunca se convierte en un movimiento al soltar. La cámara manual vuelve por tiempo o mediante un botón explícito.

Se consultaron las recomendaciones oficiales de Apple sobre controles de juego y safe areas: objetivos táctiles de al menos 44 CSS px, estados de pulsación y respeto de las áreas del sistema. Los CSS px de emulación no demuestran el tamaño físico en todos los dispositivos.

Referencias visuales: siluetas legibles y escala compacta de personajes como en juegos móviles ilustrados; paleta editorial Ink & Ember y cartografía cálida. Se consultó Kenney Tiny Dungeon (CC0), pero se eligió un conjunto SVG original para que todo comparta estilo y funcione offline. No se incorporaron imágenes de Monument Valley ni sprites de terceros.

## Referencias consultadas

- https://developer.apple.com/design/human-interface-guidelines/game-controls
- https://developer.apple.com/design/human-interface-guidelines/designing-for-games
- https://developer.apple.com/design/human-interface-guidelines/layout
- https://ustwo.com/work/monument-valley/
- https://kenney.nl/assets/tiny-dungeon

El balance tiene medición automatizada, no certificación de diversión. `QA.md` recoge las diferencias entre estrategias y los puntos que necesitan juego humano.
