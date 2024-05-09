import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer"
import cheerio from "cheerio"

const behanceUrl = String(process.env.BEHANCE_URL)

type Project = {
    src: string
    name: string
    completeAssets: CompleteProjectItem[]
}

type CompleteProjectItem = {
    src: string
    type: "image" | "video"
}


export async function GET() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(behanceUrl)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const html = cheerio.load(pageContent)
            const articles = html("article")
            const projects: Project[] = []
            const requests: any[] = []
            articles.each((_, element) => {
                requests.push(getProjectCover(element, projects, browser))
            })
            await Promise.all(requests)
            return NextResponse.json({ projects })
        }
        return new NextResponse(`navigated to about:blank or same url with different hash`, { status: 404 })
    } catch (error: any) {
        const errorObj = {
            error: error.message
        }
        return new NextResponse(JSON.stringify(errorObj), { status: 500 })
    }
}

async function getProjectCover(element: cheerio.Element, projects: Project[], browser: Browser) {
    const projectCover = cheerio("img", element).attr()
    const completeProject = cheerio("article > div > div > div > div > a", element).attr()
    const completeAssets = await getCompleteProject(completeProject.href, browser)
    projects.push({
        src: projectCover.src,
        name: projectCover.alt,
        completeAssets
    })
}

// refactor this function:
// it's not pulling all images from the project
// it's not pulling video references
async function getCompleteProject(projectUrl: string, browser: Browser): Promise<CompleteProjectItem[]> {
    console.log("here")
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(`https://www.behance.net${projectUrl}`)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const html = cheerio.load(pageContent)
            const sections = html("section")
            const completeProjects: CompleteProjectItem[] = []
            sections.each((_, element) => {
                const imageContainer = cheerio("section > div > .project-module", element)
                imageContainer.each((_, ele) => {
                    const image = cheerio("img", ele)
                    completeProjects.push({ src: image.attr().src, type: "image" })
                })
            })
            return completeProjects
        }
        return []
    } catch (error: any) {
        console.log("error getting complete project", error.message)
        return []
    }
}
