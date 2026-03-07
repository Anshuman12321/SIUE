import { MOCK_GROUP_MEMBERS } from '@/data/mockData'
import { MemberCard } from './MemberCard'
import { Flex } from '@/components/layout'
import { Text } from '@/components/ui'

export function GroupMembersTab() {
  return (
    <div>
      <Text as="h2" size="lg" weight="semibold" style={{ marginBottom: 'var(--spacing-lg)' }}>
        Group Members
      </Text>
      <Flex gap="lg" wrap>
        {MOCK_GROUP_MEMBERS.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </Flex>
    </div>
  )
}
