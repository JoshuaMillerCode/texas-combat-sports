import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Texas Combat Dolls - Ring Girls | Texas Combat Sports",
  description: "Meet the Texas Combat Dolls - the talented ring girls who bring glamour, elegance, and energy to every fight night. Professional, athletic, and ambassadors of combat sports.",
  openGraph: {
    title: "Texas Combat Dolls - Ring Girls | Texas Combat Sports",
    description: "Meet the Texas Combat Dolls - the talented ring girls who bring glamour, elegance, and energy to every fight night.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Texas Combat Dolls - Ring Girls | Texas Combat Sports",
    description: "Meet the Texas Combat Dolls - the talented ring girls who bring glamour, elegance, and energy to every fight night.",
  },
}

export default function DollsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
