import { NextResponse, NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  if (url.pathname == "/") {
    url.pathname = "/presale"
    return NextResponse.redirect(url)
  }

  NextResponse.next()
}
