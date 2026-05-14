/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Plus, Pencil, Trash2, CreditCard, Search } from 'lucide-react'

type GiftCard = {
  id: string
  name: string
  country: string
  type: string
  rate: number
  image_url?: string | null
  min_amount?: number | null
  max_amount?: number | null
  active: boolean
  created_at?: string
}

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GiftCard | null>(null)

  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | 'ecode' | 'physical'>('all')

  // form
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [type, setType] = useState('ecode')
  const [rate, setRate] = useState('1')
  const [image, setImage] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  // fetch cards
  const fetchCards = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false })

    setCards(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCards()
  }, [])

  // reset form
  const reset = () => {
    setName('')
    setCountry('')
    setType('ecode')
    setRate('1')
    setImage('')
    setMinAmount('')
    setMaxAmount('')
    setEditing(null)
  }

  // open edit
  const openEdit = (card: GiftCard) => {
    setEditing(card)

    setName(card.name)
    setCountry(card.country)
    setType(card.type)
    setRate(String(card.rate))
    setImage(card.image_url || '')
    setMinAmount(String(card.min_amount ?? ''))
    setMaxAmount(String(card.max_amount ?? ''))

    setOpen(true)
  }

  // save (create/update)
  const save = async () => {
    const payload = {
      name,
      country,
      type,
      rate: Number(rate),
      image_url: image || null,
      min_amount: Number(minAmount || 0),
      max_amount: Number(maxAmount || 0),
    }

    if (editing) {
      await supabase.from('gift_cards').update(payload).eq('id', editing.id)
      toast.success('Gift card updated')
    } else {
      await supabase.from('gift_cards').insert(payload)
      toast.success('Gift card created')
    }

    setOpen(false)
    reset()
    fetchCards()
  }

  // delete
  const remove = async (id: string) => {
    await supabase.from('gift_cards').delete().eq('id', id)
    toast.success('Deleted')
    fetchCards()
  }

  // filter
  const filtered = useMemo(() => {
    let list = [...cards]

    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    }

    if (tab === 'ecode') {
      list = list.filter((c) => c.type === 'ecode' || c.type === 'both')
    }

    if (tab === 'physical') {
      list = list.filter((c) => c.type === 'physical' || c.type === 'both')
    }

    return list
  }, [cards, q, tab])

  return (
    <div className='max-w-6xl mx-auto py-10 px-4 space-y-6'>
      {/* HEADER */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <CreditCard className='w-6 h-6 text-blue-600' />
            Gift Cards
          </h1>
          <p className='text-sm text-gray-500'>
            Manage tradeable gift card catalog
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={reset}>
              <Plus className='w-4 h-4 mr-2' />
              Add Card
            </Button>
          </DialogTrigger>

          {/* MODAL */}
          <DialogContent className='bg-white max-w-md'>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Gift Card' : 'Add Gift Card'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-3'>
              <div>
                <label className='text-sm'>Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className='text-sm'>Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div>
                <label className='text-sm'>Type</label>
                <select
                  className='w-full border p-2 rounded'
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value='ecode'>E-Code</option>
                  <option value='physical'>Physical</option>
                  <option value='both'>Both</option>
                </select>
              </div>

              <div>
                <label className='text-sm'>Rate</label>
                <Input
                  type='number'
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>

              <div>
                <label className='text-sm'>Min Amount</label>
                <Input
                  type='number'
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>

              <div>
                <label className='text-sm'>Max Amount</label>
                <Input
                  type='number'
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>

              <div>
                <label className='text-sm'>Image URL</label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <Button className='w-full' onClick={save}>
                {editing ? 'Update Card' : 'Create Card'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH + FILTER */}
      <div className='flex flex-col md:flex-row gap-3 md:items-center md:justify-between'>
        <div className='relative w-full md:max-w-sm'>
          <Search className='absolute left-3 top-3 w-4 h-4 text-gray-400' />
          <Input
            placeholder='Search gift cards...'
            className='pl-9'
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='ecode'>E-Code</TabsTrigger>
            <TabsTrigger value='physical'>Physical</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* GRID */}
      {loading ? (
        <p className='text-center text-gray-500'>Loading...</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filtered.map((card) => (
            <Card key={card.id} className='overflow-hidden'>
              {/* IMAGE */}
              <div className='h-40 bg-gray-50 flex items-center justify-center'>
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    className='h-full w-full object-contain p-4'
                  />
                ) : (
                  <span className='text-gray-400 text-sm'>No Image</span>
                )}
              </div>

              <CardContent className='p-4 space-y-3'>
                <div className='flex justify-between'>
                  <h3 className='font-bold'>{card.name}</h3>
                  <Badge>{card.type}</Badge>
                </div>

                <p className='text-sm text-gray-500'>{card.country}</p>

                <div className='flex flex-wrap gap-2'>
                  <Badge variant='secondary'>Rate: ₦{card.rate}/$</Badge>

                  <Badge variant='secondary'>
                    Min: ${card.min_amount ?? 0}
                  </Badge>

                  <Badge variant='secondary'>
                    Max: ${card.max_amount ?? 0}
                  </Badge>
                </div>

                <div className='flex gap-2 pt-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => openEdit(card)}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>

                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => remove(card.id)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
