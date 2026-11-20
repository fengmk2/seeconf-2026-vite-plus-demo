import assert from "node:assert/strict";
import { toggleFavorite } from "../packages/favorites-lib/dist/index.mjs";

const favorite = toggleFavorite([], "toolchain", ["toolchain"]);
assert.deepEqual(favorite, { ids: ["toolchain"], status: "added" });
console.log(favorite);
