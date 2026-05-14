import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { tradeId, adminId, admin_note } = body

    /* ---------------- GET TRADE ---------------- */
    const { data: trade, error } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single()

    if (error || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    /* ---------------- UPDATE TRADE ---------------- */
    await supabaseAdmin
      .from('trades')
      .update({
        status: 'rejected',
        admin_note,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', tradeId)

    /* ---------------- CREATE TRANSACTION ---------------- */
    await supabaseAdmin.from('transactions').insert({
      user_id: trade.user_id,
      trade_id: trade.id,
      type: 'giftcard',
      amount: 0,
      status: 'failed',
      description: `${trade.card_name} trade rejected`,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.log(err)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
