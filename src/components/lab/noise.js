import { randNormal } from './rng.js'

// Noise and its spectrum: a radix-2 FFT, Welch's averaged power spectral
// density, generators of white, pink and brown noise, and a log–log slope fit.

// ---------------------------------------------------------------- FFT

// In-place radix-2 Cooley–Tukey FFT of the complex signal (re, im), whose
// length must be a power of two. `inverse` computes the unnormalised inverse.
export function fft(re, im, inverse = false) {
  const n = re.length
  if (n & (n - 1)) throw new Error('fft: length must be a power of two')
  // Bit-reversal permutation.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      let t = re[i]
      re[i] = re[j]
      re[j] = t
      t = im[i]
      im[i] = im[j]
      im[j] = t
    }
  }
  const sign = inverse ? 1 : -1
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (sign * 2 * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0
      for (let k = 0; k < half; k++) {
        const a = i + k
        const b = a + half
        const xr = re[b] * cr - im[b] * ci
        const xi = re[b] * ci + im[b] * cr
        re[b] = re[a] - xr
        im[b] = im[a] - xi
        re[a] += xr
        im[a] += xi
        const t = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = t
      }
    }
  }
}

// ---------------------------------------------------------------- Spectrum

// Welch's estimate of the one-sided power spectral density of a real signal:
// the signal is cut into segments of `seg` samples (a power of two) that
// overlap by half, each segment has its mean removed and is tapered with a
// Hann window, and the squared magnitudes of their FFTs are averaged.
// Frequencies are in cycles per sample, from 1/seg up to 1/2.
export function welchPSD(x, seg = 1024) {
  const step = seg >> 1
  const win = new Float64Array(seg)
  let wPow = 0
  for (let i = 0; i < seg; i++) {
    win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / seg)
    wPow += win[i] * win[i]
  }
  const half = seg >> 1
  const acc = new Float64Array(half + 1)
  const re = new Float64Array(seg)
  const im = new Float64Array(seg)
  let count = 0
  for (let start = 0; start + seg <= x.length; start += step) {
    let mean = 0
    for (let i = 0; i < seg; i++) mean += x[start + i]
    mean /= seg
    for (let i = 0; i < seg; i++) {
      re[i] = (x[start + i] - mean) * win[i]
      im[i] = 0
    }
    fft(re, im)
    for (let k = 0; k <= half; k++) acc[k] += re[k] * re[k] + im[k] * im[k]
    count++
  }
  const f = []
  const p = []
  for (let k = 1; k <= half; k++) {
    f.push(k / seg)
    // Doubled for the negative frequencies, except at the Nyquist frequency.
    p.push(((k === half ? 1 : 2) * acc[k]) / (count * wPow))
  }
  return { f, p, segments: count }
}

// Averages a spectrum into bins of equal width in log f (`perDecade` per
// factor of ten), so that every decade weighs the same in a fit and on a plot.
export function logBinSpectrum(f, p, perDecade = 10) {
  const out = []
  let bin = null
  let sf = 0
  let sp = 0
  let n = 0
  for (let k = 0; k < f.length; k++) {
    const b = Math.floor(Math.log10(f[k]) * perDecade)
    if (b !== bin && n) {
      out.push({ f: Math.exp(sf / n), p: sp / n })
      sf = 0
      sp = 0
      n = 0
    }
    bin = b
    sf += Math.log(f[k])
    sp += p[k]
    n++
  }
  if (n) out.push({ f: Math.exp(sf / n), p: sp / n })
  return out
}

// Least-squares slope of log y against log x over the points with lo ≤ x ≤ hi.
export function logLogSlope(points, lo = 0, hi = Infinity, xKey = 'f', yKey = 'p') {
  let n = 0
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const d of points) {
    const x0 = d[xKey]
    const y0 = d[yKey]
    if (x0 < lo || x0 > hi || !(x0 > 0) || !(y0 > 0)) continue
    const x = Math.log(x0)
    const y = Math.log(y0)
    n++
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  if (n < 2) return { slope: NaN, intercept: NaN, points: n }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { slope, intercept: (sy - slope * sx) / n, points: n }
}

// ---------------------------------------------------------------- Generators

// Gaussian white noise: the same power at every frequency (β = 0).
export function whiteNoise(n, random) {
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) out[i] = randNormal(random)
  return out
}

// Brown noise, the path of a random walk: power ∝ 1/f² (β = −2). With
// leak < 1 the walk is pulled gently back towards zero, which flattens the
// spectrum below a corner frequency of about (1 − leak)/2π cycles per sample
// and keeps a long sound from drifting out of range.
export function brownNoise(n, random, leak = 1) {
  const out = new Float64Array(n)
  let x = 0
  for (let i = 0; i < n; i++) {
    x = leak * x + randNormal(random)
    out[i] = x
  }
  return out
}

// Pink noise, power ∝ 1/f (β = −1), by spectral shaping: the FFT of white
// noise has each amplitude scaled by f^(−1/2) and is transformed back. The
// length is rounded up to a power of two, and the result trimmed to n and
// scaled to unit variance.
export function pinkNoise(n, random) {
  let m = 1
  while (m < n) m <<= 1
  const re = whiteNoise(m, random)
  const im = new Float64Array(m)
  fft(re, im)
  re[0] = 0
  im[0] = 0
  for (let k = 1; k < m; k++) {
    const f = Math.min(k, m - k) / m
    const g = 1 / Math.sqrt(f)
    re[k] *= g
    im[k] *= g
  }
  fft(re, im, true)
  return standardise(re.slice(0, n))
}

// Scales a signal to zero mean and unit standard deviation.
export function standardise(x) {
  let mean = 0
  for (let i = 0; i < x.length; i++) mean += x[i]
  mean /= x.length
  let v = 0
  for (let i = 0; i < x.length; i++) v += (x[i] - mean) ** 2
  const sd = Math.sqrt(v / x.length) || 1
  const out = new Float64Array(x.length)
  for (let i = 0; i < x.length; i++) out[i] = (x[i] - mean) / sd
  return out
}
