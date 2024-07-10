import { loadPyodide } from "./pyodide/pyodide.mjs";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const py = await loadPyodide({ _makeSnapshot: true });
writeFileSync(__dirname + "/snapshot.bin", py.makeMemorySnapshot());
await py.loadPackage(["micropip"]);
await py.runPython("import micropip");
await py.runPythonAsync("await micropip.install(['pydantic','numpy','certifi','ssl','urllib3','python-dateutil', 'pint', 'orjson'])");
await py.runPythonAsync("import shutil");
await py.runPythonAsync(`
import pathlib
import compileall

#compileall.compile_dir('/lib/python3.12', optimize=2)
dir = pathlib.Path("/lib/python3.12")
zip_files = dir.rglob("*.py")
for zf in zip_files:
    s = str(zf)
    if 0 and not 'pydantic' in s and not 'six' in s and not 'typing_extensions' in s and not '__init__.py' in s:
      print('delete', zf)
      zf.unlink()
`)
await py.runPythonAsync("shutil.make_archive('/tmp/init', 'zip', '/lib/python3.12/site-packages')")
// console.log(py.FS)
const data = py.FS.readFile("/tmp/init.zip");
console.log('got data', data.length)
writeFileSync(__dirname + "/init.zip", data);
