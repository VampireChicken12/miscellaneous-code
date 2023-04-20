var formatRegExp = /%[sdj%]/g;
function isUndefined(arg) {
	return arg === void 0;
}
function isString(arg) {
	return typeof arg === "string";
}
function isFunction(arg) {
	return typeof arg === "function";
}
function isObject(arg) {
	return typeof arg === "object" && arg !== null;
}
function isBoolean(arg) {
	return typeof arg === "boolean";
}
function isNull(arg) {
	return arg === null;
}
function stylizeNoColor(str) {
	return str;
}
function stylizeWithColor(str, styleType) {
	var style = inspect.styles[styleType];

	if (style) {
		return "\u001b[" + inspect.colors[style][0] + "m" + str + "\u001b[" + inspect.colors[style][1] + "m";
	} else {
		return str;
	}
}
function formatValue(ctx, value, recurseTimes) {
	// Provide a hook for user-specified inspect functions.
	// Check that value is an object with an inspect function on it
	if (
		ctx.customInspect &&
		value &&
		isFunction(value.inspect) &&
		// Filter out the util module, it's inspect function is special
		value.inspect !== inspect &&
		// Also filter out any prototype objects using the circular check.
		!(value.constructor && value.constructor.prototype === value)
	) {
		var ret = value.inspect(recurseTimes, ctx);
		if (!isString(ret)) {
			ret = formatValue(ctx, ret, recurseTimes);
		}
		return ret;
	}
}
function extend(origin, add) {
	// Don't do anything if add isn't an object
	if (!add || !isObject(add)) return origin;

	var keys = Object.keys(add);
	var i = keys.length;
	while (i--) {
		origin[keys[i]] = add[keys[i]];
	}
	return origin;
}
/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
	// default options
	var ctx = {
		seen: [],
		stylize: stylizeNoColor
	};
	// legacy...
	if (arguments.length >= 3) ctx.depth = arguments[2];
	if (arguments.length >= 4) ctx.colors = arguments[3];
	if (isBoolean(opts)) {
		// legacy...
		ctx.showHidden = opts;
	} else if (opts) {
		// got an "options" object
		extend(ctx, opts);
	}
	// set default options
	if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	if (isUndefined(ctx.depth)) ctx.depth = 2;
	if (isUndefined(ctx.colors)) ctx.colors = false;
	if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	if (ctx.colors) ctx.stylize = stylizeWithColor;
	return formatValue(ctx, obj, ctx.depth);
}
// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
	bold: [1, 22],
	italic: [3, 23],
	underline: [4, 24],
	inverse: [7, 27],
	white: [37, 39],
	grey: [90, 39],
	black: [30, 39],
	blue: [34, 39],
	cyan: [36, 39],
	green: [32, 39],
	magenta: [35, 39],
	red: [31, 39],
	yellow: [33, 39]
};
// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
	special: "cyan",
	number: "yellow",
	boolean: "yellow",
	undefined: "grey",
	null: "bold",
	string: "green",
	date: "magenta",
	// "name": intentionally not styling
	regexp: "red"
};
function format(f) {
	if (!isString(f)) {
		var objects = [];
		for (var i = 0; i < arguments.length; i++) {
			objects.push(inspect(arguments[i]));
		}
		return objects.join(" ");
	}

	var index = 1;
	var args = arguments;
	var len = args.length;
	var str = String(f).replace(formatRegExp, function (x) {
		if (x === "%%") return "%";
		if (index >= len) return x;
		switch (x) {
			case "%s":
				return String(args[index++]);
			case "%d":
				return Number(args[index++]);
			case "%j":
				try {
					return JSON.stringify(args[index++]);
				} catch (_) {
					return "[Circular]";
				}
			default:
				return x;
		}
	});
	for (var x = args[index]; index < len; x = args[++index]) {
		if (isNull(x) || !isObject(x)) {
			str += " " + x;
		} else {
			str += " " + inspect(x);
		}
	}
	return str;
}
	class Logger {
		/**
		 * Constructor for Logger
		 * @param {boolean} showDateTime If Logger.showDateTime should show
		 * @param {boolean}  [debug=false]       If Logger.debug should show
		 */
		constructor(showDateTime = true, debug = false) {
			this.logPrefix = "[CivitAI Visited Links Tracker] ";
			this._showDateTime = showDateTime;
			this._types = {
				log: { disp: "LOG", color: "white", func: console.log },
				info: { disp: "INFO", color: "cyan", func: console.info },
				warn: { disp: "WARN", color: "yellow", func: console.warn },
				error: { disp: "ERR!", color: "red", func: console.error },
				dir: { disp: "DIR?", color: "blue", func: console.log },
				trace: { disp: "TRCE", color: "green", func: console.log },
				debug: { disp: "DBUG", color: "magenta", func: console.log },
				"????": { disp: "????", color: "pink", func: console.log }
			};
			this._debug = debug;
		}

		/**
		 * Same as console.log
		 * Prepends Date + [LOG ] to output
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		log(...message) {
			this._log(new Date(), "log", ...message);
		}

		/**
		 * Same as console.info
		 * Prepends Date + [INFO] to output and colors
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		info(...message) {
			this._log(new Date(), "info", ...message);
		}

		/**
		 * Same as console.warn
		 * Prepends Date + [WARN] to output and colors
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		warn(...message) {
			this._log(new Date(), "warn", ...message);
		}

		/**
		 * Same as console.error
		 * Also calls the reportError function
		 * Prepends Date + [ERR!] to output and colors
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		error(...message) {
			this._log(new Date(), "error", inspect(message[0], { depth: null }), ...message.slice(1));
		}

		/**
		 * Same as console.dir
		 * Prepends Date + [DIR?] to output and colors
		 * @param {Object}   obj     The object to inspect
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		dir(obj, ...message) {
			this._log(new Date(), "dir", ...message);
			console.dir(obj, { colors: true });
		}

		/**
		 * Same as console.trace
		 * Prepends Date + [TRCE] to output and colors
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		trace(...message) {
			this._log(new Date(), "trace", ...message);
			console.trace(...message);
		}

		/**
		 * Same as console.debug
		 * Only outputs if debug is true
		 * Prepends Date + [DBUG] to output and colors
		 * @param {String[]} message Same as console.log(), first can be a string used for Util.format
		 */
		debug(...message) {
			if (this._debug) {
				this._log(new Date(), "debug", ...message);
			}
		}

		/**
		 * The actual logging thing
		 * You probably should never need to use it
		 * @param {Date}     date    The date to log
		 * @param {String}   type    The type of thing to log
		 * @param {String[]} message The message(s) to log. Util.format is called on this
		 */
		_log(date, type, ...message) {
			const time = `${this._padLeft(date.getMonth() + 1, 2, 0)}/${this._padLeft(date.getDate(), 2, 0)} ${this._padLeft(
				date.getHours(),
				2,
				0
			)}:${this._padLeft(date.getMinutes(), 2, 0)}`;
			if (this._types[type] === undefined) {
				type = "????";
			}

			const formatted = `%c${this.logPrefix}${this._showDateTime ? `[${time}]` : ""}[${this._types[type].disp}] ${format(...message)}`;

			this._types[type].func(formatted, `color: ${this._types[type].color}`);
			return formatted;
		}

		/**
		 * You should never need to use this
		 * Pads a string to the right
		 * @param {String} msg           The message to pad
		 * @param {Number} pad           Width to pad to
		 * @param {String} [padChar=' '] Char to pad with
		 * @return {String} The padded string
		 */
		_padRight(msg, pad, padChar = " ") {
			padChar = `${padChar}`;
			return new Array(pad)
				.fill(0)
				.map((v, i) => msg.split("")[i] || padChar)
				.join("");
		}

		/**
		 * You should never need to use this
		 * Pads a string to the left
		 * @param {String} msg           The message to pad
		 * @param {Number} pad           Width to pad to
		 * @param {String} [padChar='0'] Char to pad with
		 * @return {String} The padded string
		 */
		_padLeft(msg, pad, padChar = "0") {
			padChar = `${padChar}`; // because string coercion wee
			msg = `${msg}`;
			const padded = padChar.repeat(pad);
			return padded.substring(0, padded.length - msg.length) + msg;
		}
	}
export { format, inspect, isUndefined, isString, isFunction, isObject, isBoolean, isNull, Logger };