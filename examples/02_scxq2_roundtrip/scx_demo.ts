import { scxEncode, scxDecode } from "@asx/scxq2-engine";

const data = { msg: "Hello SCXQ2", ts: Date.now() };
const encoded = scxEncode(data);
const decoded = scxDecode(encoded);

console.log("Encoded:", encoded);
console.log("Decoded:", decoded);
