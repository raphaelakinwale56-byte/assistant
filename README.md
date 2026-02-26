# Prudent Homecare AI Chat Widget

A lightweight, embeddable AI chat widget designed for healthcare services.

## Features
- **Compassionate AI:** Powered by Gemini 3 Flash, trained on Prudent Homecare's business details.
- **Lead Capture:** Automatically triggers a lead form when users ask about pricing, consultations, or callbacks.
- **Mobile Responsive:** Works seamlessly on all devices.
- **Lightweight:** Vanilla JS implementation with minimal dependencies.

## Folder Structure
- `server.ts`: Express backend handling AI chat and lead storage.
- `public/`: Static assets for the widget.
  - `prudent-chat-widget.js`: Main widget logic.
  - `widget-styles.css`: Widget styling.
- `leads.db`: SQLite database for captured leads.

## Deployment Guide

### 1. Environment Variables
Ensure you have the following in your environment:
- `GEMINI_API_KEY`: Your Google AI Studio API key.

### 2. Vercel / Netlify (Full-Stack)
This app requires a Node.js runtime for the Express server and SQLite database.
- **Vercel:** Use the `vercel.json` to define the serverless function for the Express app.
- **Railway/Render:** Recommended for persistent SQLite storage. Simply connect your repository and it will detect the `start` script.

## Embed Instructions

To add the chat widget to any website, include the following script tag before the closing `</body>` tag:

```html
<script src="https://your-deployment-url.com/widget/prudent-chat-widget.js"></script>
```

## Customization Guide

### Colors
To match your site's branding, edit `public/widget-styles.css`:
- `--prudent-primary`: Main brand color (buttons, headers).
- `--prudent-secondary`: Background for bot messages.

### AI Behavior
Modify the `systemInstruction` in `server.ts` to update the AI's knowledge or tone.

### Lead Capture Triggers
Edit the `triggers` array in `public/prudent-chat-widget.js` to change which keywords trigger the lead form.
