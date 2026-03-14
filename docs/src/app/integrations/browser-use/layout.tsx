import { pageMetadata } from "@/lib/page-metadata"
export const metadata = pageMetadata("integrations/browser-use")
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
