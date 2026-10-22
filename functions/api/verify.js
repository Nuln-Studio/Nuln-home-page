export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { token } = await request.json();
        
        if (!token) {
            return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const SECRET_KEY = env.TURNSTILE_SECRET_KEY;

        if (!SECRET_KEY) {
            return new Response(JSON.stringify({ success: false, error: 'Server misconfigured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const formData = new URLSearchParams();
        formData.append('secret', SECRET_KEY);
        formData.append('response', token);

        const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
        });
        
        const data = await cfRes.json();
        
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}