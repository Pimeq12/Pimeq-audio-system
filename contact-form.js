/**
 * Gestion de l'envoi du formulaire de contact.
 * À inclure dans contact.html (ou à fusionner dans assets/js/main.js).
 *
 * Le formulaire doit avoir :
 *   - id="contact-form"
 *   - des champs name="name", name="email", name="message"
 *     (optionnels : name="phone", name="subject")
 *   - un champ caché honeypot : <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
 *   - une zone de statut : <p id="contact-form-status"></p>
 */

(function () {
  // Remplace par l'URL de ton déploiement Vercel si différente.
  const CONTACT_API_URL = "https://pimeq-audio-system.vercel.app/api/send-contact";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-form-status");
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = type === "error" ? "form-status form-status--error"
      : type === "success" ? "form-status form-status--success"
      : "form-status";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.textContent = "Envoi en cours...";
    }

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Une erreur est survenue.");
      }

      setStatus("Votre message a bien été envoyé. Nous vous répondrons rapidement.", "success");
      form.reset();
    } catch (err) {
      setStatus(err.message || "Impossible d'envoyer le message pour le moment. Réessayez plus tard.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText;
      }
    }
  });
})();
