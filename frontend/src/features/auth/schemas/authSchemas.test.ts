/**
 * Unit tests cho Auth Schemas
 * Test Zod validation cho login, register và các auth forms
 */

import { describe, it, expect } from 'vitest'
import { loginSchema, type LoginFormData } from './loginSchema'
import { registerSchema, type RegisterFormData } from './registerSchema'

describe('Auth Schemas', () => {
  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const validData: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should accept minimum password length', () => {
      const validData: LoginFormData = {
        email: 'test@example.com',
        password: 'p', // minimum 1 character
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept various email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@gmail.com',
      ]

      validEmails.forEach(email => {
        const data: LoginFormData = {
          email,
          password: 'password123',
        }
        const result = loginSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test @example.com',
      ]

      invalidEmails.forEach(email => {
        const data = {
          email,
          password: 'password123',
        }
        const result = loginSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('should reject empty email', () => {
      const data = {
        email: '',
        password: 'password123',
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('Register Schema', () => {
    const baseValidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeToTerms: true,
      role: 'STUDENT',
    }

    it('should validate valid register data', () => {
      const result = registerSchema.safeParse(baseValidData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(baseValidData)
      }
    })

    it('should require minimum password length of 8', () => {
      const data = {
        ...baseValidData,
        password: 'short',
        confirmPassword: 'short',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate password confirmation match', () => {
      const data = {
        ...baseValidData,
        password: 'password123',
        confirmPassword: 'different123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword')
        expect(result.error.issues[0].message).toBe('Mật khẩu xác nhận không khớp')
      }
    })

    it('should require terms agreement', () => {
      const data = {
        ...baseValidData,
        agreeToTerms: false,
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bạn phải đồng ý với điều khoản sử dụng')
      }
    })

    it('should allow empty firstName and lastName', () => {
      const data = {
        ...baseValidData,
        firstName: '',
        lastName: '',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = ['invalid-email', '@example.com', 'test@']

      invalidEmails.forEach(email => {
        const data = {
          ...baseValidData,
          email,
        }
        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('should reject empty confirmPassword', () => {
      const data = {
        ...baseValidData,
        confirmPassword: '',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject missing agreeToTerms', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        // agreeToTerms is missing
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle edge cases', () => {
      // Test with very long names
      const dataWithLongNames = {
        ...baseValidData,
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
      }

      const result = registerSchema.safeParse(dataWithLongNames)
      expect(result.success).toBe(true)

      // Test with special characters in names
      const dataWithSpecialChars = {
        ...baseValidData,
        firstName: 'José-María',
        lastName: "O'Connor",
      }

      const result2 = registerSchema.safeParse(dataWithSpecialChars)
      expect(result2.success).toBe(true)
    })
  })

  describe('Schema Type Inference', () => {
    it('should correctly infer LoginFormData type', () => {
      const data: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      }

      expect(data.email).toBe('test@example.com')
      expect(data.password).toBe('password123')
    })

    it('should correctly infer RegisterFormData type', () => {
      const data: RegisterFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        agreeToTerms: true,
        role: 'STUDENT',
      }

      expect(data.firstName).toBe('John')
      expect(data.lastName).toBe('Doe')
      expect(data.agreeToTerms).toBe(true)
    })
  })
})