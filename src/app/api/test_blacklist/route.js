
import { NextResponse } from 'next/server';
import { checkBlacklist } from '../../../../lib/checkBlackList';

export async function POST(req) {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ status: "error", message: 'Invalid input text'}, {status: 400});
    }

    const violations = checkBlacklist(text);

    if (Object.keys(violations).length > 0) {

        return NextResponse.json({ status: "success", data: violations}, {status: 200});
    } else {
        return NextResponse.json({ status: "success", message: 'No violations found'}, {status: 200});
    }
}
