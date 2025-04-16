import { createClient } from '@/providers/supabase/server-role';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user_email, stripe_id } = await req.json();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({ stripe_id })
      .eq('email', user_email)
      .select();

    if (error) {
      console.error('🟥 Error in update-stripe-id', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Stripe customer ID added to profile.',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Server error in update-stripe-id', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
