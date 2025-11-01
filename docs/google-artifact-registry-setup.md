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

### Step 0: Prerequisites Check

Before starting, ensure you have:

```bash
# Check if gcloud is installed
gcloud --version

# List your GCP projects to find the correct project ID
gcloud projects list --format="table(projectId,name)"

# Set the project
gcloud config set project YOUR_PROJECT_ID
```

### Step 1: Enable Artifact Registry API

```bash
# Set environment variables (adjust to your values)
export GCP_PROJECT_ID="your-project-id"  # e.g., hello-world-web-474516
export GCP_REGION="your-region"  # e.g., europe-west6 (same as Cloud Run!)
export GAR_REPOSITORY="hello-world-web"

# Enable API
gcloud services enable artifactregistry.googleapis.com --project=$GCP_PROJECT_ID
```

**Example output**: No output indicates success.

### Step 2: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create $GAR_REPOSITORY \
  --repository-format=docker \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --description="Container images for hello-world-web Cloud Run deployments"
```

**Example output**:
```
Create request issued for: [hello-world-web]
Waiting for operation [projects/hello-world-web-474516/locations/europe-west6/operations/...] to complete...
..........done.
Created repository [hello-world-web].
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

**Example output**:
```
bindings:
- members:
  - serviceAccount:github-actions-cloud-run@hello-world-web-474516.iam.gserviceaccount.com
  role: roles/artifactregistry.writer
etag: BwZCiQGrV60=
version: 1
Updated IAM policy for repository [hello-world-web].
```

**Note**: The same service account is used for both publishing images and deploying to Cloud Run.

### Step 4: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `GAR_LOCATION` | Same as `GCP_REGION` | `europe-west6` |
| `GAR_REPOSITORY` | Repository name from Step 2 | `hello-world-web` |

**Via GitHub CLI**:
```bash
gh secret set GAR_LOCATION --body "europe-west6"
gh secret set GAR_REPOSITORY --body "hello-world-web"
```

**Via GitHub Web UI**:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `GAR_LOCATION` with value `europe-west6`
5. Add `GAR_REPOSITORY` with value `hello-world-web`

**Note**: `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and `GCP_SERVICE_ACCOUNT` should already be configured. See [GitHub Secrets Documentation](github-secrets.md).

### Step 5: Verify Setup

```bash
# List repositories
gcloud artifacts repositories list \
  --project=$GCP_PROJECT_ID \
  --location=$GCP_REGION

# Check IAM permissions
gcloud artifacts repositories get-iam-policy $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID

# Verify GitHub secrets
gh secret list | grep -E '(GAR_|GCP_)'
```

**Expected output for repository list**:
```
REPOSITORY       FORMAT  MODE                 DESCRIPTION                                                 LOCATION      ENCRYPTION          CREATE_TIME          SIZE (MB)
hello-world-web  DOCKER  STANDARD_REPOSITORY  Container images for hello-world-web Cloud Run deployments  europe-west6  Google-managed key  2025-11-01T15:07:22  0
```

**Expected output for IAM policy**:
```
bindings:
- members:
  - serviceAccount:github-actions-cloud-run@hello-world-web-474516.iam.gserviceaccount.com
  role: roles/artifactregistry.writer
```

**Expected GitHub secrets**:
```
GAR_LOCATION       2025-11-01T14:07:55Z
GAR_REPOSITORY     2025-11-01T14:07:56Z
GCP_PROJECT_ID     2025-10-08T16:45:07Z
GCP_REGION         2025-10-08T18:39:06Z
GCP_SERVICE_ACCOUNT
GCP_SERVICE_NAME
GCP_WORKLOAD_IDENTITY_PROVIDER
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
2. Workflow verifies image exists in Artifact Registry (sanity check for edge cases)
3. **No propagation wait needed** - GAR image is immediately available
4. Deploys to Cloud Run using GAR image reference
5. Health check verifies the deployment
6. Deployment completes in <1 minute (vs 2-6 minutes with Docker Hub)

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

### Cleanup Policies (Recommended for Long-Term Maintenance)

To automatically delete old images and ensure you stay within the free tier (0.5 GB):

**Why cleanup policies are important**:
- Each commit creates a new SHA-tagged image (~100 MB)
- 10-20 images can accumulate to 1-2 GB
- Without cleanup, you may exceed the free tier after 5-10 commits
- Cleanup policies run automatically, no manual intervention needed

**Recommended policy**:

```bash
# Create cleanup policy file
cat > /tmp/gar-cleanup-policy.json << 'EOF'
[
  {
    "name": "delete-old-sha-images",
    "action": {
      "type": "Delete"
    },
    "condition": {
      "tagState": "TAGGED",
      "tagPrefixes": ["sha-"],
      "olderThan": "2592000s"
    }
  },
  {
    "name": "keep-recent-images",
    "action": {
      "type": "Keep"
    },
    "mostRecentVersions": {
      "keepCount": 15
    }
  }
]
EOF

# Apply cleanup policy
gcloud artifacts repositories set-cleanup-policies $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --policy=/tmp/gar-cleanup-policy.json
```

**Note**: `olderThan` is in seconds (2592000s = 30 days). The policy file must be a JSON array, not an object.

**What this policy does**:
1. **Deletes** SHA-tagged images older than 30 days
2. **Keeps** the 15 most recent images (regardless of age)
3. **Result**: Maintains ~1.5 GB storage (within free tier + buffer)

**Verify cleanup policy**:
```bash
gcloud artifacts repositories describe $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --format="get(cleanupPolicies)"
```

**Expected output when policy is active**:
```
delete-old-sha-images={'action': 'DELETE', 'condition': {'olderThan': '2592000s', 'tagPrefixes': ['sha-'], 'tagState': 'TAGGED'}, 'id': 'delete-old-sha-images'};keep-recent-images={'action': 'KEEP', 'id': 'keep-recent-images', 'mostRecentVersions': {'keepCount': 15}}
```

**Dry-run before applying** (see what would be deleted):
```bash
gcloud artifacts repositories list-cleanup-policy-dry-run $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID
```

**Note**: Cleanup policies run automatically. You don't need to trigger them manually.

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
