import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createForceGraph } from '@/utils/forceGraph'

const linkForceStub = {
  id: vi.fn().mockReturnThis(),
  distance: vi.fn().mockReturnThis(),
  strength: vi.fn().mockReturnThis(),
  links: vi.fn(),
}

const storedForces: Record<string, any> = {}

const simulationStub = {
  force: vi.fn((name: string, instance?: any) => {
    if (instance) {
      storedForces[name] = instance
      return simulationStub
    }
    return storedForces[name]
  }),
  alphaDecay: vi.fn().mockReturnThis(),
  on: vi.fn(),
  nodes: vi.fn(),
  alpha: vi.fn().mockReturnThis(),
  restart: vi.fn().mockReturnThis(),
  stop: vi.fn(),
}

vi.mock('d3-force', () => ({
  forceSimulation: () => simulationStub,
  forceLink: () => linkForceStub,
  forceManyBody: () => ({ strength: vi.fn().mockReturnThis() }),
  forceCenter: () => vi.fn(),
  forceCollide: () => vi.fn(),
}))

describe('createForceGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(storedForces).forEach((key) => delete storedForces[key])
  })

  it('configures simulation and exposes helpers', () => {
    const nodes = [{ id: 'a', name: 'Coach A' }]
    const links = [{ source: 'a', target: 'a' }]
    const graph = createForceGraph(nodes as any, links as any, { linkDistance: 200 })

    expect(linkForceStub.distance).toHaveBeenCalledWith(200)

    graph.onTick(() => {})
    expect(simulationStub.on).toHaveBeenCalledWith('tick', expect.any(Function))

    graph.updateNodes([{ id: 'b', name: 'Coach B' }] as any)
    expect(simulationStub.nodes).toHaveBeenCalled()
    expect(simulationStub.restart).toHaveBeenCalled()

    graph.updateLinks([{ source: 'b', target: 'b' }] as any)
    expect(linkForceStub.links).toHaveBeenCalled()

    graph.destroy()
    expect(simulationStub.stop).toHaveBeenCalled()
  })
})


