import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Log received data to terminal
    console.log('📥 Received form data:', body)
    console.log('  URL:', body.url)
    console.log('  Question:', body.question)
    
    // TODO: enqueue in real queue / persist to DB. For now echo back.
    const created = {
      id: Date.now().toString(),
      ...body,
      status: 'queued',
      createdAt: new Date().toISOString(),
    }
    
    console.log('✅ Created task:', created)
    
    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (err) {
    console.error('❌ Error processing request:', err)
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}
