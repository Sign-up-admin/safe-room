<template>
  <section class="hero" ref="heroRef">
    <canvas ref="particleCanvasRef" class="hero__canvas hero__canvas--particles" aria-hidden="true" />
    <div ref="canvasRef" class="hero__canvas hero__canvas--model" aria-hidden="true" />

    <div class="hero__content">
      <p class="hero__eyebrow">TECH · PERFORMANCE · AI COACHING</p>
      <h1 class="hero__title">
        觉醒更强的自己<span>.</span>
      </h1>
      <p class="hero__subtitle">专业设备 · 明星教练 · 智能训练</p>

      <div class="hero__cta-group">
        <button class="hero__cta hero__cta--primary" @click="$emit('book')">
          立即预约体验
        </button>
        <button class="hero__cta hero__cta--secondary" @click="$emit('viewCourses')">
          查看课程项目
        </button>
      </div>
    </div>

    <div class="hero__metrics">
      <div v-for="item in metrics" :key="item.label" class="hero__metric">
        <p class="hero__metric-value">{{ item.value }}</p>
        <p class="hero__metric-label">{{ item.label }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { useParticleSystem } from '@/composables/useParticleSystem'
import { animationConfig } from '@/utils/animationConfig'

interface Metric {
  value: string
  label: string
}

const metrics: Metric[] = [
  { value: '120+', label: '明星私教' },
  { value: '48', label: '专属训练方案' },
  { value: '4.9/5', label: '会员评分' },
]

const heroRef = ref<HTMLElement>()
const particleCanvasRef = ref<HTMLCanvasElement>()
const canvasRef = ref<HTMLElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let model: THREE.Group
let animationId: number
let destroyParticles: (() => void) | null = null

function init3DScene() {
  if (!canvasRef.value) return

  const width = canvasRef.value.clientWidth || window.innerWidth
  const height = canvasRef.value.clientHeight || window.innerHeight

  // 创建场景
  scene = new THREE.Scene()
  scene.background = null

  // 创建相机
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(8, 5, 8)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: false,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = false
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.background = 'transparent'
  renderer.domElement.style.display = 'block'
  canvasRef.value.appendChild(renderer.domElement)

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
  scene.add(ambientLight)

  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(10, 10, 5)
  scene.add(directionalLight)

  // 添加补充光源
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-10, 5, -5)
  scene.add(fillLight)

  // 创建模型
  createModel()

  // 开始渲染循环
  animate()

  // 添加窗口大小调整监听
  window.addEventListener('resize', handleResize)
}

function createModel() {
  // 如果已有模型，先移除并清理资源
  if (model) {
    scene.remove(model)
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose())
        } else {
          child.material.dispose()
        }
      }
      if (child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
  }

  // 创建模型组
  model = new THREE.Group()
  model.position.set(0, 0, 0)

  // 创建菱形十二面体几何体
  // 菱形十二面体有12个面，每个面是菱形
  // 顶点坐标基于立方体的顶点和面心
  const size = 2.5
  const vertices: number[] = []
  const indices: number[] = []
  
  // 定义菱形十二面体的顶点（基于立方体顶点和面心）
  const cubeVertices = [
    [size, size, size], [size, size, -size], [size, -size, size], [size, -size, -size],
    [-size, size, size], [-size, size, -size], [-size, -size, size], [-size, -size, -size]
  ]
  
  const faceCenters = [
    [2 * size, 0, 0], [-2 * size, 0, 0],
    [0, 2 * size, 0], [0, -2 * size, 0],
    [0, 0, 2 * size], [0, 0, -2 * size]
  ]
  
  // 创建12个菱形面（标准定义）
  // 每个菱形面由4个顶点组成：2个立方体顶点(±1,±1,±1) + 2个面心顶点(±2,0,0)等
  // 面的顺序：+X面2个、-X面2个、+Y面2个、-Y面2个、+Z面2个、-Z面2个
  // faceCenters索引映射：0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z
  // 每个面的顶点按逆时针顺序排列（从外部观察），确保法线方向正确
  const rhombusFaces = [
    // +X方向（右面）2个菱形
    [cubeVertices[0], faceCenters[2], cubeVertices[1], faceCenters[0]],  // (1,1,1)-(0,2,0)-(1,1,-1)-(2,0,0)
    [cubeVertices[2], faceCenters[0], cubeVertices[3], faceCenters[3]],  // (1,-1,1)-(2,0,0)-(1,-1,-1)-(0,-2,0)
    
    // -X方向（左面）2个菱形
    [cubeVertices[4], faceCenters[2], cubeVertices[5], faceCenters[1]],  // (-1,1,1)-(0,2,0)-(-1,1,-1)-(-2,0,0)
    [cubeVertices[6], faceCenters[1], cubeVertices[7], faceCenters[3]],  // (-1,-1,1)-(-2,0,0)-(-1,-1,-1)-(0,-2,0)
    
    // +Y方向（上面）2个菱形
    [cubeVertices[0], faceCenters[4], cubeVertices[4], faceCenters[2]],  // (1,1,1)-(0,0,2)-(-1,1,1)-(0,2,0)
    [cubeVertices[1], faceCenters[5], cubeVertices[5], faceCenters[2]],  // (1,1,-1)-(0,0,-2)-(-1,1,-1)-(0,2,0)
    
    // -Y方向（下面）2个菱形
    [cubeVertices[2], faceCenters[4], cubeVertices[6], faceCenters[3]],  // (1,-1,1)-(0,0,2)-(-1,-1,1)-(0,-2,0)
    [cubeVertices[3], faceCenters[5], cubeVertices[7], faceCenters[3]],  // (1,-1,-1)-(0,0,-2)-(-1,-1,-1)-(0,-2,0)
    
    // +Z方向（前面）2个菱形
    [cubeVertices[0], faceCenters[0], cubeVertices[2], faceCenters[4]],  // (1,1,1)-(2,0,0)-(1,-1,1)-(0,0,2)
    [cubeVertices[4], faceCenters[4], cubeVertices[6], faceCenters[1]],  // (-1,1,1)-(0,0,2)-(-1,-1,1)-(-2,0,0)
    
    // -Z方向（后面）2个菱形
    [cubeVertices[1], faceCenters[0], cubeVertices[3], faceCenters[5]],  // (1,1,-1)-(2,0,0)-(1,-1,-1)-(0,0,-2)
    [cubeVertices[5], faceCenters[5], cubeVertices[7], faceCenters[1]]   // (-1,1,-1)-(0,0,-2)-(-1,-1,-1)-(-2,0,0)
  ]
  
  // 构建顶点和索引
  const vertexMap = new Map<string, number>()
  let vertexIndex = 0
  
  function getVertexIndex(vertex: number[]): number {
    const key = vertex.join(',')
    if (!vertexMap.has(key)) {
      vertices.push(...vertex)
      vertexMap.set(key, vertexIndex++)
    }
    return vertexMap.get(key)!
  }
  
  rhombusFaces.forEach((face) => {
    const v0 = getVertexIndex(face[0])
    const v1 = getVertexIndex(face[1])
    const v2 = getVertexIndex(face[2])
    const v3 = getVertexIndex(face[3])
    
    // 创建两个三角形组成菱形
    indices.push(v0, v1, v2, v0, v2, v3)
  })
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  // 创建材质（金色，金属感）
  const material = new THREE.MeshStandardMaterial({
    color: 0xfdd835, // 金色
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.DoubleSide, // 双面渲染，确保所有面都可见
    transparent: false,
    opacity: 1.0,
  })

  // 创建菱形十二面体网格
  const rhombicDodecahedron = new THREE.Mesh(geometry, material)
  rhombicDodecahedron.castShadow = false
  rhombicDodecahedron.receiveShadow = false

  // 添加边缘高光效果
  const edges = new THREE.EdgesGeometry(geometry)
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xfdd835,
    linewidth: 1,
    transparent: true,
    opacity: 0.8,
  })
  const edgeLines = new THREE.LineSegments(edges, edgeMaterial)

  model.add(rhombicDodecahedron)
  model.add(edgeLines)
  scene.add(model)

  // 确保模型在原点
  model.position.set(0, 0, 0)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  // 自动旋转
  if (model) {
    model.rotation.y += 0.005
    model.rotation.x += 0.002
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function handleResize() {
  if (!canvasRef.value || !camera || !renderer) return

  const width = canvasRef.value.clientWidth
  const height = canvasRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  // 初始化粒子系统背景
  if (particleCanvasRef.value) {
    const { mount, destroy } = useParticleSystem({
      canvas: particleCanvasRef.value,
      colorPalette: animationConfig.colors.energy,
      density: 0.55,
      parallax: true,
    })
    destroyParticles = destroy
    mount()
  }

  // 使用 setTimeout 确保 DOM 已完全渲染
  setTimeout(() => {
    init3DScene()
  }, 100)
})

onUnmounted(() => {
  // 清理粒子系统
  destroyParticles?.()

  // 停止动画循环
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // 移除事件监听器
  window.removeEventListener('resize', handleResize)

  // 清理模型资源
  if (model && scene) {
    scene.remove(model)
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose())
        } else {
          child.material.dispose()
        }
      }
      if (child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
  }

  // 清理渲染器
  if (renderer) {
    renderer.dispose()
    if (canvasRef.value && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
})
</script>

<style scoped lang="scss">
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 6vw;
  overflow: hidden;
  background: radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.1), transparent),
    #020202;
  color: #fafafa;

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    &--particles {
      z-index: 0;
    }

    &--model {
      z-index: 1;
    }
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 640px;
  }

  &__eyebrow {
    color: #fdd835;
    letter-spacing: 0.4em;
    font-size: 0.85rem;
    margin-bottom: 16px;
  }

  &__title {
    font-size: clamp(3.8rem, 6vw, 5.4rem);
    margin: 0;
    line-height: 1.05;
    font-weight: 700;
    color: #ffffff;

    span {
      color: #fdd835;
      text-shadow: 0 0 32px rgba(253, 216, 53, 0.6);
    }
  }

  &__subtitle {
    margin-top: 24px;
    font-size: 1.1rem;
    color: #b9bdc8;
  }

  &__cta-group {
    margin-top: 32px;
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }

  &__cta {
    min-width: 200px;
    height: 54px;
    border-radius: 999px;
    border: none;
    font-size: 1rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &--primary {
      background: linear-gradient(120deg, #fdd835, #f6c300);
      color: #0a0a0a;
      box-shadow: 0 8px 24px rgba(253, 216, 53, 0.45);

      &:hover {
        transform: translateY(-3px);
      }
    }

    &--secondary {
      background: transparent;
      color: #fdd835;
      border: 1px solid rgba(253, 216, 53, 0.6);

      &:hover {
        border-color: #fdd835;
        transform: translateY(-3px);
      }
    }
  }

  &__metrics {
    position: absolute;
    right: 6vw;
    bottom: 64px;
    display: flex;
    gap: 40px;
    z-index: 1;
  }

  &__metric-value {
    font-size: 2rem;
    color: #fdd835;
    margin-bottom: 4px;
  }

  &__metric-label {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 0.8rem;
    color: #ffffffcc;
  }
}

@media (max-width: 960px) {
  .hero {
    padding-top: 120px;
    flex-direction: column;
    text-align: center;

    &__metrics {
      position: relative;
      right: auto;
      bottom: auto;
      margin-top: 56px;
      justify-content: center;
    }
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 120px 24px 80px;

    &__title {
      font-size: 2.8rem;
    }

    &__cta-group {
      flex-direction: column;
      align-items: stretch;

      .hero__cta {
        width: 100%;
      }
    }

    &__metrics {
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>

