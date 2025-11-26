# SHA1-HULUD Security Check Scanner

A comprehensive TypeScript scanner built with Bun to detect compromised npm packages from the SHA1-HULUD pt 2 supply chain attack. This tool performs deep recursive scans of your project directories to identify malicious files by matching their SHA256 hashes against known Indicators of Compromise (IOCs).

## Features

- **Recursive File Scanning**: Deeply scans directories to find suspicious files matching known IOC patterns
- **SHA256 Hash Verification**: Computes and verifies file hashes against a database of known malicious file signatures
- **Dependency Scanning**: Automatically detects and scans lock files (bun.lock, yarn.lock, pnpm-lock.yaml) to identify compromised npm packages by comparing package names and versions against a database of known compromised packages
- **Multiple IOC Detection**: Scans for various malicious file patterns including:
  - `bun_environment.js`
  - `setup_bun.js`
- **Fast Performance**: Built with Bun runtime for optimal scanning speed
- **Detailed Reporting**: Provides clear output showing which files match known IOCs with their hash values, and saves dependency scan results to JSON files

## Installation

```bash
bun install
```

## Usage

Run the scanner on a directory:

```bash
bun run check <directory>
```

### Example

```bash
bun run check ./my-project
```

### Example Output

**When no IOCs are found:**

```
🔒 Security Scanner
==================
Scanning for compromised packages and indicators of compromise

📂 Scanning directory: ./my-project
Scanning ./my-project for IOCs...
No IOC matches found.

📦 Checking dependencies in ./my-project
	🔍 Checking 150 confirmed compromised packages
	🔍 Searching for lock files in ./my-project
	🔍 Found 1 lock files
		🔍 Checking dependencies for ./my-project/bun.lock
		🟢 No matches found
	🟢 No dependencies compromised were found

⏱️ Scan completed in 2.34 seconds
```

**When IOCs are detected:**

```
🔒 Security Scanner
==================
Scanning for compromised packages and indicators of compromise

📂 Scanning directory: ./my-project
Scanning ./my-project for IOCs...
Found 2 IOC matches:
  bun_environment.js: /path/to/my-project/node_modules/some-package/bun_environment.js (62ee164b9b306250c1172583f138c9614139264f889fa99614903c12755468d0)
  setup_bun.js: /path/to/my-project/node_modules/another-package/setup_bun.js (a3894003ad1d293ba96d77881ccd2071446dc3f65f434669b49b3da92421901a)

📦 Checking dependencies in ./my-project
	🔍 Checking 150 confirmed compromised packages
	🔍 Searching for lock files in ./my-project
	🔍 Found 1 lock files
		🔍 Checking dependencies for ./my-project/bun.lock
		🚨 Found 1 matches
			🚨 COMPROMISED VERSION: malicious-package 1.2.3 - This exact version is known to be compromised!
	💾 Results saved to results/dependencies-bun-abc123-2024-01-01T12-00-00-000Z.json
	🚨 Found 1 matches

⏱️ Scan completed in 3.45 seconds
```

## What This Project Does

This security scanner is designed for the SHA1-HULUD pt 2 supply chain attack by:

1. **Recursively scanning** your specified directory structure
2. **Identifying suspicious files** that match known malicious file names (IOCs)
3. **Computing SHA256 hashes** for each matching file
4. **Comparing hashes** against a database of known malicious file signatures
5. **Scanning dependencies** by automatically finding and parsing lock files (bun.lock, yarn.lock, pnpm-lock.yaml) to check if any installed packages match known compromised package names and versions
6. **Reporting matches** with detailed information about compromised files and packages

The scanner helps you quickly identify if your system has been compromised by malicious npm packages that inject malicious code during installation or build processes. It performs both file-based IOC detection and dependency-based package verification to provide comprehensive security coverage.

## ⚠️ If Compromised Packages Found

If the scanner detects compromised packages, follow these critical remediation steps immediately:

### 🛑 STOP all builds/CI immediately

Halt all continuous integration pipelines and build processes to prevent further execution of malicious code.

### 🔒 Isolate CI runners (if self-hosted)

If you're using self-hosted CI runners, immediately isolate them from your network to prevent lateral movement and further compromise.

### 🔑 Rotate ALL sensitive keys

Immediately rotate all potentially exposed credentials:

- **GitHub tokens** (PAT, fine-grained, App tokens)
- **AWS credentials** (if non-OIDC)
- **NPM tokens**
- **API keys** (PostHog, Stripe, etc.)

### 🗑 Delete node_modules and lockfiles

Remove all installed dependencies and lockfiles:

```bash
rm -rf node_modules
rm -f package-lock.json bun.lock yarn.lock pnpm-lock.yaml
```

### 📝 Update dependencies to clean versions

Reinstall dependencies from trusted sources and verify package integrity:

### 🔍 Audit CI logs from last 48 hours

Review your CI/CD logs for the past 48 hours to identify:

- Any unauthorized access attempts
- Suspicious API calls or data exfiltration
- Unusual build behaviors or errors
- Any credentials that may have been exposed

---

**Note**: This scanner is a detection tool. If IOCs are found, treat it as a security incident and follow your organization's incident response procedures.

## Contributing

Contributions are welcome! This project aims to help the community detect and respond to supply chain attacks. Here's how you can contribute:

### Reporting New IOCs

If you discover new Indicators of Compromise related to the SHA1-HULUD attack or similar supply chain attacks:

1. **Verify the IOC**: Ensure the file hash and pattern are confirmed malicious
2. **Submit an Issue**: Open an issue with:
   - File name pattern
   - SHA256 hash(es)
   - Source/context of the discovery
   - Any additional relevant information

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure code follows existing style and patterns
5. Test your changes thoroughly
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

### Related Tools & Information

- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [GitHub Security Advisories](https://github.com/advisories)
- [npm Security Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Koi.ai SHA1-HULUD Incident Report](https://www.koi.ai/incident/live-updates-sha1-hulud-the-second-coming-hundred-npm-packages-compromised) - Live updates on the SHA1-HULUD supply chain attack
- [GitLab Blog: Widespread npm Supply Chain Attack](https://about.gitlab.com/blog/gitlab-discovers-widespread-npm-supply-chain-attack/) - GitLab's analysis of the widespread npm supply chain attack
- [Wiz Blog: Shai-Hulud 2.0 Ongoing Supply Chain Attack](https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack) - Wiz's analysis of the ongoing Shai-Hulud 2.0 supply chain attack

### Other Scanners

- [SHA1-HULUD Scanner](https://github.com/standujar/sha1-hulud-scanner?tab=readme-ov-file) - Another scanner for detecting SHA1-HULUD supply chain attack indicators
