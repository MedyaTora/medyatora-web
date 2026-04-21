'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const statuses = ['pending', 'in_review', 'contacted', 'completed']

export default function StatusSelect({
  id,
  initialStatus,
}: {
  id: string
  initialStatus: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const updateStatus = async (nextStatus: string) => {
    setStatus(nextStatus)

    const res = await fetch('/api/update-analysis-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    })

    if (!res.ok) {
      alert('Durum güncellenemedi')
      setStatus(initialStatus)
      return
    }

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => updateStatus(e.target.value)}
      className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm"
    >
      {statuses.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  )
}