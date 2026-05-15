# Dirac Spinors — Interactive Visualization

**[Live demo →](https://aap.github.io/spinor-hands)**

A hands-on visualization of a Dirac spinor as two quaternion-valued Weyl spinors, rendered in 3D with a Lorentz group control panel.

![screenshot placeholder](screenshot.png)

---

## What you're looking at

A **Dirac spinor** is the quantum state of a spin-½ particle (like an electron). It splits naturally into two **Weyl spinors** — left-handed and right-handed — each of which is a quaternion. The visualization shows them as two hands extending from the origin, connected by a belt.

The belt is the key: rotating one hand by 360° twists the belt, but rotating by **720°** restores it. This is the **Dirac belt trick** — the geometric reason spin-½ particles must be rotated twice to return to their original state. The fundamental group of SO(3) is ℤ/2, and SU(2) is its double cover; a spinor lives in the cover, not the base.

The two hands together carry the full Lorentz group action:
- **Rotations** multiply both Weyl spinors from the left by the same SU(2) element
- **Boosts** mix the two chiralities with cosh/sinh coefficients
- The **X variants** (ℑ mode) apply a conjugate-inverse to the right chirality — the other half of SL(2,ℂ)
- **Left/Right modes** isolate one chirality via chiral projectors built from left+right composition at half angles

The phase dials in the right panel show each of the four complex components (L↑, L↓, R↑, R↓) as a filled arc: radius = amplitude, swept angle = phase argument. Clockwise = negative phase, counterclockwise = positive.

---

## Controls

### 3D view (main canvas)
- **Drag** — orbit camera
- **Scroll** — zoom

### Lorentz strip (bottom)

Four mode buttons select which Lorentz action the knobs apply:

| Mode | Action |
|------|--------|
| **ℝ** | Standard spin/boost — SU(2) acting on both chiralities |
| **ℑ** | Conjugate spin/boost — the ℑ part of SL(2,ℂ) |
| **Left** | Chiral left — acts on ψ_L only |
| **Right** | Chiral right — acts on ψ_R only |

**Knobs (top row):** three spatial rotation axes (red/green/blue = x/y/z)  
**Knobs (middle row):** gauge/chiral knobs — overall phase φ, rotation axis tilt, ↕ tilt (yellow/cyan/magenta)  
In Left/Right mode these become local right-multiplied ρ₁, ρ₂, ρ₃ rotations on the active chirality.

**Sliders:** three spatial boost axes + one vertical boost + scale  
The scale slider acts directly on the spinor norm (log-space, s-curved).

### Component panel (right)

Four rows: L↑, L↓, R↑, R↓.  
- **Amplitude slider** (left) — sets the magnitude of that component  
- **Phase knob** (middle-left) — rotates the phase of that component  
- **φ knob** (top-right per chirality pair) — overall phase of that chirality  
- **ρ₂ knob** (bottom-right per chirality pair) — mixes up/down within a chirality  

### Eigenstate buttons
- **Dirac+/−** — project onto ±1 eigenstates of γ⁰ (particle/antiparticle in the Dirac sense)
- **Majorana+/−** — project onto ±1 eigenstates of charge conjugation C
- **Weyl L/R** — project onto pure left- or right-handed chirality eigenstates
- **Reset** — restore default (equal left+right)

The spinor readout at the bottom of the right panel shows each component in the form `a+bi`.

---

## Math

The spinor is `ψ = [ψ_L, ψ_R]` where each is a quaternion. The Pauli spinor components are extracted as:

```
up(q)   = (q.w, −q.z)   — a complex number
down(q) = (q.y, −q.x)
```

Lorentz group action in this representation:

```
spin3(θ, n̂, ψ)  = [R·ψ_L,  R·ψ_R]        R = exp(θ·n̂)  ∈ SU(2)
boost(θ, n̂, ψ)  = [cosh(θ)·ψ_L + sinh(θ)·n̂·ψ_L·(−ρ₃),
                    cosh(θ)·ψ_R + sinh(θ)·n̂·ψ_R·ρ₃]
```

where quaternion multiplication implements the SU(2) ≅ Sp(1) algebra and ρ₁,ρ₂,ρ₃ are the standard quaternion basis elements.

---

## Running locally

```
cd spacetime31_spinors
python3 -m http.server 8000
# open http://localhost:8000
```

The `hand.obj` model is loaded asynchronously; the canvas starts sleeping and wakes on interaction to conserve CPU.

---

## Background

This visualization is part of a larger project, *This Is How Hands Rotate*, exploring the geometry of spinors, Clifford algebras, and division algebras through interactive 3D sketches.

The belt trick was popularized by Dirac himself. The connection to quaternions and the double cover SU(2)→SO(3) is what makes spinors simultaneously mysterious and concrete: a spinor *is* a quaternion, and the quaternion units *are* 90° rotations in two complementary planes.
