/**
 * Provider Feature Components
 * Main export file for all provider UI components
 */

// Assignment Components
export { AssignmentsList } from './AssignmentsList'
export { AssignmentForm } from './AssignmentForm'

// Skill Components
export { SkillManager } from './SkillManager'
export { SkillDetail } from './SkillDetail'
export { SkillForm } from './SkillForm'

// Tutorial Components
export { TutorialManager } from './TutorialManager'
export { TutorialDetail } from './TutorialDetail'
export { TutorialForm } from './TutorialForm'

// Dashboard & Settings Components
export { AnalyticsDashboard } from './AnalyticsDashboard'
export { SettingsPanel } from './SettingsPanel'

export interface AssignmentFormProps {
  mode: 'create' | 'edit'
  assignmentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export interface SkillManagerProps {
  onSelectSkill?: (id: string) => void
}

export interface SkillFormProps {
  mode: 'create' | 'edit'
  skillId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export interface TutorialManagerProps {
  onSelectTutorial?: (id: string) => void
}

export interface TutorialFormProps {
  mode: 'create' | 'edit'
  tutorialId?: string
  onSuccess?: () => void
  onCancel?: () => void
}
