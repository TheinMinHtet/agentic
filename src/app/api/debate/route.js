import { NextResponse } from 'next/server';
import { debateGraph } from '../../../agents/debateOrchestrator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { state, threadConfig } = body;
    const result = await debateGraph.invoke(state, threadConfig);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API debate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
