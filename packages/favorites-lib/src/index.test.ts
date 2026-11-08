import { describe, expect, it } from "vite-plus/test";
import { MAX_FAVORITES, restoreFavorites, toggleFavorite } from "./index.ts";

const knownIds = ["toolchain", "interaction", "testing", "runtime"];

describe("restoreFavorites", () => {
  it("starts empty when nothing is stored", () => {
    expect(restoreFavorites(null, knownIds)).toEqual([]);
  });

  it.each(["not json", "{", "null", "42", '{"id":"toolchain"}'])(
    "ignores malformed or non-array stored data: %s",
    (raw) => {
      expect(restoreFavorites(raw, knownIds)).toEqual([]);
    },
  );

  it("drops removed sessions, invalid values and duplicates while preserving order", () => {
    const raw = JSON.stringify(["testing", "removed", 42, "testing", null, "toolchain"]);
    expect(restoreFavorites(raw, knownIds)).toEqual(["testing", "toolchain"]);
  });

  it("applies the limit to valid unique sessions", () => {
    const raw = JSON.stringify([
      "unknown",
      "toolchain",
      "toolchain",
      "interaction",
      "testing",
      "runtime",
    ]);
    expect(restoreFavorites(raw, knownIds)).toEqual(["toolchain", "interaction", "testing"]);
  });
});

describe("toggleFavorite", () => {
  it("adds a known session without mutating the input", () => {
    const original = Object.freeze(["toolchain"]);
    expect(toggleFavorite(original, "testing", knownIds)).toEqual({
      ids: ["toolchain", "testing"],
      status: "added",
    });
    expect(original).toEqual(["toolchain"]);
  });

  it("removes a selected session without reordering the others", () => {
    expect(
      toggleFavorite(["toolchain", "interaction", "testing"], "interaction", knownIds),
    ).toEqual({
      ids: ["toolchain", "testing"],
      status: "removed",
    });
  });

  it("refuses unknown sessions", () => {
    expect(toggleFavorite(["toolchain"], "missing", knownIds)).toEqual({
      ids: ["toolchain"],
      status: "unknown",
    });
  });

  it("keeps all existing selections when a fourth session is requested", () => {
    const original = knownIds.slice(0, MAX_FAVORITES);
    expect(toggleFavorite(original, "runtime", knownIds)).toEqual({
      ids: original,
      status: "limit",
    });
  });

  it("allows removing a session when the limit is reached", () => {
    expect(toggleFavorite(knownIds.slice(0, MAX_FAVORITES), "testing", knownIds)).toEqual({
      ids: ["toolchain", "interaction"],
      status: "removed",
    });
  });

  it("makes room for a different session after removal", () => {
    const removed = toggleFavorite(knownIds.slice(0, MAX_FAVORITES), "interaction", knownIds);
    expect(toggleFavorite(removed.ids, "runtime", knownIds)).toEqual({
      ids: ["toolchain", "testing", "runtime"],
      status: "added",
    });
  });
});
