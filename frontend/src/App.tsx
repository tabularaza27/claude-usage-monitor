import React, { useState } from 'react'
import Layout from './components/common/Layout'
import PersonalTab from './components/tabs/PersonalTab'
import TeamTab from './components/tabs/TeamTab'
import { useWebSocket } from './hooks/useWebSocket'

type TabType = 'personal' | 'team'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { isConnected, lastMessage } = useWebSocket()

  // Update last update time when we receive new data
  React.useEffect(() => {
    if (lastMessage?.type === 'usage-update') {
      setLastUpdate(new Date())
    }
  }, [lastMessage])

  const tabs = [
    { id: 'personal' as TabType, name: 'Personal Usage', icon: '👤' },
    { id: 'team' as TabType, name: 'Team Usage', icon: '👥' }
  ]

  return (
    <Layout title="Claude Usage & Environmental Impact Monitor" lastUpdate={lastUpdate}>
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg transition-colors
                ${activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'personal' && <PersonalTab />}
          {activeTab === 'team' && <TeamTab />}
        </div>
      </div>
    </Layout>
  )
}

export default App