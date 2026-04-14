# Dragon Warrior Monsters breeding tree MVP

This repo is a text-first MVP for planning breeding chains in **Dragon Warrior Monsters**.

The current goal is simple:

- keep **all breeding recipes per monster** in a machine-readable file
- start from a **target monster**
- expand to **parents, grandparents, and earlier generations**
- print the result as a **text family tree** so it can later feed route planning

Monster source data such as gates, NPC trades, boss joins, and progression locks can sit in a second YAML later. This first pass is focused on breeding only.

## Files

- `dwm_breeding.yml` — breeding database
- `dwm_tree.py` — CLI tool that prints a text breeding tree

The script looks for `dwm_breeding.yml` in the **same folder** as the script by default.

## Current scope

The breeding YAML currently contains:

- `215` monsters
- `210` monsters with at least one specific recipe entry
- `292` recipe groups
- `975` explicit recipes after expansion

The database preserves **pedigree order** and keeps both:

- grouped recipe formulas
- fully expanded explicit recipes

That matters because DWM breeding is not just an unordered pair.

## Requirements

- Python 3.10+
- PyYAML

Install dependency:

```bash
pip install pyyaml
```

## Quick start

Put `dwm_tree.py` and `dwm_breeding.yml` in the same directory, then run:

```bash
python dwm_tree.py DarkDrium --max-depth 4
```

You can also point to a custom database path:

```bash
python dwm_tree.py DarkDrium --db /path/to/dwm_breeding.yml --max-depth 4
```

## CLI usage

```bash
python dwm_tree.py TARGET [--db PATH] [--max-depth N] [--explode]
```

### Arguments

- `TARGET` — monster name to expand
- `--db PATH` — optional path to breeding YAML
- `--max-depth N` — limit recursive expansion depth for exact-monster branches
- `--explode` — print every explicit recipe instead of grouped recipe sets

## Two output modes

### 1) Grouped mode (default)

Grouped mode keeps recipe formulas compact. This is usually the best first view when a monster has many alternatives.

Example:

```bash
python dwm_tree.py DarkDrium --max-depth 2
```

Example output:

```text
DarkDrium [Boss]
└── recipe group A (1 pedigree option(s) x 1 secondary option(s))
    ├── pedigree
    │   ├── DeathMore3 [Boss]
    │   │   └── recipe group A (1 pedigree option(s) x 1 secondary option(s))
    │   │       ├── pedigree
    │   │       │   ├── DeathMore2 [Boss]
    │   │       └── secondary
    │   │           └── Mudou [Boss]
    └── secondary
        └── Watabou
```

### 2) Exploded mode

Exploded mode prints each fully expanded recipe one by one.

Example:

```bash
python dwm_tree.py KingSlime --explode --max-depth 2
```

This is useful when you want every exact branch spelled out, even if the output gets large.

## Name lookup and aliases

The script normalizes names for lookup, so searches are forgiving about spacing, punctuation, and capitalization.

Examples that resolve correctly:

- `SlimeKnight`
- `slime knight`
- `SLIME-KNIGHT`
- `SlimeNite` (alias)

If a name is unknown, the script suggests close matches.

## How the YAML is structured

Each monster is stored under `monsters:`.

Minimal shape:

```yaml
monsters:
  DarkDrium:
    family: Boss
    has_specific_recipe: true
    recipe_groups:
      - group_id: A
        pedigree_options:
          - raw: DeathMore3
            kind: monster
            name: DeathMore3
            min_plus: null
        secondary_options:
          - raw: Watabou
            kind: monster
            name: Watabou
            min_plus: null
    recipes:
      - recipe_id: A1
        source_group_id: A
        pedigree:
          raw: DeathMore3
          kind: monster
          name: DeathMore3
          min_plus: null
        secondary:
          raw: Watabou
          kind: monster
          name: Watabou
          min_plus: null
```

### Important fields

#### `family`
Monster family label used in output.

#### `has_specific_recipe`
- `true` = this monster has at least one specific breeding rule in the database
- `false` = treat as a leaf in the current MVP

Examples of current leaf monsters include monsters like `Watabou` and base species such as `Slime`.

#### `recipe_groups`
Compact representation of formula sets.

A group can contain multiple pedigree options and multiple secondary options. The grouped tree shows these without expanding every combination immediately.

#### `recipes`
Fully expanded list of all explicit pairings for that monster.

This is what `--explode` uses.

#### Requirement objects
Every parent requirement is stored as an object like:

```yaml
raw: '[SLIME] +4'
kind: token
name: SLIME
min_plus: 4
```

Kinds used right now:

- `monster` — exact monster name
- `token` — family/class token like `[SLIME]`, `[DRAGON]`, or `[BOSS]`

`min_plus` is preserved so later route-planning logic can reason about requirements such as `+4`.

## Behavior notes

### Pedigree order is preserved

Recipes are stored as:

- `pedigree`
- `secondary`

That is intentional and should stay intact for later planning logic.

### Tokens are treated as leaves

Right now, class requirements like `[SLIME]` or `[BOSS]` are printed as terminal nodes.

A later planner can replace those with actual candidate monsters once source and progression data are added.

### Cycles are detected

Some breeding relationships loop back into earlier monsters. The script marks these as `[cycle]` and stops recursion on that branch.

### Depth limits only affect recursive exact-monster expansion

`--max-depth` stops expansion of specific monster branches after `N` steps. Tokens still print as leaves.

## Typical workflow

Start broad:

```bash
python dwm_tree.py DarkDrium --max-depth 3
```

Then inspect a noisy target in grouped mode first:

```bash
python dwm_tree.py KingSlime --max-depth 2
```

Then switch to exploded mode when you want every exact pairing:

```bash
python dwm_tree.py KingSlime --explode --max-depth 2
```

Save output to a file when needed:

```bash
python dwm_tree.py DarkDrium --max-depth 5 > darkdrium_tree.txt
```

## Known limitations

This is intentionally an MVP.

What it does now:

- stores breeding data in YAML
- resolves names and aliases
- prints grouped or exploded text trees
- preserves pedigree order
- preserves `+N` requirements
- guards against infinite recursion

What it does **not** do yet:

- choose the best route from monsters you already own
- expand tokens like `[SLIME]` into legal concrete parents
- know where monsters come from
- account for gate unlock timing
- account for NPC breeding restrictions
- account for boss-join opportunities
- score branches by effort or progression

## Good next steps

The most useful next additions would be:

1. `owned:` input so satisfied branches can be pruned
2. a second YAML for monster sources
   - wild encounters by gate
   - NPC breeding
   - boss joins
   - progression / earliest possible access
3. token-resolution logic
   - turn `[SLIME]` into valid candidate monsters under user-defined rules
4. cost / routing logic
   - estimate the cheapest or earliest breeding path

## Troubleshooting

### `This script needs PyYAML`

Install the dependency:

```bash
pip install pyyaml
```

### `Unknown monster '...'`

Check spelling, or try a close canonical name / alias. The script will suggest nearby matches when it can.

### No output beyond one line

That usually means the monster is currently treated as a leaf in the YAML and does not have a specific recipe entry.

---

This README describes the current breeding-only MVP. The next milestone is turning the tree from a dependency viewer into a real planner by adding source data and inventory-aware pruning.
