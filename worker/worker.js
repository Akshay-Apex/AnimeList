export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("url");

    if (!imageUrl) {
      return new Response("Missing url", { status: 400 });
    }
    
    // Production origin
    const allowedOrigins = [
      "https://akshay-apex.github.io"
    ];

    /* Development origins
    const allowedOrigins = [
      "https://akshay-apex.github.io",
      "http://localhost",
      "http://127.0.0.1"
    ];
    */

    const origin = request.headers.get("Origin");

    // Blocks unauthorized origins
    if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
      return new Response("Blocked by CORS policy", { status: 403 });
    }

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        return new Response("Unauthorized access to this worker is blocked!", { status: 502 });
      }

      const headers = new Headers(response.headers);

      // Sets the CORS header
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: 200,
        headers
      });

    } catch (err) {
      return new Response("Worker error", { status: 500 });
    }
  }
};