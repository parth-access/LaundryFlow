import test from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv.js";

test("quotes every cell and ends lines with CRLF", () => {
  assert.equal(toCsv(["a", "b"], [[1, "x"]]), '"a","b"\r\n"1","x"\r\n');
});

test("commas and quotes stay inside one cell", () => {
  assert.equal(toCsv(["n"], [['Sharma, "Riya"']]), '"n"\r\n"Sharma, ""Riya"""\r\n');
});

test("empty values and formula-looking text are safe", () => {
  assert.equal(toCsv(["n"], [[null], ["=SUM(A1)"]]), '"n"\r\n""\r\n"\'=SUM(A1)"\r\n');
});
