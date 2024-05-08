import Typography from "@/components/typography"
import styles from "./contact.module.css"
import CallAction from "./call_action"
import Footer from "./footer"

const START_DATE = new Date(2023, 1, 1)

export default function Contact() {
    return (
        <div id="contact" className={styles.main}>
            <CallAction />
            <div className={styles.footerBox}>
                <Footer />
                <div className={styles.copyrightBox}>
                    <Typography element="small" size="small">
                        &copy; {START_DATE.getFullYear()} - {new Date().getFullYear()} Khosmix Studios 
                    </Typography>
                </div>
            </div>
        </div>
    )
}
