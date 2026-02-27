import '@testing-library/dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

vi.mock('@testing-library/jest-dom', () => ({
  ...vi.importActual('@testing-library/jest-dom'),
}))
