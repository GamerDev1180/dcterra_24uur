import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/decor"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <PageHero
        eyebrow="Pagina niet gevonden"
        title="Deze wens kunnen we helaas niet vervullen"
        intro="De pagina die je zoekt bestaat niet (meer). Ga terug naar de homepagina om verder te kijken."
      />
      <div className="flex justify-center pb-8">
        <Button asChild size="xl">
          <Link href="/">Naar de homepagina</Link>
        </Button>
      </div>
      <Footer />
    </div>
  )
}
