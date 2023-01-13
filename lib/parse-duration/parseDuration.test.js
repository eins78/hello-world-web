// @ts-check
const test = require("node:test");
const assert = require("node:assert");
const parseDuration = require("./parseDuration");

const expectationsTable = [
  ["1", 1000],
  ["2", 2000],
  ["999", 999000],
  ["1ms", 1],
  ["3ms", 3],
  ["1s", 1000],
  ["8s", 8000],
  ["20m", 1200000],
  ["8h", 28800000],
  ["3d", 259200000],
];

expectationsTable.forEach(([input, expected]) => {
  test(`parse "${input}" as ${expected}`, () => {
    assert.strictEqual(parseDuration(input), expected);
  });
});
