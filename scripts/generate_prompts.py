import json
import re
from pathlib import Path
from collections import defaultdict

def get_latest_report_path(base_dir: Path) -> Path:
    # First try to find in the StrykerOutput directory
    if base_dir.exists():
        subdirs = sorted(base_dir.glob("*/"), key=lambda p: p.name, reverse=True)
        for subdir in subdirs:
            report = subdir / "coverage" / "stryker.json"
            if report.exists():
                return report

    # Then try the default location (newer versions use mutation.json)
    default_report = Path("coverage/stryker.json")
    if default_report.exists():
        return default_report

    # Try older format as a fallback
    fallback_report = Path("coverage/stryker.json")
    if fallback_report.exists():
        return fallback_report

    raise FileNotFoundError("No mutation report JSON found. Run Stryker with the JSON reporter enabled.")

def extract_original_line(source_code: str, line_number: int) -> str:
    lines = source_code.splitlines()
    return lines[line_number - 1].strip() if line_number <= len(lines) else "N/A"

def generate_prompts_by_mutator(report_path: Path, output_dir: Path, base_path_to_strip: str):
    with open(report_path, encoding='utf-8') as f:
        report = json.load(f)

    prompts_by_mutator = defaultdict(list)

    for file_path, file_data in report["files"].items():
        local_path = file_path.replace(base_path_to_strip, "")
        source_code = file_data.get("source", "")

        for mutant in file_data.get("mutants", []):
            if mutant["status"] != "Survived":
                continue

            line = mutant["location"]["start"]["line"]
            original = extract_original_line(source_code, line)
            mutated = mutant.get("replacement", "N/A")
            mutator = mutant["mutatorName"]

            prompt = f"""Write a unit test to detect a survived mutation

- File: `{local_path}`
- Line: {line}
- Mutator: `{mutator}`
- Original Code: `{original}`
- Mutated Code: `{mutated}`

The test should fail if the mutation is present and pass otherwise."""
            prompts_by_mutator[mutator].append(prompt)

    output_dir.mkdir(parents=True, exist_ok=True)
    for mutator, prompts in prompts_by_mutator.items():
        filename = re.sub(r'\W+', '', mutator.lower())
        (output_dir / f"{filename}_prompts.txt").write_text("\n---\n".join(prompts))

    print(f"Generated prompts for {len(prompts_by_mutator)} mutators in '{output_dir}'")

if __name__ == "__main__":
    base_dir = Path("StrykerOutput")
    output_dir = Path("stryker_prompts_by_mutator")
    base_path_to_strip = str(Path.cwd()) + "/"

    report_path = get_latest_report_path(base_dir)
    generate_prompts_by_mutator(report_path, output_dir, base_path_to_strip)
