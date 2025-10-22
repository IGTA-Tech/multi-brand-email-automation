export const metadata = {
  title: 'Multi-Brand Email Automation',
  description: 'AI-powered email campaigns with intelligent frequency controls',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
