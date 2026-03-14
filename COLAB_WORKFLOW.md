# GitHub -> Colab Workflow

Ziel: Aenderungen aus diesem Repo schnell in Google Colab testen, ohne das Notebook jedes Mal manuell hochzuladen.

## Empfohlener Ablauf

1. Lokal oder in Codex aendern.
2. Committen und nach GitHub pushen.
3. In Colab das Repo mit einem Sync-Block aktualisieren.
4. Das Notebook aus dem lokalen Repo-Pfad in Colab ausfuehren.

## Variante A: Direkt aus GitHub in Colab oeffnen

Wenn du nur den neuesten Stand sehen willst:

`https://colab.research.google.com/github/Say43/Test-Codex/blob/main/colab_finetuning_unsloth.ipynb`

Vorteil:
- kein lokales Repo-Management in Colab

Nachteil:
- bei neuen Pushes musst du das Notebook in Colab neu laden

## Variante B: Repo in Colab syncen

Empfohlen fuer haeufiges Testen.

Erste Zelle in Colab:

```python
REPO_URL = "https://github.com/Say43/Test-Codex.git"
REPO_DIR = "/content/Test-Codex"
BRANCH = "main"
```

Dann den Sync-Block aus `colab_bootstrap.py` ausfuehren.

Danach:

```python
%cd /content/Test-Codex
!git status --short --branch
```

## Effizienter Test-Workflow

- Arbeite in Codex/Desktop.
- Push nach `main`.
- In Colab nur den Sync-Block erneut ausfuehren:

```python
%cd /content/Test-Codex
!git fetch origin
!git reset --hard origin/main
```

- Danach das Notebook neu laden oder die betroffenen Zellen erneut ausfuehren.

## Wichtig

- `git reset --hard origin/main` in Colab verwirft lokale Colab-Aenderungen im Repo-Ordner.
- Wenn du in Colab selbst experimentierst, dann entweder:
  - vorher committen, oder
  - nur ausserhalb des Repo-Ordners arbeiten

## Schnellster praktikabler Weg

Wenn du fast nur hier arbeitest und Colab nur zum Testen nutzt:

- Codex/Desktop: aendern -> commit -> push
- Colab: `fetch` + `reset --hard origin/main`

Das ist in der Praxis der kuerzeste stabile Loop.
