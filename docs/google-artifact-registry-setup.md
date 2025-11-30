# Google Artifact Registry (GAR) Setup

This document describes how to set up and manage Google Artifact Registry for storing Docker images used in Cloud Run deployments.

## Overview

Google Artifact Registry (GAR) is the primary container registry for this project, providing:

- **Instant availability**: Images are immediately available to Cloud Run (no mirror propagation delay)
- **High reliability**: ~100% deployment success rate
- **Fast deployments**: <1 minute total deployment time
- **Cost-effective**: $0/month when staying within free tier

## Multi-Registry Strategy

Images are published to three registries:

| Registry | Purpose | Access | Availability |
|----------|---------|--------|--------------|
| **Google Artifact Registry** | Cloud Run deployments | Private | Instant (0s) |
| GitHub Container Registry | Public availability | Public | Fast (~10s) |
| Docker Hub | Public availability | Public | Slow (60-300s) |

## Free Tier Details

Google Artifact Registry provides a generous free tier:

- **Storage**: 0.5 GB/month free ([source](https://cloud.google.com/artifact-registry/pricing))
- **Network egress**: Included within same region
- **Additional storage**: $0.10/GB/month (if exceeding free tier)

**Current usage** (as of 2025-11-30):
- Storage: 1.4 GB (exceeds free tier - cleanup policies adjusted)
- Images: 245 total (includes multi-arch manifests and untagged intermediates)
- SHA-tagged images: 20

## Repository Setup

### Prerequisites

1. Google Cloud SDK installed
2. Authenticated with gcloud
3. Project ID and region configured

### Create Repository

```bash
export GCP_PROJECT_ID="hello-world-web-474516"
export GCP_REGION="europe-west6"  # Same as Cloud Run!
export GAR_REPOSITORY="hello-world-web"

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com --project=$GCP_PROJECT_ID

# Create Docker repository
gcloud artifacts repositories create $GAR_REPOSITORY \
  --repository-format=docker \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --description="Container images for hello-world-web Cloud Run deployments"
```

### Grant Service Account Permissions

The GitHub Actions service account needs permission to push images:

```bash
export SERVICE_ACCOUNT_EMAIL="github-actions-cloud-run@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

gcloud artifacts repositories add-iam-policy-binding $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"
```

## Cleanup Policies

Cleanup policies automatically delete old images to stay within the free tier.

### Current Policies (Updated 2025-11-30)

**1. Delete old SHA-tagged images (30 days)**
- Deletes SHA-tagged images older than 30 days
- Keeps recent deployment history while preventing indefinite accumulation

**2. Delete untagged images (7 days)** ⭐ New
- Deletes intermediate build artifacts older than 7 days
- Reduces storage footprint from multi-stage builds

**3. Keep 5 most recent images**
- Maintains the 5 most recent image versions regardless of age
- Provides ~7 days of rollback capability (based on current deployment frequency)
- Reduced from 15 to stay within free tier

### Set Cleanup Policies

Create a cleanup policy file:

```json
[
  {
    "name": "delete-old-sha-images",
    "action": {"type": "Delete"},
    "condition": {
      "tagState": "tagged",
      "tagPrefixes": ["sha-"],
      "olderThan": "2592000s"
    }
  },
  {
    "name": "delete-untagged-images",
    "action": {"type": "Delete"},
    "condition": {
      "tagState": "untagged",
      "olderThan": "604800s"
    }
  },
  {
    "name": "keep-recent-images",
    "action": {"type": "Keep"},
    "mostRecentVersions": {
      "keepCount": 5
    }
  }
]
```

Apply the policies:

```bash
gcloud artifacts repositories set-cleanup-policies $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --policy=cleanup-policy.json
```

### Verify Cleanup Policies

```bash
gcloud artifacts repositories describe $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --format="get(cleanupPolicies)"
```

## GitHub Actions Configuration

### Required Secrets

Add these secrets to your GitHub repository:

- `GAR_LOCATION`: `europe-west6` (same as `GCP_REGION`)
- `GAR_REPOSITORY`: `hello-world-web`
- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SERVICE_ACCOUNT`: Service account email for Workload Identity
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload identity provider resource name

### Workflow Integration

The `docker-image-publish.yml` workflow automatically:
1. Authenticates to Google Cloud using Workload Identity Federation
2. Logs in to GAR
3. Builds and pushes multi-arch images
4. Tags images with `sha-<commit>`, `edge`, `main`, and `nightly`

The `cloud-run-deploy.yml` workflow:
1. Deploys directly from GAR (no propagation wait needed)
2. Completes in <1 minute
3. Includes health check verification

## Monitoring and Maintenance

### Check Storage Usage

```bash
gcloud artifacts repositories describe $GAR_REPOSITORY \
  --location=$GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --format="value(sizeBytes)"
```

### List Images

```bash
# List all images with tags
gcloud artifacts docker images list \
  ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GAR_REPOSITORY}/hello-world-web \
  --project=$GCP_PROJECT_ID \
  --include-tags \
  --format="table(IMAGE,TAGS,CREATE_TIME,UPDATE_TIME)" \
  --sort-by=CREATE_TIME

# Count SHA-tagged images
gcloud artifacts docker images list \
  ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GAR_REPOSITORY}/hello-world-web \
  --project=$GCP_PROJECT_ID \
  --include-tags \
  --filter="tags:sha-*" \
  --format="value(TAGS)" | grep -c "sha-"
```

### Monthly Verification Tasks

Check GAR usage monthly to ensure free tier compliance:

1. **Storage usage**: Should be <500 MB
2. **Image count**: Should be ~5-20 images (depending on deployment frequency)
3. **Cleanup policies**: Should be active and working
4. **Billing**: Should show $0 charges for Artifact Registry

See [Issue #396](https://github.com/eins78/hello-world-web/issues/396) for verification checklist.

## Troubleshooting

### Storage Exceeds Free Tier

If storage exceeds 500 MB:

1. **Check image count**:
   ```bash
   gcloud artifacts docker images list \
     ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GAR_REPOSITORY}/hello-world-web \
     --project=$GCP_PROJECT_ID \
     --format="value(IMAGE)" | wc -l
   ```

2. **Adjust cleanup policies**: Reduce `keepCount` or `olderThan` values

3. **Manual cleanup**: Delete old images if needed
   ```bash
   gcloud artifacts docker images delete IMAGE_URL \
     --project=$GCP_PROJECT_ID \
     --delete-tags
   ```

### Cleanup Policies Not Working

1. **Verify policies are active**:
   ```bash
   gcloud artifacts repositories describe $GAR_REPOSITORY \
     --location=$GCP_REGION \
     --project=$GCP_PROJECT_ID \
     --format="get(cleanupPolicies)"
   ```

2. **Check policy execution**: Policies run periodically (not immediately)

3. **Review policy syntax**: Ensure JSON format is correct

### Push Permission Denied

If GitHub Actions cannot push images:

1. **Verify service account has `artifactregistry.writer` role**
2. **Check Workload Identity Federation is configured correctly**
3. **Ensure `GAR_LOCATION` and `GAR_REPOSITORY` secrets are set**

## Cost Analysis

**Expected monthly cost**: $0

**Assumptions**:
- Storage: <500 MB (within free tier after cleanup policies)
- Deployment frequency: ~0.7/day (20-25 images/month)
- Network egress: Minimal (same region as Cloud Run)

**If exceeding free tier**:
- Storage overage: $0.10/GB/month
- Example: 1.4 GB = ~$0.09/month ($0.10 × 0.9 GB overage)

## References

- [Google Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Artifact Registry Pricing](https://cloud.google.com/artifact-registry/pricing)
- [Cleanup Policies](https://cloud.google.com/artifact-registry/docs/repositories/cleanup-policy)
- [Cloud Run Integration](https://cloud.google.com/artifact-registry/docs/integrate-cloud-run)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- PR #395: GAR implementation
- Issue #396: Free tier verification tracking
