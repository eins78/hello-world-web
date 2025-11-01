# Google Artifact Registry Setup

## Overview

Google Artifact Registry (GAR) is used as the primary container registry for Cloud Run deployments to eliminate image propagation delays.

### Why Artifact Registry?

**Performance Benefits**:
- ✅ **Instant availability** - Images are immediately available to Cloud Run (no mirror propagation)
- ✅ **Same-region deployment** - GAR repository in same region as Cloud Run service
- ✅ **Zero delay** - No waiting for Docker Hub mirrors to propagate (was 60-300+ seconds)
- ✅ **Higher reliability** - Direct access, no third-party dependencies

**Cost Benefits**:
- ✅ **Free tier** - 0.5 GB (500 MB) storage per month ([source](https://cloud.google.com/artifact-registry/pricing))
- ✅ **Low cost** - $0.10/GB/month after free tier
- ✅ **Free data transfer** - No charges for same-region transfers to Cloud Run
- ✅ **Expected cost** - $0/month for this project (~50-100MB single image)

### Multi-Registry Strategy

We push to **three registries** for different purposes:

| Registry | Purpose | Access | Image Availability |
|----------|---------|--------|-------------------|
| **Google Artifact Registry** | Cloud Run deployments | Private | **Instant** (0s) |
| GitHub Container Registry | Public availability, GitHub integration | Public | Fast (~10s) |
| Docker Hub | Public availability, broad compatibility | Public | Slow (60-300s via Google mirrors) |

## Prerequisites

1. Google Cloud project with billing enabled
2. Existing Workload Identity Federation setup (see [Cloud Run Deployment Guide](cloud-run-deployment.md))
3. Service account with Cloud Run deployment permissions
4. GitHub repository with required secrets configured

## Setup Instructions

### Step 1: Enable Artifact Registry API

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="your-region"  # e.g., europe-west6 (same as Cloud Run!)
export GAR_REPOSITORY="hello-world-web"

# Enable API
gcloud services enable artifactregistry.googleapis.com --project=$GCP_PROJECT_ID
```

### Step 2: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create $GAR_REPOSITORY \
  --repository-format=docker \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --description="Container images for hello-world-web Cloud Run deployments"
```

**Important**: Use the **same region** as your Cloud Run service for optimal performance.

### Step 3: Grant Service Account Permissions

```bash
export SERVICE_ACCOUNT_EMAIL="github-actions-cloud-run@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

# Grant write permission (push images)
gcloud artifacts repositories add-iam-policy-binding $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"
```

**Note**: The same service account is used for both publishing images and deploying to Cloud Run.

### Step 4: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `GAR_LOCATION` | Same as `GCP_REGION` | `europe-west6` |
| `GAR_REPOSITORY` | Repository name from Step 2 | `hello-world-web` |

**Note**: `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and `GCP_SERVICE_ACCOUNT` should already be configured. See [GitHub Secrets Documentation](github-secrets.md).

### Step 5: Verify Setup

```bash
# List repositories
gcloud artifacts repositories list \
  --project=$GCP_PROJECT_ID \
  --location=$GCP_REGION

# Describe repository
gcloud artifacts repositories describe $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID

# Check IAM permissions
gcloud artifacts repositories get-iam-policy $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID
```

## How It Works

### Image Publishing Flow

1. Code is merged to `main` branch
2. `docker-image-publish.yml` workflow runs:
   - Authenticates to Google Cloud using Workload Identity Federation
   - Builds multi-platform Docker image (linux/amd64, linux/arm64)
   - Pushes to **three registries in parallel**:
     - GAR: `{region}-docker.pkg.dev/{project}/{repo}/hello-world-web:sha-{commit}`
     - GHCR: `ghcr.io/eins78/hello-world-web:main`
     - Docker Hub: `eins78/hello-world-web:main`

### Cloud Run Deployment Flow

1. `cloud-run-deploy.yml` workflow triggers after Docker publish completes
2. **No propagation wait needed** - GAR image is immediately available
3. Deploys to Cloud Run using GAR image reference
4. Deployment completes in <1 minute (vs 2-6 minutes with Docker Hub)

## Cost Analysis

### Storage Costs

**Free Tier**: 0.5 GB per month ([official pricing](https://cloud.google.com/artifact-registry/pricing))

**Current Usage**:
- Single image (multi-platform): ~100 MB compressed
- With 3-5 tagged versions: ~300-500 MB total
- **Result**: Stays within free tier

**Cleanup Strategy** (optional):
- Keep only last 10 SHA-tagged images
- Use Artifact Registry cleanup policies for automatic deletion

### Data Transfer Costs

**Free transfers** ([official pricing](https://cloud.google.com/artifact-registry/pricing)):
- ✅ Data transfer INTO Google Cloud: FREE
- ✅ Same-region transfers (GAR → Cloud Run): FREE
- ✅ Transfers to Google products: FREE

**Expected monthly cost**: **$0.00**

## Maintenance

### View Images

```bash
# List all images
gcloud artifacts docker images list \
  $GAR_LOCATION-docker.pkg.dev/$GCP_PROJECT_ID/$GAR_REPOSITORY \
  --project=$GCP_PROJECT_ID

# List tags for specific image
gcloud artifacts docker images list \
  $GAR_LOCATION-docker.pkg.dev/$GCP_PROJECT_ID/$GAR_REPOSITORY/hello-world-web \
  --include-tags \
  --project=$GCP_PROJECT_ID
```

### Delete Old Images (Optional)

```bash
# Delete specific image by tag
gcloud artifacts docker images delete \
  $GAR_LOCATION-docker.pkg.dev/$GCP_PROJECT_ID/$GAR_REPOSITORY/hello-world-web:old-tag \
  --project=$GCP_PROJECT_ID
```

### Cleanup Policies (Optional)

To automatically delete old images and save storage:

```bash
# Create cleanup policy (keep last 10 images)
gcloud artifacts repositories set-cleanup-policies $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --policy=policy.json
```

**policy.json**:
```json
{
  "rules": [{
    "id": "keep-recent-10",
    "action": "delete",
    "condition": {
      "olderThan": "30d",
      "tagState": "any"
    }
  }]
}
```

## Troubleshooting

### Permission Denied Errors

**Error**: `Permission denied: Unable to push to Artifact Registry`

**Solution**:
```bash
# Verify service account has writer role
gcloud artifacts repositories get-iam-policy $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID
```

### Image Not Found

**Error**: `Cloud Run deployment fails with "image not found"`

**Solution**:
```bash
# Verify image exists in GAR
gcloud artifacts docker images list \
  $GAR_LOCATION-docker.pkg.dev/$GCP_PROJECT_ID/$GAR_REPOSITORY/hello-world-web \
  --project=$GCP_PROJECT_ID

# Check image tag matches deployment
# Tag format: sha-{full-commit-sha}
```

### Authentication Issues

**Error**: `Failed to authenticate to Google Artifact Registry`

**Solution**:
1. Verify Workload Identity Federation is configured correctly
2. Check `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT` secrets
3. Ensure service account has `roles/artifactregistry.writer` permission

## References

- [Official: Artifact Registry Pricing](https://cloud.google.com/artifact-registry/pricing) - Free tier and cost details
- [Official: Deploying to Cloud Run](https://cloud.google.com/artifact-registry/docs/integrate-cloud-run) - Integration guide
- [Official: Docker Image Format](https://cloud.google.com/artifact-registry/docs/docker) - Repository management
- [Cloud Run Deployment Guide](cloud-run-deployment.md) - Complete deployment setup
- [GitHub Secrets Documentation](github-secrets.md) - Required secrets configuration
