# Deploying

The app runs as **one container on Google Cloud Run**. The Express server answers `/api/*` and also serves the built React app, so the front end and the back end share one URL and there is no CORS to configure.

## One-time setup

1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Sign in and choose the project:

   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

The project needs billing enabled. The first deploy asks to enable the Cloud Run, Cloud Build and Artifact Registry APIs; answer yes.

## Deploy

From the repo root:

```bash
gcloud run deploy teach-me-this-file \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --timeout 300
```

Cloud Build builds the `Dockerfile` and Cloud Run starts the new version. The command prints the service URL. Check it:

```bash
curl https://YOUR_SERVICE_URL/api/health    # {"ok":true}
```

To see exactly which files would be uploaded, run `gcloud meta list-files-for-upload`. Files listed in `.gitignore`, including `.env`, are not uploaded.

**First deploy on a new project.** It can fail with `PERMISSION_DENIED: Build failed because the default service account is missing required IAM permissions`. The build account was created seconds earlier and its permissions have not spread yet. Wait a minute and run the same command again.

## Why these settings

| Setting | Reason |
|---|---|
| `--source .` | One command: no local Docker and no registry to manage. |
| `europe-west1` | Close to the people who will use it. |
| `--allow-unauthenticated` | Reviewers open the URL without a Google account. |
| `--min-instances 0` | Costs nothing while idle. The price is a cold start: the first request after a quiet period waits for the container to start. |
| `--max-instances 2` | A public URL cannot run up a bill. |
| `--timeout 300` | Building a lesson from a long PDF can take more than a minute. 300 seconds is Cloud Run's default; it is set explicitly so the limit is visible here. |

## The API key is never on the host

No environment variables are set. Each visitor pastes their own Gemini key in the app; it travels in a request header and is used for that request only. The URL is public, so a key stored on the host would be a key anyone could spend.

## Limits this design works inside

| Limit | Value | What the app does about it |
|---|---|---|
| Request size (HTTP/1) | 32 MiB | Uploads are capped at 14 MB. |
| Request duration | 300 s as configured, 60 min at most | The file is processed in one request that streams progress events, so the connection is never silent. |
| Response size | 32 MiB, not applied to streamed responses | Answers are streamed. |
| Memory and CPU | 512 MiB and 1 vCPU, the defaults | An upload is held in memory only while its request runs: about 35 MB for the largest file with its base64 copy. |
| Scale to zero | Instances stop when idle | The server keeps no state. The lesson plan and the student's progress live in the browser, so a restart loses nothing. |
| Free tier | 2 million requests, 180,000 vCPU-seconds and 360,000 GiB-seconds a month | Far more than this app needs. |

Sources: [Cloud Run quotas and limits](https://docs.cloud.google.com/run/quotas), [request timeout](https://docs.cloud.google.com/run/docs/configuring/request-timeout), [Cloud Run pricing](https://cloud.google.com/run/pricing).

## Run the same image locally

```bash
docker build -t teach-me-this-file .
docker run --rm -p 8080:8080 -e PORT=8080 teach-me-this-file
# open http://localhost:8080
```
