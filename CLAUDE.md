# Agent City — Claude Rules

## Code Style

- **No `let`** — Promote immutability. Use `const` with functional patterns (reduce, map, filter, ternaries). Only use `let` if there are truly no other options.
- **No `for`/`while` loops** — Use functional alternatives (map, filter, reduce, some, every, find). Only use loops if there are no better alternatives.
- **Strict types** — Avoid type assertions (`as`) and never use `unknown`. Define proper types and use type guards/narrowing. If a cast is truly unavoidable, add a comment explaining why.
- **`switch` over if-else chains** — When matching a value against multiple cases, prefer `switch` statements.
