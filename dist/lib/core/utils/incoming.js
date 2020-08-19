"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureIncoming = exports.captureReadableStream = void 0;
// Max response body size
const maxBodySize = 512 * 1024;
exports.captureReadableStream = (stream) => {
    const originPush = stream.push;
    const info = {
        bodyLength: 0,
        bodyChunks: [],
        bodyTooLarge: false,
        body: Buffer.alloc(0),
    };
    const handler = (chunk) => {
        info.bodyLength += Buffer.byteLength(chunk);
        info.bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        info.body = Buffer.concat(info.bodyChunks);
        info.bodyTooLarge = info.bodyLength > maxBodySize;
    };
    let { head } = stream.readableBuffer;
    while (head) {
        handler(head.data);
        head = head.next;
    }
    stream.push = (chunk, encoding) => {
        if (chunk) {
            handler(chunk);
        }
        return originPush.call(stream, chunk, encoding);
    };
    return info;
};
exports.captureIncoming = (response) => exports.captureReadableStream(response);
