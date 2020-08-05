import { EventEmitter } from "events";
import { IncomingMessage, ServerResponse } from "http";
import { Context } from "./context";

interface RequestEventPayload {
  req: IncomingMessage;
  context: any;
}
interface ResponseEventPayload {
  req: IncomingMessage;
  res: ServerResponse;
  context: Context;
}

export interface EventBus extends EventEmitter {
  emit(event: "REQUEST_START", payload: RequestEventPayload): boolean;
  emit(event: "RESPONSE_FINISH", payload: ResponseEventPayload): boolean;
  on(event: "REQUEST_START", listener: (payload: RequestEventPayload) => void): this;
  on(event: "RESPONSE_FINISH", listener: (payload: ResponseEventPayload) => void): this;
}

let bus: EventBus | undefined;
export const eventBus: EventBus = bus || (bus = new EventEmitter());
