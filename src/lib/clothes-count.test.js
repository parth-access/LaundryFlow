import test from "node:test";
import assert from "node:assert/strict";
import { parseClothesCount, MAX_CLOTHES } from "./clothes-count.js";

test("whole numbers from 1 to 100 pass", () => {
  assert.equal(parseClothesCount("1"), 1);
  assert.equal(parseClothesCount(" 12 "), 12);
  assert.equal(parseClothesCount(MAX_CLOTHES), 100);
});

test("everything else is rejected", () => {
  for (const bad of ["", "0", "101", "-3", "2.5", "1e2", "ten", "007a", null, undefined]) {
    assert.equal(parseClothesCount(bad), null, String(bad));
  }
});
