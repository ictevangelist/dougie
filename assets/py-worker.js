/* Dougie's Revision: runs Python (Pyodide) away from the page, so a never-ending loop can be stopped */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
var ready = loadPyodide();
onmessage = function (e) {
  ready.then(function (py) {
    var out = [], ns = py.globals.get("dict")();
    py.setStdout({ batched: function (s) { out.push(s); } });
    py.setStderr({ batched: function (s) { out.push(s); } });
    try {
      py.runPython(e.data.code, { globals: ns });
      var results = e.data.tests.map(function (call) {
        try { return { call: call, got: py.runPython("repr(" + call + ")", { globals: ns }) }; }
        catch (err) { return { call: call, got: "an error: " + String(err.message).trim().split("\n").pop() }; }
      });
      postMessage({ out: out.join("\n"), results: results });
    } catch (err) {
      postMessage({ out: out.join("\n"), error: String(err.message).trim().split("\n").slice(-1)[0] });
    }
  });
};
