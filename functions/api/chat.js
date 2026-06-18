export default {
  async fetch(request, env) {
    // Handle CORS preflight requests so your Pages website can talk to this Worker
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { history } = await request.json();

      if (!env.OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({ error: "Missing API Key" }), { 
          status: 500, 
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
        });
      }

      const response = await fetch('https://openrouter.ai', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'owl/alpha', 
          messages: [{ role: 'system', content: 'You are Void AI. Speak briefly.' }, ...history],
        })
      });

      const data = await response.json();
      return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      });
    }
  }
};
