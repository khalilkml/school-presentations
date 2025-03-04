import Router from "./Router.js"
import EventEmitter from "./EventEmitter.js"
import DatabaseService from "../services/DatabaseService.js"
import PresentationController from "../controllers/PresentationController.js"
import ScheduleController from "../controllers/ScheduleController.js"
import ClassController from "../controllers/ClassController.js"

class App {
  constructor() {
    this.router = new Router()
    this.events = new EventEmitter()
    this.db = new DatabaseService()
  }

  async init() {
    // Initialize database
    await this.db.init()

    // Initialize controllers
    const presentationController = new PresentationController(this)
    const scheduleController = new ScheduleController(this)
    const classController = new ClassController(this)

    // Set up routes
    this.router.addRoute("/", presentationController)
    this.router.addRoute("/schedule", scheduleController)
    this.router.addRoute("/classes", classController)

    // Global event listeners
    this.setupGlobalEvents()
  }

  setupGlobalEvents() {
    // Handle user menu toggle
    document.addEventListener("click", (e) => {
      if (e.target.matches("#userMenuButton, #userMenuButton *")) {
        this.events.emit("toggleUserMenu")
      }
    })

    // Handle other global events...
  }
}

// Initialize app
const app = new App()
app.init().catch(console.error)

export default app

