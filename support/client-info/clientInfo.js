// @ts-check
/**
 * @param {import('express').Request} req
 */
export function getClientInfo(req) {
  return {
    ip: req.ip || null,
    method: req.method || null,
    hostname: req.hostname || null,
    httpVersion: req.httpVersion || null,
    userAgent: req.header("user-agent") || null,
    referer: req.header("referer") || null,
    mimeType: req.header("accept") || null,
    language: req.header("accept-language") || null,
    encoding: req.header("accept-encoding") || null,
    charset: req.header("accept-charset") || null,
    proxy: req.header("via") || null,
    forwarded: req.header("X-Forwarded-For") || null,
    headers: { ...req.headers },
    trailers: { ...req.trailers },
  };
}
