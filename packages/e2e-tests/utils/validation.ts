/**
 * Validates that a string is a valid semantic version (semver)
 * @param version - The version string to validate
 * @returns true if the version is valid semver format
 */
export function isValidSemver(version: string): boolean {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Validates that a string is a valid semantic version with major version > 0
 * @param version - The version string to validate
 * @returns true if the version is valid and major version > 0
 */
export function isValidSemverWithNonZeroMajor(version: string): boolean {
  if (!isValidSemver(version)) return false;

  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return false;

  const major = parseInt(match[1]!, 10);
  return major > 0;
}

/**
 * Validates that a string is a valid ISO date string
 * @param dateString - The date string to validate
 * @returns true if the string is a valid ISO date
 */
export function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date.toISOString() === dateString;
  } catch {
    return false;
  }
}
