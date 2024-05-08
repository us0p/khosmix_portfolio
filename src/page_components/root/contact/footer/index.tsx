import { ContactInfos, ContactInfosImages } from "./contact-element"
import styles from "./footer-elements.module.css"

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WPP_NUMBER

export default function Footer() {
    return (
        <div className={styles.footer}>
            <ContactInfos
                title="Contatos"
                contacts={[
                    { title: "E-mail", url: "mailto:khosmixstudio@gmail.com" },
                    { title: "Discord", url: "https://discord.gg/eX3CKNV9BT" },
                    { title: "Whats App", url: `https://wa.me/${PHONE_NUMBER}`}
                ]}
            />
            <ContactInfosImages
                title="Siga-nos"
                contacts={[
                    {title: "Instagram", icon: "ig", url: "https://www.instagram.com/khosmixstudio/"},
                    {title: "X", icon: "x", url: "https://twitter.com/khosmix28328"},
                    {title: "Linkeding", icon: "ln", url: "https://www.linkedin.com/in/khosmix-studio-3b40592b5/"},
                ]}
            />
        </div>
    )
}
