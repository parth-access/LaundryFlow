import test from "node:test";
import assert from "node:assert/strict";
import { resolveAccess } from "./access.js";

const staffRow = { staff_id: 1, role: "COUNTER" };
const studentRow = { student_id: 7, is_active: true };

test("staff on the list get in even without a college email", () => {
  assert.equal(resolveAccess({ email: "ramesh@gmail.com", staff: staffRow }).kind, "staff");
});

test("a Gmail that is not on the staff list is denied", () => {
  const a = resolveAccess({ email: "someone@gmail.com" });
  assert.deepEqual(a, { kind: "denied", reason: "not_college_email" });
});

test("a student who is not registered yet must register", () => {
  const a = resolveAccess({ email: "New@NST.rishihood.edu.in" });
  assert.deepEqual(a, { kind: "unregistered", email: "new@nst.rishihood.edu.in" });
});

test("a registered student gets in", () => {
  assert.equal(resolveAccess({ email: "a@nst.rishihood.edu.in", student: studentRow }).kind, "student");
});

test("a deactivated student is denied", () => {
  const a = resolveAccess({ email: "a@nst.rishihood.edu.in", student: { ...studentRow, is_active: false } });
  assert.deepEqual(a, { kind: "denied", reason: "inactive" });
});

test("a student row alone is not enough if the email is not a college address", () => {
  // e.g. an old row, or a wrong email: the domain rule still applies
  assert.equal(resolveAccess({ email: "a@gmail.com", student: studentRow }).kind, "denied");
});

test("no email means denied", () => {
  assert.equal(resolveAccess({ email: undefined }).kind, "denied");
  assert.equal(resolveAccess({ email: "" , staff: staffRow }).kind, "denied");
});
