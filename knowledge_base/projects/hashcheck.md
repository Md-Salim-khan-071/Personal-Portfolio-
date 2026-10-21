HashCheck
Project Overview
HashCheck-Sentinel (SentinelFIM) is a Windows desktop application for file integrity monitoring and basic file-change forensics. It establishes a baseline of files in a selected directory, computes SHA-256 hashes, and identifies files that have been added, modified, or deleted. It also includes live filesystem monitoring, entropy-based suspicious-encryption heuristics, and a demonstration sandbox for simulated security scenarios.

The intended users include developers, students, system administrators, and security learners who want to inspect changes to files on a Windows machine. This is a host-based monitoring prototype, not a replacement for a full endpoint detection and response (EDR) or antivirus product.
Problem Statement
A hash mismatch can indicate that a file has changed, but a hash alone does not explain what changed or whether the change is suspicious. Manually checking large directory trees is also inconvenient, and a modified file's timestamp may not tell the whole story.

HashCheck-Sentinel addresses these problems by recording file metadata and SHA-256 hashes, comparing current files with a saved baseline, displaying text differences where supported, and applying heuristics such as entropy changes to flag potentially suspicious activity.
Goals
- Establish and compare file-integrity baselines for a selected directory tree.
- Identify added, modified, and deleted files and provide useful context for investigating changes.
- Monitor filesystem activity and demonstrate integrity-monitoring concepts through repeatable test scenarios.
Technology Stack
- Language: C#
- Framework/UI: Windows Forms on .NET Framework 4.0
- Hashing libraries or algorithms: System.Security.Cryptography SHA-256; HMAC-SHA256 for baseline sealing; SHA-256-based Merkle-root construction
- Storage/database: Local files under a hidden .sentinel-baseline directory, including an active baseline, history, and snapshots; no database configured
- Testing: Built-in demonstration lab with simulated scenarios; automated unit-test project is not included in the supplied repository
- Deployment: Prebuilt Windows executable in release/HashCheckSentinel.exe; source build via MSBuild
Key Features
- File integrity scanning: Computes SHA-256 hashes and records file size, last-modified time, binary classification, and entropy.
- Baseline comparison: Reports file states such as unchanged, modified, added, deleted, threat, locked, and unreadable, depending on the scan and comparison path.
- Live filesystem watcher: Uses FileSystemWatcher, a concurrent event queue, and a 350 ms debounce window to process file activity.
- Text-change inspection: Shows line-level additions and deletions for supported text content.
- Binary/file metadata inspection: Compares size, entropy, and hashes and checks for selected suspicious indicators.
- Office document support: Extracts text from .docx, .docm, and .dotx files where the expected OpenXML document part is available.
- Entropy heuristic: Flags a large entropy increase reaching the configured threshold as possible encryption or packing.
- Baseline integrity mechanisms: Stores a Merkle root and an HMAC-SHA256 seal for baseline data.
- Demonstration sandbox: Includes four simulated cases: code backdoor injection, ransomware-like encryption, baseline tampering, and appended data in a PNG image.
Hashing Algorithms
- SHA-256: Computes a cryptographic digest for file contents.
- HMAC-SHA256: Computes a keyed message authentication code for baseline content.
- Merkle-style root: Combines sorted file hashes pairwise using SHA-256 to represent the scanned state.
The project does not implement a general-purpose password-hashing system. Its hashing is intended for file integrity and baseline verification.
How It Works
1. The user selects a directory to scan; the application enumerates accessible files while skipping selected internal or temporary paths.
2. Each file is read and hashed with SHA-256. The scanner also gathers metadata such as file size, modification time, binary classification, and entropy.
3. The application compares the scan with the saved baseline, reports detected changes, and can show text differences or binary metadata. The baseline manager stores baseline records, a Merkle root, an HMAC seal, and selected snapshots.
Inputs and Outputs
- Accepted inputs: A directory tree on the local Windows filesystem; files that the process can access for reading
- Output format: GUI status table and forensic dialogs; local baseline and snapshot files; startup error logging to startup_error.log when applicable
- Supported file/data types: General readable files for hashing; text files for line diffs; selected Word OpenXML formats (.docx, .docm, .dotx) for text extraction; PNG-specific trailing-data inspection; magic-header checks for PE/MZ, PDF, ZIP/Office, JPEG, and PNG
- Input size limits: No universal file-size limit is declared. Hashing uses a 64 KB stream buffer. Entropy analysis samples up to 256 KB. Text diff switches to a simpler chunk-based comparison when either side exceeds 2,500 lines. PNG trailing-data inspection reads the whole file into memory, so very large images may consume substantial memory.
Architecture and Data Flow
- UI layer: MainForm.cs provides the main Windows Forms dashboard and coordinates scanning, status display, and inspection dialogs.
- Core scanning: Core/Hasher.cs enumerates files, computes SHA-256, and returns per-file scan results.
- Baseline management: Core/BaselineManager.cs serializes baseline data, maintains history/snapshots, calculates a Merkle-style root, and creates/verifies an HMAC seal.
- Change analysis: Core/DiffEngine.cs compares text and binary metadata.
- Entropy and file inspection: Core/EntropyCalculator.cs calculates entropy, classifies files, checks magic headers, and looks for trailing data after a PNG IEND marker.
- Office extraction: Core/OfficeTextExtractor.cs extracts paragraph text from supported OpenXML Word documents.
- Live monitoring: Core/LiveWatcher.cs queues filesystem events and raises activity callbacks.
- Demo and explanatory UI: Core/DemoLab.cs and the dialogs in UI/ support demonstration scenarios and explain the techniques.
The main flow is: directory selection → file enumeration and hashing → baseline creation or comparison → status/forensic presentation. Live watcher events can trigger activity processing while monitoring is enabled.
Core Implementation
- File hashes are generated with .NET's SHA256.Create() and ComputeHash() over a file stream, using a 64 KB buffer and retries for some I/O/access failures.
- File enumeration is defensive: inaccessible directories and selected internal folders are skipped rather than stopping the entire scan.
- File entropy is calculated from byte frequencies using Shannon's formula. For file-based analysis, the implementation reads at most 256 KB as a sample.
- The baseline manager records hashes and metadata, stores history and text snapshots, and builds a pairwise SHA-256 Merkle-style root.
- The text-diff implementation in the supplied source uses a dynamic-programming Longest Common Subsequence (LCS) matrix for files up to 2,500 lines per side. Despite some README/UI wording referring to “Myers Diff,” this implementation is LCS-based for the normal path; larger files use a simpler positional chunk diff.
- The project targets .NET Framework 4.0 and references standard framework assemblies including Windows Forms, XML, and WindowsBase.
Verification and Comparison
The application compares the current scan with saved baseline entries using SHA-256 and file metadata. It can identify new, changed, and missing files, and its inspection UI can compare old and new text to show added, deleted, and unchanged lines. For binary files, the inspection path can compare hashes, sizes, entropy, and modification timestamps.

The code also includes checks for:
- Possible timestomping: a changed hash combined with a current modification time no later than the baseline timestamp.
- Possible encryption/packing: an entropy increase greater than 1.5 bits with new entropy at least 7.85.
- PNG trailing data: a heuristic looking for bytes beyond the PNG IEND marker.
These are indicators, not definitive proof of malware. High entropy is common in legitimate compressed or encrypted files, and timestamps alone are not reliable evidence of an attack.
Security and Privacy
- The supplied code performs local file scanning and stores its baseline data locally; no cloud upload or remote telemetry is evident in the reviewed source.
- SHA-256 is used to detect content changes, not to prove that a file is safe.
- Important limitation: BaselineManager.cs contains a hard-coded HMAC secret string. Despite comments describing a hardware/installation-derived key, the key shown in the code is a fixed literal. A person who can inspect the source can recover it, so this should not be described as a strong machine-bound, attacker-resistant seal.
- The baseline is stored under a hidden directory, but hidden files and directories are not a security boundary. A local attacker with sufficient permissions may alter or remove baseline data.
- The application should be treated as a learning/prototype tool until the key management, baseline protection, and threat-detection logic have been independently reviewed.
Error Handling and Validation
- File access uses sharing flags intended to allow reads while files are open elsewhere, plus retry attempts for some I/O and authorization failures.
- Directory enumeration skips selected inaccessible or missing directories.
- Entropy, magic-header, and PNG inspection helpers generally return fallback values when errors occur; this can make an inspection failure look like a neutral result rather than a distinct error.
- The startup code logs unhandled exceptions to startup_error.log where possible.
- The supplied repository does not include a dedicated automated test suite, so error paths and detection accuracy should be verified with additional tests.
My Contributions
Not determinable from the ZIP alone. The repository shows the code included in the project, but it does not establish which parts were personally written by you or by collaborators. Update this section with your actual work—for example, which scanning, baseline, UI, diff, entropy, or demonstration components you designed, implemented, tested, or documented.
Technical Challenges and Solutions
Challenge 1
- Challenge: Detecting file modifications at scale without relying only on filenames or timestamps.
- Solution: Compute SHA-256 over file contents, store a baseline, and compare current results with saved entries. The implementation uses streaming reads and parallel scanning mechanisms in the scanner.
Challenge 2
- Challenge: Turning a hash mismatch into useful investigative information.
- Solution: Provide text-diff output for supported text and Word documents, plus binary metadata comparisons including size, entropy, and selected timestamp heuristics.
Testing
- Included: A built-in demonstration lab with four simulated cases: code backdoor injection, ransomware-like encryption, baseline tampering, and PNG trailing-data injection.
- Automated tests: No separate unit-test or integration-test project is present in the ZIP.
- Verification status: The source and project structure were inspected, but the executable was not run and the simulated cases were not independently executed during this review. Do not claim measured performance or successful detection rates without running and recording those tests.
Suggested tests to perform before presenting the project:
- Create a baseline, modify one text file, and verify the status and displayed line diff.
- Add and delete files and check the resulting statuses.
- Change a binary file and inspect its hash, size, and entropy comparison.
- Test unreadable files and directories, long paths, large files, and rapid filesystem-event bursts.
- Run each demonstration scenario and record actual results.
- Test baseline tampering to confirm what the current hard-coded HMAC key does and does not protect against.
Usage
- Live demo: Not provided as a URL in the inspected repository
- Repository: No repository URL was provided in the ZIP contents
- How to run locally:
  1. On Windows, run release/HashCheckSentinel.exe to try the supplied prebuilt executable.
  2. To build from source, open the project in a compatible Visual Studio/MSBuild environment for .NET Framework 4.0, or run msbuild HashCheckSentinel.csproj /p:Configuration=Release.
  3. Select a directory in the application, create or load its baseline as supported by the UI, and inspect detected changes.
  4. Use the Examiner Lab controls to run the built-in demonstration scenarios.
Results and Learnings
The source demonstrates an integrated approach to file integrity monitoring: cryptographic file hashing, local baseline records, change classification, text-diff inspection, filesystem event processing, and entropy-based heuristics. It also illustrates why a hash mismatch alone is not enough to explain a change, and why heuristic alerts need careful interpretation.

No benchmark results, accuracy metrics, or independently verified runtime outcomes were included in this review. Performance and detection claims should be supported by reproducible measurements before being used in a portfolio or interview.
Known Limitations
- Windows desktop application targeting the legacy .NET Framework 4.0; no cross-platform UI is included.
- The HMAC secret is hard-coded in source and is not a secure machine-bound secret.
- Entropy and timestamp checks are heuristics and can produce false positives or miss threats.
- The entropy calculation samples at most 256 KB rather than analyzing the complete file.
- PNG trailing-data inspection loads the whole file into memory and uses a simple marker-based heuristic.
- Text diff uses LCS dynamic programming for smaller files and a less precise positional comparison for files over the configured line threshold.
- Office text extraction focuses on the main Word document XML and does not represent every element or all Office formats.
- No separate automated test suite, benchmark report, or externally hosted live demo is included in the ZIP.
- File-system watcher events can be missed by the operating system when its internal buffer overflows; debouncing does not guarantee lossless event capture.
Future Improvements
- Replace the hard-coded HMAC key with a securely provisioned per-installation key, protected with Windows DPAPI or another appropriate secret-management mechanism.
- Add automated unit and integration tests for hashing, baseline integrity, diffing, file-type checks, and event processing.
- Add explicit logging and user-visible error states instead of returning neutral fallback values for all inspection failures.
- Improve baseline protection and document the threat model, including what an administrator-level attacker can bypass.
- Add a proper event-overflow recovery strategy that triggers a rescan when filesystem events may have been lost.
- Use a well-tested diff implementation for large files and test performance on realistic directory trees.
- Add configurable exclusions, scan reports, and reproducible benchmarks.
- Validate detection thresholds on benign compressed/encrypted files and controlled attack simulations before making strong ransomware-detection claims.