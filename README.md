# UNKNOWN NUMBER — setup guide

## 1. Add your image and sound
Upload your chosen jumpscare image to `assets/` and name it **jumpscare.jpg**. The supplied jumpscare image and an original short sound sting are already included in `assets/` as `jumpscare.jpg` and `jumpscare.wav`.

## 2. Upload to GitHub
1. Sign in at https://github.com and create a repository named `unknown-number`.
2. Upload every file and folder from this project, keeping the `api` and `assets` folders.
3. Commit the upload. The repository can be private.

## 3. Get an API key
1. Visit https://platform.openai.com/api-keys and create a secret key.
2. Keep it private. Never paste it into `app.js`, `index.html`, or GitHub.
3. API usage may incur charges; review billing and usage limits in your OpenAI account.

## 4. Deploy with Vercel
1. Sign in at https://vercel.com.
2. Choose Add New → Project and import your GitHub repository.
3. In Environment Variables, add `OPENAI_API_KEY` and paste your secret key as its value. Enable it for Production, Preview, and Development.
4. Optionally add `OPENAI_MODEL` with value `gpt-4.1-mini`.
5. Click Deploy. Vercel gives you a shareable website URL.

## Notes
- The API key stays on Vercel's server.
- This starter does not save chat history to a database, but messages and profile details are sent to the AI provider to generate replies.
- Common English and Filipino death-related phrases are detected. No simple phrase matcher catches every indirect wording, so test before sharing.
- Add rate limiting or bot protection before public launch to reduce unexpected API charges.
- Audio playback may be blocked until the visitor interacts with the page; visitors can mute the sound.
- This is fictional horror roleplay. Do not encourage visitors to enter sensitive personal information.
