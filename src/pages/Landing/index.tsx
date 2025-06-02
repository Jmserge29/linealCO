import { NavBar } from "../../components/Navbar"
import { SectionAbout } from "./Sections/section-about"
import { SectionContributors } from "./Sections/section-contributors"
import { SectionHome } from "./Sections/section-home"

export const LandingPage = () => {
  return (
    <main className="flex flex-col items-center justify-center w-full h-full">
      <NavBar />
      <SectionHome/>
      <SectionAbout/>
      <SectionContributors/>
    </main >
  )
}

