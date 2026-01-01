import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) return NextResponse.json([]);

  try {
    // mid=A21TJRUUN4KGV is the marketplace ID (can vary, but this is a standard one)
    // alias=aps tells Amazon to search "All Departments"
    const response = await fetch(
      `https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${encodeURIComponent(q)}&mid=ATVPDKIKX0DER&alias=aps`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124'
        }
      }
    );

    const data = await response.json();

    // Amazon returns an object with a "suggestions" key containing objects.
    // We map it to return only the "value" string (e.g., "iphone 15 case")
    const productSuggestions = data.suggestions.map((item) => item.value);

    return NextResponse.json(productSuggestions);
  } catch (error) {
    console.error("Ecommerce Fetch Error:", error);
    return NextResponse.json([]);
  }
}