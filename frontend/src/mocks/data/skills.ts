/**
 * Mock Skills Data for Content Service
 *
 * Centralized source of truth for all skills mock data
 * Used by contentHandlers.ts via factory
 */

import type { ContentServiceSkillResponse } from '@/api/types.gen'

export const mockSkills: Record<string, ContentServiceSkillResponse> = {
  '123e4567-e89b-12d3-a456-426614174100': {
    id: '123e4567-e89b-12d3-a456-426614174100',
    name: 'JavaScript Functions - Advanced Techniques',
    description: `# JavaScript Functions - Advanced Techniques

Functions are one of the most important concepts in JavaScript. They allow you to create reusable blocks of code that can be called multiple times.

## Understanding Function Basics

### Function Declaration

A function declaration defines a named function:

\`\`\`javascript
function add(a, b) {
  return a + b
}

console.log(add(5, 3))  // 8
\`\`\`

### Function Expression

Function expressions can be anonymous or named:

\`\`\`javascript
// Anonymous
const multiply = function(a, b) {
  return a * b
}

// Named
const divide = function divide(a, b) {
  return a / b
}
\`\`\`

## Arrow Functions

Arrow functions provide a concise syntax using the fat arrow (=>):

### Basic Syntax

\`\`\`javascript
// Single parameter, implicit return
const square = x => x * x

// Multiple parameters
const add = (a, b) => a + b

// Multiple statements, explicit return
const greet = (name) => {
  const greeting = \`Hello, \${name}\`
  return greeting
}
\`\`\`

### When to Use Arrow Functions

Arrow functions are perfect for:
- Callback functions
- Short, simple operations
- Use within array methods

However, avoid arrow functions when:
- You need the \`this\` keyword
- You need the \`arguments\` object
- You need hoisting behavior

## Higher-Order Functions

Higher-order functions take other functions as arguments or return functions:

### Functions as Arguments

\`\`\`javascript
function operate(a, b, operation) {
  return operation(a, b)
}

const add = (x, y) => x + y
const multiply = (x, y) => x * y

console.log(operate(5, 3, add))       // 8
console.log(operate(5, 3, multiply))  // 15
\`\`\`

### Functions Returning Functions

\`\`\`javascript
function makeMultiplier(factor) {
  return function(number) {
    return number * factor
  }
}

const double = makeMultiplier(2)
const triple = makeMultiplier(3)

console.log(double(5))  // 10
console.log(triple(5))  // 15
\`\`\`

## Closures

A closure is a function that has access to variables from another function's scope. This is created every time a function is created.

### Closure Example

\`\`\`javascript
function makeCounter() {
  let count = 0
  
  return function() {
    count++
    return count
  }
}

const counter = makeCounter()
console.log(counter())  // 1
console.log(counter())  // 2
console.log(counter())  // 3
\`\`\`

### Practical Use of Closures

\`\`\`javascript
// Private variable pattern
function createBankAccount(initialBalance) {
  let balance = initialBalance
  
  return {
    deposit(amount) {
      balance += amount
      return balance
    },
    withdraw(amount) {
      if (amount <= balance) {
        balance -= amount
        return balance
      }
      return "Insufficient funds"
    },
    getBalance() {
      return balance
    }
  }
}

const account = createBankAccount(1000)
console.log(account.deposit(500))   // 1500
console.log(account.withdraw(200))  // 1300
console.log(account.getBalance())   // 1300
\`\`\`

## Array Methods

JavaScript provides powerful array methods that work with functions:

### Map

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
console.log(doubled)  // [2, 4, 6, 8, 10]
\`\`\`

### Filter

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5, 6]
const evens = numbers.filter(n => n % 2 === 0)
console.log(evens)  // [2, 4, 6]
\`\`\`

### Reduce

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5]
const sum = numbers.reduce((acc, n) => acc + n, 0)
console.log(sum)  // 15
\`\`\`

### ForEach

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5]
numbers.forEach(n => console.log(n))
\`\`\`

## Default Parameters

Functions can have default parameters that are used if no value is provided:

\`\`\`javascript
function greet(name = "Guest", greeting = "Hello") {
  return \`\${greeting}, \${name}!\`
}

console.log(greet())                        // "Hello, Guest!"
console.log(greet("John"))                  // "Hello, John!"
console.log(greet("Jane", "Hi"))            // "Hi, Jane!"
\`\`\`

## Rest Parameters

The rest parameter (...) allows a function to accept any number of arguments:

\`\`\`javascript
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0)
}

console.log(sum(1, 2, 3, 4, 5))  // 15
console.log(sum(10, 20))          // 30
\`\`\`

## Conclusion

Mastering functions is essential for JavaScript development. They are the foundation of functional programming and allow you to write clean, maintainable code.`,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  '223e4567-e89b-12d3-a456-426614174100': {
    id: '223e4567-e89b-12d3-a456-426614174100',
    name: 'Python List Comprehensions - Mastery Guide',
    description: `# Python List Comprehensions - Complete Guide

List comprehensions are a powerful and elegant feature in Python that allow you to create lists in a clear and concise way. They are more efficient and readable than traditional loops.

## Basic Syntax

The basic syntax of a list comprehension is:

\`\`\`python
[expression for item in iterable if condition]
\`\`\`

## Simple List Comprehensions

### Creating a New List

\`\`\`python
# Traditional way
numbers = []
for i in range(10):
    numbers.append(i)

# List comprehension way
numbers = [i for i in range(10)]
\`\`\`

### Transforming Elements

\`\`\`python
# Square each number
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Convert strings to integers
strings = ['1', '2', '3', '4', '5']
integers = [int(s) for s in strings]
# [1, 2, 3, 4, 5]

# Convert strings to uppercase
words = ['hello', 'world', 'python']
upper_words = [word.upper() for word in words]
# ['HELLO', 'WORLD', 'PYTHON']
\`\`\`

## List Comprehensions with Conditions

### Filtering Elements

\`\`\`python
# Get only even numbers
numbers = range(20)
evens = [n for n in numbers if n % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Get words longer than 5 characters
words = ['hello', 'world', 'python', 'code', 'programming']
long_words = [w for w in words if len(w) > 5]
# ['python', 'programming']

# Get positive numbers
numbers = [-5, -2, 0, 3, 7, -1, 4]
positives = [n for n in numbers if n > 0]
# [3, 7, 4]
\`\`\`

### Transformation with Condition

\`\`\`python
# Square even numbers
numbers = range(10)
squared_evens = [n**2 for n in numbers if n % 2 == 0]
# [0, 4, 16, 36, 64]

# Extract domain from email addresses
emails = ['user@example.com', 'admin@test.org', 'info@site.net']
domains = [email.split('@')[1] for email in emails if '@' in email]
# ['example.com', 'test.org', 'site.net']
\`\`\`

## Nested List Comprehensions

### Creating Matrices

\`\`\`python
# Create a 3x3 matrix
matrix = [[i*3 + j for j in range(3)] for i in range(3)]
# [[0, 1, 2], [3, 4, 5], [6, 7, 8]]

# Create a 4x4 identity matrix
identity = [[1 if i == j else 0 for j in range(4)] for i in range(4)]
# [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
\`\`\`

### Flattening Lists

\`\`\`python
# Flatten a 2D list
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Flatten and filter
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat_evens = [x for row in matrix for x in row if x % 2 == 0]
# [2, 4, 6, 8]
\`\`\`

## Dictionary and Set Comprehensions

### Dictionary Comprehensions

\`\`\`python
# Create a dictionary from lists
keys = ['a', 'b', 'c']
values = [1, 2, 3]
my_dict = {k: v for k, v in zip(keys, values)}
# {'a': 1, 'b': 2, 'c': 3}

# Swap keys and values
person = {'name': 'John', 'age': 25, 'city': 'NYC'}
swapped = {v: k for k, v in person.items()}
# {'John': 'name', 25: 'age', 'NYC': 'city'}
\`\`\`

### Set Comprehensions

\`\`\`python
# Get unique lengths of words
words = ['hello', 'hi', 'world', 'hey', 'python']
lengths = {len(w) for w in words}
# {2, 3, 5}

# Get unique first letters
words = ['apple', 'apricot', 'banana', 'blueberry', 'cherry']
first_letters = {w[0] for w in words}
# {'a', 'b', 'c'}
\`\`\`

## Generator Expressions

Generator expressions are similar to list comprehensions but return a generator object instead of a list:

\`\`\`python
# List comprehension
squares_list = [x**2 for x in range(100000)]

# Generator expression (memory efficient)
squares_gen = (x**2 for x in range(100000))

# Use generator
for square in squares_gen:
    print(square)  # Prints one at a time
\`\`\`

## Performance Considerations

### Comparison

\`\`\`python
import timeit

# Using list comprehension
time1 = timeit.timeit('[x**2 for x in range(1000)]', number=10000)

# Using loop
def traditional_loop():
    result = []
    for x in range(1000):
        result.append(x**2)
    return result

time2 = timeit.timeit('traditional_loop()', globals=globals(), number=10000)

# List comprehensions are typically 2-3x faster!
\`\`\`

## Best Practices

### Do use list comprehensions for:
- Simple transformations
- Filtering
- Simple combinations

### Don't use list comprehensions for:
- Complex logic (use regular loops instead)
- Multiple nested levels (more than 2-3)
- When readability would suffer

### Readability Example

\`\`\`python
# BAD: Too complex to read
result = [x for x in [y for y in range(100) if y % 2 == 0] if x % 3 == 0]

# GOOD: Use loops for complex logic
result = []
for y in range(100):
    if y % 2 == 0:
        if y % 3 == 0:
            result.append(y)
\`\`\`

## Conclusion

List comprehensions are a powerful Python feature that makes code more concise and efficient. Understanding when and how to use them will improve your Python programming skills.`,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  '323e4567-e89b-12d3-a456-426614174100': {
    id: '323e4567-e89b-12d3-a456-426614174100',
    name: 'Web Development Fundamentals',
    description: `# Web Development Fundamentals

Web development is the practice of creating websites and web applications. It combines design, programming, and content creation to build the modern web.

## The Three Pillars of Web Development

### HTML - Structure

HTML (HyperText Markup Language) provides the structure and content of web pages:

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to My Website</h1>
    <p>This is a paragraph of text.</p>
    <a href="https://example.com">Link to example</a>
  </body>
</html>
\`\`\`

### CSS - Styling

CSS (Cascading Style Sheets) controls the appearance and layout:

\`\`\`css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
  font-size: 2em;
  margin-bottom: 10px;
}

p {
  line-height: 1.6;
  color: #666;
}
\`\`\`

### JavaScript - Behavior

JavaScript adds interactivity and dynamic behavior:

\`\`\`javascript
document.addEventListener('DOMContentLoaded', () => {
  const heading = document.querySelector('h1')
  heading.addEventListener('click', () => {
    heading.style.color = 'blue'
  })
})
\`\`\`

## Frontend vs Backend

### Frontend Development

Frontend is what users see and interact with:

- HTML, CSS, JavaScript
- Responsive design
- User experience
- Browser compatibility
- Performance optimization

### Backend Development

Backend is the server-side logic:

- Server management
- Database design
- API development
- Authentication
- Business logic

## Popular Frameworks and Libraries

### Frontend

- **React**: Component-based library for building UIs
- **Vue.js**: Progressive framework for web interfaces
- **Angular**: Full-featured framework for large applications
- **Next.js**: React framework with server-side rendering

### Backend

- **Node.js**: JavaScript runtime for server-side development
- **Express**: Minimal web framework for Node.js
- **Django**: Python web framework
- **Laravel**: PHP web framework

## Responsive Web Design

### Mobile-First Approach

\`\`\`css
/* Mobile first - base styles */
.container {
  width: 100%;
  padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}
\`\`\`

### Flexbox Layout

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 1rem;
}

.nav-links {
  display: flex;
  gap: 20px;
  list-style: none;
}
\`\`\`

## Conclusion

Web development is a dynamic and exciting field. By mastering HTML, CSS, and JavaScript, and learning popular frameworks, you can build modern, responsive web applications.`,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
}

/**
 * Helper: Get all skills
 */
export function getAllSkills(): ContentServiceSkillResponse[] {
  return Object.values(mockSkills)
}

/**
 * Helper: Get skill by ID
 */
export function getSkillById(id: string): ContentServiceSkillResponse | undefined {
  return mockSkills[id]
}
