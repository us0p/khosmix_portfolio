import { oxanium } from "@/utils/fonts"
import styles from "./contact-button.module.css"
const CONTACT_TEXT = "Olá!%20Gostaria%20de%20saber%20mais%20sobre%20seus%20projetos"
const PHONE_NUMBER = process.env.NEXT_PUBLIC_WPP_NUMBER
const WPP_URL = `https://wa.me/${PHONE_NUMBER}/?text=${CONTACT_TEXT}`

export default function ContactButton() {
    return <a
        href={WPP_URL}
        rel="noreferrer noopener"
        target="_blank"
        className={`${styles.contactButton} ${oxanium.className}`}
    >
        Contactar
    </a>
}
