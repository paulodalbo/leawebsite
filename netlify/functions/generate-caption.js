exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt, apiKey } = JSON.parse(event.body);

    if (!prompt || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt or API key' })
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API Error:', error);

      // More detailed error messages
      let errorMsg = 'Claude API error';
      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `${response.status}: ${errorMsg}`,
          details: error
        })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: data.content[0].text
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
};
