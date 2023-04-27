#!/usr/bin/env node
'use strict';

var node_fs = require('node:fs');
var path$4 = require('node:path');
var require$$0 = require('events');
var require$$1 = require('child_process');
var require$$0$1 = require('path');
var require$$0$2 = require('fs');
var require$$4 = require('process');
var require$$0$4 = require('assert');
var require$$0$3 = require('readline');
var node_buffer = require('node:buffer');
var childProcess$1 = require('node:child_process');
var process$4 = require('node:process');
var url = require('node:url');
var os$1 = require('node:os');
var require$$0$6 = require('buffer');
var require$$0$5 = require('stream');
var require$$2 = require('util');
var node_util = require('node:util');
var require$$2$1 = require('node:tty');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var commander$1 = {exports: {}};

var argument = {};

var error$1 = {};

// @ts-check

/**
 * CommanderError class
 * @class
 */
let CommanderError$2 = class CommanderError extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @constructor
   */
  constructor(exitCode, code, message) {
    super(message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
};

/**
 * InvalidArgumentError class
 * @class
 */
let InvalidArgumentError$3 = class InvalidArgumentError extends CommanderError$2 {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   * @constructor
   */
  constructor(message) {
    super(1, 'commander.invalidArgument', message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
};

error$1.CommanderError = CommanderError$2;
error$1.InvalidArgumentError = InvalidArgumentError$3;

const { InvalidArgumentError: InvalidArgumentError$2 } = error$1;

// @ts-check

let Argument$2 = class Argument {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */

  constructor(name, description) {
    this.description = description || '';
    this.variadic = false;
    this.parseArg = undefined;
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.argChoices = undefined;

    switch (name[0]) {
      case '<': // e.g. <required>
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case '[': // e.g. [optional]
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }

  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name;
  }

  /**
   * @api private
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {any} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError$2(`Allowed choices are ${this.argChoices.join(', ')}.`);
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Make argument required.
   */
  argRequired() {
    this.required = true;
    return this;
  }

  /**
   * Make argument optional.
   */
  argOptional() {
    this.required = false;
    return this;
  }
};

/**
 * Takes an argument and returns its human readable equivalent for help usage.
 *
 * @param {Argument} arg
 * @return {string}
 * @api private
 */

function humanReadableArgName$2(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']';
}

argument.Argument = Argument$2;
argument.humanReadableArgName = humanReadableArgName$2;

var command = {};

var help = {};

const { humanReadableArgName: humanReadableArgName$1 } = argument;

/**
 * TypeScript import types for JSDoc, used by Visual Studio Code IntelliSense and `npm run typescript-checkJS`
 * https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types
 * @typedef { import("./argument.js").Argument } Argument
 * @typedef { import("./command.js").Command } Command
 * @typedef { import("./option.js").Option } Option
 */

// @ts-check

// Although this is a class, methods are static in style to allow override using subclass or just functions.
let Help$2 = class Help {
  constructor() {
    this.helpWidth = undefined;
    this.sortSubcommands = false;
    this.sortOptions = false;
    this.showGlobalOptions = false;
  }

  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */

  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter(cmd => !cmd._hidden);
    if (cmd._hasImplicitHelpCommand()) {
      // Create a command matching the implicit help command.
      const [, helpName, helpArgs] = cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
      const helpCommand = cmd.createCommand(helpName)
        .helpOption(false);
      helpCommand.description(cmd._helpCommandDescription);
      if (helpArgs) helpCommand.arguments(helpArgs);
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        // @ts-ignore: overloaded return type
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }

  /**
   * Compare options for sort.
   *
   * @param {Option} a
   * @param {Option} b
   * @returns number
   */
  compareOptions(a, b) {
    const getSortKey = (option) => {
      // WYSIWYG for order displayed in help. Short used for comparison if present. No special handling for negated.
      return option.short ? option.short.replace(/^-/, '') : option.long.replace(/^--/, '');
    };
    return getSortKey(a).localeCompare(getSortKey(b));
  }

  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);
    // Implicit help
    const showShortHelpFlag = cmd._hasHelpOption && cmd._helpShortFlag && !cmd._findOption(cmd._helpShortFlag);
    const showLongHelpFlag = cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
    if (showShortHelpFlag || showLongHelpFlag) {
      let helpOption;
      if (!showShortHelpFlag) {
        helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
      } else if (!showLongHelpFlag) {
        helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
      } else {
        helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
      }
      visibleOptions.push(helpOption);
    }
    if (this.sortOptions) {
      visibleOptions.sort(this.compareOptions);
    }
    return visibleOptions;
  }

  /**
   * Get an array of the visible global options. (Not including help.)
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleGlobalOptions(cmd) {
    if (!this.showGlobalOptions) return [];

    const globalOptions = [];
    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
      const visibleOptions = parentCmd.options.filter((option) => !option.hidden);
      globalOptions.push(...visibleOptions);
    }
    if (this.sortOptions) {
      globalOptions.sort(this.compareOptions);
    }
    return globalOptions;
  }

  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */

  visibleArguments(cmd) {
    // Side effect! Apply the legacy descriptions before the arguments are displayed.
    if (cmd._argsDescription) {
      cmd._args.forEach(argument => {
        argument.description = argument.description || cmd._argsDescription[argument.name()] || '';
      });
    }

    // If there are any arguments with a description then return all the arguments.
    if (cmd._args.find(argument => argument.description)) {
      return cmd._args;
    }
    return [];
  }

  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandTerm(cmd) {
    // Legacy. Ignores custom usage string, and nested commands.
    const args = cmd._args.map(arg => humanReadableArgName$1(arg)).join(' ');
    return cmd._name +
      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
      (cmd.options.length ? ' [options]' : '') + // simplistic check for non-help option
      (args ? ' ' + args : '');
  }

  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */

  optionTerm(option) {
    return option.flags;
  }

  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */

  argumentTerm(argument) {
    return argument.name();
  }

  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(max, helper.subcommandTerm(command).length);
    }, 0);
  }

  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  /**
   * Get the longest global option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestGlobalOptionTermLength(cmd, helper) {
    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(max, helper.argumentTerm(argument).length);
    }, 0);
  }

  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandUsage(cmd) {
    // Usage
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + '|' + cmd._aliases[0];
    }
    let parentCmdNames = '';
    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
      parentCmdNames = parentCmd.name() + ' ' + parentCmdNames;
    }
    return parentCmdNames + cmdName + ' ' + cmd.usage();
  }

  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandDescription(cmd) {
    // @ts-ignore: overloaded return type
    return cmd.description();
  }

  /**
   * Get the subcommand summary to show in the list of subcommands.
   * (Fallback to description for backwards compatibility.)
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandDescription(cmd) {
    // @ts-ignore: overloaded return type
    return cmd.summary() || cmd.description();
  }

  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */

  optionDescription(option) {
    const extraInfo = [];

    if (option.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`);
    }
    if (option.defaultValue !== undefined) {
      // default for boolean and negated more for programmer than end user,
      // but show true/false for boolean option as may be for hand-rolled env or config processing.
      const showDefault = option.required || option.optional ||
        (option.isBoolean() && typeof option.defaultValue === 'boolean');
      if (showDefault) {
        extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
      }
    }
    // preset for boolean and negated are more for programmer than end user
    if (option.presetArg !== undefined && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      return `${option.description} (${extraInfo.join(', ')})`;
    }

    return option.description;
  }

  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */

  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`);
    }
    if (argument.defaultValue !== undefined) {
      extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
    }
    if (extraInfo.length > 0) {
      const extraDescripton = `(${extraInfo.join(', ')})`;
      if (argument.description) {
        return `${argument.description} ${extraDescripton}`;
      }
      return extraDescripton;
    }
    return argument.description;
  }

  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth || 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2; // between term and description
    function formatItem(term, description) {
      if (description) {
        const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
        return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
      }
      return term;
    }
    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    // Usage
    let output = [`Usage: ${helper.commandUsage(cmd)}`, ''];

    // Description
    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([helper.wrap(commandDescription, helpWidth, 0), '']);
    }

    // Arguments
    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
    });
    if (argumentList.length > 0) {
      output = output.concat(['Arguments:', formatList(argumentList), '']);
    }

    // Options
    const optionList = helper.visibleOptions(cmd).map((option) => {
      return formatItem(helper.optionTerm(option), helper.optionDescription(option));
    });
    if (optionList.length > 0) {
      output = output.concat(['Options:', formatList(optionList), '']);
    }

    if (this.showGlobalOptions) {
      const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
        return formatItem(helper.optionTerm(option), helper.optionDescription(option));
      });
      if (globalOptionList.length > 0) {
        output = output.concat(['Global Options:', formatList(globalOptionList), '']);
      }
    }

    // Commands
    const commandList = helper.visibleCommands(cmd).map((cmd) => {
      return formatItem(helper.subcommandTerm(cmd), helper.subcommandDescription(cmd));
    });
    if (commandList.length > 0) {
      output = output.concat(['Commands:', formatList(commandList), '']);
    }

    return output.join('\n');
  }

  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestGlobalOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper)
    );
  }

  /**
   * Wrap the given string to width characters per line, with lines after the first indented.
   * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
   *
   * @param {string} str
   * @param {number} width
   * @param {number} indent
   * @param {number} [minColumnWidth=40]
   * @return {string}
   *
   */

  wrap(str, width, indent, minColumnWidth = 40) {
    // Full \s characters, minus the linefeeds.
    const indents = ' \\f\\t\\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff';
    // Detect manually wrapped and indented strings by searching for line break followed by spaces.
    const manualIndent = new RegExp(`[\\n][${indents}]+`);
    if (str.match(manualIndent)) return str;
    // Do not wrap if not enough room for a wrapped column of text (as could end up with a word per line).
    const columnWidth = width - indent;
    if (columnWidth < minColumnWidth) return str;

    const leadingStr = str.slice(0, indent);
    const columnText = str.slice(indent).replace('\r\n', '\n');
    const indentString = ' '.repeat(indent);
    const zeroWidthSpace = '\u200B';
    const breaks = `\\s${zeroWidthSpace}`;
    // Match line end (so empty lines don't collapse),
    // or as much text as will fit in column, or excess text up to first break.
    const regex = new RegExp(`\n|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`, 'g');
    const lines = columnText.match(regex) || [];
    return leadingStr + lines.map((line, i) => {
      if (line === '\n') return ''; // preserve empty lines
      return ((i > 0) ? indentString : '') + line.trimEnd();
    }).join('\n');
  }
};

help.Help = Help$2;

var option = {};

const { InvalidArgumentError: InvalidArgumentError$1 } = error$1;

// @ts-check

let Option$2 = class Option {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */

  constructor(flags, description) {
    this.flags = flags;
    this.description = description || '';

    this.required = flags.includes('<'); // A value must be supplied when the option is specified.
    this.optional = flags.includes('['); // A value is optional when the option is specified.
    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
    this.variadic = /\w\.\.\.[>\]]$/.test(flags); // The option can take multiple values.
    this.mandatory = false; // The option must have a value after parsing, which usually means it must be specified on command line.
    const optionFlags = splitOptionFlags$1(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith('--no-');
    }
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.presetArg = undefined;
    this.envVar = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
    this.conflictsWith = [];
    this.implied = undefined;
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {any} value
   * @param {string} [description]
   * @return {Option}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
   * The custom processing (parseArg) is called.
   *
   * @example
   * new Option('--color').default('GREYSCALE').preset('RGB');
   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
   *
   * @param {any} arg
   * @return {Option}
   */

  preset(arg) {
    this.presetArg = arg;
    return this;
  }

  /**
   * Add option name(s) that conflict with this option.
   * An error will be displayed if conflicting options are found during parsing.
   *
   * @example
   * new Option('--rgb').conflicts('cmyk');
   * new Option('--js').conflicts(['ts', 'jsx']);
   *
   * @param {string | string[]} names
   * @return {Option}
   */

  conflicts(names) {
    this.conflictsWith = this.conflictsWith.concat(names);
    return this;
  }

  /**
   * Specify implied option values for when this option is set and the implied options are not.
   *
   * The custom processing (parseArg) is not called on the implied values.
   *
   * @example
   * program
   *   .addOption(new Option('--log', 'write logging information to file'))
   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
   *
   * @param {Object} impliedOptionValues
   * @return {Option}
   */
  implies(impliedOptionValues) {
    let newImplied = impliedOptionValues;
    if (typeof impliedOptionValues === 'string') {
      // string is not documented, but easy mistake and we can do what user probably intended.
      newImplied = { [impliedOptionValues]: true };
    }
    this.implied = Object.assign(this.implied || {}, newImplied);
    return this;
  }

  /**
   * Set environment variable to check for option value.
   *
   * An environment variable is only used if when processed the current option value is
   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
   *
   * @param {string} name
   * @return {Option}
   */

  env(name) {
    this.envVar = name;
    return this;
  }

  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */

  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }

  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */

  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }

  /**
   * @api private
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError$1(`Allowed choices are ${this.argChoices.join(', ')}.`);
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Return option name.
   *
   * @return {string}
   */

  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as a object attribute key.
   *
   * @return {string}
   * @api private
   */

  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }

  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @api private
   */

  is(arg) {
    return this.short === arg || this.long === arg;
  }

  /**
   * Return whether a boolean option.
   *
   * Options are one of boolean, negated, required argument, or optional argument.
   *
   * @return {boolean}
   * @api private
   */

  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
};

/**
 * This class is to make it easier to work with dual options, without changing the existing
 * implementation. We support separate dual options for separate positive and negative options,
 * like `--build` and `--no-build`, which share a single option value. This works nicely for some
 * use cases, but is tricky for others where we want separate behaviours despite
 * the single shared option value.
 */
let DualOptions$1 = class DualOptions {
  /**
   * @param {Option[]} options
   */
  constructor(options) {
    this.positiveOptions = new Map();
    this.negativeOptions = new Map();
    this.dualOptions = new Set();
    options.forEach(option => {
      if (option.negate) {
        this.negativeOptions.set(option.attributeName(), option);
      } else {
        this.positiveOptions.set(option.attributeName(), option);
      }
    });
    this.negativeOptions.forEach((value, key) => {
      if (this.positiveOptions.has(key)) {
        this.dualOptions.add(key);
      }
    });
  }

  /**
   * Did the value come from the option, and not from possible matching dual option?
   *
   * @param {any} value
   * @param {Option} option
   * @returns {boolean}
   */
  valueFromOption(value, option) {
    const optionKey = option.attributeName();
    if (!this.dualOptions.has(optionKey)) return true;

    // Use the value to deduce if (probably) came from the option.
    const preset = this.negativeOptions.get(optionKey).presetArg;
    const negativeValue = (preset !== undefined) ? preset : false;
    return option.negate === (negativeValue === value);
  }
};

/**
 * Convert string from kebab-case to camelCase.
 *
 * @param {string} str
 * @return {string}
 * @api private
 */

function camelcase(str) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Split the short and long flag out of something like '-m,--mixed <value>'
 *
 * @api private
 */

function splitOptionFlags$1(flags) {
  let shortFlag;
  let longFlag;
  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1])) shortFlag = flagParts.shift();
  longFlag = flagParts.shift();
  // Add support for lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

option.Option = Option$2;
option.splitOptionFlags = splitOptionFlags$1;
option.DualOptions = DualOptions$1;

var suggestSimilar$2 = {};

const maxDistance = 3;

function editDistance(a, b) {
  // https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance
  // Calculating optimal string alignment distance, no substring is edited more than once.
  // (Simple implementation.)

  // Quick early exit, return worst case.
  if (Math.abs(a.length - b.length) > maxDistance) return Math.max(a.length, b.length);

  // distance between prefix substrings of a and b
  const d = [];

  // pure deletions turn a into empty string
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  // pure insertions turn empty string into b
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  // fill matrix
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      // transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/**
 * Find close matches, restricted to same number of edits.
 *
 * @param {string} word
 * @param {string[]} candidates
 * @returns {string}
 */

function suggestSimilar$1(word, candidates) {
  if (!candidates || candidates.length === 0) return '';
  // remove possible duplicates
  candidates = Array.from(new Set(candidates));

  const searchingOptions = word.startsWith('--');
  if (searchingOptions) {
    word = word.slice(2);
    candidates = candidates.map(candidate => candidate.slice(2));
  }

  let similar = [];
  let bestDistance = maxDistance;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return; // no one character guesses

    const distance = editDistance(word, candidate);
    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        // better edit distance, throw away previous worse matches
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });

  similar.sort((a, b) => a.localeCompare(b));
  if (searchingOptions) {
    similar = similar.map(candidate => `--${candidate}`);
  }

  if (similar.length > 1) {
    return `\n(Did you mean one of ${similar.join(', ')}?)`;
  }
  if (similar.length === 1) {
    return `\n(Did you mean ${similar[0]}?)`;
  }
  return '';
}

suggestSimilar$2.suggestSimilar = suggestSimilar$1;

const EventEmitter = require$$0.EventEmitter;
const childProcess = require$$1;
const path$3 = require$$0$1;
const fs$1 = require$$0$2;
const process$3 = require$$4;

const { Argument: Argument$1, humanReadableArgName } = argument;
const { CommanderError: CommanderError$1 } = error$1;
const { Help: Help$1 } = help;
const { Option: Option$1, splitOptionFlags, DualOptions } = option;
const { suggestSimilar } = suggestSimilar$2;

// @ts-check

let Command$1 = class Command extends EventEmitter {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */

  constructor(name) {
    super();
    /** @type {Command[]} */
    this.commands = [];
    /** @type {Option[]} */
    this.options = [];
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = true;
    /** @type {Argument[]} */
    this._args = [];
    /** @type {string[]} */
    this.args = []; // cli args with options removed
    this.rawArgs = [];
    this.processedArgs = []; // like .args but after custom processing and collecting variadic
    this._scriptPath = null;
    this._name = name || '';
    this._optionValues = {};
    this._optionValueSources = {}; // default, env, cli etc
    this._storeOptionsAsProperties = false;
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null; // custom name for executable
    this._executableDir = null; // custom search directory for subcommands
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = '';
    this._summary = '';
    this._argsDescription = undefined; // legacy
    this._enablePositionalOptions = false;
    this._passThroughOptions = false;
    this._lifeCycleHooks = {}; // a hash of arrays
    /** @type {boolean | string} */
    this._showHelpAfterError = false;
    this._showSuggestionAfterError = true;

    // see .configureOutput() for docs
    this._outputConfiguration = {
      writeOut: (str) => process$3.stdout.write(str),
      writeErr: (str) => process$3.stderr.write(str),
      getOutHelpWidth: () => process$3.stdout.isTTY ? process$3.stdout.columns : undefined,
      getErrHelpWidth: () => process$3.stderr.isTTY ? process$3.stderr.columns : undefined,
      outputError: (str, write) => write(str)
    };

    this._hidden = false;
    this._hasHelpOption = true;
    this._helpFlags = '-h, --help';
    this._helpDescription = 'display help for command';
    this._helpShortFlag = '-h';
    this._helpLongFlag = '--help';
    this._addImplicitHelpCommand = undefined; // Deliberately undefined, not decided whether true or false
    this._helpCommandName = 'help';
    this._helpCommandnameAndArgs = 'help [command]';
    this._helpCommandDescription = 'display help for command';
    this._helpConfiguration = {};
  }

  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} `this` command for chaining
   */
  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration;
    this._hasHelpOption = sourceCommand._hasHelpOption;
    this._helpFlags = sourceCommand._helpFlags;
    this._helpDescription = sourceCommand._helpDescription;
    this._helpShortFlag = sourceCommand._helpShortFlag;
    this._helpLongFlag = sourceCommand._helpLongFlag;
    this._helpCommandName = sourceCommand._helpCommandName;
    this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs;
    this._helpCommandDescription = sourceCommand._helpCommandDescription;
    this._helpConfiguration = sourceCommand._helpConfiguration;
    this._exitCallback = sourceCommand._exitCallback;
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
    this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
    this._allowExcessArguments = sourceCommand._allowExcessArguments;
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
    this._showHelpAfterError = sourceCommand._showHelpAfterError;
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;

    return this;
  }

  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {Object|string} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {Object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */

  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === 'object' && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);

    const cmd = this.createCommand(name);
    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    cmd._hidden = !!(opts.noHelp || opts.hidden); // noHelp is deprecated old name for hidden
    cmd._executableFile = opts.executableFile || null; // Custom name for executable file, set missing to null to match constructor
    if (args) cmd.arguments(args);
    this.commands.push(cmd);
    cmd.parent = this;
    cmd.copyInheritedSettings(this);

    if (desc) return this;
    return cmd;
  }

  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */

  createCommand(name) {
    return new Command(name);
  }

  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */

  createHelp() {
    return Object.assign(new Help$1(), this.configureHelp());
  }

  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {Object} [configuration] - configuration options
   * @return {Command|Object} `this` command for chaining, or stored configuration
   */

  configureHelp(configuration) {
    if (configuration === undefined) return this._helpConfiguration;

    this._helpConfiguration = configuration;
    return this;
  }

  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // functions to change where being written, stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // matching functions to specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // functions based on what is being written out
   *     outputError(str, write) // used for displaying errors, and not used for displaying help
   *
   * @param {Object} [configuration] - configuration options
   * @return {Command|Object} `this` command for chaining, or stored configuration
   */

  configureOutput(configuration) {
    if (configuration === undefined) return this._outputConfiguration;

    Object.assign(this._outputConfiguration, configuration);
    return this;
  }

  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {boolean|string} [displayHelp]
   * @return {Command} `this` command for chaining
   */
  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
  }

  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */
  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion;
    return this;
  }

  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {Object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */

  addCommand(cmd, opts) {
    if (!cmd._name) {
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    }

    opts = opts || {};
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden) cmd._hidden = true; // modifying passed command due to existing implementation

    this.commands.push(cmd);
    cmd.parent = this;
    return this;
  }

  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */

  createArgument(name, description) {
    return new Argument$1(name, description);
  }

  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {Function|*} [fn] - custom argument processing function
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(name, description, fn, defaultValue) {
    const argument = this.createArgument(name, description);
    if (typeof fn === 'function') {
      argument.default(defaultValue).argParser(fn);
    } else {
      argument.default(fn);
    }
    this.addArgument(argument);
    return this;
  }

  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */

  arguments(names) {
    names.split(/ +/).forEach((detail) => {
      this.argument(detail);
    });
    return this;
  }

  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(argument) {
    const previousArgument = this._args.slice(-1)[0];
    if (previousArgument && previousArgument.variadic) {
      throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
    }
    if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
      throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
    }
    this._args.push(argument);
    return this;
  }

  /**
   * Override default decision whether to add implicit help command.
   *
   *    addHelpCommand() // force on
   *    addHelpCommand(false); // force off
   *    addHelpCommand('help [cmd]', 'display help for [cmd]'); // force on with custom details
   *
   * @return {Command} `this` command for chaining
   */

  addHelpCommand(enableOrNameAndArgs, description) {
    if (enableOrNameAndArgs === false) {
      this._addImplicitHelpCommand = false;
    } else {
      this._addImplicitHelpCommand = true;
      if (typeof enableOrNameAndArgs === 'string') {
        this._helpCommandName = enableOrNameAndArgs.split(' ')[0];
        this._helpCommandnameAndArgs = enableOrNameAndArgs;
      }
      this._helpCommandDescription = description || this._helpCommandDescription;
    }
    return this;
  }

  /**
   * @return {boolean}
   * @api private
   */

  _hasImplicitHelpCommand() {
    if (this._addImplicitHelpCommand === undefined) {
      return this.commands.length && !this._actionHandler && !this._findCommand('help');
    }
    return this._addImplicitHelpCommand;
  }

  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */

  hook(event, listener) {
    const allowedValues = ['preSubcommand', 'preAction', 'postAction'];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
  }

  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */

  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = (err) => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err;
        }
      };
    }
    return this;
  }

  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @api private
   */

  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError$1(exitCode, code, message));
      // Expecting this line is not reached.
    }
    process$3.exit(exitCode);
  }

  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */

  action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this._args.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }

  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */

  createOption(flags, description) {
    return new Option$1(flags, description);
  }

  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(option) {
    const oname = option.name();
    const name = option.attributeName();

    // store default value
    if (option.negate) {
      // --no-foo is special and defaults foo to true, unless a --foo option is already defined
      const positiveLongFlag = option.long.replace(/^--no-/, '--');
      if (!this._findOption(positiveLongFlag)) {
        this.setOptionValueWithSource(name, option.defaultValue === undefined ? true : option.defaultValue, 'default');
      }
    } else if (option.defaultValue !== undefined) {
      this.setOptionValueWithSource(name, option.defaultValue, 'default');
    }

    // register the option
    this.options.push(option);

    // handler for cli and env supplied values
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      // val is null for optional option used without an optional-argument.
      // val is undefined for boolean and negated option.
      if (val == null && option.presetArg !== undefined) {
        val = option.presetArg;
      }

      // custom processing
      const oldValue = this.getOptionValue(name);
      if (val !== null && option.parseArg) {
        try {
          val = option.parseArg(val, oldValue);
        } catch (err) {
          if (err.code === 'commander.invalidArgument') {
            const message = `${invalidValueMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      } else if (val !== null && option.variadic) {
        val = option._concatValue(val, oldValue);
      }

      // Fill-in appropriate missing values. Long winded but easy to follow.
      if (val == null) {
        if (option.negate) {
          val = false;
        } else if (option.isBoolean() || option.optional) {
          val = true;
        } else {
          val = ''; // not normal, parseArg might have failed or be a mock function for testing
        }
      }
      this.setOptionValueWithSource(name, val, valueSource);
    };

    this.on('option:' + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
      handleOptionValue(val, invalidValueMessage, 'cli');
    });

    if (option.envVar) {
      this.on('optionEnv:' + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, 'env');
      });
    }

    return this;
  }

  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @api private
   */
  _optionEx(config, flags, description, fn, defaultValue) {
    if (typeof flags === 'object' && flags instanceof Option$1) {
      throw new Error('To add an Option object use addOption() instead of option() or requiredOption()');
    }
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === 'function') {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      // deprecated
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }

    return this.addOption(option);
  }

  /**
   * Define option with `flags`, `description` and optional
   * coercion `fn`.
   *
   * The `flags` string contains the short and/or long flags,
   * separated by comma, a pipe or space. The following are all valid
   * all will output this way when `--help` is used.
   *
   *     "-p, --pepper"
   *     "-p|--pepper"
   *     "-p --pepper"
   *
   * @example
   * // simple boolean defaulting to undefined
   * program.option('-p, --pepper', 'add pepper');
   *
   * program.pepper
   * // => undefined
   *
   * --pepper
   * program.pepper
   * // => true
   *
   * // simple boolean defaulting to true (unless non-negated option is also defined)
   * program.option('-C, --no-cheese', 'remove cheese');
   *
   * program.cheese
   * // => true
   *
   * --no-cheese
   * program.cheese
   * // => false
   *
   * // required argument
   * program.option('-C, --chdir <path>', 'change the working directory');
   *
   * --chdir /tmp
   * program.chdir
   * // => "/tmp"
   *
   * // optional argument
   * program.option('-c, --cheese [type]', 'add cheese [marble]');
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {Function|*} [fn] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  option(flags, description, fn, defaultValue) {
    return this._optionEx({}, flags, description, fn, defaultValue);
  }

  /**
  * Add a required option which must have a value after parsing. This usually means
  * the option must be specified on the command line. (Otherwise the same as .option().)
  *
  * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
  *
  * @param {string} flags
  * @param {string} [description]
  * @param {Function|*} [fn] - custom option processing function or default value
  * @param {*} [defaultValue]
  * @return {Command} `this` command for chaining
  */

  requiredOption(flags, description, fn, defaultValue) {
    return this._optionEx({ mandatory: true }, flags, description, fn, defaultValue);
  }

  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {Boolean} [combine=true] - if `true` or omitted, an optional value can be specified directly after the flag.
   */
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param {Boolean} [allowUnknown=true] - if `true` or omitted, no error will be thrown
   * for unknown options.
   */
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }

  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {Boolean} [allowExcess=true] - if `true` or omitted, no error will be thrown
   * for excess arguments.
   */
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }

  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {Boolean} [positional=true]
   */
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional;
    return this;
  }

  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {Boolean} [passThrough=true]
   * for unknown options.
   */
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough;
    if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
      throw new Error('passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)');
    }
    return this;
  }

  /**
    * Whether to store option values as properties on command object,
    * or store separately (specify false). In both cases the option values can be accessed using .opts().
    *
    * @param {boolean} [storeAsProperties=true]
    * @return {Command} `this` command for chaining
    */

  storeOptionsAsProperties(storeAsProperties = true) {
    this._storeOptionsAsProperties = !!storeAsProperties;
    if (this.options.length) {
      throw new Error('call .storeOptionsAsProperties() before adding options');
    }
    return this;
  }

  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {Object} value
   */

  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }

  /**
   * Store option value.
   *
   * @param {string} key
   * @param {Object} value
   * @return {Command} `this` command for chaining
   */

  setOptionValue(key, value) {
    return this.setOptionValueWithSource(key, value, undefined);
  }

  /**
    * Store option value and where the value came from.
    *
    * @param {string} key
    * @param {Object} value
    * @param {string} source - expected values are default/config/env/cli/implied
    * @return {Command} `this` command for chaining
    */

  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }

  /**
    * Get source of option value.
    * Expected values are default | config | env | cli | implied
    *
    * @param {string} key
    * @return {string}
    */

  getOptionValueSource(key) {
    return this._optionValueSources[key];
  }

  /**
    * Get source of option value. See also .optsWithGlobals().
    * Expected values are default | config | env | cli | implied
    *
    * @param {string} key
    * @return {string}
    */

  getOptionValueSourceWithGlobals(key) {
    // global overwrites local, like optsWithGlobals
    let source;
    getCommandAndParents(this).forEach((cmd) => {
      if (cmd.getOptionValueSource(key) !== undefined) {
        source = cmd.getOptionValueSource(key);
      }
    });
    return source;
  }

  /**
   * Get user arguments from implied or explicit arguments.
   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
   *
   * @api private
   */

  _prepareUserArgs(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    parseOptions = parseOptions || {};

    // Default to using process.argv
    if (argv === undefined) {
      argv = process$3.argv;
      // @ts-ignore: unknown property
      if (process$3.versions && process$3.versions.electron) {
        parseOptions.from = 'electron';
      }
    }
    this.rawArgs = argv.slice();

    // make it a little easier for callers by supporting various argv conventions
    let userArgs;
    switch (parseOptions.from) {
      case undefined:
      case 'node':
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case 'electron':
        // @ts-ignore: unknown property
        if (process$3.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case 'user':
        userArgs = argv.slice(0);
        break;
      default:
        throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
    }

    // Find default name for program from arguments.
    if (!this._name && this._scriptPath) this.nameFromFilename(this._scriptPath);
    this._name = this._name || 'program';

    return userArgs;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * @example
   * program.parse(process.argv);
   * program.parse(); // implicitly use process.argv and auto-detect node vs electron conventions
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {Object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */

  parse(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async. Returns a Promise.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * @example
   * await program.parseAsync(process.argv);
   * await program.parseAsync(); // implicitly use process.argv and auto-detect node vs electron conventions
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {Object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */

  async parseAsync(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    await this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Execute a sub-command executable.
   *
   * @api private
   */

  _executeSubCommand(subcommand, args) {
    args = args.slice();
    let launchWithNode = false; // Use node for source targets so do not need to get permissions correct, and on Windows.
    const sourceExt = ['.js', '.ts', '.tsx', '.mjs', '.cjs'];

    function findFile(baseDir, baseName) {
      // Look for specified file
      const localBin = path$3.resolve(baseDir, baseName);
      if (fs$1.existsSync(localBin)) return localBin;

      // Stop looking if candidate already has an expected extension.
      if (sourceExt.includes(path$3.extname(baseName))) return undefined;

      // Try all the extensions.
      const foundExt = sourceExt.find(ext => fs$1.existsSync(`${localBin}${ext}`));
      if (foundExt) return `${localBin}${foundExt}`;

      return undefined;
    }

    // Not checking for help first. Unlikely to have mandatory and executable, and can't robustly test for help flags in external command.
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // executableFile and executableDir might be full path, or just a name
    let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
    let executableDir = this._executableDir || '';
    if (this._scriptPath) {
      let resolvedScriptPath; // resolve possible symlink for installed npm binary
      try {
        resolvedScriptPath = fs$1.realpathSync(this._scriptPath);
      } catch (err) {
        resolvedScriptPath = this._scriptPath;
      }
      executableDir = path$3.resolve(path$3.dirname(resolvedScriptPath), executableDir);
    }

    // Look for a local file in preference to a command in PATH.
    if (executableDir) {
      let localFile = findFile(executableDir, executableFile);

      // Legacy search using prefix of script name instead of command name
      if (!localFile && !subcommand._executableFile && this._scriptPath) {
        const legacyName = path$3.basename(this._scriptPath, path$3.extname(this._scriptPath));
        if (legacyName !== this._name) {
          localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
        }
      }
      executableFile = localFile || executableFile;
    }

    launchWithNode = sourceExt.includes(path$3.extname(executableFile));

    let proc;
    if (process$3.platform !== 'win32') {
      if (launchWithNode) {
        args.unshift(executableFile);
        // add executable arguments to spawn
        args = incrementNodeInspectorPort(process$3.execArgv).concat(args);

        proc = childProcess.spawn(process$3.argv[0], args, { stdio: 'inherit' });
      } else {
        proc = childProcess.spawn(executableFile, args, { stdio: 'inherit' });
      }
    } else {
      args.unshift(executableFile);
      // add executable arguments to spawn
      args = incrementNodeInspectorPort(process$3.execArgv).concat(args);
      proc = childProcess.spawn(process$3.execPath, args, { stdio: 'inherit' });
    }

    if (!proc.killed) { // testing mainly to avoid leak warnings during unit tests with mocked spawn
      const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
      signals.forEach((signal) => {
        // @ts-ignore
        process$3.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            proc.kill(signal);
          }
        });
      });
    }

    // By default terminate process when spawned process terminates.
    // Suppressing the exit if exitCallback defined is a bit messy and of limited use, but does allow process to stay running!
    const exitCallback = this._exitCallback;
    if (!exitCallback) {
      proc.on('close', process$3.exit.bind(process$3));
    } else {
      proc.on('close', () => {
        exitCallback(new CommanderError$1(process$3.exitCode || 0, 'commander.executeSubCommandAsync', '(close)'));
      });
    }
    proc.on('error', (err) => {
      // @ts-ignore
      if (err.code === 'ENOENT') {
        const executableDirMessage = executableDir
          ? `searched for local subcommand relative to directory '${executableDir}'`
          : 'no directory for search for local subcommand, use .executableDir() to supply a custom directory';
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      // @ts-ignore
      } else if (err.code === 'EACCES') {
        throw new Error(`'${executableFile}' not executable`);
      }
      if (!exitCallback) {
        process$3.exit(1);
      } else {
        const wrappedError = new CommanderError$1(1, 'commander.executeSubCommandAsync', '(error)');
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });

    // Store the reference to the child process
    this.runningCommand = proc;
  }

  /**
   * @api private
   */

  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand) this.help({ error: true });

    let hookResult;
    hookResult = this._chainOrCallSubCommandHook(hookResult, subCommand, 'preSubcommand');
    hookResult = this._chainOrCall(hookResult, () => {
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        return subCommand._parseCommand(operands, unknown);
      }
    });
    return hookResult;
  }

  /**
   * Check this.args against expected this._args.
   *
   * @api private
   */

  _checkNumberOfArguments() {
    // too few
    this._args.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name());
      }
    });
    // too many
    if (this._args.length > 0 && this._args[this._args.length - 1].variadic) {
      return;
    }
    if (this.args.length > this._args.length) {
      this._excessArguments(this.args);
    }
  }

  /**
   * Process this.args using this._args and save as this.processedArgs!
   *
   * @api private
   */

  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      // Extra processing for nice error message on parsing failure.
      let parsedValue = value;
      if (value !== null && argument.parseArg) {
        try {
          parsedValue = argument.parseArg(value, previous);
        } catch (err) {
          if (err.code === 'commander.invalidArgument') {
            const message = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'. ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      return parsedValue;
    };

    this._checkNumberOfArguments();

    const processedArgs = [];
    this._args.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue;
      if (declaredArg.variadic) {
        // Collect together remaining arguments for passing together as an array.
        if (index < this.args.length) {
          value = this.args.slice(index);
          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed);
            }, declaredArg.defaultValue);
          }
        } else if (value === undefined) {
          value = [];
        }
      } else if (index < this.args.length) {
        value = this.args[index];
        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
        }
      }
      processedArgs[index] = value;
    });
    this.processedArgs = processedArgs;
  }

  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {Promise|undefined} promise
   * @param {Function} fn
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCall(promise, fn) {
    // thenable
    if (promise && promise.then && typeof promise.then === 'function') {
      // already have a promise, chain callback
      return promise.then(() => fn());
    }
    // callback might return a promise
    return fn();
  }

  /**
   *
   * @param {Promise|undefined} promise
   * @param {string} event
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCallHooks(promise, event) {
    let result = promise;
    const hooks = [];
    getCommandAndParents(this)
      .reverse()
      .filter(cmd => cmd._lifeCycleHooks[event] !== undefined)
      .forEach(hookedCommand => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
    if (event === 'postAction') {
      hooks.reverse();
    }

    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this);
      });
    });
    return result;
  }

  /**
   *
   * @param {Promise|undefined} promise
   * @param {Command} subCommand
   * @param {string} event
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCallSubCommandHook(promise, subCommand, event) {
    let result = promise;
    if (this._lifeCycleHooks[event] !== undefined) {
      this._lifeCycleHooks[event].forEach((hook) => {
        result = this._chainOrCall(result, () => {
          return hook(this, subCommand);
        });
      });
    }
    return result;
  }

  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @api private
   */

  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    this._parseOptionsEnv(); // after cli, so parseArg not called on both cli and env
    this._parseOptionsImplied();
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);

    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    }
    if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
      if (operands.length === 1) {
        this.help();
      }
      return this._dispatchSubcommand(operands[1], [], [this._helpLongFlag]);
    }
    if (this._defaultCommandName) {
      outputHelpIfRequested(this, unknown); // Run the help for default command from parent rather than passing to default command
      return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
    }
    if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
      // probably missing subcommand and no handler, user needs help (and exit)
      this.help({ error: true });
    }

    outputHelpIfRequested(this, parsed.unknown);
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // We do not always call this check to avoid masking a "better" error, like unknown command.
    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }
    };

    const commandEvent = `command:${this.name()}`;
    if (this._actionHandler) {
      checkForUnknownOptions();
      this._processArguments();

      let actionResult;
      actionResult = this._chainOrCallHooks(actionResult, 'preAction');
      actionResult = this._chainOrCall(actionResult, () => this._actionHandler(this.processedArgs));
      if (this.parent) {
        actionResult = this._chainOrCall(actionResult, () => {
          this.parent.emit(commandEvent, operands, unknown); // legacy
        });
      }
      actionResult = this._chainOrCallHooks(actionResult, 'postAction');
      return actionResult;
    }
    if (this.parent && this.parent.listenerCount(commandEvent)) {
      checkForUnknownOptions();
      this._processArguments();
      this.parent.emit(commandEvent, operands, unknown); // legacy
    } else if (operands.length) {
      if (this._findCommand('*')) { // legacy default command
        return this._dispatchSubcommand('*', operands, unknown);
      }
      if (this.listenerCount('command:*')) {
        // skip option check, emit event for possible misspelling suggestion
        this.emit('command:*', operands, unknown);
      } else if (this.commands.length) {
        this.unknownCommand();
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    } else if (this.commands.length) {
      checkForUnknownOptions();
      // This command has subcommands and nothing hooked up at this level, so display help (and exit).
      this.help({ error: true });
    } else {
      checkForUnknownOptions();
      this._processArguments();
      // fall through for caller to handle after calling .parse()
    }
  }

  /**
   * Find matching command.
   *
   * @api private
   */
  _findCommand(name) {
    if (!name) return undefined;
    return this.commands.find(cmd => cmd._name === name || cmd._aliases.includes(name));
  }

  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @api private
   */

  _findOption(arg) {
    return this.options.find(option => option.is(arg));
  }

  /**
   * Display an error message if a mandatory option does not have a value.
   * Called after checking for help flags in leaf subcommand.
   *
   * @api private
   */

  _checkForMissingMandatoryOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    for (let cmd = this; cmd; cmd = cmd.parent) {
      cmd.options.forEach((anOption) => {
        if (anOption.mandatory && (cmd.getOptionValue(anOption.attributeName()) === undefined)) {
          cmd.missingMandatoryOptionValue(anOption);
        }
      });
    }
  }

  /**
   * Display an error message if conflicting options are used together in this.
   *
   * @api private
   */
  _checkForConflictingLocalOptions() {
    const definedNonDefaultOptions = this.options.filter(
      (option) => {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined) {
          return false;
        }
        return this.getOptionValueSource(optionKey) !== 'default';
      }
    );

    const optionsWithConflicting = definedNonDefaultOptions.filter(
      (option) => option.conflictsWith.length > 0
    );

    optionsWithConflicting.forEach((option) => {
      const conflictingAndDefined = definedNonDefaultOptions.find((defined) =>
        option.conflictsWith.includes(defined.attributeName())
      );
      if (conflictingAndDefined) {
        this._conflictingOption(option, conflictingAndDefined);
      }
    });
  }

  /**
   * Display an error message if conflicting options are used together.
   * Called after checking for help flags in leaf subcommand.
   *
   * @api private
   */
  _checkForConflictingOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    for (let cmd = this; cmd; cmd = cmd.parent) {
      cmd._checkForConflictingLocalOptions();
    }
  }

  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {String[]} argv
   * @return {{operands: String[], unknown: String[]}}
   */

  parseOptions(argv) {
    const operands = []; // operands, not options or values
    const unknown = []; // first unknown option and remaining unknown args
    let dest = operands;
    const args = argv.slice();

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-';
    }

    // parse options
    let activeVariadicOption = null;
    while (args.length) {
      const arg = args.shift();

      // literal
      if (arg === '--') {
        if (dest === unknown) dest.push(arg);
        dest.push(...args);
        break;
      }

      if (activeVariadicOption && !maybeOption(arg)) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;

      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        // recognised option, call listener to assign value with possible custom processing
        if (option) {
          if (option.required) {
            const value = args.shift();
            if (value === undefined) this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            // historical behaviour is optional value is following arg unless an option
            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift();
            }
            this.emit(`option:${option.name()}`, value);
          } else { // boolean flag
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }

      // Look for combo options following single dash, eat first one if known.
      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (option.required || (option.optional && this._combineFlagAndOptionalValue)) {
            // option with value following in same argument
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            // boolean option, emit and put back remainder of arg for further processing
            this.emit(`option:${option.name()}`);
            args.unshift(`-${arg.slice(2)}`);
          }
          continue;
        }
      }

      // Look for known long flag with value, like --foo=bar
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=');
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }

      // Not a recognised option by this command.
      // Might be a command-argument, or subcommand option, or unknown option, or help command or option.

      // An unknown option means further arguments also classified as unknown so can be reprocessed by subcommands.
      if (maybeOption(arg)) {
        dest = unknown;
      }

      // If using positionalOptions, stop processing our options at subcommand.
      if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
        if (this._findCommand(arg)) {
          operands.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        } else if (arg === this._helpCommandName && this._hasImplicitHelpCommand()) {
          operands.push(arg);
          if (args.length > 0) operands.push(...args);
          break;
        } else if (this._defaultCommandName) {
          unknown.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        }
      }

      // If using passThroughOptions, stop processing options at first command-argument.
      if (this._passThroughOptions) {
        dest.push(arg);
        if (args.length > 0) dest.push(...args);
        break;
      }

      // add arg
      dest.push(arg);
    }

    return { operands, unknown };
  }

  /**
   * Return an object containing local option values as key-value pairs.
   *
   * @return {Object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      // Preserve original behaviour so backwards compatible when still using properties
      const result = {};
      const len = this.options.length;

      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] = key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }

    return this._optionValues;
  }

  /**
   * Return an object containing merged local and global option values as key-value pairs.
   *
   * @return {Object}
   */
  optsWithGlobals() {
    // globals overwrite locals
    return getCommandAndParents(this).reduce(
      (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
      {}
    );
  }

  /**
   * Display error message and exit (or call exitOverride).
   *
   * @param {string} message
   * @param {Object} [errorOptions]
   * @param {string} [errorOptions.code] - an id string representing the error
   * @param {number} [errorOptions.exitCode] - used with process.exit
   */
  error(message, errorOptions) {
    // output handling
    this._outputConfiguration.outputError(`${message}\n`, this._outputConfiguration.writeErr);
    if (typeof this._showHelpAfterError === 'string') {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`);
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr('\n');
      this.outputHelp({ error: true });
    }

    // exit handling
    const config = errorOptions || {};
    const exitCode = config.exitCode || 1;
    const code = config.code || 'commander.error';
    this._exit(exitCode, code, message);
  }

  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @api private
   */
  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in process$3.env) {
        const optionKey = option.attributeName();
        // Priority check. Do not overwrite cli or options from unknown source (client-code).
        if (this.getOptionValue(optionKey) === undefined || ['default', 'config', 'env'].includes(this.getOptionValueSource(optionKey))) {
          if (option.required || option.optional) { // option can take a value
            // keep very simple, optional always takes value
            this.emit(`optionEnv:${option.name()}`, process$3.env[option.envVar]);
          } else { // boolean
            // keep very simple, only care that envVar defined and not the value
            this.emit(`optionEnv:${option.name()}`);
          }
        }
      }
    });
  }

  /**
   * Apply any implied option values, if option is undefined or default value.
   *
   * @api private
   */
  _parseOptionsImplied() {
    const dualHelper = new DualOptions(this.options);
    const hasCustomOptionValue = (optionKey) => {
      return this.getOptionValue(optionKey) !== undefined && !['default', 'implied'].includes(this.getOptionValueSource(optionKey));
    };
    this.options
      .filter(option => (option.implied !== undefined) &&
        hasCustomOptionValue(option.attributeName()) &&
        dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option))
      .forEach((option) => {
        Object.keys(option.implied)
          .filter(impliedKey => !hasCustomOptionValue(impliedKey))
          .forEach(impliedKey => {
            this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], 'implied');
          });
      });
  }

  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @api private
   */

  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this.error(message, { code: 'commander.missingArgument' });
  }

  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @api private
   */

  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`;
    this.error(message, { code: 'commander.optionMissingArgument' });
  }

  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @api private
   */

  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this.error(message, { code: 'commander.missingMandatoryOptionValue' });
  }

  /**
   * `Option` conflicts with another option.
   *
   * @param {Option} option
   * @param {Option} conflictingOption
   * @api private
   */
  _conflictingOption(option, conflictingOption) {
    // The calling code does not know whether a negated option is the source of the
    // value, so do some work to take an educated guess.
    const findBestOptionFromValue = (option) => {
      const optionKey = option.attributeName();
      const optionValue = this.getOptionValue(optionKey);
      const negativeOption = this.options.find(target => target.negate && optionKey === target.attributeName());
      const positiveOption = this.options.find(target => !target.negate && optionKey === target.attributeName());
      if (negativeOption && (
        (negativeOption.presetArg === undefined && optionValue === false) ||
        (negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)
      )) {
        return negativeOption;
      }
      return positiveOption || option;
    };

    const getErrorMessage = (option) => {
      const bestOption = findBestOptionFromValue(option);
      const optionKey = bestOption.attributeName();
      const source = this.getOptionValueSource(optionKey);
      if (source === 'env') {
        return `environment variable '${bestOption.envVar}'`;
      }
      return `option '${bestOption.flags}'`;
    };

    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
    this.error(message, { code: 'commander.conflictingOption' });
  }

  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @api private
   */

  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    let suggestion = '';

    if (flag.startsWith('--') && this._showSuggestionAfterError) {
      // Looping to pick up the global options too
      let candidateFlags = [];
      let command = this;
      do {
        const moreFlags = command.createHelp().visibleOptions(command)
          .filter(option => option.long)
          .map(option => option.long);
        candidateFlags = candidateFlags.concat(moreFlags);
        command = command.parent;
      } while (command && !command._enablePositionalOptions);
      suggestion = suggestSimilar(flag, candidateFlags);
    }

    const message = `error: unknown option '${flag}'${suggestion}`;
    this.error(message, { code: 'commander.unknownOption' });
  }

  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @api private
   */

  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return;

    const expected = this._args.length;
    const s = (expected === 1) ? '' : 's';
    const forSubcommand = this.parent ? ` for '${this.name()}'` : '';
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
    this.error(message, { code: 'commander.excessArguments' });
  }

  /**
   * Unknown command.
   *
   * @api private
   */

  unknownCommand() {
    const unknownName = this.args[0];
    let suggestion = '';

    if (this._showSuggestionAfterError) {
      const candidateNames = [];
      this.createHelp().visibleCommands(this).forEach((command) => {
        candidateNames.push(command.name());
        // just visible alias
        if (command.alias()) candidateNames.push(command.alias());
      });
      suggestion = suggestSimilar(unknownName, candidateNames);
    }

    const message = `error: unknown command '${unknownName}'${suggestion}`;
    this.error(message, { code: 'commander.unknownCommand' });
  }

  /**
   * Set the program version to `str`.
   *
   * This method auto-registers the "-V, --version" flag
   * which will print the version number when passed.
   *
   * You can optionally supply the  flags and description to override the defaults.
   *
   * @param {string} str
   * @param {string} [flags]
   * @param {string} [description]
   * @return {this | string} `this` command for chaining, or version string if no arguments
   */

  version(str, flags, description) {
    if (str === undefined) return this._version;
    this._version = str;
    flags = flags || '-V, --version';
    description = description || 'output the version number';
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName();
    this.options.push(versionOption);
    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`);
      this._exit(0, 'commander.version', str);
    });
    return this;
  }

  /**
   * Set the description.
   *
   * @param {string} [str]
   * @param {Object} [argsDescription]
   * @return {string|Command}
   */
  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined) return this._description;
    this._description = str;
    if (argsDescription) {
      this._argsDescription = argsDescription;
    }
    return this;
  }

  /**
   * Set the summary. Used when listed as subcommand of parent.
   *
   * @param {string} [str]
   * @return {string|Command}
   */
  summary(str) {
    if (str === undefined) return this._summary;
    this._summary = str;
    return this;
  }

  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {string|Command}
   */

  alias(alias) {
    if (alias === undefined) return this._aliases[0]; // just return first, for backwards compatibility

    /** @type {Command} */
    let command = this;
    if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
      // assume adding alias for last added executable subcommand, rather than this
      command = this.commands[this.commands.length - 1];
    }

    if (alias === command._name) throw new Error('Command alias can\'t be the same as its name');

    command._aliases.push(alias);
    return this;
  }

  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {string[]|Command}
   */

  aliases(aliases) {
    // Getter for the array of aliases is the main reason for having aliases() in addition to alias().
    if (aliases === undefined) return this._aliases;

    aliases.forEach((alias) => this.alias(alias));
    return this;
  }

  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {String|Command}
   */

  usage(str) {
    if (str === undefined) {
      if (this._usage) return this._usage;

      const args = this._args.map((arg) => {
        return humanReadableArgName(arg);
      });
      return [].concat(
        (this.options.length || this._hasHelpOption ? '[options]' : []),
        (this.commands.length ? '[command]' : []),
        (this._args.length ? args : [])
      ).join(' ');
    }

    this._usage = str;
    return this;
  }

  /**
   * Get or set the name of the command.
   *
   * @param {string} [str]
   * @return {string|Command}
   */

  name(str) {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }

  /**
   * Set the name of the command from script filename, such as process.argv[1],
   * or require.main.filename, or __filename.
   *
   * (Used internally and public although not documented in README.)
   *
   * @example
   * program.nameFromFilename(require.main.filename);
   *
   * @param {string} filename
   * @return {Command}
   */

  nameFromFilename(filename) {
    this._name = path$3.basename(filename, path$3.extname(filename));

    return this;
  }

  /**
   * Get or set the directory for searching for executable subcommands of this command.
   *
   * @example
   * program.executableDir(__dirname);
   * // or
   * program.executableDir('subcommands');
   *
   * @param {string} [path]
   * @return {string|Command}
   */

  executableDir(path) {
    if (path === undefined) return this._executableDir;
    this._executableDir = path;
    return this;
  }

  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */

  helpInformation(contextOptions) {
    const helper = this.createHelp();
    if (helper.helpWidth === undefined) {
      helper.helpWidth = (contextOptions && contextOptions.error) ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
    }
    return helper.formatHelp(this, helper);
  }

  /**
   * @api private
   */

  _getHelpContext(contextOptions) {
    contextOptions = contextOptions || {};
    const context = { error: !!contextOptions.error };
    let write;
    if (context.error) {
      write = (arg) => this._outputConfiguration.writeErr(arg);
    } else {
      write = (arg) => this._outputConfiguration.writeOut(arg);
    }
    context.write = contextOptions.write || write;
    context.command = this;
    return context;
  }

  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === 'function') {
      deprecatedCallback = contextOptions;
      contextOptions = undefined;
    }
    const context = this._getHelpContext(contextOptions);

    getCommandAndParents(this).reverse().forEach(command => command.emit('beforeAllHelp', context));
    this.emit('beforeHelp', context);

    let helpInformation = this.helpInformation(context);
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (typeof helpInformation !== 'string' && !Buffer.isBuffer(helpInformation)) {
        throw new Error('outputHelp callback must return a string or a Buffer');
      }
    }
    context.write(helpInformation);

    this.emit(this._helpLongFlag); // deprecated
    this.emit('afterHelp', context);
    getCommandAndParents(this).forEach(command => command.emit('afterAllHelp', context));
  }

  /**
   * You can pass in flags and a description to override the help
   * flags and help description for your command. Pass in false to
   * disable the built-in help option.
   *
   * @param {string | boolean} [flags]
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */

  helpOption(flags, description) {
    if (typeof flags === 'boolean') {
      this._hasHelpOption = flags;
      return this;
    }
    this._helpFlags = flags || this._helpFlags;
    this._helpDescription = description || this._helpDescription;

    const helpFlags = splitOptionFlags(this._helpFlags);
    this._helpShortFlag = helpFlags.shortFlag;
    this._helpLongFlag = helpFlags.longFlag;

    return this;
  }

  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = process$3.exitCode || 0;
    if (exitCode === 0 && contextOptions && typeof contextOptions !== 'function' && contextOptions.error) {
      exitCode = 1;
    }
    // message: do not have all displayed text available so only passing placeholder.
    this._exit(exitCode, 'commander.help', '(outputHelp)');
  }

  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {string | Function} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */
  addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, (context) => {
      let helpStr;
      if (typeof text === 'function') {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      // Ignore falsy value when nothing to output.
      if (helpStr) {
        context.write(`${helpStr}\n`);
      }
    });
    return this;
  }
};

/**
 * Output help information if help flags specified
 *
 * @param {Command} cmd - command to output help for
 * @param {Array} args - array of options to search for help flags
 * @api private
 */

function outputHelpIfRequested(cmd, args) {
  const helpOption = cmd._hasHelpOption && args.find(arg => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
  if (helpOption) {
    cmd.outputHelp();
    // (Do not have all displayed text available so only passing placeholder.)
    cmd._exit(0, 'commander.helpDisplayed', '(outputHelp)');
  }
}

/**
 * Scan arguments and increment port number for inspect calls (to avoid conflicts when spawning new command).
 *
 * @param {string[]} args - array of arguments from node.execArgv
 * @returns {string[]}
 * @api private
 */

function incrementNodeInspectorPort(args) {
  // Testing for these options:
  //  --inspect[=[host:]port]
  //  --inspect-brk[=[host:]port]
  //  --inspect-port=[host:]port
  return args.map((arg) => {
    if (!arg.startsWith('--inspect')) {
      return arg;
    }
    let debugOption;
    let debugHost = '127.0.0.1';
    let debugPort = '9229';
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      // e.g. --inspect
      debugOption = match[1];
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        // e.g. --inspect=1234
        debugPort = match[3];
      } else {
        // e.g. --inspect=localhost
        debugHost = match[3];
      }
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
      // e.g. --inspect=localhost:1234
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }

    if (debugOption && debugPort !== '0') {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}

/**
 * @param {Command} startCommand
 * @returns {Command[]}
 * @api private
 */

function getCommandAndParents(startCommand) {
  const result = [];
  for (let command = startCommand; command; command = command.parent) {
    result.push(command);
  }
  return result;
}

command.Command = Command$1;

(function (module, exports) {
	const { Argument } = argument;
	const { Command } = command;
	const { CommanderError, InvalidArgumentError } = error$1;
	const { Help } = help;
	const { Option } = option;

	// @ts-check

	/**
	 * Expose the root command.
	 */

	exports = module.exports = new Command();
	exports.program = exports; // More explicit access to global command.
	// Implicit export of createArgument, createCommand, and createOption.

	/**
	 * Expose classes
	 */

	exports.Argument = Argument;
	exports.Command = Command;
	exports.CommanderError = CommanderError;
	exports.Help = Help;
	exports.InvalidArgumentError = InvalidArgumentError;
	exports.InvalidOptionArgumentError = InvalidArgumentError; // Deprecated
	exports.Option = Option; 
} (commander$1, commander$1.exports));

var commanderExports = commander$1.exports;
var commander = /*@__PURE__*/getDefaultExportFromCjs(commanderExports);

// wrapper to provide named exports for ESM.
const {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError, // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = commander;

var utils$1 = {};

var ansiColors = {exports: {}};

var symbols = {exports: {}};

var hasRequiredSymbols$1;

function requireSymbols$1 () {
	if (hasRequiredSymbols$1) return symbols.exports;
	hasRequiredSymbols$1 = 1;
	(function (module) {

		const isHyper = typeof process !== 'undefined' && process.env.TERM_PROGRAM === 'Hyper';
		const isWindows = typeof process !== 'undefined' && process.platform === 'win32';
		const isLinux = typeof process !== 'undefined' && process.platform === 'linux';

		const common = {
		  ballotDisabled: '☒',
		  ballotOff: '☐',
		  ballotOn: '☑',
		  bullet: '•',
		  bulletWhite: '◦',
		  fullBlock: '█',
		  heart: '❤',
		  identicalTo: '≡',
		  line: '─',
		  mark: '※',
		  middot: '·',
		  minus: '－',
		  multiplication: '×',
		  obelus: '÷',
		  pencilDownRight: '✎',
		  pencilRight: '✏',
		  pencilUpRight: '✐',
		  percent: '%',
		  pilcrow2: '❡',
		  pilcrow: '¶',
		  plusMinus: '±',
		  question: '?',
		  section: '§',
		  starsOff: '☆',
		  starsOn: '★',
		  upDownArrow: '↕'
		};

		const windows = Object.assign({}, common, {
		  check: '√',
		  cross: '×',
		  ellipsisLarge: '...',
		  ellipsis: '...',
		  info: 'i',
		  questionSmall: '?',
		  pointer: '>',
		  pointerSmall: '»',
		  radioOff: '( )',
		  radioOn: '(*)',
		  warning: '‼'
		});

		const other = Object.assign({}, common, {
		  ballotCross: '✘',
		  check: '✔',
		  cross: '✖',
		  ellipsisLarge: '⋯',
		  ellipsis: '…',
		  info: 'ℹ',
		  questionFull: '？',
		  questionSmall: '﹖',
		  pointer: isLinux ? '▸' : '❯',
		  pointerSmall: isLinux ? '‣' : '›',
		  radioOff: '◯',
		  radioOn: '◉',
		  warning: '⚠'
		});

		module.exports = (isWindows && !isHyper) ? windows : other;
		Reflect.defineProperty(module.exports, 'common', { enumerable: false, value: common });
		Reflect.defineProperty(module.exports, 'windows', { enumerable: false, value: windows });
		Reflect.defineProperty(module.exports, 'other', { enumerable: false, value: other }); 
	} (symbols));
	return symbols.exports;
}

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

/* eslint-disable no-control-regex */
// this is a modified version of https://github.com/chalk/ansi-regex (MIT License)
const ANSI_REGEX = /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const hasColor = () => {
  if (typeof process !== 'undefined') {
    return process.env.FORCE_COLOR !== '0';
  }
  return false;
};

const create = () => {
  const colors = {
    enabled: hasColor(),
    visible: true,
    styles: {},
    keys: {}
  };

  const ansi = style => {
    let open = style.open = `\u001b[${style.codes[0]}m`;
    let close = style.close = `\u001b[${style.codes[1]}m`;
    let regex = style.regex = new RegExp(`\\u001b\\[${style.codes[1]}m`, 'g');
    style.wrap = (input, newline) => {
      if (input.includes(close)) input = input.replace(regex, close + open);
      let output = open + input + close;
      // see https://github.com/chalk/chalk/pull/92, thanks to the
      // chalk contributors for this fix. However, we've confirmed that
      // this issue is also present in Windows terminals
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    return style;
  };

  const wrap = (style, input, newline) => {
    return typeof style === 'function' ? style(input) : style.wrap(input, newline);
  };

  const style = (input, stack) => {
    if (input === '' || input == null) return '';
    if (colors.enabled === false) return input;
    if (colors.visible === false) return '';
    let str = '' + input;
    let nl = str.includes('\n');
    let n = stack.length;
    if (n > 0 && stack.includes('unstyle')) {
      stack = [...new Set(['unstyle', ...stack])].reverse();
    }
    while (n-- > 0) str = wrap(colors.styles[stack[n]], str, nl);
    return str;
  };

  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes });
    let keys = colors.keys[type] || (colors.keys[type] = []);
    keys.push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        let color = input => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });
  };

  define('reset', [0, 0], 'modifier');
  define('bold', [1, 22], 'modifier');
  define('dim', [2, 22], 'modifier');
  define('italic', [3, 23], 'modifier');
  define('underline', [4, 24], 'modifier');
  define('inverse', [7, 27], 'modifier');
  define('hidden', [8, 28], 'modifier');
  define('strikethrough', [9, 29], 'modifier');

  define('black', [30, 39], 'color');
  define('red', [31, 39], 'color');
  define('green', [32, 39], 'color');
  define('yellow', [33, 39], 'color');
  define('blue', [34, 39], 'color');
  define('magenta', [35, 39], 'color');
  define('cyan', [36, 39], 'color');
  define('white', [37, 39], 'color');
  define('gray', [90, 39], 'color');
  define('grey', [90, 39], 'color');

  define('bgBlack', [40, 49], 'bg');
  define('bgRed', [41, 49], 'bg');
  define('bgGreen', [42, 49], 'bg');
  define('bgYellow', [43, 49], 'bg');
  define('bgBlue', [44, 49], 'bg');
  define('bgMagenta', [45, 49], 'bg');
  define('bgCyan', [46, 49], 'bg');
  define('bgWhite', [47, 49], 'bg');

  define('blackBright', [90, 39], 'bright');
  define('redBright', [91, 39], 'bright');
  define('greenBright', [92, 39], 'bright');
  define('yellowBright', [93, 39], 'bright');
  define('blueBright', [94, 39], 'bright');
  define('magentaBright', [95, 39], 'bright');
  define('cyanBright', [96, 39], 'bright');
  define('whiteBright', [97, 39], 'bright');

  define('bgBlackBright', [100, 49], 'bgBright');
  define('bgRedBright', [101, 49], 'bgBright');
  define('bgGreenBright', [102, 49], 'bgBright');
  define('bgYellowBright', [103, 49], 'bgBright');
  define('bgBlueBright', [104, 49], 'bgBright');
  define('bgMagentaBright', [105, 49], 'bgBright');
  define('bgCyanBright', [106, 49], 'bgBright');
  define('bgWhiteBright', [107, 49], 'bgBright');

  colors.ansiRegex = ANSI_REGEX;
  colors.hasColor = colors.hasAnsi = str => {
    colors.ansiRegex.lastIndex = 0;
    return typeof str === 'string' && str !== '' && colors.ansiRegex.test(str);
  };

  colors.alias = (name, color) => {
    let fn = typeof color === 'string' ? colors[color] : color;

    if (typeof fn !== 'function') {
      throw new TypeError('Expected alias to be the name of an existing color (string) or a function');
    }

    if (!fn.stack) {
      Reflect.defineProperty(fn, 'name', { value: name });
      colors.styles[name] = fn;
      fn.stack = [name];
    }

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        let color = input => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return color;
      }
    });
  };

  colors.theme = custom => {
    if (!isObject(custom)) throw new TypeError('Expected theme to be an object');
    for (let name of Object.keys(custom)) {
      colors.alias(name, custom[name]);
    }
    return colors;
  };

  colors.alias('unstyle', str => {
    if (typeof str === 'string' && str !== '') {
      colors.ansiRegex.lastIndex = 0;
      return str.replace(colors.ansiRegex, '');
    }
    return '';
  });

  colors.alias('noop', str => str);
  colors.none = colors.clear = colors.noop;

  colors.stripColor = colors.unstyle;
  colors.symbols = requireSymbols$1();
  colors.define = define;
  return colors;
};

ansiColors.exports = create();
ansiColors.exports.create = create;

var ansiColorsExports = ansiColors.exports;

(function (exports) {

	const toString = Object.prototype.toString;
	const colors = ansiColorsExports;
	let called = false;
	let fns = [];

	const complements = {
	  'yellow': 'blue',
	  'cyan': 'red',
	  'green': 'magenta',
	  'black': 'white',
	  'blue': 'yellow',
	  'red': 'cyan',
	  'magenta': 'green',
	  'white': 'black'
	};

	exports.longest = (arr, prop) => {
	  return arr.reduce((a, v) => Math.max(a, prop ? v[prop].length : v.length), 0);
	};

	exports.hasColor = str => !!str && colors.hasColor(str);

	const isObject = exports.isObject = val => {
	  return val !== null && typeof val === 'object' && !Array.isArray(val);
	};

	exports.nativeType = val => {
	  return toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, '');
	};

	exports.isAsyncFn = val => {
	  return exports.nativeType(val) === 'asyncfunction';
	};

	exports.isPrimitive = val => {
	  return val != null && typeof val !== 'object' && typeof val !== 'function';
	};

	exports.resolve = (context, value, ...rest) => {
	  if (typeof value === 'function') {
	    return value.call(context, ...rest);
	  }
	  return value;
	};

	exports.scrollDown = (choices = []) => [...choices.slice(1), choices[0]];
	exports.scrollUp = (choices = []) => [choices.pop(), ...choices];

	exports.reorder = (arr = []) => {
	  let res = arr.slice();
	  res.sort((a, b) => {
	    if (a.index > b.index) return 1;
	    if (a.index < b.index) return -1;
	    return 0;
	  });
	  return res;
	};

	exports.swap = (arr, index, pos) => {
	  let len = arr.length;
	  let idx = pos === len ? 0 : pos < 0 ? len - 1 : pos;
	  let choice = arr[index];
	  arr[index] = arr[idx];
	  arr[idx] = choice;
	};

	exports.width = (stream, fallback = 80) => {
	  let columns = (stream && stream.columns) ? stream.columns : fallback;
	  if (stream && typeof stream.getWindowSize === 'function') {
	    columns = stream.getWindowSize()[0];
	  }
	  if (process.platform === 'win32') {
	    return columns - 1;
	  }
	  return columns;
	};

	exports.height = (stream, fallback = 20) => {
	  let rows = (stream && stream.rows) ? stream.rows : fallback;
	  if (stream && typeof stream.getWindowSize === 'function') {
	    rows = stream.getWindowSize()[1];
	  }
	  return rows;
	};

	exports.wordWrap = (str, options = {}) => {
	  if (!str) return str;

	  if (typeof options === 'number') {
	    options = { width: options };
	  }

	  let { indent = '', newline = ('\n' + indent), width = 80 } = options;
	  let spaces = (newline + indent).match(/[^\S\n]/g) || [];
	  width -= spaces.length;
	  let source = `.{1,${width}}([\\s\\u200B]+|$)|[^\\s\\u200B]+?([\\s\\u200B]+|$)`;
	  let output = str.trim();
	  let regex = new RegExp(source, 'g');
	  let lines = output.match(regex) || [];
	  lines = lines.map(line => line.replace(/\n$/, ''));
	  if (options.padEnd) lines = lines.map(line => line.padEnd(width, ' '));
	  if (options.padStart) lines = lines.map(line => line.padStart(width, ' '));
	  return indent + lines.join(newline);
	};

	exports.unmute = color => {
	  let name = color.stack.find(n => colors.keys.color.includes(n));
	  if (name) {
	    return colors[name];
	  }
	  let bg = color.stack.find(n => n.slice(2) === 'bg');
	  if (bg) {
	    return colors[name.slice(2)];
	  }
	  return str => str;
	};

	exports.pascal = str => str ? str[0].toUpperCase() + str.slice(1) : '';

	exports.inverse = color => {
	  if (!color || !color.stack) return color;
	  let name = color.stack.find(n => colors.keys.color.includes(n));
	  if (name) {
	    let col = colors['bg' + exports.pascal(name)];
	    return col ? col.black : color;
	  }
	  let bg = color.stack.find(n => n.slice(0, 2) === 'bg');
	  if (bg) {
	    return colors[bg.slice(2).toLowerCase()] || color;
	  }
	  return colors.none;
	};

	exports.complement = color => {
	  if (!color || !color.stack) return color;
	  let name = color.stack.find(n => colors.keys.color.includes(n));
	  let bg = color.stack.find(n => n.slice(0, 2) === 'bg');
	  if (name && !bg) {
	    return colors[complements[name] || name];
	  }
	  if (bg) {
	    let lower = bg.slice(2).toLowerCase();
	    let comp = complements[lower];
	    if (!comp) return color;
	    return colors['bg' + exports.pascal(comp)] || color;
	  }
	  return colors.none;
	};

	exports.meridiem = date => {
	  let hours = date.getHours();
	  let minutes = date.getMinutes();
	  let ampm = hours >= 12 ? 'pm' : 'am';
	  hours = hours % 12;
	  let hrs = hours === 0 ? 12 : hours;
	  let min = minutes < 10 ? '0' + minutes : minutes;
	  return hrs + ':' + min + ' ' + ampm;
	};

	/**
	 * Set a value on the given object.
	 * @param {Object} obj
	 * @param {String} prop
	 * @param {any} value
	 */

	exports.set = (obj = {}, prop = '', val) => {
	  return prop.split('.').reduce((acc, k, i, arr) => {
	    let value = arr.length - 1 > i ? (acc[k] || {}) : val;
	    if (!exports.isObject(value) && i < arr.length - 1) value = {};
	    return (acc[k] = value);
	  }, obj);
	};

	/**
	 * Get a value from the given object.
	 * @param {Object} obj
	 * @param {String} prop
	 */

	exports.get = (obj = {}, prop = '', fallback) => {
	  let value = obj[prop] == null
	    ? prop.split('.').reduce((acc, k) => acc && acc[k], obj)
	    : obj[prop];
	  return value == null ? fallback : value;
	};

	exports.mixin = (target, b) => {
	  if (!isObject(target)) return b;
	  if (!isObject(b)) return target;
	  for (let key of Object.keys(b)) {
	    let desc = Object.getOwnPropertyDescriptor(b, key);
	    if (desc.hasOwnProperty('value')) {
	      if (target.hasOwnProperty(key) && isObject(desc.value)) {
	        let existing = Object.getOwnPropertyDescriptor(target, key);
	        if (isObject(existing.value)) {
	          target[key] = exports.merge({}, target[key], b[key]);
	        } else {
	          Reflect.defineProperty(target, key, desc);
	        }
	      } else {
	        Reflect.defineProperty(target, key, desc);
	      }
	    } else {
	      Reflect.defineProperty(target, key, desc);
	    }
	  }
	  return target;
	};

	exports.merge = (...args) => {
	  let target = {};
	  for (let ele of args) exports.mixin(target, ele);
	  return target;
	};

	exports.mixinEmitter = (obj, emitter) => {
	  let proto = emitter.constructor.prototype;
	  for (let key of Object.keys(proto)) {
	    let val = proto[key];
	    if (typeof val === 'function') {
	      exports.define(obj, key, val.bind(emitter));
	    } else {
	      exports.define(obj, key, val);
	    }
	  }
	};

	exports.onExit = callback => {
	  const onExit = (quit, code) => {
	    if (called) return;

	    called = true;
	    fns.forEach(fn => fn());

	    if (quit === true) {
	      process.exit(128 + code);
	    }
	  };

	  if (fns.length === 0) {
	    process.once('SIGTERM', onExit.bind(null, true, 15));
	    process.once('SIGINT', onExit.bind(null, true, 2));
	    process.once('exit', onExit);
	  }

	  fns.push(callback);
	};

	exports.define = (obj, key, value) => {
	  Reflect.defineProperty(obj, key, { value });
	};

	exports.defineExport = (obj, key, fn) => {
	  let custom;
	  Reflect.defineProperty(obj, key, {
	    enumerable: true,
	    configurable: true,
	    set(val) {
	      custom = val;
	    },
	    get() {
	      return custom ? custom() : fn();
	    }
	  });
	}; 
} (utils$1));

var combos = {};

var hasRequiredCombos;

function requireCombos () {
	if (hasRequiredCombos) return combos;
	hasRequiredCombos = 1;

	/**
	 * Actions are mappings from keypress event names to method names
	 * in the prompts.
	 */

	combos.ctrl = {
	  a: 'first',
	  b: 'backward',
	  c: 'cancel',
	  d: 'deleteForward',
	  e: 'last',
	  f: 'forward',
	  g: 'reset',
	  i: 'tab',
	  k: 'cutForward',
	  l: 'reset',
	  n: 'newItem',
	  m: 'cancel',
	  j: 'submit',
	  p: 'search',
	  r: 'remove',
	  s: 'save',
	  u: 'undo',
	  w: 'cutLeft',
	  x: 'toggleCursor',
	  v: 'paste'
	};

	combos.shift = {
	  up: 'shiftUp',
	  down: 'shiftDown',
	  left: 'shiftLeft',
	  right: 'shiftRight',
	  tab: 'prev'
	};

	combos.fn = {
	  up: 'pageUp',
	  down: 'pageDown',
	  left: 'pageLeft',
	  right: 'pageRight',
	  delete: 'deleteForward'
	};

	// <alt> on Windows
	combos.option = {
	  b: 'backward',
	  f: 'forward',
	  d: 'cutRight',
	  left: 'cutLeft',
	  up: 'altUp',
	  down: 'altDown'
	};

	combos.keys = {
	  pageup: 'pageUp', // <fn>+<up> (mac), <Page Up> (windows)
	  pagedown: 'pageDown', // <fn>+<down> (mac), <Page Down> (windows)
	  home: 'home', // <fn>+<left> (mac), <home> (windows)
	  end: 'end', // <fn>+<right> (mac), <end> (windows)
	  cancel: 'cancel',
	  delete: 'deleteForward',
	  backspace: 'delete',
	  down: 'down',
	  enter: 'submit',
	  escape: 'cancel',
	  left: 'left',
	  space: 'space',
	  number: 'number',
	  return: 'submit',
	  right: 'right',
	  tab: 'next',
	  up: 'up'
	};
	return combos;
}

var keypress_1;
var hasRequiredKeypress;

function requireKeypress () {
	if (hasRequiredKeypress) return keypress_1;
	hasRequiredKeypress = 1;

	const readline = require$$0$3;
	const combos = requireCombos();

	/* eslint-disable no-control-regex */
	const metaKeyCodeRe = /^(?:\x1b)([a-zA-Z0-9])$/;
	const fnKeyRe = /^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/;
	const keyName = {
	    /* xterm/gnome ESC O letter */
	    'OP': 'f1',
	    'OQ': 'f2',
	    'OR': 'f3',
	    'OS': 'f4',
	    /* xterm/rxvt ESC [ number ~ */
	    '[11~': 'f1',
	    '[12~': 'f2',
	    '[13~': 'f3',
	    '[14~': 'f4',
	    /* from Cygwin and used in libuv */
	    '[[A': 'f1',
	    '[[B': 'f2',
	    '[[C': 'f3',
	    '[[D': 'f4',
	    '[[E': 'f5',
	    /* common */
	    '[15~': 'f5',
	    '[17~': 'f6',
	    '[18~': 'f7',
	    '[19~': 'f8',
	    '[20~': 'f9',
	    '[21~': 'f10',
	    '[23~': 'f11',
	    '[24~': 'f12',
	    /* xterm ESC [ letter */
	    '[A': 'up',
	    '[B': 'down',
	    '[C': 'right',
	    '[D': 'left',
	    '[E': 'clear',
	    '[F': 'end',
	    '[H': 'home',
	    /* xterm/gnome ESC O letter */
	    'OA': 'up',
	    'OB': 'down',
	    'OC': 'right',
	    'OD': 'left',
	    'OE': 'clear',
	    'OF': 'end',
	    'OH': 'home',
	    /* xterm/rxvt ESC [ number ~ */
	    '[1~': 'home',
	    '[2~': 'insert',
	    '[3~': 'delete',
	    '[4~': 'end',
	    '[5~': 'pageup',
	    '[6~': 'pagedown',
	    /* putty */
	    '[[5~': 'pageup',
	    '[[6~': 'pagedown',
	    /* rxvt */
	    '[7~': 'home',
	    '[8~': 'end',
	    /* rxvt keys with modifiers */
	    '[a': 'up',
	    '[b': 'down',
	    '[c': 'right',
	    '[d': 'left',
	    '[e': 'clear',

	    '[2$': 'insert',
	    '[3$': 'delete',
	    '[5$': 'pageup',
	    '[6$': 'pagedown',
	    '[7$': 'home',
	    '[8$': 'end',

	    'Oa': 'up',
	    'Ob': 'down',
	    'Oc': 'right',
	    'Od': 'left',
	    'Oe': 'clear',

	    '[2^': 'insert',
	    '[3^': 'delete',
	    '[5^': 'pageup',
	    '[6^': 'pagedown',
	    '[7^': 'home',
	    '[8^': 'end',
	    /* misc. */
	    '[Z': 'tab',
	};

	function isShiftKey(code) {
	    return ['[a', '[b', '[c', '[d', '[e', '[2$', '[3$', '[5$', '[6$', '[7$', '[8$', '[Z'].includes(code)
	}

	function isCtrlKey(code) {
	    return [ 'Oa', 'Ob', 'Oc', 'Od', 'Oe', '[2^', '[3^', '[5^', '[6^', '[7^', '[8^'].includes(code)
	}

	const keypress = (s = '', event = {}) => {
	  let parts;
	  let key = {
	    name: event.name,
	    ctrl: false,
	    meta: false,
	    shift: false,
	    option: false,
	    sequence: s,
	    raw: s,
	    ...event
	  };

	  if (Buffer.isBuffer(s)) {
	    if (s[0] > 127 && s[1] === void 0) {
	      s[0] -= 128;
	      s = '\x1b' + String(s);
	    } else {
	      s = String(s);
	    }
	  } else if (s !== void 0 && typeof s !== 'string') {
	    s = String(s);
	  } else if (!s) {
	    s = key.sequence || '';
	  }

	  key.sequence = key.sequence || s || key.name;

	  if (s === '\r') {
	    // carriage return
	    key.raw = void 0;
	    key.name = 'return';
	  } else if (s === '\n') {
	    // enter, should have been called linefeed
	    key.name = 'enter';
	  } else if (s === '\t') {
	    // tab
	    key.name = 'tab';
	  } else if (s === '\b' || s === '\x7f' || s === '\x1b\x7f' || s === '\x1b\b') {
	    // backspace or ctrl+h
	    key.name = 'backspace';
	    key.meta = s.charAt(0) === '\x1b';
	  } else if (s === '\x1b' || s === '\x1b\x1b') {
	    // escape key
	    key.name = 'escape';
	    key.meta = s.length === 2;
	  } else if (s === ' ' || s === '\x1b ') {
	    key.name = 'space';
	    key.meta = s.length === 2;
	  } else if (s <= '\x1a') {
	    // ctrl+letter
	    key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
	    key.ctrl = true;
	  } else if (s.length === 1 && s >= '0' && s <= '9') {
	    // number
	    key.name = 'number';
	  } else if (s.length === 1 && s >= 'a' && s <= 'z') {
	    // lowercase letter
	    key.name = s;
	  } else if (s.length === 1 && s >= 'A' && s <= 'Z') {
	    // shift+letter
	    key.name = s.toLowerCase();
	    key.shift = true;
	  } else if ((parts = metaKeyCodeRe.exec(s))) {
	    // meta+character key
	    key.meta = true;
	    key.shift = /^[A-Z]$/.test(parts[1]);
	  } else if ((parts = fnKeyRe.exec(s))) {
	    let segs = [...s];

	    if (segs[0] === '\u001b' && segs[1] === '\u001b') {
	      key.option = true;
	    }

	    // ansi escape sequence
	    // reassemble the key code leaving out leading \x1b's,
	    // the modifier key bitflag and any meaningless "1;" sequence
	    let code = [parts[1], parts[2], parts[4], parts[6]].filter(Boolean).join('');
	    let modifier = (parts[3] || parts[5] || 1) - 1;

	    // Parse the key modifier
	    key.ctrl = !!(modifier & 4);
	    key.meta = !!(modifier & 10);
	    key.shift = !!(modifier & 1);
	    key.code = code;

	    key.name = keyName[code];
	    key.shift = isShiftKey(code) || key.shift;
	    key.ctrl = isCtrlKey(code) || key.ctrl;
	  }
	  return key;
	};

	keypress.listen = (options = {}, onKeypress) => {
	  let { stdin } = options;

	  if (!stdin || (stdin !== process.stdin && !stdin.isTTY)) {
	    throw new Error('Invalid stream passed');
	  }

	  let rl = readline.createInterface({ terminal: true, input: stdin });
	  readline.emitKeypressEvents(stdin, rl);

	  let on = (buf, key) => onKeypress(buf, keypress(buf, key), rl);
	  let isRaw = stdin.isRaw;

	  if (stdin.isTTY) stdin.setRawMode(true);
	  stdin.on('keypress', on);
	  rl.resume();

	  let off = () => {
	    if (stdin.isTTY) stdin.setRawMode(isRaw);
	    stdin.removeListener('keypress', on);
	    rl.pause();
	    rl.close();
	  };

	  return off;
	};

	keypress.action = (buf, key, customActions) => {
	  let obj = { ...combos, ...customActions };
	  if (key.ctrl) {
	    key.action = obj.ctrl[key.name];
	    return key;
	  }

	  if (key.option && obj.option) {
	    key.action = obj.option[key.name];
	    return key;
	  }

	  if (key.shift) {
	    key.action = obj.shift[key.name];
	    return key;
	  }

	  key.action = obj.keys[key.name];
	  return key;
	};

	keypress_1 = keypress;
	return keypress_1;
}

var timer;
var hasRequiredTimer;

function requireTimer () {
	if (hasRequiredTimer) return timer;
	hasRequiredTimer = 1;

	timer = prompt => {
	  prompt.timers = prompt.timers || {};

	  let timers = prompt.options.timers;
	  if (!timers) return;

	  for (let key of Object.keys(timers)) {
	    let opts = timers[key];
	    if (typeof opts === 'number') {
	      opts = { interval: opts };
	    }
	    create(prompt, key, opts);
	  }
	};

	function create(prompt, name, options = {}) {
	  let timer = prompt.timers[name] = { name, start: Date.now(), ms: 0, tick: 0 };
	  let ms = options.interval || 120;
	  timer.frames = options.frames || [];
	  timer.loading = true;

	  let interval = setInterval(() => {
	    timer.ms = Date.now() - timer.start;
	    timer.tick++;
	    prompt.render();
	  }, ms);

	  timer.stop = () => {
	    timer.loading = false;
	    clearInterval(interval);
	  };

	  Reflect.defineProperty(timer, 'interval', { value: interval });
	  prompt.once('close', () => timer.stop());
	  return timer.stop;
	}
	return timer;
}

var state;
var hasRequiredState;

function requireState () {
	if (hasRequiredState) return state;
	hasRequiredState = 1;

	const { define, width } = utils$1;

	class State {
	  constructor(prompt) {
	    let options = prompt.options;
	    define(this, '_prompt', prompt);
	    this.type = prompt.type;
	    this.name = prompt.name;
	    this.message = '';
	    this.header = '';
	    this.footer = '';
	    this.error = '';
	    this.hint = '';
	    this.input = '';
	    this.cursor = 0;
	    this.index = 0;
	    this.lines = 0;
	    this.tick = 0;
	    this.prompt = '';
	    this.buffer = '';
	    this.width = width(options.stdout || process.stdout);
	    Object.assign(this, options);
	    this.name = this.name || this.message;
	    this.message = this.message || this.name;
	    this.symbols = prompt.symbols;
	    this.styles = prompt.styles;
	    this.required = new Set();
	    this.cancelled = false;
	    this.submitted = false;
	  }

	  clone() {
	    let state = { ...this };
	    state.status = this.status;
	    state.buffer = Buffer.from(state.buffer);
	    delete state.clone;
	    return state;
	  }

	  set color(val) {
	    this._color = val;
	  }
	  get color() {
	    let styles = this.prompt.styles;
	    if (this.cancelled) return styles.cancelled;
	    if (this.submitted) return styles.submitted;
	    let color = this._color || styles[this.status];
	    return typeof color === 'function' ? color : styles.pending;
	  }

	  set loading(value) {
	    this._loading = value;
	  }
	  get loading() {
	    if (typeof this._loading === 'boolean') return this._loading;
	    if (this.loadingChoices) return 'choices';
	    return false;
	  }

	  get status() {
	    if (this.cancelled) return 'cancelled';
	    if (this.submitted) return 'submitted';
	    return 'pending';
	  }
	}

	state = State;
	return state;
}

var styles_1;
var hasRequiredStyles;

function requireStyles () {
	if (hasRequiredStyles) return styles_1;
	hasRequiredStyles = 1;

	const utils = utils$1;
	const colors = ansiColorsExports;

	const styles = {
	  default: colors.noop,
	  noop: colors.noop,

	  /**
	   * Modifiers
	   */

	  set inverse(custom) {
	    this._inverse = custom;
	  },
	  get inverse() {
	    return this._inverse || utils.inverse(this.primary);
	  },

	  set complement(custom) {
	    this._complement = custom;
	  },
	  get complement() {
	    return this._complement || utils.complement(this.primary);
	  },

	  /**
	   * Main color
	   */

	  primary: colors.cyan,

	  /**
	   * Main palette
	   */

	  success: colors.green,
	  danger: colors.magenta,
	  strong: colors.bold,
	  warning: colors.yellow,
	  muted: colors.dim,
	  disabled: colors.gray,
	  dark: colors.dim.gray,
	  underline: colors.underline,

	  set info(custom) {
	    this._info = custom;
	  },
	  get info() {
	    return this._info || this.primary;
	  },

	  set em(custom) {
	    this._em = custom;
	  },
	  get em() {
	    return this._em || this.primary.underline;
	  },

	  set heading(custom) {
	    this._heading = custom;
	  },
	  get heading() {
	    return this._heading || this.muted.underline;
	  },

	  /**
	   * Statuses
	   */

	  set pending(custom) {
	    this._pending = custom;
	  },
	  get pending() {
	    return this._pending || this.primary;
	  },

	  set submitted(custom) {
	    this._submitted = custom;
	  },
	  get submitted() {
	    return this._submitted || this.success;
	  },

	  set cancelled(custom) {
	    this._cancelled = custom;
	  },
	  get cancelled() {
	    return this._cancelled || this.danger;
	  },

	  /**
	   * Special styling
	   */

	  set typing(custom) {
	    this._typing = custom;
	  },
	  get typing() {
	    return this._typing || this.dim;
	  },

	  set placeholder(custom) {
	    this._placeholder = custom;
	  },
	  get placeholder() {
	    return this._placeholder || this.primary.dim;
	  },

	  set highlight(custom) {
	    this._highlight = custom;
	  },
	  get highlight() {
	    return this._highlight || this.inverse;
	  }
	};

	styles.merge = (options = {}) => {
	  if (options.styles && typeof options.styles.enabled === 'boolean') {
	    colors.enabled = options.styles.enabled;
	  }
	  if (options.styles && typeof options.styles.visible === 'boolean') {
	    colors.visible = options.styles.visible;
	  }

	  let result = utils.merge({}, styles, options.styles);
	  delete result.merge;

	  for (let key of Object.keys(colors)) {
	    if (!result.hasOwnProperty(key)) {
	      Reflect.defineProperty(result, key, { get: () => colors[key] });
	    }
	  }

	  for (let key of Object.keys(colors.styles)) {
	    if (!result.hasOwnProperty(key)) {
	      Reflect.defineProperty(result, key, { get: () => colors[key] });
	    }
	  }
	  return result;
	};

	styles_1 = styles;
	return styles_1;
}

var symbols_1;
var hasRequiredSymbols;

function requireSymbols () {
	if (hasRequiredSymbols) return symbols_1;
	hasRequiredSymbols = 1;

	const isWindows = process.platform === 'win32';
	const colors = ansiColorsExports;
	const utils = utils$1;

	const symbols = {
	  ...colors.symbols,
	  upDownDoubleArrow: '⇕',
	  upDownDoubleArrow2: '⬍',
	  upDownArrow: '↕',
	  asterisk: '*',
	  asterism: '⁂',
	  bulletWhite: '◦',
	  electricArrow: '⌁',
	  ellipsisLarge: '⋯',
	  ellipsisSmall: '…',
	  fullBlock: '█',
	  identicalTo: '≡',
	  indicator: colors.symbols.check,
	  leftAngle: '‹',
	  mark: '※',
	  minus: '−',
	  multiplication: '×',
	  obelus: '÷',
	  percent: '%',
	  pilcrow: '¶',
	  pilcrow2: '❡',
	  pencilUpRight: '✐',
	  pencilDownRight: '✎',
	  pencilRight: '✏',
	  plus: '+',
	  plusMinus: '±',
	  pointRight: '☞',
	  rightAngle: '›',
	  section: '§',
	  hexagon: { off: '⬡', on: '⬢', disabled: '⬢' },
	  ballot: { on: '☑', off: '☐', disabled: '☒' },
	  stars: { on: '★', off: '☆', disabled: '☆' },
	  folder: { on: '▼', off: '▶', disabled: '▶' },
	  prefix: {
	    pending: colors.symbols.question,
	    submitted: colors.symbols.check,
	    cancelled: colors.symbols.cross
	  },
	  separator: {
	    pending: colors.symbols.pointerSmall,
	    submitted: colors.symbols.middot,
	    cancelled: colors.symbols.middot
	  },
	  radio: {
	    off: isWindows ? '( )' : '◯',
	    on: isWindows ? '(*)' : '◉',
	    disabled: isWindows ? '(|)' : 'Ⓘ'
	  },
	  numbers: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳', '㉑', '㉒', '㉓', '㉔', '㉕', '㉖', '㉗', '㉘', '㉙', '㉚', '㉛', '㉜', '㉝', '㉞', '㉟', '㊱', '㊲', '㊳', '㊴', '㊵', '㊶', '㊷', '㊸', '㊹', '㊺', '㊻', '㊼', '㊽', '㊾', '㊿']
	};

	symbols.merge = options => {
	  let result = utils.merge({}, colors.symbols, symbols, options.symbols);
	  delete result.merge;
	  return result;
	};

	symbols_1 = symbols;
	return symbols_1;
}

var theme;
var hasRequiredTheme;

function requireTheme () {
	if (hasRequiredTheme) return theme;
	hasRequiredTheme = 1;

	const styles = requireStyles();
	const symbols = requireSymbols();
	const utils = utils$1;

	theme = prompt => {
	  prompt.options = utils.merge({}, prompt.options.theme, prompt.options);
	  prompt.symbols = symbols.merge(prompt.options);
	  prompt.styles = styles.merge(prompt.options);
	};
	return theme;
}

var ansi = {exports: {}};

var hasRequiredAnsi;

function requireAnsi () {
	if (hasRequiredAnsi) return ansi.exports;
	hasRequiredAnsi = 1;
	(function (module, exports) {

		const isTerm = process.env.TERM_PROGRAM === 'Apple_Terminal';
		const colors = ansiColorsExports;
		const utils = utils$1;
		const ansi = module.exports = exports;
		const ESC = '\u001b[';
		const BEL = '\u0007';
		let hidden = false;

		const code = ansi.code = {
		  bell: BEL,
		  beep: BEL,
		  beginning: `${ESC}G`,
		  down: `${ESC}J`,
		  esc: ESC,
		  getPosition: `${ESC}6n`,
		  hide: `${ESC}?25l`,
		  line: `${ESC}2K`,
		  lineEnd: `${ESC}K`,
		  lineStart: `${ESC}1K`,
		  restorePosition: ESC + (isTerm ? '8' : 'u'),
		  savePosition: ESC + (isTerm ? '7' : 's'),
		  screen: `${ESC}2J`,
		  show: `${ESC}?25h`,
		  up: `${ESC}1J`
		};

		const cursor = ansi.cursor = {
		  get hidden() {
		    return hidden;
		  },

		  hide() {
		    hidden = true;
		    return code.hide;
		  },
		  show() {
		    hidden = false;
		    return code.show;
		  },

		  forward: (count = 1) => `${ESC}${count}C`,
		  backward: (count = 1) => `${ESC}${count}D`,
		  nextLine: (count = 1) => `${ESC}E`.repeat(count),
		  prevLine: (count = 1) => `${ESC}F`.repeat(count),

		  up: (count = 1) => count ? `${ESC}${count}A` : '',
		  down: (count = 1) => count ? `${ESC}${count}B` : '',
		  right: (count = 1) => count ? `${ESC}${count}C` : '',
		  left: (count = 1) => count ? `${ESC}${count}D` : '',

		  to(x, y) {
		    return y ? `${ESC}${y + 1};${x + 1}H` : `${ESC}${x + 1}G`;
		  },

		  move(x = 0, y = 0) {
		    let res = '';
		    res += (x < 0) ? cursor.left(-x) : (x > 0) ? cursor.right(x) : '';
		    res += (y < 0) ? cursor.up(-y) : (y > 0) ? cursor.down(y) : '';
		    return res;
		  },

		  restore(state = {}) {
		    let { after, cursor, initial, input, prompt, size, value } = state;
		    initial = utils.isPrimitive(initial) ? String(initial) : '';
		    input = utils.isPrimitive(input) ? String(input) : '';
		    value = utils.isPrimitive(value) ? String(value) : '';

		    if (size) {
		      let codes = ansi.cursor.up(size) + ansi.cursor.to(prompt.length);
		      let diff = input.length - cursor;
		      if (diff > 0) {
		        codes += ansi.cursor.left(diff);
		      }
		      return codes;
		    }

		    if (value || after) {
		      let pos = (!input && !!initial) ? -initial.length : -input.length + cursor;
		      if (after) pos -= after.length;
		      if (input === '' && initial && !prompt.includes(initial)) {
		        pos += initial.length;
		      }
		      return ansi.cursor.move(pos);
		    }
		  }
		};

		const erase = ansi.erase = {
		  screen: code.screen,
		  up: code.up,
		  down: code.down,
		  line: code.line,
		  lineEnd: code.lineEnd,
		  lineStart: code.lineStart,
		  lines(n) {
		    let str = '';
		    for (let i = 0; i < n; i++) {
		      str += ansi.erase.line + (i < n - 1 ? ansi.cursor.up(1) : '');
		    }
		    if (n) str += ansi.code.beginning;
		    return str;
		  }
		};

		ansi.clear = (input = '', columns = process.stdout.columns) => {
		  if (!columns) return erase.line + cursor.to(0);
		  let width = str => [...colors.unstyle(str)].length;
		  let lines = input.split(/\r?\n/);
		  let rows = 0;
		  for (let line of lines) {
		    rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / columns);
		  }
		  return (erase.line + cursor.prevLine()).repeat(rows - 1) + erase.line + cursor.to(0);
		}; 
	} (ansi, ansi.exports));
	return ansi.exports;
}

var prompt;
var hasRequiredPrompt;

function requirePrompt () {
	if (hasRequiredPrompt) return prompt;
	hasRequiredPrompt = 1;

	const Events = require$$0;
	const colors = ansiColorsExports;
	const keypress = requireKeypress();
	const timer = requireTimer();
	const State = requireState();
	const theme = requireTheme();
	const utils = utils$1;
	const ansi = requireAnsi();

	/**
	 * Base class for creating a new Prompt.
	 * @param {Object} `options` Question object.
	 */

	class Prompt extends Events {
	  constructor(options = {}) {
	    super();
	    this.name = options.name;
	    this.type = options.type;
	    this.options = options;
	    theme(this);
	    timer(this);
	    this.state = new State(this);
	    this.initial = [options.initial, options.default].find(v => v != null);
	    this.stdout = options.stdout || process.stdout;
	    this.stdin = options.stdin || process.stdin;
	    this.scale = options.scale || 1;
	    this.term = this.options.term || process.env.TERM_PROGRAM;
	    this.margin = margin(this.options.margin);
	    this.setMaxListeners(0);
	    setOptions(this);
	  }

	  async keypress(input, event = {}) {
	    this.keypressed = true;
	    let key = keypress.action(input, keypress(input, event), this.options.actions);
	    this.state.keypress = key;
	    this.emit('keypress', input, key);
	    this.emit('state', this.state.clone());
	    let fn = this.options[key.action] || this[key.action] || this.dispatch;
	    if (typeof fn === 'function') {
	      return await fn.call(this, input, key);
	    }
	    this.alert();
	  }

	  alert() {
	    delete this.state.alert;
	    if (this.options.show === false) {
	      this.emit('alert');
	    } else {
	      this.stdout.write(ansi.code.beep);
	    }
	  }

	  cursorHide() {
	    this.stdout.write(ansi.cursor.hide());
	    utils.onExit(() => this.cursorShow());
	  }

	  cursorShow() {
	    this.stdout.write(ansi.cursor.show());
	  }

	  write(str) {
	    if (!str) return;
	    if (this.stdout && this.state.show !== false) {
	      this.stdout.write(str);
	    }
	    this.state.buffer += str;
	  }

	  clear(lines = 0) {
	    let buffer = this.state.buffer;
	    this.state.buffer = '';
	    if ((!buffer && !lines) || this.options.show === false) return;
	    this.stdout.write(ansi.cursor.down(lines) + ansi.clear(buffer, this.width));
	  }

	  restore() {
	    if (this.state.closed || this.options.show === false) return;

	    let { prompt, after, rest } = this.sections();
	    let { cursor, initial = '', input = '', value = '' } = this;

	    let size = this.state.size = rest.length;
	    let state = { after, cursor, initial, input, prompt, size, value };
	    let codes = ansi.cursor.restore(state);
	    if (codes) {
	      this.stdout.write(codes);
	    }
	  }

	  sections() {
	    let { buffer, input, prompt } = this.state;
	    prompt = colors.unstyle(prompt);
	    let buf = colors.unstyle(buffer);
	    let idx = buf.indexOf(prompt);
	    let header = buf.slice(0, idx);
	    let rest = buf.slice(idx);
	    let lines = rest.split('\n');
	    let first = lines[0];
	    let last = lines[lines.length - 1];
	    let promptLine = prompt + (input ? ' ' + input : '');
	    let len = promptLine.length;
	    let after = len < first.length ? first.slice(len + 1) : '';
	    return { header, prompt: first, after, rest: lines.slice(1), last };
	  }

	  async submit() {
	    this.state.submitted = true;
	    this.state.validating = true;

	    // this will only be called when the prompt is directly submitted
	    // without initializing, i.e. when the prompt is skipped, etc. Otherwize,
	    // "options.onSubmit" is will be handled by the "initialize()" method.
	    if (this.options.onSubmit) {
	      await this.options.onSubmit.call(this, this.name, this.value, this);
	    }

	    let result = this.state.error || await this.validate(this.value, this.state);
	    if (result !== true) {
	      let error = '\n' + this.symbols.pointer + ' ';

	      if (typeof result === 'string') {
	        error += result.trim();
	      } else {
	        error += 'Invalid input';
	      }

	      this.state.error = '\n' + this.styles.danger(error);
	      this.state.submitted = false;
	      await this.render();
	      await this.alert();
	      this.state.validating = false;
	      this.state.error = void 0;
	      return;
	    }

	    this.state.validating = false;
	    await this.render();
	    await this.close();

	    this.value = await this.result(this.value);
	    this.emit('submit', this.value);
	  }

	  async cancel(err) {
	    this.state.cancelled = this.state.submitted = true;

	    await this.render();
	    await this.close();

	    if (typeof this.options.onCancel === 'function') {
	      await this.options.onCancel.call(this, this.name, this.value, this);
	    }

	    this.emit('cancel', await this.error(err));
	  }

	  async close() {
	    this.state.closed = true;

	    try {
	      let sections = this.sections();
	      let lines = Math.ceil(sections.prompt.length / this.width);
	      if (sections.rest) {
	        this.write(ansi.cursor.down(sections.rest.length));
	      }
	      this.write('\n'.repeat(lines));
	    } catch (err) { /* do nothing */ }

	    this.emit('close');
	  }

	  start() {
	    if (!this.stop && this.options.show !== false) {
	      this.stop = keypress.listen(this, this.keypress.bind(this));
	      this.once('close', this.stop);
	    }
	  }

	  async skip() {
	    this.skipped = this.options.skip === true;
	    if (typeof this.options.skip === 'function') {
	      this.skipped = await this.options.skip.call(this, this.name, this.value);
	    }
	    return this.skipped;
	  }

	  async initialize() {
	    let { format, options, result } = this;

	    this.format = () => format.call(this, this.value);
	    this.result = () => result.call(this, this.value);

	    if (typeof options.initial === 'function') {
	      this.initial = await options.initial.call(this, this);
	    }

	    if (typeof options.onRun === 'function') {
	      await options.onRun.call(this, this);
	    }

	    // if "options.onSubmit" is defined, we wrap the "submit" method to guarantee
	    // that "onSubmit" will always called first thing inside the submit
	    // method, regardless of how it's handled in inheriting prompts.
	    if (typeof options.onSubmit === 'function') {
	      let onSubmit = options.onSubmit.bind(this);
	      let submit = this.submit.bind(this);
	      delete this.options.onSubmit;
	      this.submit = async() => {
	        await onSubmit(this.name, this.value, this);
	        return submit();
	      };
	    }

	    await this.start();
	    await this.render();
	  }

	  render() {
	    throw new Error('expected prompt to have a custom render method');
	  }

	  run() {
	    return new Promise(async(resolve, reject) => {
	      this.once('submit', resolve);
	      this.once('cancel', reject);
	      if (await this.skip()) {
	        this.render = () => {};
	        return this.submit();
	      }
	      await this.initialize();
	      this.emit('run');
	    });
	  }

	  async element(name, choice, i) {
	    let { options, state, symbols, timers } = this;
	    let timer = timers && timers[name];
	    state.timer = timer;
	    let value = options[name] || state[name] || symbols[name];
	    let val = choice && choice[name] != null ? choice[name] : await value;
	    if (val === '') return val;

	    let res = await this.resolve(val, state, choice, i);
	    if (!res && choice && choice[name]) {
	      return this.resolve(value, state, choice, i);
	    }
	    return res;
	  }

	  async prefix() {
	    let element = await this.element('prefix') || this.symbols;
	    let timer = this.timers && this.timers.prefix;
	    let state = this.state;
	    state.timer = timer;
	    if (utils.isObject(element)) element = element[state.status] || element.pending;
	    if (!utils.hasColor(element)) {
	      let style = this.styles[state.status] || this.styles.pending;
	      return style(element);
	    }
	    return element;
	  }

	  async message() {
	    let message = await this.element('message');
	    if (!utils.hasColor(message)) {
	      return this.styles.strong(message);
	    }
	    return message;
	  }

	  async separator() {
	    let element = await this.element('separator') || this.symbols;
	    let timer = this.timers && this.timers.separator;
	    let state = this.state;
	    state.timer = timer;
	    let value = element[state.status] || element.pending || state.separator;
	    let ele = await this.resolve(value, state);
	    if (utils.isObject(ele)) ele = ele[state.status] || ele.pending;
	    if (!utils.hasColor(ele)) {
	      return this.styles.muted(ele);
	    }
	    return ele;
	  }

	  async pointer(choice, i) {
	    let val = await this.element('pointer', choice, i);

	    if (typeof val === 'string' && utils.hasColor(val)) {
	      return val;
	    }

	    if (val) {
	      let styles = this.styles;
	      let focused = this.index === i;
	      let style = focused ? styles.primary : val => val;
	      let ele = await this.resolve(val[focused ? 'on' : 'off'] || val, this.state);
	      let styled = !utils.hasColor(ele) ? style(ele) : ele;
	      return focused ? styled : ' '.repeat(ele.length);
	    }
	  }

	  async indicator(choice, i) {
	    let val = await this.element('indicator', choice, i);
	    if (typeof val === 'string' && utils.hasColor(val)) {
	      return val;
	    }
	    if (val) {
	      let styles = this.styles;
	      let enabled = choice.enabled === true;
	      let style = enabled ? styles.success : styles.dark;
	      let ele = val[enabled ? 'on' : 'off'] || val;
	      return !utils.hasColor(ele) ? style(ele) : ele;
	    }
	    return '';
	  }

	  body() {
	    return null;
	  }

	  footer() {
	    if (this.state.status === 'pending') {
	      return this.element('footer');
	    }
	  }

	  header() {
	    if (this.state.status === 'pending') {
	      return this.element('header');
	    }
	  }

	  async hint() {
	    if (this.state.status === 'pending' && !this.isValue(this.state.input)) {
	      let hint = await this.element('hint');
	      if (!utils.hasColor(hint)) {
	        return this.styles.muted(hint);
	      }
	      return hint;
	    }
	  }

	  error(err) {
	    return !this.state.submitted ? (err || this.state.error) : '';
	  }

	  format(value) {
	    return value;
	  }

	  result(value) {
	    return value;
	  }

	  validate(value) {
	    if (this.options.required === true) {
	      return this.isValue(value);
	    }
	    return true;
	  }

	  isValue(value) {
	    return value != null && value !== '';
	  }

	  resolve(value, ...args) {
	    return utils.resolve(this, value, ...args);
	  }

	  get base() {
	    return Prompt.prototype;
	  }

	  get style() {
	    return this.styles[this.state.status];
	  }

	  get height() {
	    return this.options.rows || utils.height(this.stdout, 25);
	  }
	  get width() {
	    return this.options.columns || utils.width(this.stdout, 80);
	  }
	  get size() {
	    return { width: this.width, height: this.height };
	  }

	  set cursor(value) {
	    this.state.cursor = value;
	  }
	  get cursor() {
	    return this.state.cursor;
	  }

	  set input(value) {
	    this.state.input = value;
	  }
	  get input() {
	    return this.state.input;
	  }

	  set value(value) {
	    this.state.value = value;
	  }
	  get value() {
	    let { input, value } = this.state;
	    let result = [value, input].find(this.isValue.bind(this));
	    return this.isValue(result) ? result : this.initial;
	  }

	  static get prompt() {
	    return options => new this(options).run();
	  }
	}

	function setOptions(prompt) {
	  let isValidKey = key => {
	    return prompt[key] === void 0 || typeof prompt[key] === 'function';
	  };

	  let ignore = [
	    'actions',
	    'choices',
	    'initial',
	    'margin',
	    'roles',
	    'styles',
	    'symbols',
	    'theme',
	    'timers',
	    'value'
	  ];

	  let ignoreFn = [
	    'body',
	    'footer',
	    'error',
	    'header',
	    'hint',
	    'indicator',
	    'message',
	    'prefix',
	    'separator',
	    'skip'
	  ];

	  for (let key of Object.keys(prompt.options)) {
	    if (ignore.includes(key)) continue;
	    if (/^on[A-Z]/.test(key)) continue;
	    let option = prompt.options[key];
	    if (typeof option === 'function' && isValidKey(key)) {
	      if (!ignoreFn.includes(key)) {
	        prompt[key] = option.bind(prompt);
	      }
	    } else if (typeof prompt[key] !== 'function') {
	      prompt[key] = option;
	    }
	  }
	}

	function margin(value) {
	  if (typeof value === 'number') {
	    value = [value, value, value, value];
	  }
	  let arr = [].concat(value || []);
	  let pad = i => i % 2 === 0 ? '\n' : ' ';
	  let res = [];
	  for (let i = 0; i < 4; i++) {
	    let char = pad(i);
	    if (arr[i]) {
	      res.push(char.repeat(arr[i]));
	    } else {
	      res.push('');
	    }
	  }
	  return res;
	}

	prompt = Prompt;
	return prompt;
}

var prompts$1 = {};

var roles_1;
var hasRequiredRoles;

function requireRoles () {
	if (hasRequiredRoles) return roles_1;
	hasRequiredRoles = 1;

	const utils = utils$1;
	const roles = {
	  default(prompt, choice) {
	    return choice;
	  },
	  checkbox(prompt, choice) {
	    throw new Error('checkbox role is not implemented yet');
	  },
	  editable(prompt, choice) {
	    throw new Error('editable role is not implemented yet');
	  },
	  expandable(prompt, choice) {
	    throw new Error('expandable role is not implemented yet');
	  },
	  heading(prompt, choice) {
	    choice.disabled = '';
	    choice.indicator = [choice.indicator, ' '].find(v => v != null);
	    choice.message = choice.message || '';
	    return choice;
	  },
	  input(prompt, choice) {
	    throw new Error('input role is not implemented yet');
	  },
	  option(prompt, choice) {
	    return roles.default(prompt, choice);
	  },
	  radio(prompt, choice) {
	    throw new Error('radio role is not implemented yet');
	  },
	  separator(prompt, choice) {
	    choice.disabled = '';
	    choice.indicator = [choice.indicator, ' '].find(v => v != null);
	    choice.message = choice.message || prompt.symbols.line.repeat(5);
	    return choice;
	  },
	  spacer(prompt, choice) {
	    return choice;
	  }
	};

	roles_1 = (name, options = {}) => {
	  let role = utils.merge({}, roles, options.roles);
	  return role[name] || role.default;
	};
	return roles_1;
}

var array;
var hasRequiredArray;

function requireArray () {
	if (hasRequiredArray) return array;
	hasRequiredArray = 1;

	const colors = ansiColorsExports;
	const Prompt = requirePrompt();
	const roles = requireRoles();
	const utils = utils$1;
	const { reorder, scrollUp, scrollDown, isObject, swap } = utils;

	class ArrayPrompt extends Prompt {
	  constructor(options) {
	    super(options);
	    this.cursorHide();
	    this.maxSelected = options.maxSelected || Infinity;
	    this.multiple = options.multiple || false;
	    this.initial = options.initial || 0;
	    this.delay = options.delay || 0;
	    this.longest = 0;
	    this.num = '';
	  }

	  async initialize() {
	    if (typeof this.options.initial === 'function') {
	      this.initial = await this.options.initial.call(this);
	    }
	    await this.reset(true);
	    await super.initialize();
	  }

	  async reset() {
	    let { choices, initial, autofocus, suggest } = this.options;
	    this.state._choices = [];
	    this.state.choices = [];

	    this.choices = await Promise.all(await this.toChoices(choices));
	    this.choices.forEach(ch => (ch.enabled = false));

	    if (typeof suggest !== 'function' && this.selectable.length === 0) {
	      throw new Error('At least one choice must be selectable');
	    }

	    if (isObject(initial)) initial = Object.keys(initial);
	    if (Array.isArray(initial)) {
	      if (autofocus != null) this.index = this.findIndex(autofocus);
	      initial.forEach(v => this.enable(this.find(v)));
	      await this.render();
	    } else {
	      if (autofocus != null) initial = autofocus;
	      if (typeof initial === 'string') initial = this.findIndex(initial);
	      if (typeof initial === 'number' && initial > -1) {
	        this.index = Math.max(0, Math.min(initial, this.choices.length));
	        this.enable(this.find(this.index));
	      }
	    }

	    if (this.isDisabled(this.focused)) {
	      await this.down();
	    }
	  }

	  async toChoices(value, parent) {
	    this.state.loadingChoices = true;
	    let choices = [];
	    let index = 0;

	    let toChoices = async(items, parent) => {
	      if (typeof items === 'function') items = await items.call(this);
	      if (items instanceof Promise) items = await items;

	      for (let i = 0; i < items.length; i++) {
	        let choice = items[i] = await this.toChoice(items[i], index++, parent);
	        choices.push(choice);

	        if (choice.choices) {
	          await toChoices(choice.choices, choice);
	        }
	      }
	      return choices;
	    };

	    return toChoices(value, parent)
	      .then(choices => {
	        this.state.loadingChoices = false;
	        return choices;
	      });
	  }

	  async toChoice(ele, i, parent) {
	    if (typeof ele === 'function') ele = await ele.call(this, this);
	    if (ele instanceof Promise) ele = await ele;
	    if (typeof ele === 'string') ele = { name: ele };

	    if (ele.normalized) return ele;
	    ele.normalized = true;

	    let origVal = ele.value;
	    let role = roles(ele.role, this.options);
	    ele = role(this, ele);

	    if (typeof ele.disabled === 'string' && !ele.hint) {
	      ele.hint = ele.disabled;
	      ele.disabled = true;
	    }

	    if (ele.disabled === true && ele.hint == null) {
	      ele.hint = '(disabled)';
	    }

	    // if the choice was already normalized, return it
	    if (ele.index != null) return ele;
	    ele.name = ele.name || ele.key || ele.title || ele.value || ele.message;
	    ele.message = ele.message || ele.name || '';
	    ele.value = [ele.value, ele.name].find(this.isValue.bind(this));

	    ele.input = '';
	    ele.index = i;
	    ele.cursor = 0;

	    utils.define(ele, 'parent', parent);
	    ele.level = parent ? parent.level + 1 : 1;
	    if (ele.indent == null) {
	      ele.indent = parent ? parent.indent + '  ' : (ele.indent || '');
	    }

	    ele.path = parent ? parent.path + '.' + ele.name : ele.name;
	    ele.enabled = !!(this.multiple && !this.isDisabled(ele) && (ele.enabled || this.isSelected(ele)));

	    if (!this.isDisabled(ele)) {
	      this.longest = Math.max(this.longest, colors.unstyle(ele.message).length);
	    }

	    // shallow clone the choice first
	    let choice = { ...ele };

	    // then allow the choice to be reset using the "original" values
	    ele.reset = (input = choice.input, value = choice.value) => {
	      for (let key of Object.keys(choice)) ele[key] = choice[key];
	      ele.input = input;
	      ele.value = value;
	    };

	    if (origVal == null && typeof ele.initial === 'function') {
	      ele.input = await ele.initial.call(this, this.state, ele, i);
	    }

	    return ele;
	  }

	  async onChoice(choice, i) {
	    this.emit('choice', choice, i, this);

	    if (typeof choice.onChoice === 'function') {
	      await choice.onChoice.call(this, this.state, choice, i);
	    }
	  }

	  async addChoice(ele, i, parent) {
	    let choice = await this.toChoice(ele, i, parent);
	    this.choices.push(choice);
	    this.index = this.choices.length - 1;
	    this.limit = this.choices.length;
	    return choice;
	  }

	  async newItem(item, i, parent) {
	    let ele = { name: 'New choice name?', editable: true, newChoice: true, ...item };
	    let choice = await this.addChoice(ele, i, parent);

	    choice.updateChoice = () => {
	      delete choice.newChoice;
	      choice.name = choice.message = choice.input;
	      choice.input = '';
	      choice.cursor = 0;
	    };

	    return this.render();
	  }

	  indent(choice) {
	    if (choice.indent == null) {
	      return choice.level > 1 ? '  '.repeat(choice.level - 1) : '';
	    }
	    return choice.indent;
	  }

	  dispatch(s, key) {
	    if (this.multiple && this[key.name]) return this[key.name]();
	    this.alert();
	  }

	  focus(choice, enabled) {
	    if (typeof enabled !== 'boolean') enabled = choice.enabled;
	    if (enabled && !choice.enabled && this.selected.length >= this.maxSelected) {
	      return this.alert();
	    }
	    this.index = choice.index;
	    choice.enabled = enabled && !this.isDisabled(choice);
	    return choice;
	  }

	  space() {
	    if (!this.multiple) return this.alert();
	    this.toggle(this.focused);
	    return this.render();
	  }

	  a() {
	    if (this.maxSelected < this.choices.length) return this.alert();
	    let enabled = this.selectable.every(ch => ch.enabled);
	    this.choices.forEach(ch => (ch.enabled = !enabled));
	    return this.render();
	  }

	  i() {
	    // don't allow choices to be inverted if it will result in
	    // more than the maximum number of allowed selected items.
	    if (this.choices.length - this.selected.length > this.maxSelected) {
	      return this.alert();
	    }
	    this.choices.forEach(ch => (ch.enabled = !ch.enabled));
	    return this.render();
	  }

	  g(choice = this.focused) {
	    if (!this.choices.some(ch => !!ch.parent)) return this.a();
	    this.toggle((choice.parent && !choice.choices) ? choice.parent : choice);
	    return this.render();
	  }

	  toggle(choice, enabled) {
	    if (!choice.enabled && this.selected.length >= this.maxSelected) {
	      return this.alert();
	    }

	    if (typeof enabled !== 'boolean') enabled = !choice.enabled;
	    choice.enabled = enabled;

	    if (choice.choices) {
	      choice.choices.forEach(ch => this.toggle(ch, enabled));
	    }

	    let parent = choice.parent;
	    while (parent) {
	      let choices = parent.choices.filter(ch => this.isDisabled(ch));
	      parent.enabled = choices.every(ch => ch.enabled === true);
	      parent = parent.parent;
	    }

	    reset(this, this.choices);
	    this.emit('toggle', choice, this);
	    return choice;
	  }

	  enable(choice) {
	    if (this.selected.length >= this.maxSelected) return this.alert();
	    choice.enabled = !this.isDisabled(choice);
	    choice.choices && choice.choices.forEach(this.enable.bind(this));
	    return choice;
	  }

	  disable(choice) {
	    choice.enabled = false;
	    choice.choices && choice.choices.forEach(this.disable.bind(this));
	    return choice;
	  }

	  number(n) {
	    this.num += n;

	    let number = num => {
	      let i = Number(num);
	      if (i > this.choices.length - 1) return this.alert();

	      let focused = this.focused;
	      let choice = this.choices.find(ch => i === ch.index);

	      if (!choice.enabled && this.selected.length >= this.maxSelected) {
	        return this.alert();
	      }

	      if (this.visible.indexOf(choice) === -1) {
	        let choices = reorder(this.choices);
	        let actualIdx = choices.indexOf(choice);

	        if (focused.index > actualIdx) {
	          let start = choices.slice(actualIdx, actualIdx + this.limit);
	          let end = choices.filter(ch => !start.includes(ch));
	          this.choices = start.concat(end);
	        } else {
	          let pos = actualIdx - this.limit + 1;
	          this.choices = choices.slice(pos).concat(choices.slice(0, pos));
	        }
	      }

	      this.index = this.choices.indexOf(choice);
	      this.toggle(this.focused);
	      return this.render();
	    };

	    clearTimeout(this.numberTimeout);

	    return new Promise(resolve => {
	      let len = this.choices.length;
	      let num = this.num;

	      let handle = (val = false, res) => {
	        clearTimeout(this.numberTimeout);
	        if (val) res = number(num);
	        this.num = '';
	        resolve(res);
	      };

	      if (num === '0' || (num.length === 1 && Number(num + '0') > len)) {
	        return handle(true);
	      }

	      if (Number(num) > len) {
	        return handle(false, this.alert());
	      }

	      this.numberTimeout = setTimeout(() => handle(true), this.delay);
	    });
	  }

	  home() {
	    this.choices = reorder(this.choices);
	    this.index = 0;
	    return this.render();
	  }

	  end() {
	    let pos = this.choices.length - this.limit;
	    let choices = reorder(this.choices);
	    this.choices = choices.slice(pos).concat(choices.slice(0, pos));
	    this.index = this.limit - 1;
	    return this.render();
	  }

	  first() {
	    this.index = 0;
	    return this.render();
	  }

	  last() {
	    this.index = this.visible.length - 1;
	    return this.render();
	  }

	  prev() {
	    if (this.visible.length <= 1) return this.alert();
	    return this.up();
	  }

	  next() {
	    if (this.visible.length <= 1) return this.alert();
	    return this.down();
	  }

	  right() {
	    if (this.cursor >= this.input.length) return this.alert();
	    this.cursor++;
	    return this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.alert();
	    this.cursor--;
	    return this.render();
	  }

	  up() {
	    let len = this.choices.length;
	    let vis = this.visible.length;
	    let idx = this.index;
	    if (this.options.scroll === false && idx === 0) {
	      return this.alert();
	    }
	    if (len > vis && idx === 0) {
	      return this.scrollUp();
	    }
	    this.index = ((idx - 1 % len) + len) % len;
	    if (this.isDisabled()) {
	      return this.up();
	    }
	    return this.render();
	  }

	  down() {
	    let len = this.choices.length;
	    let vis = this.visible.length;
	    let idx = this.index;
	    if (this.options.scroll === false && idx === vis - 1) {
	      return this.alert();
	    }
	    if (len > vis && idx === vis - 1) {
	      return this.scrollDown();
	    }
	    this.index = (idx + 1) % len;
	    if (this.isDisabled()) {
	      return this.down();
	    }
	    return this.render();
	  }

	  scrollUp(i = 0) {
	    this.choices = scrollUp(this.choices);
	    this.index = i;
	    if (this.isDisabled()) {
	      return this.up();
	    }
	    return this.render();
	  }

	  scrollDown(i = this.visible.length - 1) {
	    this.choices = scrollDown(this.choices);
	    this.index = i;
	    if (this.isDisabled()) {
	      return this.down();
	    }
	    return this.render();
	  }

	  async shiftUp() {
	    if (this.options.sort === true) {
	      this.sorting = true;
	      this.swap(this.index - 1);
	      await this.up();
	      this.sorting = false;
	      return;
	    }
	    return this.scrollUp(this.index);
	  }

	  async shiftDown() {
	    if (this.options.sort === true) {
	      this.sorting = true;
	      this.swap(this.index + 1);
	      await this.down();
	      this.sorting = false;
	      return;
	    }
	    return this.scrollDown(this.index);
	  }

	  pageUp() {
	    if (this.visible.length <= 1) return this.alert();
	    this.limit = Math.max(this.limit - 1, 0);
	    this.index = Math.min(this.limit - 1, this.index);
	    this._limit = this.limit;
	    if (this.isDisabled()) {
	      return this.up();
	    }
	    return this.render();
	  }

	  pageDown() {
	    if (this.visible.length >= this.choices.length) return this.alert();
	    this.index = Math.max(0, this.index);
	    this.limit = Math.min(this.limit + 1, this.choices.length);
	    this._limit = this.limit;
	    if (this.isDisabled()) {
	      return this.down();
	    }
	    return this.render();
	  }

	  swap(pos) {
	    swap(this.choices, this.index, pos);
	  }

	  isDisabled(choice = this.focused) {
	    let keys = ['disabled', 'collapsed', 'hidden', 'completing', 'readonly'];
	    if (choice && keys.some(key => choice[key] === true)) {
	      return true;
	    }
	    return choice && choice.role === 'heading';
	  }

	  isEnabled(choice = this.focused) {
	    if (Array.isArray(choice)) return choice.every(ch => this.isEnabled(ch));
	    if (choice.choices) {
	      let choices = choice.choices.filter(ch => !this.isDisabled(ch));
	      return choice.enabled && choices.every(ch => this.isEnabled(ch));
	    }
	    return choice.enabled && !this.isDisabled(choice);
	  }

	  isChoice(choice, value) {
	    return choice.name === value || choice.index === Number(value);
	  }

	  isSelected(choice) {
	    if (Array.isArray(this.initial)) {
	      return this.initial.some(value => this.isChoice(choice, value));
	    }
	    return this.isChoice(choice, this.initial);
	  }

	  map(names = [], prop = 'value') {
	    return [].concat(names || []).reduce((acc, name) => {
	      acc[name] = this.find(name, prop);
	      return acc;
	    }, {});
	  }

	  filter(value, prop) {
	    let isChoice = (ele, i) => [ele.name, i].includes(value);
	    let fn = typeof value === 'function' ? value : isChoice;
	    let choices = this.options.multiple ? this.state._choices : this.choices;
	    let result = choices.filter(fn);
	    if (prop) {
	      return result.map(ch => ch[prop]);
	    }
	    return result;
	  }

	  find(value, prop) {
	    if (isObject(value)) return prop ? value[prop] : value;
	    let isChoice = (ele, i) => [ele.name, i].includes(value);
	    let fn = typeof value === 'function' ? value : isChoice;
	    let choice = this.choices.find(fn);
	    if (choice) {
	      return prop ? choice[prop] : choice;
	    }
	  }

	  findIndex(value) {
	    return this.choices.indexOf(this.find(value));
	  }

	  async submit() {
	    let choice = this.focused;
	    if (!choice) return this.alert();

	    if (choice.newChoice) {
	      if (!choice.input) return this.alert();
	      choice.updateChoice();
	      return this.render();
	    }

	    if (this.choices.some(ch => ch.newChoice)) {
	      return this.alert();
	    }

	    let { reorder, sort } = this.options;
	    let multi = this.multiple === true;
	    let value = this.selected;
	    if (value === void 0) {
	      return this.alert();
	    }

	    // re-sort choices to original order
	    if (Array.isArray(value) && reorder !== false && sort !== true) {
	      value = utils.reorder(value);
	    }

	    this.value = multi ? value.map(ch => ch.name) : value.name;
	    return super.submit();
	  }

	  set choices(choices = []) {
	    this.state._choices = this.state._choices || [];
	    this.state.choices = choices;

	    for (let choice of choices) {
	      if (!this.state._choices.some(ch => ch.name === choice.name)) {
	        this.state._choices.push(choice);
	      }
	    }

	    if (!this._initial && this.options.initial) {
	      this._initial = true;
	      let init = this.initial;
	      if (typeof init === 'string' || typeof init === 'number') {
	        let choice = this.find(init);
	        if (choice) {
	          this.initial = choice.index;
	          this.focus(choice, true);
	        }
	      }
	    }
	  }
	  get choices() {
	    return reset(this, this.state.choices || []);
	  }

	  set visible(visible) {
	    this.state.visible = visible;
	  }
	  get visible() {
	    return (this.state.visible || this.choices).slice(0, this.limit);
	  }

	  set limit(num) {
	    this.state.limit = num;
	  }
	  get limit() {
	    let { state, options, choices } = this;
	    let limit = state.limit || this._limit || options.limit || choices.length;
	    return Math.min(limit, this.height);
	  }

	  set value(value) {
	    super.value = value;
	  }
	  get value() {
	    if (typeof super.value !== 'string' && super.value === this.initial) {
	      return this.input;
	    }
	    return super.value;
	  }

	  set index(i) {
	    this.state.index = i;
	  }
	  get index() {
	    return Math.max(0, this.state ? this.state.index : 0);
	  }

	  get enabled() {
	    return this.filter(this.isEnabled.bind(this));
	  }

	  get focused() {
	    let choice = this.choices[this.index];
	    if (choice && this.state.submitted && this.multiple !== true) {
	      choice.enabled = true;
	    }
	    return choice;
	  }

	  get selectable() {
	    return this.choices.filter(choice => !this.isDisabled(choice));
	  }

	  get selected() {
	    return this.multiple ? this.enabled : this.focused;
	  }
	}

	function reset(prompt, choices) {
	  if (choices instanceof Promise) return choices;
	  if (typeof choices === 'function') {
	    if (utils.isAsyncFn(choices)) return choices;
	    choices = choices.call(prompt, prompt);
	  }
	  for (let choice of choices) {
	    if (Array.isArray(choice.choices)) {
	      let items = choice.choices.filter(ch => !prompt.isDisabled(ch));
	      choice.enabled = items.every(ch => ch.enabled === true);
	    }
	    if (prompt.isDisabled(choice) === true) {
	      delete choice.enabled;
	    }
	  }
	  return choices;
	}

	array = ArrayPrompt;
	return array;
}

var select;
var hasRequiredSelect;

function requireSelect () {
	if (hasRequiredSelect) return select;
	hasRequiredSelect = 1;

	const ArrayPrompt = requireArray();
	const utils = utils$1;

	class SelectPrompt extends ArrayPrompt {
	  constructor(options) {
	    super(options);
	    this.emptyError = this.options.emptyError || 'No items were selected';
	  }

	  async dispatch(s, key) {
	    if (this.multiple) {
	      return this[key.name] ? await this[key.name](s, key) : await super.dispatch(s, key);
	    }
	    this.alert();
	  }

	  separator() {
	    if (this.options.separator) return super.separator();
	    let sep = this.styles.muted(this.symbols.ellipsis);
	    return this.state.submitted ? super.separator() : sep;
	  }

	  pointer(choice, i) {
	    return (!this.multiple || this.options.pointer) ? super.pointer(choice, i) : '';
	  }

	  indicator(choice, i) {
	    return this.multiple ? super.indicator(choice, i) : '';
	  }

	  choiceMessage(choice, i) {
	    let message = this.resolve(choice.message, this.state, choice, i);
	    if (choice.role === 'heading' && !utils.hasColor(message)) {
	      message = this.styles.strong(message);
	    }
	    return this.resolve(message, this.state, choice, i);
	  }

	  choiceSeparator() {
	    return ':';
	  }

	  async renderChoice(choice, i) {
	    await this.onChoice(choice, i);

	    let focused = this.index === i;
	    let pointer = await this.pointer(choice, i);
	    let check = await this.indicator(choice, i) + (choice.pad || '');
	    let hint = await this.resolve(choice.hint, this.state, choice, i);

	    if (hint && !utils.hasColor(hint)) {
	      hint = this.styles.muted(hint);
	    }

	    let ind = this.indent(choice);
	    let msg = await this.choiceMessage(choice, i);
	    let line = () => [this.margin[3], ind + pointer + check, msg, this.margin[1], hint].filter(Boolean).join(' ');

	    if (choice.role === 'heading') {
	      return line();
	    }

	    if (choice.disabled) {
	      if (!utils.hasColor(msg)) {
	        msg = this.styles.disabled(msg);
	      }
	      return line();
	    }

	    if (focused) {
	      msg = this.styles.em(msg);
	    }

	    return line();
	  }

	  async renderChoices() {
	    if (this.state.loading === 'choices') {
	      return this.styles.warning('Loading choices');
	    }

	    if (this.state.submitted) return '';
	    let choices = this.visible.map(async(ch, i) => await this.renderChoice(ch, i));
	    let visible = await Promise.all(choices);
	    if (!visible.length) visible.push(this.styles.danger('No matching choices'));
	    let result = this.margin[0] + visible.join('\n');
	    let header;

	    if (this.options.choicesHeader) {
	      header = await this.resolve(this.options.choicesHeader, this.state);
	    }

	    return [header, result].filter(Boolean).join('\n');
	  }

	  format() {
	    if (!this.state.submitted || this.state.cancelled) return '';
	    if (Array.isArray(this.selected)) {
	      return this.selected.map(choice => this.styles.primary(choice.name)).join(', ');
	    }
	    return this.styles.primary(this.selected.name);
	  }

	  async render() {
	    let { submitted, size } = this.state;

	    let prompt = '';
	    let header = await this.header();
	    let prefix = await this.prefix();
	    let separator = await this.separator();
	    let message = await this.message();

	    if (this.options.promptLine !== false) {
	      prompt = [prefix, message, separator, ''].join(' ');
	      this.state.prompt = prompt;
	    }

	    let output = await this.format();
	    let help = (await this.error()) || (await this.hint());
	    let body = await this.renderChoices();
	    let footer = await this.footer();

	    if (output) prompt += output;
	    if (help && !prompt.includes(help)) prompt += ' ' + help;

	    if (submitted && !output && !body.trim() && this.multiple && this.emptyError != null) {
	      prompt += this.styles.danger(this.emptyError);
	    }

	    this.clear(size);
	    this.write([header, prompt, body, footer].filter(Boolean).join('\n'));
	    this.write(this.margin[2]);
	    this.restore();
	  }
	}

	select = SelectPrompt;
	return select;
}

var autocomplete;
var hasRequiredAutocomplete;

function requireAutocomplete () {
	if (hasRequiredAutocomplete) return autocomplete;
	hasRequiredAutocomplete = 1;

	const Select = requireSelect();

	const highlight = (input, color) => {
	  let val = input.toLowerCase();
	  return str => {
	    let s = str.toLowerCase();
	    let i = s.indexOf(val);
	    let colored = color(str.slice(i, i + val.length));
	    return i >= 0 ? str.slice(0, i) + colored + str.slice(i + val.length) : str;
	  };
	};

	class AutoComplete extends Select {
	  constructor(options) {
	    super(options);
	    this.cursorShow();
	  }

	  moveCursor(n) {
	    this.state.cursor += n;
	  }

	  dispatch(ch) {
	    return this.append(ch);
	  }

	  space(ch) {
	    return this.options.multiple ? super.space(ch) : this.append(ch);
	  }

	  append(ch) {
	    let { cursor, input } = this.state;
	    this.input = input.slice(0, cursor) + ch + input.slice(cursor);
	    this.moveCursor(1);
	    return this.complete();
	  }

	  delete() {
	    let { cursor, input } = this.state;
	    if (!input) return this.alert();
	    this.input = input.slice(0, cursor - 1) + input.slice(cursor);
	    this.moveCursor(-1);
	    return this.complete();
	  }

	  deleteForward() {
	    let { cursor, input } = this.state;
	    if (input[cursor] === void 0) return this.alert();
	    this.input = `${input}`.slice(0, cursor) + `${input}`.slice(cursor + 1);
	    return this.complete();
	  }

	  number(ch) {
	    return this.append(ch);
	  }

	  async complete() {
	    this.completing = true;
	    this.choices = await this.suggest(this.input, this.state._choices);
	    this.state.limit = void 0; // allow getter/setter to reset limit
	    this.index = Math.min(Math.max(this.visible.length - 1, 0), this.index);
	    await this.render();
	    this.completing = false;
	  }

	  suggest(input = this.input, choices = this.state._choices) {
	    if (typeof this.options.suggest === 'function') {
	      return this.options.suggest.call(this, input, choices);
	    }
	    let str = input.toLowerCase();
	    return choices.filter(ch => ch.message.toLowerCase().includes(str));
	  }

	  pointer() {
	    return '';
	  }

	  format() {
	    if (!this.focused) return this.input;
	    if (this.options.multiple && this.state.submitted) {
	      return this.selected.map(ch => this.styles.primary(ch.message)).join(', ');
	    }
	    if (this.state.submitted) {
	      let value = this.value = this.input = this.focused.value;
	      return this.styles.primary(value);
	    }
	    return this.input;
	  }

	  async render() {
	    if (this.state.status !== 'pending') return super.render();
	    let style = this.options.highlight
	      ? this.options.highlight.bind(this)
	      : this.styles.placeholder;

	    let color = highlight(this.input, style);
	    let choices = this.choices;
	    this.choices = choices.map(ch => ({ ...ch, message: color(ch.message) }));
	    await super.render();
	    this.choices = choices;
	  }

	  submit() {
	    if (this.options.multiple) {
	      this.value = this.selected.map(ch => ch.name);
	    }
	    return super.submit();
	  }
	}

	autocomplete = AutoComplete;
	return autocomplete;
}

var placeholder;
var hasRequiredPlaceholder;

function requirePlaceholder () {
	if (hasRequiredPlaceholder) return placeholder;
	hasRequiredPlaceholder = 1;

	const utils = utils$1;

	/**
	 * Render a placeholder value with cursor and styling based on the
	 * position of the cursor.
	 *
	 * @param {Object} `prompt` Prompt instance.
	 * @param {String} `input` Input string.
	 * @param {String} `initial` The initial user-provided value.
	 * @param {Number} `pos` Current cursor position.
	 * @param {Boolean} `showCursor` Render a simulated cursor using the inverse primary style.
	 * @return {String} Returns the styled placeholder string.
	 * @api public
	 */

	placeholder = (prompt, options = {}) => {
	  prompt.cursorHide();

	  let { input = '', initial = '', pos, showCursor = true, color } = options;
	  let style = color || prompt.styles.placeholder;
	  let inverse = utils.inverse(prompt.styles.primary);
	  let blinker = str => inverse(prompt.styles.black(str));
	  let output = input;
	  let char = ' ';
	  let reverse = blinker(char);

	  if (prompt.blink && prompt.blink.off === true) {
	    blinker = str => str;
	    reverse = '';
	  }

	  if (showCursor && pos === 0 && initial === '' && input === '') {
	    return blinker(char);
	  }

	  if (showCursor && pos === 0 && (input === initial || input === '')) {
	    return blinker(initial[0]) + style(initial.slice(1));
	  }

	  initial = utils.isPrimitive(initial) ? `${initial}` : '';
	  input = utils.isPrimitive(input) ? `${input}` : '';

	  let placeholder = initial && initial.startsWith(input) && initial !== input;
	  let cursor = placeholder ? blinker(initial[input.length]) : reverse;

	  if (pos !== input.length && showCursor === true) {
	    output = input.slice(0, pos) + blinker(input[pos]) + input.slice(pos + 1);
	    cursor = '';
	  }

	  if (showCursor === false) {
	    cursor = '';
	  }

	  if (placeholder) {
	    let raw = prompt.styles.unstyle(output + cursor);
	    return output + cursor + style(initial.slice(raw.length));
	  }

	  return output + cursor;
	};
	return placeholder;
}

var form;
var hasRequiredForm;

function requireForm () {
	if (hasRequiredForm) return form;
	hasRequiredForm = 1;

	const colors = ansiColorsExports;
	const SelectPrompt = requireSelect();
	const placeholder = requirePlaceholder();

	class FormPrompt extends SelectPrompt {
	  constructor(options) {
	    super({ ...options, multiple: true });
	    this.type = 'form';
	    this.initial = this.options.initial;
	    this.align = [this.options.align, 'right'].find(v => v != null);
	    this.emptyError = '';
	    this.values = {};
	  }

	  async reset(first) {
	    await super.reset();
	    if (first === true) this._index = this.index;
	    this.index = this._index;
	    this.values = {};
	    this.choices.forEach(choice => choice.reset && choice.reset());
	    return this.render();
	  }

	  dispatch(char) {
	    return !!char && this.append(char);
	  }

	  append(char) {
	    let choice = this.focused;
	    if (!choice) return this.alert();
	    let { cursor, input } = choice;
	    choice.value = choice.input = input.slice(0, cursor) + char + input.slice(cursor);
	    choice.cursor++;
	    return this.render();
	  }

	  delete() {
	    let choice = this.focused;
	    if (!choice || choice.cursor <= 0) return this.alert();
	    let { cursor, input } = choice;
	    choice.value = choice.input = input.slice(0, cursor - 1) + input.slice(cursor);
	    choice.cursor--;
	    return this.render();
	  }

	  deleteForward() {
	    let choice = this.focused;
	    if (!choice) return this.alert();
	    let { cursor, input } = choice;
	    if (input[cursor] === void 0) return this.alert();
	    let str = `${input}`.slice(0, cursor) + `${input}`.slice(cursor + 1);
	    choice.value = choice.input = str;
	    return this.render();
	  }

	  right() {
	    let choice = this.focused;
	    if (!choice) return this.alert();
	    if (choice.cursor >= choice.input.length) return this.alert();
	    choice.cursor++;
	    return this.render();
	  }

	  left() {
	    let choice = this.focused;
	    if (!choice) return this.alert();
	    if (choice.cursor <= 0) return this.alert();
	    choice.cursor--;
	    return this.render();
	  }

	  space(ch, key) {
	    return this.dispatch(ch, key);
	  }

	  number(ch, key) {
	    return this.dispatch(ch, key);
	  }

	  next() {
	    let ch = this.focused;
	    if (!ch) return this.alert();
	    let { initial, input } = ch;
	    if (initial && initial.startsWith(input) && input !== initial) {
	      ch.value = ch.input = initial;
	      ch.cursor = ch.value.length;
	      return this.render();
	    }
	    return super.next();
	  }

	  prev() {
	    let ch = this.focused;
	    if (!ch) return this.alert();
	    if (ch.cursor === 0) return super.prev();
	    ch.value = ch.input = '';
	    ch.cursor = 0;
	    return this.render();
	  }

	  separator() {
	    return '';
	  }

	  format(value) {
	    return !this.state.submitted ? super.format(value) : '';
	  }

	  pointer() {
	    return '';
	  }

	  indicator(choice) {
	    return choice.input ? '⦿' : '⊙';
	  }

	  async choiceSeparator(choice, i) {
	    let sep = await this.resolve(choice.separator, this.state, choice, i) || ':';
	    return sep ? ' ' + this.styles.disabled(sep) : '';
	  }

	  async renderChoice(choice, i) {
	    await this.onChoice(choice, i);

	    let { state, styles } = this;
	    let { cursor, initial = '', name, hint, input = '' } = choice;
	    let { muted, submitted, primary, danger } = styles;

	    let help = hint;
	    let focused = this.index === i;
	    let validate = choice.validate || (() => true);
	    let sep = await this.choiceSeparator(choice, i);
	    let msg = choice.message;

	    if (this.align === 'right') msg = msg.padStart(this.longest + 1, ' ');
	    if (this.align === 'left') msg = msg.padEnd(this.longest + 1, ' ');

	    // re-populate the form values (answers) object
	    let value = this.values[name] = (input || initial);
	    let color = input ? 'success' : 'dark';

	    if ((await validate.call(choice, value, this.state)) !== true) {
	      color = 'danger';
	    }

	    let style = styles[color];
	    let indicator = style(await this.indicator(choice, i)) + (choice.pad || '');

	    let indent = this.indent(choice);
	    let line = () => [indent, indicator, msg + sep, input, help].filter(Boolean).join(' ');

	    if (state.submitted) {
	      msg = colors.unstyle(msg);
	      input = submitted(input);
	      help = '';
	      return line();
	    }

	    if (choice.format) {
	      input = await choice.format.call(this, input, choice, i);
	    } else {
	      let color = this.styles.muted;
	      let options = { input, initial, pos: cursor, showCursor: focused, color };
	      input = placeholder(this, options);
	    }

	    if (!this.isValue(input)) {
	      input = this.styles.muted(this.symbols.ellipsis);
	    }

	    if (choice.result) {
	      this.values[name] = await choice.result.call(this, value, choice, i);
	    }

	    if (focused) {
	      msg = primary(msg);
	    }

	    if (choice.error) {
	      input += (input ? ' ' : '') + danger(choice.error.trim());
	    } else if (choice.hint) {
	      input += (input ? ' ' : '') + muted(choice.hint.trim());
	    }

	    return line();
	  }

	  async submit() {
	    this.value = this.values;
	    return super.base.submit.call(this);
	  }
	}

	form = FormPrompt;
	return form;
}

var auth;
var hasRequiredAuth;

function requireAuth () {
	if (hasRequiredAuth) return auth;
	hasRequiredAuth = 1;

	const FormPrompt = requireForm();

	const defaultAuthenticate = () => {
	  throw new Error('expected prompt to have a custom authenticate method');
	};

	const factory = (authenticate = defaultAuthenticate) => {

	  class AuthPrompt extends FormPrompt {
	    constructor(options) {
	      super(options);
	    }

	    async submit() {
	      this.value = await authenticate.call(this, this.values, this.state);
	      super.base.submit.call(this);
	    }

	    static create(authenticate) {
	      return factory(authenticate);
	    }
	  }

	  return AuthPrompt;
	};

	auth = factory();
	return auth;
}

var basicauth;
var hasRequiredBasicauth;

function requireBasicauth () {
	if (hasRequiredBasicauth) return basicauth;
	hasRequiredBasicauth = 1;

	const AuthPrompt = requireAuth();

	function defaultAuthenticate(value, state) {
	  if (value.username === this.options.username && value.password === this.options.password) {
	    return true;
	  }
	  return false;
	}

	const factory = (authenticate = defaultAuthenticate) => {
	  const choices = [
	    { name: 'username', message: 'username' },
	    {
	      name: 'password',
	      message: 'password',
	      format(input) {
	        if (this.options.showPassword) {
	          return input;
	        }
	        let color = this.state.submitted ? this.styles.primary : this.styles.muted;
	        return color(this.symbols.asterisk.repeat(input.length));
	      }
	    }
	  ];

	  class BasicAuthPrompt extends AuthPrompt.create(authenticate) {
	    constructor(options) {
	      super({ ...options, choices });
	    }

	    static create(authenticate) {
	      return factory(authenticate);
	    }
	  }

	  return BasicAuthPrompt;
	};

	basicauth = factory();
	return basicauth;
}

var boolean;
var hasRequiredBoolean;

function requireBoolean () {
	if (hasRequiredBoolean) return boolean;
	hasRequiredBoolean = 1;

	const Prompt = requirePrompt();
	const { isPrimitive, hasColor } = utils$1;

	class BooleanPrompt extends Prompt {
	  constructor(options) {
	    super(options);
	    this.cursorHide();
	  }

	  async initialize() {
	    let initial = await this.resolve(this.initial, this.state);
	    this.input = await this.cast(initial);
	    await super.initialize();
	  }

	  dispatch(ch) {
	    if (!this.isValue(ch)) return this.alert();
	    this.input = ch;
	    return this.submit();
	  }

	  format(value) {
	    let { styles, state } = this;
	    return !state.submitted ? styles.primary(value) : styles.success(value);
	  }

	  cast(input) {
	    return this.isTrue(input);
	  }

	  isTrue(input) {
	    return /^[ty1]/i.test(input);
	  }

	  isFalse(input) {
	    return /^[fn0]/i.test(input);
	  }

	  isValue(value) {
	    return isPrimitive(value) && (this.isTrue(value) || this.isFalse(value));
	  }

	  async hint() {
	    if (this.state.status === 'pending') {
	      let hint = await this.element('hint');
	      if (!hasColor(hint)) {
	        return this.styles.muted(hint);
	      }
	      return hint;
	    }
	  }

	  async render() {
	    let { input, size } = this.state;

	    let prefix = await this.prefix();
	    let sep = await this.separator();
	    let msg = await this.message();
	    let hint = this.styles.muted(this.default);

	    let promptLine = [prefix, msg, hint, sep].filter(Boolean).join(' ');
	    this.state.prompt = promptLine;

	    let header = await this.header();
	    let value = this.value = this.cast(input);
	    let output = await this.format(value);
	    let help = (await this.error()) || (await this.hint());
	    let footer = await this.footer();

	    if (help && !promptLine.includes(help)) output += ' ' + help;
	    promptLine += ' ' + output;

	    this.clear(size);
	    this.write([header, promptLine, footer].filter(Boolean).join('\n'));
	    this.restore();
	  }

	  set value(value) {
	    super.value = value;
	  }
	  get value() {
	    return this.cast(super.value);
	  }
	}

	boolean = BooleanPrompt;
	return boolean;
}

var confirm;
var hasRequiredConfirm;

function requireConfirm () {
	if (hasRequiredConfirm) return confirm;
	hasRequiredConfirm = 1;

	const BooleanPrompt = requireBoolean();

	class ConfirmPrompt extends BooleanPrompt {
	  constructor(options) {
	    super(options);
	    this.default = this.options.default || (this.initial ? '(Y/n)' : '(y/N)');
	  }
	}

	confirm = ConfirmPrompt;
	return confirm;
}

var editable;
var hasRequiredEditable;

function requireEditable () {
	if (hasRequiredEditable) return editable;
	hasRequiredEditable = 1;

	const Select = requireSelect();
	const Form = requireForm();
	const form = Form.prototype;

	class Editable extends Select {
	  constructor(options) {
	    super({ ...options, multiple: true });
	    this.align = [this.options.align, 'left'].find(v => v != null);
	    this.emptyError = '';
	    this.values = {};
	  }

	  dispatch(char, key) {
	    let choice = this.focused;
	    let parent = choice.parent || {};
	    if (!choice.editable && !parent.editable) {
	      if (char === 'a' || char === 'i') return super[char]();
	    }
	    return form.dispatch.call(this, char, key);
	  }

	  append(char, key) {
	    return form.append.call(this, char, key);
	  }

	  delete(char, key) {
	    return form.delete.call(this, char, key);
	  }

	  space(char) {
	    return this.focused.editable ? this.append(char) : super.space();
	  }

	  number(char) {
	    return this.focused.editable ? this.append(char) : super.number(char);
	  }

	  next() {
	    return this.focused.editable ? form.next.call(this) : super.next();
	  }

	  prev() {
	    return this.focused.editable ? form.prev.call(this) : super.prev();
	  }

	  async indicator(choice, i) {
	    let symbol = choice.indicator || '';
	    let value = choice.editable ? symbol : super.indicator(choice, i);
	    return await this.resolve(value, this.state, choice, i) || '';
	  }

	  indent(choice) {
	    return choice.role === 'heading' ? '' : (choice.editable ? ' ' : '  ');
	  }

	  async renderChoice(choice, i) {
	    choice.indent = '';
	    if (choice.editable) return form.renderChoice.call(this, choice, i);
	    return super.renderChoice(choice, i);
	  }

	  error() {
	    return '';
	  }

	  footer() {
	    return this.state.error;
	  }

	  async validate() {
	    let result = true;

	    for (let choice of this.choices) {
	      if (typeof choice.validate !== 'function') {
	        continue;
	      }

	      if (choice.role === 'heading') {
	        continue;
	      }

	      let val = choice.parent ? this.value[choice.parent.name] : this.value;

	      if (choice.editable) {
	        val = choice.value === choice.name ? choice.initial || '' : choice.value;
	      } else if (!this.isDisabled(choice)) {
	        val = choice.enabled === true;
	      }

	      result = await choice.validate(val, this.state);

	      if (result !== true) {
	        break;
	      }
	    }

	    if (result !== true) {
	      this.state.error = typeof result === 'string' ? result : 'Invalid Input';
	    }

	    return result;
	  }

	  submit() {
	    if (this.focused.newChoice === true) return super.submit();
	    if (this.choices.some(ch => ch.newChoice)) {
	      return this.alert();
	    }

	    this.value = {};

	    for (let choice of this.choices) {
	      let val = choice.parent ? this.value[choice.parent.name] : this.value;

	      if (choice.role === 'heading') {
	        this.value[choice.name] = {};
	        continue;
	      }

	      if (choice.editable) {
	        val[choice.name] = choice.value === choice.name
	          ? (choice.initial || '')
	          : choice.value;

	      } else if (!this.isDisabled(choice)) {
	        val[choice.name] = choice.enabled === true;
	      }
	    }

	    return this.base.submit.call(this);
	  }
	}

	editable = Editable;
	return editable;
}

var string;
var hasRequiredString;

function requireString () {
	if (hasRequiredString) return string;
	hasRequiredString = 1;

	const Prompt = requirePrompt();
	const placeholder = requirePlaceholder();
	const { isPrimitive } = utils$1;

	class StringPrompt extends Prompt {
	  constructor(options) {
	    super(options);
	    this.initial = isPrimitive(this.initial) ? String(this.initial) : '';
	    if (this.initial) this.cursorHide();
	    this.state.prevCursor = 0;
	    this.state.clipboard = [];
	  }

	  async keypress(input, key = {}) {
	    let prev = this.state.prevKeypress;
	    this.state.prevKeypress = key;
	    if (this.options.multiline === true && key.name === 'return') {
	      if (!prev || prev.name !== 'return') {
	        return this.append('\n', key);
	      }
	    }
	    return super.keypress(input, key);
	  }

	  moveCursor(n) {
	    this.cursor += n;
	  }

	  reset() {
	    this.input = this.value = '';
	    this.cursor = 0;
	    return this.render();
	  }

	  dispatch(ch, key) {
	    if (!ch || key.ctrl || key.code) return this.alert();
	    this.append(ch);
	  }

	  append(ch) {
	    let { cursor, input } = this.state;
	    this.input = `${input}`.slice(0, cursor) + ch + `${input}`.slice(cursor);
	    this.moveCursor(String(ch).length);
	    this.render();
	  }

	  insert(str) {
	    this.append(str);
	  }

	  delete() {
	    let { cursor, input } = this.state;
	    if (cursor <= 0) return this.alert();
	    this.input = `${input}`.slice(0, cursor - 1) + `${input}`.slice(cursor);
	    this.moveCursor(-1);
	    this.render();
	  }

	  deleteForward() {
	    let { cursor, input } = this.state;
	    if (input[cursor] === void 0) return this.alert();
	    this.input = `${input}`.slice(0, cursor) + `${input}`.slice(cursor + 1);
	    this.render();
	  }

	  cutForward() {
	    let pos = this.cursor;
	    if (this.input.length <= pos) return this.alert();
	    this.state.clipboard.push(this.input.slice(pos));
	    this.input = this.input.slice(0, pos);
	    this.render();
	  }

	  cutLeft() {
	    let pos = this.cursor;
	    if (pos === 0) return this.alert();
	    let before = this.input.slice(0, pos);
	    let after = this.input.slice(pos);
	    let words = before.split(' ');
	    this.state.clipboard.push(words.pop());
	    this.input = words.join(' ');
	    this.cursor = this.input.length;
	    this.input += after;
	    this.render();
	  }

	  paste() {
	    if (!this.state.clipboard.length) return this.alert();
	    this.insert(this.state.clipboard.pop());
	    this.render();
	  }

	  toggleCursor() {
	    if (this.state.prevCursor) {
	      this.cursor = this.state.prevCursor;
	      this.state.prevCursor = 0;
	    } else {
	      this.state.prevCursor = this.cursor;
	      this.cursor = 0;
	    }
	    this.render();
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.input.length - 1;
	    this.render();
	  }

	  next() {
	    let init = this.initial != null ? String(this.initial) : '';
	    if (!init || !init.startsWith(this.input)) return this.alert();
	    this.input = this.initial;
	    this.cursor = this.initial.length;
	    this.render();
	  }

	  prev() {
	    if (!this.input) return this.alert();
	    this.reset();
	  }

	  backward() {
	    return this.left();
	  }

	  forward() {
	    return this.right();
	  }

	  right() {
	    if (this.cursor >= this.input.length) return this.alert();
	    this.moveCursor(1);
	    return this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.alert();
	    this.moveCursor(-1);
	    return this.render();
	  }

	  isValue(value) {
	    return !!value;
	  }

	  async format(input = this.value) {
	    let initial = await this.resolve(this.initial, this.state);
	    if (!this.state.submitted) {
	      return placeholder(this, { input, initial, pos: this.cursor });
	    }
	    return this.styles.submitted(input || initial);
	  }

	  async render() {
	    let size = this.state.size;

	    let prefix = await this.prefix();
	    let separator = await this.separator();
	    let message = await this.message();

	    let prompt = [prefix, message, separator].filter(Boolean).join(' ');
	    this.state.prompt = prompt;

	    let header = await this.header();
	    let output = await this.format();
	    let help = (await this.error()) || (await this.hint());
	    let footer = await this.footer();

	    if (help && !output.includes(help)) output += ' ' + help;
	    prompt += ' ' + output;

	    this.clear(size);
	    this.write([header, prompt, footer].filter(Boolean).join('\n'));
	    this.restore();
	  }
	}

	string = StringPrompt;
	return string;
}

var completer;
var hasRequiredCompleter;

function requireCompleter () {
	if (hasRequiredCompleter) return completer;
	hasRequiredCompleter = 1;

	const unique = arr => arr.filter((v, i) => arr.lastIndexOf(v) === i);
	const compact = arr => unique(arr).filter(Boolean);

	completer = (action, data = {}, value = '') => {
	  let { past = [], present = '' } = data;
	  let rest, prev;

	  switch (action) {
	    case 'prev':
	    case 'undo':
	      rest = past.slice(0, past.length - 1);
	      prev = past[past.length - 1] || '';
	      return {
	        past: compact([value, ...rest]),
	        present: prev
	      };

	    case 'next':
	    case 'redo':
	      rest = past.slice(1);
	      prev = past[0] || '';
	      return {
	        past: compact([...rest, value]),
	        present: prev
	      };

	    case 'save':
	      return {
	        past: compact([...past, value]),
	        present: ''
	      };

	    case 'remove':
	      prev = compact(past.filter(v => v !== value));
	      present = '';

	      if (prev.length) {
	        present = prev.pop();
	      }

	      return {
	        past: prev,
	        present
	      };

	    default: {
	      throw new Error(`Invalid action: "${action}"`);
	    }
	  }
	};
	return completer;
}

var input;
var hasRequiredInput;

function requireInput () {
	if (hasRequiredInput) return input;
	hasRequiredInput = 1;

	const Prompt = requireString();
	const completer = requireCompleter();

	class Input extends Prompt {
	  constructor(options) {
	    super(options);
	    let history = this.options.history;
	    if (history && history.store) {
	      let initial = history.values || this.initial;
	      this.autosave = !!history.autosave;
	      this.store = history.store;
	      this.data = this.store.get('values') || { past: [], present: initial };
	      this.initial = this.data.present || this.data.past[this.data.past.length - 1];
	    }
	  }

	  completion(action) {
	    if (!this.store) return this.alert();
	    this.data = completer(action, this.data, this.input);
	    if (!this.data.present) return this.alert();
	    this.input = this.data.present;
	    this.cursor = this.input.length;
	    return this.render();
	  }

	  altUp() {
	    return this.completion('prev');
	  }

	  altDown() {
	    return this.completion('next');
	  }

	  prev() {
	    this.save();
	    return super.prev();
	  }

	  save() {
	    if (!this.store) return;
	    this.data = completer('save', this.data, this.input);
	    this.store.set('values', this.data);
	  }

	  submit() {
	    if (this.store && this.autosave === true) {
	      this.save();
	    }
	    return super.submit();
	  }
	}

	input = Input;
	return input;
}

var invisible;
var hasRequiredInvisible;

function requireInvisible () {
	if (hasRequiredInvisible) return invisible;
	hasRequiredInvisible = 1;

	const StringPrompt = requireString();

	class InvisiblePrompt extends StringPrompt {
	  format() {
	    return '';
	  }
	}

	invisible = InvisiblePrompt;
	return invisible;
}

var list;
var hasRequiredList;

function requireList () {
	if (hasRequiredList) return list;
	hasRequiredList = 1;

	const StringPrompt = requireString();

	class ListPrompt extends StringPrompt {
	  constructor(options = {}) {
	    super(options);
	    this.sep = this.options.separator || /, */;
	    this.initial = options.initial || '';
	  }

	  split(input = this.value) {
	    return input ? String(input).split(this.sep) : [];
	  }

	  format() {
	    let style = this.state.submitted ? this.styles.primary : val => val;
	    return this.list.map(style).join(', ');
	  }

	  async submit(value) {
	    let result = this.state.error || await this.validate(this.list, this.state);
	    if (result !== true) {
	      this.state.error = result;
	      return super.submit();
	    }
	    this.value = this.list;
	    return super.submit();
	  }

	  get list() {
	    return this.split();
	  }
	}

	list = ListPrompt;
	return list;
}

var multiselect;
var hasRequiredMultiselect;

function requireMultiselect () {
	if (hasRequiredMultiselect) return multiselect;
	hasRequiredMultiselect = 1;

	const Select = requireSelect();

	class MultiSelect extends Select {
	  constructor(options) {
	    super({ ...options, multiple: true });
	  }
	}

	multiselect = MultiSelect;
	return multiselect;
}

var number;
var hasRequiredNumber;

function requireNumber () {
	if (hasRequiredNumber) return number;
	hasRequiredNumber = 1;

	const StringPrompt = requireString();

	class NumberPrompt extends StringPrompt {
	  constructor(options = {}) {
	    super({ style: 'number', ...options });
	    this.min = this.isValue(options.min) ? this.toNumber(options.min) : -Infinity;
	    this.max = this.isValue(options.max) ? this.toNumber(options.max) : Infinity;
	    this.delay = options.delay != null ? options.delay : 1000;
	    this.float = options.float !== false;
	    this.round = options.round === true || options.float === false;
	    this.major = options.major || 10;
	    this.minor = options.minor || 1;
	    this.initial = options.initial != null ? options.initial : '';
	    this.input = String(this.initial);
	    this.cursor = this.input.length;
	    this.cursorShow();
	  }

	  append(ch) {
	    if (!/[-+.]/.test(ch) || (ch === '.' && this.input.includes('.'))) {
	      return this.alert('invalid number');
	    }
	    return super.append(ch);
	  }

	  number(ch) {
	    return super.append(ch);
	  }

	  next() {
	    if (this.input && this.input !== this.initial) return this.alert();
	    if (!this.isValue(this.initial)) return this.alert();
	    this.input = this.initial;
	    this.cursor = String(this.initial).length;
	    return this.render();
	  }

	  up(number) {
	    let step = number || this.minor;
	    let num = this.toNumber(this.input);
	    if (num > this.max + step) return this.alert();
	    this.input = `${num + step}`;
	    return this.render();
	  }

	  down(number) {
	    let step = number || this.minor;
	    let num = this.toNumber(this.input);
	    if (num < this.min - step) return this.alert();
	    this.input = `${num - step}`;
	    return this.render();
	  }

	  shiftDown() {
	    return this.down(this.major);
	  }

	  shiftUp() {
	    return this.up(this.major);
	  }

	  format(input = this.input) {
	    if (typeof this.options.format === 'function') {
	      return this.options.format.call(this, input);
	    }
	    return this.styles.info(input);
	  }

	  toNumber(value = '') {
	    return this.float ? +value : Math.round(+value);
	  }

	  isValue(value) {
	    return /^[-+]?[0-9]+((\.)|(\.[0-9]+))?$/.test(value);
	  }

	  submit() {
	    let value = [this.input, this.initial].find(v => this.isValue(v));
	    this.value = this.toNumber(value || 0);
	    return super.submit();
	  }
	}

	number = NumberPrompt;
	return number;
}

var numeral;
var hasRequiredNumeral;

function requireNumeral () {
	if (hasRequiredNumeral) return numeral;
	hasRequiredNumeral = 1;
	numeral = requireNumber();
	return numeral;
}

var password;
var hasRequiredPassword;

function requirePassword () {
	if (hasRequiredPassword) return password;
	hasRequiredPassword = 1;

	const StringPrompt = requireString();

	class PasswordPrompt extends StringPrompt {
	  constructor(options) {
	    super(options);
	    this.cursorShow();
	  }

	  format(input = this.input) {
	    if (!this.keypressed) return '';
	    let color = this.state.submitted ? this.styles.primary : this.styles.muted;
	    return color(this.symbols.asterisk.repeat(input.length));
	  }
	}

	password = PasswordPrompt;
	return password;
}

var scale;
var hasRequiredScale;

function requireScale () {
	if (hasRequiredScale) return scale;
	hasRequiredScale = 1;

	const colors = ansiColorsExports;
	const ArrayPrompt = requireArray();
	const utils = utils$1;

	class LikertScale extends ArrayPrompt {
	  constructor(options = {}) {
	    super(options);
	    this.widths = [].concat(options.messageWidth || 50);
	    this.align = [].concat(options.align || 'left');
	    this.linebreak = options.linebreak || false;
	    this.edgeLength = options.edgeLength || 3;
	    this.newline = options.newline || '\n   ';
	    let start = options.startNumber || 1;
	    if (typeof this.scale === 'number') {
	      this.scaleKey = false;
	      this.scale = Array(this.scale).fill(0).map((v, i) => ({ name: i + start }));
	    }
	  }

	  async reset() {
	    this.tableized = false;
	    await super.reset();
	    return this.render();
	  }

	  tableize() {
	    if (this.tableized === true) return;
	    this.tableized = true;
	    let longest = 0;

	    for (let ch of this.choices) {
	      longest = Math.max(longest, ch.message.length);
	      ch.scaleIndex = ch.initial || 2;
	      ch.scale = [];

	      for (let i = 0; i < this.scale.length; i++) {
	        ch.scale.push({ index: i });
	      }
	    }
	    this.widths[0] = Math.min(this.widths[0], longest + 3);
	  }

	  async dispatch(s, key) {
	    if (this.multiple) {
	      return this[key.name] ? await this[key.name](s, key) : await super.dispatch(s, key);
	    }
	    this.alert();
	  }

	  heading(msg, item, i) {
	    return this.styles.strong(msg);
	  }

	  separator() {
	    return this.styles.muted(this.symbols.ellipsis);
	  }

	  right() {
	    let choice = this.focused;
	    if (choice.scaleIndex >= this.scale.length - 1) return this.alert();
	    choice.scaleIndex++;
	    return this.render();
	  }

	  left() {
	    let choice = this.focused;
	    if (choice.scaleIndex <= 0) return this.alert();
	    choice.scaleIndex--;
	    return this.render();
	  }

	  indent() {
	    return '';
	  }

	  format() {
	    if (this.state.submitted) {
	      let values = this.choices.map(ch => this.styles.info(ch.index));
	      return values.join(', ');
	    }
	    return '';
	  }

	  pointer() {
	    return '';
	  }

	  /**
	   * Render the scale "Key". Something like:
	   * @return {String}
	   */

	  renderScaleKey() {
	    if (this.scaleKey === false) return '';
	    if (this.state.submitted) return '';
	    let scale = this.scale.map(item => `   ${item.name} - ${item.message}`);
	    let key = ['', ...scale].map(item => this.styles.muted(item));
	    return key.join('\n');
	  }

	  /**
	   * Render the heading row for the scale.
	   * @return {String}
	   */

	  renderScaleHeading(max) {
	    let keys = this.scale.map(ele => ele.name);
	    if (typeof this.options.renderScaleHeading === 'function') {
	      keys = this.options.renderScaleHeading.call(this, max);
	    }
	    let diff = this.scaleLength - keys.join('').length;
	    let spacing = Math.round(diff / (keys.length - 1));
	    let names = keys.map(key => this.styles.strong(key));
	    let headings = names.join(' '.repeat(spacing));
	    let padding = ' '.repeat(this.widths[0]);
	    return this.margin[3] + padding + this.margin[1] + headings;
	  }

	  /**
	   * Render a scale indicator => ◯ or ◉ by default
	   */

	  scaleIndicator(choice, item, i) {
	    if (typeof this.options.scaleIndicator === 'function') {
	      return this.options.scaleIndicator.call(this, choice, item, i);
	    }
	    let enabled = choice.scaleIndex === item.index;
	    if (item.disabled) return this.styles.hint(this.symbols.radio.disabled);
	    if (enabled) return this.styles.success(this.symbols.radio.on);
	    return this.symbols.radio.off;
	  }

	  /**
	   * Render the actual scale => ◯────◯────◉────◯────◯
	   */

	  renderScale(choice, i) {
	    let scale = choice.scale.map(item => this.scaleIndicator(choice, item, i));
	    let padding = this.term === 'Hyper' ? '' : ' ';
	    return scale.join(padding + this.symbols.line.repeat(this.edgeLength));
	  }

	  /**
	   * Render a choice, including scale =>
	   *   "The website is easy to navigate. ◯───◯───◉───◯───◯"
	   */

	  async renderChoice(choice, i) {
	    await this.onChoice(choice, i);

	    let focused = this.index === i;
	    let pointer = await this.pointer(choice, i);
	    let hint = await choice.hint;

	    if (hint && !utils.hasColor(hint)) {
	      hint = this.styles.muted(hint);
	    }

	    let pad = str => this.margin[3] + str.replace(/\s+$/, '').padEnd(this.widths[0], ' ');
	    let newline = this.newline;
	    let ind = this.indent(choice);
	    let message = await this.resolve(choice.message, this.state, choice, i);
	    let scale = await this.renderScale(choice, i);
	    let margin = this.margin[1] + this.margin[3];
	    this.scaleLength = colors.unstyle(scale).length;
	    this.widths[0] = Math.min(this.widths[0], this.width - this.scaleLength - margin.length);
	    let msg = utils.wordWrap(message, { width: this.widths[0], newline });
	    let lines = msg.split('\n').map(line => pad(line) + this.margin[1]);

	    if (focused) {
	      scale = this.styles.info(scale);
	      lines = lines.map(line => this.styles.info(line));
	    }

	    lines[0] += scale;

	    if (this.linebreak) lines.push('');
	    return [ind + pointer, lines.join('\n')].filter(Boolean);
	  }

	  async renderChoices() {
	    if (this.state.submitted) return '';
	    this.tableize();
	    let choices = this.visible.map(async(ch, i) => await this.renderChoice(ch, i));
	    let visible = await Promise.all(choices);
	    let heading = await this.renderScaleHeading();
	    return this.margin[0] + [heading, ...visible.map(v => v.join(' '))].join('\n');
	  }

	  async render() {
	    let { submitted, size } = this.state;

	    let prefix = await this.prefix();
	    let separator = await this.separator();
	    let message = await this.message();

	    let prompt = '';
	    if (this.options.promptLine !== false) {
	      prompt = [prefix, message, separator, ''].join(' ');
	      this.state.prompt = prompt;
	    }

	    let header = await this.header();
	    let output = await this.format();
	    let key = await this.renderScaleKey();
	    let help = await this.error() || await this.hint();
	    let body = await this.renderChoices();
	    let footer = await this.footer();
	    let err = this.emptyError;

	    if (output) prompt += output;
	    if (help && !prompt.includes(help)) prompt += ' ' + help;

	    if (submitted && !output && !body.trim() && this.multiple && err != null) {
	      prompt += this.styles.danger(err);
	    }

	    this.clear(size);
	    this.write([header, prompt, key, body, footer].filter(Boolean).join('\n'));
	    if (!this.state.submitted) {
	      this.write(this.margin[2]);
	    }
	    this.restore();
	  }

	  submit() {
	    this.value = {};
	    for (let choice of this.choices) {
	      this.value[choice.name] = choice.scaleIndex;
	    }
	    return this.base.submit.call(this);
	  }
	}

	scale = LikertScale;
	return scale;
}

var interpolate;
var hasRequiredInterpolate;

function requireInterpolate () {
	if (hasRequiredInterpolate) return interpolate;
	hasRequiredInterpolate = 1;

	const colors = ansiColorsExports;
	const clean = (str = '') => {
	  return typeof str === 'string' ? str.replace(/^['"]|['"]$/g, '') : '';
	};

	/**
	 * This file contains the interpolation and rendering logic for
	 * the Snippet prompt.
	 */

	class Item {
	  constructor(token) {
	    this.name = token.key;
	    this.field = token.field || {};
	    this.value = clean(token.initial || this.field.initial || '');
	    this.message = token.message || this.name;
	    this.cursor = 0;
	    this.input = '';
	    this.lines = [];
	  }
	}

	const tokenize = async(options = {}, defaults = {}, fn = token => token) => {
	  let unique = new Set();
	  let fields = options.fields || [];
	  let input = options.template;
	  let tabstops = [];
	  let items = [];
	  let keys = [];
	  let line = 1;

	  if (typeof input === 'function') {
	    input = await input();
	  }

	  let i = -1;
	  let next = () => input[++i];
	  let peek = () => input[i + 1];
	  let push = token => {
	    token.line = line;
	    tabstops.push(token);
	  };

	  push({ type: 'bos', value: '' });

	  while (i < input.length - 1) {
	    let value = next();

	    if (/^[^\S\n ]$/.test(value)) {
	      push({ type: 'text', value });
	      continue;
	    }

	    if (value === '\n') {
	      push({ type: 'newline', value });
	      line++;
	      continue;
	    }

	    if (value === '\\') {
	      value += next();
	      push({ type: 'text', value });
	      continue;
	    }

	    if ((value === '$' || value === '#' || value === '{') && peek() === '{') {
	      let n = next();
	      value += n;

	      let token = { type: 'template', open: value, inner: '', close: '', value };
	      let ch;

	      while ((ch = next())) {
	        if (ch === '}') {
	          if (peek() === '}') ch += next();
	          token.value += ch;
	          token.close = ch;
	          break;
	        }

	        if (ch === ':') {
	          token.initial = '';
	          token.key = token.inner;
	        } else if (token.initial !== void 0) {
	          token.initial += ch;
	        }

	        token.value += ch;
	        token.inner += ch;
	      }

	      token.template = token.open + (token.initial || token.inner) + token.close;
	      token.key = token.key || token.inner;

	      if (defaults.hasOwnProperty(token.key)) {
	        token.initial = defaults[token.key];
	      }

	      token = fn(token);
	      push(token);

	      keys.push(token.key);
	      unique.add(token.key);

	      let item = items.find(item => item.name === token.key);
	      token.field = fields.find(ch => ch.name === token.key);

	      if (!item) {
	        item = new Item(token);
	        items.push(item);
	      }

	      item.lines.push(token.line - 1);
	      continue;
	    }

	    let last = tabstops[tabstops.length - 1];
	    if (last.type === 'text' && last.line === line) {
	      last.value += value;
	    } else {
	      push({ type: 'text', value });
	    }
	  }

	  push({ type: 'eos', value: '' });
	  return { input, tabstops, unique, keys, items };
	};

	interpolate = async prompt => {
	  let options = prompt.options;
	  let required = new Set(options.required === true ? [] : (options.required || []));
	  let defaults = { ...options.values, ...options.initial };
	  let { tabstops, items, keys } = await tokenize(options, defaults);

	  let result = createFn('result', prompt);
	  let format = createFn('format', prompt);
	  let isValid = createFn('validate', prompt, options, true);
	  let isVal = prompt.isValue.bind(prompt);

	  return async(state = {}, submitted = false) => {
	    let index = 0;

	    state.required = required;
	    state.items = items;
	    state.keys = keys;
	    state.output = '';

	    let validate = async(value, state, item, index) => {
	      let error = await isValid(value, state, item, index);
	      if (error === false) {
	        return 'Invalid field ' + item.name;
	      }
	      return error;
	    };

	    for (let token of tabstops) {
	      let value = token.value;
	      let key = token.key;

	      if (token.type !== 'template') {
	        if (value) state.output += value;
	        continue;
	      }

	      if (token.type === 'template') {
	        let item = items.find(ch => ch.name === key);

	        if (options.required === true) {
	          state.required.add(item.name);
	        }

	        let val = [item.input, state.values[item.value], item.value, value].find(isVal);
	        let field = item.field || {};
	        let message = field.message || token.inner;

	        if (submitted) {
	          let error = await validate(state.values[key], state, item, index);
	          if ((error && typeof error === 'string') || error === false) {
	            state.invalid.set(key, error);
	            continue;
	          }

	          state.invalid.delete(key);
	          let res = await result(state.values[key], state, item, index);
	          state.output += colors.unstyle(res);
	          continue;
	        }

	        item.placeholder = false;

	        let before = value;
	        value = await format(value, state, item, index);

	        if (val !== value) {
	          state.values[key] = val;
	          value = prompt.styles.typing(val);
	          state.missing.delete(message);

	        } else {
	          state.values[key] = void 0;
	          val = `<${message}>`;
	          value = prompt.styles.primary(val);
	          item.placeholder = true;

	          if (state.required.has(key)) {
	            state.missing.add(message);
	          }
	        }

	        if (state.missing.has(message) && state.validating) {
	          value = prompt.styles.warning(val);
	        }

	        if (state.invalid.has(key) && state.validating) {
	          value = prompt.styles.danger(val);
	        }

	        if (index === state.index) {
	          if (before !== value) {
	            value = prompt.styles.underline(value);
	          } else {
	            value = prompt.styles.heading(colors.unstyle(value));
	          }
	        }

	        index++;
	      }

	      if (value) {
	        state.output += value;
	      }
	    }

	    let lines = state.output.split('\n').map(l => ' ' + l);
	    let len = items.length;
	    let done = 0;

	    for (let item of items) {
	      if (state.invalid.has(item.name)) {
	        item.lines.forEach(i => {
	          if (lines[i][0] !== ' ') return;
	          lines[i] = state.styles.danger(state.symbols.bullet) + lines[i].slice(1);
	        });
	      }

	      if (prompt.isValue(state.values[item.name])) {
	        done++;
	      }
	    }

	    state.completed = ((done / len) * 100).toFixed(0);
	    state.output = lines.join('\n');
	    return state.output;
	  };
	};

	function createFn(prop, prompt, options, fallback) {
	  return (value, state, item, index) => {
	    if (typeof item.field[prop] === 'function') {
	      return item.field[prop].call(prompt, value, state, item, index);
	    }
	    return [fallback, value].find(v => prompt.isValue(v));
	  };
	}
	return interpolate;
}

var snippet;
var hasRequiredSnippet;

function requireSnippet () {
	if (hasRequiredSnippet) return snippet;
	hasRequiredSnippet = 1;

	const colors = ansiColorsExports;
	const interpolate = requireInterpolate();
	const Prompt = requirePrompt();

	class SnippetPrompt extends Prompt {
	  constructor(options) {
	    super(options);
	    this.cursorHide();
	    this.reset(true);
	  }

	  async initialize() {
	    this.interpolate = await interpolate(this);
	    await super.initialize();
	  }

	  async reset(first) {
	    this.state.keys = [];
	    this.state.invalid = new Map();
	    this.state.missing = new Set();
	    this.state.completed = 0;
	    this.state.values = {};

	    if (first !== true) {
	      await this.initialize();
	      await this.render();
	    }
	  }

	  moveCursor(n) {
	    let item = this.getItem();
	    this.cursor += n;
	    item.cursor += n;
	  }

	  dispatch(ch, key) {
	    if (!key.code && !key.ctrl && ch != null && this.getItem()) {
	      this.append(ch, key);
	      return;
	    }
	    this.alert();
	  }

	  append(ch, key) {
	    let item = this.getItem();
	    let prefix = item.input.slice(0, this.cursor);
	    let suffix = item.input.slice(this.cursor);
	    this.input = item.input = `${prefix}${ch}${suffix}`;
	    this.moveCursor(1);
	    this.render();
	  }

	  delete() {
	    let item = this.getItem();
	    if (this.cursor <= 0 || !item.input) return this.alert();
	    let suffix = item.input.slice(this.cursor);
	    let prefix = item.input.slice(0, this.cursor - 1);
	    this.input = item.input = `${prefix}${suffix}`;
	    this.moveCursor(-1);
	    this.render();
	  }

	  increment(i) {
	    return i >= this.state.keys.length - 1 ? 0 : i + 1;
	  }

	  decrement(i) {
	    return i <= 0 ? this.state.keys.length - 1 : i - 1;
	  }

	  first() {
	    this.state.index = 0;
	    this.render();
	  }

	  last() {
	    this.state.index = this.state.keys.length - 1;
	    this.render();
	  }

	  right() {
	    if (this.cursor >= this.input.length) return this.alert();
	    this.moveCursor(1);
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.alert();
	    this.moveCursor(-1);
	    this.render();
	  }

	  prev() {
	    this.state.index = this.decrement(this.state.index);
	    this.getItem();
	    this.render();
	  }

	  next() {
	    this.state.index = this.increment(this.state.index);
	    this.getItem();
	    this.render();
	  }

	  up() {
	    this.prev();
	  }

	  down() {
	    this.next();
	  }

	  format(value) {
	    let color = this.state.completed < 100 ? this.styles.warning : this.styles.success;
	    if (this.state.submitted === true && this.state.completed !== 100) {
	      color = this.styles.danger;
	    }
	    return color(`${this.state.completed}% completed`);
	  }

	  async render() {
	    let { index, keys = [], submitted, size } = this.state;

	    let newline = [this.options.newline, '\n'].find(v => v != null);
	    let prefix = await this.prefix();
	    let separator = await this.separator();
	    let message = await this.message();

	    let prompt = [prefix, message, separator].filter(Boolean).join(' ');
	    this.state.prompt = prompt;

	    let header = await this.header();
	    let error = (await this.error()) || '';
	    let hint = (await this.hint()) || '';
	    let body = submitted ? '' : await this.interpolate(this.state);

	    let key = this.state.key = keys[index] || '';
	    let input = await this.format(key);
	    let footer = await this.footer();
	    if (input) prompt += ' ' + input;
	    if (hint && !input && this.state.completed === 0) prompt += ' ' + hint;

	    this.clear(size);
	    let lines = [header, prompt, body, footer, error.trim()];
	    this.write(lines.filter(Boolean).join(newline));
	    this.restore();
	  }

	  getItem(name) {
	    let { items, keys, index } = this.state;
	    let item = items.find(ch => ch.name === keys[index]);
	    if (item && item.input != null) {
	      this.input = item.input;
	      this.cursor = item.cursor;
	    }
	    return item;
	  }

	  async submit() {
	    if (typeof this.interpolate !== 'function') await this.initialize();
	    await this.interpolate(this.state, true);

	    let { invalid, missing, output, values } = this.state;
	    if (invalid.size) {
	      let err = '';
	      for (let [key, value] of invalid) err += `Invalid ${key}: ${value}\n`;
	      this.state.error = err;
	      return super.submit();
	    }

	    if (missing.size) {
	      this.state.error = 'Required: ' + [...missing.keys()].join(', ');
	      return super.submit();
	    }

	    let lines = colors.unstyle(output).split('\n');
	    let result = lines.map(v => v.slice(1)).join('\n');
	    this.value = { values, result };
	    return super.submit();
	  }
	}

	snippet = SnippetPrompt;
	return snippet;
}

var sort;
var hasRequiredSort;

function requireSort () {
	if (hasRequiredSort) return sort;
	hasRequiredSort = 1;

	const hint = '(Use <shift>+<up/down> to sort)';
	const Prompt = requireSelect();

	class Sort extends Prompt {
	  constructor(options) {
	    super({ ...options, reorder: false, sort: true, multiple: true });
	    this.state.hint = [this.options.hint, hint].find(this.isValue.bind(this));
	  }

	  indicator() {
	    return '';
	  }

	  async renderChoice(choice, i) {
	    let str = await super.renderChoice(choice, i);
	    let sym = this.symbols.identicalTo + ' ';
	    let pre = (this.index === i && this.sorting) ? this.styles.muted(sym) : '  ';
	    if (this.options.drag === false) pre = '';
	    if (this.options.numbered === true) {
	      return pre + `${i + 1} - ` + str;
	    }
	    return pre + str;
	  }

	  get selected() {
	    return this.choices;
	  }

	  submit() {
	    this.value = this.choices.map(choice => choice.value);
	    return super.submit();
	  }
	}

	sort = Sort;
	return sort;
}

var survey;
var hasRequiredSurvey;

function requireSurvey () {
	if (hasRequiredSurvey) return survey;
	hasRequiredSurvey = 1;

	const ArrayPrompt = requireArray();

	class Survey extends ArrayPrompt {
	  constructor(options = {}) {
	    super(options);
	    this.emptyError = options.emptyError || 'No items were selected';
	    this.term = process.env.TERM_PROGRAM;

	    if (!this.options.header) {
	      let header = ['', '4 - Strongly Agree', '3 - Agree', '2 - Neutral', '1 - Disagree', '0 - Strongly Disagree', ''];
	      header = header.map(ele => this.styles.muted(ele));
	      this.state.header = header.join('\n   ');
	    }
	  }

	  async toChoices(...args) {
	    if (this.createdScales) return false;
	    this.createdScales = true;
	    let choices = await super.toChoices(...args);
	    for (let choice of choices) {
	      choice.scale = createScale(5, this.options);
	      choice.scaleIdx = 2;
	    }
	    return choices;
	  }

	  dispatch() {
	    this.alert();
	  }

	  space() {
	    let choice = this.focused;
	    let ele = choice.scale[choice.scaleIdx];
	    let selected = ele.selected;
	    choice.scale.forEach(e => (e.selected = false));
	    ele.selected = !selected;
	    return this.render();
	  }

	  indicator() {
	    return '';
	  }

	  pointer() {
	    return '';
	  }

	  separator() {
	    return this.styles.muted(this.symbols.ellipsis);
	  }

	  right() {
	    let choice = this.focused;
	    if (choice.scaleIdx >= choice.scale.length - 1) return this.alert();
	    choice.scaleIdx++;
	    return this.render();
	  }

	  left() {
	    let choice = this.focused;
	    if (choice.scaleIdx <= 0) return this.alert();
	    choice.scaleIdx--;
	    return this.render();
	  }

	  indent() {
	    return '   ';
	  }

	  async renderChoice(item, i) {
	    await this.onChoice(item, i);
	    let focused = this.index === i;
	    let isHyper = this.term === 'Hyper';
	    let n = !isHyper ? 8 : 9;
	    let s = !isHyper ? ' ' : '';
	    let ln = this.symbols.line.repeat(n);
	    let sp = ' '.repeat(n + (isHyper ? 0 : 1));
	    let dot = enabled => (enabled ? this.styles.success('◉') : '◯') + s;

	    let num = i + 1 + '.';
	    let color = focused ? this.styles.heading : this.styles.noop;
	    let msg = await this.resolve(item.message, this.state, item, i);
	    let indent = this.indent(item);
	    let scale = indent + item.scale.map((e, i) => dot(i === item.scaleIdx)).join(ln);
	    let val = i => i === item.scaleIdx ? color(i) : i;
	    let next = indent + item.scale.map((e, i) => val(i)).join(sp);

	    let line = () => [num, msg].filter(Boolean).join(' ');
	    let lines = () => [line(), scale, next, ' '].filter(Boolean).join('\n');

	    if (focused) {
	      scale = this.styles.cyan(scale);
	      next = this.styles.cyan(next);
	    }

	    return lines();
	  }

	  async renderChoices() {
	    if (this.state.submitted) return '';
	    let choices = this.visible.map(async(ch, i) => await this.renderChoice(ch, i));
	    let visible = await Promise.all(choices);
	    if (!visible.length) visible.push(this.styles.danger('No matching choices'));
	    return visible.join('\n');
	  }

	  format() {
	    if (this.state.submitted) {
	      let values = this.choices.map(ch => this.styles.info(ch.scaleIdx));
	      return values.join(', ');
	    }
	    return '';
	  }

	  async render() {
	    let { submitted, size } = this.state;

	    let prefix = await this.prefix();
	    let separator = await this.separator();
	    let message = await this.message();

	    let prompt = [prefix, message, separator].filter(Boolean).join(' ');
	    this.state.prompt = prompt;

	    let header = await this.header();
	    let output = await this.format();
	    let help = await this.error() || await this.hint();
	    let body = await this.renderChoices();
	    let footer = await this.footer();

	    if (output || !help) prompt += ' ' + output;
	    if (help && !prompt.includes(help)) prompt += ' ' + help;

	    if (submitted && !output && !body && this.multiple && this.type !== 'form') {
	      prompt += this.styles.danger(this.emptyError);
	    }

	    this.clear(size);
	    this.write([prompt, header, body, footer].filter(Boolean).join('\n'));
	    this.restore();
	  }

	  submit() {
	    this.value = {};
	    for (let choice of this.choices) {
	      this.value[choice.name] = choice.scaleIdx;
	    }
	    return this.base.submit.call(this);
	  }
	}

	function createScale(n, options = {}) {
	  if (Array.isArray(options.scale)) {
	    return options.scale.map(ele => ({ ...ele }));
	  }
	  let scale = [];
	  for (let i = 1; i < n + 1; i++) scale.push({ i, selected: false });
	  return scale;
	}

	survey = Survey;
	return survey;
}

var text;
var hasRequiredText;

function requireText () {
	if (hasRequiredText) return text;
	hasRequiredText = 1;
	text = requireInput();
	return text;
}

var toggle;
var hasRequiredToggle;

function requireToggle () {
	if (hasRequiredToggle) return toggle;
	hasRequiredToggle = 1;

	const BooleanPrompt = requireBoolean();

	class TogglePrompt extends BooleanPrompt {
	  async initialize() {
	    await super.initialize();
	    this.value = this.initial = !!this.options.initial;
	    this.disabled = this.options.disabled || 'no';
	    this.enabled = this.options.enabled || 'yes';
	    await this.render();
	  }

	  reset() {
	    this.value = this.initial;
	    this.render();
	  }

	  delete() {
	    this.alert();
	  }

	  toggle() {
	    this.value = !this.value;
	    this.render();
	  }

	  enable() {
	    if (this.value === true) return this.alert();
	    this.value = true;
	    this.render();
	  }
	  disable() {
	    if (this.value === false) return this.alert();
	    this.value = false;
	    this.render();
	  }

	  up() {
	    this.toggle();
	  }
	  down() {
	    this.toggle();
	  }
	  right() {
	    this.toggle();
	  }
	  left() {
	    this.toggle();
	  }
	  next() {
	    this.toggle();
	  }
	  prev() {
	    this.toggle();
	  }

	  dispatch(ch = '', key) {
	    switch (ch.toLowerCase()) {
	      case ' ':
	        return this.toggle();
	      case '1':
	      case 'y':
	      case 't':
	        return this.enable();
	      case '0':
	      case 'n':
	      case 'f':
	        return this.disable();
	      default: {
	        return this.alert();
	      }
	    }
	  }

	  format() {
	    let active = str => this.styles.primary.underline(str);
	    let value = [
	      this.value ? this.disabled : active(this.disabled),
	      this.value ? active(this.enabled) : this.enabled
	    ];
	    return value.join(this.styles.muted(' / '));
	  }

	  async render() {
	    let { size } = this.state;

	    let header = await this.header();
	    let prefix = await this.prefix();
	    let separator = await this.separator();
	    let message = await this.message();

	    let output = await this.format();
	    let help = (await this.error()) || (await this.hint());
	    let footer = await this.footer();

	    let prompt = [prefix, message, separator, output].join(' ');
	    this.state.prompt = prompt;

	    if (help && !prompt.includes(help)) prompt += ' ' + help;

	    this.clear(size);
	    this.write([header, prompt, footer].filter(Boolean).join('\n'));
	    this.write(this.margin[2]);
	    this.restore();
	  }
	}

	toggle = TogglePrompt;
	return toggle;
}

var quiz;
var hasRequiredQuiz;

function requireQuiz () {
	if (hasRequiredQuiz) return quiz;
	hasRequiredQuiz = 1;

	const SelectPrompt = requireSelect();

	class Quiz extends SelectPrompt {
	  constructor(options) {
	    super(options);
	    if (typeof this.options.correctChoice !== 'number' || this.options.correctChoice < 0) {
	      throw new Error('Please specify the index of the correct answer from the list of choices');
	    }
	  }

	  async toChoices(value, parent) {
	    let choices = await super.toChoices(value, parent);
	    if (choices.length < 2) {
	      throw new Error('Please give at least two choices to the user');
	    }
	    if (this.options.correctChoice > choices.length) {
	      throw new Error('Please specify the index of the correct answer from the list of choices');
	    }
	    return choices;
	  }

	  check(state) {
	    return state.index === this.options.correctChoice;
	  }

	  async result(selected) {
	    return {
	      selectedAnswer: selected,
	      correctAnswer: this.options.choices[this.options.correctChoice].value,
	      correct: await this.check(this.state)
	    };
	  }
	}

	quiz = Quiz;
	return quiz;
}

var hasRequiredPrompts;

function requirePrompts () {
	if (hasRequiredPrompts) return prompts$1;
	hasRequiredPrompts = 1;
	(function (exports) {

		const utils = utils$1;

		const define = (key, fn) => {
		  utils.defineExport(exports, key, fn);
		  utils.defineExport(exports, key.toLowerCase(), fn);
		};

		define('AutoComplete', () => requireAutocomplete());
		define('BasicAuth', () => requireBasicauth());
		define('Confirm', () => requireConfirm());
		define('Editable', () => requireEditable());
		define('Form', () => requireForm());
		define('Input', () => requireInput());
		define('Invisible', () => requireInvisible());
		define('List', () => requireList());
		define('MultiSelect', () => requireMultiselect());
		define('Numeral', () => requireNumeral());
		define('Password', () => requirePassword());
		define('Scale', () => requireScale());
		define('Select', () => requireSelect());
		define('Snippet', () => requireSnippet());
		define('Sort', () => requireSort());
		define('Survey', () => requireSurvey());
		define('Text', () => requireText());
		define('Toggle', () => requireToggle());
		define('Quiz', () => requireQuiz()); 
	} (prompts$1));
	return prompts$1;
}

var types;
var hasRequiredTypes;

function requireTypes () {
	if (hasRequiredTypes) return types;
	hasRequiredTypes = 1;
	types = {
	  ArrayPrompt: requireArray(),
	  AuthPrompt: requireAuth(),
	  BooleanPrompt: requireBoolean(),
	  NumberPrompt: requireNumber(),
	  StringPrompt: requireString()
	};
	return types;
}

const assert$1 = require$$0$4;
const Events = require$$0;
const utils = utils$1;

/**
 * Create an instance of `Enquirer`.
 *
 * ```js
 * const Enquirer = require('enquirer');
 * const enquirer = new Enquirer();
 * ```
 * @name Enquirer
 * @param {Object} `options` (optional) Options to use with all prompts.
 * @param {Object} `answers` (optional) Answers object to initialize with.
 * @api public
 */

class Enquirer extends Events {
  constructor(options, answers) {
    super();
    this.options = utils.merge({}, options);
    this.answers = { ...answers };
  }

  /**
   * Register a custom prompt type.
   *
   * ```js
   * const Enquirer = require('enquirer');
   * const enquirer = new Enquirer();
   * enquirer.register('customType', require('./custom-prompt'));
   * ```
   * @name register()
   * @param {String} `type`
   * @param {Function|Prompt} `fn` `Prompt` class, or a function that returns a `Prompt` class.
   * @return {Object} Returns the Enquirer instance
   * @api public
   */

  register(type, fn) {
    if (utils.isObject(type)) {
      for (let key of Object.keys(type)) this.register(key, type[key]);
      return this;
    }
    assert$1.equal(typeof fn, 'function', 'expected a function');
    let name = type.toLowerCase();
    if (fn.prototype instanceof this.Prompt) {
      this.prompts[name] = fn;
    } else {
      this.prompts[name] = fn(this.Prompt, this);
    }
    return this;
  }

  /**
   * Prompt function that takes a "question" object or array of question objects,
   * and returns an object with responses from the user.
   *
   * ```js
   * const Enquirer = require('enquirer');
   * const enquirer = new Enquirer();
   *
   * const response = await enquirer.prompt({
   *   type: 'input',
   *   name: 'username',
   *   message: 'What is your username?'
   * });
   * console.log(response);
   * ```
   * @name prompt()
   * @param {Array|Object} `questions` Options objects for one or more prompts to run.
   * @return {Promise} Promise that returns an "answers" object with the user's responses.
   * @api public
   */

  async prompt(questions = []) {
    for (let question of [].concat(questions)) {
      try {
        if (typeof question === 'function') question = await question.call(this);
        await this.ask(utils.merge({}, this.options, question));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return this.answers;
  }

  async ask(question) {
    if (typeof question === 'function') {
      question = await question.call(this);
    }

    let opts = utils.merge({}, this.options, question);
    let { type, name } = question;
    let { set, get } = utils;

    if (typeof type === 'function') {
      type = await type.call(this, question, this.answers);
    }

    if (!type) return this.answers[name];

    assert$1(this.prompts[type], `Prompt "${type}" is not registered`);

    let prompt = new this.prompts[type](opts);
    let value = get(this.answers, name);

    prompt.state.answers = this.answers;
    prompt.enquirer = this;

    if (name) {
      prompt.on('submit', value => {
        this.emit('answer', name, value, prompt);
        set(this.answers, name, value);
      });
    }

    // bubble events
    let emit = prompt.emit.bind(prompt);
    prompt.emit = (...args) => {
      this.emit.call(this, ...args);
      return emit(...args);
    };

    this.emit('prompt', prompt, this);

    if (opts.autofill && value != null) {
      prompt.value = prompt.input = value;

      // if "autofill=show" render the prompt, otherwise stay "silent"
      if (opts.autofill === 'show') {
        await prompt.submit();
      }
    } else {
      value = prompt.value = await prompt.run();
    }

    return value;
  }

  /**
   * Use an enquirer plugin.
   *
   * ```js
   * const Enquirer = require('enquirer');
   * const enquirer = new Enquirer();
   * const plugin = enquirer => {
   *   // do stuff to enquire instance
   * };
   * enquirer.use(plugin);
   * ```
   * @name use()
   * @param {Function} `plugin` Plugin function that takes an instance of Enquirer.
   * @return {Object} Returns the Enquirer instance.
   * @api public
   */

  use(plugin) {
    plugin.call(this, this);
    return this;
  }

  set Prompt(value) {
    this._Prompt = value;
  }
  get Prompt() {
    return this._Prompt || this.constructor.Prompt;
  }

  get prompts() {
    return this.constructor.prompts;
  }

  static set Prompt(value) {
    this._Prompt = value;
  }
  static get Prompt() {
    return this._Prompt || requirePrompt();
  }

  static get prompts() {
    return requirePrompts();
  }

  static get types() {
    return requireTypes();
  }

  /**
   * Prompt function that takes a "question" object or array of question objects,
   * and returns an object with responses from the user.
   *
   * ```js
   * const { prompt } = require('enquirer');
   * const response = await prompt({
   *   type: 'input',
   *   name: 'username',
   *   message: 'What is your username?'
   * });
   * console.log(response);
   * ```
   * @name Enquirer#prompt
   * @param {Array|Object} `questions` Options objects for one or more prompts to run.
   * @return {Promise} Promise that returns an "answers" object with the user's responses.
   * @api public
   */

  static get prompt() {
    const fn = (questions, ...rest) => {
      let enquirer = new this(...rest);
      let emit = enquirer.emit.bind(enquirer);
      enquirer.emit = (...args) => {
        fn.emit(...args);
        return emit(...args);
      };
      return enquirer.prompt(questions);
    };
    utils.mixinEmitter(fn, new Events());
    return fn;
  }
}

utils.mixinEmitter(Enquirer, new Events());
const prompts = Enquirer.prompts;

for (let name of Object.keys(prompts)) {
  let key = name.toLowerCase();

  let run = options => new prompts[name](options).run();
  Enquirer.prompt[key] = run;
  Enquirer[key] = run;

  if (!Enquirer[name]) {
    Reflect.defineProperty(Enquirer, name, { get: () => prompts[name] });
  }
}

const exp = name => {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
};

exp('ArrayPrompt');
exp('AuthPrompt');
exp('BooleanPrompt');
exp('NumberPrompt');
exp('StringPrompt');

var enquirer = Enquirer;

var crossSpawn$1 = {exports: {}};

var windows;
var hasRequiredWindows;

function requireWindows () {
	if (hasRequiredWindows) return windows;
	hasRequiredWindows = 1;
	windows = isexe;
	isexe.sync = sync;

	var fs = require$$0$2;

	function checkPathExt (path, options) {
	  var pathext = options.pathExt !== undefined ?
	    options.pathExt : process.env.PATHEXT;

	  if (!pathext) {
	    return true
	  }

	  pathext = pathext.split(';');
	  if (pathext.indexOf('') !== -1) {
	    return true
	  }
	  for (var i = 0; i < pathext.length; i++) {
	    var p = pathext[i].toLowerCase();
	    if (p && path.substr(-p.length).toLowerCase() === p) {
	      return true
	    }
	  }
	  return false
	}

	function checkStat (stat, path, options) {
	  if (!stat.isSymbolicLink() && !stat.isFile()) {
	    return false
	  }
	  return checkPathExt(path, options)
	}

	function isexe (path, options, cb) {
	  fs.stat(path, function (er, stat) {
	    cb(er, er ? false : checkStat(stat, path, options));
	  });
	}

	function sync (path, options) {
	  return checkStat(fs.statSync(path), path, options)
	}
	return windows;
}

var mode;
var hasRequiredMode;

function requireMode () {
	if (hasRequiredMode) return mode;
	hasRequiredMode = 1;
	mode = isexe;
	isexe.sync = sync;

	var fs = require$$0$2;

	function isexe (path, options, cb) {
	  fs.stat(path, function (er, stat) {
	    cb(er, er ? false : checkStat(stat, options));
	  });
	}

	function sync (path, options) {
	  return checkStat(fs.statSync(path), options)
	}

	function checkStat (stat, options) {
	  return stat.isFile() && checkMode(stat, options)
	}

	function checkMode (stat, options) {
	  var mod = stat.mode;
	  var uid = stat.uid;
	  var gid = stat.gid;

	  var myUid = options.uid !== undefined ?
	    options.uid : process.getuid && process.getuid();
	  var myGid = options.gid !== undefined ?
	    options.gid : process.getgid && process.getgid();

	  var u = parseInt('100', 8);
	  var g = parseInt('010', 8);
	  var o = parseInt('001', 8);
	  var ug = u | g;

	  var ret = (mod & o) ||
	    (mod & g) && gid === myGid ||
	    (mod & u) && uid === myUid ||
	    (mod & ug) && myUid === 0;

	  return ret
	}
	return mode;
}

var core;
if (process.platform === 'win32' || commonjsGlobal.TESTING_WINDOWS) {
  core = requireWindows();
} else {
  core = requireMode();
}

var isexe_1 = isexe$1;
isexe$1.sync = sync;

function isexe$1 (path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided')
    }

    return new Promise(function (resolve, reject) {
      isexe$1(path, options || {}, function (er, is) {
        if (er) {
          reject(er);
        } else {
          resolve(is);
        }
      });
    })
  }

  core(path, options || {}, function (er, is) {
    // ignore EACCES because that just means we aren't allowed to run it
    if (er) {
      if (er.code === 'EACCES' || options && options.ignoreErrors) {
        er = null;
        is = false;
      }
    }
    cb(er, is);
  });
}

function sync (path, options) {
  // my kingdom for a filtered catch
  try {
    return core.sync(path, options || {})
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false
    } else {
      throw er
    }
  }
}

const isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys';

const path$2 = require$$0$1;
const COLON = isWindows ? ';' : ':';
const isexe = isexe_1;

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

const getPathInfo = (cmd, opt) => {
  const colon = opt.colon || COLON;

  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? ['']
    : (
      [
        // windows always checks the cwd first
        ...(isWindows ? [process.cwd()] : []),
        ...(opt.path || process.env.PATH ||
          /* istanbul ignore next: very unusual */ '').split(colon),
      ]
    );
  const pathExtExe = isWindows
    ? opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM'
    : '';
  const pathExt = isWindows ? pathExtExe.split(colon) : [''];

  if (isWindows) {
    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
      pathExt.unshift('');
  }

  return {
    pathEnv,
    pathExt,
    pathExtExe,
  }
};

const which$1 = (cmd, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }
  if (!opt)
    opt = {};

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  const step = i => new Promise((resolve, reject) => {
    if (i === pathEnv.length)
      return opt.all && found.length ? resolve(found)
        : reject(getNotFoundError(cmd))

    const ppRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

    const pCmd = path$2.join(pathPart, cmd);
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd;

    resolve(subStep(p, i, 0));
  });

  const subStep = (p, i, ii) => new Promise((resolve, reject) => {
    if (ii === pathExt.length)
      return resolve(step(i + 1))
    const ext = pathExt[ii];
    isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
      if (!er && is) {
        if (opt.all)
          found.push(p + ext);
        else
          return resolve(p + ext)
      }
      return resolve(subStep(p, i, ii + 1))
    });
  });

  return cb ? step(0).then(res => cb(null, res), cb) : step(0)
};

const whichSync = (cmd, opt) => {
  opt = opt || {};

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (let i = 0; i < pathEnv.length; i ++) {
    const ppRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

    const pCmd = path$2.join(pathPart, cmd);
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd;

    for (let j = 0; j < pathExt.length; j ++) {
      const cur = p + pathExt[j];
      try {
        const is = isexe.sync(cur, { pathExt: pathExtExe });
        if (is) {
          if (opt.all)
            found.push(cur);
          else
            return cur
        }
      } catch (ex) {}
    }
  }

  if (opt.all && found.length)
    return found

  if (opt.nothrow)
    return null

  throw getNotFoundError(cmd)
};

var which_1 = which$1;
which$1.sync = whichSync;

var pathKey$2 = {exports: {}};

const pathKey$1 = (options = {}) => {
	const environment = options.env || process.env;
	const platform = options.platform || process.platform;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(environment).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
};

pathKey$2.exports = pathKey$1;
// TODO: Remove this for the next major release
pathKey$2.exports.default = pathKey$1;

var pathKeyExports = pathKey$2.exports;

const path$1 = require$$0$1;
const which = which_1;
const getPathKey = pathKeyExports;

function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    // Worker threads do not have process.chdir()
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;

    // If a custom `cwd` was specified, we need to change the process cwd
    // because `which` will do stat calls but does not support a custom cwd
    if (shouldSwitchCwd) {
        try {
            process.chdir(parsed.options.cwd);
        } catch (err) {
            /* Empty */
        }
    }

    let resolved;

    try {
        resolved = which.sync(parsed.command, {
            path: env[getPathKey({ env })],
            pathExt: withoutPathExt ? path$1.delimiter : undefined,
        });
    } catch (e) {
        /* Empty */
    } finally {
        if (shouldSwitchCwd) {
            process.chdir(cwd);
        }
    }

    // If we successfully resolved, ensure that an absolute path is returned
    // Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
    if (resolved) {
        resolved = path$1.resolve(hasCustomCwd ? parsed.options.cwd : '', resolved);
    }

    return resolved;
}

function resolveCommand$1(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
}

var resolveCommand_1 = resolveCommand$1;

var _escape = {};

// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
}

function escapeArgument(arg, doubleEscapeMetaChars) {
    // Convert to string
    arg = `${arg}`;

    // Algorithm below is based on https://qntm.org/cmd

    // Sequence of backslashes followed by a double quote:
    // double up all the backslashes and escape the double quote
    arg = arg.replace(/(\\*)"/g, '$1$1\\"');

    // Sequence of backslashes followed by the end of the string
    // (which will become a double quote later):
    // double up all the backslashes
    arg = arg.replace(/(\\*)$/, '$1$1');

    // All other backslashes occur literally

    // Quote the whole thing:
    arg = `"${arg}"`;

    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    // Double escape meta chars if necessary
    if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, '^$1');
    }

    return arg;
}

_escape.command = escapeCommand;
_escape.argument = escapeArgument;

var shebangRegex$1 = /^#!(.*)/;

const shebangRegex = shebangRegex$1;

var shebangCommand$1 = (string = '') => {
	const match = string.match(shebangRegex);

	if (!match) {
		return null;
	}

	const [path, argument] = match[0].replace(/#! ?/, '').split(' ');
	const binary = path.split('/').pop();

	if (binary === 'env') {
		return argument;
	}

	return argument ? `${binary} ${argument}` : binary;
};

const fs = require$$0$2;
const shebangCommand = shebangCommand$1;

function readShebang$1(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    const buffer = Buffer.alloc(size);

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    } catch (e) { /* Empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}

var readShebang_1 = readShebang$1;

const path = require$$0$1;
const resolveCommand = resolveCommand_1;
const escape = _escape;
const readShebang = readShebang_1;

const isWin$2 = process.platform === 'win32';
const isExecutableRegExp = /\.(?:com|exe)$/i;
const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

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
    if (!isWin$2) {
        return parsed;
    }

    // Detect & add support for shebangs
    const commandFile = detectShebang(parsed);

    // We don't need a shell if the command filename is an executable
    const needsShell = !isExecutableRegExp.test(commandFile);

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path.normalize(parsed.command);

        // Escape command & arguments
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));

        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parse$4(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original

    // Build our parsed object
    const parsed = {
        command,
        args,
        options,
        file: undefined,
        original: {
            command,
            args,
        },
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parsed : parseNonShell(parsed);
}

var parse_1$1 = parse$4;

const isWin$1 = process.platform === 'win32';

function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args,
    });
}

function hookChildProcess(cp, parsed) {
    if (!isWin$1) {
        return;
    }

    const originalEmit = cp.emit;

    cp.emit = function (name, arg1) {
        // If emitting "exit" event and exit code is 1, we need to check if
        // the command exists and emit an "error" instead
        // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
        if (name === 'exit') {
            const err = verifyENOENT(arg1, parsed);

            if (err) {
                return originalEmit.call(cp, 'error', err);
            }
        }

        return originalEmit.apply(cp, arguments); // eslint-disable-line prefer-rest-params
    };
}

function verifyENOENT(status, parsed) {
    if (isWin$1 && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawn');
    }

    return null;
}

function verifyENOENTSync(status, parsed) {
    if (isWin$1 && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawnSync');
    }

    return null;
}

var enoent$1 = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError,
};

const cp = require$$1;
const parse$3 = parse_1$1;
const enoent = enoent$1;

function spawn(command, args, options) {
    // Parse the arguments
    const parsed = parse$3(command, args, options);

    // Spawn the child process
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    // Parse the arguments
    const parsed = parse$3(command, args, options);

    // Spawn the child process
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

crossSpawn$1.exports = spawn;
crossSpawn$1.exports.spawn = spawn;
crossSpawn$1.exports.sync = spawnSync;

crossSpawn$1.exports._parse = parse$3;
crossSpawn$1.exports._enoent = enoent;

var crossSpawnExports = crossSpawn$1.exports;
var crossSpawn = /*@__PURE__*/getDefaultExportFromCjs(crossSpawnExports);

function stripFinalNewline(input) {
	const LF = typeof input === 'string' ? '\n' : '\n'.charCodeAt();
	const CR = typeof input === 'string' ? '\r' : '\r'.charCodeAt();

	if (input[input.length - 1] === LF) {
		input = input.slice(0, -1);
	}

	if (input[input.length - 1] === CR) {
		input = input.slice(0, -1);
	}

	return input;
}

function pathKey(options = {}) {
	const {
		env = process.env,
		platform = process.platform
	} = options;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(env).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
}

function npmRunPath(options = {}) {
	const {
		cwd = process$4.cwd(),
		path: path_ = process$4.env[pathKey()],
		execPath = process$4.execPath,
	} = options;

	let previous;
	const cwdString = cwd instanceof URL ? url.fileURLToPath(cwd) : cwd;
	let cwdPath = path$4.resolve(cwdString);
	const result = [];

	while (previous !== cwdPath) {
		result.push(path$4.join(cwdPath, 'node_modules/.bin'));
		previous = cwdPath;
		cwdPath = path$4.resolve(cwdPath, '..');
	}

	// Ensure the running `node` binary is used.
	result.push(path$4.resolve(cwdString, execPath, '..'));

	return [...result, path_].join(path$4.delimiter);
}

function npmRunPathEnv({env = process$4.env, ...options} = {}) {
	env = {...env};

	const path = pathKey({env});
	options.path = env[path];
	env[path] = npmRunPath(options);

	return env;
}

const copyProperty = (to, from, property, ignoreNonConfigurable) => {
	// `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
	// `Function#prototype` is non-writable and non-configurable so can never be modified.
	if (property === 'length' || property === 'prototype') {
		return;
	}

	// `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
	if (property === 'arguments' || property === 'caller') {
		return;
	}

	const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
	const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

	if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
		return;
	}

	Object.defineProperty(to, property, fromDescriptor);
};

// `Object.defineProperty()` throws if the property exists, is not configurable and either:
// - one its descriptors is changed
// - it is non-writable and its value is changed
const canCopyProperty = function (toDescriptor, fromDescriptor) {
	return toDescriptor === undefined || toDescriptor.configurable || (
		toDescriptor.writable === fromDescriptor.writable &&
		toDescriptor.enumerable === fromDescriptor.enumerable &&
		toDescriptor.configurable === fromDescriptor.configurable &&
		(toDescriptor.writable || toDescriptor.value === fromDescriptor.value)
	);
};

const changePrototype = (to, from) => {
	const fromPrototype = Object.getPrototypeOf(from);
	if (fromPrototype === Object.getPrototypeOf(to)) {
		return;
	}

	Object.setPrototypeOf(to, fromPrototype);
};

const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name');

// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to, from, name) => {
	const withName = name === '' ? '' : `with ${name.trim()}() `;
	const newToString = wrappedToString.bind(null, withName, from.toString());
	// Ensure `to.toString.toString` is non-enumerable and has the same `same`
	Object.defineProperty(newToString, 'name', toStringName);
	Object.defineProperty(to, 'toString', {...toStringDescriptor, value: newToString});
};

function mimicFunction(to, from, {ignoreNonConfigurable = false} = {}) {
	const {name} = to;

	for (const property of Reflect.ownKeys(from)) {
		copyProperty(to, from, property, ignoreNonConfigurable);
	}

	changePrototype(to, from);
	changeToString(to, from, name);

	return to;
}

const calledFunctions = new WeakMap();

const onetime = (function_, options = {}) => {
	if (typeof function_ !== 'function') {
		throw new TypeError('Expected a function');
	}

	let returnValue;
	let callCount = 0;
	const functionName = function_.displayName || function_.name || '<anonymous>';

	const onetime = function (...arguments_) {
		calledFunctions.set(onetime, ++callCount);

		if (callCount === 1) {
			returnValue = function_.apply(this, arguments_);
			function_ = null;
		} else if (options.throw === true) {
			throw new Error(`Function \`${functionName}\` can only be called once`);
		}

		return returnValue;
	};

	mimicFunction(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime.callCount = function_ => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_);
};

const getRealtimeSignals=()=>{
const length=SIGRTMAX-SIGRTMIN+1;
return Array.from({length},getRealtimeSignal);
};

const getRealtimeSignal=(value,index)=>({
name:`SIGRT${index+1}`,
number:SIGRTMIN+index,
action:"terminate",
description:"Application-specific signal (realtime)",
standard:"posix"
});

const SIGRTMIN=34;
const SIGRTMAX=64;

const SIGNALS=[
{
name:"SIGHUP",
number:1,
action:"terminate",
description:"Terminal closed",
standard:"posix"
},
{
name:"SIGINT",
number:2,
action:"terminate",
description:"User interruption with CTRL-C",
standard:"ansi"
},
{
name:"SIGQUIT",
number:3,
action:"core",
description:"User interruption with CTRL-\\",
standard:"posix"
},
{
name:"SIGILL",
number:4,
action:"core",
description:"Invalid machine instruction",
standard:"ansi"
},
{
name:"SIGTRAP",
number:5,
action:"core",
description:"Debugger breakpoint",
standard:"posix"
},
{
name:"SIGABRT",
number:6,
action:"core",
description:"Aborted",
standard:"ansi"
},
{
name:"SIGIOT",
number:6,
action:"core",
description:"Aborted",
standard:"bsd"
},
{
name:"SIGBUS",
number:7,
action:"core",
description:
"Bus error due to misaligned, non-existing address or paging error",
standard:"bsd"
},
{
name:"SIGEMT",
number:7,
action:"terminate",
description:"Command should be emulated but is not implemented",
standard:"other"
},
{
name:"SIGFPE",
number:8,
action:"core",
description:"Floating point arithmetic error",
standard:"ansi"
},
{
name:"SIGKILL",
number:9,
action:"terminate",
description:"Forced termination",
standard:"posix",
forced:true
},
{
name:"SIGUSR1",
number:10,
action:"terminate",
description:"Application-specific signal",
standard:"posix"
},
{
name:"SIGSEGV",
number:11,
action:"core",
description:"Segmentation fault",
standard:"ansi"
},
{
name:"SIGUSR2",
number:12,
action:"terminate",
description:"Application-specific signal",
standard:"posix"
},
{
name:"SIGPIPE",
number:13,
action:"terminate",
description:"Broken pipe or socket",
standard:"posix"
},
{
name:"SIGALRM",
number:14,
action:"terminate",
description:"Timeout or timer",
standard:"posix"
},
{
name:"SIGTERM",
number:15,
action:"terminate",
description:"Termination",
standard:"ansi"
},
{
name:"SIGSTKFLT",
number:16,
action:"terminate",
description:"Stack is empty or overflowed",
standard:"other"
},
{
name:"SIGCHLD",
number:17,
action:"ignore",
description:"Child process terminated, paused or unpaused",
standard:"posix"
},
{
name:"SIGCLD",
number:17,
action:"ignore",
description:"Child process terminated, paused or unpaused",
standard:"other"
},
{
name:"SIGCONT",
number:18,
action:"unpause",
description:"Unpaused",
standard:"posix",
forced:true
},
{
name:"SIGSTOP",
number:19,
action:"pause",
description:"Paused",
standard:"posix",
forced:true
},
{
name:"SIGTSTP",
number:20,
action:"pause",
description:"Paused using CTRL-Z or \"suspend\"",
standard:"posix"
},
{
name:"SIGTTIN",
number:21,
action:"pause",
description:"Background process cannot read terminal input",
standard:"posix"
},
{
name:"SIGBREAK",
number:21,
action:"terminate",
description:"User interruption with CTRL-BREAK",
standard:"other"
},
{
name:"SIGTTOU",
number:22,
action:"pause",
description:"Background process cannot write to terminal output",
standard:"posix"
},
{
name:"SIGURG",
number:23,
action:"ignore",
description:"Socket received out-of-band data",
standard:"bsd"
},
{
name:"SIGXCPU",
number:24,
action:"core",
description:"Process timed out",
standard:"bsd"
},
{
name:"SIGXFSZ",
number:25,
action:"core",
description:"File too big",
standard:"bsd"
},
{
name:"SIGVTALRM",
number:26,
action:"terminate",
description:"Timeout or timer",
standard:"bsd"
},
{
name:"SIGPROF",
number:27,
action:"terminate",
description:"Timeout or timer",
standard:"bsd"
},
{
name:"SIGWINCH",
number:28,
action:"ignore",
description:"Terminal window size changed",
standard:"bsd"
},
{
name:"SIGIO",
number:29,
action:"terminate",
description:"I/O is available",
standard:"other"
},
{
name:"SIGPOLL",
number:29,
action:"terminate",
description:"Watched event",
standard:"other"
},
{
name:"SIGINFO",
number:29,
action:"ignore",
description:"Request for process information",
standard:"other"
},
{
name:"SIGPWR",
number:30,
action:"terminate",
description:"Device running out of power",
standard:"systemv"
},
{
name:"SIGSYS",
number:31,
action:"core",
description:"Invalid system call",
standard:"other"
},
{
name:"SIGUNUSED",
number:31,
action:"terminate",
description:"Invalid system call",
standard:"other"
}];

const getSignals=()=>{
const realtimeSignals=getRealtimeSignals();
const signals=[...SIGNALS,...realtimeSignals].map(normalizeSignal);
return signals;
};







const normalizeSignal=({
name,
number:defaultNumber,
description,
action,
forced=false,
standard
})=>{
const{
signals:{[name]:constantSignal}
}=os$1.constants;
const supported=constantSignal!==undefined;
const number=supported?constantSignal:defaultNumber;
return {name,number,description,supported,action,forced,standard};
};

const getSignalsByName=()=>{
const signals=getSignals();
return Object.fromEntries(signals.map(getSignalByName));
};

const getSignalByName=({
name,
number,
description,
supported,
action,
forced,
standard
})=>[name,{name,number,description,supported,action,forced,standard}];

const signalsByName=getSignalsByName();




const getSignalsByNumber=()=>{
const signals=getSignals();
const length=SIGRTMAX+1;
const signalsA=Array.from({length},(value,number)=>
getSignalByNumber(number,signals));

return Object.assign({},...signalsA);
};

const getSignalByNumber=(number,signals)=>{
const signal=findSignalByNumber(number,signals);

if(signal===undefined){
return {};
}

const{name,description,supported,action,forced,standard}=signal;
return {
[number]:{
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



const findSignalByNumber=(number,signals)=>{
const signal=signals.find(({name})=>os$1.constants.signals[name]===number);

if(signal!==undefined){
return signal;
}

return signals.find((signalA)=>signalA.number===number);
};

getSignalsByNumber();

const getErrorPrefix = ({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled}) => {
	if (timedOut) {
		return `timed out after ${timeout} milliseconds`;
	}

	if (isCanceled) {
		return 'was canceled';
	}

	if (errorCode !== undefined) {
		return `failed with ${errorCode}`;
	}

	if (signal !== undefined) {
		return `was killed with ${signal} (${signalDescription})`;
	}

	if (exitCode !== undefined) {
		return `failed with exit code ${exitCode}`;
	}

	return 'failed';
};

const makeError = ({
	stdout,
	stderr,
	all,
	error,
	signal,
	exitCode,
	command,
	escapedCommand,
	timedOut,
	isCanceled,
	killed,
	parsed: {options: {timeout}},
}) => {
	// `signal` and `exitCode` emitted on `spawned.on('exit')` event can be `null`.
	// We normalize them to `undefined`
	exitCode = exitCode === null ? undefined : exitCode;
	signal = signal === null ? undefined : signal;
	const signalDescription = signal === undefined ? undefined : signalsByName[signal].description;

	const errorCode = error && error.code;

	const prefix = getErrorPrefix({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled});
	const execaMessage = `Command ${prefix}: ${command}`;
	const isError = Object.prototype.toString.call(error) === '[object Error]';
	const shortMessage = isError ? `${execaMessage}\n${error.message}` : execaMessage;
	const message = [shortMessage, stderr, stdout].filter(Boolean).join('\n');

	if (isError) {
		error.originalMessage = error.message;
		error.message = message;
	} else {
		error = new Error(message);
	}

	error.shortMessage = shortMessage;
	error.command = command;
	error.escapedCommand = escapedCommand;
	error.exitCode = exitCode;
	error.signal = signal;
	error.signalDescription = signalDescription;
	error.stdout = stdout;
	error.stderr = stderr;

	if (all !== undefined) {
		error.all = all;
	}

	if ('bufferedData' in error) {
		delete error.bufferedData;
	}

	error.failed = true;
	error.timedOut = Boolean(timedOut);
	error.isCanceled = isCanceled;
	error.killed = killed && !timedOut;

	return error;
};

const aliases = ['stdin', 'stdout', 'stderr'];

const hasAlias = options => aliases.some(alias => options[alias] !== undefined);

const normalizeStdio = options => {
	if (!options) {
		return;
	}

	const {stdio} = options;

	if (stdio === undefined) {
		return aliases.map(alias => options[alias]);
	}

	if (hasAlias(options)) {
		throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map(alias => `\`${alias}\``).join(', ')}`);
	}

	if (typeof stdio === 'string') {
		return stdio;
	}

	if (!Array.isArray(stdio)) {
		throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	}

	const length = Math.max(stdio.length, aliases.length);
	return Array.from({length}, (value, index) => stdio[index]);
};

var signalExit = {exports: {}};

var signals$1 = {exports: {}};

var hasRequiredSignals;

function requireSignals () {
	if (hasRequiredSignals) return signals$1.exports;
	hasRequiredSignals = 1;
	(function (module) {
		// This is not the set of all possible signals.
		//
		// It IS, however, the set of all signals that trigger
		// an exit on either Linux or BSD systems.  Linux is a
		// superset of the signal names supported on BSD, and
		// the unknown signals just fail to register, so we can
		// catch that easily enough.
		//
		// Don't bother with SIGKILL.  It's uncatchable, which
		// means that we can't fire any callbacks anyway.
		//
		// If a user does happen to register a handler on a non-
		// fatal signal like SIGWINCH or something, and then
		// exit, it'll end up firing `process.emit('exit')`, so
		// the handler will be fired anyway.
		//
		// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
		// artificially, inherently leave the process in a
		// state from which it is not safe to try and enter JS
		// listeners.
		module.exports = [
		  'SIGABRT',
		  'SIGALRM',
		  'SIGHUP',
		  'SIGINT',
		  'SIGTERM'
		];

		if (process.platform !== 'win32') {
		  module.exports.push(
		    'SIGVTALRM',
		    'SIGXCPU',
		    'SIGXFSZ',
		    'SIGUSR2',
		    'SIGTRAP',
		    'SIGSYS',
		    'SIGQUIT',
		    'SIGIOT'
		    // should detect profiler and enable/disable accordingly.
		    // see #21
		    // 'SIGPROF'
		  );
		}

		if (process.platform === 'linux') {
		  module.exports.push(
		    'SIGIO',
		    'SIGPOLL',
		    'SIGPWR',
		    'SIGSTKFLT',
		    'SIGUNUSED'
		  );
		} 
	} (signals$1));
	return signals$1.exports;
}

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
var process$2 = commonjsGlobal.process;

const processOk = function (process) {
  return process &&
    typeof process === 'object' &&
    typeof process.removeListener === 'function' &&
    typeof process.emit === 'function' &&
    typeof process.reallyExit === 'function' &&
    typeof process.listeners === 'function' &&
    typeof process.kill === 'function' &&
    typeof process.pid === 'number' &&
    typeof process.on === 'function'
};

// some kind of non-node environment, just no-op
/* istanbul ignore if */
if (!processOk(process$2)) {
  signalExit.exports = function () {
    return function () {}
  };
} else {
  var assert = require$$0$4;
  var signals = requireSignals();
  var isWin = /^win/i.test(process$2.platform);

  var EE = require$$0;
  /* istanbul ignore if */
  if (typeof EE !== 'function') {
    EE = EE.EventEmitter;
  }

  var emitter;
  if (process$2.__signal_exit_emitter__) {
    emitter = process$2.__signal_exit_emitter__;
  } else {
    emitter = process$2.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }

  // Because this emitter is a global, we have to check to see if a
  // previous version of this library failed to enable infinite listeners.
  // I know what you're about to say.  But literally everything about
  // signal-exit is a compromise with evil.  Get used to it.
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }

  signalExit.exports = function (cb, opts) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return function () {}
    }
    assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

    if (loaded === false) {
      load();
    }

    var ev = 'exit';
    if (opts && opts.alwaysLast) {
      ev = 'afterexit';
    }

    var remove = function () {
      emitter.removeListener(ev, cb);
      if (emitter.listeners('exit').length === 0 &&
          emitter.listeners('afterexit').length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);

    return remove
  };

  var unload = function unload () {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return
    }
    loaded = false;

    signals.forEach(function (sig) {
      try {
        process$2.removeListener(sig, sigListeners[sig]);
      } catch (er) {}
    });
    process$2.emit = originalProcessEmit;
    process$2.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit.exports.unload = unload;

  var emit = function emit (event, code, signal) {
    /* istanbul ignore if */
    if (emitter.emitted[event]) {
      return
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };

  // { <signal>: <listener fn>, ... }
  var sigListeners = {};
  signals.forEach(function (sig) {
    sigListeners[sig] = function listener () {
      /* istanbul ignore if */
      if (!processOk(commonjsGlobal.process)) {
        return
      }
      // If there are no other listeners, an exit is coming!
      // Simplest way: remove us and then re-send the signal.
      // We know that this will kill the process, so we can
      // safely emit now.
      var listeners = process$2.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit('exit', null, sig);
        /* istanbul ignore next */
        emit('afterexit', null, sig);
        /* istanbul ignore next */
        if (isWin && sig === 'SIGHUP') {
          // "SIGHUP" throws an `ENOSYS` error on Windows,
          // so use a supported signal instead
          sig = 'SIGINT';
        }
        /* istanbul ignore next */
        process$2.kill(process$2.pid, sig);
      }
    };
  });

  signalExit.exports.signals = function () {
    return signals
  };

  var loaded = false;

  var load = function load () {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return
    }
    loaded = true;

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    emitter.count += 1;

    signals = signals.filter(function (sig) {
      try {
        process$2.on(sig, sigListeners[sig]);
        return true
      } catch (er) {
        return false
      }
    });

    process$2.emit = processEmit;
    process$2.reallyExit = processReallyExit;
  };
  signalExit.exports.load = load;

  var originalProcessReallyExit = process$2.reallyExit;
  var processReallyExit = function processReallyExit (code) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return
    }
    process$2.exitCode = code || /* istanbul ignore next */ 0;
    emit('exit', process$2.exitCode, null);
    /* istanbul ignore next */
    emit('afterexit', process$2.exitCode, null);
    /* istanbul ignore next */
    originalProcessReallyExit.call(process$2, process$2.exitCode);
  };

  var originalProcessEmit = process$2.emit;
  var processEmit = function processEmit (ev, arg) {
    if (ev === 'exit' && processOk(commonjsGlobal.process)) {
      /* istanbul ignore else */
      if (arg !== undefined) {
        process$2.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      /* istanbul ignore next */
      emit('exit', process$2.exitCode, null);
      /* istanbul ignore next */
      emit('afterexit', process$2.exitCode, null);
      /* istanbul ignore next */
      return ret
    } else {
      return originalProcessEmit.apply(this, arguments)
    }
  };
}

var signalExitExports = signalExit.exports;
var onExit = /*@__PURE__*/getDefaultExportFromCjs(signalExitExports);

const DEFAULT_FORCE_KILL_TIMEOUT = 1000 * 5;

// Monkey-patches `childProcess.kill()` to add `forceKillAfterTimeout` behavior
const spawnedKill = (kill, signal = 'SIGTERM', options = {}) => {
	const killResult = kill(signal);
	setKillTimeout(kill, signal, options, killResult);
	return killResult;
};

const setKillTimeout = (kill, signal, options, killResult) => {
	if (!shouldForceKill(signal, options, killResult)) {
		return;
	}

	const timeout = getForceKillAfterTimeout(options);
	const t = setTimeout(() => {
		kill('SIGKILL');
	}, timeout);

	// Guarded because there's no `.unref()` when `execa` is used in the renderer
	// process in Electron. This cannot be tested since we don't run tests in
	// Electron.
	// istanbul ignore else
	if (t.unref) {
		t.unref();
	}
};

const shouldForceKill = (signal, {forceKillAfterTimeout}, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult;

const isSigterm = signal => signal === os$1.constants.signals.SIGTERM
		|| (typeof signal === 'string' && signal.toUpperCase() === 'SIGTERM');

const getForceKillAfterTimeout = ({forceKillAfterTimeout = true}) => {
	if (forceKillAfterTimeout === true) {
		return DEFAULT_FORCE_KILL_TIMEOUT;
	}

	if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
		throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
	}

	return forceKillAfterTimeout;
};

// `childProcess.cancel()`
const spawnedCancel = (spawned, context) => {
	const killResult = spawned.kill();

	if (killResult) {
		context.isCanceled = true;
	}
};

const timeoutKill = (spawned, signal, reject) => {
	spawned.kill(signal);
	reject(Object.assign(new Error('Timed out'), {timedOut: true, signal}));
};

// `timeout` option handling
const setupTimeout = (spawned, {timeout, killSignal = 'SIGTERM'}, spawnedPromise) => {
	if (timeout === 0 || timeout === undefined) {
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

const validateTimeout = ({timeout}) => {
	if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
		throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
	}
};

// `cleanup` option handling
const setExitHandler = async (spawned, {cleanup, detached}, timedPromise) => {
	if (!cleanup || detached) {
		return timedPromise;
	}

	const removeExitHandler = onExit(() => {
		spawned.kill();
	});

	return timedPromise.finally(() => {
		removeExitHandler();
	});
};

function isStream(stream) {
	return stream !== null
		&& typeof stream === 'object'
		&& typeof stream.pipe === 'function';
}

function isWritableStream(stream) {
	return isStream(stream)
		&& stream.writable !== false
		&& typeof stream._write === 'function'
		&& typeof stream._writableState === 'object';
}

const isExecaChildProcess = target => target instanceof childProcess$1.ChildProcess && typeof target.then === 'function';

const pipeToTarget = (spawned, streamName, target) => {
	if (typeof target === 'string') {
		spawned[streamName].pipe(node_fs.createWriteStream(target));
		return spawned;
	}

	if (isWritableStream(target)) {
		spawned[streamName].pipe(target);
		return spawned;
	}

	if (!isExecaChildProcess(target)) {
		throw new TypeError('The second argument must be a string, a stream or an Execa child process.');
	}

	if (!isWritableStream(target.stdin)) {
		throw new TypeError('The target child process\'s stdin must be available.');
	}

	spawned[streamName].pipe(target.stdin);
	return target;
};

const addPipeMethods = spawned => {
	if (spawned.stdout !== null) {
		spawned.pipeStdout = pipeToTarget.bind(undefined, spawned, 'stdout');
	}

	if (spawned.stderr !== null) {
		spawned.pipeStderr = pipeToTarget.bind(undefined, spawned, 'stderr');
	}

	if (spawned.all !== undefined) {
		spawned.pipeAll = pipeToTarget.bind(undefined, spawned, 'all');
	}
};

var getStream$2 = {exports: {}};

const {PassThrough: PassThroughStream} = require$$0$5;

var bufferStream$1 = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
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

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};

const {constants: BufferConstants} = require$$0$6;
const stream = require$$0$5;
const {promisify} = require$$2;
const bufferStream = bufferStream$1;

const streamPipelinePromisified = promisify(stream.pipeline);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream(inputStream, options) {
	if (!inputStream) {
		throw new Error('Expected a stream');
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;
	const stream = bufferStream(options);

	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			// Don't retrieve an oversized buffer.
			if (error && stream.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		(async () => {
			try {
				await streamPipelinePromisified(inputStream, stream);
				resolve();
			} catch (error) {
				rejectPromise(error);
			}
		})();

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

getStream$2.exports = getStream;
getStream$2.exports.buffer = (stream, options) => getStream(stream, {...options, encoding: 'buffer'});
getStream$2.exports.array = (stream, options) => getStream(stream, {...options, array: true});
getStream$2.exports.MaxBufferError = MaxBufferError;

var getStreamExports = getStream$2.exports;
var getStream$1 = /*@__PURE__*/getDefaultExportFromCjs(getStreamExports);

const { PassThrough } = require$$0$5;

var mergeStream = function (/*streams...*/) {
  var sources = [];
  var output  = new PassThrough({objectMode: true});

  output.setMaxListeners(0);

  output.add = add;
  output.isEmpty = isEmpty;

  output.on('unpipe', remove);

  Array.prototype.slice.call(arguments).forEach(add);

  return output

  function add (source) {
    if (Array.isArray(source)) {
      source.forEach(add);
      return this
    }

    sources.push(source);
    source.once('end', remove.bind(null, source));
    source.once('error', output.emit.bind(output, 'error'));
    source.pipe(output, {end: false});
    return this
  }

  function isEmpty () {
    return sources.length == 0;
  }

  function remove (source) {
    sources = sources.filter(function (it) { return it !== source });
    if (!sources.length && output.readable) { output.end(); }
  }
};

var mergeStream$1 = /*@__PURE__*/getDefaultExportFromCjs(mergeStream);

const validateInputOptions = input => {
	if (input !== undefined) {
		throw new TypeError('The `input` and `inputFile` options cannot be both set.');
	}
};

const getInput = ({input, inputFile}) => {
	if (typeof inputFile !== 'string') {
		return input;
	}

	validateInputOptions(input);
	return node_fs.createReadStream(inputFile);
};

// `input` and `inputFile` option in async mode
const handleInput = (spawned, options) => {
	const input = getInput(options);

	if (input === undefined) {
		return;
	}

	if (isStream(input)) {
		input.pipe(spawned.stdin);
	} else {
		spawned.stdin.end(input);
	}
};

// `all` interleaves `stdout` and `stderr`
const makeAllStream = (spawned, {all}) => {
	if (!all || (!spawned.stdout && !spawned.stderr)) {
		return;
	}

	const mixed = mergeStream$1();

	if (spawned.stdout) {
		mixed.add(spawned.stdout);
	}

	if (spawned.stderr) {
		mixed.add(spawned.stderr);
	}

	return mixed;
};

// On failure, `result.stdout|stderr|all` should contain the currently buffered stream
const getBufferedData = async (stream, streamPromise) => {
	// When `buffer` is `false`, `streamPromise` is `undefined` and there is no buffered data to retrieve
	if (!stream || streamPromise === undefined) {
		return;
	}

	stream.destroy();

	try {
		return await streamPromise;
	} catch (error) {
		return error.bufferedData;
	}
};

const getStreamPromise = (stream, {encoding, buffer, maxBuffer}) => {
	if (!stream || !buffer) {
		return;
	}

	if (encoding) {
		return getStream$1(stream, {encoding, maxBuffer});
	}

	return getStream$1.buffer(stream, {maxBuffer});
};

// Retrieve result of child process: exit code, signal, error, streams (stdout/stderr/all)
const getSpawnedResult = async ({stdout, stderr, all}, {encoding, buffer, maxBuffer}, processDone) => {
	const stdoutPromise = getStreamPromise(stdout, {encoding, buffer, maxBuffer});
	const stderrPromise = getStreamPromise(stderr, {encoding, buffer, maxBuffer});
	const allPromise = getStreamPromise(all, {encoding, buffer, maxBuffer: maxBuffer * 2});

	try {
		return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
	} catch (error) {
		return Promise.all([
			{error, signal: error.signal, timedOut: error.timedOut},
			getBufferedData(stdout, stdoutPromise),
			getBufferedData(stderr, stderrPromise),
			getBufferedData(all, allPromise),
		]);
	}
};

// eslint-disable-next-line unicorn/prefer-top-level-await
const nativePromisePrototype = (async () => {})().constructor.prototype;

const descriptors = ['then', 'catch', 'finally'].map(property => [
	property,
	Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property),
]);

// The return value is a mixin of `childProcess` and `Promise`
const mergePromise = (spawned, promise) => {
	for (const [property, descriptor] of descriptors) {
		// Starting the main `promise` is deferred to avoid consuming streams
		const value = typeof promise === 'function'
			? (...args) => Reflect.apply(descriptor.value, promise(), args)
			: descriptor.value.bind(promise);

		Reflect.defineProperty(spawned, property, {...descriptor, value});
	}
};

// Use promises instead of `child_process` events
const getSpawnedPromise = spawned => new Promise((resolve, reject) => {
	spawned.on('exit', (exitCode, signal) => {
		resolve({exitCode, signal});
	});

	spawned.on('error', error => {
		reject(error);
	});

	if (spawned.stdin) {
		spawned.stdin.on('error', error => {
			reject(error);
		});
	}
});

const normalizeArgs = (file, args = []) => {
	if (!Array.isArray(args)) {
		return [file];
	}

	return [file, ...args];
};

const NO_ESCAPE_REGEXP = /^[\w.-]+$/;
const DOUBLE_QUOTES_REGEXP = /"/g;

const escapeArg = arg => {
	if (typeof arg !== 'string' || NO_ESCAPE_REGEXP.test(arg)) {
		return arg;
	}

	return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
};

const joinCommand = (file, args) => normalizeArgs(file, args).join(' ');

const getEscapedCommand = (file, args) => normalizeArgs(file, args).map(arg => escapeArg(arg)).join(' ');

const verboseDefault = node_util.debuglog('execa').enabled;

const padField = (field, padding) => String(field).padStart(padding, '0');

const getTimestamp = () => {
	const date = new Date();
	return `${padField(date.getHours(), 2)}:${padField(date.getMinutes(), 2)}:${padField(date.getSeconds(), 2)}.${padField(date.getMilliseconds(), 3)}`;
};

const logCommand = (escapedCommand, {verbose}) => {
	if (!verbose) {
		return;
	}

	process$4.stderr.write(`[${getTimestamp()}] ${escapedCommand}\n`);
};

const DEFAULT_MAX_BUFFER = 1000 * 1000 * 100;

const getEnv = ({env: envOption, extendEnv, preferLocal, localDir, execPath}) => {
	const env = extendEnv ? {...process$4.env, ...envOption} : envOption;

	if (preferLocal) {
		return npmRunPathEnv({env, cwd: localDir, execPath});
	}

	return env;
};

const handleArguments = (file, args, options = {}) => {
	const parsed = crossSpawn._parse(file, args, options);
	file = parsed.command;
	args = parsed.args;
	options = parsed.options;

	options = {
		maxBuffer: DEFAULT_MAX_BUFFER,
		buffer: true,
		stripFinalNewline: true,
		extendEnv: true,
		preferLocal: false,
		localDir: options.cwd || process$4.cwd(),
		execPath: process$4.execPath,
		encoding: 'utf8',
		reject: true,
		cleanup: true,
		all: false,
		windowsHide: true,
		verbose: verboseDefault,
		...options,
	};

	options.env = getEnv(options);

	options.stdio = normalizeStdio(options);

	if (process$4.platform === 'win32' && path$4.basename(file, '.exe') === 'cmd') {
		// #116
		args.unshift('/q');
	}

	return {file, args, options, parsed};
};

const handleOutput = (options, value, error) => {
	if (typeof value !== 'string' && !node_buffer.Buffer.isBuffer(value)) {
		// When `execaSync()` errors, we normalize it to '' to mimic `execa()`
		return error === undefined ? undefined : '';
	}

	if (options.stripFinalNewline) {
		return stripFinalNewline(value);
	}

	return value;
};

function execa(file, args, options) {
	const parsed = handleArguments(file, args, options);
	const command = joinCommand(file, args);
	const escapedCommand = getEscapedCommand(file, args);
	logCommand(escapedCommand, parsed.options);

	validateTimeout(parsed.options);

	let spawned;
	try {
		spawned = childProcess$1.spawn(parsed.file, parsed.args, parsed.options);
	} catch (error) {
		// Ensure the returned error is always both a promise and a child process
		const dummySpawned = new childProcess$1.ChildProcess();
		const errorPromise = Promise.reject(makeError({
			error,
			stdout: '',
			stderr: '',
			all: '',
			command,
			escapedCommand,
			parsed,
			timedOut: false,
			isCanceled: false,
			killed: false,
		}));
		mergePromise(dummySpawned, errorPromise);
		return dummySpawned;
	}

	const spawnedPromise = getSpawnedPromise(spawned);
	const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
	const processDone = setExitHandler(spawned, parsed.options, timedPromise);

	const context = {isCanceled: false};

	spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
	spawned.cancel = spawnedCancel.bind(null, spawned, context);

	const handlePromise = async () => {
		const [{error, exitCode, signal, timedOut}, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
		const stdout = handleOutput(parsed.options, stdoutResult);
		const stderr = handleOutput(parsed.options, stderrResult);
		const all = handleOutput(parsed.options, allResult);

		if (error || exitCode !== 0 || signal !== null) {
			const returnedError = makeError({
				error,
				exitCode,
				signal,
				stdout,
				stderr,
				all,
				command,
				escapedCommand,
				parsed,
				timedOut,
				isCanceled: (parsed.options.signal ? parsed.options.signal.aborted : false),
				killed: spawned.killed,
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
			killed: false,
		};
	};

	const handlePromiseOnce = onetime(handlePromise);

	handleInput(spawned, parsed.options);

	spawned.all = makeAllStream(spawned, parsed.options);

	addPipeMethods(spawned);
	mergePromise(spawned, handlePromiseOnce);
	return spawned;
}

function hasKey(obj, keys) {
	var o = obj;
	keys.slice(0, -1).forEach(function (key) {
		o = o[key] || {};
	});

	var key = keys[keys.length - 1];
	return key in o;
}

function isNumber(x) {
	if (typeof x === 'number') { return true; }
	if ((/^0x[0-9a-f]+$/i).test(x)) { return true; }
	return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(x);
}

function isConstructorOrProto(obj, key) {
	return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

var minimist = function (args, opts) {
	if (!opts) { opts = {}; }

	var flags = {
		bools: {},
		strings: {},
		unknownFn: null,
	};

	if (typeof opts.unknown === 'function') {
		flags.unknownFn = opts.unknown;
	}

	if (typeof opts.boolean === 'boolean' && opts.boolean) {
		flags.allBools = true;
	} else {
		[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
			flags.bools[key] = true;
		});
	}

	var aliases = {};

	function aliasIsBoolean(key) {
		return aliases[key].some(function (x) {
			return flags.bools[x];
		});
	}

	Object.keys(opts.alias || {}).forEach(function (key) {
		aliases[key] = [].concat(opts.alias[key]);
		aliases[key].forEach(function (x) {
			aliases[x] = [key].concat(aliases[key].filter(function (y) {
				return x !== y;
			}));
		});
	});

	[].concat(opts.string).filter(Boolean).forEach(function (key) {
		flags.strings[key] = true;
		if (aliases[key]) {
			[].concat(aliases[key]).forEach(function (k) {
				flags.strings[k] = true;
			});
		}
	});

	var defaults = opts.default || {};

	var argv = { _: [] };

	function argDefined(key, arg) {
		return (flags.allBools && (/^--[^=]+$/).test(arg))
			|| flags.strings[key]
			|| flags.bools[key]
			|| aliases[key];
	}

	function setKey(obj, keys, value) {
		var o = obj;
		for (var i = 0; i < keys.length - 1; i++) {
			var key = keys[i];
			if (isConstructorOrProto(o, key)) { return; }
			if (o[key] === undefined) { o[key] = {}; }
			if (
				o[key] === Object.prototype
				|| o[key] === Number.prototype
				|| o[key] === String.prototype
			) {
				o[key] = {};
			}
			if (o[key] === Array.prototype) { o[key] = []; }
			o = o[key];
		}

		var lastKey = keys[keys.length - 1];
		if (isConstructorOrProto(o, lastKey)) { return; }
		if (
			o === Object.prototype
			|| o === Number.prototype
			|| o === String.prototype
		) {
			o = {};
		}
		if (o === Array.prototype) { o = []; }
		if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
			o[lastKey] = value;
		} else if (Array.isArray(o[lastKey])) {
			o[lastKey].push(value);
		} else {
			o[lastKey] = [o[lastKey], value];
		}
	}

	function setArg(key, val, arg) {
		if (arg && flags.unknownFn && !argDefined(key, arg)) {
			if (flags.unknownFn(arg) === false) { return; }
		}

		var value = !flags.strings[key] && isNumber(val)
			? Number(val)
			: val;
		setKey(argv, key.split('.'), value);

		(aliases[key] || []).forEach(function (x) {
			setKey(argv, x.split('.'), value);
		});
	}

	Object.keys(flags.bools).forEach(function (key) {
		setArg(key, defaults[key] === undefined ? false : defaults[key]);
	});

	var notFlags = [];

	if (args.indexOf('--') !== -1) {
		notFlags = args.slice(args.indexOf('--') + 1);
		args = args.slice(0, args.indexOf('--'));
	}

	for (var i = 0; i < args.length; i++) {
		var arg = args[i];
		var key;
		var next;

		if ((/^--.+=/).test(arg)) {
			// Using [\s\S] instead of . because js doesn't support the
			// 'dotall' regex modifier. See:
			// http://stackoverflow.com/a/1068308/13216
			var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
			key = m[1];
			var value = m[2];
			if (flags.bools[key]) {
				value = value !== 'false';
			}
			setArg(key, value, arg);
		} else if ((/^--no-.+/).test(arg)) {
			key = arg.match(/^--no-(.+)/)[1];
			setArg(key, false, arg);
		} else if ((/^--.+/).test(arg)) {
			key = arg.match(/^--(.+)/)[1];
			next = args[i + 1];
			if (
				next !== undefined
				&& !(/^(-|--)[^-]/).test(next)
				&& !flags.bools[key]
				&& !flags.allBools
				&& (aliases[key] ? !aliasIsBoolean(key) : true)
			) {
				setArg(key, next, arg);
				i += 1;
			} else if ((/^(true|false)$/).test(next)) {
				setArg(key, next === 'true', arg);
				i += 1;
			} else {
				setArg(key, flags.strings[key] ? '' : true, arg);
			}
		} else if ((/^-[^-]+/).test(arg)) {
			var letters = arg.slice(1, -1).split('');

			var broken = false;
			for (var j = 0; j < letters.length; j++) {
				next = arg.slice(j + 2);

				if (next === '-') {
					setArg(letters[j], next, arg);
					continue;
				}

				if ((/[A-Za-z]/).test(letters[j]) && next[0] === '=') {
					setArg(letters[j], next.slice(1), arg);
					broken = true;
					break;
				}

				if (
					(/[A-Za-z]/).test(letters[j])
					&& (/-?\d+(\.\d*)?(e-?\d+)?$/).test(next)
				) {
					setArg(letters[j], next, arg);
					broken = true;
					break;
				}

				if (letters[j + 1] && letters[j + 1].match(/\W/)) {
					setArg(letters[j], arg.slice(j + 2), arg);
					broken = true;
					break;
				} else {
					setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
				}
			}

			key = arg.slice(-1)[0];
			if (!broken && key !== '-') {
				if (
					args[i + 1]
					&& !(/^(-|--)[^-]/).test(args[i + 1])
					&& !flags.bools[key]
					&& (aliases[key] ? !aliasIsBoolean(key) : true)
				) {
					setArg(key, args[i + 1], arg);
					i += 1;
				} else if (args[i + 1] && (/^(true|false)$/).test(args[i + 1])) {
					setArg(key, args[i + 1] === 'true', arg);
					i += 1;
				} else {
					setArg(key, flags.strings[key] ? '' : true, arg);
				}
			}
		} else {
			if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
				argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
			}
			if (opts.stopEarly) {
				argv._.push.apply(argv._, args.slice(i + 1));
				break;
			}
		}
	}

	Object.keys(defaults).forEach(function (k) {
		if (!hasKey(argv, k.split('.'))) {
			setKey(argv, k.split('.'), defaults[k]);

			(aliases[k] || []).forEach(function (x) {
				setKey(argv, x.split('.'), defaults[k]);
			});
		}
	});

	if (opts['--']) {
		argv['--'] = notFlags.slice();
	} else {
		notFlags.forEach(function (k) {
			argv._.push(k);
		});
	}

	return argv;
};

var minimist$1 = /*@__PURE__*/getDefaultExportFromCjs(minimist);

const debug$1 = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {};

var debug_1 = debug$1;

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0';

const MAX_LENGTH$1 = 256;
const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */ 9007199254740991;

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16;

const RELEASE_TYPES = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
];

var constants = {
  MAX_LENGTH: MAX_LENGTH$1,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 0b001,
  FLAG_LOOSE: 0b010,
};

var re$1 = {exports: {}};

(function (module, exports) {
	const { MAX_SAFE_COMPONENT_LENGTH } = constants;
	const debug = debug_1;
	exports = module.exports = {};

	// The actual regexps go on exports.re
	const re = exports.re = [];
	const src = exports.src = [];
	const t = exports.t = {};
	let R = 0;

	const createToken = (name, value, isGlobal) => {
	  const index = R++;
	  debug(name, index, value);
	  t[name] = index;
	  src[index] = value;
	  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
	};

	// The following Regular Expressions can be used for tokenizing,
	// validating, and parsing SemVer version strings.

	// ## Numeric Identifier
	// A single `0`, or a non-zero digit followed by zero or more digits.

	createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
	createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+');

	// ## Non-numeric Identifier
	// Zero or more digits, followed by a letter or hyphen, and then zero or
	// more letters, digits, or hyphens.

	createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*');

	// ## Main Version
	// Three dot-separated numeric identifiers.

	createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
	                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
	                   `(${src[t.NUMERICIDENTIFIER]})`);

	createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
	                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
	                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

	// ## Pre-release Version Identifier
	// A numeric identifier, or a non-numeric identifier.

	createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
	}|${src[t.NONNUMERICIDENTIFIER]})`);

	createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
	}|${src[t.NONNUMERICIDENTIFIER]})`);

	// ## Pre-release Version
	// Hyphen, followed by one or more dot-separated pre-release version
	// identifiers.

	createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
	}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

	createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
	}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

	// ## Build Metadata Identifier
	// Any combination of digits, letters, or hyphens.

	createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+');

	// ## Build Metadata
	// Plus sign, followed by one or more period-separated build metadata
	// identifiers.

	createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
	}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

	// ## Full Version String
	// A main version, followed optionally by a pre-release version and
	// build metadata.

	// Note that the only major, minor, patch, and pre-release sections of
	// the version string are capturing groups.  The build metadata is not a
	// capturing group, because it should not ever be used in version
	// comparison.

	createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
	}${src[t.PRERELEASE]}?${
	  src[t.BUILD]}?`);

	createToken('FULL', `^${src[t.FULLPLAIN]}$`);

	// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
	// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
	// common in the npm registry.
	createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
	}${src[t.PRERELEASELOOSE]}?${
	  src[t.BUILD]}?`);

	createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

	createToken('GTLT', '((?:<|>)?=?)');

	// Something like "2.*" or "1.2.x".
	// Note that "x.x" is a valid xRange identifer, meaning "any version"
	// Only the first item is strictly required.
	createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
	createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

	createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
	                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
	                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
	                   `(?:${src[t.PRERELEASE]})?${
	                     src[t.BUILD]}?` +
	                   `)?)?`);

	createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
	                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
	                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
	                        `(?:${src[t.PRERELEASELOOSE]})?${
	                          src[t.BUILD]}?` +
	                        `)?)?`);

	createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
	createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

	// Coercion.
	// Extract anything that could conceivably be a part of a valid semver
	createToken('COERCE', `${'(^|[^\\d])' +
	              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
	              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
	              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
	              `(?:$|[^\\d])`);
	createToken('COERCERTL', src[t.COERCE], true);

	// Tilde ranges.
	// Meaning is "reasonably at or greater than"
	createToken('LONETILDE', '(?:~>?)');

	createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
	exports.tildeTrimReplace = '$1~';

	createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
	createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

	// Caret ranges.
	// Meaning is "at least and backwards compatible with"
	createToken('LONECARET', '(?:\\^)');

	createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
	exports.caretTrimReplace = '$1^';

	createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
	createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

	// A simple gt/lt/eq thing, or just "" to indicate "any version"
	createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
	createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

	// An expression to strip any whitespace between the gtlt and the thing
	// it modifies, so that `> 1.2.3` ==> `>1.2.3`
	createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
	}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
	exports.comparatorTrimReplace = '$1$2$3';

	// Something like `1.2.3 - 1.2.4`
	// Note that these all use the loose form, because they'll be
	// checked against either the strict or loose comparator form
	// later.
	createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
	                   `\\s+-\\s+` +
	                   `(${src[t.XRANGEPLAIN]})` +
	                   `\\s*$`);

	createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
	                        `\\s+-\\s+` +
	                        `(${src[t.XRANGEPLAINLOOSE]})` +
	                        `\\s*$`);

	// Star ranges basically just allow anything at all.
	createToken('STAR', '(<|>)?=?\\s*\\*');
	// >=0.0.0 is like a star
	createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
	createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$'); 
} (re$1, re$1.exports));

var reExports = re$1.exports;

// parse out just the options we care about
const looseOption = Object.freeze({ loose: true });
const emptyOpts = Object.freeze({ });
const parseOptions$1 = options => {
  if (!options) {
    return emptyOpts
  }

  if (typeof options !== 'object') {
    return looseOption
  }

  return options
};
var parseOptions_1 = parseOptions$1;

const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  const anum = numeric.test(a);
  const bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
};

const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);

var identifiers = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers,
};

const debug = debug_1;
const { MAX_LENGTH, MAX_SAFE_INTEGER } = constants;
const { re, t } = reExports;

const parseOptions = parseOptions_1;
const { compareIdentifiers } = identifiers;
let SemVer$2 = class SemVer {
  constructor (version, options) {
    options = parseOptions(options);

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version;
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${require$$2.inspect(version)}`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options);
    this.options = options;
    this.loose = !!options.loose;
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease;

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version;

    // these are actually numbers
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      });
    }

    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`;
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other);
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options);
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }

    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier, identifierBase) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc('pre', identifier, identifierBase);
        break
      case 'preminor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc('pre', identifier, identifierBase);
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0;
        this.inc('patch', identifier, identifierBase);
        this.inc('pre', identifier, identifierBase);
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier, identifierBase);
        }
        this.inc('pre', identifier, identifierBase);
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre': {
        const base = Number(identifierBase) ? 1 : 0;

        if (!identifier && identifierBase === false) {
          throw new Error('invalid increment argument: identifier is empty')
        }

        if (this.prerelease.length === 0) {
          this.prerelease = [base];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            // didn't increment anything
            if (identifier === this.prerelease.join('.') && identifierBase === false) {
              throw new Error('invalid increment argument: identifier already exists')
            }
            this.prerelease.push(base);
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          let prerelease = [identifier, base];
          if (identifierBase === false) {
            prerelease = [identifier];
          }
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = prerelease;
            }
          } else {
            this.prerelease = prerelease;
          }
        }
        break
      }
      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format();
    this.raw = this.version;
    return this
  }
};

var semver = SemVer$2;

const SemVer$1 = semver;

const inc$1 = (version, release, options, identifier, identifierBase) => {
  if (typeof (options) === 'string') {
    identifierBase = identifier;
    identifier = options;
    options = undefined;
  }

  try {
    return new SemVer$1(
      version instanceof SemVer$1 ? version.version : version,
      options
    ).inc(release, identifier, identifierBase).version
  } catch (er) {
    return null
  }
};
var inc_1 = inc$1;

var semverInc = /*@__PURE__*/getDefaultExportFromCjs(inc_1);

const SemVer = semver;
const parse$2 = (version, options, throwErrors = false) => {
  if (version instanceof SemVer) {
    return version
  }
  try {
    return new SemVer(version, options)
  } catch (er) {
    if (!throwErrors) {
      return null
    }
    throw er
  }
};

var parse_1 = parse$2;

const parse$1 = parse_1;
const prerelease = (version, options) => {
  const parsed = parse$1(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
};
var prerelease_1 = prerelease;

var prerelease$1 = /*@__PURE__*/getDefaultExportFromCjs(prerelease_1);

const parse = parse_1;
const valid = (version, options) => {
  const v = parse(version, options);
  return v ? v.version : null
};
var valid_1 = valid;

var valid$1 = /*@__PURE__*/getDefaultExportFromCjs(valid_1);

var source = {};

function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable})),keys.push.apply(keys,symbols);}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?ownKeys(Object(source),!0).forEach(function(key){_defineProperty(target,key,source[key]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}return target}function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return typeof key==="symbol"?key:String(key)}function _toPrimitive(input,hint){if(typeof input!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(typeof res!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.")}return (hint==="string"?String:Number)(input)}Object.defineProperty(source,"__esModule",{value:true});var process$1=process$4;var os=os$1;var tty=require$$2$1;const ANSI_BACKGROUND_OFFSET=10;const wrapAnsi16=(offset=0)=>code=>`\u001B[${code+offset}m`;const wrapAnsi256=(offset=0)=>code=>`\u001B[${38+offset};5;${code}m`;const wrapAnsi16m=(offset=0)=>(red,green,blue)=>`\u001B[${38+offset};2;${red};${green};${blue}m`;const styles$1={modifier:{reset:[0,0],// 21 isn't widely supported and 22 does the same thing
bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],// Bright color
blackBright:[90,39],gray:[90,39],// Alias of `blackBright`
grey:[90,39],// Alias of `blackBright`
redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],// Bright color
bgBlackBright:[100,49],bgGray:[100,49],// Alias of `bgBlackBright`
bgGrey:[100,49],// Alias of `bgBlackBright`
bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};const modifierNames=Object.keys(styles$1.modifier);const foregroundColorNames=Object.keys(styles$1.color);const backgroundColorNames=Object.keys(styles$1.bgColor);const colorNames=[...foregroundColorNames,...backgroundColorNames];function assembleStyles(){const codes=new Map;for(const[groupName,group]of Object.entries(styles$1)){for(const[styleName,style]of Object.entries(group)){styles$1[styleName]={open:`\u001B[${style[0]}m`,close:`\u001B[${style[1]}m`};group[styleName]=styles$1[styleName];codes.set(style[0],style[1]);}Object.defineProperty(styles$1,groupName,{value:group,enumerable:false});}Object.defineProperty(styles$1,"codes",{value:codes,enumerable:false});styles$1.color.close="\x1B[39m";styles$1.bgColor.close="\x1B[49m";styles$1.color.ansi=wrapAnsi16();styles$1.color.ansi256=wrapAnsi256();styles$1.color.ansi16m=wrapAnsi16m();styles$1.bgColor.ansi=wrapAnsi16(ANSI_BACKGROUND_OFFSET);styles$1.bgColor.ansi256=wrapAnsi256(ANSI_BACKGROUND_OFFSET);styles$1.bgColor.ansi16m=wrapAnsi16m(ANSI_BACKGROUND_OFFSET);// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
Object.defineProperties(styles$1,{rgbToAnsi256:{value(red,green,blue){// We use the extended greyscale palette here, with the exception of
// black and white. normal palette only has 4 greyscale shades.
if(red===green&&green===blue){if(red<8){return 16}if(red>248){return 231}return Math.round((red-8)/247*24)+232}return 16+36*Math.round(red/255*5)+6*Math.round(green/255*5)+Math.round(blue/255*5)},enumerable:false},hexToRgb:{value(hex){const matches=/[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));if(!matches){return [0,0,0]}let[colorString]=matches;if(colorString.length===3){colorString=[...colorString].map(character=>character+character).join("");}const integer=Number.parseInt(colorString,16);return [/* eslint-disable no-bitwise */integer>>16&255,integer>>8&255,integer&255/* eslint-enable no-bitwise */]},enumerable:false},hexToAnsi256:{value:hex=>styles$1.rgbToAnsi256(...styles$1.hexToRgb(hex)),enumerable:false},ansi256ToAnsi:{value(code){if(code<8){return 30+code}if(code<16){return 90+(code-8)}let red;let green;let blue;if(code>=232){red=((code-232)*10+8)/255;green=red;blue=red;}else {code-=16;const remainder=code%36;red=Math.floor(code/36)/5;green=Math.floor(remainder/6)/5;blue=remainder%6/5;}const value=Math.max(red,green,blue)*2;if(value===0){return 30}// eslint-disable-next-line no-bitwise
let result=30+(Math.round(blue)<<2|Math.round(green)<<1|Math.round(red));if(value===2){result+=60;}return result},enumerable:false},rgbToAnsi:{value:(red,green,blue)=>styles$1.ansi256ToAnsi(styles$1.rgbToAnsi256(red,green,blue)),enumerable:false},hexToAnsi:{value:hex=>styles$1.ansi256ToAnsi(styles$1.hexToAnsi256(hex)),enumerable:false}});return styles$1}const ansiStyles=assembleStyles();// From: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag,argv=globalThis.Deno?globalThis.Deno.args:process$1.argv){const prefix=flag.startsWith("-")?"":flag.length===1?"-":"--";const position=argv.indexOf(prefix+flag);const terminatorPosition=argv.indexOf("--");return position!==-1&&(terminatorPosition===-1||position<terminatorPosition)}const{env}=process$1;let flagForceColor;if(hasFlag("no-color")||hasFlag("no-colors")||hasFlag("color=false")||hasFlag("color=never")){flagForceColor=0;}else if(hasFlag("color")||hasFlag("colors")||hasFlag("color=true")||hasFlag("color=always")){flagForceColor=1;}function envForceColor(){if("FORCE_COLOR"in env){if(env.FORCE_COLOR==="true"){return 1}if(env.FORCE_COLOR==="false"){return 0}return env.FORCE_COLOR.length===0?1:Math.min(Number.parseInt(env.FORCE_COLOR,10),3)}}function translateLevel(level){if(level===0){return false}return {level,hasBasic:true,has256:level>=2,has16m:level>=3}}function _supportsColor(haveStream,{streamIsTTY,sniffFlags=true}={}){const noFlagForceColor=envForceColor();if(noFlagForceColor!==undefined){flagForceColor=noFlagForceColor;}const forceColor=sniffFlags?flagForceColor:noFlagForceColor;if(forceColor===0){return 0}if(sniffFlags){if(hasFlag("color=16m")||hasFlag("color=full")||hasFlag("color=truecolor")){return 3}if(hasFlag("color=256")){return 2}}// Check for Azure DevOps pipelines.
// Has to be above the `!streamIsTTY` check.
if("TF_BUILD"in env&&"AGENT_NAME"in env){return 1}if(haveStream&&!streamIsTTY&&forceColor===undefined){return 0}const min=forceColor||0;if(env.TERM==="dumb"){return min}if(process$1.platform==="win32"){// Windows 10 build 10586 is the first Windows release that supports 256 colors.
// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
const osRelease=os.release().split(".");if(Number(osRelease[0])>=10&&Number(osRelease[2])>=10586){return Number(osRelease[2])>=14931?3:2}return 1}if("CI"in env){if("GITHUB_ACTIONS"in env){return 3}if(["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some(sign=>sign in env)||env.CI_NAME==="codeship"){return 1}return min}if("TEAMCITY_VERSION"in env){return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION)?1:0}if(env.COLORTERM==="truecolor"){return 3}if(env.TERM==="xterm-kitty"){return 3}if("TERM_PROGRAM"in env){const version=Number.parseInt((env.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(env.TERM_PROGRAM){case"iTerm.app":{return version>=3?3:2}case"Apple_Terminal":{return 2}// No default
}}if(/-256(color)?$/i.test(env.TERM)){return 2}if(/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)){return 1}if("COLORTERM"in env){return 1}return min}function createSupportsColor(stream,options={}){const level=_supportsColor(stream,_objectSpread({streamIsTTY:stream&&stream.isTTY},options));return translateLevel(level)}const supportsColor={stdout:createSupportsColor({isTTY:tty.isatty(1)}),stderr:createSupportsColor({isTTY:tty.isatty(2)})};// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string,substring,replacer){let index=string.indexOf(substring);if(index===-1){return string}const substringLength=substring.length;let endIndex=0;let returnValue="";do{returnValue+=string.slice(endIndex,index)+substring+replacer;endIndex=index+substringLength;index=string.indexOf(substring,endIndex);}while(index!==-1);returnValue+=string.slice(endIndex);return returnValue}function stringEncaseCRLFWithFirstIndex(string,prefix,postfix,index){let endIndex=0;let returnValue="";do{const gotCR=string[index-1]==="\r";returnValue+=string.slice(endIndex,gotCR?index-1:index)+prefix+(gotCR?"\r\n":"\n")+postfix;endIndex=index+1;index=string.indexOf("\n",endIndex);}while(index!==-1);returnValue+=string.slice(endIndex);return returnValue}const{stdout:stdoutColor,stderr:stderrColor}=supportsColor;const GENERATOR=Symbol("GENERATOR");const STYLER=Symbol("STYLER");const IS_EMPTY=Symbol("IS_EMPTY");// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping=["ansi","ansi","ansi256","ansi16m"];const styles=Object.create(null);const applyOptions=(object,options={})=>{if(options.level&&!(Number.isInteger(options.level)&&options.level>=0&&options.level<=3)){throw new Error("The `level` option should be an integer from 0 to 3")}// Detect level if not set manually
const colorLevel=stdoutColor?stdoutColor.level:0;object.level=options.level===undefined?colorLevel:options.level;};class Chalk{constructor(options){// eslint-disable-next-line no-constructor-return
return chalkFactory(options)}}const chalkFactory=options=>{const chalk=(...strings)=>strings.join(" ");applyOptions(chalk,options);Object.setPrototypeOf(chalk,createChalk.prototype);return chalk};function createChalk(options){return chalkFactory(options)}Object.setPrototypeOf(createChalk.prototype,Function.prototype);for(const[styleName,style]of Object.entries(ansiStyles)){styles[styleName]={get(){const builder=createBuilder(this,createStyler(style.open,style.close,this[STYLER]),this[IS_EMPTY]);Object.defineProperty(this,styleName,{value:builder});return builder}};}styles.visible={get(){const builder=createBuilder(this,this[STYLER],true);Object.defineProperty(this,"visible",{value:builder});return builder}};const getModelAnsi=(model,level,type,...arguments_)=>{if(model==="rgb"){if(level==="ansi16m"){return ansiStyles[type].ansi16m(...arguments_)}if(level==="ansi256"){return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...arguments_))}return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...arguments_))}if(model==="hex"){return getModelAnsi("rgb",level,type,...ansiStyles.hexToRgb(...arguments_))}return ansiStyles[type][model](...arguments_)};const usedModels=["rgb","hex","ansi256"];for(const model of usedModels){styles[model]={get(){const{level}=this;return function(...arguments_){const styler=createStyler(getModelAnsi(model,levelMapping[level],"color",...arguments_),ansiStyles.color.close,this[STYLER]);return createBuilder(this,styler,this[IS_EMPTY])}}};const bgModel="bg"+model[0].toUpperCase()+model.slice(1);styles[bgModel]={get(){const{level}=this;return function(...arguments_){const styler=createStyler(getModelAnsi(model,levelMapping[level],"bgColor",...arguments_),ansiStyles.bgColor.close,this[STYLER]);return createBuilder(this,styler,this[IS_EMPTY])}}};}const proto=Object.defineProperties(()=>{},_objectSpread(_objectSpread({},styles),{},{level:{enumerable:true,get(){return this[GENERATOR].level},set(level){this[GENERATOR].level=level;}}}));const createStyler=(open,close,parent)=>{let openAll;let closeAll;if(parent===undefined){openAll=open;closeAll=close;}else {openAll=parent.openAll+open;closeAll=close+parent.closeAll;}return {open,close,openAll,closeAll,parent}};const createBuilder=(self,_styler,_isEmpty)=>{// Single argument is hot path, implicit coercion is faster than anything
// eslint-disable-next-line no-implicit-coercion
const builder=(...arguments_)=>applyStyle(builder,arguments_.length===1?""+arguments_[0]:arguments_.join(" "));// We alter the prototype because we must return a function, but there is
// no way to create a function with a different prototype
Object.setPrototypeOf(builder,proto);builder[GENERATOR]=self;builder[STYLER]=_styler;builder[IS_EMPTY]=_isEmpty;return builder};const applyStyle=(self,string)=>{if(self.level<=0||!string){return self[IS_EMPTY]?"":string}let styler=self[STYLER];if(styler===undefined){return string}const{openAll,closeAll}=styler;if(string.includes("\x1B")){while(styler!==undefined){// Replace any instances already present with a re-opening code
// otherwise only the part of the string until said closing code
// will be colored, and the rest will simply be 'plain'.
string=stringReplaceAll(string,styler.close,styler.open);styler=styler.parent;}}// We can move both next actions out of loop, because remaining actions in loop won't have
// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
const lfIndex=string.indexOf("\n");if(lfIndex!==-1){string=stringEncaseCRLFWithFirstIndex(string,closeAll,openAll,lfIndex);}return openAll+string+closeAll};Object.defineProperties(createChalk.prototype,styles);const chalk=createChalk();const chalkStderr=createChalk({level:stderrColor?stderrColor.level:0});source.Chalk=Chalk;source.backgroundColorNames=backgroundColorNames;source.backgroundColors=backgroundColorNames;source.chalkStderr=chalkStderr;source.colorNames=colorNames;source.colors=colorNames;var _default = source.default=chalk;source.foregroundColorNames=foregroundColorNames;source.foregroundColors=foregroundColorNames;source.modifierNames=modifierNames;source.modifiers=modifierNames;source.supportsColor=stdoutColor;source.supportsColorStderr=stderrColor;

function error(...args) {
    console.log(_default.redBright(args));
}
function warn(...args) {
    console.log(_default.yellowBright(args));
}
function info(...args) {
    console.log(_default.blueBright(args));
}
function success(...args) {
    console.log(_default.greenBright(args));
}
var logger = {
    error,
    warn,
    info,
    success,
};

program
    .option("-c, --config <config>", "Specify the configuration file for conventional-changelog-cli")
    .parse(process.argv);
const options = program.opts();
let pkgPath = path$4.resolve(process.cwd(), "package.json");
let pkg = JSON.parse(node_fs.readFileSync(pkgPath, "utf-8"));
const currentVersion = pkg.version;
const args = minimist$1(process.argv.slice(2));
const preId = args.preid || prerelease$1(currentVersion)?.[0];
const isDryRun = args.dry;
const versionIncrements = [
    "patch",
    "minor",
    "major",
    ...(preId
        ? ["prepatch", "preminor", "premajor", "prerelease"]
        : []),
];
const inc = (i) => semverInc(currentVersion, i, preId);
const run = (bin, args, opts = {}) => {
    try {
        return execa(bin, args, { stdio: "inherit", ...opts });
    }
    catch (error) {
        return Promise.reject(error);
    }
};
const dryRun = async (bin, args, opts = {}) => logger.info(`[dryrun] ${bin} ${args.join(" ")}`, opts);
const runIfNotDry = isDryRun ? dryRun : run;
const step = (msg) => logger.success(msg);
async function main() {
    let targetVersion = args._[0];
    if (!targetVersion) {
        // no explicit version, offer suggestions
        const { release } = await enquirer.prompt({
            type: "select",
            name: "release",
            message: "Select release type",
            choices: versionIncrements
                .map((i) => `${i} (${inc(i)})`)
                .concat(["custom"]),
        });
        if (release === "custom") {
            const { version } = await enquirer.prompt({
                type: "input",
                name: "version",
                message: "Input custom version",
                initial: currentVersion,
            });
            targetVersion = version;
        }
        else {
            const releaseMatchArray = release.match(/\((.*)\)/);
            if (releaseMatchArray?.length) {
                targetVersion = releaseMatchArray[1];
            }
            else {
                throw new Error("Version is required!");
            }
        }
    }
    if (!valid$1(targetVersion)) {
        throw new Error(`invalid target version: ${targetVersion}`);
    }
    const { yes: confirmRelease } = await enquirer.prompt({
        type: "confirm",
        name: "yes",
        message: `Releasing v${targetVersion}. Confirm?`,
    });
    if (!confirmRelease)
        return;
    step("\nUpdating package versions...");
    updateVersions(targetVersion);
    // generate changelog
    step("\nGenerating changelog...");
    let configPath = "";
    if (options.config) {
        configPath = path$4.resolve(options.config);
        // 然后你就可以使用 configObject 对应的配置了
        logger.info(configPath, "configPath");
    }
    const changelogArgs = ["-p", "angular", "-i", "CHANGELOG.md"];
    if (configPath) {
        changelogArgs.push("-c", configPath);
    }
    await run(`conventional-changelog`, changelogArgs);
    const { yes: changelogOk } = await enquirer.prompt({
        type: "confirm",
        name: "yes",
        message: `Changelog generated. Does it look good?`,
    });
    if (!changelogOk)
        return;
    step("\nUpdating lockfile...");
    try {
        await run(`yarn`, ["install", "--prefer-offline"]);
    }
    catch (error) {
        await run(`yarn`, ["install"]);
    }
    const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
    if (stdout) {
        step("\nCommitting changes...");
        await runIfNotDry("git", ["add", "-A"]);
        await runIfNotDry("git", ["commit", "-m", `release: v${targetVersion}`]);
    }
    else {
        console.log("No changes to commit.");
    }
    // push to GitHub
    step("\nPushing to GitHub...");
    const { yes: publishOk } = await enquirer.prompt({
        type: "confirm",
        name: "yes",
        message: `Publish to Git?`,
    });
    if (publishOk) {
        await runIfNotDry("git", ["config", "--global", "push.default", "current"]);
        await runIfNotDry("git", ["push"]);
        const { yes: tagOk } = await enquirer.prompt({
            type: "confirm",
            name: "yes",
            message: `Generate & Publish Tag: v${targetVersion}?`,
        });
        if (tagOk) {
            await runIfNotDry("git", ["tag", `v${targetVersion}`]);
            await runIfNotDry("git", [
                "push",
                "origin",
                `refs/tags/v${targetVersion}`,
            ]);
        }
    }
    if (isDryRun) {
        console.log(`\nDry run finished - run git diff to see package changes.`);
    }
}
function updateVersions(version) {
    pkgPath = path$4.resolve(process.cwd(), "package.json");
    pkg = JSON.parse(node_fs.readFileSync(pkgPath, "utf-8"));
    pkg.version = version;
    node_fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
main().catch((err) => {
    updateVersions(currentVersion);
    console.error(err);
    process.exit(1);
});
