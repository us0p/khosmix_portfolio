import Header from "./header"
import styles from "./about.module.css"
import AboutUs from "./about_us"

export default function About() {
    return (
        <div className={styles.content}>
            <Header />
            <div className={styles.aboutBox}>
                <AboutUs />
            </div>
        </div>
    )
}
