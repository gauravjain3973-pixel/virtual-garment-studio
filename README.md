# Virtual Garment Replacement Studio

A web application that generates realistic virtual try-on images by replacing a shirt on a model photo with a flat-lay garment image. Powered by the Replicate API and Google's Nano Banana Pro model.

## Features

- **Drag & Drop Upload** — Upload model and garment images via drag-and-drop or file picker
- **Image Validation** — Accepts JPEG and PNG files up to 10MB
- **AI-Powered Try-On** — Generates photorealistic garment replacements preserving face, pose, lighting, and fabric texture
- **Before/After Comparison** — Interactive slider to compare the original and generated images
- **Style Code Naming** — Enter a style code (e.g. `sj123A`) to auto-generate download filenames as `SJ123-A-1.jpg`
- **Image Compression** — Downloads are compressed to JPG format with a maximum file size of 100KB
- **Responsive Design** — Clean, modern SaaS-style UI built with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Model:** Google Nano Banana Pro via Replicate API
- **Libraries:**
  - `replicate` — Replicate API client
  - `react-dropzone` — Drag-and-drop file uploads
  - `react-compare-slider` — Before/after image comparison

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later
- A [Replicate](https://replicate.com/) account and API token

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd virtual-garment-studio
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

   Open `.env.local` and replace the placeholder with your Replicate API token:

   ```
   REPLICATE_API_TOKEN=r8_your_actual_token_here
   ```

   You can get your token from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).

## Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a **model photo** (a person wearing a shirt)
2. Upload a **garment image** (flat-lay photo of the replacement shirt)
3. Enter a **style code** (alphanumeric, e.g. `sj123A`)
   - All characters except the last form the style: `SJ123`
   - The last character is the color: `A`
   - Download filename: `SJ123-A-1.jpg`
4. Click **Generate Virtual Try-On**
5. Compare the result using the before/after slider
6. Click **Download** to save the compressed JPG (max 100KB)

## API

### POST `/api/process`

Accepts `multipart/form-data` with two fields:

| Field          | Type | Description                     |
| -------------- | ---- | ------------------------------- |
| `modelImage`   | File | Model photo (JPEG/PNG, ≤10MB)   |
| `garmentImage` | File | Garment photo (JPEG/PNG, ≤10MB) |

**Success Response:**

```json
{
  "imageUrl": "https://replicate.delivery/..."
}
```

**Error Response:**

```json
{
  "error": "Error message describing the issue."
}
```

## Deployment to Vercel

1. Push your code to a GitHub repository.

2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.

3. Add the environment variable in the Vercel project settings:

   - **Key:** `REPLICATE_API_TOKEN`
   - **Value:** Your Replicate API token

4. Deploy. Vercel will automatically detect the Next.js framework and configure the build.

## Project Structure

```
virtual-garment-studio/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── process/
│   │   │       └── route.ts        # API endpoint for image processing
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main page with upload UI
│   ├── components/
│   │   ├── Loader.tsx               # Animated loading spinner
│   │   ├── ResultViewer.tsx         # Before/after slider with download
│   │   └── UploadBox.tsx            # Drag-and-drop upload component
│   ├── lib/
│   │   └── replicate.ts            # Replicate client initialization
│   └── utils/
│       └── fileHelpers.ts          # Image validation and base64 conversion
├── .env.local.example               # Environment variable template
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json
```

## License

MIT
