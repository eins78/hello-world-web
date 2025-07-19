import { Router } from "express";
import config from "../../config.ts";
import { renderViewToStream } from "../../support/render-view/renderView.ts";
import { Html as HtmlComponent } from "../../views/Html.ts";
import { html } from "lit-html";

const router: Router = Router();

/* GET /demos/ical - iCalendar demo page */
router.get("/ical", async function (_req, res) {
  const pageData = {
    title: "iCalendar Demo",
    basePath: config.basePath,
  };

  const bodyContent = html`
    <div class="container mt-4">
      <h1>iCalendar Feed Demo</h1>
      <p>Generate dynamic iCalendar (.ics) feeds for testing calendar client compatibility.</p>

      <div class="row">
        <div class="col-md-6">
          <form id="ical-form" class="mb-4">
            <div class="mb-3">
              <label for="title" class="form-label">Event Title</label>
              <input 
                type="text" 
                class="form-control" 
                id="title" 
                name="title" 
                required 
                placeholder="Team Meeting"
                value="Demo Event"
              >
            </div>

            <div class="mb-3">
              <label for="startAt" class="form-label">Start Date/Time</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="startAt" 
                name="startAt" 
                required
              >
              <small class="form-text text-muted">Local time will be converted based on timezone</small>
            </div>

            <div class="mb-3">
              <label for="duration" class="form-label">Duration (minutes)</label>
              <input 
                type="number" 
                class="form-control" 
                id="duration" 
                name="duration" 
                min="1" 
                required 
                value="60"
              >
            </div>

            <div class="mb-3">
              <label for="tz" class="form-label">Timezone</label>
              <select class="form-control" id="tz" name="tz">
                <option value="">UTC (default)</option>
                <option value="Europe/Zurich">Europe/Zurich</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="cancelAt" class="form-label">Cancel At (optional)</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="cancelAt" 
                name="cancelAt"
              >
              <small class="form-text text-muted">If set to past time, event will be marked as cancelled</small>
            </div>

            <button type="submit" class="btn btn-primary">Generate Feed URL</button>
          </form>

          <div id="result" class="d-none">
            <h3>Feed URL:</h3>
            <div class="input-group mb-3">
              <input type="text" class="form-control" id="feed-url" readonly>
              <button class="btn btn-outline-secondary" type="button" id="copy-btn">Copy</button>
            </div>
            <div class="mb-3">
              <a id="download-link" class="btn btn-success" download="events.ics">Download .ics File</a>
              <a id="subscribe-link" class="btn btn-info">Subscribe in Calendar</a>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <h3>Testing Instructions</h3>
          
          <h4>Subscribe to Feed</h4>
          <ul>
            <li><strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste URL</li>
            <li><strong>Google Calendar:</strong> Settings → Add Calendar → From URL</li>
            <li><strong>Outlook:</strong> Add Calendar → From Internet → Paste URL</li>
          </ul>

          <h4>Testing Cancellations</h4>
          <ol>
            <li>Create an event without cancelAt</li>
            <li>Subscribe in your calendar app</li>
            <li>Generate same event with cancelAt in the past</li>
            <li>Wait for calendar refresh (or trigger manually)</li>
            <li>Event should appear cancelled/removed</li>
          </ol>

          <h4>Client Refresh Rates</h4>
          <ul>
            <li><strong>Apple:</strong> 5 min - 1 week (configurable)</li>
            <li><strong>Google:</strong> ~24 hours (not configurable)</li>
            <li><strong>Outlook:</strong> ~3 hours</li>
          </ul>

          <h4>Known Issues</h4>
          <ul>
            <li>Google Calendar has slow refresh for subscriptions</li>
            <li>Some clients may cache .ics downloads</li>
            <li>Timezone support varies by client</li>
          </ul>
        </div>
      </div>
    </div>

    <script>
      // Set default start time to tomorrow at 2:30 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 30, 0, 0);
      document.getElementById('startAt').value = tomorrow.toISOString().slice(0, 16);

      // Handle form submission
      document.getElementById('ical-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const params = new URLSearchParams();
        
        // Build query params
        for (const [key, value] of formData.entries()) {
          if (value) {
            // Convert datetime-local to ISO format
            if (key === 'startAt' || key === 'cancelAt') {
              params.append(key, new Date(value).toISOString());
            } else {
              params.append(key, value);
            }
          }
        }
        
        // Generate URLs
        const baseUrl = window.location.origin + '${config.basePath}/api/ical/events.ics';
        const feedUrl = baseUrl + '?' + params.toString();
        const webcalUrl = feedUrl.replace(/^https?:/, 'webcal:');
        
        // Update UI
        document.getElementById('feed-url').value = feedUrl;
        document.getElementById('download-link').href = feedUrl;
        document.getElementById('subscribe-link').href = webcalUrl;
        document.getElementById('result').classList.remove('d-none');
      });

      // Handle copy button
      document.getElementById('copy-btn').addEventListener('click', () => {
        const input = document.getElementById('feed-url');
        input.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
      });
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