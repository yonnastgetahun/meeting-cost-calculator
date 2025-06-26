import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, calculationData } = await request.json();
    
    const apiSecret = process.env.CONVERTKIT_API_SECRET;
    const formId = process.env.CONVERTKIT_FORM_ID;
    
    console.log('Form ID:', formId); // Debug log
    console.log('API Secret exists:', !!apiSecret); // Debug log
    
    if (!apiSecret || !formId) {
      return NextResponse.json(
        { error: 'ConvertKit credentials not configured' },
        { status: 500 }
      );
    }

    // Try the newer ConvertKit API endpoint
    const convertKitResponse = await fetch(`https://api.kit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_secret: apiSecret,
        email: email,
        tags: ['meeting-calculator-lead']
      }),
    });

    const responseText = await convertKitResponse.text();
    console.log('ConvertKit response:', responseText); // Debug log

    if (!convertKitResponse.ok) {
      console.error('ConvertKit error:', responseText);
      return NextResponse.json(
        { error: 'Failed to subscribe: ' + responseText },
        { status: 400 }
      );
    }

    const result = JSON.parse(responseText);
    
    return NextResponse.json({ 
      success: true, 
      subscriber: result 
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}