<template>
  <canvas ref="canvas" class="star-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let w = 0
let h = 0
const maxParts = 100
let particles = []
let animationInterval = null

function initParticles() {
  particles = []
  for (let i = 0; i < maxParts; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      l: Math.random() * 1,
      xs: -4 + Math.random() * 4 + 2,
      ys: Math.random() * 10 + 10
    })
  }
}

function resizeCanvas() {
  w = window.innerWidth
  h = window.innerHeight
  if (canvas.value) {
    canvas.value.width = w
    canvas.value.height = h
  }
  initParticles()
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  particles.forEach(p => {
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys)
    ctx.stroke()
  })
  moveParticles()
}

function moveParticles() {
  particles.forEach(p => {
    p.x += p.xs
    p.y += p.ys
    if (p.x > w || p.y > h) {
      p.x = Math.random() * w
      p.y = -20
    }
  })
}

onMounted(() => {
  if (canvas.value) {
    resizeCanvas()
    ctx = canvas.value.getContext('2d')
    ctx.strokeStyle = 'rgba(174,194,224,0.5)'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    window.addEventListener('resize', resizeCanvas)
    animationInterval = setInterval(draw, 45)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationInterval) clearInterval(animationInterval)
})
</script>

<style scoped>
.star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
