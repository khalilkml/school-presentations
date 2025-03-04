import EventEmitter from "../core/EventEmitter.js"

class PresentationModel extends EventEmitter {
  constructor(db) {
    super()
    this.db = db
    this.presentations = {
      upcoming: [],
      completed: [],
      drafts: [],
    }
  }

  async loadPresentations(status = null) {
    try {
      const presentations = await this.db.getPresentations(status)
      if (status) {
        this.presentations[status] = presentations
      } else {
        this.presentations = presentations
      }
      this.emit("presentationsLoaded", this.presentations)
      return this.presentations
    } catch (error) {
      this.emit("error", error)
      throw error
    }
  }

  async addPresentation(presentationData) {
    try {
      const newPresentation = await this.db.addPresentation(presentationData)
      this.presentations[presentationData.status].push(newPresentation)
      this.emit("presentationAdded", newPresentation)
      return newPresentation
    } catch (error) {
      this.emit("error", error)
      throw error
    }
  }

  async updatePresentation(id, updates) {
    try {
      const success = await this.db.updatePresentation(id, updates)
      if (success) {
        await this.loadPresentations() // Reload all presentations
        this.emit("presentationUpdated", { id, updates })
      }
      return success
    } catch (error) {
      this.emit("error", error)
      throw error
    }
  }

  async deletePresentation(id) {
    try {
      const success = await this.db.deletePresentation(id)
      if (success) {
        await this.loadPresentations() // Reload all presentations
        this.emit("presentationDeleted", id)
      }
      return success
    } catch (error) {
      this.emit("error", error)
      throw error
    }
  }
}

export default PresentationModel

