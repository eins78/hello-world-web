// @ts-check
/**
 * @param {import('express').Request} req
 */
function getClientInfo(req) {
  return {
    ip: req.ip || "",
    method: req.method || "",
    hostname: req.hostname || "",
    httpVersion: req.httpVersion || "",
    userAgent: req.header("user-agent") || "",
    referer: req.header("referer") || "",
    mimeType: req.header("accept") || "",
    language: req.header("accept-language") || "",
    encoding: req.header("accept-encoding") || "",
    charset: req.header("accept-charset") || "",
    proxy: req.header("via") || "",
    forwarded: req.header("X-Forwarded-For") || "",
    headers: { ...req.headers },
    trailers: { ...req.trailers },
  };
}

exports.getClientInfo = getClientInfo;
