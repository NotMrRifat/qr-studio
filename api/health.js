/**
 * Health check endpoint.
 * GET /api/health
 */
export default function handler(req, res) {
  res.status(200).json({ status: "ok" });
}
