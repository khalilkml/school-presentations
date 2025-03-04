class DatabaseService {
  constructor() {
    this.data = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    try {
      // In a real app, this would be an API call
      const response = await fetch("/db.json")
      if (!response.ok) throw new Error("Failed to load database")
      this.data = await response.json()
      this.initialized = true

      // Load from localStorage if available
      await this.loadFromStorage()
    } catch (error) {
      console.error("Database initialization failed:", error)
      throw error
    }
  }

  // CRUD operations for presentations
  async getPresentations(status) {
    await this.init()
    return status ? this.data.presentations[status] : this.data.presentations
  }

  async addPresentation(presentation) {
    await this.init()
    const status = presentation.status || "drafts"

    // Generate new ID
    const maxId = Math.max(
      ...Object.values(this.data.presentations)
        .flat()
        .map((p) => p.id),
      0,
    )
    presentation.id = maxId + 1

    // Add to appropriate status array
    this.data.presentations[status].push(presentation)
    await this.saveData()
    return presentation
  }

  // ... other database methods remain the same ...

  // Data persistence
  async saveData() {
    console.log("Saving data:", this.data)
    try {
      localStorage.setItem("schoolPresent_db", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save data:", error)
    }
  }

  async loadFromStorage() {
    try {
      const stored = localStorage.getItem("schoolPresent_db")
      if (stored) {
        this.data = JSON.parse(stored)
        this.initialized = true
      }
    } catch (error) {
      console.error("Failed to load data from storage:", error)
    }
  }
}

export default DatabaseService

