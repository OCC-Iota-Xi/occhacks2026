import { assertAdmin } from "@/lib/admin/auth";
import { parseFilters } from "@/lib/admin/filters";
import { adminContext, iterateApplicants } from "@/lib/admin/queries";
import { csvFilename, csvHeader, csvRows } from "@/lib/admin/csv";

/**
 * CSV download: /admin/export?<the applicant list's own query string>.
 *
 * Because the filters are the URL, "export what I'm looking at" is this route
 * with the same query — there is no second filter implementation to keep in
 * step. `ids` overrides the filters and exports exactly the checked rows.
 *
 * Streamed rather than assembled: the response starts before the last chunk has
 * been fetched, so the browser shows a download immediately even on a large
 * roster.
 */
export async function GET(request: Request) {
  try {
    await assertAdmin();
  } catch {
    return new Response("Not authorized", { status: 403 });
  }

  const url = new URL(request.url);
  const ctx = await adminContext();
  const filters = parseFilters(url.searchParams);

  const idParam = url.searchParams.get("ids");
  const ids = idParam ? idParam.split(",").map((id) => id.trim()).filter(Boolean) : null;
  const scope = ids ? "selected" : url.searchParams.toString() ? "filtered" : "all";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(csvHeader()));
      for await (const rows of iterateApplicants(ctx, filters, ids)) {
        controller.enqueue(encoder.encode(csvRows(rows)));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(scope)}"`,
      // Applicant details, so never in a shared cache.
      "Cache-Control": "no-store, private",
    },
  });
}
