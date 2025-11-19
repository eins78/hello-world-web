# EU Cyber Resilience Act (CRA) Compliance

This document describes the supply chain security features implemented to comply with the EU Cyber Resilience Act (Regulation EU 2024/2847).

## Overview

The EU CRA requires manufacturers of products with digital elements to:
- Maintain a Software Bill of Materials (SBOM) in machine-readable format
- Cover at least top-level dependencies
- Provide SBOM to market surveillance authorities on request
- Report exploited vulnerabilities to ENISA

### Timeline

- **December 2024**: CRA entered into force
- **September 2026**: Vulnerability reporting to ENISA required
- **December 2027**: Full SBOM enforcement

### Penalties

Non-compliance can result in fines up to **EUR 15 million or 2.5% of global turnover**.

## Implemented Features

### 1. SBOM Generation

SBOMs are automatically generated for every Docker image build using [Anchore Syft](https://github.com/anchore/syft).

**Formats generated:**
- **CycloneDX** (primary) - Security-focused, excellent for vulnerability management
- **SPDX** (compliance) - ISO/IEC 5962:2021 standard

**Workflow steps:**
```yaml
- name: Generate SBOM (CycloneDX format)
  uses: anchore/sbom-action@v0
  with:
    image: ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }}
    format: cyclonedx-json
    output-file: sbom.cyclonedx.json
```

**Output locations:**
- GitHub workflow artifacts
- GitHub release assets (for tagged releases)

### 2. Vulnerability Scanning

Container images are scanned for vulnerabilities using [Anchore Grype](https://github.com/anchore/grype).

**Configuration:**
- Severity cutoff: `critical`
- Build failure: Disabled (warnings only, can be enabled)
- Output format: SARIF

### 3. Artifact Attestations (SLSA Level 2)

Build provenance attestations are generated using GitHub's native attestation features:

- **Build provenance**: Cryptographically signed proof of build origin
- **SBOM attestation**: Signed SBOM attached to the container image

These attestations provide SLSA v1.0 Build Level 2 compliance.

### 4. Container Image Signing

Images are signed using [Sigstore Cosign](https://github.com/sigstore/cosign) with keyless signing:

- Uses OIDC tokens from GitHub Actions
- Signatures stored in the container registry
- Logged in Sigstore transparency log (Rekor)

**Signed registries:**
- GitHub Container Registry (ghcr.io)
- Docker Hub (docker.io)

### 5. Reproducible Build Support

The Dockerfile supports reproducible builds through:

- `SOURCE_DATE_EPOCH` environment variable for deterministic timestamps
- `pnpm install --frozen-lockfile` for deterministic dependency installation
- Multi-stage builds for minimal final image

## Verification

### Verify GitHub Attestations

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Verify build provenance
gh attestation verify \
  oci://ghcr.io/eins78/hello-world-web@sha256:<digest> \
  --owner eins78

# Download SBOM attestation
gh attestation download \
  oci://ghcr.io/eins78/hello-world-web@sha256:<digest> \
  --predicate-type https://spdx.dev/Document
```

### Verify Cosign Signatures

```bash
# Install cosign if not already installed
# https://docs.sigstore.dev/cosign/installation/

# Verify signature with identity constraints
cosign verify \
  --certificate-identity-regexp "github.com/eins78/hello-world-web" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/eins78/hello-world-web@sha256:<digest>
```

### Download SBOM from Release

For tagged releases, SBOMs are attached as release assets:

```bash
# Download from GitHub release
gh release download v1.0.0 --pattern "sbom.*.json"

# Inspect CycloneDX SBOM
cat sbom.cyclonedx.json | jq '.components | length'

# Inspect SPDX SBOM
cat sbom.spdx.json | jq '.packages | length'
```

## Architecture

```
GitHub Actions Workflow
         |
         v
+-------------------+
|   Build Image     |
| (docker/build-push)|
+-------------------+
         |
         v
+-------------------+
|  Generate SBOMs   |
| (anchore/sbom)    |
+-------------------+
         |
         v
+-------------------+
|  Scan for Vulns   |
| (anchore/scan)    |
+-------------------+
         |
         v
+-------------------+
|   Attestations    |
| (actions/attest)  |
+-------------------+
         |
         v
+-------------------+
|   Sign Images     |
| (sigstore/cosign) |
+-------------------+
         |
         v
+-------------------+
|     Publish       |
| GHCR, Docker Hub, |
|       GAR         |
+-------------------+
```

## Security Considerations

### What Provenance Proves

- The image was built from a specific commit
- The build occurred on GitHub Actions infrastructure
- The build used a specific workflow file
- The image hasn't been tampered with since signing

### What Provenance Does NOT Prove

- The source code is secure
- The dependencies are vulnerability-free
- The image is safe to run

Always combine provenance verification with:
- Vulnerability scanning
- Security audits
- Runtime security policies

## Future Improvements

### SLSA Level 3

To achieve SLSA Level 3, implement:
- Reusable workflows for hardened builds
- Isolated build environments
- Protected signing keys

### Policy Enforcement

Consider implementing:
- Kubernetes admission policies (Kyverno, Gatekeeper)
- Require signed images for deployment
- Enforce minimum SLSA level

### VEX (Vulnerability Exploitability eXchange)

Document which vulnerabilities are not exploitable in your context using VEX statements.

## Related Resources

- [EU Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/library/cyber-resilience-act)
- [SLSA Framework](https://slsa.dev/)
- [Sigstore Documentation](https://docs.sigstore.dev/)
- [CycloneDX Specification](https://cyclonedx.org/)
- [SPDX Specification](https://spdx.dev/)
- [GitHub Artifact Attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds)

## Workflow File Reference

The implementation is in `.github/workflows/docker-image-publish.yml`.

Key sections:
- Lines 120-122: SOURCE_DATE_EPOCH conversion for reproducible builds
- Lines 143-160: SBOM generation (CycloneDX and SPDX)
- Lines 162-169: Vulnerability scanning with Grype
- Lines 182-198: GitHub artifact attestations
- Lines 200-214: Cosign keyless signing
