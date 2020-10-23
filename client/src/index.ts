import { ClientAPI } from "@panoptyk/client";
import * as cmds from "./cmds";
import { TextClient } from "./TextClient";

// Control variables
const DEBUG = true;

// Set up cmd line I/O

const tc = new TextClient();

function test_and_debug(this: TextClient, args: string[]) {
  // Place any debug code here
  console.log(ClientAPI.playerAgent.inConversation);
  this._result = "::debug::";
}

// add debug commands
if (DEBUG) {
  tc.addCommand("d", [], test_and_debug);
  tc.addCommand(["debug:player", "d:player"], [], cmds.debug.playerObject);
}
// add normal commands
tc.addCommand("login", [1], cmds.login);
tc.addCommand("move", [1], cmds.move);
tc.addCommand("requestConvo", [1], cmds.requestConvo);
tc.addCommand("declineConvo", [1], cmds.declineConvo);
tc.addCommand("leaveConvo", [0], cmds.leaveConvo);
tc.addCommand("look", [], cmds.look);
tc.addCommand("pickup", [], cmds.pickUp);
tc.addCommand("drop", [], cmds.drop);

function processInput(input: string): string {
  console.log("Command inputted: " + input);
  let r;
  try {
    tc.inputCommand(input);
    r = tc.getResult();
  } catch (err) {
    console.log(err);
    r = "!runtime error!";
  }
  if (r === undefined) {
      r = "Unknown command."
  }
  console.log("Result:\n" + r);
  return r;
}

// Init
(function() {
    // ClientAPI.init("http://panoptyk.com:8000");
    ClientAPI.init("http://localhost:8000");
    // ClientAPI.init();
    (window as any).ClientAPI = ClientAPI;

    const input: HTMLInputElement = document.getElementById("txtInput") as HTMLInputElement;
    input.addEventListener("keyup", (event) => {
        if (event.key == "Enter") {
            event.preventDefault();
            document.getElementById("txtResult").innerText = processInput(input.value);
            input.value = "";
            event.stopImmediatePropagation();
        }
    });

})();
