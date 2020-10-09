import { ClientAPI } from "@panoptyk/client";
import * as Core from "@panoptyk/core";

type ActionFunction = (args: string[]) => any;

export class TextClient {

  _commands: Command[] = [
    new Command("move", [1], this.move),
    new Command("talk", [2], this.talk),
    new Command("look", [1, 2], this.look)
  ];

  _result = "";
  _viewed = true;
  _buffer: string[] = [];

  inputCommand(cmd: string) {
    if (!this._viewed) {
      this._buffer.push(cmd);
      return;
    }
    const split: string[] = cmd.split(" ");
    const action: ActionFunction = this.getCommand(split[0], split.length - 1);
    if (action !== undefined) {
      action.call(this, split.slice(1));
    }
    this._viewed = false;
  }

  getCommand(commandName: string, numParamaters: number): ActionFunction {

    for(let i = 0; i < this._commands.length; i++){
      if (this._commands[i].validCommandName(commandName) && this._commands[i].validNumParameters(numParamaters)) {
        return this._commands[i].getAction();
      }
    }

    return undefined;
  }

  getResult(): string {
    this._viewed = true;
    const result = this._result;
    if (this._buffer.length > 0) {
      const c = this._buffer[0];
      this._buffer = this._buffer.slice(1);
      this.inputCommand(c);
    }
    return result;
  }

  doBuffer() {

  }

  move(destination: string[]) {
    this._result = "moved to " + destination[0];
  }

  talk(people: string[]) {
    this._result = "talked to " + people[0] + " and " + people[1];
  }

  look(at: string[]) {
    let msg = "looked at ";
    for (let i = 0; i < at.length; i++) {
      msg += at[i];
      if (i < at.length - 1) {
        msg += " ";
      }
    }
    this._result = msg;
  }

}

class Command {

  _commandName: string;
  _numParameters: number[];
  _action: ActionFunction;

  constructor (cn: string, np: number[], a: ActionFunction) {
    this._commandName = cn;
    this._numParameters = np;
    this._action = a;
  }

  validCommandName(s: string) {
    return this._commandName === s;
  }

  validNumParameters(n: number): boolean {
    return this._numParameters.indexOf(n) > -1;
  }

  getAction(): ActionFunction {
    return this._action;
  }

} 

const tc = new TextClient();
tc.inputCommand("move room2");
tc.inputCommand("talk jack jill");
tc.inputCommand("move room3");
console.log(tc.getResult());
tc.inputCommand("look jack jill");
console.log(tc.getResult());
console.log(tc.getResult());
tc.inputCommand("move room4");
console.log(tc.getResult());
console.log(tc.getResult());