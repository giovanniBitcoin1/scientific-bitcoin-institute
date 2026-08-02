#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================================
 PHYSICAL ENTROPY SEED TOOL — desktop edition
 Scientific Bitcoin Institute — v1.2 — MIT License
============================================================================

 A single-file, standard-library-only BIP-39 seed construction tool.
 Companion (independent implementation) to the HTML edition; both must
 always agree, along with every other correct BIP-39 implementation.

 DESIGN PRINCIPLE — this program NEVER generates randomness. Search this
 file: `random`, `secrets` and `urandom` appear only in this comment.
 All entropy comes from YOUR physical coin flips or dice rolls. The program
 only performs deterministic, independently verifiable arithmetic:

     your bits -> 11-bit groups -> BIP39 words -> SHA-256 checksum

 METHODOLOGY (full details and references in the kit's README and in the
 HTML edition):
   * Coin: heads=1, tails=0; your 128/256 flips ARE the entropy, verbatim.
   * Dice: entropy = first 128/256 bits of SHA256(ASCII roll string) —
     the Coldcard-compatible convention; verify with:
        echo -n "<rolls>" | sha256sum
     Minimum rolls: ceil(128/log2(6)) = 50, ceil(256/log2(6)) = 99.
   * Optional von Neumann debiasing (coin): pairs HT->1, TH->0, others
     discarded; provably removes any constant coin bias (von Neumann 1951).
   * Optional XOR mixing of two independent series: result is at least as
     unpredictable as the stronger source.
   * Checksum: first ENT/32 bits of SHA256(entropy) appended, then 11-bit
     groups index the official 2048-word BIP-39 English list.

 USAGE:
     python3 sbi_seed_tool.py            # graphical interface (Tkinter)
     python3 sbi_seed_tool.py --cli      # text interface (no Tkinter needed)
     python3 sbi_seed_tool.py --selftest # run test vectors and exit
     python3 sbi_seed_tool.py --entropy <hex>   # print mnemonic for entropy
                                                # (verification helper)

 On start the program self-tests against the official BIP-39 test vectors,
 a dice vector, and the SHA-256 of the embedded word list, and refuses to
 run if any check fails.

 SECURITY USAGE RULES (same as the HTML edition):
   1. Verify this file's SHA-256 against the published hash.
   2. Run it only on an OFFLINE, preferably amnesic (live-USB) computer.
   3. Paper only; no cameras; no funded seed ever touches an online device.

 Inspired by "Do you trust your seed? Don't generate it yourself"
 (estudiobitcoin.com). See the kit README for all references.
============================================================================
"""

import hashlib
import math
import sys

# ---------------------------------------------------------------------------
# Official BIP-39 English word list (2048 words).
# SHA-256 of "\n".join(WORDLIST)+"\n" must be
# 2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda
# (the canonical hash of english.txt in the BIP-39 repository).
# ---------------------------------------------------------------------------
WORDLIST = (
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
    'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
    'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
    'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
    'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
    'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
    'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
    'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
    'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
    'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
    'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
    'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
    'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
    'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
    'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
    'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
    'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
    'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
    'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
    'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
    'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring',
    'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain',
    'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief',
    'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
    'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
    'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus',
    'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable',
    'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'can',
    'canal', 'cancel', 'candy', 'cannon', 'canoe', 'canvas', 'canyon', 'capable',
    'capital', 'captain', 'car', 'carbon', 'card', 'cargo', 'carpet', 'carry',
    'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog',
    'catch', 'category', 'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling',
    'celery', 'cement', 'census', 'century', 'cereal', 'certain', 'chair', 'chalk',
    'champion', 'change', 'chaos', 'chapter', 'charge', 'chase', 'chat', 'cheap',
    'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child',
    'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar',
    'cinnamon', 'circle', 'citizen', 'city', 'civil', 'claim', 'clap', 'clarify',
    'claw', 'clay', 'clean', 'clerk', 'clever', 'click', 'client', 'cliff',
    'climb', 'clinic', 'clip', 'clock', 'clog', 'close', 'cloth', 'cloud',
    'clown', 'club', 'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut',
    'code', 'coffee', 'coil', 'coin', 'collect', 'color', 'column', 'combine',
    'come', 'comfort', 'comic', 'common', 'company', 'concert', 'conduct', 'confirm',
    'congress', 'connect', 'consider', 'control', 'convince', 'cook', 'cool', 'copper',
    'copy', 'coral', 'core', 'corn', 'correct', 'cost', 'cotton', 'couch',
    'country', 'couple', 'course', 'cousin', 'cover', 'coyote', 'crack', 'cradle',
    'craft', 'cram', 'crane', 'crash', 'crater', 'crawl', 'crazy', 'cream',
    'credit', 'creek', 'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop',
    'cross', 'crouch', 'crowd', 'crucial', 'cruel', 'cruise', 'crumble', 'crunch',
    'crush', 'cry', 'crystal', 'cube', 'culture', 'cup', 'cupboard', 'curious',
    'current', 'curtain', 'curve', 'cushion', 'custom', 'cute', 'cycle', 'dad',
    'damage', 'damp', 'dance', 'danger', 'daring', 'dash', 'daughter', 'dawn',
    'day', 'deal', 'debate', 'debris', 'decade', 'december', 'decide', 'decline',
    'decorate', 'decrease', 'deer', 'defense', 'define', 'defy', 'degree', 'delay',
    'deliver', 'demand', 'demise', 'denial', 'dentist', 'deny', 'depart', 'depend',
    'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk',
    'despair', 'destroy', 'detail', 'detect', 'develop', 'device', 'devote', 'diagram',
    'dial', 'diamond', 'diary', 'dice', 'diesel', 'diet', 'differ', 'digital',
    'dignity', 'dilemma', 'dinner', 'dinosaur', 'direct', 'dirt', 'disagree', 'discover',
    'disease', 'dish', 'dismiss', 'disorder', 'display', 'distance', 'divert', 'divide',
    'divorce', 'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin', 'domain',
    'donate', 'donkey', 'donor', 'door', 'dose', 'double', 'dove', 'draft',
    'dragon', 'drama', 'drastic', 'draw', 'dream', 'dress', 'drift', 'drill',
    'drink', 'drip', 'drive', 'drop', 'drum', 'dry', 'duck', 'dumb',
    'dune', 'during', 'dust', 'dutch', 'duty', 'dwarf', 'dynamic', 'eager',
    'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo',
    'ecology', 'economy', 'edge', 'edit', 'educate', 'effort', 'egg', 'eight',
    'either', 'elbow', 'elder', 'electric', 'elegant', 'element', 'elephant', 'elevator',
    'elite', 'else', 'embark', 'embody', 'embrace', 'emerge', 'emotion', 'employ',
    'empower', 'empty', 'enable', 'enact', 'end', 'endless', 'endorse', 'enemy',
    'energy', 'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough',
    'enrich', 'enroll', 'ensure', 'enter', 'entire', 'entry', 'envelope', 'episode',
    'equal', 'equip', 'era', 'erase', 'erode', 'erosion', 'error', 'erupt',
    'escape', 'essay', 'essence', 'estate', 'eternal', 'ethics', 'evidence', 'evil',
    'evoke', 'evolve', 'exact', 'example', 'excess', 'exchange', 'excite', 'exclude',
    'excuse', 'execute', 'exercise', 'exhaust', 'exhibit', 'exile', 'exist', 'exit',
    'exotic', 'expand', 'expect', 'expire', 'explain', 'expose', 'express', 'extend',
    'extra', 'eye', 'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint',
    'faith', 'fall', 'false', 'fame', 'family', 'famous', 'fan', 'fancy',
    'fantasy', 'farm', 'fashion', 'fat', 'fatal', 'father', 'fatigue', 'fault',
    'favorite', 'feature', 'february', 'federal', 'fee', 'feed', 'feel', 'female',
    'fence', 'festival', 'fetch', 'fever', 'few', 'fiber', 'fiction', 'field',
    'figure', 'file', 'film', 'filter', 'final', 'find', 'fine', 'finger',
    'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fit', 'fitness',
    'fix', 'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'flight',
    'flip', 'float', 'flock', 'floor', 'flower', 'fluid', 'flush', 'fly',
    'foam', 'focus', 'fog', 'foil', 'fold', 'follow', 'food', 'foot',
    'force', 'forest', 'forget', 'fork', 'fortune', 'forum', 'forward', 'fossil',
    'foster', 'found', 'fox', 'fragile', 'frame', 'frequent', 'fresh', 'friend',
    'fringe', 'frog', 'front', 'frost', 'frown', 'frozen', 'fruit', 'fuel',
    'fun', 'funny', 'furnace', 'fury', 'future', 'gadget', 'gain', 'galaxy',
    'gallery', 'game', 'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment',
    'gas', 'gasp', 'gate', 'gather', 'gauge', 'gaze', 'general', 'genius',
    'genre', 'gentle', 'genuine', 'gesture', 'ghost', 'giant', 'gift', 'giggle',
    'ginger', 'giraffe', 'girl', 'give', 'glad', 'glance', 'glare', 'glass',
    'glide', 'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow', 'glue',
    'goat', 'goddess', 'gold', 'good', 'goose', 'gorilla', 'gospel', 'gossip',
    'govern', 'gown', 'grab', 'grace', 'grain', 'grant', 'grape', 'grass',
    'gravity', 'great', 'green', 'grid', 'grief', 'grit', 'grocery', 'group',
    'grow', 'grunt', 'guard', 'guess', 'guide', 'guilt', 'guitar', 'gun',
    'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand', 'happy',
    'harbor', 'hard', 'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard',
    'head', 'health', 'heart', 'heavy', 'hedgehog', 'height', 'hello', 'helmet',
    'help', 'hen', 'hero', 'hidden', 'high', 'hill', 'hint', 'hip',
    'hire', 'history', 'hobby', 'hockey', 'hold', 'hole', 'holiday', 'hollow',
    'home', 'honey', 'hood', 'hope', 'horn', 'horror', 'horse', 'hospital',
    'host', 'hotel', 'hour', 'hover', 'hub', 'huge', 'human', 'humble',
    'humor', 'hundred', 'hungry', 'hunt', 'hurdle', 'hurry', 'hurt', 'husband',
    'hybrid', 'ice', 'icon', 'idea', 'identify', 'idle', 'ignore', 'ill',
    'illegal', 'illness', 'image', 'imitate', 'immense', 'immune', 'impact', 'impose',
    'improve', 'impulse', 'inch', 'include', 'income', 'increase', 'index', 'indicate',
    'indoor', 'industry', 'infant', 'inflict', 'inform', 'inhale', 'inherit', 'initial',
    'inject', 'injury', 'inmate', 'inner', 'innocent', 'input', 'inquiry', 'insane',
    'insect', 'inside', 'inspire', 'install', 'intact', 'interest', 'into', 'invest',
    'invite', 'involve', 'iron', 'island', 'isolate', 'issue', 'item', 'ivory',
    'jacket', 'jaguar', 'jar', 'jazz', 'jealous', 'jeans', 'jelly', 'jewel',
    'job', 'join', 'joke', 'journey', 'joy', 'judge', 'juice', 'jump',
    'jungle', 'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep', 'ketchup',
    'key', 'kick', 'kid', 'kidney', 'kind', 'kingdom', 'kiss', 'kit',
    'kitchen', 'kite', 'kitten', 'kiwi', 'knee', 'knife', 'knock', 'know',
    'lab', 'label', 'labor', 'ladder', 'lady', 'lake', 'lamp', 'language',
    'laptop', 'large', 'later', 'latin', 'laugh', 'laundry', 'lava', 'law',
    'lawn', 'lawsuit', 'layer', 'lazy', 'leader', 'leaf', 'learn', 'leave',
    'lecture', 'left', 'leg', 'legal', 'legend', 'leisure', 'lemon', 'lend',
    'length', 'lens', 'leopard', 'lesson', 'letter', 'level', 'liar', 'liberty',
    'library', 'license', 'life', 'lift', 'light', 'like', 'limb', 'limit',
    'link', 'lion', 'liquid', 'list', 'little', 'live', 'lizard', 'load',
    'loan', 'lobster', 'local', 'lock', 'logic', 'lonely', 'long', 'loop',
    'lottery', 'loud', 'lounge', 'love', 'loyal', 'lucky', 'luggage', 'lumber',
    'lunar', 'lunch', 'luxury', 'lyrics', 'machine', 'mad', 'magic', 'magnet',
    'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man', 'manage',
    'mandate', 'mango', 'mansion', 'manual', 'maple', 'marble', 'march', 'margin',
    'marine', 'market', 'marriage', 'mask', 'mass', 'master', 'match', 'material',
    'math', 'matrix', 'matter', 'maximum', 'maze', 'meadow', 'mean', 'measure',
    'meat', 'mechanic', 'medal', 'media', 'melody', 'melt', 'member', 'memory',
    'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh', 'message',
    'metal', 'method', 'middle', 'midnight', 'milk', 'million', 'mimic', 'mind',
    'minimum', 'minor', 'minute', 'miracle', 'mirror', 'misery', 'miss', 'mistake',
    'mix', 'mixed', 'mixture', 'mobile', 'model', 'modify', 'mom', 'moment',
    'monitor', 'monkey', 'monster', 'month', 'moon', 'moral', 'more', 'morning',
    'mosquito', 'mother', 'motion', 'motor', 'mountain', 'mouse', 'move', 'movie',
    'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom', 'music',
    'must', 'mutual', 'myself', 'mystery', 'myth', 'naive', 'name', 'napkin',
    'narrow', 'nasty', 'nation', 'nature', 'near', 'neck', 'need', 'negative',
    'neglect', 'neither', 'nephew', 'nerve', 'nest', 'net', 'network', 'neutral',
    'never', 'news', 'next', 'nice', 'night', 'noble', 'noise', 'nominee',
    'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing', 'notice',
    'novel', 'now', 'nuclear', 'number', 'nurse', 'nut', 'oak', 'obey',
    'object', 'oblige', 'obscure', 'observe', 'obtain', 'obvious', 'occur', 'ocean',
    'october', 'odor', 'off', 'offer', 'office', 'often', 'oil', 'okay',
    'old', 'olive', 'olympic', 'omit', 'once', 'one', 'onion', 'online',
    'only', 'open', 'opera', 'opinion', 'oppose', 'option', 'orange', 'orbit',
    'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan', 'ostrich',
    'other', 'outdoor', 'outer', 'output', 'outside', 'oval', 'oven', 'over',
    'own', 'owner', 'oxygen', 'oyster', 'ozone', 'pact', 'paddle', 'page',
    'pair', 'palace', 'palm', 'panda', 'panel', 'panic', 'panther', 'paper',
    'parade', 'parent', 'park', 'parrot', 'party', 'pass', 'patch', 'path',
    'patient', 'patrol', 'pattern', 'pause', 'pave', 'payment', 'peace', 'peanut',
    'pear', 'peasant', 'pelican', 'pen', 'penalty', 'pencil', 'people', 'pepper',
    'perfect', 'permit', 'person', 'pet', 'phone', 'photo', 'phrase', 'physical',
    'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon', 'pill', 'pilot',
    'pink', 'pioneer', 'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet',
    'plastic', 'plate', 'play', 'please', 'pledge', 'pluck', 'plug', 'plunge',
    'poem', 'poet', 'point', 'polar', 'pole', 'police', 'pond', 'pony',
    'pool', 'popular', 'portion', 'position', 'possible', 'post', 'potato', 'pottery',
    'poverty', 'powder', 'power', 'practice', 'praise', 'predict', 'prefer', 'prepare',
    'present', 'pretty', 'prevent', 'price', 'pride', 'primary', 'print', 'priority',
    'prison', 'private', 'prize', 'problem', 'process', 'produce', 'profit', 'program',
    'project', 'promote', 'proof', 'property', 'prosper', 'protect', 'proud', 'provide',
    'public', 'pudding', 'pull', 'pulp', 'pulse', 'pumpkin', 'punch', 'pupil',
    'puppy', 'purchase', 'purity', 'purpose', 'purse', 'push', 'put', 'puzzle',
    'pyramid', 'quality', 'quantum', 'quarter', 'question', 'quick', 'quit', 'quiz',
    'quote', 'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail',
    'rain', 'raise', 'rally', 'ramp', 'ranch', 'random', 'range', 'rapid',
    'rare', 'rate', 'rather', 'raven', 'raw', 'razor', 'ready', 'real',
    'reason', 'rebel', 'rebuild', 'recall', 'receive', 'recipe', 'record', 'recycle',
    'reduce', 'reflect', 'reform', 'refuse', 'region', 'regret', 'regular', 'reject',
    'relax', 'release', 'relief', 'rely', 'remain', 'remember', 'remind', 'remove',
    'render', 'renew', 'rent', 'reopen', 'repair', 'repeat', 'replace', 'report',
    'require', 'rescue', 'resemble', 'resist', 'resource', 'response', 'result', 'retire',
    'retreat', 'return', 'reunion', 'reveal', 'review', 'reward', 'rhythm', 'rib',
    'ribbon', 'rice', 'rich', 'ride', 'ridge', 'rifle', 'right', 'rigid',
    'ring', 'riot', 'ripple', 'risk', 'ritual', 'rival', 'river', 'road',
    'roast', 'robot', 'robust', 'rocket', 'romance', 'roof', 'rookie', 'room',
    'rose', 'rotate', 'rough', 'round', 'route', 'royal', 'rubber', 'rude',
    'rug', 'rule', 'run', 'runway', 'rural', 'sad', 'saddle', 'sadness',
    'safe', 'sail', 'salad', 'salmon', 'salon', 'salt', 'salute', 'same',
    'sample', 'sand', 'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say',
    'scale', 'scan', 'scare', 'scatter', 'scene', 'scheme', 'school', 'science',
    'scissors', 'scorpion', 'scout', 'scrap', 'screen', 'script', 'scrub', 'sea',
    'search', 'season', 'seat', 'second', 'secret', 'section', 'security', 'seed',
    'seek', 'segment', 'select', 'sell', 'seminar', 'senior', 'sense', 'sentence',
    'series', 'service', 'session', 'settle', 'setup', 'seven', 'shadow', 'shaft',
    'shallow', 'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine',
    'ship', 'shiver', 'shock', 'shoe', 'shoot', 'shop', 'short', 'shoulder',
    'shove', 'shrimp', 'shrug', 'shuffle', 'shy', 'sibling', 'sick', 'side',
    'siege', 'sight', 'sign', 'silent', 'silk', 'silly', 'silver', 'similar',
    'simple', 'since', 'sing', 'siren', 'sister', 'situate', 'six', 'size',
    'skate', 'sketch', 'ski', 'skill', 'skin', 'skirt', 'skull', 'slab',
    'slam', 'sleep', 'slender', 'slice', 'slide', 'slight', 'slim', 'slogan',
    'slot', 'slow', 'slush', 'small', 'smart', 'smile', 'smoke', 'smooth',
    'snack', 'snake', 'snap', 'sniff', 'snow', 'soap', 'soccer', 'social',
    'sock', 'soda', 'soft', 'solar', 'soldier', 'solid', 'solution', 'solve',
    'someone', 'song', 'soon', 'sorry', 'sort', 'soul', 'sound', 'soup',
    'source', 'south', 'space', 'spare', 'spatial', 'spawn', 'speak', 'special',
    'speed', 'spell', 'spend', 'sphere', 'spice', 'spider', 'spike', 'spin',
    'spirit', 'split', 'spoil', 'sponsor', 'spoon', 'sport', 'spot', 'spray',
    'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium',
    'staff', 'stage', 'stairs', 'stamp', 'stand', 'start', 'state', 'stay',
    'steak', 'steel', 'stem', 'step', 'stereo', 'stick', 'still', 'sting',
    'stock', 'stomach', 'stone', 'stool', 'story', 'stove', 'strategy', 'street',
    'strike', 'strong', 'struggle', 'student', 'stuff', 'stumble', 'style', 'subject',
    'submit', 'subway', 'success', 'such', 'sudden', 'suffer', 'sugar', 'suggest',
    'suit', 'summer', 'sun', 'sunny', 'sunset', 'super', 'supply', 'supreme',
    'sure', 'surface', 'surge', 'surprise', 'surround', 'survey', 'suspect', 'sustain',
    'swallow', 'swamp', 'swap', 'swarm', 'swear', 'sweet', 'swift', 'swim',
    'swing', 'switch', 'sword', 'symbol', 'symptom', 'syrup', 'system', 'table',
    'tackle', 'tag', 'tail', 'talent', 'talk', 'tank', 'tape', 'target',
    'task', 'taste', 'tattoo', 'taxi', 'teach', 'team', 'tell', 'ten',
    'tenant', 'tennis', 'tent', 'term', 'test', 'text', 'thank', 'that',
    'theme', 'then', 'theory', 'there', 'they', 'thing', 'this', 'thought',
    'three', 'thrive', 'throw', 'thumb', 'thunder', 'ticket', 'tide', 'tiger',
    'tilt', 'timber', 'time', 'tiny', 'tip', 'tired', 'tissue', 'title',
    'toast', 'tobacco', 'today', 'toddler', 'toe', 'together', 'toilet', 'token',
    'tomato', 'tomorrow', 'tone', 'tongue', 'tonight', 'tool', 'tooth', 'top',
    'topic', 'topple', 'torch', 'tornado', 'tortoise', 'toss', 'total', 'tourist',
    'toward', 'tower', 'town', 'toy', 'track', 'trade', 'traffic', 'tragic',
    'train', 'transfer', 'trap', 'trash', 'travel', 'tray', 'treat', 'tree',
    'trend', 'trial', 'tribe', 'trick', 'trigger', 'trim', 'trip', 'trophy',
    'trouble', 'truck', 'true', 'truly', 'trumpet', 'trust', 'truth', 'try',
    'tube', 'tuition', 'tumble', 'tuna', 'tunnel', 'turkey', 'turn', 'turtle',
    'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical',
    'ugly', 'umbrella', 'unable', 'unaware', 'uncle', 'uncover', 'under', 'undo',
    'unfair', 'unfold', 'unhappy', 'uniform', 'unique', 'unit', 'universe', 'unknown',
    'unlock', 'until', 'unusual', 'unveil', 'update', 'upgrade', 'uphold', 'upon',
    'upper', 'upset', 'urban', 'urge', 'usage', 'use', 'used', 'useful',
    'useless', 'usual', 'utility', 'vacant', 'vacuum', 'vague', 'valid', 'valley',
    'valve', 'van', 'vanish', 'vapor', 'various', 'vast', 'vault', 'vehicle',
    'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify', 'version', 'very',
    'vessel', 'veteran', 'viable', 'vibrant', 'vicious', 'victory', 'video', 'view',
    'village', 'vintage', 'violin', 'virtual', 'virus', 'visa', 'visit', 'visual',
    'vital', 'vivid', 'vocal', 'voice', 'void', 'volcano', 'volume', 'vote',
    'voyage', 'wage', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want',
    'warfare', 'warm', 'warrior', 'wash', 'wasp', 'waste', 'water', 'wave',
    'way', 'wealth', 'weapon', 'wear', 'weasel', 'weather', 'web', 'wedding',
    'weekend', 'weird', 'welcome', 'west', 'wet', 'whale', 'what', 'wheat',
    'wheel', 'when', 'where', 'whip', 'whisper', 'wide', 'width', 'wife',
    'wild', 'will', 'win', 'window', 'wine', 'wing', 'wink', 'winner',
    'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wolf', 'woman',
    'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth',
    'wrap', 'wreck', 'wrestle', 'wrist', 'write', 'wrong', 'yard', 'year',
    'yellow', 'you', 'young', 'youth', 'zebra', 'zero', 'zone', 'zoo',
)

WORDLIST_SHA256 = "2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda"

# Official BIP-39 test vectors: (entropy hex, expected mnemonic)
TEST_VECTORS = [
    ('00000000000000000000000000000000',
     'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'),
    ('7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f',
     'legal winner thank year wave sausage worth useful legal winner thank yellow'),
    ('80808080808080808080808080808080',
     'letter advice cage absurd amount doctor acoustic avoid letter advice cage above'),
    ('ffffffffffffffffffffffffffffffff',
     'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'),
    ('0000000000000000000000000000000000000000000000000000000000000000',
     'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'),
    ('7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f',
     'legal winner thank year wave sausage worth useful legal winner thank year wave sausage worth useful legal winner thank year wave sausage worth title'),
    ('8080808080808080808080808080808080808080808080808080808080808080',
     'letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic bless'),
    ('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
     'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote'),
    ('9e885d952ad362caeb4efe34a8e91bd2',
     'ozone drill grab fiber curtain grace pudding thank cruise elder eight picnic'),
    ('68a79eaca2324873eacc50cb9c6eca8cc68ea5d936f98787c60c7ebc74e6ce7c',
     'hamster diagram private dutch cause delay private meat slide toddler razor book happy fancy gospel tennis maple dilemma loan word shrug inflict delay length'),
    ('f30f8c1da665478f49b001d94c5fc452',
     'vessel ladder alter error federal sibling chat ability sun glass valve picture'),
    ('066dca1a2bb7e8a1db2832148ce9933eea0f3ac9548d793112d9a95c9407efad',
     'all hour make first leader extend hole alien behind guard gospel lava path output census museum junior mass reopen famous sing advance salt reform'),
]

# Dice vector: (roll string, sha256 hex, expected 24-word mnemonic)
DICE_VECTOR = ('123456123456123456123456123456123456123456123456123456123456123456123456123456123456123456123456123456', '8fd128918b2e29d6dcbfa5b9a118e5c16d60498c7ba107922a8eb6eb1d36c112', 'more matter caught bind tip twin indicate visa rifle angle defense lizard stock cave cradle injury always mule photo horse range opinion affair garlic')

DICE_MIN = {128: 50, 256: 99}   # ceil(bits / log2(6))


# ============================= core arithmetic =============================

def entropy_to_mnemonic(entropy: bytes):
    """BIP-39: entropy bytes -> (words, audit dict). Pure function."""
    if len(entropy) not in (16, 32):
        raise ValueError("entropy must be 16 or 32 bytes")
    ent_bits = "".join(format(b, "08b") for b in entropy)
    cs_len = len(ent_bits) // 32                       # 4 or 8
    digest = hashlib.sha256(entropy).hexdigest()
    hash_bits = "".join(format(int(digest[i:i+2], 16), "08b")
                        for i in range(0, 64, 2))
    cs_bits = hash_bits[:cs_len]
    all_bits = ent_bits + cs_bits
    indices = [int(all_bits[i:i+11], 2) for i in range(0, len(all_bits), 11)]
    words = [WORDLIST[i] for i in indices]
    return words, {
        "entropy_hex": entropy.hex(),
        "sha256": digest,
        "checksum_bits": cs_bits,
        "indices": indices,
        "ent_bits": ent_bits,
    }


def parse_coin(text: str):
    """H/h/1 -> 1, T/t/0 -> 0, everything else ignored."""
    out = []
    for c in text.upper():
        if c in "H1":
            out.append(1)
        elif c in "T0":
            out.append(0)
    return out


def parse_dice(text: str):
    """Keep only digits 1-6."""
    return [c for c in text if c in "123456"]


def von_neumann(bits):
    """Non-overlapping pairs: (1,0)->1, (0,1)->0, (0,0)/(1,1) discarded."""
    out = []
    for i in range(0, len(bits) - 1, 2):
        a, b = bits[i], bits[i + 1]
        if a == 1 and b == 0:
            out.append(1)
        elif a == 0 and b == 1:
            out.append(0)
    return out


def bits_to_bytes(bits):
    return bytes(int("".join(map(str, bits[i:i+8])), 2)
                 for i in range(0, len(bits), 8))


def coin_entropy(text: str, nbits: int, debias=False, text2=None):
    """Coin path. Returns (entropy bytes, description) or raises ValueError."""
    def usable(t):
        raw = parse_coin(t)
        return von_neumann(raw) if debias else raw
    bits = usable(text)
    if len(bits) < nbits:
        raise ValueError("need %d usable bits, have %d" % (nbits, len(bits)))
    bits = bits[:nbits]
    desc = "%d coin-flip bits%s" % (nbits, " (von Neumann debiased)" if debias else "")
    if text2 is not None:
        bits2 = usable(text2)
        if len(bits2) < nbits:
            raise ValueError("second series: need %d usable bits, have %d"
                             % (nbits, len(bits2)))
        bits = [a ^ b for a, b in zip(bits, bits2[:nbits])]
        desc += ", XOR-mixed with a second series"
    return bits_to_bytes(bits), desc


def dice_entropy(text: str, nbits: int):
    """Dice path (Coldcard convention). Returns (entropy bytes, description)."""
    rolls = "".join(parse_dice(text))
    if len(rolls) < DICE_MIN[nbits]:
        raise ValueError("need at least %d rolls, have %d"
                         % (DICE_MIN[nbits], len(rolls)))
    digest = hashlib.sha256(rolls.encode("ascii")).digest()
    desc = ("%d dice rolls, SHA-256 conditioned (Coldcard-compatible); "
            "verify: echo -n \"<rolls>\" | sha256sum" % len(rolls))
    return digest[: nbits // 8], desc


# ================================ self-test ================================

def self_test():
    """Run all embedded vectors. Returns list of failure labels (empty=pass)."""
    fails = []
    if len(WORDLIST) != 2048:
        fails.append("wordlist-length")
    wl_digest = hashlib.sha256(("\n".join(WORDLIST) + "\n").encode()).hexdigest()
    if wl_digest != WORDLIST_SHA256:
        fails.append("wordlist-hash")
    for hex_ent, expected in TEST_VECTORS:
        words, _ = entropy_to_mnemonic(bytes.fromhex(hex_ent))
        if " ".join(words) != expected:
            fails.append("vector-" + hex_ent[:8])
    rolls, digest_hex, expected = DICE_VECTOR
    if hashlib.sha256(rolls.encode()).hexdigest() != digest_hex:
        fails.append("dice-sha256")
    words, _ = entropy_to_mnemonic(bytes.fromhex(digest_hex))
    if " ".join(words) != expected:
        fails.append("dice-mnemonic")
    # debias + parser sanity
    if von_neumann([1, 0, 0, 1, 1, 1, 0, 0, 1, 0]) != [1, 0, 1]:
        fails.append("von-neumann")
    if parse_coin("H t 1 0 xHT\n") != [1, 0, 1, 0, 1, 0]:
        fails.append("parse-coin")
    if parse_dice("1 2 x 7 0 3\n456") != list("123456"):
        fails.append("parse-dice")
    return fails


# ============================== presentation ==============================

def format_result(words, audit, source_desc):
    lines = []
    lines.append("=" * 68)
    lines.append("SEED PHRASE (%d words) — write on paper, never store digitally"
                 % len(words))
    lines.append("=" * 68)
    for i, w in enumerate(words, 1):
        tag = "   <- checksum word (computed, not chosen)" if i == len(words) else ""
        lines.append("  %2d. %s%s" % (i, w, tag))
    lines.append("")
    lines.append("AUDIT TRAIL (recompute each step with independent tools)")
    lines.append("-" * 68)
    lines.append("source          : " + source_desc)
    lines.append("entropy (hex)   : " + audit["entropy_hex"])
    lines.append("sha256(entropy) : " + audit["sha256"])
    lines.append("checksum bits   : " + audit["checksum_bits"] +
                 "  (first %d bits of the hash)" % len(audit["checksum_bits"]))
    lines.append("word indices    : " + " ".join(str(i) for i in audit["indices"]))
    lines.append("")
    lines.append("VERIFY INDEPENDENTLY, OFFLINE (do not skip):")
    lines.append("  A. python3 -c \"from mnemonic import Mnemonic;"
                 " print(Mnemonic('english').to_mnemonic(bytes.fromhex("
                 "'%s')))\"" % audit["entropy_hex"])
    lines.append("  B. Same flips/rolls into the HTML edition of this tool ->"
                 " identical words required.")
    lines.append("  C. Dry-run restore on a hardware wallet; test a small amount"
                 " before real funds.")
    return "\n".join(lines)


# ================================== CLI ==================================

def run_cli():
    print(__doc__.split("USAGE:")[0])
    fails = self_test()
    if fails:
        print("SELF-TEST FAILED (%s) — DO NOT USE THIS COPY." % ", ".join(fails))
        sys.exit(1)
    print("[ self-test passed: %d official BIP-39 vectors + dice vector + "
          "word-list hash ]\n" % len(TEST_VECTORS))
    n = ""
    while n not in ("12", "24"):
        n = input("Seed length — 12 or 24 words? ").strip()
    nbits = 128 if n == "12" else 256
    m = ""
    while m not in ("c", "d"):
        m = input("Method — [c]oin flips or [d]ice rolls? ").strip().lower()
    try:
        if m == "c":
            print("\nEnter your flips (H/T or 1/0, spaces ignored), "
                  "%d needed. Finish with an empty line:" % nbits)
            text = read_multiline()
            db = input("Apply von Neumann debiasing? [y/N] ").strip().lower() == "y"
            xr = input("XOR with a second independent series? [y/N] ").strip().lower() == "y"
            text2 = None
            if xr:
                print("Enter the second series, empty line to finish:")
                text2 = read_multiline()
            entropy, desc = coin_entropy(text, nbits, debias=db, text2=text2)
        else:
            print("\nEnter your rolls (digits 1-6, spaces ignored), "
                  "at least %d. Finish with an empty line:" % DICE_MIN[nbits])
            entropy, desc = dice_entropy(read_multiline(), nbits)
    except ValueError as e:
        print("Error:", e)
        sys.exit(1)
    words, audit = entropy_to_mnemonic(entropy)
    print("\n" + format_result(words, audit, desc))


def read_multiline():
    buf = []
    while True:
        line = sys.stdin.readline()
        if not line or not line.strip():
            break
        buf.append(line)
    return "".join(buf)


# ================================== GUI ==================================

def run_gui():
    import tkinter as tk
    from tkinter import ttk, scrolledtext

    fails = self_test()

    root = tk.Tk()
    root.title("Physical Entropy Seed Tool — Scientific Bitcoin Institute")
    root.geometry("980x760")

    BG, PANEL, FG, MUT, ACC = "#0e1116", "#161b22", "#e6e9ef", "#9aa4b2", "#f7931a"
    root.configure(bg=BG)
    style = ttk.Style(root)
    try:
        style.theme_use("clam")
    except tk.TclError:
        pass
    style.configure(".", background=BG, foreground=FG)
    style.configure("TFrame", background=BG)
    style.configure("TLabel", background=BG, foreground=FG)
    style.configure("Muted.TLabel", background=BG, foreground=MUT)
    style.configure("Badge.TLabel", background=PANEL, foreground="#3fb950",
                    padding=6)
    style.configure("BadgeFail.TLabel", background=PANEL, foreground="#f85149",
                    padding=6)
    style.configure("TRadiobutton", background=BG, foreground=FG)
    style.configure("TCheckbutton", background=BG, foreground=FG)
    style.configure("Go.TButton", font=("TkDefaultFont", 11, "bold"))

    outer = ttk.Frame(root, padding=14)
    outer.pack(fill="both", expand=True)

    ttk.Label(outer, text="Physical Entropy Seed Tool",
              font=("TkDefaultFont", 16, "bold")).pack(anchor="w")
    ttk.Label(outer, style="Muted.TLabel", wraplength=920, text=(
        "This program has NO random number generator. You flip coins or roll "
        "dice; it only does the deterministic BIP-39 arithmetic, which you "
        "should verify with independent tools. Use OFFLINE for real funds. "
        "Write words on paper only.")).pack(anchor="w", pady=(2, 8))

    if fails:
        ttk.Label(outer, style="BadgeFail.TLabel",
                  text="✗ SELF-TEST FAILED (%s) — DO NOT USE THIS COPY"
                       % ", ".join(fails)).pack(anchor="w")
    else:
        ttk.Label(outer, style="Badge.TLabel",
                  text="✓ self-test passed: %d official BIP-39 vectors + dice "
                       "vector + word-list hash" % len(TEST_VECTORS)
                  ).pack(anchor="w")

    opts = ttk.Frame(outer)
    opts.pack(anchor="w", pady=8)
    nbits_var = tk.IntVar(value=128)
    method_var = tk.StringVar(value="coin")
    debias_var = tk.BooleanVar(value=False)
    xor_var = tk.BooleanVar(value=False)
    ttk.Label(opts, text="Length:").grid(row=0, column=0, padx=(0, 6))
    ttk.Radiobutton(opts, text="12 words (128-bit)", variable=nbits_var,
                    value=128).grid(row=0, column=1, padx=4)
    ttk.Radiobutton(opts, text="24 words (256-bit)", variable=nbits_var,
                    value=256).grid(row=0, column=2, padx=4)
    ttk.Label(opts, text="   Method:").grid(row=0, column=3, padx=(14, 6))
    ttk.Radiobutton(opts, text="Coin flips", variable=method_var,
                    value="coin").grid(row=0, column=4, padx=4)
    ttk.Radiobutton(opts, text="Dice rolls", variable=method_var,
                    value="dice").grid(row=0, column=5, padx=4)
    ttk.Checkbutton(opts, text="von Neumann debias (coin)",
                    variable=debias_var).grid(row=1, column=1, columnspan=2,
                                              sticky="w", pady=(4, 0))
    ttk.Checkbutton(opts, text="XOR second series (coin)",
                    variable=xor_var).grid(row=1, column=3, columnspan=2,
                                           sticky="w", pady=(4, 0))

    ttk.Label(outer, text="Entropy input — coin: H/T or 1/0 · dice: digits 1–6 "
                          "(spaces/newlines ignored)").pack(anchor="w")
    inp = tk.Text(outer, height=5, bg="#0a0d12", fg=FG, insertbackground=FG,
                  font=("Courier", 12))
    inp.pack(fill="x", pady=(2, 2))
    ttk.Label(outer, text="Second series (only if XOR enabled):",
              style="Muted.TLabel").pack(anchor="w")
    inp2 = tk.Text(outer, height=3, bg="#0a0d12", fg=FG, insertbackground=FG,
                   font=("Courier", 12))
    inp2.pack(fill="x", pady=(2, 2))

    status = ttk.Label(outer, style="Muted.TLabel", text="")
    status.pack(anchor="w")

    out = scrolledtext.ScrolledText(outer, height=18, bg="#0a0d12", fg=FG,
                                    font=("Courier", 11), state="disabled")
    out.pack(fill="both", expand=True, pady=(6, 6))

    def refresh(_evt=None):
        nbits = nbits_var.get()
        if method_var.get() == "coin":
            raw = parse_coin(inp.get("1.0", "end"))
            eff = von_neumann(raw) if debias_var.get() else raw
            heads = sum(raw)
            pct = (100.0 * heads / len(raw)) if raw else 0
            status.config(text=(
                "flips: %d   usable bits: %d / %d   heads: %.1f%%"
                % (len(raw), len(eff), nbits, pct)))
        else:
            rolls = parse_dice(inp.get("1.0", "end"))
            status.config(text=(
                "rolls: %d / %d minimum   (≈ %.0f bits collected)"
                % (len(rolls), DICE_MIN[nbits],
                   len(rolls) * math.log2(6))))

    def compute():
        if fails:
            return
        nbits = nbits_var.get()
        try:
            if method_var.get() == "coin":
                t2 = inp2.get("1.0", "end") if xor_var.get() else None
                entropy, desc = coin_entropy(inp.get("1.0", "end"), nbits,
                                             debias=debias_var.get(), text2=t2)
            else:
                entropy, desc = dice_entropy(inp.get("1.0", "end"), nbits)
        except ValueError as e:
            show("INPUT NOT READY: %s" % e)
            return
        words, audit = entropy_to_mnemonic(entropy)
        show(format_result(words, audit, desc))

    def show(text):
        out.config(state="normal")
        out.delete("1.0", "end")
        out.insert("1.0", text)
        out.config(state="disabled")

    def clear():
        inp.delete("1.0", "end")
        inp2.delete("1.0", "end")
        show("")
        refresh()

    btns = ttk.Frame(outer)
    btns.pack(anchor="w")
    ttk.Button(btns, text="Compute seed phrase", style="Go.TButton",
               command=compute).pack(side="left", padx=(0, 8))
    ttk.Button(btns, text="Clear everything", command=clear).pack(side="left")

    inp.bind("<KeyRelease>", refresh)
    inp2.bind("<KeyRelease>", refresh)
    for v in (nbits_var, method_var, debias_var):
        v.trace_add("write", lambda *_: refresh())
    refresh()
    root.mainloop()


# ================================== main ==================================

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--selftest" in args:
        f = self_test()
        print("SELF-TEST %s" % ("PASSED — %d vectors OK" % len(TEST_VECTORS)
                                if not f else "FAILED: " + ", ".join(f)))
        sys.exit(1 if f else 0)
    if "--entropy" in args:
        f = self_test()
        if f:
            print("SELF-TEST FAILED: %s — refusing to run." % ", ".join(f))
            sys.exit(1)
        hex_ent = args[args.index("--entropy") + 1]
        words, audit = entropy_to_mnemonic(bytes.fromhex(hex_ent))
        print(format_result(words, audit, "entropy supplied directly (hex)"))
        sys.exit(0)
    if "--cli" in args:
        run_cli()
        sys.exit(0)
    f = self_test()
    if f:
        print("SELF-TEST FAILED: %s — refusing to run." % ", ".join(f))
        sys.exit(1)
    try:
        run_gui()
    except Exception as e:                      # e.g. no Tkinter / no display
        print("Could not start the graphical interface (%s)." % e)
        print("Falling back to text mode. Run with --cli to skip this notice.\n")
        run_cli()
