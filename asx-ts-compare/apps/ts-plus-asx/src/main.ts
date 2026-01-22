import { renderUser } from "./ui.js";
import { fetchUser } from "./api.js";

async function main() {
  const u = await fetchUser("alice");
  console.log(renderUser(u));
}

main().catch((e) => {
  console.error("ts-plus-asx failed:", e);
  process.exit(1);
});
