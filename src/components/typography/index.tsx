import { oxanium, quicksand } from "@/utils/fonts"
import { ReactNode } from "react"
import styles from "./typogragphy.module.css"

type TypographyElement = "p" | "h1" | "small"
type TypographyElementSize = "small" | "medium" | "large"
type FontFamilly = "oxanium" | "quicksand"

type TypographyProps = {
    children: ReactNode
    element?: TypographyElement
    size?: TypographyElementSize
    font?: FontFamilly
    className?: string
}

export default function Typography({
    children,
    element = "p",
    size = "medium",
    font = "quicksand",
    className
}: TypographyProps) {
    const fontFamilly = font === "quicksand" ? quicksand.className : oxanium.className
    const fontSize = styles[size]

    switch (element) {
        case "p":
            return <p className={`${fontFamilly} ${fontSize} ${className}`}>
                {children}
            </p>
        case "small":
            return <small className={`${fontFamilly} ${fontSize} ${className}`}>
                {children}
            </small>
        case "h1":
            return <h1 className={`${fontFamilly} ${fontSize} ${className}`}>
                {children}
            </h1>
        default:
            return <p>
                {children}
            </p>
    }
}
