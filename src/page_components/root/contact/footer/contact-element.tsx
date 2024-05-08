import Typography from "@/components/typography"
import Image from "next/image"
import styles from "./footer-elements.module.css"
import { quicksand } from "@/utils/fonts"
import { FiInstagram, FiTwitter } from "react-icons/fi"
import { CiLinkedin } from "react-icons/ci"

type ContactLinks = { title: string, url: string }

type ContactLinkProps = {
    title: string
    contacts: ContactLinks[]
}

export function ContactInfos({ title, contacts }: ContactLinkProps) {
    return (
        <div>
            <Typography size="medium">{title}</Typography>
            <div className={styles.line}/>
            <div className={styles.contacts}>
                {contacts.map(contact => {
                    return <a
                        href={contact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.link} ${quicksand.className}`}
                    >
                        {contact.title}
                    </a>
                })}
            </div>
        </div>
    )
}

type AvailableIcons = "ig" | "x" | "ln"

type ContactImages = { icon: AvailableIcons, url: string, title: string}

type ContactImageProps = {
    title: string
    contacts: ContactImages[]
}

export function ContactInfosImages({title, contacts}: ContactImageProps) {
    return (
        <div>
            <Typography size="small">{title}</Typography>
            <div className={styles.line}/>
            <div className={styles.contactImages}>
                {contacts.map(contact => {
                    return <a
                        href={contact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className={styles.iconBox}>
                            {getIcon(contact.icon)}
                        </div>
                    </a>
                })}
            </div>
        </div>
    )
}

function getIcon(icon: AvailableIcons) {
    switch(icon) {
        case "ig":
            return <FiInstagram color="#fff" size={25}/>
        case "x":
            return <FiTwitter color="#fff" size={25}/>
        case "ln":
            return <CiLinkedin color="#fff" size={25}/>
        default:
            return <div/>
    }
}
