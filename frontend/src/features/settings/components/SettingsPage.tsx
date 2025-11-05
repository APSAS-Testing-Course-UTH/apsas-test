/**
 * SettingsPage Component
 * Main container for user settings with tabs
 */

import { Container, Paper, Title, Tabs } from '@mantine/core'
import { IconSettings, IconBell } from '@tabler/icons-react'
import { GeneralSettings } from './GeneralSettings'
import { NotificationSettings } from './NotificationSettings'
import { PAGE_TITLE, SECTION_TITLES } from '../types'

export function SettingsPage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="xl">{PAGE_TITLE}</Title>

      <Paper withBorder shadow="sm" p="lg">
        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab 
              value="general" 
              leftSection={<IconSettings size={16} />}
            >
              {SECTION_TITLES.general}
            </Tabs.Tab>
            <Tabs.Tab 
              value="notifications" 
              leftSection={<IconBell size={16} />}
            >
              {SECTION_TITLES.notifications}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="lg">
            <GeneralSettings />
          </Tabs.Panel>

          <Tabs.Panel value="notifications" pt="lg">
            <NotificationSettings />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  )
}
