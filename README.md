# Unsloth Colab Fine-Tuning Workspace

This repository is a clean workspace for fine-tuning language models with Unsloth in Google Colab.

It is designed for a practical workflow:
- keep the notebook in GitHub
- sync the latest version into Colab
- store custom datasets as separate files in the repository
- switch between dataset variants from inside the notebook

## Contents

- `colab_finetuning_unsloth.ipynb`: main training notebook
- `colab_bootstrap.py`: helper script to clone or sync the repository in Colab
- `COLAB_WORKFLOW.md`: short GitHub-to-Colab workflow guide
- `datasets/custom/`: collection of custom training datasets

## Training Modes

The notebook supports two training modes:

- `finetome`: uses `mlabonne/FineTome-100k`
- `custom`: uses one of the repository datasets from `datasets/custom/`

The active mode is selected directly in the notebook.

## Custom Datasets

Custom datasets are stored as `.jsonl` files in `datasets/custom/`.

Each line contains one training example in this format:

```json
{"conversations":[{"role":"user","content":"Question"},{"role":"assistant","content":"Answer"}]}
```

Current examples:

- `datasets/custom/german_concise_style.jsonl`
- `datasets/custom/template_dataset.jsonl`

## Colab Workflow

Recommended workflow:

1. Edit locally or in Codex.
2. Commit and push to GitHub.
3. Open the notebook in Colab from the cloned repository.
4. Run the sync cell if needed.
5. Re-open the notebook from the synced repository path in `/content`.

See `COLAB_WORKFLOW.md` for the detailed flow.

## Goal

This repository is intentionally focused on a single use case:
reliable fine-tuning experiments with Unsloth in Colab, with versioned notebook code and versioned datasets in one place.
