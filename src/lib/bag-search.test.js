import test from "node:test";
import assert from "node:assert/strict";
import { parseBagSearch } from "./bag-search.js";

test("prefix and number", () => {
  assert.deepEqual(parseBagSearch("B1054"), { prefix: "B", number: 1054 });
  assert.deepEqual(parseBagSearch(" g-12 "), { prefix: "G", number: 12 });
  assert.deepEqual(parseBagSearch("b 7"), { prefix: "B", number: 7 });
});

test("number only searches both hostels", () => {
  assert.deepEqual(parseBagSearch("1054"), { prefix: null, number: 1054 });
});

test("anything else is not a bag number", () => {
  for (const bad of ["", "X12", "B", "0", "B0", "123456", "12a", null, undefined]) {
    assert.equal(parseBagSearch(bad), null, String(bad));
  }
});
