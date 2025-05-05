# Ollama Remote Access Proxy

This package provides a simple Node.js proxy server and setup script to expose your local Ollama API (running on `http://localhost:11434`) to the internet using ngrok. This allows applications hosted elsewhere (like on GitHub Pages or Vercel) to access your local LLMs.

## Features

-   Creates a secure tunnel to a local proxy server using ngrok.
-   The proxy server adds necessary CORS headers and forwards requests to your local Ollama API.
-   Includes a PowerShell script (`start.ps1`) to automate setup and execution.
-   Designed for integration with Next.js applications, but adaptable.

## Prerequisites

-   Node.js (v14 or higher recommended)
-   npm (usually included with Node.js)
-   Ollama running locally on `http://localhost:11434`
-   `ngrok.exe` downloaded from [ngrok.com](https://ngrok.com/download) and placed in the **parent directory** (e.g., `liftmate-app/ngrok.exe`).
-   An ngrok account (free tier is sufficient) and your **authtoken**.

## Setup

1.  **Configure ngrok Authtoken:**
    *   Open the `ollama-remote-access/ngrok.yml` file.
    *   Replace `YOUR_NGROK_AUTH_TOKEN` (or the empty value after `authtoken:`) with your actual ngrok authtoken obtained from the [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).
    *   Save the file.

2.  **Run the Startup Script:**
    *   Open PowerShell **as Administrator** (required for ngrok API access sometimes).
    *   Navigate to the `ollama-remote-access` directory:
        ```powershell
        cd path/to/liftmate-app/ollama-remote-access
        ```
    *   Run the script:
        ```powershell
        ./start.ps1
        ```

    This script will:
    *   Check if `ngrok.exe` exists in the parent directory.
    *   Check if Ollama is running locally.
    *   Verify the ngrok authtoken is set in `ngrok.yml`.
    *   Install required Node.js dependencies (`express`, `cors`, `ngrok`) if they are missing.
    *   Start the ngrok tunnel, exposing the proxy server (running on port 3500 by default).
    *   Display the public ngrok URL (e.g., `https://<random-string>.ngrok.io`). **Copy this URL.**
    *   Start the Node.js proxy server (`server.js`).

    Keep this PowerShell window open. It runs the proxy server and shows its logs. A separate minimized window runs ngrok.

3.  **Configure Your Deployed Application:**
    *   For your deployed Next.js application (e.g., on Vercel, Netlify), you need to set an environment variable named `NGROK_PROXY_URL`.
    *   Set the value of `NGROK_PROXY_URL` to the **ngrok URL** you copied in the previous step (e.g., `https://<random-string>.ngrok.io`).
    *   Make sure to **redeploy** your application after setting the environment variable.

## Usage

-   **Local Development:** When running your Next.js app locally (`npm run dev`), the `/api/workout-advice` route will automatically call `http://localhost:11434/api/chat` directly.
-   **Deployed Application:** When your Next.js app is deployed (and the `NGROK_PROXY_URL` environment variable is set), the `/api/workout-advice` route will automatically call `<your-ngrok-url>/api/chat`, which tunnels through the proxy server to your local Ollama instance.

The frontend component (`components/workout-advisor.tsx`) should always call the relative path `/api/workout-advice`. The API route handles the logic of where to send the request based on the environment variable.

## Important Notes

-   The free ngrok plan generates a **new URL** every time you restart the `start.ps1` script. You will need to update the `NGROK_PROXY_URL` environment variable in your deployment settings and redeploy your application each time the URL changes. Paid ngrok plans offer static domains.
-   The `start.ps1` script needs to be running on your local machine whenever you want the deployed application to be able to access your local Ollama.
-   Ensure your firewall allows connections to the ports used (11434 for Ollama, 3500 for the proxy, 4040 for ngrok API).

## Troubleshooting

-   **`Error: ngrok auth token placeholder found...`**: Make sure you replaced the placeholder in `ngrok.yml` with your actual token.
-   **`Error: Ollama does not seem to be running...`**: Ensure the Ollama application or service is running on your machine.
-   **`Error getting ngrok URL...`**: Check the minimized ngrok window for specific errors. Ensure PowerShell was run as Administrator. Check firewall settings for port 4040.
-   **CORS Errors in Browser:** The proxy server (`server.js`) includes `cors()` middleware, which should allow requests from any origin. If you still see CORS errors, double-check that the request is actually going through the proxy via the ngrok URL.
-   **`Error starting Node.js server...`**: Check `server.js` for syntax errors. Run `node server.js` directly in the `ollama-remote-access` directory to see more detailed errors.

## License

MIT