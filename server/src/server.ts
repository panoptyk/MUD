import app from "./app";
import { Util } from "@panoptyk/core";
import { Server, MemorySaveLoadDatabase } from "@panoptyk/server";


Util.inject.db = new MemorySaveLoadDatabase();

const myServer = new Server(app as any);

myServer.start();