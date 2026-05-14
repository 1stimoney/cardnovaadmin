/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'

import { Card, CardContent } from '@/components/ui/card'

import { Button } from '@/components/ui/button'

export default function AdminTradesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trades, setTrades] = useState<any[]>([])

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingTrade, setEditingTrade] = useState<any | null>(null)

  const [finalAmount, setFinalAmount] = useState('')
  const [finalRate, setFinalRate] = useState('')
  const [adminNote, setAdminNote] = useState('')

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/admin/trades')

      const data = await res.json()

      setTrades(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to fetch trades')
    }
  }

  useEffect(() => {
    fetchTrades()

    // realtime-like polling
    const interval = setInterval(fetchTrades, 3000)

    return () => clearInterval(interval)
  }, [])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)

    toast.success('Code copied')
  }

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url)

      const blob = await response.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')

      a.href = blobUrl
      a.download = 'trade-image.jpg'

      document.body.appendChild(a)

      a.click()

      a.remove()

      window.URL.revokeObjectURL(blobUrl)

      toast.success('Download started')
    } catch {
      toast.error('Failed to download image')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEdit = (trade: any) => {
    setEditingTrade(trade)

    setFinalAmount(
      trade.final_amount?.toString() || trade.amount?.toString() || '',
    )

    setFinalRate(trade.final_rate?.toString() || trade.rate?.toString() || '')

    setAdminNote(trade.admin_note || '')
  }

  const approveTrade = async () => {
    if (!editingTrade) return

    const res = await fetch('/api/admin/trades/update', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        id: editingTrade.id,
        status: 'approved',
        final_amount: Number(finalAmount),
        final_rate: Number(finalRate),
        admin_note: adminNote,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Failed to approve trade')
      return
    }

    toast.success('Trade approved')

    setEditingTrade(null)

    fetchTrades()
  }

  const rejectTrade = async () => {
    if (!editingTrade) return

    const res = await fetch('/api/admin/trades/update', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        id: editingTrade.id,
        status: 'rejected',
        final_amount: Number(finalAmount),
        final_rate: Number(finalRate),
        admin_note: adminNote,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Failed to reject trade')
      return
    }

    toast.success('Trade rejected')

    setEditingTrade(null)

    fetchTrades()
  }

  return (
    <div className='min-h-screen bg-slate-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>
              Trade Management
            </h1>

            <p className='text-slate-500 mt-1'>
              Manage gift card trades in realtime
            </p>
          </div>

          <div className='bg-white px-4 py-2 rounded-xl border shadow-sm'>
            <p className='text-sm text-slate-500'>Total Trades</p>

            <p className='font-bold text-lg'>{trades.length}</p>
          </div>
        </div>

        <div className='grid gap-3'>
          {trades.map((t) => (
            <Card
              key={t.id}
              className='border-0 shadow-sm rounded-2xl overflow-hidden'
            >
              <CardContent className='p-4'>
                <div className='flex flex-col lg:flex-row justify-between gap-4'>
                  {/* LEFT */}
                  <div className='flex gap-4 flex-1'>
                    {/* MULTIPLE IMAGES */}
                    {t.image_urls?.length > 0 && (
                      <div className='flex gap-2 overflow-x-auto max-w-[280px] pb-1'>
                        {t.image_urls.map((img: string, i: number) => (
                          <div
                            key={i}
                            className='relative min-w-[75px] h-[75px]'
                          >
                            <Image
                              src={img}
                              alt='trade'
                              fill
                              className='rounded-xl object-cover cursor-pointer border'
                              onClick={() => setSelectedImage(img)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* INFO */}
                    <div className='space-y-2 flex-1'>
                      <div>
                        <h2 className='font-semibold text-slate-900 text-lg'>
                          {t.card_name}
                        </h2>

                        <p className='text-sm text-slate-500'>
                          {t.country} • {t.card_type}
                        </p>
                      </div>

                      {/* USER */}
                      <div className='bg-slate-50 rounded-xl p-3 text-sm'>
                        <p className='font-medium text-slate-700'>
                          {t.user?.full_name || 'Unknown User'}
                        </p>

                        <p className='text-slate-500'>
                          {t.user?.email || 'No email'}
                        </p>

                        <p className='text-slate-400 text-xs mt-1 break-all'>
                          {t.user_id}
                        </p>
                      </div>

                      {/* TRADE VALUES */}
                      <div className='flex flex-wrap gap-3 text-sm'>
                        <div className='bg-slate-100 px-3 py-2 rounded-lg'>
                          Amount: ${t.amount}
                        </div>

                        <div className='bg-slate-100 px-3 py-2 rounded-lg'>
                          Rate: ₦{t.rate}/$
                        </div>

                        <div className='bg-slate-100 px-3 py-2 rounded-lg'>
                          Total: ₦
                          {Number(
                            t.final_total ||
                              t.expected_payout ||
                              t.amount * t.rate,
                          ).toLocaleString()}
                        </div>
                      </div>

                      {/* ECODE */}
                      {t.code && (
                        <div className='flex items-center gap-2 flex-wrap'>
                          <div className='bg-slate-100 px-3 py-2 rounded-lg text-sm max-w-[300px] truncate'>
                            {t.code}
                          </div>

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => copyCode(t.code)}
                          >
                            Copy
                          </Button>
                        </div>
                      )}

                      {/* NOTE */}
                      {t.admin_note && (
                        <div className='bg-red-50 border border-red-100 rounded-xl p-3'>
                          <p className='text-sm text-red-600'>{t.admin_note}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className='flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        t.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : t.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {t.status}
                    </span>

                    <div className='flex gap-2'>
                      <Button variant='outline' onClick={() => openEdit(t)}>
                        Edit
                      </Button>

                      <Button
                        className='bg-green-600 hover:bg-green-700'
                        onClick={() => {
                          openEdit(t)
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        variant='destructive'
                        onClick={() => {
                          openEdit(t)
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* IMAGE PREVIEW */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Trade Image Preview</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className='space-y-4'>
              <div className='relative w-full h-[500px]'>
                <Image
                  src={selectedImage}
                  alt='preview'
                  fill
                  className='object-contain rounded-xl'
                />
              </div>

              <Button
                className='w-full'
                onClick={() => downloadImage(selectedImage)}
              >
                Download Image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT / APPROVE / REJECT */}
      <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Final Amount</label>

              <Input
                type='number'
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Final Rate</label>

              <Input
                type='number'
                value={finalRate}
                onChange={(e) => setFinalRate(e.target.value)}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Admin Note</label>

              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder='Optional reason or admin note'
              />
            </div>

            <div className='grid grid-cols-2 gap-3 pt-2'>
              <Button
                className='bg-green-600 hover:bg-green-700'
                onClick={approveTrade}
              >
                Confirm Approve
              </Button>

              <Button variant='destructive' onClick={rejectTrade}>
                Confirm Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
