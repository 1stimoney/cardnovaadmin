import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    /* ---------------- GET TRADES ---------------- */
    const { data: trades, error } = await supabaseAdmin
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    /* ---------------- GET COUNTRIES ---------------- */
    const cardNames = [...new Set(trades.map((t) => t.card_name))]

    const { data: giftCards } = await supabaseAdmin
      .from('gift_cards')
      .select('name, country')
      .in('name', cardNames)

    /* ---------------- GET USERS ---------------- */
    const userIds = [...new Set(trades.map((t) => t.user_id))]

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('id', userIds)

    /* ---------------- MERGE ---------------- */
    const finalTrades =
      trades.map((trade) => {
        const matchedCard = giftCards?.find((c) => c.name === trade.card_name)

        const matchedUser = users?.find((u) => u.id === trade.user_id)

        return {
          ...trade,
          country: matchedCard?.country || 'N/A',
          user: matchedUser || null,
        }
      }) || []

    return NextResponse.json(finalTrades)
  } catch (err) {
    console.log(err)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
