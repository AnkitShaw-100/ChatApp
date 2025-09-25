import { io } from "socket.io-client";

export function connectWS() {
  return io("https://chatapp-2-bvfh.onrender.com/");
}
