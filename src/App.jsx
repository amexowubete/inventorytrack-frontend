import React, { useEffect, useState } from 'react'
import { API_BASE } from './api'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', sku: '', currentStock: 0, reorderLevel: 0 })
  const [trans, setTrans] = useState({ type: 'IN', productId: '', quantity: 1 })
  const [error, setError] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/products`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      console.error('Failed to fetch', e)
      setError('Failed to load products. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function addProduct(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ name: '', sku: '', currentStock: 0, reorderLevel: 0 })
      await fetchProducts()
    } catch (e) {
      console.error('addProduct error', e)
      setError('Failed to add product. See console for details.')
    }
  }

  async function recordTransaction(e) {
    e.preventDefault()
    setError(null)
    if (!trans.productId) {
      setError('Select a product first.')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trans)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTrans({ type: 'IN', productId: '', quantity: 1 })
      await fetchProducts()
    } catch (e) {
      console.error('recordTransaction error', e)
      setError('Failed to record transaction. See console for details.')
    }
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>InventoryTrack — Simple</h1>

      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}

      <section style={{ marginBottom: 20 }}>
        <h2>Products</h2>
        {loading ? <div>Loading...</div> : (
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>ID</th><th>SKU</th><th>Name</th><th>Stock</th><th>Reorder</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="5">No products yet</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.currentStock}</td>
                  <td>{p.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Add product</h2>
        <form onSubmit={addProduct}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={{ marginLeft: 8 }} />
          <input type="number" placeholder="Stock" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: parseInt(e.target.value) || 0 })} style={{ marginLeft: 8 }} />
          <input type="number" placeholder="Reorder" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: parseInt(e.target.value) || 0 })} style={{ marginLeft: 8 }} />
          <button style={{ marginLeft: 8 }} type="submit" disabled={loading}>Add</button>
        </form>
      </section>

      <section>
        <h2>Record transaction (IN / OUT)</h2>
        <form onSubmit={recordTransaction}>
          <select value={trans.type} onChange={e => setTrans({ ...trans, type: e.target.value })}>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>

          <select
            value={trans.productId || ''}
            onChange={e => setTrans({ ...trans, productId: e.target.value === '' ? '' : Number(e.target.value) })}
            style={{ marginLeft: 8 }}
          >
            <option value="">-- select product --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.currentStock})</option>)}
          </select>

          <input type="number" value={trans.quantity} onChange={e => setTrans({ ...trans, quantity: parseInt(e.target.value) || 1 })} style={{ marginLeft: 8, width: 80 }} />
          <button style={{ marginLeft: 8 }} type="submit" disabled={loading}>Record</button>
        </form>
      </section>
    </div>
  )
}