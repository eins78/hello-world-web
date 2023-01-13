// @ts-check
const ms = require("ms");

/**
 * @param {string | string[] | require('qs').ParsedQs | undefined} param duration in seconds or as string with unit (see <https://npm.im/ms>)
 * @return {number | undefined} parsed duration in milliseconds or undefined if none could be parsed
 */
function parseDuration(param) {
  if (!param || typeof param !== "string") return;
  const durationParam = String(Array.isArray(param) ? param[0] : param);
  return /\D/.test(durationParam) ? ms(durationParam) : parseInt(String(param), 10) * 1000;
}

exports.parseDuration = parseDuration;
