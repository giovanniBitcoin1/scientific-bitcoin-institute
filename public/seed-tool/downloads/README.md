# Physical Entropy Seed Kit — v1.2
### Scientific Bitcoin Institute

Generate a Bitcoin BIP-39 seed phrase from **your own physical randomness**
(coin flips or casino dice) using tools that contain **no random number
generator at all** — so there is nothing for a rigged wallet, a compromised
supply chain, or AI-written malicious code to poison.

> Inspired by *"Do you trust your seed? Don't generate it yourself"*
> (Estudio Bitcoin). This kit implements that procedure and extends it with
> dice support, debiasing, dual-source mixing, built-in self-tests, and a
> pen-and-paper worksheet. Full methodology and references are inside
> `sbi-physical-entropy-seed-tool.html`.

---

## What's in the kit

| File | What it is |
|---|---|
| `sbi-physical-entropy-seed-tool.html` | The app, browser edition. One file, works on any OS, fully offline. Open it in any browser. |
| `sbi_seed_tool.py` | The app, desktop edition. Independent implementation, Python 3 standard library only. `python3 sbi_seed_tool.py` (GUI) or `--cli` (text mode). |
| `worksheet.html` | Printable pen-and-paper worksheet for the fully manual method (no computer). |
| `wordlist-printable.html` | The official 2048-word BIP-39 English list, numbered 0–2047, printable. |
| `english.txt` | The canonical BIP-39 word list file (for hash verification). |
| `SHA256SUMS.txt` | SHA-256 hashes of every file above. |
| `README.md` | This file. |

The two apps are **independent implementations of the same standard**. Given
identical flips or rolls they must produce identical words — and they must
also agree with a Coldcard, with Ian Coleman's offline tool, with the
reference `python-mnemonic` library, and with your own hand arithmetic.
That agreement, not trust in the Institute, is the security guarantee.

## Quick start (safe procedure)

1. **Verify the download.** On Linux/macOS: `sha256sum -c SHA256SUMS.txt`
   (macOS: `shasum -a 256 -c SHA256SUMS.txt`). Compare the hash of the ZIP
   itself against the value published by the Scientific Bitcoin Institute.
2. **Go offline.** Copy the kit to a computer with networking disabled —
   ideally a live-USB Linux session (nothing persists after power-off).
   Both apps display a warning if they can detect you are online (HTML
   edition) and neither will ever attempt a network connection.
3. **Make entropy.** Flip a coin 128/256 times, or roll dice 50/99 times.
   Vary your technique. Don't re-do "ugly" sequences — real randomness
   contains long runs.
4. **Enter it** in either app, press *Compute seed phrase*, and copy the
   words to paper. The last word is the computed checksum word.
5. **Verify independently** (do not skip): enter the same flips in the
   *other* edition, and/or run the printed verification commands in the
   app's audit trail. All outputs must match exactly.
6. **Dry-run restore** the phrase on your hardware wallet, send a small
   test amount, recover it — then commit real funds.
7. **Clear and power off.** Never photograph the words, never type them
   into an online device, never store them digitally.

## Why (the one-paragraph version)

Every wallet turns 128–256 random bits into your keys. If software chooses
those bits, you are trusting an invisible pipeline — and that pipeline has
failed repeatedly: Android SecureRandom (2013), Trust Wallet (32-bit
entropy, 2022–23), Libbitcoin "Milk Sad" (32-bit, 2023), and Coldcard's
firmware RNG defect (2021–2026, ~40 effective bits on Mk3) which enabled
the theft of ~$70M from 1,196 addresses in 41 minutes on July 30, 2026.
All of those seeds *looked* random. A coin in your hand cannot be
backdoored, and note well: seeds made with 50+ user-supplied dice rolls
were explicitly **unaffected** by the Coldcard flaw. Brute force is bounded
by physics, not intelligence — no AI removes bits from a fair coin: at 128
bits of real entropy, exhausting the keyspace takes longer than the age of
the universe even for an attacker with the entire Bitcoin mining network;
at 256 bits it exceeds the Sun's lifetime energy output.

## Dice verification one-liner

The dice method is Coldcard-compatible: entropy = SHA-256 of your roll
string. Check it anywhere:

    echo -n "31415926..." | sha256sum

The first 32 (12 words) or 64 (24 words) hex characters must equal the
"entropy (hex)" shown in the app's audit trail.

## License & contact

MIT License. Published by the Scientific Bitcoin Institute. Verify, don't
trust — including us: the whole point of this kit is that you never have to.
