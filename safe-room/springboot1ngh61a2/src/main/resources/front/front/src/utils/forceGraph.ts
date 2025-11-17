import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'

export interface CoachNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  avatar?: string
  role?: string
  featured?: boolean
  strength?: number
  z?: number
}

export interface CoachLink extends d3.SimulationLinkDatum<CoachNode> {
  source: string | CoachNode
  target: string | CoachNode
  energyLevel?: number
}

export interface ForceGraphConfig {
  linkDistance?: number
  chargeStrength?: number
  collideRadius?: number
  enable3D?: boolean
}

export const createForceGraph = (
  nodes: CoachNode[],
  links: CoachLink[],
  config: ForceGraphConfig = {},
) => {
  // 如果是 3D 模式，初始化 z 坐标
  if (config.enable3D) {
    nodes.forEach((node, i) => {
      if (node.z === undefined) {
        // 使用球面分布算法初始化 z 坐标，让节点在 3D 空间中更分散
        const phi = Math.acos(-1 + (2 * i) / nodes.length)
        const theta = Math.sqrt(nodes.length * Math.PI) * phi
        const radius = (config.linkDistance ?? 200) * 0.5 // 增大 z 坐标范围
        node.z = Math.cos(theta) * Math.sin(phi) * radius
      }
    })
  }

  const simulation = forceSimulation<CoachNode>(nodes)
    .force(
      'link',
      forceLink<CoachNode, CoachLink>(links)
        .id((node) => node.id)
        .distance(config.linkDistance ?? 120)
        .strength(0.85),
    )
    .force('charge', forceManyBody().strength(config.chargeStrength ?? -260))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(config.collideRadius ?? 48))
    .alphaDecay(0.05) // 加快稳定速度，减少持续计算
    .alphaMin(0.01) // 设置最小 alpha，让模拟更快停止

  const onTick = (callback: () => void) => {
    simulation.on('tick', callback)
  }

  const updateNodes = (newNodes: CoachNode[]) => {
    simulation.nodes(newNodes)
    simulation.alpha(0.8).restart()
  }

  const updateLinks = (newLinks: CoachLink[]) => {
    const linkForce = simulation.force('link') as d3.ForceLink<CoachNode, CoachLink>
    linkForce.links(newLinks)
    simulation.alpha(0.8).restart()
  }

  const resize = () => {
    simulation.alpha(0.8).restart()
  }

  const destroy = () => {
    simulation.stop()
    simulation.on('tick', null)
  }

  return {
    simulation,
    onTick,
    updateNodes,
    updateLinks,
    resize,
    destroy,
  }
}

