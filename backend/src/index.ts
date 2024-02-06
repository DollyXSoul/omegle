import { Server, Socket } from "socket.io";
import { UserManager } from "./managers/UserManager";
const express = require("express");
const { createServer } = require("node:http");

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();
io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  userManager.addUser("random-name", socket);

  socket.on("discoonect", () => {
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log("server running at *:3000");
});
