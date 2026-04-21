'use client'

import { useState } from 'react'

export default function AnalysisForm() {
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    account_link: '',
    account_type: '',
    content_type: '',
    daily_post_count: '',
    coupon_code: '',
    main_problem: '',
    main_missing: '',
    contact_type: '',
    contact_value: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/analysis-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Bir hata oluştu')
      }

      setMessage('Başvurunuz alındı. Analiz ekibimiz sizinle 24 saat içinde iletişime geçecektir.')
      setForm({
        full_name: '',
        username: '',
        account_link: '',
        account_type: '',
        content_type: '',
        daily_post_count: '',
        coupon_code: '',
        main_problem: '',
        main_missing: '',
        contact_type: '',
        contact_value: '',
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-3xl font-bold mb-4">Ücretsiz Analiz Fırsatı</h2>
      <p className="text-white/70 mb-6">
        ANALIZ100 kodu ile analiz başvurunu ücretsiz oluştur. Formu doldur, ekibimiz inceleyip sana dönüş yapsın.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="Ad soyad"
        />
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="Instagram kullanıcı adınız"
        />
        <input
          name="account_link"
          value={form.account_link}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="Hesap linkiniz"
        />
        <input
          name="account_type"
          value={form.account_type}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="Hesap türünüz"
        />
        <input
          name="content_type"
          value={form.content_type}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="İçerik türünüz"
        />
        <input
          name="daily_post_count"
          value={form.daily_post_count}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="Günlük kaç video atıyorsunuz?"
        />
        <input
          name="coupon_code"
          value={form.coupon_code}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          placeholder="Kupon kodunuz"
        />
        <select
          name="contact_type"
          value={form.contact_type}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3"
        >
          <option value="">İletişim türü seçin</option>
          <option value="telegram">Telegram</option>
          <option value="instagram">Instagram</option>
          <option value="email">E-posta</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <input
        name="contact_value"
        value={form.contact_value}
        onChange={handleChange}
        className="mt-4 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
        placeholder="İletişim bilginiz"
      />

      <textarea
        name="main_problem"
        value={form.main_problem}
        onChange={handleChange}
        className="mt-4 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 min-h-[120px]"
        placeholder="Genel sorununuz nedir?"
      />

      <textarea
        name="main_missing"
        value={form.main_missing}
        onChange={handleChange}
        className="mt-4 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 min-h-[120px]"
        placeholder="En büyük eksiğiniz nedir?"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 px-6 py-3 rounded-2xl bg-white text-black font-semibold disabled:opacity-60"
      >
        {loading ? 'Gönderiliyor...' : 'Analiz Başvurusu Gönder'}
      </button>

      {message && <p className="mt-4 text-sm text-white/80">{message}</p>}
    </form>
  )
}