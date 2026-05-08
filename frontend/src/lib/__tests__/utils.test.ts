import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should filter out falsy values', () => {
      const result = cn('class1', false, null, undefined, 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).not.toContain('false')
      expect(result).not.toContain('null')
    })

    it('should handle Tailwind class conflicts', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('p-4', 'p-8')
      // Should only contain p-8 (the last one wins)
      expect(result).toContain('p-8')
    })
  })
})
