/**
 * Contact Form & EmailJS Integration Module
 * 
 * Performs client-side form validation, manages submit button loading states,
 * and handles secure API requests to the EmailJS browser SDK.
 * Includes a Simulated Developer Mode for instant testing in preview environments.
 */

import { EMAILJS_CONFIG } from "./config.js";

/**
 * Validates form inputs and handles form submission.
 */
export function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = form.querySelector(".submit-btn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const btnSpinner = submitBtn?.querySelector(".btn-spinner");
  const formStatus = document.getElementById("formStatus");

  // Check if EmailJS is configured with valid credentials
  const isEmailJSConfigured = 
    EMAILJS_CONFIG && 
    EMAILJS_CONFIG.publicKey && 
    EMAILJS_CONFIG.publicKey !== "YOUR_EMAILJS_PUBLIC_KEY" && 
    EMAILJS_CONFIG.publicKey.trim() !== "" &&
    EMAILJS_CONFIG.serviceId && 
    EMAILJS_CONFIG.serviceId !== "YOUR_EMAILJS_SERVICE_ID" && 
    EMAILJS_CONFIG.serviceId.trim() !== "" &&
    EMAILJS_CONFIG.templateId && 
    EMAILJS_CONFIG.templateId !== "YOUR_EMAILJS_TEMPLATE_ID" && 
    EMAILJS_CONFIG.templateId.trim() !== "";

  // Helper to show status message
  const showStatus = (message, type) => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = "block";
    
    // Auto-scroll slightly to show the status if needed
    formStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Gather values
    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const subjectInput = form.querySelector("#subject");
    const messageInput = form.querySelector("#message");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    // 2. Validate
    if (!name || !email || !subject || !message) {
      showStatus("Please fill in all required fields.", "error");
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus("Please enter a valid email address.", "error");
      return;
    }

    // 3. Set loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Sending...";
    if (btnSpinner) btnSpinner.style.display = "inline-block";
    if (formStatus) formStatus.style.display = "none";

    // 4. Send Message (Real or Simulated)
    try {
      if (isEmailJSConfigured) {
        // Initialize EmailJS
        window.emailjs.init(EMAILJS_CONFIG.publicKey);

        // Send template parameters
        const templateParams = {
          from_name: name,
          reply_to: email,
          subject: subject,
          message: message
        };

        const response = await window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams
        );

        if (response.status === 200 || response.text === "OK") {
          showStatus("Thank you! Your message has been sent successfully.", "success");
          form.reset();
        } else {
          throw new Error(response.text || "Failed to send message via EmailJS.");
        }
      } else {
        // --- SIMULATED DEVELOPER MODE ---
        console.info(
          "%c[EmailJS Demo Mode]%c No credentials detected in `js/config.js`. Simulating email transfer...",
          "color: #eab308; font-weight: bold;",
          "color: inherit;"
        );
        console.log("Form Data Submitted:", { name, email, subject, message });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showStatus(
          "Demo Mode: Message simulated successfully! To send real emails, follow the steps in the README to configure js/config.js.",
          "info"
        );
        form.reset();
      }
    } catch (error) {
      console.error("Failed to deliver contact message:", error);
      showStatus(
        `Oops! Something went wrong: ${error.message || "Network Error"}. Please try again later.`,
        "error"
      );
    } finally {
      // 5. Restore submit button state
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = "Send Message";
      if (btnSpinner) btnSpinner.style.display = "none";
    }
  });
}
