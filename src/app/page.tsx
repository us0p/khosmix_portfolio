import About from "@/page_components/root/about";
import Projects from "@/page_components/root/projects";
import Team from "@/page_components/root/team";
import Contact from "@/page_components/root/contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Khosmix Portifolio",
    icons: {
        icon: "/logo.ico"
    }
}

export default function Home() {
    return (
        <>
            <About />
            <Projects />
            <Team />
            <Contact />
        </>
    );
}
