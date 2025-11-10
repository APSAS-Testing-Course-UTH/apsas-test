/**
 * Mock Tutorials Data for Content Service
 *
 * Centralized source of truth for all tutorial mock data
 * Used by contentHandlers.ts via factory
 */

import type { ContentServiceTutorialResponse } from '@/api/types.gen'

export const mockTutorials: Record<string, ContentServiceTutorialResponse> = {
  '123e4567-e89b-12d3-a456-426614174000': {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Hướng dẫn React Hooks - Advanced Patterns',
    content: `# React Hooks: Advanced Patterns and Best Practices

React Hooks đã thay đổi cách chúng ta viết React components. Hướng dẫn này sẽ giúp bạn hiểu sâu hơn về các Hooks nâng cao và cách sử dụng chúng hiệu quả.

## Giới thiệu về React Hooks

React Hooks là các hàm đặc biệt cho phép bạn "kết nối" vào các tính năng của React. Chúng cho phép bạn sử dụng state và các tính năng React khác mà không cần viết class components.

### Lợi ích của Hooks

- **Tái sử dụng logic**: Hooks làm dễ dàng hơn việc chia sẻ logic giữa các components
- **Code sạch hơn**: Tách biệt logic liên quan thành các Hooks riêng biệt
- **Dễ hiểu hơn**: Các Hooks nhỏ, tập trung dễ đọc và bảo trì hơn

### Qui tắc của Hooks

Có hai qui tắc quan trọng cần tuân theo:

1. **Chỉ gọi Hooks ở mức cao nhất**: Không gọi Hooks bên trong loops, conditions hoặc nested functions
2. **Chỉ gọi Hooks từ React functions**: Gọi Hooks từ React function components hoặc custom Hooks

## useState Hook

\`\`\`typescript
const [state, setState] = useState<T>(initialValue: T)
\`\`\`

\`useState\` là Hook cơ bản nhất. Nó cho phép bạn thêm state vào functional components.

### Ví dụ cơ bản

\`\`\`typescript
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Bạn đã click {count} lần</p>
      <button onClick={() => setCount(count + 1)}>
        Click vào đây
      </button>
    </div>
  )
}
\`\`\`

### Functional Updates

Khi state mới phụ thuộc vào state cũ, bạn có thể truyền một hàm vào \`setState\`:

\`\`\`typescript
const [count, setCount] = useState(0)

// Thay vì:
setCount(count + 1)

// Nên dùng:
setCount(prevCount => prevCount + 1)
\`\`\`

### Lazy Initialization

Nếu state ban đầu yêu cầu tính toán phức tạp, bạn có thể truyền một hàm:

\`\`\`typescript
const [state, setState] = useState(() => {
  const initialState = expensiveComputation(props)
  return initialState
})
\`\`\`

## useEffect Hook

\`\`\`typescript
useEffect(() => {
  // Effect code here
  
  return () => {
    // Cleanup code here (optional)
  }
}, [dependencies])
\`\`\`

\`useEffect\` cho phép bạn thực hiện side effects trong functional components.

### Hiểu về Dependency Array

Dependency array kiểm soát khi nào effect chạy:

**Không có dependency array**: Effect chạy sau mỗi render
\`\`\`typescript
useEffect(() => {
  console.log('Chạy sau mỗi render')
})
\`\`\`

**Dependency array trống**: Effect chạy một lần khi component mount
\`\`\`typescript
useEffect(() => {
  console.log('Chạy khi mount')
}, [])
\`\`\`

**Dependency array có giá trị**: Effect chạy khi dependencies thay đổi
\`\`\`typescript
useEffect(() => {
  console.log('userId thay đổi')
}, [userId])
\`\`\`

### Cleanup Function

Cleanup function chạy trước khi effect chạy lại hoặc khi component unmount:

\`\`\`typescript
useEffect(() => {
  const subscription = subscribe(userId)
  
  return () => {
    // Cleanup: Unsubscribe khi component unmount hoặc userId thay đổi
    subscription.unsubscribe()
  }
}, [userId])
\`\`\`

## useContext Hook

\`\`\`typescript
const value = useContext(MyContext)
\`\`\`

\`useContext\` cho phép bạn sử dụng React Context mà không cần wrapper component.

### Ví dụ: Theme Context

\`\`\`typescript
// Tạo context
const ThemeContext = createContext<'light' | 'dark'>('light')

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

// Sử dụng context
function Button() {
  const theme = useContext(ThemeContext)
  return <button style={{ background: theme === 'dark' ? '#000' : '#fff' }}>Click</button>
}
\`\`\`

## useRef Hook

\`\`\`typescript
const ref = useRef<T>(initialValue)
\`\`\`

\`useRef\` tạo một reference có thể được thay đổi được, nhưng không gây ra re-render.

### Ví dụ: Focus Input

\`\`\`typescript
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const focusInput = () => {
    inputRef.current?.focus()
  }
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus input</button>
    </>
  )
}
\`\`\`

## useReducer Hook

\`\`\`typescript
const [state, dispatch] = useReducer(reducer, initialState)
\`\`\`

\`useReducer\` là một cách để quản lý state phức tạp hơn so với \`useState\`.

### Ví dụ: Todo List

\`\`\`typescript
interface TodoState {
  todos: Todo[]
}

type TodoAction = 
  | { type: 'ADD'; payload: Todo }
  | { type: 'REMOVE'; payload: string }
  | { type: 'TOGGLE'; payload: string }

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return { todos: [...state.todos, action.payload] }
    case 'REMOVE':
      return { todos: state.todos.filter(t => t.id !== action.payload) }
    case 'TOGGLE':
      return {
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        )
      }
    default:
      return state
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] })
  
  return (
    <div>
      {state.todos.map(todo => (
        <div key={todo.id}>
          {todo.text}
          <button onClick={() => dispatch({ type: 'TOGGLE', payload: todo.id })}>
            Toggle
          </button>
        </div>
      ))}
    </div>
  )
}
\`\`\`

## useMemo Hook

\`\`\`typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
\`\`\`

\`useMemo\` cho phép bạn memoize một giá trị để tránh tính toán lại không cần thiết.

### Khi nào sử dụng

- Khi tính toán rất phức tạp
- Khi giá trị được truyền vào child component như prop
- Khi dependency array có nhiều phần tử

## useCallback Hook

\`\`\`typescript
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
\`\`\`

\`useCallback\` cho phép bạn memoize một callback function.

### Ví dụ: Tối ưu Child Component

\`\`\`typescript
const Button = React.memo(({ onClick }: { onClick: () => void }) => {
  console.log('Button rendered')
  return <button onClick={onClick}>Click</button>
})

function Parent() {
  const [count, setCount] = useState(0)
  
  // Không dùng useCallback: Button sẽ re-render mỗi lần Parent renders
  // const handleClick = () => console.log('Clicked')
  
  // Dùng useCallback: Button chỉ re-render khi dependencies thay đổi
  const handleClick = useCallback(() => console.log('Clicked'), [])
  
  return (
    <div>
      <Button onClick={handleClick} />
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
\`\`\`

## Custom Hooks

Bạn có thể tạo Hooks tùy chỉnh để tái sử dụng logic giữa các components.

### Ví dụ: useForm Hook

\`\`\`typescript
function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState(initialValues)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const resetForm = () => {
    setValues(initialValues)
  }
  
  return { values, handleChange, resetForm }
}

// Sử dụng
function LoginForm() {
  const form = useForm({ email: '', password: '' })
  
  return (
    <form>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
      />
      <input
        name="password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange}
      />
      <button type="button" onClick={form.resetForm}>Reset</button>
    </form>
  )
}
\`\`\`

## Best Practices

1. **Tuân theo Hooks Rules**: Đây là những qui tắc bắt buộc phải tuân theo
2. **Giữ Dependencies Chính Xác**: Luôn bao gồm tất cả các dependencies trong array
3. **Tách Concerns**: Tạo các custom Hooks nhỏ, tập trung
4. **Memoize Wisely**: Không memoize mọi thứ, chỉ khi cần thiết

## Kết luận

React Hooks là một cách mạnh mẽ để viết React components. Hiểu sâu về chúng sẽ giúp bạn viết code React hiệu quả hơn và dễ bảo trì hơn.`,
    creatorId: 'provider-001',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    tags: ['react', 'hooks', 'javascript', 'advanced'],
  },
  '223e4567-e89b-12d3-a456-426614174000': {
    id: '223e4567-e89b-12d3-a456-426614174000',
    title: 'JavaScript Fundamentals - Complete Guide',
    content: `# JavaScript Fundamentals - Complete Beginner Guide

JavaScript là ngôn ngữ lập trình phổ biến nhất trên web. Hướng dẫn này sẽ giúp bạn nắm vững các khái niệm cơ bản của JavaScript.

## Giới thiệu

JavaScript được tạo ra bởi Brendan Eich vào năm 1995. Ban đầu nó chỉ chạy trên trình duyệt, nhưng ngày nay nó cũng chạy trên server với Node.js.

### Tại sao học JavaScript?

- **Phổ biến**: JavaScript được sử dụng bởi hầu hết các website
- **Dễ học**: Cú pháp tương đối dễ hiểu
- **Mạnh mẽ**: Có thể xây dựng các ứng dụng phức tạp
- **Cơ hội việc làm**: Nhu cầu JavaScript developers rất cao

## Variables và Data Types

### Khai báo Variables

JavaScript có ba cách khai báo biến:

\`\`\`javascript
var x = 5;      // Cũ, không nên dùng
let y = 10;     // Nên dùng, block-scoped
const z = 15;   // Nên dùng khi giá trị không thay đổi
\`\`\`

### Primitive Data Types

\`\`\`javascript
// String
const name = "John"
const message = \`Hello, \${name}\`

// Number
const age = 25
const pi = 3.14

// Boolean
const isActive = true
const hasError = false

// Null và Undefined
const x = null
const y = undefined

// Symbol (ES6)
const sym = Symbol('id')

// BigInt (ES2020)
const bigNumber = 9007199254740991n
\`\`\`

### Object Data Types

\`\`\`javascript
// Object
const user = {
  name: "John",
  age: 25,
  email: "john@example.com"
}

// Array
const colors = ["red", "green", "blue"]
const mixed = [1, "hello", true, { x: 10 }]

// Function
function greet(name) {
  return \`Hello, \${name}\`
}
\`\`\`

## Operators

### Arithmetic Operators

\`\`\`javascript
const a = 10
const b = 3

console.log(a + b)      // 13 (Cộng)
console.log(a - b)      // 7 (Trừ)
console.log(a * b)      // 30 (Nhân)
console.log(a / b)      // 3.333... (Chia)
console.log(a % b)      // 1 (Chia lấy dư)
console.log(a ** b)     // 1000 (Mũ)
\`\`\`

### Comparison Operators

\`\`\`javascript
const x = 5
const y = "5"

console.log(x == y)       // true (So sánh giá trị)
console.log(x === y)      // false (So sánh giá trị và kiểu dữ liệu)
console.log(x != y)       // false
console.log(x !== y)      // true
console.log(x > 3)        // true
console.log(x < 3)        // false
\`\`\`

### Logical Operators

\`\`\`javascript
const a = true
const b = false

console.log(a && b)       // false (AND)
console.log(a || b)       // true (OR)
console.log(!a)           // false (NOT)
\`\`\`

## Control Structures

### If-Else Statement

\`\`\`javascript
const age = 18

if (age >= 18) {
  console.log("Bạn đủ tuổi")
} else if (age >= 13) {
  console.log("Bạn là thiếu niên")
} else {
  console.log("Bạn là trẻ em")
}
\`\`\`

### Switch Statement

\`\`\`javascript
const day = "Monday"

switch (day) {
  case "Monday":
    console.log("Thứ hai")
    break
  case "Tuesday":
    console.log("Thứ ba")
    break
  default:
    console.log("Ngày khác")
}
\`\`\`

### Loops

**For Loop**:
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i)
}
\`\`\`

**While Loop**:
\`\`\`javascript
let i = 0
while (i < 5) {
  console.log(i)
  i++
}
\`\`\`

**ForEach**:
\`\`\`javascript
const colors = ["red", "green", "blue"]
colors.forEach(color => {
  console.log(color)
})
\`\`\`

## Functions

### Function Declaration

\`\`\`javascript
function add(a, b) {
  return a + b
}

console.log(add(5, 3))  // 8
\`\`\`

### Arrow Functions

\`\`\`javascript
const multiply = (a, b) => a * b
const square = x => x * x
const greet = () => console.log("Hello")

console.log(multiply(4, 5))  // 20
console.log(square(5))       // 25
\`\`\`

### Higher Order Functions

\`\`\`javascript
// Function nhận function làm parameter
const numbers = [1, 2, 3, 4, 5]

const doubled = numbers.map(num => num * 2)
console.log(doubled)  // [2, 4, 6, 8, 10]

const evens = numbers.filter(num => num % 2 === 0)
console.log(evens)    // [2, 4]

const sum = numbers.reduce((acc, num) => acc + num, 0)
console.log(sum)      // 15
\`\`\`

## Object-Oriented Programming

### Objects

\`\`\`javascript
const person = {
  name: "John",
  age: 25,
  greet() {
    return \`Hello, I'm \${this.name}\`
  }
}

console.log(person.greet())  // "Hello, I'm John"
\`\`\`

### Classes

\`\`\`javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  
  greet() {
    return \`Hello, I'm \${this.name}\`
  }
}

const john = new Person("John", 25)
console.log(john.greet())  // "Hello, I'm John"
\`\`\`

## Async Programming

### Promises

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!")
  }, 1000)
})

promise.then(result => {
  console.log(result)  // "Success!" sau 1 giây
})
\`\`\`

### Async/Await

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
\`\`\`

## Kết luận

Đây là những khái niệm cơ bản của JavaScript. Để trở thành một JavaScript developer giỏi, bạn cần thực hành nhiều và tiếp tục học các chủ đề nâng cao.`,
    creatorId: 'provider-001',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ['javascript', 'beginner', 'fundamentals', 'web-development'],
  },
  '323e4567-e89b-12d3-a456-426614174000': {
    id: '323e4567-e89b-12d3-a456-426614174000',
    title: 'Python Data Structures - In-Depth Tutorial',
    content: `# Python Data Structures - Comprehensive Guide

Python cung cấp các cấu trúc dữ liệu mạnh mẽ để lưu trữ và xử lý dữ liệu. Hướng dẫn này sẽ giúp bạn hiểu sâu về các data structures trong Python.

## Lists - Danh sách có thứ tự

Lists là cấu trúc dữ liệu linh hoạt nhất trong Python. Chúng có thể chứa bất kỳ kiểu dữ liệu nào.

### Tạo Lists

\`\`\`python
# List trống
my_list = []

# List với các phần tử
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]

# List mixed types
mixed = [1, "hello", 3.14, True, None]

# List comprehension
squares = [x**2 for x in range(10)]
\`\`\`

### Truy cập phần tử

\`\`\`python
fruits = ["apple", "banana", "cherry"]

print(fruits[0])       # "apple" (Phần tử đầu)
print(fruits[-1])      # "cherry" (Phần tử cuối)
print(fruits[1:3])     # ["banana", "cherry"] (Slicing)
\`\`\`

### Sửa đổi Lists

\`\`\`python
fruits = ["apple", "banana"]

# Thêm phần tử
fruits.append("cherry")
fruits.extend(["date", "elderberry"])
fruits.insert(1, "blueberry")

# Xóa phần tử
fruits.remove("banana")
fruits.pop(0)
del fruits[0]

# Sắp xếp
fruits.sort()
fruits.reverse()
\`\`\`

## Tuples - Danh sách bất biến

Tuples tương tự như lists nhưng không thể thay đổi sau khi tạo.

### Tạo Tuples

\`\`\`python
# Tuple trống
empty_tuple = ()

# Tuple với một phần tử
single = (1,)

# Tuple với nhiều phần tử
coordinates = (10, 20)
colors = ("red", "green", "blue")

# Unpacking
x, y = (10, 20)
\`\`\`

### Lợi ích của Tuples

- **Bất biến**: Không thể sửa đổi
- **Nhanh hơn**: Hiệu suất tốt hơn lists
- **Dùng làm dictionary keys**: Có thể dùng làm keys vì bất biến
- **Bảo vệ dữ liệu**: Đảm bảo dữ liệu không bị thay đổi

## Dictionaries - Ánh xạ khóa-giá trị

Dictionaries lưu trữ dữ liệu dưới dạng cặp khóa-giá trị.

### Tạo Dictionaries

\`\`\`python
# Dictionary trống
empty_dict = {}

# Dictionary với dữ liệu
person = {
    "name": "John",
    "age": 25,
    "city": "New York",
    "skills": ["Python", "JavaScript", "SQL"]
}

# Tạo từ tuples
pairs = [("a", 1), ("b", 2), ("c", 3)]
dict_from_pairs = dict(pairs)
\`\`\`

### Truy cập và Sửa đổi

\`\`\`python
person = {
    "name": "John",
    "age": 25
}

# Truy cập
print(person["name"])           # "John"
print(person.get("age"))        # 25
print(person.get("email", "N/A"))  # "N/A"

# Thêm hoặc sửa
person["email"] = "john@example.com"
person.update({"city": "NYC", "country": "USA"})

# Xóa
del person["email"]
person.pop("age")
\`\`\`

### Lặp Dictionaries

\`\`\`python
person = {"name": "John", "age": 25, "city": "NYC"}

# Lặp keys
for key in person:
    print(key)

# Lặp values
for value in person.values():
    print(value)

# Lặp key-value pairs
for key, value in person.items():
    print(f"{key}: {value}")
\`\`\`

## Sets - Tập hợp không có thứ tự

Sets chứa các phần tử duy nhất và không có thứ tự.

### Tạo Sets

\`\`\`python
# Set trống (phải dùng set())
empty_set = set()

# Set với phần tử
colors = {"red", "green", "blue"}
numbers = {1, 2, 3, 3, 2, 1}  # {1, 2, 3}

# Tạo từ list
unique_numbers = set([1, 1, 2, 2, 3, 3])
\`\`\`

### Set Operations

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

# Union (Hợp)
print(a | b)  # {1, 2, 3, 4, 5}

# Intersection (Giao)
print(a & b)  # {3}

# Difference (Hiệu)
print(a - b)  # {1, 2}

# Symmetric difference (Hiệu đối xứng)
print(a ^ b)  # {1, 2, 4, 5}
\`\`\`

## Strings - Dãy ký tự

Strings là cấu trúc dữ liệu quan trọng để làm việc với văn bản.

### Tạo và Truy cập Strings

\`\`\`python
# Tạo strings
text = "Hello, World!"
multiline = """
This is a
multiline string
"""

# Truy cập ký tự
print(text[0])        # "H"
print(text[-1])       # "!"
print(text[0:5])      # "Hello"
\`\`\`

### String Methods

\`\`\`python
text = "Hello, World!"

# Thông tin
print(len(text))                      # 13
print(text.count("l"))                # 3

# Chuyển đổi
print(text.lower())                   # "hello, world!"
print(text.upper())                   # "HELLO, WORLD!"
print(text.replace("World", "Python"))  # "Hello, Python!"

# Tìm kiếm
print(text.find("World"))             # 7
print(text.startswith("Hello"))       # True

# Split và Join
words = text.split(", ")
print(words)                          # ["Hello", "World!"]
print("-".join(words))                # "Hello-World!"

# Strip
text2 = "  hello  "
print(text2.strip())                  # "hello"
\`\`\`

## Chọn Data Structure phù hợp

### List khi:
- Cần thứ tự
- Thường xuyên thêm/xóa phần tử
- Cần truy cập theo index

### Tuple khi:
- Dữ liệu không thay đổi
- Cần dùng làm dictionary key
- Cần hiệu suất cao

### Dictionary khi:
- Cần tìm kiếm nhanh theo key
- Cần ánh xạ khóa-giá trị
- Dữ liệu có cấu trúc

### Set khi:
- Chỉ cần phần tử duy nhất
- Cần làm các phép toán tập hợp
- Không cần thứ tự

## Performance Comparison

| Operation | List | Tuple | Dict | Set |
|-----------|------|-------|------|-----|
| Tạo | Chậm | Chậm | Trung bình | Trung bình |
| Truy cập | O(1) | O(1) | O(1) | N/A |
| Thêm | O(1)* | N/A | O(1) | O(1) |
| Tìm kiếm | O(n) | O(n) | O(1) | O(1) |
| Xóa | O(n)* | N/A | O(1) | O(1) |

## Kết luận

Lựa chọn đúng data structure là chìa khóa để viết code hiệu quả. Hiểu rõ từng loại data structure sẽ giúp bạn viết Python code tốt hơn.`,
    creatorId: 'provider-001',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ['python', 'data-structures', 'intermediate', 'programming'],
  },
}

/**
 * Helper: Get all tutorials
 */
export function getAllTutorials(): ContentServiceTutorialResponse[] {
  return Object.values(mockTutorials)
}

/**
 * Helper: Get tutorial by ID
 */
export function getTutorialById(id: string): ContentServiceTutorialResponse | undefined {
  return mockTutorials[id]
}
