<template>
  <section ref="networkRef" class="coach-network">
    <canvas ref="particleCanvasRef" class="coach-network__canvas coach-network__canvas--particles" aria-hidden="true" />
    <div ref="canvasContainerRef" class="coach-network__canvas coach-network__canvas--model"></div>

    <aside v-if="activeNode" class="coach-network__panel">
      <p class="coach-network__panel-eyebrow">TOP COACH</p>
      <h3 class="coach-network__panel-name">{{ activeNode.name }}</h3>
      <p class="coach-network__panel-role">{{ activeNode.role }}</p>
      <ul class="coach-network__panel-stats">
        <li>
          <p class="coach-network__panel-value">{{ activeNode.clients }}</p>
          <p class="coach-network__panel-label">年度私教</p>
        </li>
        <li>
          <p class="coach-network__panel-value">{{ activeNode.awards }}</p>
          <p class="coach-network__panel-label">国际认证</p>
        </li>
        <li>
          <p class="coach-network__panel-value">{{ activeNode.rating }}</p>
          <p class="coach-network__panel-label">学员评分</p>
        </li>
      </ul>
      <button class="coach-network__panel-cta" @click.stop="$emit('navigate', activeNode)">了解详情</button>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { useParticleSystem } from '@/composables/useParticleSystem'
import { animationConfig } from '@/utils/animationConfig'

interface CoachMeta {
  id: string
  name: string
  role?: string
  clients?: string
  awards?: string
  rating?: string
  featured?: boolean
  avatar?: string
}

interface Props {
  nodes?: CoachMeta[]
  links?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [
    {
      id: 'c1',
      name: 'Aiden Zhang',
      role: '力量与体能训练总监',
      clients: '780+',
      awards: '12',
      rating: '4.98',
      featured: true,
    },
    {
      id: 'c2',
      name: 'Mia Li',
      role: '体态塑形 · 国际认证导师',
      clients: '620+',
      awards: '9',
      rating: '4.95',
    },
    {
      id: 'c3',
      name: 'Leo Chen',
      role: '功能康复训练专家',
      clients: '540+',
      awards: '7',
      rating: '4.92',
    },
    {
      id: 'c4',
      name: 'Nina Wu',
      role: '高阶燃脂教练',
      clients: '480+',
      awards: '6',
      rating: '4.90',
    },
    {
      id: 'c5',
      name: 'Eric Wang',
      role: '拳击 & HIIT 训练导师',
      clients: '430+',
      awards: '5',
      rating: '4.88',
    },
    {
      id: 'c6',
      name: 'Sophia Liu',
      role: '瑜伽与普拉提导师',
      clients: '520+',
      awards: '8',
      rating: '4.93',
    },
  ],
  links: () => [],
})

const emit = defineEmits<{
  navigate: [node: CoachMeta]
}>()
const networkRef = ref<HTMLElement>()
const particleCanvasRef = ref<HTMLCanvasElement>()
const canvasContainerRef = ref<HTMLElement>()
const activeNode = ref<CoachMeta | null>(props.nodes[0] ?? null)
let destroyParticles: (() => void) | null = null

// Three.js 相关
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let cube: THREE.Mesh
let animationId: number | null = null

// 自动旋转控制
const autoRotateSpeed = 0.005
let isAutoRotating = true
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
let rotationX = 0
let rotationY = 0
let cleanupMouseControls: (() => void) | null = null

// 面索引映射：正方体的6个面对应6个教练
// 面的顺序：右(+X), 左(-X), 上(+Y), 下(-Y), 前(+Z), 后(-Z)
const faceIndices = [0, 1, 2, 3, 4, 5]

// 创建教练纹理
function createCoachTexture(coach: CoachMeta, size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  if (!ctx) {
    throw new Error('无法创建Canvas 2D上下文')
  }

  // 清除画布
  ctx.clearRect(0, 0, size, size)

  // 背景渐变（完全不透明，深色背景）
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(0.5, '#141414')
  gradient.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // 金色边框
  ctx.strokeStyle = '#fdd835'
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, size - 6, size - 6)

  // 内边框（细线）
  ctx.strokeStyle = 'rgba(253, 216, 53, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(6, 6, size - 12, size - 12)

  // 教练名称（金色，加粗）
  ctx.fillStyle = '#fdd835'
  ctx.font = 'bold 52px "Microsoft YaHei", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const nameY = size * 0.28
  ctx.fillText(coach.name, size / 2, nameY)

  // 角色（白色，较小）
  ctx.fillStyle = '#ffffff'
  ctx.font = '30px "Microsoft YaHei", Arial, sans-serif'
  const roleY = size * 0.42
  const roleText = coach.role || '专业教练'
  // 如果文字太长，截断
  const maxWidth = size * 0.9
  let displayRole = roleText
  const metrics = ctx.measureText(displayRole)
  if (metrics.width > maxWidth) {
    while (ctx.measureText(displayRole + '...').width > maxWidth && displayRole.length > 0) {
      displayRole = displayRole.slice(0, -1)
    }
    displayRole += '...'
  }
  ctx.fillText(displayRole, size / 2, roleY)

  // 分隔线
  ctx.strokeStyle = 'rgba(253, 216, 53, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(size * 0.15, size * 0.55)
  ctx.lineTo(size * 0.85, size * 0.55)
  ctx.stroke()

  // 统计信息 - 学员数（金色）
  ctx.fillStyle = '#fdd835'
  ctx.font = 'bold 40px "Microsoft YaHei", Arial, sans-serif'
  const statsY = size * 0.65
  ctx.fillText(`${coach.clients || '0'} 学员`, size / 2, statsY)

  // 评分（白色）
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px "Microsoft YaHei", Arial, sans-serif'
  const ratingY = size * 0.78
  ctx.fillText(`评分: ${coach.rating || '0.0'}`, size / 2, ratingY)

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.format = THREE.RGBAFormat
  texture.flipY = false
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  // 优化纹理清晰度
  texture.anisotropy = 16

  return texture
}

// 创建默认材质（用于没有教练的面）
function createDefaultMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // 深灰色，与背景协调
    metalness: 0.6,
    roughness: 0.4,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide, // 双面渲染，确保所有面都可见
    emissive: 0x0a0a0a,
    emissiveIntensity: 0.1,
  })
}

// 创建教练材质
function createCoachMaterial(coach: CoachMeta): THREE.MeshStandardMaterial {
  const texture = createCoachTexture(coach)

  return new THREE.MeshStandardMaterial({
    color: 0xffffff, // 白色，让纹理颜色更准确
    map: texture,
    metalness: 0.6,
    roughness: 0.4,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide, // 双面渲染，确保所有面都可见
    emissive: 0x1a1a1a,
    emissiveIntensity: 0.15,
    flatShading: false,
  })
}

// 清理材质和纹理资源
function disposeMaterials(materials: THREE.Material | THREE.Material[]) {
  const materialArray = Array.isArray(materials) ? materials : [materials]

  materialArray.forEach(mat => {
    if (mat instanceof THREE.MeshStandardMaterial) {
      // 清理纹理
      if (mat.map) {
        mat.map.dispose()
        mat.map = null
      }
      // 清理其他纹理属性
      if (mat.normalMap) mat.normalMap.dispose()
      if (mat.roughnessMap) mat.roughnessMap.dispose()
      if (mat.metalnessMap) mat.metalnessMap.dispose()
      if (mat.aoMap) mat.aoMap.dispose()
      if (mat.emissiveMap) mat.emissiveMap.dispose()
      if (mat.bumpMap) mat.bumpMap.dispose()
      if (mat.displacementMap) mat.displacementMap.dispose()
      if (mat.envMap) mat.envMap.dispose()
    }
    // 清理材质
    mat.dispose()
  })
}

// 创建教练菱形十二面体（卡塔兰立体）
function createCoachRhombicDodecahedron() {
  if (cube) {
    scene.remove(cube)

    // 清理旧材质和纹理
    if (cube.material) {
      disposeMaterials(cube.material)
    }

    // 清理几何体
    if (cube.geometry) {
      cube.geometry.dispose()
    }

    cube = null as any
  }

  // 创建菱形十二面体几何体（卡塔兰立体）
  // 菱形十二面体标准数学定义：
  // - 12个全等菱形面，24条边，14个顶点
  // - 8个顶点（三个菱形公共顶点）：(±1, ±1, ±1)
  // - 6个顶点（四个菱形公共顶点）：(±2, 0, 0), (0, ±2, 0), (0, 0, ±2)
  // - 每个菱形面：锐角 arccos(1/3) ≈ 70.53°，钝角 109.47°
  // - 长对角线：短对角线 = √2 : 1
  const scale = 3 // 缩放因子
  const vertices: number[] = []
  const indices: number[] = []
  const faceGroups: number[] = []

  // 定义14个顶点（标准坐标）
  // 8个顶点（三个菱形公共顶点）：(±1, ±1, ±1)
  const cubeVertices = [
    [scale, scale, scale], // 0: (1, 1, 1)
    [scale, scale, -scale], // 1: (1, 1, -1)
    [scale, -scale, scale], // 2: (1, -1, 1)
    [scale, -scale, -scale], // 3: (1, -1, -1)
    [-scale, scale, scale], // 4: (-1, 1, 1)
    [-scale, scale, -scale], // 5: (-1, 1, -1)
    [-scale, -scale, scale], // 6: (-1, -1, 1)
    [-scale, -scale, -scale], // 7: (-1, -1, -1)
  ]

  // 6个顶点（四个菱形公共顶点）：(±2, 0, 0), (0, ±2, 0), (0, 0, ±2)
  const faceCenters = [
    [2 * scale, 0, 0], // 8: (2, 0, 0) +X
    [-2 * scale, 0, 0], // 9: (-2, 0, 0) -X
    [0, 2 * scale, 0], // 10: (0, 2, 0) +Y
    [0, -2 * scale, 0], // 11: (0, -2, 0) -Y
    [0, 0, 2 * scale], // 12: (0, 0, 2) +Z
    [0, 0, -2 * scale], // 13: (0, 0, -2) -Z
  ]

  // 创建12个菱形面（标准定义）
  // 每个菱形面由4个顶点组成：2个立方体顶点(±1,±1,±1) + 2个面心顶点(±2,0,0)等
  // 面的顺序：+X面2个、-X面2个、+Y面2个、-Y面2个、+Z面2个、-Z面2个
  // faceCenters索引映射：0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z
  // 每个面的顶点按逆时针顺序排列（从外部观察），确保法线方向正确
  const rhombusFaces = [
    // +X方向（右面）2个菱形
    [cubeVertices[0], faceCenters[2], cubeVertices[1], faceCenters[0]], // (1,1,1)-(0,2,0)-(1,1,-1)-(2,0,0)
    [cubeVertices[2], faceCenters[0], cubeVertices[3], faceCenters[3]], // (1,-1,1)-(2,0,0)-(1,-1,-1)-(0,-2,0)

    // -X方向（左面）2个菱形
    [cubeVertices[4], faceCenters[2], cubeVertices[5], faceCenters[1]], // (-1,1,1)-(0,2,0)-(-1,1,-1)-(-2,0,0)
    [cubeVertices[6], faceCenters[1], cubeVertices[7], faceCenters[3]], // (-1,-1,1)-(-2,0,0)-(-1,-1,-1)-(0,-2,0)

    // +Y方向（上面）2个菱形
    [cubeVertices[0], faceCenters[4], cubeVertices[4], faceCenters[2]], // (1,1,1)-(0,0,2)-(-1,1,1)-(0,2,0)
    [cubeVertices[1], faceCenters[5], cubeVertices[5], faceCenters[2]], // (1,1,-1)-(0,0,-2)-(-1,1,-1)-(0,2,0)

    // -Y方向（下面）2个菱形
    [cubeVertices[2], faceCenters[4], cubeVertices[6], faceCenters[3]], // (1,-1,1)-(0,0,2)-(-1,-1,1)-(0,-2,0)
    [cubeVertices[3], faceCenters[5], cubeVertices[7], faceCenters[3]], // (1,-1,-1)-(0,0,-2)-(-1,-1,-1)-(0,-2,0)

    // +Z方向（前面）2个菱形
    [cubeVertices[0], faceCenters[0], cubeVertices[2], faceCenters[4]], // (1,1,1)-(2,0,0)-(1,-1,1)-(0,0,2)
    [cubeVertices[4], faceCenters[4], cubeVertices[6], faceCenters[1]], // (-1,1,1)-(0,0,2)-(-1,-1,1)-(-2,0,0)

    // -Z方向（后面）2个菱形
    [cubeVertices[1], faceCenters[0], cubeVertices[3], faceCenters[5]], // (1,1,-1)-(2,0,0)-(1,-1,-1)-(0,0,-2)
    [cubeVertices[5], faceCenters[5], cubeVertices[7], faceCenters[1]], // (-1,1,-1)-(0,0,-2)-(-1,-1,-1)-(-2,0,0)
  ]

  // 构建顶点和索引，为每个面创建独立的顶点以便正确映射UV
  // 为了支持每个面不同的纹理，我们需要为每个面创建独立的顶点
  const uvs: number[] = []
  let indexOffset = 0

  rhombusFaces.forEach((face, faceIndex) => {
    // 为每个面创建4个独立的顶点
    const baseIndex = vertices.length / 3

    // 添加4个顶点（确保正确的顶点顺序以产生向外的法线）
    vertices.push(...face[0], ...face[1], ...face[2], ...face[3])

    // 创建两个三角形组成菱形（确保逆时针顺序以产生向外的法线）
    indices.push(
      baseIndex,
      baseIndex + 1,
      baseIndex + 2, // 第一个三角形
      baseIndex,
      baseIndex + 2,
      baseIndex + 3, // 第二个三角形
    )

    // 为这个面的4个顶点添加UV坐标（菱形面的UV映射）
    uvs.push(0, 0) // v0
    uvs.push(1, 0) // v1
    uvs.push(1, 1) // v2
    uvs.push(0, 1) // v3

    // 记录这个面的索引范围（6个索引：2个三角形）
    faceGroups.push(indexOffset, 6, faceIndex)
    indexOffset += 6
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)

  // 为每个面创建组，以便使用不同的材质
  for (let i = 0; i < 12; i++) {
    geometry.addGroup(i * 6, 6, i)
  }

  geometry.computeVertexNormals()

  // 为每个面创建材质（最多12个教练）
  const materials: THREE.MeshStandardMaterial[] = []
  const coachesToShow = props.nodes.slice(0, 12)

  // 确保至少有12个材质（即使教练不足12个）
  for (let i = 0; i < 12; i++) {
    if (i < coachesToShow.length) {
      // 为有教练的面创建材质
      materials.push(createCoachMaterial(coachesToShow[i]))
    } else {
      // 为没有教练的面创建默认材质
      materials.push(createDefaultMaterial())
    }
  }

  // 创建网格对象
  cube = new THREE.Mesh(geometry, materials)
  cube.userData = {
    coaches: coachesToShow,
    faceGroups,
    materials, // 保存材质引用以便后续清理
  }
  scene.add(cube)
}

// 初始化 Three.js 场景
function initThreeScene() {
  if (!canvasContainerRef.value || !networkRef.value) return

  const rect = networkRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // 创建场景
  scene = new THREE.Scene()
  scene.background = null

  // 创建相机
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(0, 0, 20)

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
  canvasContainerRef.value.appendChild(renderer.domElement)

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  const directionalLight1 = new THREE.DirectionalLight(0xfdd835, 1.0)
  directionalLight1.position.set(10, 10, 10)
  scene.add(directionalLight1)

  const directionalLight2 = new THREE.DirectionalLight(0xfdd835, 0.5)
  directionalLight2.position.set(-10, -10, -10)
  scene.add(directionalLight2)

  // 添加点光源以增强高光效果
  const pointLight = new THREE.PointLight(0xfdd835, 0.6, 100)
  pointLight.position.set(0, 0, 15)
  scene.add(pointLight)

  // 创建教练菱形十二面体
  createCoachRhombicDodecahedron()

  // 添加鼠标交互
  cleanupMouseControls = setupMouseControls()

  // 开始渲染循环
  animate()
}

// 设置鼠标控制
function setupMouseControls() {
  if (!canvasContainerRef.value || !renderer) return

  const handleMouseDown = (event: MouseEvent) => {
    isDragging = true
    isAutoRotating = false
    previousMousePosition = { x: event.clientX, y: event.clientY }
    renderer.domElement.style.cursor = 'grabbing'
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) {
      // 射线检测，用于悬停效果
      const mouse = new THREE.Vector2()
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObject(cube)
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer'
        // 获取点击的面索引
        const faceIndex = intersects[0].face!.materialIndex
        const coaches = cube.userData.coaches as CoachMeta[]
        if (coaches[faceIndex]) {
          // 悬停时显示教练信息
          activeNode.value = coaches[faceIndex]
        }
      } else {
        renderer.domElement.style.cursor = 'grab'
        // 鼠标移开时恢复默认教练
        activeNode.value = props.nodes[0] ?? null
      }
      return
    }

    const deltaX = event.clientX - previousMousePosition.x
    const deltaY = event.clientY - previousMousePosition.y

    rotationY += deltaX * 0.01
    rotationX += deltaY * 0.01
    rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX))

    previousMousePosition = { x: event.clientX, y: event.clientY }
  }

  const handleMouseUp = () => {
    isDragging = false
    renderer.domElement.style.cursor = 'grab'
    setTimeout(() => {
      if (!isDragging) {
        isAutoRotating = true
      }
    }, 2000)
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    camera.position.z += event.deltaY * 0.05
    camera.position.z = Math.max(15, Math.min(40, camera.position.z))
  }

  const handleClick = (event: MouseEvent) => {
    if (isDragging) return

    const mouse = new THREE.Vector2()
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObject(cube)
    if (intersects.length > 0) {
      const faceIndex = intersects[0].face!.materialIndex
      const coaches = cube.userData.coaches as CoachMeta[]
      if (coaches[faceIndex]) {
        activeNode.value = coaches[faceIndex]
        emit('navigate', coaches[faceIndex])
      }
    }
  }

  renderer.domElement.addEventListener('mousedown', handleMouseDown)
  renderer.domElement.addEventListener('mousemove', handleMouseMove)
  renderer.domElement.addEventListener('mouseup', handleMouseUp)
  renderer.domElement.addEventListener('wheel', handleWheel)
  renderer.domElement.addEventListener('click', handleClick)
  renderer.domElement.style.cursor = 'grab'

  return () => {
    renderer.domElement.removeEventListener('mousedown', handleMouseDown)
    renderer.domElement.removeEventListener('mousemove', handleMouseMove)
    renderer.domElement.removeEventListener('mouseup', handleMouseUp)
    renderer.domElement.removeEventListener('wheel', handleWheel)
    renderer.domElement.removeEventListener('click', handleClick)
  }
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  // 自动旋转
  if (isAutoRotating && !isDragging) {
    rotationY += autoRotateSpeed
  }

  // 应用旋转
  if (cube) {
    cube.rotation.y = rotationY
    cube.rotation.x = rotationX
  }

  renderer.render(scene, camera)
}

// 响应式调整
function handleResize() {
  if (!networkRef.value || !camera || !renderer) return

  const rect = networkRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

watch(
  () => props.nodes,
  () => {
    if (scene) {
      createCoachRhombicDodecahedron()
      activeNode.value = props.nodes[0] ?? null
    }
  },
  { deep: true },
)

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

  setTimeout(() => {
    initThreeScene()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 清理粒子系统
  destroyParticles?.()

  window.removeEventListener('resize', handleResize)

  if (cleanupMouseControls) {
    cleanupMouseControls()
  }

  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // 清理 Three.js 资源
  if (cube) {
    scene.remove(cube)

    // 清理材质和纹理
    if (cube.material) {
      disposeMaterials(cube.material)
    }

    // 清理几何体
    if (cube.geometry) {
      cube.geometry.dispose()
    }
  }

  if (renderer) {
    renderer.dispose()
    if (canvasContainerRef.value && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
})
</script>

<style scoped lang="scss">
.coach-network {
  position: relative;
  min-height: 560px;
  padding: 140px 6vw;
  background: radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.1), transparent), #020202;
  overflow: hidden;

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    &--particles {
      z-index: 0;
      pointer-events: none;
    }

    &--model {
      z-index: 1;
    }
  }

  &__panel {
    position: absolute;
    left: 6vw;
    top: 50%;
    transform: translateY(-50%);
    width: 320px;
    background: rgba(10, 10, 10, 0.88);
    border-radius: 24px;
    padding: 32px;
    border: 1px solid rgba(253, 216, 53, 0.2);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  &__panel-eyebrow {
    color: #fdd835;
    letter-spacing: 0.4em;
    font-size: 0.8rem;
    margin-bottom: 12px;
  }

  &__panel-name {
    margin: 0;
    font-size: 1.8rem;
    color: #fff;
  }

  &__panel-role {
    color: #c2c4cb;
    margin-top: 8px;
  }

  &__panel-stats {
    list-style: none;
    padding: 0;
    margin: 28px 0;
    display: flex;
    justify-content: space-between;
  }

  &__panel-value {
    font-size: 1.4rem;
    color: #fdd835;
    margin: 0;
    text-align: center;
  }

  &__panel-label {
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    color: #b9bccc;
    text-align: center;
  }

  &__panel-cta {
    width: 100%;
    height: 48px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    background: linear-gradient(120deg, #fdd835, #f6c300);
    color: #0a0a0a;
    font-weight: 600;
    letter-spacing: 0.1em;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(253, 216, 53, 0.4);
    }
  }
}

@media (max-width: 1200px) {
  .coach-network {
    padding: 120px 5vw;

    &__panel {
      position: relative;
      left: auto;
      top: auto;
      transform: none;
      margin: 48px auto 0;
    }
  }
}

@media (max-width: 768px) {
  .coach-network {
    min-height: 480px;
    padding: 80px 4vw;
  }
}
</style>
