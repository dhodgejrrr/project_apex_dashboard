# Deployment & Security Guide

## Securing Your OpenRouter API Key

⚠️ **IMPORTANT**: Never commit your actual API key to version control!

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual API key:
   ```bash
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
   ```

3. The `.env.local` file is already in `.gitignore` and won't be committed.

### For Production Deployment

#### Vercel
1. In your Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add `VITE_OPENROUTER_API_KEY` with your API key value
4. Optionally add `VITE_OPENROUTER_MODEL` to specify the AI model

#### Netlify
1. In your Netlify dashboard, go to Site settings
2. Navigate to "Environment variables"
3. Add `VITE_OPENROUTER_API_KEY` with your API key value
4. Optionally add `VITE_OPENROUTER_MODEL` to specify the AI model

#### Other Platforms
Most platforms support environment variables. Set:
- `VITE_OPENROUTER_API_KEY`: Your OpenRouter API key
- `VITE_OPENROUTER_MODEL`: (Optional) The AI model to use

### API Key Security Best Practices

1. **Use a dedicated API key** for each deployment environment
2. **Set spending limits** in your OpenRouter dashboard
3. **Monitor usage** regularly
4. **Rotate keys** periodically
5. **Use the least privilege** - only enable the models you need

### Supported AI Models

The application supports any OpenRouter-compatible model. Popular options:

- `anthropic/claude-3.5-sonnet` (Default, best for analysis)
- `openai/gpt-4o` (Great all-around performance)
- `google/gemini-pro` (Good for technical questions)
- `meta-llama/llama-3.1-8b-instruct:free` (Free tier option)

### Cost Optimization

- **Claude 3.5 Sonnet**: ~$3/million tokens - excellent for detailed analysis
- **GPT-4o**: ~$5/million tokens - great general performance
- **Gemini Pro**: ~$1/million tokens - good balance of cost/performance
- **Llama 3.1 8B**: Free tier - basic functionality

Choose the model that best fits your usage and budget requirements.
