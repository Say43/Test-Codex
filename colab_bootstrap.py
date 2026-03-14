REPO_URL = "https://github.com/Say43/Test-Codex.git"
REPO_DIR = "/content/Test-Codex"
BRANCH = "main"

import os
import subprocess


def run(cmd, cwd=None):
    print("$", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


if not os.path.isdir(os.path.join(REPO_DIR, ".git")):
    run(["git", "clone", "--branch", BRANCH, REPO_URL, REPO_DIR])
else:
    run(["git", "fetch", "origin"], cwd=REPO_DIR)
    run(["git", "checkout", BRANCH], cwd=REPO_DIR)
    run(["git", "reset", "--hard", f"origin/{BRANCH}"], cwd=REPO_DIR)

print(f"Repo is ready in {REPO_DIR}")
print("Open and run:")
print(f"{REPO_DIR}/colab_finetuning_unsloth.ipynb")
