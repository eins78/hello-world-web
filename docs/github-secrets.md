# GitHub Secrets Configuration

This document lists all GitHub Actions secrets required for CI/CD workflows in this repository.

## Required Secrets

### Docker Hub (for docker-image-publish.yml and cloud-run-deploy.yml)

| Secret Name | Description | Example Value | How to Obtain |
|------------|-------------|---------------|---------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `yourusername` | Your Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_...` | Create at [Docker Hub → Account Settings → Security](https://hub.docker.com/settings/security) |

**Docker Hub Token Setup:**
1. Log in to [Docker Hub](https://hub.docker.com)
2. Go to Account Settings → Security → Access Tokens
3. Click "New Access Token"
4. Name: `github-actions-hello-world-web`
5. Permissions: **Read & Write**
6. Click "Generate"
7. Copy the token immediately (it won't be shown again)

### Google Cloud Platform (for cloud-run-deploy.yml)

| Secret Name | Description | Example Value | How to Obtain |
|------------|-------------|---------------|---------------|
| `GCP_PROJECT_ID` | Your GCP project ID | `my-project-123` | From GCP Console or `gcloud config get-value project` |
| `GCP_REGION` | GCP region for Cloud Run | `europe-west6` | Choose from [available regions](https://cloud.google.com/run/docs/locations) |
| `GCP_SERVICE_NAME` | Cloud Run service name | `hello-world-web` | Choose a name for your service |
| `GCP_SERVICE_ACCOUNT` | Service account email | `github-actions-cloud-run@my-project-123.iam.gserviceaccount.com` | Created during Workload Identity setup |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity provider | `projects/123456789/locations/global/workloadIdentityPools/...` | Output from Workload Identity setup |

**Note**: For detailed GCP setup instructions including Workload Identity Federation configuration, see [docs/cloud-run-deployment.md](./cloud-run-deployment.md).

## Setting Secrets

### Via GitHub Web UI

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

### Via GitHub CLI

```bash
# Docker Hub secrets
gh secret set DOCKERHUB_USERNAME --body "yourusername"
gh secret set DOCKERHUB_TOKEN --body "dckr_pat_..."

# Google Cloud secrets
gh secret set GCP_PROJECT_ID --body "your-project-id"
gh secret set GCP_REGION --body "europe-west6"
gh secret set GCP_SERVICE_NAME --body "hello-world-web"
gh secret set GCP_SERVICE_ACCOUNT --body "github-actions-cloud-run@your-project-id.iam.gserviceaccount.com"
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"
```

## Verifying Secrets

List all configured secrets (values are hidden):

```bash
gh secret list
```

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate tokens regularly** - especially Docker Hub tokens
3. **Use minimal permissions** - only grant what's needed
4. **Use Workload Identity Federation** instead of service account keys for GCP
5. **Review secret access** in GitHub Actions logs (values are automatically masked)
6. **Delete unused secrets** to reduce security surface area

## Troubleshooting

### Docker Hub Login Fails

- **Error**: `Error response from daemon: Get https://registry-1.docker.io/v2/: unauthorized`
- **Fix**: Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are correct
- **Check**: Token has Read & Write permissions
- **Regenerate**: Create a new access token if the old one expired

### GCP Authentication Fails

- **Error**: `ERROR: (gcloud.auth.login) invalid_grant: Token audience doesn't match`
- **Fix**: Verify `GCP_WORKLOAD_IDENTITY_PROVIDER` format is correct
- **Check**: Workload Identity Federation is configured properly
- **Verify**: Service account has required IAM roles (`roles/run.admin`, `roles/iam.serviceAccountUser`)

### Secret Not Found

- **Error**: `The secret GCP_PROJECT_ID was not found`
- **Fix**: Ensure secret is set at repository level, not environment level
- **Check**: Secret name matches exactly (case-sensitive)

## Related Documentation

- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run Deployment Guide](./cloud-run-deployment.md)
