import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

window.IntersectionObserver = MockIntersectionObserver as any

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

window.ResizeObserver = MockResizeObserver as any 