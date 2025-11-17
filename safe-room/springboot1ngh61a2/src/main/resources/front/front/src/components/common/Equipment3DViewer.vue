<template>
  <div class="equipment-3d-viewer" ref="containerRef">
    <div class="viewer-background"></div>
    <div class="viewer-controls">
      <TechButton size="sm" variant="outline" @click="resetCamera">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M8 16H3v5"/>
        </svg>
        重置视角
      </TechButton>
      <TechButton size="sm" variant="outline" @click="toggleAutoRotate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3"/>
        </svg>
        {{ isAutoRotating ? '停止旋转' : '自动旋转' }}
      </TechButton>
    </div>
    <div class="viewer-canvas" ref="canvasRef"></div>
    <div class="viewer-info">
      <div class="equipment-specs">
        <h4>{{ equipment.qicaimingcheng }}</h4>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">品牌</span>
            <span class="spec-value">{{ equipment.pinpai || '智能器材' }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">重量</span>
            <span class="spec-value">{{ equipment.zhongliang || '待补充' }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">尺寸</span>
            <span class="spec-value">{{ equipment.chicun || '待补充' }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">难度</span>
            <span class="spec-value">{{ deriveDifficulty(equipment) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { TechButton } from '@/components/common'
import type { Jianshenqicai } from '@/types/modules'

interface Props {
  equipment: Jianshenqicai
  modelUrl?: string
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement>()
const canvasRef = ref<HTMLElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let model: THREE.Group
let animationId: number
let isAutoRotating = ref(false)
let controlsCleanup: (() => void) | null = null

onMounted(() => {
  // 使用 nextTick 确保 DOM 已完全渲染
  setTimeout(() => {
    init3DViewer()
  }, 100)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (controlsCleanup) {
    controlsCleanup()
  }
  if (renderer) {
    renderer.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

watch(() => props.equipment, () => {
  updateModel()
}, { deep: true })

function init3DViewer() {
  if (!containerRef.value || !canvasRef.value) return

  const width = canvasRef.value.clientWidth || 800
  const height = canvasRef.value.clientHeight || 400

  // 创建场景
  scene = new THREE.Scene()
  // 设置背景为透明，使用CSS渐变背景
  scene.background = null

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    50, // 减小视野角度，使模型看起来更大
    width / height,
    0.1,
    1000
  )

  // 创建渲染器（启用alpha通道以支持透明背景）
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    preserveDrawingBuffer: false
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  // 设置渲染器背景为完全透明
  renderer.setClearColor(0x000000, 0)
  // 确保canvas元素样式正确
  renderer.domElement.style.background = 'transparent'
  renderer.domElement.style.display = 'block'
  canvasRef.value.appendChild(renderer.domElement)

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
  scene.add(ambientLight)

  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 添加补充光源
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-10, 5, -5)
  scene.add(fillLight)

  // 创建基础模型
  createModel()

  // 调整相机位置以适应模型
  fitCameraToModel()

  // 添加控制器
  addControls()

  // 开始渲染循环
  animate()

  // 添加窗口大小调整监听
  window.addEventListener('resize', handleResize)
}

function createModel() {
  // 如果已有模型，先移除并清理资源
  if (model) {
    scene.remove(model)
    // 清理旧模型的资源
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

  // 创建正方体几何体
  const geometry = new THREE.BoxGeometry(3, 3, 3)
  
  // 创建材质（金色，金属感）
  const material = new THREE.MeshStandardMaterial({
    color: 0xfdd835, // 金色
    metalness: 0.8,
    roughness: 0.2
  })
  
  // 创建正方体网格
  const cube = new THREE.Mesh(geometry, material)
  cube.castShadow = true
  cube.receiveShadow = true
  
  // 添加边缘高光效果
  const edges = new THREE.EdgesGeometry(geometry)
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xfdd835,
    linewidth: 1,
    transparent: true,
    opacity: 0.8
  })
  const edgeLines = new THREE.LineSegments(edges, edgeMaterial)
  
  model.add(cube)
  model.add(edgeLines)
  scene.add(model)
  
  // 确保模型在原点
  model.position.set(0, 0, 0)
}

function addControls() {
  if (!canvasRef.value || !model) return

  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }

  const handleMouseDown = (event: MouseEvent) => {
    isDragging = true
    previousMousePosition = { x: event.clientX, y: event.clientY }
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'grabbing'
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging || !model) return

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    }

    // 使用球坐标旋转，更自然的交互
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.position)
    spherical.theta -= deltaMove.x * 0.01
    spherical.phi += deltaMove.y * 0.01
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))

    camera.position.setFromSpherical(spherical)
    camera.lookAt(0, 0, 0)

    previousMousePosition = { x: event.clientX, y: event.clientY }
  }

  const handleMouseUp = () => {
    isDragging = false
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'grab'
    }
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (!camera) return

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    const distance = camera.position.length()
    const newDistance = distance + event.deltaY * 0.01
    const clampedDistance = Math.max(3, Math.min(15, newDistance))
    
    camera.position.normalize().multiplyScalar(clampedDistance)
    camera.lookAt(0, 0, 0)
  }

  canvasRef.value.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  canvasRef.value.addEventListener('wheel', handleWheel)

  // 返回清理函数
  controlsCleanup = () => {
    if (canvasRef.value) {
      canvasRef.value.removeEventListener('mousedown', handleMouseDown)
      canvasRef.value.removeEventListener('wheel', handleWheel)
    }
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)

  if (isAutoRotating.value) {
    model.rotation.y += 0.01
  }

  renderer.render(scene, camera)
}

function fitCameraToModel() {
  if (!model || !camera) return

  // 等待一帧确保模型已添加到场景
  setTimeout(() => {
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // 计算合适的相机距离
    const maxDim = Math.max(size.x, size.y, size.z)
    
    console.log('相机适配信息:', {
      center,
      size,
      maxDim,
      modelPosition: model.position
    })
    
    // 如果模型为空或尺寸为0，使用默认距离
    let distance = 8
    if (maxDim > 0) {
      distance = maxDim * 2.5
      // 确保最小距离
      distance = Math.max(distance, 5)
    }

    // 设置相机位置（使用球坐标）
    camera.position.set(distance, distance * 0.6, distance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    // 如果模型有内容，确保模型在原点
    if (maxDim > 0 && center.length() > 0.1) {
      const offset = center.clone().negate()
      model.position.copy(offset)
      console.log('调整模型位置到原点，偏移:', offset)
    }
  }, 100)
}

function resetCamera() {
  if (!camera || !model) return
  fitCameraToModel()
  model.rotation.set(0, 0, 0)
  model.quaternion.set(0, 0, 0, 1)
}

function toggleAutoRotate() {
  isAutoRotating.value = !isAutoRotating.value
}

function updateModel() {
  if (!scene) return
  createModel()
  fitCameraToModel()
}

function deriveDifficulty(equipment: Jianshenqicai) {
  if (!equipment.shiyongfangfa) return '进阶'
  if (equipment.shiyongfangfa.includes('初学') || equipment.shiyongfangfa.includes('友好')) return '初学'
  if (equipment.shiyongfangfa.includes('专业') || equipment.shiyongfangfa.includes('竞赛')) return '专业'
  return '进阶'
}

// 响应式调整
function handleResize() {
  if (!containerRef.value || !canvasRef.value || !camera || !renderer) return

  const width = canvasRef.value.clientWidth || 800
  const height = canvasRef.value.clientHeight || 400

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
</script>

<style scoped lang="scss">
.equipment-3d-viewer {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(253, 216, 53, 0.22);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45);
}

.viewer-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  // 使用与TechCard layered变体相同的渐变背景
  background: linear-gradient(160deg, rgba(253, 216, 53, 0.08), rgba(10, 10, 10, 0.92));
  border-radius: inherit;
  pointer-events: none;
}

.viewer-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  position: relative;
  z-index: 1;

  // 确保canvas透明以显示背景层
  :deep(canvas) {
    background: transparent !important;
    display: block;
  }

  &:active {
    cursor: grabbing;
  }
}

.viewer-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background: rgba(2, 2, 2, 0.8);
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.equipment-specs h4 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 1.1rem;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  .spec-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }

  .spec-value {
    color: #fff;
    font-weight: 500;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .equipment-3d-viewer {
    height: 300px;
  }

  .viewer-controls {
    top: 8px;
    right: 8px;
  }

  .specs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
