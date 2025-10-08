# Google Cloud Run Deployment

This document describes how to deploy the application to Google Cloud Run, both manually and automatically via GitHub Actions.

## Overview

The application is deployed to Cloud Run as a "latest development" testing environment that automatically updates when code is merged to the main branch. The deployment:

- **Image**: `docker.io/eins78/hello-world-web:main` (Docker Hub)
- **Also published to**: `ghcr.io/eins78/hello-world-web:main` (GitHub Container Registry)
- **Auto-deploy**: On merge to main branch (after Docker image is published)

Configuration details (project ID, region, service name) are stored in GitHub Actions secrets for security.

## Manual Deployment

### Prerequisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate with gcloud:
   ```bash
   gcloud auth login
   gcloud config set project $YOUR_PROJECT_ID
   ```

### Deploy from Docker Hub

Deploy the latest main branch image:

```bash
# Set your configuration
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="your-region"  # e.g., europe-west6
export SERVICE_NAME="your-service-name"  # e.g., hello-world-web

gcloud run deploy $SERVICE_NAME \
  --image=docker.io/eins78/hello-world-web:main \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --max-instances=20 \
  --memory=256Mi \
  --cpu=1 \
  --timeout=3600 \
  --set-env-vars="APP_TITLE=Hello Cloud Run (latest dev)"
```

### Deploy a specific version

Replace `:main` with a specific tag:

```bash
gcloud run deploy $SERVICE_NAME \
  --image=docker.io/eins78/hello-world-web:v2.0.0 \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --max-instances=20 \
  --memory=256Mi \
  --cpu=1 \
  --set-env-vars="APP_TITLE=Hello Cloud Run v2.0.0"
```

## Automated Deployment (GitHub Actions)

### How It Works

1. Code is merged to `main` branch
2. `docker-image-publish.yml` workflow builds and publishes image to both:
   - GitHub Container Registry (GHCR): `ghcr.io/eins78/hello-world-web:main`
   - Docker Hub: `docker.io/eins78/hello-world-web:main`
3. `cloud-run-deploy.yml` workflow automatically deploys to Cloud Run using the Docker Hub image
4. Health check verifies the deployment

**Note**: Cloud Run uses the Docker Hub image because it natively supports `docker.io` registry. The GHCR image is kept for backward compatibility and other use cases.

### Setup Instructions

To enable automated deployment, you need to configure Workload Identity Federation for secure authentication from GitHub Actions to Google Cloud.

#### 1. Enable Required APIs

```bash
export PROJECT_ID="your-gcp-project-id"

gcloud services enable iamcredentials.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  --project=$PROJECT_ID
```

#### 2. Create a Service Account

```bash
export SERVICE_ACCOUNT_NAME="github-actions-cloud-run"
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --project=$PROJECT_ID \
  --display-name="GitHub Actions Cloud Run Deployer"
```

#### 3. Grant Required Permissions

```bash
# Permission to deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

# Permission to act as the runtime service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"
```

#### 4. Create Workload Identity Pool

```bash
export WORKLOAD_IDENTITY_POOL="github-actions-pool"
export WORKLOAD_IDENTITY_PROVIDER="github-actions-provider"
export REPO="eins78/hello-world-web"

# Create workload identity pool
gcloud iam workload-identity-pools create $WORKLOAD_IDENTITY_POOL \
  --project=$PROJECT_ID \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create workload identity provider
gcloud iam workload-identity-pools providers create-oidc $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'eins78'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

#### 5. Allow GitHub Actions to Impersonate Service Account

```bash
# Get the workload identity pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe $WORKLOAD_IDENTITY_POOL \
  --project=$PROJECT_ID \
  --location="global" \
  --format="value(name)")

# Grant the GitHub repo access to the service account
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"
```

#### 6. Configure GitHub Repository Secrets

All required secrets must be configured in your GitHub repository. See [docs/github-secrets.md](./github-secrets.md) for a complete list and detailed setup instructions.

**Quick Summary:**

##### Docker Hub Credentials
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Access token from Docker Hub

##### Google Cloud Credentials
- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_REGION`: Your GCP region (e.g., `europe-west6`)
- `GCP_SERVICE_NAME`: Your Cloud Run service name (e.g., `hello-world-web`)
- `GCP_SERVICE_ACCOUNT`: Service account email (format: `github-actions-cloud-run@PROJECT_ID.iam.gserviceaccount.com`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload identity provider resource name

To get the workload identity provider resource name:
```bash
gcloud iam workload-identity-pools providers describe $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --format="value(name)"
```

#### 7. Test the Workflow

Trigger a manual deployment:

```bash
# Via GitHub CLI
gh workflow run cloud-run-deploy.yml

# Or push to main branch
git push origin main
```

## Service Configuration

### Current Settings

- **Container Port**: 8080
- **Memory**: 256Mi
- **CPU**: 1 core
- **Max Instances**: 20
- **Timeout**: 3600s (1 hour)
- **Concurrency**: 100 requests per container
- **Authentication**: Public (allow unauthenticated)

### Environment Variables

- `APP_TITLE`: "Hello Cloud Run (latest dev)"
- `PORT`: 8080 (automatically set by Cloud Run)

### Health Check

The service includes a liveness probe:
- **Path**: `/api/time?healthcheck`
- **Port**: 8080
- **Initial Delay**: 3s
- **Period**: 10s
- **Timeout**: 1s
- **Failure Threshold**: 3

## Monitoring and Logs

### View Service Details

```bash
gcloud run services describe $SERVICE_NAME \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID
```

### View Logs

```bash
# Stream logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
  --project=$GCP_PROJECT_ID \
  --limit=50 \
  --format=json

# Or use Cloud Console
https://console.cloud.google.com/run/detail/$GCP_REGION/$SERVICE_NAME/logs?project=$GCP_PROJECT_ID
```

### View Metrics

```bash
# Open in Cloud Console
https://console.cloud.google.com/run/detail/$GCP_REGION/$SERVICE_NAME/metrics?project=$GCP_PROJECT_ID
```

## Troubleshooting

### Check Service Status

```bash
gcloud run services describe $SERVICE_NAME \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --format="value(status.conditions)"
```

### Test Health Endpoint

```bash
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --format="value(status.url)")

curl -v "${SERVICE_URL}/api/time?healthcheck"
```

### Common Issues

#### 1. Deployment Fails with Permission Error
- Check that the service account has `roles/run.admin` and `roles/iam.serviceAccountUser`
- Verify Workload Identity Federation is configured correctly

#### 2. Container Fails to Start
- Check logs: `gcloud logging read ...`
- Verify the image exists and is accessible: `docker pull docker.io/eins78/hello-world-web:main`
- Check that PORT environment variable is set correctly

#### 3. Health Check Failures
- Verify the application is listening on port 8080
- Check that `/api/time` endpoint is responding
- Review liveness probe configuration

#### 4. GitHub Actions Workflow Fails
- Check workflow logs in GitHub Actions tab
- Verify all secrets are set correctly
- Ensure the service account has necessary permissions

## Custom Domain (Future)

To map a custom domain to the service:

```bash
# Map domain
gcloud run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=your-domain.com \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID

# Verify mapping
gcloud run domain-mappings describe \
  --domain=your-domain.com \
  --region=$GCP_REGION \
  --project=$GCP_PROJECT_ID
```

Then update your DNS records as instructed by the command output.

## Cost Optimization

Cloud Run pricing is based on:
- **Request count**: First 2 million requests/month free
- **CPU time**: Charged per vCPU-second (with generous free tier)
- **Memory**: Charged per GiB-second (with generous free tier)
- **Networking**: Egress traffic charges

For a low-traffic development environment, costs should be minimal (likely within free tier).

To reduce costs:
- Lower `--max-instances` if needed
- Reduce `--memory` and `--cpu` if the application allows
- Use `--cpu-throttling` to only allocate CPU during request processing

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions Auth](https://github.com/google-github-actions/auth)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
