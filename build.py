from pathlib import Path
p=Path(__file__).parent
text=(p/'src/shell.html').read_text()
for marker,file in [('STYLE','style.css'),('ENGINE','engine.js'),('ART','art.js'),('APP','app.js')]:
 text=text.replace('/*'+marker+'*/',(p/'src'/file).read_text())
(p/'index.html').write_text(text)
