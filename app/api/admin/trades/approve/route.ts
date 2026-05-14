import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { tradeId, adminId, final_amount, final_rate, admin_note } = body

    const final_total = Number(final_amount) * Number(final_rate)

    /* ---------------- GET TRADE ---------------- */
    const { data: trade, error: tradeError } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single()

    if (tradeError || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    /* ---------------- GET USER ---------------- */
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', trade.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    /* ---------------- UPDATE TRADE ---------------- */
    const { error: updateTradeError } = await supabaseAdmin
      .from('trades')
      .update({
        status: 'approved',
        final_amount,
        final_rate,
        final_total,
        admin_note,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', tradeId)

    if (updateTradeError) {
      return NextResponse.json(
        { error: updateTradeError.message },
        { status: 500 },
      )
    }

    /* ---------------- UPDATE USER BALANCE ---------------- */
    const currentBalance = Number(user.wallet_balance || 0)

    const { error: walletError } = await supabaseAdmin
      .from('users')
      .update({
        wallet_balance: currentBalance + final_total,
      })
      .eq('id', trade.user_id)

    if (walletError) {
      return NextResponse.json({ error: walletError.message }, { status: 500 })
    }

    /* ---------------- CREATE TRANSACTION ---------------- */
    await supabaseAdmin.from('transactions').insert({
      user_id: trade.user_id,
      trade_id: trade.id,
      type: 'giftcard',
      amount: final_total,
      status: 'success',
      description: `${trade.card_name} trade approved`,
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
