import { ClientAPI } from "@panoptyk/client";
import { Agent, Room, Item } from "@panoptyk/core";

import readline from 'readline';

type ActionFunction = (args: string[]) => any;

export class TextClient {

  _commands: Command[] = [
    new Command("move", [1], this.move),
    new Command("requestConvo", [1], this.requestConvo),
    new Command("declineConvo", [1], this.declineConvo),
    new Command("leaveConvo", [0], this.leaveConvo),
    new Command("look", [], this.look),
    new Command("pickup", [], this.pickUp),
    new Command("drop", [], this.drop)
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
    } else {
      this._result = undefined;
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
    const player: Agent = ClientAPI.playerAgent;
    const oldRoom: Room = player.room;
    const rooms: Room[] = player.room.adjacentRooms;
    const selected = rooms.filter(room => room.roomName === destination[0]);
    if (selected.length > 0) {
      ClientAPI.moveToRoom(selected[0]);
      this._result = "Moved from " + oldRoom + " to " + selected[0];
    } else {
      this._result = destination[0] + " is not an adjacent room.";
    }
  }

  requestConvo(people: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const agentsInRoom: Agent[] = player.room.occupants;
    const selected = agentsInRoom.filter(agent => agent.agentName === people[0]);
    if (selected.length > 0) {
      ClientAPI.requestConversation(selected[0]);
      this._result = "Requested conversation with " + selected[0];
    } else {
      this._result = people[0] + " is not an agent currently in the room.";
    }
  }

  leaveConvo(args: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    ClientAPI.leaveConversation(player.conversation);
    this._result = "Left the conversation.";
  }

  declineConvo(requester: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const requesters: Agent[] = player.conversationRequesters;
    const selected = requesters.filter(agent => agent.agentName === requester[0]);
    if (selected.length > 0) {
      this._result = "Declined requested conversation from " + selected[0];
    } else {
      this._result = requester[0] + " has not requested a conversation.";
    }
  }

  look(at: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    let msg: string = "Self: " + player + "\n";

    const all = at.length === 0;

    if (all || at.includes("room") || at.includes("rooms") || at.includes("r")) {
      msg += "\n";
      msg += "Room: " + player.room + "\n";
      msg += "Adjacent Rooms: \n"
      player.room.adjacentRooms.forEach(room => {
        msg += room + "\n";
      });
    }
    
    if (all || at.includes("agent") || at.includes("agents") || at.includes("a")) {
      msg += "\n";
      msg += "Agents in Room:\n";
      player.room.occupants.forEach(occupant => {
        msg += occupant + "\n";
      });
    }

    if (all || at.includes("item") || at.includes ("items") || at.includes("i")) {
      msg += "\n";
      msg += "Items in Room:\n";
      player.room.items.forEach(item => {
        msg += item + "\n";
      });
      msg += "\n";
      msg += "Inventory:\n";
      player.inventory.forEach(item => {
        msg += item + "\n";
      });
    }
    
    if (all || at.includes("conversation") || at.includes("conversations") || at.includes("c")) {
      msg += "\n";
      msg += "Conversations Requested By:\n";
      player.conversationRequesters.forEach(agent => {
        msg += agent + "\n";
      });
      msg += "\n";
      if (player.inConversation) {
        msg += "In Converasation With:\n";
        player.conversation.participants.forEach(agent => {
          if (!agent.equals(player)) {
            msg += agent + "\n";
          }
        });
      } else {
        msg += "Not In Conversation.\n";
      }
    }
    
    this._result = msg;
  }

  pickUp(items: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const roomItems: Item[] = player.room.items;
    const selected = roomItems.filter(item => items.includes(item.itemName));
    if (selected.length === items.length) {
      ClientAPI.takeItems(selected);
      let msg = "Picked up: ";
      selected.forEach(item => {
        msg += item + " ";
      });
      msg = msg.slice(0, -2);
      this._result = msg;
    } else {
      let msg = "Tried to pick up invalid item(s): ";
      const names = selected.map(item => item.itemName);
      const invalid = items.filter(item => !names.includes(item));
      invalid.forEach(item => {
        msg += item + ", ";
      });
      msg = msg.slice(0, -2);
      this._result = msg;
    }
  }

  drop(items: string[]) {
    const player: Agent = ClientAPI.playerAgent;
    const inventory: Item[] = player.inventory;
    const selected = inventory.filter(item => items.includes(item.itemName));
    if (selected.length === items.length) {
      ClientAPI.dropItems(selected);
      let msg = "Dropped: ";
      selected.forEach(item => {
        msg += item + " ";
      });
      msg = msg.slice(0, -2);
      this._result = msg;
    } else {
      let msg = "Tried to drop invalid item(s): ";
      const names = selected.map(item => item.itemName);
      const invalid = items.filter(item => !names.includes(item));
      invalid.forEach(item => {
        msg += item + ", ";
      });
      msg = msg.slice(0, -2);
      this._result = msg;
    }
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
    return this._numParameters.length === 0 || this._numParameters.indexOf(n) > -1;
  }

  getAction(): ActionFunction {
    return this._action;
  }

} 

export function Prompt(promt: string, tc: TextClient) {
  const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
  });

  rl.question(promt, (answ) => {
    if (answ !== "exit") {
      tc.inputCommand(answ);
      const r = tc.getResult();
      if (r !== undefined) {
        console.log(tc.getResult());
      } else {
        console.log("Unknown command.");
      }
      rl.close();
      Prompt(promt, tc);
    } else {
      rl.close();
    }
  });
}

// const tc = new TextClient();

// Prompt(": ");


// const tc = new TextClient();
// tc.inputCommand("move room2");
// tc.inputCommand("talk jack jill");
// tc.inputCommand("move room3");
// console.log(tc.getResult());
// tc.inputCommand("look jack jill");
// console.log(tc.getResult());
// console.log(tc.getResult());
// tc.inputCommand("move room4");
// console.log(tc.getResult());
// console.log(tc.getResult());