import test from "node:test";
import assert from "node:assert/strict";
import { isCollegeEmail, normalizeEmail } from "./email-rules.js";

test("accepts college addresses", () => {
  for (const email of [
    "parth@rishihood.edu.in",
    "tanishq.t25474@nst.rishihood.edu.in",
    "name@cse.rishihood.edu.in",
    "name@a.b.rishihood.edu.in",
    "Name@NST.Rishihood.EDU.in", // case does not matter
    "  name@nst.rishihood.edu.in  ", // surrounding spaces are trimmed
    "first.last+tag@nst.rishihood.edu.in",
  ]) {
    assert.equal(isCollegeEmail(email), true, email);
  }
});

test("rejects look-alikes and other domains", () => {
  for (const email of [
    "a@fakerishihood.edu.in", // no dot before the college name
    "a@rishihood.edu.in.evil.com", // college name is only a prefix
    "a@evil.com",
    "a@gmail.com",
    "a@rishihood.edu", // wrong ending
    "a@rishihood.edu.in.", // trailing dot
    "a@.rishihood.edu.in", // empty label
    "a@x..rishihood.edu.in", // empty label in the middle
    "a@x_y.rishihood.edu.in", // underscore is not a valid domain character
    "a@evil.com#.rishihood.edu.in",
    "a@evil.com/.rishihood.edu.in",
    "@rishihood.edu.in", // no name before the @
    "a@@rishihood.edu.in",
    "a@b@rishihood.edu.in",
    "a b@rishihood.edu.in", // space inside
    "a@nst.rishihood.edu.in\n.evil.com",
    "a@nst.rishihood.edu.in​", // zero-width space
    "a@nst.rishihood.edu.inK", // Kelvin sign, lowercases to a plain k
    "a@nѕt.rishihood.edu.in", // Cyrillic s
  ]) {
    assert.equal(isCollegeEmail(email), false, JSON.stringify(email));
  }
});

test("rejects things that are not strings", () => {
  for (const value of [undefined, null, 42, {}, [], true, ""]) {
    assert.equal(isCollegeEmail(value), false);
  }
});

test("normalizeEmail", () => {
  assert.equal(normalizeEmail("  A@B.com "), "a@b.com");
  assert.equal(normalizeEmail("a@b.comé"), "");
  assert.equal(normalizeEmail(`${"a".repeat(250)}@b.com`), "");
  assert.equal(normalizeEmail(null), "");
});
