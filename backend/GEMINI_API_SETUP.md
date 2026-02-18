# Gemini API Setup Guide

## Issue: Skills Not Being Extracted

If you're not getting extracted skills when uploading a resume, it's likely because:

1. **The Gemini API key is invalid or expired**
2. **The API key has been reported as leaked** (security issue)

## How to Fix

### Step 1: Get a New Gemini API Key

1. Go to: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the new API key

### Step 2: Update the API Key

**Option A: Update in Code (Quick Fix)**
- Open `backend/app/gemini_service.py`
- Replace the API key on line 6:
  ```python
  GEMINI_API_KEY = "YOUR_NEW_API_KEY_HERE"
  ```

**Option B: Use Environment Variable (Recommended)**
1. Create a `.env` file in the `backend/` directory:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```
2. Update `gemini_service.py` to read from environment:
   ```python
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "fallback_key_if_needed")
   ```

### Step 3: Restart the Backend Server

After updating the API key, restart the backend server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## Current Model

The code now uses: `gemini-2.5-flash` (fast and efficient)

If you want to use a different model, update line 9 in `gemini_service.py`:
- `gemini-2.5-flash` - Fast, good for most tasks
- `gemini-2.5-pro` - More powerful, slower
- `gemini-pro-latest` - Latest stable version

## Testing the API Key

Test if your API key works:
```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-2.5-flash")
response = model.generate_content("Say hello")
print(response.text)
```

If this works, your API key is valid!

## Troubleshooting

### Error: "API key was reported as leaked"
- **Solution**: Get a new API key (the old one is compromised)

### Error: "404 model not found"
- **Solution**: The model name might be wrong. Check available models:
  ```python
  import google.generativeai as genai
  genai.configure(api_key="YOUR_KEY")
  for m in genai.list_models():
      if 'generateContent' in m.supported_generation_methods:
          print(m.name)
  ```

### Error: "PermissionDenied" or "403"
- **Solution**: 
  - Check if API key is correct
  - Make sure Generative AI API is enabled in Google Cloud Console
  - Verify billing is set up (free tier available)

### Skills Still Not Extracting
- Check backend terminal for error messages
- Verify resume text is being extracted (check file upload)
- Try with a simple PDF resume first
- Check if the resume has enough text content

## Alternative: Manual Skill Entry

If Gemini API continues to have issues, users can:
1. Go to Profile page
2. Manually add skills in the skills section
3. Skills will still work for career recommendations and job matching

