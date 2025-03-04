class PresentationView {
  constructor(container) {
    this.container = container
    this.template = this.createTemplate()
  }

  createTemplate() {
    return `
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Presentations</h1>
          <p class="page-description">Manage your upcoming and past presentations.</p>
        </div>
        <button class="button primary" id="newPresentationBtn">
          <svg class="icon"><!-- ... --></svg>
          New Presentation
        </button>
      </div>

      <div class="tabs">
        <button class="tab-button active" data-tab="upcoming">Upcoming</button>
        <button class="tab-button" data-tab="completed">Completed</button>
        <button class="tab-button" data-tab="drafts">Drafts</button>
      </div>

      <div class="presentations-list" id="presentationsList"></div>
    `
  }

  render() {
    this.container.innerHTML = this.template
    return this
  }

  renderPresentations(presentations, status = "upcoming") {
    const listContainer = this.container.querySelector("#presentationsList")
    listContainer.innerHTML = presentations.length
      ? presentations.map((p) => this.createPresentationCard(p)).join("")
      : this.createEmptyState(status)
  }

  createPresentationCard(presentation) {
    return `
      <div class="presentation-card" data-id="${presentation.id}">
        <div class="presentation-header">
          <div>
            <h3 class="presentation-title">${presentation.title}</h3>
            <p class="presentation-subtitle">${presentation.subject} • ${presentation.presenter}</p>
          </div>
          <div>
            <span class="badge ${presentation.status}">${presentation.status}</span>
          </div>
        </div>
        <!-- ... rest of the card template ... -->
      </div>
    `
  }

  createEmptyState(status) {
    return `
      <div class="empty-state">
        <p>No ${status} presentations found.</p>
      </div>
    `
  }

  bindTabClick(handler) {
    const tabs = this.container.querySelectorAll(".tab-button")
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")
        handler(tab.dataset.tab)
      })
    })
  }

  bindNewPresentation(handler) {
    const button = this.container.querySelector("#newPresentationBtn")
    button.addEventListener("click", handler)
  }
}

export default PresentationView

