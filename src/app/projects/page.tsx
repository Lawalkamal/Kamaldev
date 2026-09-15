import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import AllProjects from "@/components/AllProjects";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "All Projects | Kamal. — Web Developer & UI Designer",
  description:
    "Browse the full portfolio of web development and UI design projects by Kamal Lawal.",
};

export default function ProjectsPage() {
  return (
    <div className="relative">
      <Navigation />
      <main>
        <PageTransition>
          <AllProjects />
        </PageTransition>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
