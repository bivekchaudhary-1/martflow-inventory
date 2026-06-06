import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function InventoryTable() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*, categories(name)')
      .order('name')
    
    if (error) {
      console.error('Error:', error)
    } else {
      setItems(data)
    }
    setLoading(false)
  }

  const sortedItems = [...items].sort((a, b) => 
    sortAsc ? a.stock_count - b.stock_count : b.stock_count - a.stock_count
  )

  if (loading) return <div className="text-center p-8">Loading inventory...</div>

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th 
                className="p-4 text-left cursor-pointer hover:bg-gray-700"
                onClick={() => setSortAsc(!sortAsc)}
              >
                Stock {sortAsc ? '↑' : '↓'}
              </th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Velocity</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">{item.categories?.name || 'Uncategorized'}</td>
                <td className={`p-4 font-semibold ${item.stock_count < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.stock_count}
                </td>
                <td className="p-4">${item.price?.toFixed(2)}</td>
                <td className="p-4">{item.location || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.velocity_status === 'fast' ? 'bg-green-100 text-green-800' :
                    item.velocity_status === 'slow' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.velocity_status || 'steady'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
