export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    const body = JSON.parse(event.body);

    console.log("Received authorization:", body);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        received: body
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
