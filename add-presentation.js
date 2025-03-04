import { db } from "./services/db.js"

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize database
  try {
    await db.init()
  } catch (error) {
    console.error("Failed to initialize database:", error)
    alert("Failed to load data. Please refresh the page.")
    return
  }

  // User dropdown menu functionality
  const userMenuButton = document.getElementById("userMenuButton")
  const userDropdown = document.getElementById("userDropdown")

  if (userMenuButton && userDropdown) {
    // Load and display current user
    const user = await db.getCurrentUser()
    if (user) {
      const avatar = userMenuButton.querySelector(".avatar")
      const userName = userDropdown.querySelector(".user-name")
      const userEmail = userDropdown.querySelector(".user-email")

      if (avatar) avatar.textContent = user.avatar
      if (userName) userName.textContent = user.name
      if (userEmail) userEmail.textContent = user.email
    }

    userMenuButton.addEventListener("click", () => {
      userDropdown.classList.toggle("show")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove("show")
      }
    })
  }

  // Form submission handling
  const addPresentationForm = document.getElementById("addPresentationForm")

  if (addPresentationForm) {
    addPresentationForm.addEventListener("submit", async function (event) {
      event.preventDefault()

      // Show loading state
      const submitButton = this.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.textContent
      submitButton.disabled = true
      submitButton.textContent = "Creating..."

      try {
        // Get form data
        const formData = new FormData(this)
        const presentationData = {
          title: formData.get("title"),
          subject: formData.get("subject"),
          presenter: formData.get("presenter"),
          date: `${formData.get("date")}T${formData.get("time")}:00`,
          duration: formData.get("duration"),
          description: formData.get("description"),
          status: formData.get("status"),
        }

        // Add the new presentation to the database
        await db.addPresentation(presentationData)

        // Show success message and redirect
        alert("Presentation created successfully!")
        window.location.href = "index.html"
      } catch (error) {
        console.error("Failed to create presentation:", error)
        alert("Failed to create presentation. Please try again.")

        // Reset button state
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    })
  }
})

