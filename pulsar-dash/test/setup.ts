import '@testing-library/dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

declare global {
  namespace Vi {
    interface Matchers<T> extends jest.Matchers<T> {}
  }
}
