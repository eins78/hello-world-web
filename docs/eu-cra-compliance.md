# EU Cyber Resilience Act (CRA) Compliance Demo

This project demonstrates the software supply chain measures that a product with digital elements in scope of the EU Cyber Resilience Act (CRA, Regulation (EU) 2024/2847) is expected to have: machine-readable SBOMs, vulnerability scanning, build provenance, and signed images. The Docker publish workflow implements them end to end, so the setup can be copied into a project where the regulation does apply.

> **Scope note:** hello-world-web itself is not in scope. It is free and open-source software maintained by an individual and not monetised, so it is not "made available on the market" (Art. 2(1), Art. 3(22), recitals 15, 18 and 20), and its maintainer is not an open-source software steward (Art. 3(14) requires a legal person). The measures here are voluntary. This is not legal advice.

## What the CRA requires

- **SBOM**: "identify and document vulnerabilities and components contained in products with digital elements, including by drawing up a software bill of materials in a commonly used and machine-readable format covering at the very least the top-level dependencies" (Annex I, Part II, point 1; definition in Art. 3(39)).
- **Provide the SBOM** to a market surveillance authority on reasoned request (Annex VII, point 8; Art. 13(25)). Making it available to users is optional (Annex II, point 9).
- **Report** actively exploited vulnerabilities and severe incidents simultaneously to the coordinating CSIRT and ENISA via the single reporting platform: early warning within 24 hours, notification within 72 hours, final report within 14 days of a fix (vulnerabilities) or one month (incidents) (Art. 14, Art. 16).
- **Due diligence** when integrating third-party components, including open-source ones (Art. 13(5)). The SBOMs, attestations and signatures published here are the material a downstream manufacturer needs for that.

### Timeline (Art. 71)

- **10 December 2024**: entry into force
- **11 June 2026**: Chapter IV (notified bodies) applies
- **11 September 2026**: reporting obligations (Art. 14) apply, also for products already on the market (Art. 69(3))
- **11 December 2027**: all other obligations apply, including Annex I and the SBOM

### Penalties (Art. 64)

Up to **EUR 15 million or 2.5 % of worldwide annual turnover** for breaches of Annex I and Articles 13 and 14 (Art. 64(2)); EUR 10 million / 2 % for other listed obligations (Art. 64(3)); EUR 5 million / 1 % for incorrect or misleading information (Art. 64(4)). Administrative fines do not apply to open-source software stewards (Art. 64(10)(b)).

Source: [Regulation (EU) 2024/2847 on EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)

## What the demo implements

Everything runs in `.github/workflows/docker-image-publish.yml` after the multi-platform image (linux/amd64 and linux/arm64) has been pushed to GHCR, Docker Hub and Google Artifact Registry (GAR, the registry Cloud Run deploys from). All of it is skipped on pull requests, where nothing is pushed.

### 1. SBOM Generation (per platform)

SBOMs are generated with [Anchore Syft](https://github.com/anchore/syft) (`anchore/sbom-action`) for each platform manifest of the image, so both architectures are covered.

**Formats generated** (per platform, `sbom.linux-<arch>.*.json`):

- **CycloneDX JSON** - security-focused, used for the vulnerability scan. CycloneDX is standardised as [ECMA-424](https://ecma-international.org/publications-and-standards/standards/ecma-424/).
- **SPDX 2.3 JSON** - compliance-oriented. SPDX 2.2.1 is standardised as ISO/IEC 5962:2021.

**Where to find them:**

- Workflow artifacts of every publish run
- Release assets of tagged releases (`v*.*.*`)
- As signed attestations on the GHCR and GAR images (see Verification)

### 2. Vulnerability Scanning (per platform)

Each CycloneDX SBOM is scanned with [Anchore Grype](https://github.com/anchore/grype) (`anchore/scan-action`). The results are uploaded as SARIF to the repository's Security tab (code scanning, categories `grype-container-amd64` and `grype-container-arm64`).

**Configuration:**

- Severity cutoff: `critical`
- Build failure: disabled (report only). The scan runs after the image has been pushed, so failing the job would not prevent publishing; it would only block the Cloud Run deployment that waits for this workflow.

### 3. Artifact Attestations (SLSA Build Level 2)

[GitHub artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations) are generated with `actions/attest`, always addressed by digest:

- **Build provenance** for the image index, on GHCR and GAR: a signed SLSA provenance statement linking the image to the commit, workflow and run that built it
- **SBOM attestation** for each platform manifest, on GHCR and GAR: the platform's SPDX SBOM, signed and attached to the image

GitHub states that artifact attestations by themselves provide SLSA v1.0 Build Level 2. Build Level 3 would require moving the build into a reusable workflow, so that the signing material is isolated from the build steps.

### 4. Container Image Signing

Images are signed with [Sigstore Cosign](https://github.com/sigstore/cosign) keyless signing (`cosign sign --recursive`, which signs the index and each platform manifest):

- The signing identity is the workflow's GitHub Actions OIDC token; no private keys are stored
- Signatures are stored next to the image in the registry and recorded in the Sigstore transparency log (Rekor)

**Registries:**

- GitHub Container Registry (ghcr.io): signed and attested
- Google Artifact Registry: signed and attested (the image Cloud Run runs)
- Docker Hub (docker.io): signed, best effort until a publish run has confirmed that Docker Hub accepts the signature storage used by cosign 3.x

### 5. Image Timestamps

The workflow passes `SOURCE_DATE_EPOCH` (the commit date) as a build argument. BuildKit uses it for the image config and history timestamps, and the `org.opencontainers.image.created` label is set to the commit date as well. This makes the image metadata independent of the build time.

The build is **not** bit-for-bit reproducible, because:

- The base image is pinned by tag (`node:<version>-alpine`), not by digest
- `npm i -g corepack` installs whatever version is current at build time
- File timestamps inside the layers are not rewritten (`rewrite-timestamp` is not set)
- BuildKit's own provenance attestation in the image index contains build times

### 6. Pinned GitHub Actions

All actions in the repository's workflows are pinned to commit SHAs with a version comment, and Renovate keeps the pins current (`helpers:pinGitHubActionDigests`). A tag like `@v4` can be moved to different code; a SHA cannot.

## Verification

The image index digest is the one printed by the build (or `docker buildx imagetools inspect ghcr.io/eins78/hello-world-web:main`). The same command lists the platform manifest digests, which the SBOM attestations are attached to.

### Verify GitHub Attestations

```bash
# requires the GitHub CLI: https://cli.github.com/
# (and `docker login ghcr.io` if the registry asks for it)

# Build provenance of the image index
gh attestation verify \
  oci://ghcr.io/eins78/hello-world-web@sha256:<index digest> \
  -R eins78/hello-world-web

# SBOM attestation of one platform manifest
gh attestation verify \
  oci://ghcr.io/eins78/hello-world-web@sha256:<platform digest> \
  -R eins78/hello-world-web \
  --predicate-type https://spdx.dev/Document/v2.3

gh attestation download \
  oci://ghcr.io/eins78/hello-world-web@sha256:<platform digest> \
  -R eins78/hello-world-web \
  --predicate-type https://spdx.dev/Document/v2.3
```

The GAR image has the same digests and the same attestations; verifying it needs `gcloud auth configure-docker <region>-docker.pkg.dev` first, then the same commands with the GAR image name.

### Verify Cosign Signatures

The certificate identity is the workflow file plus the git ref that ran it, so the check is anchored to it. An unanchored substring match would also accept signatures from other repositories or branches that contain the same text.

```bash
# requires cosign >= 3: https://docs.sigstore.dev/cosign/system_config/installation/

cosign verify \
  --certificate-identity-regexp '^https://github\.com/eins78/hello-world-web/\.github/workflows/docker-image-publish\.yml@refs/(heads/main|tags/v.*)$' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  ghcr.io/eins78/hello-world-web@sha256:<index digest>
```

### Download SBOM from Release

For tagged releases, SBOMs are attached as release assets:

```bash
gh release download v2.0.0 -R eins78/hello-world-web --pattern "sbom.*.json"

# Inspect CycloneDX SBOM
jq '.components | length' sbom.linux-amd64.cyclonedx.json

# Inspect SPDX SBOM
jq '.packages | length' sbom.linux-amd64.spdx.json
```

## Architecture

```
GitHub Actions: Docker Image Build and Publish

job docker-build
+------------------------+
|  Build and push image  |  linux/amd64 + linux/arm64
|  (docker/build-push)   |  -> GHCR, Docker Hub, GAR; SOURCE_DATE_EPOCH = commit date
+------------------------+
         |  index digest
         v
+------------------------+
|  Provenance + signing  |  actions/attest (GHCR, GAR)
|  (sigstore/cosign)     |  cosign sign --recursive (GHCR, GAR, Docker Hub)
+------------------------+
         |
         v
job sbom (matrix: amd64, arm64)
+------------------------+
|  SBOMs per platform    |  Syft: CycloneDX + SPDX  -> workflow artifacts
|  Scan per platform     |  Grype, report only      -> SARIF in the Security tab
|  SBOM attestation      |  actions/attest          -> GHCR, GAR (platform digest)
+------------------------+
         |  (version tags only)
         v
job release-sbom
+------------------------+
|  Attach SBOMs to the   |
|     GitHub release     |
+------------------------+
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

### SLSA Build Level 3

Move the build and attestation steps into a reusable workflow, so that the build runs isolated from user-defined steps and cannot access the signing material.

### Policy Enforcement

Consider implementing:

- Kubernetes admission policies (Kyverno, Gatekeeper) or Cloud Run Binary Authorization
- Require signed images for deployment
- Enforce minimum SLSA level

### Vulnerability handling process

A product in scope also needs the organisational side: a coordinated vulnerability disclosure policy, security updates for the support period, and the Art. 14 reporting path. This demo covers the technical artifacts only.

### VEX (Vulnerability Exploitability eXchange)

Document which vulnerabilities are not exploitable in your context using VEX statements.

## Related Resources

- [Regulation (EU) 2024/2847 (Cyber Resilience Act) on EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)
- [European Commission: Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- [SLSA v1.0 Build Levels](https://slsa.dev/spec/v1.0/levels)
- [Sigstore Documentation](https://docs.sigstore.dev/)
- [CycloneDX Specification](https://cyclonedx.org/) / [ECMA-424](https://ecma-international.org/publications-and-standards/standards/ecma-424/)
- [SPDX Specification](https://spdx.dev/)
- [GitHub Artifact Attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations) and [how to use them](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations)

## Workflow File Reference

The implementation is in `.github/workflows/docker-image-publish.yml`:

- job `docker-build` - builds and pushes the multi-platform image, then `Supply Chain Security - Attestations & Signing`: build provenance attestations (GHCR, GAR) and cosign signatures (GHCR, GAR, Docker Hub)
- job `sbom` (matrix over `amd64`, `arm64`) - `EU Cyber Resilience Act (CRA) Compliance - SBOM & Security`: Syft SBOMs, Grype scan with SARIF upload, SBOM attestations (GHCR, GAR) per platform manifest
- job `release-sbom` - attaches the SBOMs to the GitHub release of a version tag
- step `Set SOURCE_DATE_EPOCH` - image timestamps pinned to the commit date

All of these are skipped on pull requests.
