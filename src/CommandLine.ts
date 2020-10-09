import { ClientAPI } from "@panoptyk/client";
import { TextClient, Prompt } from "./TextClient";

const username = process.argv[2] ? process.argv[2] : "idle";
const password = process.argv[3] ? process.argv[3] : "password";
const address = process.argv[4] ? process.argv[4] : "http://localhost:8080";

const MAX_RETRY = 10;
const RETRY_INTERVAL = 100; // ms before attempLogin() is called again to retry logging in

const tc = new TextClient();

function init () {
    console.log("Logging in as: " + username + " to server: " + address);
    ClientAPI.init(address);

    process.on("SIGINT", () => {
        if (!_loggedIn) {
          process.exit(0);
        }
      });
}

let _retries = 1;
let _loggedIn = false;
function attemptLogin() {
  ClientAPI.login(username, password)
    .catch(res => {
      console.log("Failed(%d)....retrying...", _retries);
      if (_retries <= MAX_RETRY) {
        _retries++;
        // tslint:disable-next-line: ban
        setTimeout(attemptLogin, RETRY_INTERVAL);
      }
    })
    .then(res => {
      console.log("Logged in!");
      _loggedIn = true;
      Prompt(": ", tc);
    });
}

init();