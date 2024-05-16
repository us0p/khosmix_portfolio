import { NextResponse } from "next/server";
import cheerio from "cheerio"
import Database, { Project } from "@/utils/database";
import { ObjectId, WithId } from "mongodb";
import chromium from "chrome-aws-lambda"
import puppeteer from "chrome-aws-lambda"
import { Browser } from "puppeteer-core";

const behanceUrl = String(process.env.BEHANCE_URL)

type ProjectArts = {
    src: string
    type: "image" | "video"
}

type ProjectCover = {
    src: string
    name: string
    completeProjectHref: string
}

type ProjectInfo = {
    categories: string[]
    description: string
}


export async function GET() {
    const db = new Database()
    const browser = await puppeteer.puppeteer.launch({
        args: chromium.args,
        executablePath: process.env.NODE_ENV !== "development" ? await chromium.executablePath : "/usr/bin/google-chrome-stable",
        headless: true
    })
    try {
        const projectCovers = await getProjectCovers(browser)
        for (const projectCover of projectCovers) {
            const projectInfo = await getProjectInfoPage(projectCover.completeProjectHref, browser)
            const categoriesIDs = await createUpdateProjectCategories(db, projectInfo.categories)
            const dbProject = await createUpdateProject(db, projectCover, categoriesIDs, projectInfo)
            const arts = await getProjectArtsPage(projectCover.completeProjectHref, browser)
            await createUpdateProjectArts(db, arts, dbProject)
        }
        return new NextResponse("OK", { status: 200 })
    } catch (error: any) {
        console.log("error getting projects:", error)
        const errorObj = {
            error: error.message
        }
        return new NextResponse(JSON.stringify(errorObj), { status: 500 })
    } finally {
        await db.disconnect()
    }
}

async function createUpdateProjectArts(
    db: Database,
    arts: ProjectArts[],
    dbProject: WithId<Project>
): Promise<void> {
    for (const art of arts) {
        const projectArts = await db.getProjectArtByProjectID(dbProject["_id"])
        const dbArt = projectArts.find((document) => document.src === art.src)
        if (!dbArt) {
            await db.createProjectArt({
                project_id: dbProject["_id"],
                src: art.src,
                type: art.type
            })
        } else {
            await db.updateProjectArt(dbArt["_id"], {
                project_id: dbProject["_id"],
                src: art.src,
                type: art.type
            })
        }
    }
}

async function createUpdateProject(
    db: Database,
    projectCover: ProjectCover,
    categoriesIDs: ObjectId[],
    projectInfo: ProjectInfo
): Promise<WithId<Project>> {
    let dbProject = await db.getProjectBySrc(projectCover.src)
    const project = {
        src: projectCover.src,
        name: projectCover.name,
        description: projectInfo.description,
        categories: categoriesIDs
    }
    if (!dbProject) {
        await db.createProject(project)
        dbProject = await db.getProjectBySrc(projectCover.src)
    } else {
        await db.updateProject(dbProject["_id"], project)
        dbProject = await db.getProjectBySrc(projectCover.src)
    }
    return dbProject!
}

async function createUpdateProjectCategories(
    db: Database,
    coverCategories: string[]
): Promise<ObjectId[]> {
    const projectCategories: ObjectId[] = []
    let categories = await db.getAllCategories()
    for (const categoryName of coverCategories) {
        const dbCategory = categories.find((document) => document.name === categoryName)
        if (!dbCategory) {
            projectCategories.push(await db.createCategory({ name: categoryName }))
            categories = await db.getAllCategories()
            continue
        }
        projectCategories.push(dbCategory["_id"])
    }
    return projectCategories
}

async function getProjectCovers(browser: Browser): Promise<ProjectCover[]> {
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(behanceUrl)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const html = cheerio.load(pageContent)
            const articles = html("article")
            const requests: any[] = []
            articles.each((_, element) => {
                requests.push(getElementAttributes(element))
            })
            return await Promise.all(requests)
        }
        return []
    } catch (error: any) {
        console.log("error getting projects:", error)
        return []
    } finally {
        await page.close()
    }
}

async function getElementAttributes(element: cheerio.Element): Promise<ProjectCover> {
    const projectCover = cheerio("img", element).attr()
    const completeProject = cheerio("article > div > div > div > div > a", element).attr()
    return ({
        src: projectCover.src,
        name: projectCover.alt,
        completeProjectHref: completeProject.href
    })
}

async function getProjectArtsPage(projectUrl: string, browser: Browser): Promise<ProjectArts[]> {
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(`https://www.behance.net${projectUrl}`)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const html = cheerio.load(pageContent)
            const sections = html(".project-module")
            const completeProjects: ProjectArts[] = []
            sections.each((_, element) => {
                const imageContainer = cheerio(".project-module > div", element)
                imageContainer.each((_, ele) => {
                    const imageAtt = cheerio("img", ele).attr()
                    if (imageAtt) {
                        completeProjects.push({ src: imageAtt["data-src"] || imageAtt.src, type: "image" })
                        return
                    }
                    const videoAtt = cheerio("iframe", ele).attr()
                    if (videoAtt) {
                        completeProjects.push({ src: videoAtt.src, type: "video" })
                    }
                })
            })

            return completeProjects
        }
        return []
    } catch (error: any) {
        console.log("error getting complete project", error)
        return []
    } finally {
        await page.close()
    }
}

async function getProjectInfoPage(projectUrl: string, browser: Browser): Promise<ProjectInfo> {
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(`https://www.behance.net${projectUrl}`)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const regexp = new RegExp('~_([^"])*', 'g')
            const rootComment = regexp.exec(pageContent)
            if (rootComment) {
                const comment = rootComment[0].slice(2)
                const [categories, description] = comment.split(";")
                return { description: description.trim(), categories: categories.split(",").map(s => s.trim()) }
            }
            return { description: "", categories: [] }
        }
        return { description: "", categories: [] }
    } catch (error) {
        console.log("error getting project infos")
        return { description: "", categories: [] }
    } finally {
        await page.close()
    }
}
