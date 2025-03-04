class DatabaseService {
  constructor() {
    this.data = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    try {
      const response = await fetch("/db.json")
      if (!response.ok) throw new Error("Failed to load database")
      this.data = await response.json()
      this.initialized = true
    } catch (error) {
      console.error("Database initialization failed:", error)
      throw error
    }
  }

  // Presentations
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

  async updatePresentation(id, updates) {
    await this.init()

    // Find presentation in all status arrays
    for (const status in this.data.presentations) {
      const index = this.data.presentations[status].findIndex((p) => p.id === id)
      if (index !== -1) {
        // If status is changing, move to new status array
        if (updates.status && updates.status !== status) {
          const presentation = {
            ...this.data.presentations[status][index],
            ...updates,
          }
          this.data.presentations[status].splice(index, 1)
          this.data.presentations[updates.status].push(presentation)
        } else {
          // Otherwise just update in place
          this.data.presentations[status][index] = {
            ...this.data.presentations[status][index],
            ...updates,
          }
        }
        await this.saveData()
        return true
      }
    }
    return false
  }

  async deletePresentation(id) {
    await this.init()

    for (const status in this.data.presentations) {
      const index = this.data.presentations[status].findIndex((p) => p.id === id)
      if (index !== -1) {
        this.data.presentations[status].splice(index, 1)
        await this.saveData()
        return true
      }
    }
    return false
  }

  // Classes
  async getClasses() {
    await this.init()
    return this.data.classes
  }

  async addClass(classData) {
    await this.init()
    const maxId = Math.max(...this.data.classes.map((c) => c.id), 0)
    classData.id = maxId + 1
    this.data.classes.push(classData)
    await this.saveData()
    return classData
  }

  async updateClass(id, updates) {
    await this.init()
    const index = this.data.classes.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.data.classes[index] = { ...this.data.classes[index], ...updates }
      await this.saveData()
      return true
    }
    return false
  }

  async deleteClass(id) {
    await this.init()
    const index = this.data.classes.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.data.classes.splice(index, 1)
      await this.saveData()
      return true
    }
    return false
  }

  // Users
  async getCurrentUser() {
    await this.init()
    return this.data.users[0] // For demo purposes, always return first user
  }

  // Data persistence
  async saveData() {
    // In a real application, this would make an API call to save the data
    // For this demo, we'll just log the data
    console.log("Saving data:", this.data)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real application, you would typically save to a server here
    // For now, we'll save to localStorage as a fallback
    try {
      localStorage.setItem("schoolPresent_db", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save data:", error)
    }
  }

  // Load data from localStorage if available
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

// Create and export a singleton instance
export const db = new DatabaseService()

