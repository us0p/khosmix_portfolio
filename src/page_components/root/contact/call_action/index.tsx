import ContactButton from "@/components/contact_button"
import Typography from "@/components/typography"
import styles from "./call-action.module.css"

export default function CallAction() {
    return (
        <div className={styles.box}>
            <Typography element="p" size="large" className={styles.paragraph}>PRECISA DE UMA EQUIPE PARA SEUS PROJETOS?</Typography>
            <ContactButton/>
        </div>
    )
}
