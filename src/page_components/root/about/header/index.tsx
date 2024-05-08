import Link from "@/components/link";
import Image from "next/image";
import styles from "./header.module.css"

export default function Header() {
    return (
        <header className={styles.header}>
            <div>
                <Image
                    src="/full_logo.png"
                    alt="logo"
                    width={159}
                    height={21}
                />
            </div>
            <div>
                <Link target="projects" text="PROJETOS" className={styles.link} />
                <Link target="team" text="TIME" className={styles.link} />
                <Link target="contact" text="CONTATO" className={styles.link} />
            </div>
        </header>
    )
}
