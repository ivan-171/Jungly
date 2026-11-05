# Frontera Viva 0.6 — Ink & Ember

Un jungla dentro de una guerra autónoma. Para smartphone, en vertical. Partidas de 3:15 de simulación; el reloj se detiene al pausar o salir de la pestaña.

## Jugar y publicar

Abre `index.html` en un navegador que ejecute JavaScript. Es autocontenido: no hace peticiones, no necesita instalación, backend, conexión, fuentes externas ni paquetes de pago. Algunos previsualizadores de archivos desactivan JavaScript; en ese caso, sirve el archivo por HTTP o usa GitHub Pages.

Para GitHub Pages, sube el contenido de esta carpeta a la raíz de tu repositorio y publica esa rama desde Settings → Pages. `index.html` es la entrada. No hay proceso de compilación obligatorio. Los archivos `src`, `assets` y `tests` son materiales de edición; el juego no necesita descargarlos.

## Controles

- **Toca el suelo:** camina hasta allí; también cancela un combate y permite retirarte.
- **Toca un monstruo, soldado enemigo o a Vesper:** persigue y ataca automáticamente.
- **Arrastra:** inspecciona el mapa, sin dar órdenes. La cámara vuelve tras 6,5 s o al pulsar Seguir.
- **Mapa:** vista global. Toca una zona para inspeccionarla. No envía al personaje.
- **Refugio:** camina hasta la aldea aliada más próxima. Entrar en su círculo cura 30 PV/s.
- **Seguir:** centra la cámara y cierra la vista global.
- **Pausa:** detiene toda la simulación. Permite activar el joystick y sonidos opcionales y consultar las reglas.

El joystick anula el destino y permite retirarte. Los campamentos solo responden al atacarlos; su radio de respuesta aparece al seleccionarlos. Los círculos rayados de aldeas enemigas indican el alcance de sus defensas. El multitouch cancela órdenes ambiguas.

## La guerra

Alba (marfil y oro) y la Ascendida (terracota y ciruela) empiezan con tres aldeas cada una. Los soldados se generan, viajan, combaten y asedian por sí solos. **Solo las tropas dañan y conquistan aldeas.** Puedes eliminar defensores, cortar una oleada o salvar un frente; no hay edificios que comprar, dinero, mejoras manuales ni unidades que contratar.

Tras reducir la defensa a cero, las tropas necesitan cuatro segundos de presencia para conquistar. La oposición local frena esa presencia. El territorio conquistado cura y refuerza a su nuevo dueño. La logística ralentiza las oleadas de posiciones conquistadas; al perder territorio, las reservas se concentran. La última aldea resiste más el asedio, sin otorgar experiencia ni niveles gratuitos al héroe.

A los 3:15, gana quien tenga más aldeas. En un 3–3 decide la **influencia: experiencia total obtenida + 35 por cada duelo ganado**. Si también coincide, hay tablas. Matar a Vesper concede 40 PX además del valor del duelo para el desempate. Las torres nunca conceden al jugador el crédito de un duelo.

## Campamentos y rival

Hay ocho campamentos I iniciales, cuatro II, dos III y dos objetivos especiales. Se comparten y reaparecen; Vesper puede dejarte sin la recompensa de una ruta. Ascua y Ojo aparecen a los 42 s. Ascua da +18% de daño a las tropas durante 29 s. Ojo da visión del valle y reduce un 12% el intervalo de refuerzos durante 29 s. Sus beneficios se aplican automáticamente al bando del último golpe.

Vesper usa las mismas reglas de vida, progresión, alcance, curación y campamentos. Evalúa recompensa, viaje, daño esperado, oportunidades de batalla y refugios; se compromete con su ruta, conserva un rastro de hasta nueve segundos y no conoce posiciones ocultas. Los estados lejanos de los campamentos pueden estar desactualizados para ambos.

## Editar y reproducir pruebas

- `src/engine.js`: motor determinista independiente del render.
- `src/app.js`: cámara, dibujo, input, audio y pantallas.
- `src/style.css`, `src/shell.html`: interfaz móvil.
- `assets/*.svg`, `src/art.js`: arte original y su copia embebida.
- `build_art.py`: regenera los SVG y el diccionario de arte.
- `build.py`: ensambla todo en `index.html` (Python 3 estándar).

```sh
python3 build_art.py
python3 build.py
node tests/functional.cjs
node tests/simulations.cjs 504
CHROME_PATH=/ruta/a/chrome-headless-shell node tests/mobile.cjs
BROWSER=webkit node tests/mobile.cjs
```

Las pruebas de navegador requieren Playwright y sus navegadores. `GAME_URL` permite usar un servidor HTTP en lugar del archivo local. Las pruebas funcionales y simulaciones no requieren instalar dependencias de Node.

`FronteraDebug` permite repetir semillas, inspeccionar estado y avanzar tiempo para QA; no es un menú de juego. `QA.md` distingue pruebas completadas, metodología y limitaciones. No se ha probado en un iPhone físico.
