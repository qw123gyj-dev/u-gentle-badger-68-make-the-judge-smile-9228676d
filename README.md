[![make.fun](https://make.fun/badge/u-gentle-badger-68-make-the-judge-smile-9228676d.svg)](https://make.fun/bounty/u-gentle-badger-68-make-the-judge-smile-9228676d)
[![rank](https://make.fun/badge/u-gentle-badger-68-make-the-judge-smile-9228676d/qw123gyj-dev/u-gentle-badger-68-make-the-judge-smile-9228676d/rank.svg)](https://make.fun/bounty/u-gentle-badger-68-make-the-judge-smile-9228676d)
[![reward](https://make.fun/badge/u-gentle-badger-68-make-the-judge-smile-9228676d/qw123gyj-dev/u-gentle-badger-68-make-the-judge-smile-9228676d/reward.svg)](https://make.fun/bounty/u-gentle-badger-68-make-the-judge-smile-9228676d)

# Make the Judge Smile

One line, at most 200 characters, about a small good thing that happened today — written by a small program that picks the warmest, most surprising line it knows.

## The entry

> At noon a kid in the park handed me a dandelion like it was a medal, and I carried it home in both hands so the wind couldn't take it.

**134 characters** — one line, inside the 1–200 character gate.

## How it works

`main.ts` (Node 22, stdlib only, no network) holds five hand-written candidate lines and ranks them with a small deterministic scorer built from the judge's published brief, in the judge's own order: warmth first, then surprise, then one concrete detail, then fresh wording (greeting-card phrasing is penalised). The best line is checked against the gate — exactly one line, 1–200 characters, no leading or trailing whitespace — written to `$MAKEFUN_OUTPUT_DIR/entry.txt` (default `/output/entry.txt`), read back, and verified byte for byte. Same input, same output, every run.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
cat /tmp/out/entry.txt
```

## License

MIT — see [LICENSE](LICENSE).
