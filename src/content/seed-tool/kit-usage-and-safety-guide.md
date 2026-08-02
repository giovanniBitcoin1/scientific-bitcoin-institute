# Using the Physical Entropy Seed Kit Safely
### Why you must download the app — and what to do with the seed afterwards
*Scientific Bitcoin Institute — companion guide to the Physical Entropy Seed Kit v1.1*

---

## Part 1 — Why downloading the app matters (never use a hosted page)

The kit's security rests on one property: **the code you run is code you verified**. A page used live on a website cannot give you that property, no matter who publishes it — including us.

**A hosted page can change at any moment.** A web server compromise, a DNS hijack, a rogue CDN, a malicious insider, or a single compromised deploy key lets an attacker serve a poisoned version of the page — to everyone, or selectively to you — and revert it minutes later, leaving no trace. This is not hypothetical: it is the standard supply-chain attack pattern, and it is precisely the class of failure that produced the July 2026 Coldcard incident, where a 2021 firmware defect silently weakened seed generation for five years and enabled a $70M theft in 41 minutes. The lesson of that event is not "avoid Coldcard"; it is that **unverifiable randomness pipelines fail silently**, whether they live in firmware or on a web server.

**A downloaded file cannot change silently.** Once the file is on your disk, its SHA-256 hash pins it forever. The safe ritual is short:

1. **Download the kit once** and compute its hash: `sha256sum SBI-Physical-Entropy-Seed-Kit-v1.1.zip` (macOS: `shasum -a 256`). Compare it against the hash published by the Institute through a *different channel* than the download itself (site + social post + repository — an attacker must now compromise all of them consistently).
2. **Verify the contents**: unzip and run `sha256sum -c SHA256SUMS.txt` — every file must report `OK`.
3. **Let the apps verify themselves**: both editions run the official BIP-39 test vectors and the word-list hash on every launch, and refuse to work on any mismatch.
4. **Verify by agreement**: the HTML edition, the Python edition, and any third-party implementation (a hardware wallet's dice feature, Ian Coleman's offline tool, the reference `python-mnemonic` library) must produce identical words from identical flips. A backdoor cannot survive one honest comparison.

**Then use it offline.** Copy the verified file to a computer with networking disabled — best of all, a live-USB Linux session with no hard drive mounted, so nothing you type can persist or leak. Generate, write the words on paper, power off. A browser tab on your everyday online machine is acceptable only for learning and practice runs, never for a seed that will hold funds: browser extensions can read page contents, clipboard managers and keyloggers see what you type, and sync services quietly upload what you save.

**Never trust any live "seed generator" website** — ours or anyone's. If a site offers to generate a seed for you while you are online, close it. The only legitimate architecture is: verified file, offline machine, your own physical entropy.

---

## Part 2 — Using the seed afterwards: safer wallets and workflows

The seed phrase you created is the master key. Everything downstream must respect one rule: **the seed only ever touches offline devices; online devices only ever see public keys.**

### Recommended setup (singlesig, most users)

1. **Restore the seed into a hardware signer, on the device itself.** Type the words on the signer's own screen/keypad — never through a computer keyboard. Reputable, actively maintained options include Coldcard (Mk4/Q on firmware ≥ 5.6.0 / 1.5.0Q — the 2026 advisory versions), BitBox02, Jade, Trezor, and for fully air-gapped operation SeedSigner or Krux (stateless: they hold the seed only while powered). The signer never needs your seed *generated* by it — you are using it purely as a vault and signing machine, which sidesteps the entire class of RNG flaws.
2. **Pair a watch-only wallet on your computer or phone.** Export only the *xpub* (public key) from the signer into Sparrow Wallet (desktop, excellent verification features), Electrum, Nunchuk, or BlueWallet. The online machine can now build transactions and watch balances but can never spend.
3. **Sign air-gapped.** Transactions travel to the signer via QR codes or SD card (PSBT), get signed offline, and return. The seed never crosses the gap.
4. **Verify receive addresses on the signer's screen**, not the computer's, before large deposits — malware on the computer can swap addresses; the signer cannot lie if the seed never left it.
5. **Run a recovery drill before real funds.** Send a small amount, wipe the signer, restore from your paper words, and spend the test amount back out. Only a tested backup is a backup.

### Hardening options (larger amounts)

- **BIP39 passphrase ("25th word")**: an extra secret, memorized or stored separately, that derives a different wallet from the same seed. Protects the paper backup from physical discovery. It must be backed up too — a forgotten passphrase is unrecoverable loss.
- **Multisig (e.g. 2-of-3)** with keys on different devices from different vendors, coordinated with Sparrow, Specter Desktop, or Nunchuk: no single flawed device — not even another Coldcard-class RNG failure — can lose or steal the funds. This is the strongest practical answer to "what if my hardware has a bug".
- **Metal backup** of the words (stamped or engraved) against fire and water; keep it geographically separate from the signer.

### Never do this (each item has caused real losses)

- Type a funded seed into any website, browser extension, chat, or "wallet checker" — including anything claiming to *validate* your phrase.
- Photograph the words, store them in cloud notes, email, password managers synced online, or a phone.
- Generate a real seed on an online machine, or in this kit's apps while networked, "just this once".
- Keep long-term savings on an exchange or in a phone hot wallet — hot wallets are for spending money only.
- Import the seed into desktop software (Electrum, Sparrow) as a *signing* wallet on an online machine — that converts your cold seed into a hot one instantly.
- Buy hardware signers second-hand or from third-party marketplace sellers; buy direct from the manufacturer and check tamper evidence and firmware authenticity on first boot.

### Keep the pipeline honest over time

Subscribe to your signer vendor's security advisories and update firmware deliberately (after a few days' community scrutiny, not day-zero). Re-verify the kit's hash any time you copy it to a new machine. And re-run the recovery drill roughly once a year — backups fail quietly.

---

*The through-line of both parts is the same principle the kit is built on: never trust a black box with your randomness or your keys. Verify files by hash, verify software by cross-implementation agreement, verify addresses on trusted screens, and verify backups by restoring them. Everything else is arithmetic.*
