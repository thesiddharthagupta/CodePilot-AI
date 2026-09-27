# Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | HTTP and WebSocket server listening port. |
| `NODE_ENV` | No | `development` | Runtime environment (`development` or `production`). |
| `JWT_SECRET` | Recommended | Built-in fallback | Secret cryptographic key for signing JWT user tokens. |
| `PISTON_URL` | No | `https://emkc.org/api/v2/piston/execute` | Isolated execution worker service endpoint. |
| `GEMINI_API_KEY` | No | None | Optional Google Gemini API key for external LLM calls. |
| `OPENAI_API_KEY` | No | None | Optional OpenAI API key for external LLM calls. |

*Note: Even without any third-party API keys configured, CollabCode operates with a built-in semantic code reasoning engine.*
