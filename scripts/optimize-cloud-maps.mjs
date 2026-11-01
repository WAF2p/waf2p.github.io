#!/usr/bin/env node
/*
 * Lightweight SVG optimiser for the provider region maps.
 *
 *   node scripts/optimize-cloud-maps.mjs
 *
 * Rounds path coordinates to one decimal and collapses whitespace between
 * tags. The maps are approximate at 800×400, so one decimal is sufficient.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const DIR = path.join(ROOT, 'images/cloud-regions')

function roundPathData(svg) {
  return svg.replace(/\bd="([^"]*)"/g, (match, data) => {
    const rounded = data.replace(/-?\d+\.\d+/g, (number) => {
      const value = Number(number)
      return Number.isFinite(value) ? value.toFixed(1) : number
    })
    return `d="${rounded}"`
  })
}

let beforeTotal = 0
let afterTotal = 0
let files = 0

for (const entry of readdirSync(DIR)) {
  if (!entry.endsWith('.svg')) continue
  const file = path.join(DIR, entry)
  const original = readFileSync(file, 'utf8')
  const optimised = roundPathData(original).replace(/>\s+</g, '><')
  const before = statSync(file).size
  const after = Buffer.byteLength(optimised)
  beforeTotal += before
  afterTotal += after
  files += 1
  if (optimised !== original) {
    writeFileSync(file, optimised)
    console.log(`${entry}: ${before} -> ${after} bytes`)
  }
}

const reduction = beforeTotal > 0 ? ((1 - afterTotal / beforeTotal) * 100).toFixed(1) : '0.0'
console.log(`Optimised ${files} maps: ${beforeTotal} -> ${afterTotal} bytes (${reduction}% smaller).`)
