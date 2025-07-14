<template>
  <canvas ref="canvas" class="star3d-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let width = 0
let height = 0
const starCount = 1000
const starColor = '#FBFFAF'
const backgroundColor = '#00113F'
const depth = 100
const speed = 0.05
let stars = []
let animationFrame = null

function initCanvas() {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
  ctx = canvas.value.getContext('2d')
  initStars()
}

function initStars() {
  stars = []
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      z: Math.random() * depth
    })
  }
}

function draw() {
  if (!ctx) return
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
  stars.forEach(star => {
    star.z -= speed
    if (star.z <= 0) {
      star.z = depth
      star.x = Math.random() * width - width / 2
      star.y = Math.random() * height - height / 2
    }
    const k = depth / star.z
    const px = star.x * k + width / 2
    const py = star.y * k + height / 2
    const size = (1 - star.z / depth) * 3
    ctx.fillStyle = starColor
    ctx.fillRect(px, py, size, size)
  })
  animationFrame = requestAnimationFrame(draw)
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
  animationFrame = requestAnimationFrame(draw)
})

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas)
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.star3d-canvas {
  z-index: -1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
