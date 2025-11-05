# 🚀 PHASE 2 - TASK 2.3 IMPLEMENTATION GUIDE

**Session**: 8  
**Date**: October 27, 2025  
**Task**: 2.3 - Code Submission Form  
**Status**: 🟢 TEST FILE CREATED - READY FOR IMPLEMENTATION  
**Tests Created**: 67 comprehensive test cases  
**Next**: Implement CodeSubmissionForm.tsx component

---

## 📋 TEST FILE CREATED

### File Location
`src/features/submissions/components/CodeSubmissionForm.test.tsx`

### Test Coverage Summary

| Category | Tests | Focus |
|----------|-------|-------|
| Rendering & Vietnamese UI | 7 | Component structure, labels, placeholders |
| Language Selector | 6 | Runtime display, selection, persistence, ARIA |
| Code Input & Counter | 8 | Textarea, character counting, max limits |
| Form Submission | 9 | Validation, submit logic, loading states |
| Clear Functionality | 4 | Clear code, reset counter, preserve language |
| Copy Functionality | 4 | Copy button, clipboard API, confirmation |
| Auto-save Integration | 3 | Status indicator, timestamp, draft clearing |
| Accessibility | 5 | ARIA labels, screen reader support, keyboard nav |
| Loading States | 3 | Loading indicator, disabled inputs, spinner |
| Error Handling | 3 | Error messages, Vietnamese text, notifications |
| Responsive Design | 3 | Mobile layout, stacking, textarea growth |
| Edge Cases | 6 | Whitespace, long names, special chars, rapid changes |
| **TOTAL** | **67** | **Comprehensive coverage** |

---

## 🎯 TEST CATEGORIES EXPLAINED

### 1. Rendering & Vietnamese UI (7 tests)
Verifies the component renders correctly with all required sections and Vietnamese labels:
- Form structure (language selector, code textarea, buttons)
- Vietnamese labels: "Ngôn ngữ", "Mã bài nộp", "Nộp bài", "Xóa", "Sao chép"
- Placeholder text in Vietnamese
- Initial character counter (0 ký tự)

### 2. Language Selector (6 tests)
Tests the runtime/language selection functionality:
- Display all available runtimes (50+ languages)
- Default to Python on initial render
- Change selection and persist in state
- Display version info for each runtime
- Proper ARIA labels: `aria-label="Chọn ngôn ngữ lập trình"`

### 3. Code Input & Character Counter (8 tests)
Tests code input capture and character counting:
- Textarea captures typed code
- Character counter updates in real-time: "5 ký tự"
- Display correct count for large code (100+ chars)
- Warn when reaching max (10,000 chars)
- Prevent input beyond limit
- Proper ARIA label: `aria-label="Nhập mã bài nộp"`
- Vietnamese counter text

### 4. Form Submission & Validation (9 tests)
Tests form submission logic and validation:
- Enable Submit button only when code is present
- Disable Submit when code is empty
- Show error for empty code: "Mã không được trống"
- Show error for missing language: "Vui lòng chọn ngôn ngữ"
- Call onSubmit with correct payload
- Show loading state: "Đang nộp..."
- Disable all inputs during submission
- Handle submission errors gracefully
- Call onError on failure

### 5. Clear Functionality (4 tests)
Tests the Clear button behavior:
- Clears code from textarea
- Resets character counter to 0 ký tự
- Disables Submit button after clear
- Preserves language selection (doesn't clear)

### 6. Copy Functionality (4 tests)
Tests the Copy button and clipboard integration:
- Display Copy button
- Copy code to clipboard when clicked
- Show Vietnamese confirmation: "Đã sao chép vào clipboard"
- Don't copy if code is empty

### 7. Auto-save Integration (3 tests)
Tests auto-save indicator and draft management:
- Display auto-save status indicator
- Show save timestamp when code is saved
- Have "Clear Draft" button: "Xóa bản nháp"

### 8. Accessibility (5 tests)
Tests ARIA support and keyboard navigation:
- Proper form semantics (`<form>` element)
- Descriptive ARIA labels on all inputs
- Announce validation errors to screen readers: `role="alert"`
- Keyboard accessible buttons (focusable, Enter key)
- Sufficient color contrast

### 9. Loading States (3 tests)
Tests loading UI during submission:
- Display loading indicator: "Đang nộp..."
- Show loading spinner: `role="status"`
- Disable all form inputs during loading

### 10. Error Handling (3 tests)
Tests error display and notifications:
- Display error message on submission failure
- Show Vietnamese error for invalid input
- Display error toast notification on API failure

### 11. Responsive Design (3 tests)
Tests mobile and tablet layouts:
- Render properly on mobile viewport
- Stack form elements vertically on mobile
- Textarea grows with content (multi-line support)

### 12. Edge Cases (6 tests)
Tests unusual scenarios:
- Handle whitespace-only code (treat as empty)
- Handle very long runtime names
- Handle special characters in code (Unicode, emoji)
- Handle rapid language changes
- Preserve state through rapid interactions

---

## 🏗️ COMPONENT STRUCTURE (TO IMPLEMENT)

### CodeSubmissionForm Props
```typescript
interface CodeSubmissionFormProps {
  assignmentId: string;           // Assignment being worked on
  studentId: string;              // Current student ID
  runtimes: Runtime[];            // Available programming languages
  isLoading?: boolean;            // Submission loading state
  onSubmit: (data: SubmissionData) => Promise<void>;  // Submit handler
  onError?: (error: Error) => void; // Error handler
}

interface Runtime {
  id: string;
  language: string;               // "Python", "JavaScript"
  version: string;                // "3.12.0"
  runtime: string;                // "python", "nodejs"
  aliases: string[];              // ["python3", "python"]
  compiled: boolean;
  cpuTime: number;
  timeout: number;
}

interface SubmissionData {
  assignmentId: string;
  studentId: string;
  code: string;
  runtimeId: string;
  language: string;
}
```

### Component State
```typescript
// Local state to manage
const [selectedRuntimeId, setSelectedRuntimeId] = useState('runtime-python');
const [code, setCode] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});
const [copied, setCopied] = useState(false);

// Computed values
const selectedRuntime = runtimes.find(r => r.id === selectedRuntimeId);
const characterCount = code.length;
const isSubmitDisabled = !code.trim() || !selectedRuntimeId || isLoading;
```

### Validation Logic
```typescript
const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!selectedRuntimeId) {
    newErrors.runtime = 'Vui lòng chọn ngôn ngữ';
  }

  if (!code.trim()) {
    newErrors.code = 'Mã không được trống';
  }

  if (code.length > 10000) {
    newErrors.code = 'Tối đa 10,000 ký tự';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Submit Handler
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const selectedRuntime = runtimes.find(r => r.id === selectedRuntimeId);
    await onSubmit({
      assignmentId,
      studentId,
      code,
      runtimeId: selectedRuntimeId,
      language: selectedRuntime?.language || 'Python',
    });

    // Success: Show notification, optionally reset form
  } catch (error) {
    onError?.(error as Error);
  }
};
```

### Clear Handler
```typescript
const handleClear = () => {
  setCode('');
  setErrors({});
};
```

### Copy Handler
```typescript
const handleCopy = async () => {
  if (!code) return;

  try {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};
```

---

## 📝 VIETNAMESE UI STRINGS

```typescript
const UI_LABELS = {
  language: 'Ngôn ngữ',
  codeSubmission: 'Mã bài nộp',
  characterCount: '{count} ký tự',
  maxCharacters: 'Tối đa 10,000 ký tự',
  buttons: {
    submit: 'Nộp bài',
    clear: 'Xóa',
    copy: 'Sao chép',
    download: 'Tải xuống',
    clearDraft: 'Xóa bản nháp',
  },
  placeholders: {
    code: 'Viết mã của bạn tại đây...',
    language: 'Chọn ngôn ngữ lập trình',
  },
  errors: {
    selectLanguage: 'Vui lòng chọn ngôn ngữ',
    codeEmpty: 'Mã không được trống',
    codeTooLong: 'Mã quá dài',
    submitFailed: 'Lỗi: {error}',
  },
  autoSave: {
    saving: 'Đang lưu...',
    saved: 'Lưu gần đây lúc {time}',
    clearDraft: 'Xóa bản nháp',
  },
  loading: 'Đang nộp...',
  success: 'Bài nộp thành công!',
  copied: 'Đã sao chép vào clipboard',
};
```

---

## 🎨 CSS CLASSES

```css
/* CodeSubmissionForm.module.css */

.form {
  /* Form container */
}

.formGroup {
  /* Group spacing */
  margin-bottom: 1.5rem;
}

.languageSelector {
  /* Language dropdown */
}

.codeTextarea {
  /* Code input */
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 1rem;
  border: 1px solid var(--mantine-color-gray-3);
  border-radius: 6px;
  min-height: 300px;
  resize: vertical;
}

.characterCounter {
  /* Character count display */
  font-size: 12px;
  color: var(--mantine-color-gray-6);
  margin-top: 0.5rem;
}

.buttonsGroup {
  /* Button container */
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.button {
  /* Button styles */
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buttonPrimary {
  /* Submit button */
  background-color: var(--mantine-color-blue-6);
  color: white;
}

.buttonSecondary {
  /* Clear, Copy buttons */
  background-color: var(--mantine-color-gray-1);
  border: 1px solid var(--mantine-color-gray-3);
  color: var(--mantine-color-dark-9);
}

.buttonDisabled {
  /* Disabled state */
  opacity: 0.5;
  cursor: not-allowed;
}

.errorMessage {
  /* Error display */
  color: var(--mantine-color-red-6);
  font-size: 13px;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loadingIndicator {
  /* Loading spinner */
  display: inline-block;
  margin-right: 0.5rem;
}

.autoSaveStatus {
  /* Auto-save indicator */
  font-size: 12px;
  color: var(--mantine-color-gray-6);
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .buttonsGroup {
    flex-direction: column;
  }

  .codeTextarea {
    min-height: 200px;
  }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Before Coding)
- [x] Create test file with 67 test cases
- [ ] Read all test cases to understand requirements
- [ ] Review Vietnamese UI labels
- [ ] Review component props interface
- [ ] Verify runtime data structure

### Phase 2: Component Implementation
- [ ] Create `CodeSubmissionForm.tsx` file
- [ ] Implement component shell with TypeScript
- [ ] Implement state management (useState hooks)
- [ ] Implement validation logic
- [ ] Implement submit handler
- [ ] Implement clear handler
- [ ] Implement copy handler
- [ ] Implement render JSX
- [ ] Add Vietnamese UI labels
- [ ] Add ARIA attributes

### Phase 3: Styling
- [ ] Create `CodeSubmissionForm.module.css`
- [ ] Style form container
- [ ] Style language selector
- [ ] Style textarea
- [ ] Style buttons
- [ ] Style character counter
- [ ] Style error messages
- [ ] Add responsive design (mobile breakpoints)
- [ ] Add dark mode support (if needed)

### Phase 4: Testing & Debugging
- [ ] Run test file: `bun run test src/features/submissions/components/CodeSubmissionForm.test.tsx`
- [ ] Fix failing tests (if any)
- [ ] Verify 90%+ test coverage
- [ ] Check TypeScript errors
- [ ] Run ESLint
- [ ] Review accessibility

### Phase 5: Polish & Integration
- [ ] Verify Vietnamese UI 100%
- [ ] Test with real API (MSW mock)
- [ ] Test on mobile viewport
- [ ] Test accessibility with screen reader
- [ ] Final commit

---

## 🧪 RUN TESTS COMMAND

```bash
# After implementing CodeSubmissionForm.tsx, run:
bun run test src/features/submissions/components/CodeSubmissionForm.test.tsx

# Or run all submission tests:
bun run test src/features/submissions/

# Or run with coverage:
bun run test -- --coverage src/features/submissions/components/CodeSubmissionForm.test.tsx
```

---

## 📚 REFERENCE IMPLEMENTATIONS

### Similar Components (Phase 1)
- `src/components/ui/Form/FormInput.tsx` - Form input patterns
- `src/components/ui/Form/FormSelect.tsx` - Select dropdown patterns
- `src/components/ui/Button/Button.tsx` - Button component patterns
- `src/features/auth/components/LoginForm.tsx` - Form submission patterns

### Test Patterns
- `src/components/ui/Form/FormInput.test.tsx` - Test structure
- `src/features/auth/components/LoginForm.test.tsx` - Form testing
- `src/features/assignments/components/AssignmentsList.test.tsx` - List testing

---

## 🚀 NEXT STEPS (AFTER TASK 2.3)

1. **Task 2.4**: Language Selector & Runtime Support
   - Create `useRuntimesQuery` hook to fetch runtimes from API
   - Pass runtimes as props to CodeSubmissionForm

2. **Task 2.5**: Code Display Component
   - Create read-only code viewer with line numbers
   - Support copy and download functionality

3. **Task 2.6**: Auto-save to LocalStorage
   - Create `useFormAutoSave` hook
   - Save form state every 5 seconds

4. **Task 2.7**: Responsive Page Layout
   - Create `CodeSubmissionPage` that combines all components
   - 3-column desktop layout, 2-column mobile layout

5. **Task 2.8**: Form Polish & Features
   - Add error handling and notifications
   - Add loading states and transitions
   - Final accessibility audit

---

## 📊 ESTIMATED TIME

- **Reading tests**: 20 minutes
- **Implementation**: 45 minutes
- **Styling**: 30 minutes
- **Testing & fixing**: 20 minutes
- **Polish**: 15 minutes
- **Total**: ~2 hours (should fit within 1.5-day estimate)

---

## 💡 TIPS FOR IMPLEMENTATION

1. **Start with JSX render**: Write the JSX structure first
2. **Then add state**: Add useState hooks for form state
3. **Then add handlers**: Implement event handlers (submit, clear, copy)
4. **Then add validation**: Add validation logic
5. **Then add styling**: Add CSS Module classes
6. **Then verify tests**: Run tests and fix any failures

---

## ⚠️ COMMON PITFALLS

1. **Forget Vietnamese UI** - Check EVERY label is Vietnamese
2. **Miss ARIA attributes** - Add aria-label on all inputs
3. **Validation not strict** - Check empty/whitespace-only code
4. **Character limit not enforced** - Prevent input beyond 10,000
5. **Submit button logic wrong** - Should disable when empty
6. **Clear doesn't reset language** - Language should persist
7. **Copy fails silently** - Use proper error handling
8. **No loading state** - Show "Đang nộp..." during submission

---

**Status**: 🟢 TEST FILE COMPLETE - READY FOR IMPLEMENTATION  
**Next Action**: Implement CodeSubmissionForm.tsx  
**Time Estimate**: 2 hours  
**Target Completion**: Same session (1.5 days total for Task 2.3)

