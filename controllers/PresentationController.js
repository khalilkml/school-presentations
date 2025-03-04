import PresentationModel from "../models/PresentationModel.js"
import PresentationView from "../views/PresentationView.js"

class PresentationController {
  constructor(app) {
    this.app = app
    this.model = new PresentationModel(app.db)
    this.view = new PresentationView(document.getElementById("main"))

    // Bind model events
    this.model.on("presentationsLoaded", this.onPresentationsLoaded.bind(this))
    this.model.on("presentationAdded", this.onPresentationAdded.bind(this))
    this.model.on("error", this.onError.bind(this))
  }

  async init() {
    // Render initial view
    this.view.render()

    // Bind view events
    this.view.bindTabClick(this.handleTabClick.bind(this))
    this.view.bindNewPresentation(this.handleNewPresentation.bind(this))

    // Load initial data
    await this.loadPresentations("upcoming")
  }

  async loadPresentations(status) {
    try {
      await this.model.loadPresentations(status)
    } catch (error) {
      console.error("Failed to load presentations:", error)
      // Handle error in UI
    }
  }

  // Event handlers
  async handleTabClick(status) {
    await this.loadPresentations(status)
  }

  handleNewPresentation() {
    this.app.router.navigateTo("/presentations/new")
  }

  // Model event handlers
  onPresentationsLoaded(presentations) {
    const activeTab = document.querySelector(".tab-button.active")
    const status = activeTab ? activeTab.dataset.tab : "upcoming"
    this.view.renderPresentations(presentations[status], status)
  }

  onPresentationAdded(presentation) {
    // Handle new presentation added
    this.loadPresentations(presentation.status)
  }

  onError(error) {
    console.error("Presentation error:", error)
    // Show error in UI
  }

  // Clean up
  destroy() {
    // Remove event listeners and clean up resources
    this.model.off("presentationsLoaded")
    this.model.off("presentationAdded")
    this.model.off("error")
  }
}

export default PresentationController

