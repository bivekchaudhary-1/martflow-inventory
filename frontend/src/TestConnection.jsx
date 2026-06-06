import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function TestConnection() {
  const [status, setStatus] = useState('Testing...')
  const [data, setData] = useState(null)

  useEffect(() => {
    async function test() {
      try {
        // Test fetching categories
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(5)
        
        if (error) throw error
        
        setStatus('✅ Connected!')
        setData(data)
      } catch (err) {
        setStatus(`❌ Error: ${err.message}`)
      }
    }
    
    test()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="mb-4 text-lg">{status}</div>
      {data && (
        <div>
          <h2 className="font-semibold mb-2">Categories:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
