/* eslint-disable react-hooks/immutability */
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Eye,
  XCircle,
} from 'lucide-react'

type Trade = {
  id: string
  card_name: string
  card_type: string
  amount: number
  rate: number
  status: string
  code: string | null
  image_urls: string[]
  country: string
  created_at: string
  user?: {
    id: string
    full_name?: string
    username?: string
    email?: string
  }
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchTrades()
  }, [])

  const fetchTrades = async () => {
    const res = await fetch('/api/trades')
    const data = await res.json()

    setTrades(Array.isArray(data) ? data : [])
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    alert('E-code copied')
  }

  return (
    <div className='min-h-screen bg-slate-100 p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900'>Trade Management</h1>

        <p className='mt-1 text-slate-500'>Manage user gift card trades</p>
      </div>

      <div className='grid gap-5'>
        {trades.map((trade) => (
          <div
            key={trade.id}
            className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'
          >
            <div className='flex flex-col gap-5 lg:flex-row lg:justify-between'>
              {/* LEFT */}
              <div className='flex-1'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h2 className='text-2xl font-bold text-slate-900'>
                    {trade.card_name}
                  </h2>

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      trade.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : trade.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {trade.status}
                  </div>
                </div>

                {/* DETAILS */}
                <div className='mt-4 grid gap-2 text-sm text-slate-600'>
                  <p>
                    <span className='font-semibold text-slate-900'>
                      Country:
                    </span>{' '}
                    {trade.country}
                  </p>

                  <p>
                    <span className='font-semibold text-slate-900'>Type:</span>{' '}
                    {trade.card_type}
                  </p>

                  <p>
                    <span className='font-semibold text-slate-900'>
                      Amount:
                    </span>{' '}
                    ${trade.amount}
                  </p>

                  <p>
                    <span className='font-semibold text-slate-900'>Rate:</span>{' '}
                    ₦{trade.rate}/$
                  </p>

                  <p>
                    <span className='font-semibold text-slate-900'>Total:</span>{' '}
                    ₦{(trade.amount * trade.rate).toLocaleString()}
                  </p>
                </div>

                {/* USER */}
                <div className='mt-5 rounded-2xl bg-slate-50 p-4'>
                  <h3 className='mb-3 text-sm font-bold text-slate-900'>
                    Uploaded By
                  </h3>

                  <div className='space-y-2 text-sm text-slate-600'>
                    <p>
                      <span className='font-semibold text-slate-900'>
                        Name:
                      </span>{' '}
                      {trade.user?.full_name || 'N/A'}
                    </p>

                    <p>
                      <span className='font-semibold text-slate-900'>
                        Username:
                      </span>{' '}
                      {trade.user?.username || 'N/A'}
                    </p>

                    <p>
                      <span className='font-semibold text-slate-900'>
                        Email:
                      </span>{' '}
                      {trade.user?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* ECODE */}
                {trade.code && (
                  <div className='mt-5'>
                    <p className='mb-2 text-sm font-semibold text-slate-900'>
                      E-Code
                    </p>

                    <div className='flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                      <span className='break-all text-sm text-slate-700'>
                        {trade.code}
                      </span>

                      <button
                        onClick={() => copyCode(trade.code!)}
                        className='flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100'
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* IMAGES */}
                {trade.image_urls?.length > 0 && (
                  <div className='mt-5'>
                    <p className='mb-3 text-sm font-semibold text-slate-900'>
                      Uploaded Images
                    </p>

                    <div className='flex flex-wrap gap-3'>
                      {trade.image_urls.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setPreview(img)}
                          className='group relative overflow-hidden rounded-2xl'
                        >
                          <Image
                            src={img}
                            alt='trade image'
                            width={120}
                            height={120}
                            className='h-[120px] w-[120px] object-cover transition group-hover:scale-105'
                          />

                          <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100'>
                            <Eye className='text-white' size={22} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className='flex flex-row gap-3 lg:flex-col'>
                <button className='flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700'>
                  <CheckCircle2 size={18} />
                  Approve
                </button>

                <button className='flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700'>
                  <XCircle size={18} />
                  Reject
                </button>

                <button className='flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600'>
                  <Clock3 size={18} />
                  Pending
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IMAGE MODAL */}
      {preview && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6'>
          <div className='relative max-w-5xl'>
            <button
              onClick={() => setPreview(null)}
              className='absolute right-0 top-0 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black'
            >
              Close
            </button>

            <Image
              src={preview}
              alt='preview'
              width={1200}
              height={1200}
              className='max-h-[85vh] rounded-3xl object-contain'
            />

            <a
              href={preview}
              target='_blank'
              className='mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-slate-900'
            >
              <Download size={18} />
              Download Image
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
