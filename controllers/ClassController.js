import EventEmitter from "../core/EventEmitter.js"

class ClassController {
  constructor(app) {
    this.app = app
    this.events = new EventEmitter()
    this.container = document.getElementById("main")
  }

  async init() {
    this.render()
    await this.loadClasses()
    this.bindEvents()
  }

  render() {
    this.container.innerHTML = `
      <div class="container">
        <div class="dashboard-header">
          <div>
            <h1 class="page-title">Classes</h1>
            <p class="page-description">Manage your classes and students.</p>
          </div>
          <button class="button primary" id="newClassBtn">
            <svg class="icon"><!-- ... --></svg>
            New Class
          </button>
        </div>

        <div class="classes-grid" id="classesGrid">
          <!-- Classes will be rendered here -->
        </div>
      </div>
    `
  }

  async loadClasses() {
    try {
      const classes = await this.app.db.getClasses()
      this.renderClasses(classes)
    } catch (error) {
      console.error("Failed to load classes:", error)
    }
  }

  renderClasses(classes) {
    const grid = this.container.querySelector("#classesGrid")
    if (!grid) return

    grid.innerHTML = classes
      .map(
        (classItem) => `
      <div class="class-card" data-id="${classItem.id}">
        <div class="class-card-header">
          <h3 class="class-title">${classItem.name}</h3>
          <p class="class-details">Grade ${classItem.grade} • Room ${classItem.room}</p>
        </div>
        <div class="class-card-body">
          <div class="class-info">
            <svg class="icon"><!-- ... --></svg>
            <span>${classItem.studentCount} Students</span>
          </div>
        </div>
        <div class="class-card-footer">
          <button class="button secondary small">View Schedule</button>
          <button class="button primary small">Manage</button>
        </div>
      </div>
    `,
      )
      .join("")
  }

  bindEvents() {
    const newClassBtn = this.container.querySelector("#newClassBtn")
    if (newClassBtn) {
      newClassBtn.addEventListener("click", () => {
        // Handle new class creation
      })
    }

    // Bind other event handlers
  }

  destroy() {
    // Clean up event listeners
    this.events.off("*")
  }
}

export default ClassController

