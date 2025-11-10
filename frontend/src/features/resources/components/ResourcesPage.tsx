import { IconSearch, IconBook, IconBrain } from '@tabler/icons-react'
import { useState } from 'react'
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Group,
  Tabs,
  Pagination,
} from '@mantine/core'

import { useTutorials, useSkillsQuery } from '../api/hooks'
import { ResourcesList } from './ResourcesList'

export function ResourcesPage() {
  // Tutorials state
  const [tutorialPage, setTutorialPage] = useState(0)
  const [tutorialSearch, setTutorialSearch] = useState('')

  // Skills state
  const [skillsPage, setSkillsPage] = useState(0)
  const [skillsSearch, setSkillsSearch] = useState('')

  // Tab state
  const [activeTab, setActiveTab] = useState<string | null>('tutorials')

  // Fetch data
  const tutorialsResult = useTutorials({ page: tutorialPage, size: 12 })
  const skillsResult = useSkillsQuery({ page: skillsPage, size: 12 })

  // Tutorial data and filtering
  const tutorials = tutorialsResult.data?.content || []
  const filteredTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.title?.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      tutorial.content?.toLowerCase().includes(tutorialSearch.toLowerCase())
  )

  // Skills data and filtering
  const skills = skillsResult.data?.content || []
  const filteredSkills = skills.filter(
    (skill) =>
      skill.name?.toLowerCase().includes(skillsSearch.toLowerCase()) ||
      skill.description?.toLowerCase().includes(skillsSearch.toLowerCase())
  )

  // Download handler
  const handleDownload = (
    resource: { content?: string; description?: string; title?: string; name?: string },
    type: 'tutorial' | 'skill'
  ) => {
    const content =
      type === 'tutorial' ? resource.content : resource.description
    const title = type === 'tutorial' ? resource.title : resource.name

    const element = document.createElement('a')
    const file = new Blob([content || ''], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${title || 'resource'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Container>
      <Stack>
        <div>
          <Title order={1}>Truy cập tài nguyên</Title>
          <Text c="dimmed" size="sm">
            Duyệt qua hướng dẫn và kỹ năng để nâng cao khả năng của bạn
          </Text>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="tutorials" leftSection={<IconBook size={14} />}>
              Hướng dẫn
            </Tabs.Tab>
            <Tabs.Tab value="skills" leftSection={<IconBrain size={14} />}>
              Kỹ năng
            </Tabs.Tab>
          </Tabs.List>

          {/* Tutorials Tab */}
          <Tabs.Panel value="tutorials" pt="md">
            <Stack>
              <Group>
                <TextInput
                  placeholder="Tìm kiếm hướng dẫn..."
                  leftSection={<IconSearch size={16} />}
                  value={tutorialSearch}
                  onChange={(e) => {
                    setTutorialSearch(e.currentTarget.value)
                    setTutorialPage(0)
                  }}
                  style={{ flex: 1 }}
                />
              </Group>

              <ResourcesList
                items={filteredTutorials}
                isLoading={tutorialsResult.isLoading}
                type="tutorials"
                onDownload={(item) => handleDownload(item, 'tutorial')}
              />

              <Pagination
                total={tutorialsResult.data?.totalPages || 1}
                value={tutorialPage + 1}
                onChange={(p) => setTutorialPage(p - 1)}
              />
            </Stack>
          </Tabs.Panel>

          {/* Skills Tab */}
          <Tabs.Panel value="skills" pt="md">
            <Stack>
              <Group>
                <TextInput
                  placeholder="Tìm kiếm kỹ năng..."
                  leftSection={<IconSearch size={16} />}
                  value={skillsSearch}
                  onChange={(e) => {
                    setSkillsSearch(e.currentTarget.value)
                    setSkillsPage(0)
                  }}
                  style={{ flex: 1 }}
                />
              </Group>

              <ResourcesList
                items={filteredSkills}
                isLoading={skillsResult.isLoading}
                type="skills"
                onDownload={(item) => handleDownload(item, 'skill')}
              />

              <Pagination
                total={skillsResult.data?.totalPages || 1}
                value={skillsPage + 1}
                onChange={(p) => setSkillsPage(p - 1)}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
