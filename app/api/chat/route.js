import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client with your API key from environment variables
// This key should be stored in a .env.local file in your project's root.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { prompt, history } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.sender === 'You' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      // A strong system instruction helps the model stay in character
      systemInstruction: {
        parts: [{
          text: "You are Sora, a kind, empathetic, and encouraging anime-style pet companion for a teenager. Your responses should be short, supportive, and use friendly, relatable language. Avoid clinical jargon. If the user expresses a severe struggle or crisis, gently suggest they seek professional help from a counselor or trusted adult."
        }]
      }
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: 'Failed to get response from Gemini API.' },
      { status: 500 }
    );
  }
}