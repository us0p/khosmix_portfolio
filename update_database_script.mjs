import cheerio from "cheerio"
import puppeteer from "puppeteer"
import dotenv from "dotenv"
import path from "path";
import { MongoClient } from "mongodb";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local")})

const behanceUrl = String(process.env.BEHANCE_URL)

class Database {
    AVAILABLE_COLLECTIONS = {
        PROJECT: "project",
        PROJECT_ART: "project_art",
        CATEGORY: "category",
    }

    constructor() {
        this.client = new MongoClient(String(process.env.MONGO_CONNECTION_STR))
        this.db = this.client.db(String(process.env.DB_NAME))
    }

    async getAllCategories() {
        const categoryColl = this.db.collection(this.AVAILABLE_COLLECTIONS.CATEGORY)
        const categoriesCursor = categoryColl.find()
        const categories = await categoriesCursor.toArray()
        return categories
    }

    async createCategory(category) {
        const categoryColl = this.db.collection(this.AVAILABLE_COLLECTIONS.CATEGORY)
        const result = await categoryColl.insertOne(category)
        return result.insertedId
    }

    async getProjectBySrc(src){
        const projectColl = this.db.collection(this.AVAILABLE_COLLECTIONS.PROJECT)
        const project = await projectColl.findOne({ src })
        return project
    }

    async createProject(project) {
        const projectColl = this.db.collection(this.AVAILABLE_COLLECTIONS.PROJECT)
        const result = await projectColl.insertOne(project)
        return result.insertedId
    }

    async updateProject(projectID, newData) {
        const projectColl = this.db.collection(this.AVAILABLE_COLLECTIONS.PROJECT)
        await projectColl.updateOne({ _id: projectID }, { $set: newData })
    }

    async getProjectArtByProjectID(projectID) {
        const artColl = this.db.collection(this.AVAILABLE_COLLECTIONS.PROJECT_ART)
        const artCursor = artColl.find({ project_id: projectID })
        const arts = await artCursor.toArray()
        return arts
    }

    async createProjectArt(art) {
        const artColl = this.db.collection(this.AVAILABLE_COLLECTIONS.PROJECT_ART)
        const result = await artColl.insertOne(art)
        return result.insertedId
    }

    async updateProjectArt(projectArtID, newData) {
        const artColl = this.db.collection(this.AVAILABLE_COLLECTIONS.PROJECT_ART)
        await artColl.updateOne({ _id: projectArtID }, { $set: newData })
    }

    async disconnect() {
        await this.client.close()
    }
}

await main()

async function main() {
    const db = new Database()
    const browser = await puppeteer.launch()
    try {
        const projectCovers = await getProjectCovers(browser)
        for (const projectCover of projectCovers) {
            const projectInfo = await getProjectInfoPage(projectCover.completeProjectHref, browser)
            const categoriesIDs = await createUpdateProjectCategories(db, projectInfo.categories)
            const dbProject = await createUpdateProject(db, projectCover, categoriesIDs, projectInfo)
            const arts = await getProjectArtsPage(projectCover.completeProjectHref, browser)
            await createUpdateProjectArts(db, arts, dbProject)
        }
        console.log("script executed successfully")
    } catch (error) {
        console.log("error getting projects:", error)
    } finally {
        await db.disconnect()
    }
    process.exit()
}

async function createUpdateProjectArts(
    db,
    arts,
    dbProject
) {
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
    db,
    projectCover,
    categoriesIDs,
    projectInfo
) {
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
    return dbProject
}

async function createUpdateProjectCategories(
    db,
    coverCategories
) {
    const projectCategories = []
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

async function getProjectCovers(browser) {
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(behanceUrl)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const html = cheerio.load(pageContent)
            const articles = html("article")
            const requests = []
            articles.each((_, element) => {
                requests.push(getElementAttributes(element))
            })
            return await Promise.all(requests)
        }
        return []
    } catch (error) {
        console.log("error getting projects:", error)
        return []
    } finally {
        await page.close()
    }
}

async function getElementAttributes(element) {
    const projectCover = cheerio("img", element).attr()
    const completeProject = cheerio("article > div > div > div > div > a", element).attr()
    return ({
        src: projectCover.src,
        name: projectCover.alt,
        completeProjectHref: completeProject.href
    })
}

async function getProjectArtsPage(projectUrl, browser) {
    const page = await browser.newPage()
    try {
        const pageUrl = await page.goto(`https://www.behance.net${projectUrl}`)
        if (pageUrl) {
            const pageContent = await pageUrl.text()
            const html = cheerio.load(pageContent)
            const sections = html(".project-module")
            const completeProjects = []
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
    } catch (error) {
        console.log("error getting complete project", error)
        return []
    } finally {
        await page.close()
    }
}

async function getProjectInfoPage(projectUrl, browser) {
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
