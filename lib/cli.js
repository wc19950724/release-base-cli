"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js"(exports, module2) {
    var tty = require("tty");
    var isColorSupported = !("NO_COLOR" in process.env || process.argv.includes("--no-color")) && ("FORCE_COLOR" in process.env || process.argv.includes("--color") || process.platform === "win32" || tty.isatty(1) && process.env.TERM !== "dumb" || "CI" in process.env);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input;
      let index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let start = string.substring(0, index) + replace;
      let end = string.substring(index + close.length);
      let nextIndex = end.indexOf(close);
      return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end;
    };
    var createColors = (enabled = isColorSupported) => ({
      isColorSupported: enabled,
      reset: enabled ? (s) => `\x1B[0m${s}\x1B[0m` : String,
      bold: enabled ? formatter("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m") : String,
      dim: enabled ? formatter("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m") : String,
      italic: enabled ? formatter("\x1B[3m", "\x1B[23m") : String,
      underline: enabled ? formatter("\x1B[4m", "\x1B[24m") : String,
      inverse: enabled ? formatter("\x1B[7m", "\x1B[27m") : String,
      hidden: enabled ? formatter("\x1B[8m", "\x1B[28m") : String,
      strikethrough: enabled ? formatter("\x1B[9m", "\x1B[29m") : String,
      black: enabled ? formatter("\x1B[30m", "\x1B[39m") : String,
      red: enabled ? formatter("\x1B[31m", "\x1B[39m") : String,
      green: enabled ? formatter("\x1B[32m", "\x1B[39m") : String,
      yellow: enabled ? formatter("\x1B[33m", "\x1B[39m") : String,
      blue: enabled ? formatter("\x1B[34m", "\x1B[39m") : String,
      magenta: enabled ? formatter("\x1B[35m", "\x1B[39m") : String,
      cyan: enabled ? formatter("\x1B[36m", "\x1B[39m") : String,
      white: enabled ? formatter("\x1B[37m", "\x1B[39m") : String,
      gray: enabled ? formatter("\x1B[90m", "\x1B[39m") : String,
      bgBlack: enabled ? formatter("\x1B[40m", "\x1B[49m") : String,
      bgRed: enabled ? formatter("\x1B[41m", "\x1B[49m") : String,
      bgGreen: enabled ? formatter("\x1B[42m", "\x1B[49m") : String,
      bgYellow: enabled ? formatter("\x1B[43m", "\x1B[49m") : String,
      bgBlue: enabled ? formatter("\x1B[44m", "\x1B[49m") : String,
      bgMagenta: enabled ? formatter("\x1B[45m", "\x1B[49m") : String,
      bgCyan: enabled ? formatter("\x1B[46m", "\x1B[49m") : String,
      bgWhite: enabled ? formatter("\x1B[47m", "\x1B[49m") : String
    });
    module2.exports = createColors();
    module2.exports.createColors = createColors;
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js"(exports, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs5 = require("fs");
    function checkPathExt(path7, options2) {
      var pathext = options2.pathExt !== void 0 ? options2.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path7.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat, path7, options2) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path7, options2);
    }
    function isexe(path7, options2, cb) {
      fs5.stat(path7, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path7, options2));
      });
    }
    function sync(path7, options2) {
      return checkStat(fs5.statSync(path7), path7, options2);
    }
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js"(exports, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs5 = require("fs");
    function isexe(path7, options2, cb) {
      fs5.stat(path7, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options2));
      });
    }
    function sync(path7, options2) {
      return checkStat(fs5.statSync(path7), options2);
    }
    function checkStat(stat, options2) {
      return stat.isFile() && checkMode(stat, options2);
    }
    function checkMode(stat, options2) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options2.uid !== void 0 ? options2.uid : process.getuid && process.getuid();
      var myGid = options2.gid !== void 0 ? options2.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js"(exports, module2) {
    var fs5 = require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module2.exports = isexe;
    isexe.sync = sync;
    function isexe(path7, options2, cb) {
      if (typeof options2 === "function") {
        cb = options2;
        options2 = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path7, options2 || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path7, options2 || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options2 && options2.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    function sync(path7, options2) {
      try {
        return core.sync(path7, options2 || {});
      } catch (er) {
        if (options2 && options2.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
  }
});

// node_modules/.pnpm/which@2.0.2/node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/.pnpm/which@2.0.2/node_modules/which/which.js"(exports, module2) {
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path7 = require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
    var getPathInfo = (cmd, opt) => {
      const colon = opt.colon || COLON;
      const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
        // windows always checks the cwd first
        ...isWindows ? [process.cwd()] : [],
        ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
        "").split(colon)
      ];
      const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
      const pathExt = isWindows ? pathExtExe.split(colon) : [""];
      if (isWindows) {
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      return {
        pathEnv,
        pathExt,
        pathExtExe
      };
    };
    var which = (cmd, opt, cb) => {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      if (!opt)
        opt = {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      const step2 = (i) => new Promise((resolve, reject) => {
        if (i === pathEnv.length)
          return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path7.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        resolve(subStep(p, i, 0));
      });
      const subStep = (p, i, ii) => new Promise((resolve, reject) => {
        if (ii === pathExt.length)
          return resolve(step2(i + 1));
        const ext = pathExt[ii];
        isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
          if (!er && is) {
            if (opt.all)
              found.push(p + ext);
            else
              return resolve(p + ext);
          }
          return resolve(subStep(p, i, ii + 1));
        });
      });
      return cb ? step2(0).then((res) => cb(null, res), cb) : step2(0);
    };
    var whichSync = (cmd, opt) => {
      opt = opt || {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      for (let i = 0; i < pathEnv.length; i++) {
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path7.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        for (let j = 0; j < pathExt.length; j++) {
          const cur = p + pathExt[j];
          try {
            const is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    };
    module2.exports = which;
    which.sync = whichSync;
  }
});

// node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js"(exports, module2) {
    "use strict";
    var pathKey2 = (options2 = {}) => {
      const environment = options2.env || process.env;
      const platform = options2.platform || process.platform;
      if (platform !== "win32") {
        return "PATH";
      }
      return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
    };
    module2.exports = pathKey2;
    module2.exports.default = pathKey2;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/resolveCommand.js"(exports, module2) {
    "use strict";
    var path7 = require("path");
    var which = require_which();
    var getPathKey = require_path_key();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const env = parsed.options.env || process.env;
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
      if (shouldSwitchCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: env[getPathKey({ env })],
          pathExt: withoutPathExt ? path7.delimiter : void 0
        });
      } catch (e) {
      } finally {
        if (shouldSwitchCwd) {
          process.chdir(cwd);
        }
      }
      if (resolved) {
        resolved = path7.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    module2.exports = resolveCommand;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/escape.js"(exports, module2) {
    "use strict";
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg2) {
      arg2 = arg2.replace(metaCharsRegExp, "^$1");
      return arg2;
    }
    function escapeArgument(arg2, doubleEscapeMetaChars) {
      arg2 = `${arg2}`;
      arg2 = arg2.replace(/(\\*)"/g, '$1$1\\"');
      arg2 = arg2.replace(/(\\*)$/, "$1$1");
      arg2 = `"${arg2}"`;
      arg2 = arg2.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg2 = arg2.replace(metaCharsRegExp, "^$1");
      }
      return arg2;
    }
    module2.exports.command = escapeCommand;
    module2.exports.argument = escapeArgument;
  }
});

// node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js"(exports, module2) {
    "use strict";
    module2.exports = /^#!(.*)/;
  }
});

// node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js"(exports, module2) {
    "use strict";
    var shebangRegex = require_shebang_regex();
    module2.exports = (string = "") => {
      const match = string.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path7, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path7.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/readShebang.js"(exports, module2) {
    "use strict";
    var fs5 = require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs5.openSync(command, "r");
        fs5.readSync(fd, buffer, 0, size, 0);
        fs5.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module2.exports = readShebang;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/parse.js"(exports, module2) {
    "use strict";
    var path7 = require("path");
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path7.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg2) => escape.argument(arg2, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    function parse(command, args, options2) {
      if (args && !Array.isArray(args)) {
        options2 = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options2 = Object.assign({}, options2);
      const parsed = {
        command,
        args,
        options: options2,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options2.shell ? parsed : parseNonShell(parsed);
    }
    module2.exports = parse;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/enoent.js"(exports, module2) {
    "use strict";
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed, "spawn");
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    module2.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/index.js"(exports, module2) {
    "use strict";
    var cp = require("child_process");
    var parse = require_parse();
    var enoent = require_enoent();
    function spawn(command, args, options2) {
      const parsed = parse(command, args, options2);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync(command, args, options2) {
      const parsed = parse(command, args, options2);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module2.exports = spawn;
    module2.exports.spawn = spawn;
    module2.exports.sync = spawnSync;
    module2.exports._parse = parse;
    module2.exports._enoent = enoent;
  }
});

// node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/signals.js"(exports, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/index.js"(exports, module2) {
    var process5 = global.process;
    var processOk = function(process6) {
      return process6 && typeof process6 === "object" && typeof process6.removeListener === "function" && typeof process6.emit === "function" && typeof process6.reallyExit === "function" && typeof process6.listeners === "function" && typeof process6.kill === "function" && typeof process6.pid === "number" && typeof process6.on === "function";
    };
    if (!processOk(process5)) {
      module2.exports = function() {
        return function() {
        };
      };
    } else {
      assert = require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process5.platform);
      EE = require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process5.__signal_exit_emitter__) {
        emitter = process5.__signal_exit_emitter__;
      } else {
        emitter = process5.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module2.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process5.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process5.emit = originalProcessEmit;
        process5.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module2.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process5.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process5.kill(process5.pid, sig);
          }
        };
      });
      module2.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process5.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process5.emit = processEmit;
        process5.reallyExit = processReallyExit;
      };
      module2.exports.load = load;
      originalProcessReallyExit = process5.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process5.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process5.exitCode, null);
        emit("afterexit", process5.exitCode, null);
        originalProcessReallyExit.call(process5, process5.exitCode);
      };
      originalProcessEmit = process5.emit;
      processEmit = function processEmit2(ev, arg2) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg2 !== void 0) {
            process5.exitCode = arg2;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process5.exitCode, null);
          emit("afterexit", process5.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS({
  "node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/buffer-stream.js"(exports, module2) {
    "use strict";
    var { PassThrough: PassThroughStream } = require("stream");
    module2.exports = (options2) => {
      options2 = { ...options2 };
      const { array } = options2;
      let { encoding } = options2;
      const isBuffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || isBuffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (isBuffer) {
        encoding = null;
      }
      const stream = new PassThroughStream({ objectMode });
      if (encoding) {
        stream.setEncoding(encoding);
      }
      let length = 0;
      const chunks = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk);
        if (objectMode) {
          length = chunks.length;
        } else {
          length += chunk.length;
        }
      });
      stream.getBufferedValue = () => {
        if (array) {
          return chunks;
        }
        return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
      };
      stream.getBufferedLength = () => length;
      return stream;
    };
  }
});

// node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/index.js
var require_get_stream = __commonJS({
  "node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/index.js"(exports, module2) {
    "use strict";
    var { constants: BufferConstants } = require("buffer");
    var stream = require("stream");
    var { promisify } = require("util");
    var bufferStream = require_buffer_stream();
    var streamPipelinePromisified = promisify(stream.pipeline);
    var MaxBufferError = class extends Error {
      constructor() {
        super("maxBuffer exceeded");
        this.name = "MaxBufferError";
      }
    };
    async function getStream2(inputStream, options2) {
      if (!inputStream) {
        throw new Error("Expected a stream");
      }
      options2 = {
        maxBuffer: Infinity,
        ...options2
      };
      const { maxBuffer } = options2;
      const stream2 = bufferStream(options2);
      await new Promise((resolve, reject) => {
        const rejectPromise = (error2) => {
          if (error2 && stream2.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
            error2.bufferedData = stream2.getBufferedValue();
          }
          reject(error2);
        };
        (async () => {
          try {
            await streamPipelinePromisified(inputStream, stream2);
            resolve();
          } catch (error2) {
            rejectPromise(error2);
          }
        })();
        stream2.on("data", () => {
          if (stream2.getBufferedLength() > maxBuffer) {
            rejectPromise(new MaxBufferError());
          }
        });
      });
      return stream2.getBufferedValue();
    }
    module2.exports = getStream2;
    module2.exports.buffer = (stream2, options2) => getStream2(stream2, { ...options2, encoding: "buffer" });
    module2.exports.array = (stream2, options2) => getStream2(stream2, { ...options2, array: true });
    module2.exports.MaxBufferError = MaxBufferError;
  }
});

// node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js
var require_merge_stream = __commonJS({
  "node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js"(exports, module2) {
    "use strict";
    var { PassThrough } = require("stream");
    module2.exports = function() {
      var sources = [];
      var output = new PassThrough({ objectMode: true });
      output.setMaxListeners(0);
      output.add = add;
      output.isEmpty = isEmpty;
      output.on("unpipe", remove);
      Array.prototype.slice.call(arguments).forEach(add);
      return output;
      function add(source) {
        if (Array.isArray(source)) {
          source.forEach(add);
          return this;
        }
        sources.push(source);
        source.once("end", remove.bind(null, source));
        source.once("error", output.emit.bind(output, "error"));
        source.pipe(output, { end: false });
        return this;
      }
      function isEmpty() {
        return sources.length == 0;
      }
      function remove(source) {
        sources = sources.filter(function(it) {
          return it !== source;
        });
        if (!sources.length && output.readable) {
          output.end();
        }
      }
    };
  }
});

// src/cli.ts
var import_arg = __toESM(require("arg"));

// src/index.ts
var import_node_fs6 = __toESM(require("fs"));
var import_node_path6 = __toESM(require("path"));

// src/utils/answers.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_inquirer = __toESM(require("inquirer"));
var semver = __toESM(require("semver"));
var prompts = import_inquirer.default.createPromptModule();
var createInc = (preid) => {
  const pkgPath = import_node_path.default.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(import_node_fs.default.readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;
  return (i) => semver.inc(currentVersion, i, preid || optionsDefault.preid) || currentVersion;
};
var getIncVersion = () => {
  const { preid } = getOptions();
  const versionMap = {};
  const inc2 = createInc(preid);
  const versionIncrements = [
    "major",
    "minor",
    "patch",
    "premajor",
    "preminor",
    "prepatch",
    "prerelease"
  ];
  for (const type of versionIncrements) {
    versionMap[type] = inc2(type);
  }
  return versionMap;
};
var selectReleaseType = async (currentVersion) => {
  const incVersion = getIncVersion();
  const answers = await prompts([
    {
      type: "list",
      name: "release",
      message: "\nSelect release type",
      default: "patch",
      pageSize: 10,
      choices: [
        ...Object.keys(incVersion).map((i) => ({
          value: i,
          name: `${i} (${incVersion[i]})`
        })),
        {
          value: "custom",
          name: "custom"
        }
      ]
    },
    {
      type: "input",
      name: "custom",
      message: "Enter the new version number:",
      default: currentVersion,
      when: (previousAnswer) => previousAnswer.release === "custom",
      validate: (custom) => {
        return semver.valid(custom) ? true : "That's not a valid version number";
      }
    }
  ]);
  if (answers.release === "custom") {
    return answers.custom;
  }
  return incVersion[answers.release];
};
var confirmReleasing = async (targetVersion) => {
  const { quiet } = getOptions();
  if (quiet)
    return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`
  });
  return yes;
};
var confirmPublishGit = async () => {
  const { quiet } = getOptions();
  if (quiet)
    return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Publish to Git?`
  });
  return yes;
};
var confirmGenerateTag = async (targetVersion) => {
  const { quiet } = getOptions();
  if (quiet)
    return true;
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Generate & Publish Tag: v${targetVersion}?`
  });
  return yes;
};
var cmdPrompt = async (cmds) => {
  const { result } = await prompts({
    type: "list",
    name: "result",
    message: "Select cmd type",
    choices: cmds
  });
  return result;
};

// src/utils/cli.ts
var import_node_fs2 = __toESM(require("fs"));
var import_node_path2 = __toESM(require("path"));
var import_picocolors = __toESM(require_picocolors());
var spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--preid": String,
  "--commit": String,
  "--quiet": Boolean,
  "-h": "--help",
  "-v": "--version",
  "-p": "--preid",
  "-c": "--commit",
  "-q": "--quiet"
};
var formatArgs = (args) => {
  const options2 = {};
  for (const key in args) {
    const value = args[key];
    switch (key) {
      case "--preid":
        options2.preid = value;
        break;
      case "--commit":
        options2.commit = value;
        break;
      case "--quiet":
        options2.quiet = value;
        break;
      default:
        break;
    }
  }
  return options2;
};
var argsTips = (key) => {
  let tip = "";
  switch (key) {
    case "-h":
      tip = " ".repeat(3) + "cli help";
      break;
    case "-v":
      tip = " ".repeat(0) + "package version";
      break;
    case "-p":
      tip = " ".repeat(2) + `version prefix default '${optionsDefault.preid}'`;
      break;
    case "-c":
      tip = " ".repeat(1) + `commit message default '${optionsDefault.commit}'`;
      break;
    case "-q":
      tip = " ".repeat(2) + `quiet release default ${optionsDefault.quiet}`;
      break;
    default:
      break;
  }
  return tip;
};
var helpHandler = () => {
  const transformedSpec = /* @__PURE__ */ new Map();
  for (const key in spec) {
    const value = spec[key];
    const existingValue = spec[value];
    if (existingValue) {
      transformedSpec.set(`${key}, ${value}`, key);
      transformedSpec.delete(key);
      transformedSpec.delete(`${value}`);
    } else {
      transformedSpec.set(key, key);
    }
  }
  for (const [key, value] of transformedSpec) {
    logger_exports.warn(`	${key}: ${import_picocolors.default.bold(argsTips(value))}`);
  }
};
var versionHandler = () => {
  const pkgPath = import_node_path2.default.resolve(import_node_path2.default.dirname(__dirname), "..", "package.json");
  const pkg = JSON.parse(import_node_fs2.default.readFileSync(pkgPath, "utf-8"));
  logger_exports.success(import_picocolors.default.bold(pkg.version));
};

// src/utils/common.ts
var optionsDefault = {
  preid: "beta",
  commit: "release: v",
  quiet: false
};
var options = optionsDefault;
var setOptions = async (params) => {
  Object.assign(options, params);
};
var getOptions = () => options;

// src/utils/logger.ts
var logger_exports = {};
__export(logger_exports, {
  default: () => logger_default,
  error: () => error,
  gray: () => gray,
  info: () => info,
  log: () => log,
  success: () => success,
  warn: () => warn
});
var import_picocolors2 = __toESM(require_picocolors());
var error = (msg) => {
  console.log(import_picocolors2.default.red(msg));
};
var warn = (msg) => {
  console.log(import_picocolors2.default.yellow(msg));
};
var info = (msg) => {
  console.log(import_picocolors2.default.blue(msg));
};
var success = (msg) => {
  console.log(import_picocolors2.default.green(msg));
};
var log = (msg) => {
  console.log(msg);
};
var gray = (msg) => {
  console.log(import_picocolors2.default.gray(msg));
};
var logger_default = {
  error,
  warn,
  info,
  success,
  log,
  gray
};

// src/utils/utils.ts
var import_node_fs5 = __toESM(require("fs"));
var import_node_path5 = __toESM(require("path"));

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/index.js
var import_node_buffer2 = require("buffer");
var import_node_path4 = __toESM(require("path"), 1);
var import_node_child_process3 = __toESM(require("child_process"), 1);
var import_node_process3 = __toESM(require("process"), 1);
var import_cross_spawn = __toESM(require_cross_spawn(), 1);

// node_modules/.pnpm/strip-final-newline@3.0.0/node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
  const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
  const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
  if (input[input.length - 1] === LF) {
    input = input.slice(0, -1);
  }
  if (input[input.length - 1] === CR) {
    input = input.slice(0, -1);
  }
  return input;
}

// node_modules/.pnpm/npm-run-path@5.1.0/node_modules/npm-run-path/index.js
var import_node_process = __toESM(require("process"), 1);
var import_node_path3 = __toESM(require("path"), 1);
var import_node_url = __toESM(require("url"), 1);

// node_modules/.pnpm/path-key@4.0.0/node_modules/path-key/index.js
function pathKey(options2 = {}) {
  const {
    env = process.env,
    platform = process.platform
  } = options2;
  if (platform !== "win32") {
    return "PATH";
  }
  return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}

// node_modules/.pnpm/npm-run-path@5.1.0/node_modules/npm-run-path/index.js
function npmRunPath(options2 = {}) {
  const {
    cwd = import_node_process.default.cwd(),
    path: path_ = import_node_process.default.env[pathKey()],
    execPath = import_node_process.default.execPath
  } = options2;
  let previous;
  const cwdString = cwd instanceof URL ? import_node_url.default.fileURLToPath(cwd) : cwd;
  let cwdPath = import_node_path3.default.resolve(cwdString);
  const result = [];
  while (previous !== cwdPath) {
    result.push(import_node_path3.default.join(cwdPath, "node_modules/.bin"));
    previous = cwdPath;
    cwdPath = import_node_path3.default.resolve(cwdPath, "..");
  }
  result.push(import_node_path3.default.resolve(cwdString, execPath, ".."));
  return [...result, path_].join(import_node_path3.default.delimiter);
}
function npmRunPathEnv({ env = import_node_process.default.env, ...options2 } = {}) {
  env = { ...env };
  const path7 = pathKey({ env });
  options2.path = env[path7];
  env[path7] = npmRunPath(options2);
  return env;
}

// node_modules/.pnpm/mimic-fn@4.0.0/node_modules/mimic-fn/index.js
var copyProperty = (to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
};
var canCopyProperty = function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
};
var changePrototype = (to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
};
var wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
var toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
var toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
var changeToString = (to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}

// node_modules/.pnpm/onetime@6.0.0/node_modules/onetime/index.js
var calledFunctions = /* @__PURE__ */ new WeakMap();
var onetime = (function_, options2 = {}) => {
  if (typeof function_ !== "function") {
    throw new TypeError("Expected a function");
  }
  let returnValue;
  let callCount = 0;
  const functionName = function_.displayName || function_.name || "<anonymous>";
  const onetime2 = function(...arguments_) {
    calledFunctions.set(onetime2, ++callCount);
    if (callCount === 1) {
      returnValue = function_.apply(this, arguments_);
      function_ = null;
    } else if (options2.throw === true) {
      throw new Error(`Function \`${functionName}\` can only be called once`);
    }
    return returnValue;
  };
  mimicFunction(onetime2, function_);
  calledFunctions.set(onetime2, callCount);
  return onetime2;
};
onetime.callCount = (function_) => {
  if (!calledFunctions.has(function_)) {
    throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
  }
  return calledFunctions.get(function_);
};
var onetime_default = onetime;

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/main.js
var import_node_os2 = require("os");

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/realtime.js
var getRealtimeSignals = () => {
  const length = SIGRTMAX - SIGRTMIN + 1;
  return Array.from({ length }, getRealtimeSignal);
};
var getRealtimeSignal = (value, index) => ({
  name: `SIGRT${index + 1}`,
  number: SIGRTMIN + index,
  action: "terminate",
  description: "Application-specific signal (realtime)",
  standard: "posix"
});
var SIGRTMIN = 34;
var SIGRTMAX = 64;

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/signals.js
var import_node_os = require("os");

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/core.js
var SIGNALS = [
  {
    name: "SIGHUP",
    number: 1,
    action: "terminate",
    description: "Terminal closed",
    standard: "posix"
  },
  {
    name: "SIGINT",
    number: 2,
    action: "terminate",
    description: "User interruption with CTRL-C",
    standard: "ansi"
  },
  {
    name: "SIGQUIT",
    number: 3,
    action: "core",
    description: "User interruption with CTRL-\\",
    standard: "posix"
  },
  {
    name: "SIGILL",
    number: 4,
    action: "core",
    description: "Invalid machine instruction",
    standard: "ansi"
  },
  {
    name: "SIGTRAP",
    number: 5,
    action: "core",
    description: "Debugger breakpoint",
    standard: "posix"
  },
  {
    name: "SIGABRT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "ansi"
  },
  {
    name: "SIGIOT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "bsd"
  },
  {
    name: "SIGBUS",
    number: 7,
    action: "core",
    description: "Bus error due to misaligned, non-existing address or paging error",
    standard: "bsd"
  },
  {
    name: "SIGEMT",
    number: 7,
    action: "terminate",
    description: "Command should be emulated but is not implemented",
    standard: "other"
  },
  {
    name: "SIGFPE",
    number: 8,
    action: "core",
    description: "Floating point arithmetic error",
    standard: "ansi"
  },
  {
    name: "SIGKILL",
    number: 9,
    action: "terminate",
    description: "Forced termination",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGUSR1",
    number: 10,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGSEGV",
    number: 11,
    action: "core",
    description: "Segmentation fault",
    standard: "ansi"
  },
  {
    name: "SIGUSR2",
    number: 12,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGPIPE",
    number: 13,
    action: "terminate",
    description: "Broken pipe or socket",
    standard: "posix"
  },
  {
    name: "SIGALRM",
    number: 14,
    action: "terminate",
    description: "Timeout or timer",
    standard: "posix"
  },
  {
    name: "SIGTERM",
    number: 15,
    action: "terminate",
    description: "Termination",
    standard: "ansi"
  },
  {
    name: "SIGSTKFLT",
    number: 16,
    action: "terminate",
    description: "Stack is empty or overflowed",
    standard: "other"
  },
  {
    name: "SIGCHLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "posix"
  },
  {
    name: "SIGCLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "other"
  },
  {
    name: "SIGCONT",
    number: 18,
    action: "unpause",
    description: "Unpaused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGSTOP",
    number: 19,
    action: "pause",
    description: "Paused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGTSTP",
    number: 20,
    action: "pause",
    description: 'Paused using CTRL-Z or "suspend"',
    standard: "posix"
  },
  {
    name: "SIGTTIN",
    number: 21,
    action: "pause",
    description: "Background process cannot read terminal input",
    standard: "posix"
  },
  {
    name: "SIGBREAK",
    number: 21,
    action: "terminate",
    description: "User interruption with CTRL-BREAK",
    standard: "other"
  },
  {
    name: "SIGTTOU",
    number: 22,
    action: "pause",
    description: "Background process cannot write to terminal output",
    standard: "posix"
  },
  {
    name: "SIGURG",
    number: 23,
    action: "ignore",
    description: "Socket received out-of-band data",
    standard: "bsd"
  },
  {
    name: "SIGXCPU",
    number: 24,
    action: "core",
    description: "Process timed out",
    standard: "bsd"
  },
  {
    name: "SIGXFSZ",
    number: 25,
    action: "core",
    description: "File too big",
    standard: "bsd"
  },
  {
    name: "SIGVTALRM",
    number: 26,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGPROF",
    number: 27,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGWINCH",
    number: 28,
    action: "ignore",
    description: "Terminal window size changed",
    standard: "bsd"
  },
  {
    name: "SIGIO",
    number: 29,
    action: "terminate",
    description: "I/O is available",
    standard: "other"
  },
  {
    name: "SIGPOLL",
    number: 29,
    action: "terminate",
    description: "Watched event",
    standard: "other"
  },
  {
    name: "SIGINFO",
    number: 29,
    action: "ignore",
    description: "Request for process information",
    standard: "other"
  },
  {
    name: "SIGPWR",
    number: 30,
    action: "terminate",
    description: "Device running out of power",
    standard: "systemv"
  },
  {
    name: "SIGSYS",
    number: 31,
    action: "core",
    description: "Invalid system call",
    standard: "other"
  },
  {
    name: "SIGUNUSED",
    number: 31,
    action: "terminate",
    description: "Invalid system call",
    standard: "other"
  }
];

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/signals.js
var getSignals = () => {
  const realtimeSignals = getRealtimeSignals();
  const signals = [...SIGNALS, ...realtimeSignals].map(normalizeSignal);
  return signals;
};
var normalizeSignal = ({
  name,
  number: defaultNumber,
  description,
  action,
  forced = false,
  standard
}) => {
  const {
    signals: { [name]: constantSignal }
  } = import_node_os.constants;
  const supported = constantSignal !== void 0;
  const number = supported ? constantSignal : defaultNumber;
  return { name, number, description, supported, action, forced, standard };
};

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/main.js
var getSignalsByName = () => {
  const signals = getSignals();
  return Object.fromEntries(signals.map(getSignalByName));
};
var getSignalByName = ({
  name,
  number,
  description,
  supported,
  action,
  forced,
  standard
}) => [name, { name, number, description, supported, action, forced, standard }];
var signalsByName = getSignalsByName();
var getSignalsByNumber = () => {
  const signals = getSignals();
  const length = SIGRTMAX + 1;
  const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals));
  return Object.assign({}, ...signalsA);
};
var getSignalByNumber = (number, signals) => {
  const signal = findSignalByNumber(number, signals);
  if (signal === void 0) {
    return {};
  }
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: {
      name,
      number,
      description,
      supported,
      action,
      forced,
      standard
    }
  };
};
var findSignalByNumber = (number, signals) => {
  const signal = signals.find(({ name }) => import_node_os2.constants.signals[name] === number);
  if (signal !== void 0) {
    return signal;
  }
  return signals.find((signalA) => signalA.number === number);
};
var signalsByNumber = getSignalsByNumber();

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/error.js
var getErrorPrefix = ({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
  if (timedOut) {
    return `timed out after ${timeout} milliseconds`;
  }
  if (isCanceled) {
    return "was canceled";
  }
  if (errorCode !== void 0) {
    return `failed with ${errorCode}`;
  }
  if (signal !== void 0) {
    return `was killed with ${signal} (${signalDescription})`;
  }
  if (exitCode !== void 0) {
    return `failed with exit code ${exitCode}`;
  }
  return "failed";
};
var makeError = ({
  stdout,
  stderr,
  all,
  error: error2,
  signal,
  exitCode,
  command,
  escapedCommand,
  timedOut,
  isCanceled,
  killed,
  parsed: { options: { timeout } }
}) => {
  exitCode = exitCode === null ? void 0 : exitCode;
  signal = signal === null ? void 0 : signal;
  const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
  const errorCode = error2 && error2.code;
  const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
  const execaMessage = `Command ${prefix}: ${command}`;
  const isError = Object.prototype.toString.call(error2) === "[object Error]";
  const shortMessage = isError ? `${execaMessage}
${error2.message}` : execaMessage;
  const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
  if (isError) {
    error2.originalMessage = error2.message;
    error2.message = message;
  } else {
    error2 = new Error(message);
  }
  error2.shortMessage = shortMessage;
  error2.command = command;
  error2.escapedCommand = escapedCommand;
  error2.exitCode = exitCode;
  error2.signal = signal;
  error2.signalDescription = signalDescription;
  error2.stdout = stdout;
  error2.stderr = stderr;
  if (all !== void 0) {
    error2.all = all;
  }
  if ("bufferedData" in error2) {
    delete error2.bufferedData;
  }
  error2.failed = true;
  error2.timedOut = Boolean(timedOut);
  error2.isCanceled = isCanceled;
  error2.killed = killed && !timedOut;
  return error2;
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/stdio.js
var aliases = ["stdin", "stdout", "stderr"];
var hasAlias = (options2) => aliases.some((alias) => options2[alias] !== void 0);
var normalizeStdio = (options2) => {
  if (!options2) {
    return;
  }
  const { stdio } = options2;
  if (stdio === void 0) {
    return aliases.map((alias) => options2[alias]);
  }
  if (hasAlias(options2)) {
    throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
  }
  if (typeof stdio === "string") {
    return stdio;
  }
  if (!Array.isArray(stdio)) {
    throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
  }
  const length = Math.max(stdio.length, aliases.length);
  return Array.from({ length }, (value, index) => stdio[index]);
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/kill.js
var import_node_os3 = __toESM(require("os"), 1);
var import_signal_exit = __toESM(require_signal_exit(), 1);
var DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
var spawnedKill = (kill, signal = "SIGTERM", options2 = {}) => {
  const killResult = kill(signal);
  setKillTimeout(kill, signal, options2, killResult);
  return killResult;
};
var setKillTimeout = (kill, signal, options2, killResult) => {
  if (!shouldForceKill(signal, options2, killResult)) {
    return;
  }
  const timeout = getForceKillAfterTimeout(options2);
  const t = setTimeout(() => {
    kill("SIGKILL");
  }, timeout);
  if (t.unref) {
    t.unref();
  }
};
var shouldForceKill = (signal, { forceKillAfterTimeout }, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
var isSigterm = (signal) => signal === import_node_os3.default.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
var getForceKillAfterTimeout = ({ forceKillAfterTimeout = true }) => {
  if (forceKillAfterTimeout === true) {
    return DEFAULT_FORCE_KILL_TIMEOUT;
  }
  if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
    throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
  }
  return forceKillAfterTimeout;
};
var spawnedCancel = (spawned, context) => {
  const killResult = spawned.kill();
  if (killResult) {
    context.isCanceled = true;
  }
};
var timeoutKill = (spawned, signal, reject) => {
  spawned.kill(signal);
  reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
};
var setupTimeout = (spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
  if (timeout === 0 || timeout === void 0) {
    return spawnedPromise;
  }
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      timeoutKill(spawned, killSignal, reject);
    }, timeout);
  });
  const safeSpawnedPromise = spawnedPromise.finally(() => {
    clearTimeout(timeoutId);
  });
  return Promise.race([timeoutPromise, safeSpawnedPromise]);
};
var validateTimeout = ({ timeout }) => {
  if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
    throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
  }
};
var setExitHandler = async (spawned, { cleanup, detached }, timedPromise) => {
  if (!cleanup || detached) {
    return timedPromise;
  }
  const removeExitHandler = (0, import_signal_exit.default)(() => {
    spawned.kill();
  });
  return timedPromise.finally(() => {
    removeExitHandler();
  });
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/pipe.js
var import_node_fs3 = require("fs");
var import_node_child_process = require("child_process");

// node_modules/.pnpm/is-stream@3.0.0/node_modules/is-stream/index.js
function isStream(stream) {
  return stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
}
function isWritableStream(stream) {
  return isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
}

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/pipe.js
var isExecaChildProcess = (target) => target instanceof import_node_child_process.ChildProcess && typeof target.then === "function";
var pipeToTarget = (spawned, streamName, target) => {
  if (typeof target === "string") {
    spawned[streamName].pipe((0, import_node_fs3.createWriteStream)(target));
    return spawned;
  }
  if (isWritableStream(target)) {
    spawned[streamName].pipe(target);
    return spawned;
  }
  if (!isExecaChildProcess(target)) {
    throw new TypeError("The second argument must be a string, a stream or an Execa child process.");
  }
  if (!isWritableStream(target.stdin)) {
    throw new TypeError("The target child process's stdin must be available.");
  }
  spawned[streamName].pipe(target.stdin);
  return target;
};
var addPipeMethods = (spawned) => {
  if (spawned.stdout !== null) {
    spawned.pipeStdout = pipeToTarget.bind(void 0, spawned, "stdout");
  }
  if (spawned.stderr !== null) {
    spawned.pipeStderr = pipeToTarget.bind(void 0, spawned, "stderr");
  }
  if (spawned.all !== void 0) {
    spawned.pipeAll = pipeToTarget.bind(void 0, spawned, "all");
  }
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/stream.js
var import_node_fs4 = require("fs");
var import_get_stream = __toESM(require_get_stream(), 1);
var import_merge_stream = __toESM(require_merge_stream(), 1);
var validateInputOptions = (input) => {
  if (input !== void 0) {
    throw new TypeError("The `input` and `inputFile` options cannot be both set.");
  }
};
var getInputSync = ({ input, inputFile }) => {
  if (typeof inputFile !== "string") {
    return input;
  }
  validateInputOptions(input);
  return (0, import_node_fs4.readFileSync)(inputFile);
};
var handleInputSync = (options2) => {
  const input = getInputSync(options2);
  if (isStream(input)) {
    throw new TypeError("The `input` option cannot be a stream in sync mode");
  }
  return input;
};
var getInput = ({ input, inputFile }) => {
  if (typeof inputFile !== "string") {
    return input;
  }
  validateInputOptions(input);
  return (0, import_node_fs4.createReadStream)(inputFile);
};
var handleInput = (spawned, options2) => {
  const input = getInput(options2);
  if (input === void 0) {
    return;
  }
  if (isStream(input)) {
    input.pipe(spawned.stdin);
  } else {
    spawned.stdin.end(input);
  }
};
var makeAllStream = (spawned, { all }) => {
  if (!all || !spawned.stdout && !spawned.stderr) {
    return;
  }
  const mixed = (0, import_merge_stream.default)();
  if (spawned.stdout) {
    mixed.add(spawned.stdout);
  }
  if (spawned.stderr) {
    mixed.add(spawned.stderr);
  }
  return mixed;
};
var getBufferedData = async (stream, streamPromise) => {
  if (!stream || streamPromise === void 0) {
    return;
  }
  stream.destroy();
  try {
    return await streamPromise;
  } catch (error2) {
    return error2.bufferedData;
  }
};
var getStreamPromise = (stream, { encoding, buffer, maxBuffer }) => {
  if (!stream || !buffer) {
    return;
  }
  if (encoding) {
    return (0, import_get_stream.default)(stream, { encoding, maxBuffer });
  }
  return import_get_stream.default.buffer(stream, { maxBuffer });
};
var getSpawnedResult = async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
  const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
  const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
  const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
  try {
    return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
  } catch (error2) {
    return Promise.all([
      { error: error2, signal: error2.signal, timedOut: error2.timedOut },
      getBufferedData(stdout, stdoutPromise),
      getBufferedData(stderr, stderrPromise),
      getBufferedData(all, allPromise)
    ]);
  }
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/promise.js
var nativePromisePrototype = (async () => {
})().constructor.prototype;
var descriptors = ["then", "catch", "finally"].map((property) => [
  property,
  Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
]);
var mergePromise = (spawned, promise) => {
  for (const [property, descriptor] of descriptors) {
    const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
    Reflect.defineProperty(spawned, property, { ...descriptor, value });
  }
};
var getSpawnedPromise = (spawned) => new Promise((resolve, reject) => {
  spawned.on("exit", (exitCode, signal) => {
    resolve({ exitCode, signal });
  });
  spawned.on("error", (error2) => {
    reject(error2);
  });
  if (spawned.stdin) {
    spawned.stdin.on("error", (error2) => {
      reject(error2);
    });
  }
});

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/command.js
var import_node_buffer = require("buffer");
var import_node_child_process2 = require("child_process");
var normalizeArgs = (file, args = []) => {
  if (!Array.isArray(args)) {
    return [file];
  }
  return [file, ...args];
};
var NO_ESCAPE_REGEXP = /^[\w.-]+$/;
var DOUBLE_QUOTES_REGEXP = /"/g;
var escapeArg = (arg2) => {
  if (typeof arg2 !== "string" || NO_ESCAPE_REGEXP.test(arg2)) {
    return arg2;
  }
  return `"${arg2.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
};
var joinCommand = (file, args) => normalizeArgs(file, args).join(" ");
var getEscapedCommand = (file, args) => normalizeArgs(file, args).map((arg2) => escapeArg(arg2)).join(" ");
var SPACES_REGEXP = / +/g;
var parseExpression = (expression) => {
  const typeOfExpression = typeof expression;
  if (typeOfExpression === "string") {
    return expression;
  }
  if (typeOfExpression === "number") {
    return String(expression);
  }
  if (typeOfExpression === "object" && expression !== null && !(expression instanceof import_node_child_process2.ChildProcess) && "stdout" in expression) {
    const typeOfStdout = typeof expression.stdout;
    if (typeOfStdout === "string") {
      return expression.stdout;
    }
    if (import_node_buffer.Buffer.isBuffer(expression.stdout)) {
      return expression.stdout.toString();
    }
    throw new TypeError(`Unexpected "${typeOfStdout}" stdout in template expression`);
  }
  throw new TypeError(`Unexpected "${typeOfExpression}" in template expression`);
};
var concatTokens = (tokens, nextTokens, isNew) => isNew || tokens.length === 0 || nextTokens.length === 0 ? [...tokens, ...nextTokens] : [
  ...tokens.slice(0, -1),
  `${tokens[tokens.length - 1]}${nextTokens[0]}`,
  ...nextTokens.slice(1)
];
var parseTemplate = ({ templates, expressions, tokens, index, template }) => {
  const templateString = template ?? templates.raw[index];
  const templateTokens = templateString.split(SPACES_REGEXP).filter(Boolean);
  const newTokens = concatTokens(
    tokens,
    templateTokens,
    templateString.startsWith(" ")
  );
  if (index === expressions.length) {
    return newTokens;
  }
  const expression = expressions[index];
  const expressionTokens = Array.isArray(expression) ? expression.map((expression2) => parseExpression(expression2)) : [parseExpression(expression)];
  return concatTokens(
    newTokens,
    expressionTokens,
    templateString.endsWith(" ")
  );
};
var parseTemplates = (templates, expressions) => {
  let tokens = [];
  for (const [index, template] of templates.entries()) {
    tokens = parseTemplate({ templates, expressions, tokens, index, template });
  }
  return tokens;
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/verbose.js
var import_node_util = require("util");
var import_node_process2 = __toESM(require("process"), 1);
var verboseDefault = (0, import_node_util.debuglog)("execa").enabled;
var padField = (field, padding) => String(field).padStart(padding, "0");
var getTimestamp = () => {
  const date = /* @__PURE__ */ new Date();
  return `${padField(date.getHours(), 2)}:${padField(date.getMinutes(), 2)}:${padField(date.getSeconds(), 2)}.${padField(date.getMilliseconds(), 3)}`;
};
var logCommand = (escapedCommand, { verbose }) => {
  if (!verbose) {
    return;
  }
  import_node_process2.default.stderr.write(`[${getTimestamp()}] ${escapedCommand}
`);
};

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/index.js
var DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
var getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
  const env = extendEnv ? { ...import_node_process3.default.env, ...envOption } : envOption;
  if (preferLocal) {
    return npmRunPathEnv({ env, cwd: localDir, execPath });
  }
  return env;
};
var handleArguments = (file, args, options2 = {}) => {
  const parsed = import_cross_spawn.default._parse(file, args, options2);
  file = parsed.command;
  args = parsed.args;
  options2 = parsed.options;
  options2 = {
    maxBuffer: DEFAULT_MAX_BUFFER,
    buffer: true,
    stripFinalNewline: true,
    extendEnv: true,
    preferLocal: false,
    localDir: options2.cwd || import_node_process3.default.cwd(),
    execPath: import_node_process3.default.execPath,
    encoding: "utf8",
    reject: true,
    cleanup: true,
    all: false,
    windowsHide: true,
    verbose: verboseDefault,
    ...options2
  };
  options2.env = getEnv(options2);
  options2.stdio = normalizeStdio(options2);
  if (import_node_process3.default.platform === "win32" && import_node_path4.default.basename(file, ".exe") === "cmd") {
    args.unshift("/q");
  }
  return { file, args, options: options2, parsed };
};
var handleOutput = (options2, value, error2) => {
  if (typeof value !== "string" && !import_node_buffer2.Buffer.isBuffer(value)) {
    return error2 === void 0 ? void 0 : "";
  }
  if (options2.stripFinalNewline) {
    return stripFinalNewline(value);
  }
  return value;
};
function execa(file, args, options2) {
  const parsed = handleArguments(file, args, options2);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  logCommand(escapedCommand, parsed.options);
  validateTimeout(parsed.options);
  let spawned;
  try {
    spawned = import_node_child_process3.default.spawn(parsed.file, parsed.args, parsed.options);
  } catch (error2) {
    const dummySpawned = new import_node_child_process3.default.ChildProcess();
    const errorPromise = Promise.reject(makeError({
      error: error2,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    }));
    mergePromise(dummySpawned, errorPromise);
    return dummySpawned;
  }
  const spawnedPromise = getSpawnedPromise(spawned);
  const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
  const processDone = setExitHandler(spawned, parsed.options, timedPromise);
  const context = { isCanceled: false };
  spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
  spawned.cancel = spawnedCancel.bind(null, spawned, context);
  const handlePromise = async () => {
    const [{ error: error2, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
    const stdout = handleOutput(parsed.options, stdoutResult);
    const stderr = handleOutput(parsed.options, stderrResult);
    const all = handleOutput(parsed.options, allResult);
    if (error2 || exitCode !== 0 || signal !== null) {
      const returnedError = makeError({
        error: error2,
        exitCode,
        signal,
        stdout,
        stderr,
        all,
        command,
        escapedCommand,
        parsed,
        timedOut,
        isCanceled: context.isCanceled || (parsed.options.signal ? parsed.options.signal.aborted : false),
        killed: spawned.killed
      });
      if (!parsed.options.reject) {
        return returnedError;
      }
      throw returnedError;
    }
    return {
      command,
      escapedCommand,
      exitCode: 0,
      stdout,
      stderr,
      all,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  };
  const handlePromiseOnce = onetime_default(handlePromise);
  handleInput(spawned, parsed.options);
  spawned.all = makeAllStream(spawned, parsed.options);
  addPipeMethods(spawned);
  mergePromise(spawned, handlePromiseOnce);
  return spawned;
}
function execaSync(file, args, options2) {
  const parsed = handleArguments(file, args, options2);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  logCommand(escapedCommand, parsed.options);
  const input = handleInputSync(parsed.options);
  let result;
  try {
    result = import_node_child_process3.default.spawnSync(parsed.file, parsed.args, { ...parsed.options, input });
  } catch (error2) {
    throw makeError({
      error: error2,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    });
  }
  const stdout = handleOutput(parsed.options, result.stdout, result.error);
  const stderr = handleOutput(parsed.options, result.stderr, result.error);
  if (result.error || result.status !== 0 || result.signal !== null) {
    const error2 = makeError({
      stdout,
      stderr,
      error: result.error,
      signal: result.signal,
      exitCode: result.status,
      command,
      escapedCommand,
      parsed,
      timedOut: result.error && result.error.code === "ETIMEDOUT",
      isCanceled: false,
      killed: result.signal !== null
    });
    if (!parsed.options.reject) {
      return error2;
    }
    throw error2;
  }
  return {
    command,
    escapedCommand,
    exitCode: 0,
    stdout,
    stderr,
    failed: false,
    timedOut: false,
    isCanceled: false,
    killed: false
  };
}
var normalizeScriptStdin = ({ input, inputFile, stdio }) => input === void 0 && inputFile === void 0 && stdio === void 0 ? { stdin: "inherit" } : {};
var normalizeScriptOptions = (options2 = {}) => ({
  preferLocal: true,
  ...normalizeScriptStdin(options2),
  ...options2
});
function create$(options2) {
  function $2(templatesOrOptions, ...expressions) {
    if (!Array.isArray(templatesOrOptions)) {
      return create$({ ...options2, ...templatesOrOptions });
    }
    const [file, ...args] = parseTemplates(templatesOrOptions, expressions);
    return execa(file, args, normalizeScriptOptions(options2));
  }
  $2.sync = (templates, ...expressions) => {
    if (!Array.isArray(templates)) {
      throw new TypeError("Please use $(options).sync`command` instead of $.sync(options)`command`.");
    }
    const [file, ...args] = parseTemplates(templates, expressions);
    return execaSync(file, args, normalizeScriptOptions(options2));
  };
  return $2;
}
var $ = create$();

// src/utils/utils.ts
var run = async (bin, args, opts = {}) => {
  try {
    const { quiet } = getOptions();
    return await execa(bin, args, {
      stdio: quiet ? "ignore" : "inherit",
      ...opts
    });
  } catch (error2) {
    return Promise.reject(error2);
  }
};
var getCmds = async () => {
  const cmds = [];
  if (import_node_fs5.default.existsSync("package-lock.json")) {
    cmds.push("npm");
  } else if (import_node_fs5.default.existsSync("yarn.lock")) {
    cmds.push("yarn");
  } else if (import_node_fs5.default.existsSync("pnpm-lock.yaml")) {
    cmds.push("pnpm");
  }
  return cmds;
};
var selectCmd = async () => {
  let command = "npm";
  const cmds = await getCmds();
  if (cmds.length === 1) {
    command = cmds[0];
  } else if (cmds.length > 1) {
    const result = await cmdPrompt(cmds);
    command = result;
  }
  return command;
};
var step = (msg) => logger_exports.success(`
${msg}`);

// src/index.ts
var steps = async () => {
  const targetVersion = await selectVersion();
  if (!targetVersion)
    return;
  await updateVersions(targetVersion);
  await reBuild();
  await pushGit(targetVersion);
};
var selectVersion = async () => {
  const pkgPath = import_node_path6.default.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(import_node_fs6.default.readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;
  const targetVersion = await selectReleaseType(currentVersion);
  const confirmRelease = await confirmReleasing(targetVersion);
  return confirmRelease && targetVersion;
};
var updateVersions = async (version) => {
  step("Updating package versions...");
  const pkgPath = import_node_path6.default.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(import_node_fs6.default.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  import_node_fs6.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  logger_exports.log(`Package version updated: ${version}`);
};
var reBuild = async () => {
  step("Updating lockfile...");
  const cmd = await selectCmd();
  try {
    await run(cmd, ["install", "--prefer-offline"]);
  } catch (error2) {
    await run(cmd, ["install"]);
  }
  step("Rebuilding...");
  await run(cmd, ["build"]);
};
var pushGit = async (targetVersion) => {
  const { commit } = getOptions();
  step("Pushing to GitHub...");
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("Committing changes...");
    await run("git", ["add", "-A"]);
    await run("git", ["commit", "-m", `${commit}${targetVersion}`]);
  }
  const publishOk = await confirmPublishGit();
  if (publishOk) {
    await run("git", ["push"]);
    step("Generate & Publish Tag...");
    const tagOk = await confirmGenerateTag(targetVersion);
    if (tagOk) {
      try {
        await run("git", ["tag", `v${targetVersion}`]);
      } catch (error2) {
        logger_exports.error(error2.stack);
      }
      await run("git", ["push", "origin", `refs/tags/v${targetVersion}`]);
    }
  }
};
var main = async (params) => {
  await setOptions(params);
  await steps();
};
var src_default = main;

// src/cli.ts
var cli = async () => {
  const args = (0, import_arg.default)(spec, {
    permissive: true
  });
  if (args["--help"]) {
    helpHandler();
  } else if (args["--version"]) {
    versionHandler();
  } else {
    const options2 = formatArgs(args);
    await src_default(options2);
  }
};
cli().catch((err) => {
  logger_exports.error(`${err.name}: ${err.message}`);
}).finally(() => {
  process.exit(0);
});
