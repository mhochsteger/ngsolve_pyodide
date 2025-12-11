import { loadPyodide } from "./pyodide/pyodide.mjs";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// const py = await loadPyodide();

const py = await loadPyodide({ _makeSnapshot: true });
writeFileSync(__dirname + "/snapshot.bin", py.makeMemorySnapshot());

console.log("load micropip")
await py.loadPackage("micropip");
const micropip = py.pyimport("micropip");
await micropip.install(['pydantic','numpy','certifi','ssl','urllib3','python-dateutil', 'pint', 'orjson']);
// console.log("loaded micropip")
// await py.runPython("import micropip");
// console.log("imported micropip")
// await py.runPythonAsync("await micropip.install(['pydantic','numpy','certifi','ssl','urllib3','python-dateutil', 'pint', 'orjson'])");
// await py.runPythonAsync("");
await py.runPythonAsync(`
import shutil
import pathlib
import compileall

#compileall.compile_dir('/lib/python3.13', optimize=2)
dir = pathlib.Path("/lib/python3.13")
zip_files = dir.rglob("*.py")
for zf in zip_files:
    s = str(zf)
    if 0 and not 'pydantic' in s and not 'six' in s and not 'typing_extensions' in s and not '__init__.py' in s:
      print('delete', zf)
      zf.unlink()

shutil.make_archive('/tmp/init', 'zip', '/lib/python3.13/site-packages')
`)
// await py.runPythonAsync("")
// console.log(py.FS)
const data = py.FS.readFile("/tmp/init.zip");
console.log('got data', data.length)
writeFileSync(__dirname + "/init.zip", data);
