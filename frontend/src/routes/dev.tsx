import { createFileRoute } from '@tanstack/react-router'
import { Container, Stack, Title, Button, Tabs } from '@mantine/core'
import { useState } from 'react'

export const Route = createFileRoute('/dev')({
  component: DevPage,
})

function DevPage() {
  const [tab, setTab] = useState<string | null>('links')

  return (
    <Container size="lg" py="xl">
      <Stack>
        <Title order={2}>Dev Utilities - Task 2.2 Validation</Title>
        
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            <Tabs.Tab value="links">Navigation Links</Tabs.Tab>
            <Tabs.Tab value="component">Direct Component Test</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="links" pt="md">
            <Stack>
              <Button component="a" href="/student/assignments/assign-001">
                Open AssignmentDetail via Route (assign-001)
              </Button>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                Note: Requires STUDENT role authentication
              </p>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="component" pt="md">
            <Stack gap="lg">
              <div>
                <Title order={4}>AssignmentDetail Component - Direct Test</Title>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                  Testing component with router context (go to /dev and navigate)
                </p>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#999' }}>
                Note: AssignmentDetail requires route params from /student/assignments/$id
              </p>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
