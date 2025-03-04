import { db } from "./services/db.js"

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize database
  try {
    await db.init()
  } catch (error) {
    console.error("Failed to initialize database:", error)
    // Show error message to user
    alert("Failed to load data. Please refresh the page.")
    return
  }

  // User dropdown menu toggle
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

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button")
  const presentationsList = document.getElementById("presentationsList")

  if (tabButtons.length > 0 && presentationsList) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        // Remove active class from all tabs
        tabButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked tab
        this.classList.add("active")

        // Get the tab value
        const tabValue = this.getAttribute("data-tab")

        // Update presentations list based on selected tab
        await updatePresentationsList(tabValue)
      })
    })

    // Initialize with the first tab (upcoming)
    await updatePresentationsList("upcoming")
  }

  // Modal functionality
  const newPresentationBtn = document.getElementById("newPresentationBtn")
  const newPresentationModal = document.getElementById("newPresentationModal")
  const closeModalBtn = document.getElementById("closeModalBtn")
  const cancelBtn = document.getElementById("cancelBtn")
  const presentationForm = document.getElementById("presentationForm")

  if (newPresentationBtn && newPresentationModal) {
    newPresentationBtn.addEventListener("click", () => {
      newPresentationModal.classList.add("show")
    })

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        newPresentationModal.classList.remove("show")
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        newPresentationModal.classList.remove("show")
      })
    }

    // Close modal when clicking outside
    newPresentationModal.addEventListener("click", (event) => {
      if (event.target === newPresentationModal) {
        newPresentationModal.classList.remove("show")
      }
    })

    // Form submission
    if (presentationForm) {
      presentationForm.addEventListener("submit", async (event) => {
        event.preventDefault()

        // Get form data
        const formData = new FormData(presentationForm)
        const presentationData = {
          title: formData.get("title"),
          subject: formData.get("subject"),
          presenter: formData.get("presenter"),
          date: `${formData.get("date")}T${formData.get("time")}:00`,
          duration: formData.get("duration"),
          description: formData.get("description"),
          status: "upcoming",
        }

        try {
          // Add the new presentation to the database
          await db.addPresentation(presentationData)

          // Update the presentations list
          await updatePresentationsList("upcoming")

          // Reset form and close modal
          presentationForm.reset()
          newPresentationModal.classList.remove("show")

          // Show success message
          alert("Presentation created successfully!")
        } catch (error) {
          console.error("Failed to create presentation:", error)
          alert("Failed to create presentation. Please try again.")
        }
      })
    }
  }

  // Calendar functionality (for schedule page)
  const calendar = document.getElementById("calendar")
  const prevMonthBtn = document.getElementById("prevMonth")
  const nextMonthBtn = document.getElementById("nextMonth")
  const currentMonthElement = document.getElementById("currentMonth")

  if (calendar && prevMonthBtn && nextMonthBtn && currentMonthElement) {
    const currentDate = new Date()

    // Initialize calendar
    await renderCalendar(currentDate)

    // Previous month button
    prevMonthBtn.addEventListener("click", async () => {
      currentDate.setMonth(currentDate.getMonth() - 1)
      await renderCalendar(currentDate)
    })

    // Next month button
    nextMonthBtn.addEventListener("click", async () => {
      currentDate.setMonth(currentDate.getMonth() + 1)
      await renderCalendar(currentDate)
    })
  }

  // Function to update presentations list based on selected tab
  async function updatePresentationsList(tabValue) {
    if (!presentationsList) return

    try {
      // Get presentations for the selected tab from database
      const presentations = await db.getPresentations(tabValue)

      // Clear current list
      presentationsList.innerHTML = ""

      if (presentations.length === 0) {
        presentationsList.innerHTML = `
          <div class="empty-state">
            <p>No ${tabValue} presentations found.</p>
          </div>
        `
        return
      }

      // Create presentation cards
      presentations.forEach((presentation) => {
        const card = createPresentationCard(presentation)
        presentationsList.appendChild(card)
      })
    } catch (error) {
      console.error("Failed to load presentations:", error)
      presentationsList.innerHTML = `
        <div class="error-state">
          <p>Failed to load presentations. Please try again.</p>
        </div>
      `
    }
  }

  // Function to create a presentation card
  function createPresentationCard(presentation) {
    const card = document.createElement("div")
    card.className = "presentation-card"

    const formattedDate = formatDate(new Date(presentation.date))

    let badgeClass = ""
    let badgeText = ""

    switch (presentation.status) {
      case "upcoming":
        badgeClass = "upcoming"
        badgeText = "Upcoming"
        break
      case "completed":
        badgeClass = "completed"
        badgeText = "Completed"
        break
      case "draft":
        badgeClass = "draft"
        badgeText = "Draft"
        break
    }

    card.innerHTML = `
      <div class="presentation-header">
        <div>
          <h3 class="presentation-title">${presentation.title}</h3>
          <p class="presentation-subtitle">${presentation.subject} • ${presentation.presenter}</p>
        </div>
        <div>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
      </div>
      <div class="presentation-content">
        <div class="presentation-info">
          <div class="presentation-info-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${formattedDate}
          </div>
          ${
            presentation.grade
              ? `
            <div class="presentation-info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Grade: ${presentation.grade}
            </div>
          `
              : ""
          }
        </div>
      </div>
      <div class="presentation-footer">
        <button class="button secondary small" onclick="viewPresentationDetails(${presentation.id})">View Details</button>
        <div class="action-buttons">
          <button class="button secondary small" onclick="editPresentation(${presentation.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="button secondary small" onclick="deletePresentation(${presentation.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    `

    return card
  }

  // Function to render calendar
  async function renderCalendar(date) {
    if (!calendar || !currentMonthElement) return

    const year = date.getFullYear()
    const month = date.getMonth()

    // Update current month display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    currentMonthElement.textContent = `${monthNames[month]} ${year}`

    // Get presentations for the month
    const presentations = await db.getPresentations()
    const events = Object.values(presentations)
      .flat()
      .filter((p) => {
        const presentationDate = new Date(p.date)
        return presentationDate.getFullYear() === year && presentationDate.getMonth() === month
      })

    // Clear calendar days
    const calendarGrid = calendar.querySelector(".calendar-grid")
    const dayHeaders = calendarGrid.querySelectorAll(".calendar-day-header")

    // Remove all day elements (but keep headers)
    Array.from(calendarGrid.children).forEach((child) => {
      if (!child.classList.contains("calendar-day-header")) {
        child.remove()
      }
    })

    // Add days from previous month
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day other-month"
      dayElement.textContent = daysInPrevMonth - i
      calendarGrid.appendChild(dayElement)
    }

    // Add days for current month
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

    for (let i = 1; i <= daysInMonth; i++) {
      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day"
      dayElement.textContent = i

      // Check if this day is today
      if (isCurrentMonth && i === today.getDate()) {
        dayElement.classList.add("today")
      }

      // Check if this day has events
      const eventDate = new Date(year, month, i)
      if (hasEvents(eventDate, events)) {
        dayElement.classList.add("has-event")
      }

      calendarGrid.appendChild(dayElement)
    }

    // Add days from next month
    const totalDaysAdded = firstDay + daysInMonth
    const remainingCells = 42 - totalDaysAdded // 6 rows of 7 days

    for (let i = 1; i <= remainingCells; i++) {
      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day other-month"
      dayElement.textContent = i
      calendarGrid.appendChild(dayElement)
    }
  }

  // Helper function to check if a date has events
  function hasEvents(date, events) {
    // Format date to YYYY-MM-DD for comparison
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    // Check if any presentation is on this date
    return events.some((presentation) => {
      return presentation.date.startsWith(dateString)
    })
  }

  // Helper function to format date
  function formatDate(date) {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }
    return date.toLocaleDateString("en-US", options)
  }

  // Global functions for presentation actions
  window.viewPresentationDetails = async (id) => {
    // Implementation for viewing presentation details
    alert("View presentation details: " + id)
  }

  window.editPresentation = async (id) => {
    // Implementation for editing presentation
    alert("Edit presentation: " + id)
  }

  window.deletePresentation = async (id) => {
    if (confirm("Are you sure you want to delete this presentation?")) {
      try {
        await db.deletePresentation(id)
        const activeTab = document.querySelector(".tab-button.active")
        if (activeTab) {
          await updatePresentationsList(activeTab.getAttribute("data-tab"))
        }
      } catch (error) {
        console.error("Failed to delete presentation:", error)
        alert("Failed to delete presentation. Please try again.")
      }
    }
  }

  // Sample data for presentations (removed as data is now fetched from the database)
  // const presentations = { ... };
})

