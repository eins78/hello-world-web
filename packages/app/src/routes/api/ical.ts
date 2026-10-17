import { Router, type Request, type Response } from "express";
import initDebug from "debug";
import { createEventCalendar, parseEventParams, pickQueryStrings } from "../../utils/ical-helpers.ts";

const debug = initDebug("hello-world-web:ical");

export const icalRouter: Router = Router();

/**
 * GET /api/ical/events.ics
 * Generate dynamic iCalendar feed for a single event
 */
icalRouter.get("/events.ics", (req: Request, res: Response) => {
  // Parse and validate parameters
  const event = parseEventParams(pickQueryStrings(req.query));

  if ("error" in event) {
    return res.status(400).type("text/plain").send(event.error);
  }

  try {
    const cal = createEventCalendar(event);

    // Set proper content type and send
    // RFC 5545 section 8.1: the "method" parameter must be present and match the METHOD property
    res.setHeader("Content-Type", `text/calendar; charset=utf-8; method=${event.icalOptions.method}`);
    res.setHeader("Content-Disposition", 'inline; filename="events.ics"');
    // The feed is generated per request; keep intermediate caches from skewing refresh tests
    res.setHeader("Cache-Control", "no-cache");

    // Send the generated iCalendar data
    res.send(cal.toString());
  } catch (error) {
    debug("Error generating iCalendar: %O", error);
    res.status(500).type("text/plain").send("Error generating calendar data");
  }
});
