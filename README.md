# PTT2 - Push-to-Talk Communication System

A web-based Push-to-Talk (PTT) communication system built with Next.js, Vercel Blob Storage, and Ably.

## Features

- ✅ Simple username-based authentication
- ✅ Audio recording and upload
- ✅ Secure server-side file storage with Vercel Blob

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
NEXT_PUBLIC_ABLY_API_KEY=your_ably_api_key_here
```

**Get your tokens:**
- **Vercel Blob Token**: Go to [Vercel Dashboard > Storage](https://vercel.com/dashboard/stores) and create a Blob store, then copy the token.
- **Ably API Key**: Sign up at [Ably.com](https://ably.com) (free tier available) and get your API key.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/ptt2.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob token
     - `NEXT_PUBLIC_ABLY_API_KEY` - Your Ably API key (if using)
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add environment variables when asked.

## API Endpoints

### POST `/api/auth/login`
Login with a username and get a session cookie.

**Request:**
```json
{
  "username": "your-username"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "uuid-here"
}
```

### POST `/api/audio-upload`
Upload an audio file (requires authentication cookie).

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `audio` field containing the audio file

**Response:**
```json
{
  "audio_url": "https://..."
}
```

## Project Structure

```
/app
  /api
    /auth/login      # Authentication endpoint
    /audio-upload    # Audio upload endpoint
/lib
  auth.ts            # Auth utility functions
```

## CI/CD

### GitHub Actions

The project includes GitHub Actions workflows:

- **`.github/workflows/ci.yml`** - Runs on every push/PR:
  - Linting
  - Type checking
  - Build verification

- **`.github/workflows/deploy-preview.yml`** - Builds and comments on PRs

To enable CI checks, add these secrets in GitHub Settings > Secrets:
- `BLOB_READ_WRITE_TOKEN` (optional - uses dummy value for build if not set)
- `ABLY_API_KEY` (optional - uses dummy value for build if not set)

### GitLab CI

A `.gitlab-ci.yml` file is included for GitLab CI/CD pipelines. Configure it in your GitLab project settings.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Vercel Blob** - File storage
- **Ably** - Real-time messaging (for future phases)
- **Tailwind CSS** - Styling
- **GitHub Actions** - CI/CD

## License

MIT

