import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, calculationData } = await request.json();
    
    // Add your email service integration here (e.g., ConvertKit, Mailchimp, etc.)
    // Example for ConvertKit:
    /*
    const response = await fetch(`https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email,
        fields: {
          meeting_cost: calculationData.total,
          attendees: calculationData.attendees,
          duration: calculationData.duration,
        },
      }),
    });
    */
    
    // For now, just log it
    console.log('New subscriber:', email, calculationData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}