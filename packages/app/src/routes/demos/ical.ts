import { Router } from "express";
import { html } from "@lit-labs/ssr";
import config from "../../config.ts";
import { renderViewToStream } from "../../support/render-view/renderView.ts";
import { Html as HtmlComponent } from "../../views/Html.ts";

const router: Router = Router();

/* GET /demos/ical - iCalendar demo page */
router.get("/ical", async function (_req, res) {
  const pageData = {
    title: "iCalendar Demo",
    basePath: config.basePath,
  };

  // NOTE: the inline <script> below is part of a lit template, so it must not contain `${` expressions.
  const bodyContent = html`
    <h1>iCalendar Feed Demo</h1>
    <p>Generate dynamic iCalendar (.ics) feeds for testing calendar client compatibility.</p>

    <form id="ical-form" data-base-path="${config.basePath}">
      <p>
        <label for="title">Event Title</label><br />
        <input type="text" id="title" name="title" required placeholder="Team Meeting" value="Demo Event" />
      </p>

      <p>
        <label for="startAt">Start Date/Time</label><br />
        <input type="datetime-local" id="startAt" name="startAt" required /><br />
        <small>Entered in your browser's local time; the feed shows it in the selected timezone.</small>
      </p>

      <p>
        <label for="duration">Duration (minutes)</label><br />
        <input type="number" id="duration" name="duration" min="1" required value="60" />
      </p>

      <p>
        <label for="tz">Timezone</label><br />
        <select id="tz" name="tz">
          <option value="">UTC (default)</option>
          <option value="Europe/Zurich">Europe/Zurich</option>
          <option value="Europe/London">Europe/London</option>
          <option value="America/New_York">America/New_York</option>
          <option value="America/Los_Angeles">America/Los_Angeles</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
          <option value="Australia/Sydney">Australia/Sydney</option>
        </select>
      </p>

      <p>
        <label for="cancelAt">Cancel At (optional)</label><br />
        <input type="datetime-local" id="cancelAt" name="cancelAt" /><br />
        <small>If set to a time in the past, the event is marked as cancelled.</small>
      </p>

      <p>
        <label for="cancelMethod">Cancellation method</label><br />
        <select id="cancelMethod" name="cancelMethod">
          <option value="">METHOD:PUBLISH + STATUS:CANCELLED (default)</option>
          <option value="CANCEL">METHOD:CANCEL + STATUS:CANCELLED</option></select
        ><br />
        <small>Only used once the event is cancelled. Generate both variants to compare clients.</small>
      </p>

      <button type="submit">Generate Feed URL</button>
    </form>

    <section id="result" hidden>
      <h3>Feed URL</h3>
      <p>
        <input type="text" id="feed-url" readonly size="80" />
        <button type="button" id="copy-btn">Copy</button>
      </p>
      <p>
        <a id="download-link" download="events.ics">Download .ics File</a> |
        <a id="subscribe-link">Subscribe in Calendar</a>
      </p>
    </section>

    <h2>Testing Instructions</h2>

    <h3>Subscribe to Feed</h3>
    <ul>
      <li><strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste URL</li>
      <li><strong>Google Calendar:</strong> Settings → Add Calendar → From URL</li>
      <li><strong>Outlook:</strong> Add Calendar → From Internet → Paste URL</li>
    </ul>

    <h3>Testing Cancellations</h3>
    <ol>
      <li>Create an event without cancelAt</li>
      <li>Subscribe in your calendar app</li>
      <li>Generate same event with cancelAt in the past</li>
      <li>Wait for calendar refresh (or trigger manually)</li>
      <li>Event should appear cancelled/removed</li>
      <li>Repeat with a new title and "METHOD:CANCEL" as cancellation method, and compare</li>
    </ol>

    <h3>Client Refresh Rates</h3>
    <ul>
      <li><strong>Apple:</strong> 5 min - 1 week (configurable)</li>
      <li><strong>Google:</strong> ~24 hours (not configurable)</li>
      <li><strong>Outlook:</strong> ~3 hours</li>
    </ul>

    <h3>Known Issues</h3>
    <ul>
      <li>Google Calendar has slow refresh for subscriptions</li>
      <li>Some clients may cache .ics downloads</li>
      <li>Timezone support varies by client</li>
    </ul>

    <script>
      (() => {
        const form = document.getElementById("ical-form");
        const startAtInput = document.getElementById("startAt");
        const result = document.getElementById("result");
        const feedUrlInput = document.getElementById("feed-url");
        const copyButton = document.getElementById("copy-btn");

        // datetime-local inputs take local wall-clock time without a timezone suffix
        const toDatetimeLocal = (date) => {
          const pad = (n) => String(n).padStart(2, "0");
          return (
            date.getFullYear() +
            "-" +
            pad(date.getMonth() + 1) +
            "-" +
            pad(date.getDate()) +
            "T" +
            pad(date.getHours()) +
            ":" +
            pad(date.getMinutes())
          );
        };

        // Default start time: tomorrow at 14:30 local time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 30, 0, 0);
        startAtInput.value = toDatetimeLocal(tomorrow);

        form.addEventListener("submit", (e) => {
          e.preventDefault();

          const params = new URLSearchParams();
          for (const [key, value] of new FormData(form).entries()) {
            if (!value) continue;
            // datetime-local values are local time; send them to the API as UTC instants
            const isDateTime = key === "startAt" || key === "cancelAt";
            params.append(key, isDateTime ? new Date(value).toISOString() : value);
          }

          // basePath always ends with "/" (see config.ts)
          const basePath = form.getAttribute("data-base-path") || "/";
          const feedUrl = window.location.origin + basePath + "api/ical/events.ics?" + params.toString();

          feedUrlInput.value = feedUrl;
          document.getElementById("download-link").href = feedUrl;
          document.getElementById("subscribe-link").href = feedUrl.replace(/^https?:/, "webcal:");
          result.hidden = false;
        });

        const copyToClipboard = async (input) => {
          input.select();
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(input.value);
              return true;
            }
          } catch (err) {
            console.warn("Clipboard API failed, falling back to execCommand:", err);
          }
          // Fallback for browsers without Clipboard API (or without permission)
          try {
            return document.execCommand("copy");
          } catch {
            return false;
          }
        };

        copyButton.addEventListener("click", async () => {
          const copied = await copyToClipboard(feedUrlInput);
          copyButton.textContent = copied ? "Copied!" : "Copy failed";
          setTimeout(() => (copyButton.textContent = "Copy"), 2000);
        });
      })();
    </script>
  `;

  const view = renderViewToStream(HtmlComponent, {
    htmlTitle: pageData.title,
    basePath: pageData.basePath,
    bodyContent,
  });

  view.pipe(res);
});

export default router;
