import { oxanium } from "@/utils/fonts"
import styles from "./link.module.css"

type LinkProps = {
    text: string
    isAnchor?: boolean
    target: string
    className?: string 
}

export default function Link({ text, isAnchor = true, target, className}: LinkProps) {
    return (
        <a
            className={`${styles.link} ${oxanium.className} ${className}`}
            href={isAnchor ? `#${target}` : target}
        >
            {text}
        </a>
    )
}
