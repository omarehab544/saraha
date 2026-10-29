import { EventEmitter } from "events";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirm-email", async (fn) => {
    await fn();
});