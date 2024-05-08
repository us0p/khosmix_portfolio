import ContactButton from "@/components/contact_button";
import styles from "./about-us.module.css"
import Typography from "@/components/typography";

export default function AboutUs() {
    return (
        <div className={styles.box}>
            <Typography size="large" element="h1" className={styles.h1}>Sobre Nós</Typography>
            <div>
                <Typography size="medium" element="p" className={styles.paragraph}>
                    Em um mundo cada vez mais interconectado, nossa empresa se destaca como uma força unificadora no cenário criativo
                    contemporâneo. Somos uma agência de gestão de mídias e talentos, dedicada a elevar e promover os profissionais mais
                    talentosos em uma ampla gama de disciplinas criativas.
                </Typography>
                <Typography size="medium" element="p" className={styles.paragraph}>
                    Com um foco incansável na excelência e na inovação, nossa equipe trabalha arduamente para oferecer serviços de qualidade
                    incomparável. Somos o catalisador que impulsiona o sucesso de influencers artistas e Empresas, fornecendo as ferramentas,
                    estratégias e suporte necessários para alcançar suas metas e potencial máximo.
                </Typography>
            </div>
            <ContactButton />
        </div>
    )
}
