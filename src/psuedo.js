"use strict";
exports.__esModule = true;
exports.TextClient = void 0;
var TextClient = /** @class */ (function () {
    function TextClient() {
        this._commands = [
            new Command("move", [1], this.move),
            new Command("talk", [2], this.talk)
        ];
        this._result = "";
        this._viewed = true;
    }
    TextClient.prototype.inputCommand = function (cmd) {
        if (!this._viewed) {
            return;
        }
        var split = cmd.split(" ");
        var action = this.getCommand(split[0], split.length - 1);
        if (action !== undefined) {
            action.call(this, split.slice(1));
        }
        this._viewed = false;
    };
    TextClient.prototype.getCommand = function (commandName, numParamaters) {
        for (var i = 0; i < this._commands.length; i++) {
            if (this._commands[i].validCommandName(commandName) && this._commands[i].validNumParameters(numParamaters)) {
                return this._commands[i].getAction();
            }
        }
        return undefined;
    };
    TextClient.prototype.getResult = function () {
        this._viewed = true;
        return this._result;
    };
    TextClient.prototype.move = function (destination) {
        console.log("move");
        this._result = "moved to " + destination[0];
    };
    TextClient.prototype.talk = function (people) {
        console.log("talk");
        this._result = "talked to " + people[0] + " and " + people[1];
    };
    return TextClient;
}());
exports.TextClient = TextClient;
var Command = /** @class */ (function () {
    function Command(cn, np, a) {
        this._commandName = cn;
        this._numParameters = np;
        this._action = a;
    }
    Command.prototype.validCommandName = function (s) {
        return this._commandName === s;
    };
    Command.prototype.validNumParameters = function (n) {
        return this._numParameters.indexOf(n) > -1;
    };
    Command.prototype.getAction = function () {
        return this._action;
    };
    return Command;
}());
var tc = new TextClient();
tc.inputCommand("move room2");
tc.inputCommand("talk jack jill");
console.log(tc.getResult());
tc.inputCommand("talk jack jill");
console.log(tc.getResult());
