import { NextRequest, NextResponse } from 'next/server';

import { Button, Section, Tailwind, Text } from '@react-email/components';
import { createClient } from '@/providers/supabase/server-role';
import EmailTemplate from '@/lib/email-template';
import { resend } from '@/providers/resend-provider';

export async function POST(req: NextRequest) {
  const { registrationId, user_id } = await req.json();

  const supabase = await createClient();

  // Update Registration to paid === true
  // FIXME ANY
  const { data, error } = await supabase
    .from('registrations')
    .update({ paid: true })
    .eq('id', registrationId)
    .select('*, session_id(telegram)')
    .single();

  if (error) {
    NextResponse.json({ error: error.message }, { status: 500 });
    console.error('error in registration update line 20', error.message);
    return;
  }

  // SEND Email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  if (userError) {
    console.error('error in user query', userError.message);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { full_name, email, locale: userLocale } = userData;
  const locale: string = userLocale ?? 'en';

  // Build email body based on locale
  function BodyCreation() {
    return (
      <Tailwind>
        {/* ENGLISH */}
        {locale === 'en' && (
          <>
            <Section>
              <Text className="text-center">
                Your payment has been accepted.
              </Text>
            </Section>
            {data!.session_id?.telegram && (
              <Section className="text-center">
                <Button
                  className="cursor-pointer rounded-sm bg-[#B9795D] px-6 py-3 font-semibold text-white"
                  href={data!.session_id.telegram}
                >
                  Access to the course
                </Button>
              </Section>
            )}
          </>
        )}

        {/* FRENCH */}
        {locale === 'fr' && (
          <>
            <Section className="">
              <Text className="text-center">Votre paiement a été accepté.</Text>
            </Section>
            {data!.session_id?.telegram && (
              <Section className="text-center">
                <Button
                  className="cursor-pointer rounded-sm bg-[#B9795D] px-6 py-3 font-semibold text-white"
                  href={data!.session_id.telegram}
                >
                  Accéder à la classe
                </Button>
              </Section>
            )}
          </>
        )}

        {/* ARABIC */}
        {locale === 'ar' && (
          <>
            <Section>
              <Text
                style={{ direction: 'rtl', fontSize: '16px' }}
                className="text-center"
              >
                تم قبول الدفع الخاص بك.
              </Text>
            </Section>
            {data!.session_id?.telegram && (
              <Section className="text-center">
                <Button
                  className="cursor-pointer rounded-sm bg-[#B9795D] px-6 py-3 font-semibold text-white"
                  href={data!.session_id.telegram}
                >
                  الوصول إلى الفصل
                </Button>
              </Section>
            )}
          </>
        )}
      </Tailwind>
    );
  }

  type Subject = {
    fr: string;
    en: string;
    ar: string;
  };

  const subject: Subject = {
    fr: `Markaz Shaafii - Paiement accepté`,
    en: `Markaz Shaafii - Payment Accepted`,
    ar: `مركز الشافعي -  تم الدفع`,
  };

  // FIXME ANY
  const mailData = {
    from: process.env.MAIL_USER!,
    to: email!,
    bcc: 'markaz.shaafii@gmail.com',
    subject: subject[locale as keyof Subject] as string,
    react: (
      <EmailTemplate
        title={subject[locale as keyof Subject] as string} // Can be localized
        body={BodyCreation()}
      />
    ),
  };

  try {
    const sendResult = await resend.emails.send(mailData);
    return NextResponse.json(
      { message: 'Email sent successfully', sendResult },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Now you can safely access error.message because you've checked that it's an Error
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // Handle cases where the error is not an Error instance
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
