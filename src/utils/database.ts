import { Db, Document, Filter, MongoClient, ObjectId, WithId } from "mongodb"

enum AVAILABLE_COLLECTIONS {
    PROJECT = "project",
    PROJECT_ART = "project_art",
    CATEGORY = "category",
}

export type Category = {
    name: string
}

export type Project = {
    name: string
    src: string
    description: string,
    categories: ObjectId[]
}

export type ProjectArt = {
    project_id: ObjectId
    src: string
    type: "image" | "video"
}

interface CompleteProject extends Project {
    arts: ProjectArt
}

export default class Database {
    client: MongoClient
    db: Db

    constructor() {
        this.client = new MongoClient(String(process.env.MONGO_CONNECTION_STR))
        this.db = this.client.db(String(process.env.DB_NAME))
    }

    async getAllCategories(): Promise<WithId<Category>[]> {
        const categoryColl = this.db.collection(AVAILABLE_COLLECTIONS.CATEGORY)
        const categoriesCursor = categoryColl.find()
        const categories = await categoriesCursor.toArray()
        return categories as WithId<Category>[]
    }

    async getCategory(filter: Filter<Document>): Promise<WithId<Document> | null> {
        const categoryColl = this.db.collection(AVAILABLE_COLLECTIONS.CATEGORY)
        return await categoryColl.findOne(filter)
    }

    async createCategory(category: Category) {
        const categoryColl = this.db.collection(AVAILABLE_COLLECTIONS.CATEGORY)
        const result = await categoryColl.insertOne(category)
        return result.insertedId
    }

    async getProjectBySrc(src: string): Promise<WithId<Project> | null> {
        const projectColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT)
        const project = await projectColl.findOne({ src })
        return project as WithId<Project> | null
    }

    async getProjectsByCategory(category: string): Promise<WithId<Project>[]> {
        const projectColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT)
        const projectCursor = projectColl.find({ categories: { $elemMatch: { $eq: new ObjectId(category) } } })
        const projects = await projectCursor.toArray()
        return projects as WithId<Project>[]
    }

    async getAllProjects(): Promise<WithId<Project>[]> {
        const projectColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT)
        const projectCursor = projectColl.find()
        const projects = await projectCursor.toArray()
        return projects as WithId<Project>[]
    }

    async getCompleteProject(projectID: string): Promise<CompleteProject | null> {
        const projectColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT)
        const projectCursor = projectColl.aggregate([
            { $match: { _id: new ObjectId(projectID) } },
            {
                $lookup: {
                    from: AVAILABLE_COLLECTIONS.PROJECT_ART,
                    localField: "_id",
                    foreignField: "project_id",
                    as: "arts"
                }
            }
        ])
        const project = await projectCursor.toArray()
        if (project.length) {
            return project[0] as CompleteProject
        }
        return null
    }

    async createProject(project: Project) {
        const projectColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT)
        const result = await projectColl.insertOne(project)
        return result.insertedId
    }

    async updateProject(projectID: ObjectId, newData: Project) {
        const projectColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT)
        await projectColl.updateOne({ _id: projectID }, { $set: newData })
    }

    async getProjectArtByProjectID(projectID: ObjectId): Promise<WithId<ProjectArt>[]> {
        const artColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT_ART)
        const artCursor = artColl.find({ project_id: projectID })
        const arts = await artCursor.toArray()
        return arts as WithId<ProjectArt>[]
    }

    async createProjectArt(art: ProjectArt): Promise<ObjectId> {
        const artColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT_ART)
        const result = await artColl.insertOne(art)
        return result.insertedId
    }

    async updateProjectArt(projectArtID: ObjectId, newData: ProjectArt) {
        const artColl = this.db.collection(AVAILABLE_COLLECTIONS.PROJECT_ART)
        await artColl.updateOne({ _id: projectArtID }, { $set: newData })
    }

    async disconnect() {
        await this.client.close()
    }
}
