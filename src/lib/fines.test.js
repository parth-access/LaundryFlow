import test from "node:test";
import assert from "node:assert/strict";
import { calculateFine } from "./fines.js";

const policy = { free_limit: 10, fine_per_extra: "5.00" };

test("within the limit costs nothing", () => {
  assert.equal(calculateFine(0, policy), 0);
  assert.equal(calculateFine(10, policy), 0);
});

test("each extra cloth costs the policy amount", () => {
  assert.equal(calculateFine(11, policy), 5);
  assert.equal(calculateFine(13, policy), 15);
});

test("bad counts are rejected", () => {
  assert.throws(() => calculateFine(-1, policy));
  assert.throws(() => calculateFine(2.5, policy));
});
