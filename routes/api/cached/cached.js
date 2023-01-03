// @ts-check
const express = require("express");
const router = express.Router();
const { restReponse } = require("../../../lib/rest-reponse/restReponse");

const cacheControlHeader = "Cache-Control";
const ONE_YEAR_IN_SECONDS = 31536000;

/* GET max-age */
router.get("/max-age/:seconds?", function (req, res, next) {
  const now = new Date();

  const maxAge = parseInt(req.params.seconds || "0", 10) || ONE_YEAR_IN_SECONDS; // default 1 year
  const expiresAt = new Date(now.getTime() + maxAge * 1000);
  const cacheControlValue = `public, max-age=${maxAge}`;

  res.set(cacheControlHeader, cacheControlValue);

  restReponse(
    res,
    "message",
    `

${cacheControlHeader}: ${cacheControlValue}
This response was generated at ${formatDate(now)} \
and should be cached for ${formatDuration(maxAge)}, until ${formatDate(expiresAt)}.

`.trim()
  );
});

module.exports = router;

/**
 * @param {Date} date Date to format
 * @return {string} formated date
 */
function formatDate(date) {
  const epoch = Math.floor(date.getTime() / 1000);
  return `${date.toJSON()} (${epoch})`;
}

/**
 * @param {number} seconds duration in seconds
 * @return {string} formated duration
 */
function formatDuration(seconds) {
  let minutes, hours, days, years;
  const exact = pluralInt(seconds, "second");
  if ((minutes = seconds / 60) < 2) return exact;
  if ((hours = minutes / 60) < 1) return `${exact} (~${pluralInt(minutes, "minute")})`;
  if ((days = hours / 24) < 31) return `${exact} (~${pluralInt(hours, "hour")})`;
  if ((years = days / 365) < 1) return `${exact} (~${pluralInt(days, "day")})`;
  return `${exact} (~${pluralInt(years, "year")})`;
}

/**
 * @param {number} number to check if plural
 * @param {string} string to pluralize
 */
function pluralInt(number, string) {
  const num = Math.round(number);
  return `${num} ${string}${num === 1 ? "" : "s"}`;
}
