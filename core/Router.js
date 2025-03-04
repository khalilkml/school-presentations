class Router {
  constructor() {
    this.routes = {}
    this.currentController = null

    // Handle browser navigation
    window.addEventListener("popstate", () => this.handleRoute())

    // Handle initial route
    this.handleRoute()
  }

  addRoute(path, controller) {
    this.routes[path] = controller
  }

  navigateTo(path) {
    history.pushState(null, "", path)
    this.handleRoute()
  }

  handleRoute() {
    const path = window.location.pathname
    const controller = this.routes[path] || this.routes["/"]

    // Clean up previous controller if exists
    if (this.currentController && this.currentController.destroy) {
      this.currentController.destroy()
    }

    // Initialize new controller
    this.currentController = controller
    if (controller && controller.init) {
      controller.init()
    }
  }
}

export default Router

