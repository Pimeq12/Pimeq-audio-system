export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    // Anti-spam : honeypot. Le champ "website" doit rester vide (voir script front).
    if (String(body.website || "").trim() !== "") {
      // On répond succès pour ne pas renseigner les bots, mais on n'envoie rien.
      return res.status(200).json({ ok: true, id: "skipped" });
    }

    const required = ["name", "email", "message"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: `Champs manquants : ${missing.join(", ")}`
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_EMAIL || process.env.ORDER_EMAIL || "pimeqaudiosystem@gmail.com";
    const from = process.env.ORDER_FROM || "PIMEQ Audio System <onboarding@resend.dev>";

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "RESEND_API_KEY n'est pas configurée."
      });
    }

    const esc = (v) => String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const fields = [
      ["Nom", body.name],
      ["Téléphone", body.phone || ""],
      ["E-mail", body.email],
      ["Sujet", body.subject || ""],
      ["Message", body.message]
    ];

    const rows = fields
      .filter(([, value]) => String(value ?? "").trim() !== "")
      .map(([label, value]) =>
        `<tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;white-space:nowrap">${esc(label)}</td><td style="padding:8px;border-bottom:1px solid #eee">${esc(value).replace(/\n/g, "<br>")}</td></tr>`
      ).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">
        <h2>Nouveau message de contact — PIMEQ Audio System</h2>
        <p>Un visiteur vient d'envoyer un message depuis le site.</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: body.email,
        subject: `Nouveau message de contact — ${body.name}`,
        html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return res.status(502).json({
        ok: false,
        error: "Le service d'e-mail a refusé l'envoi."
      });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error: "Erreur interne lors de l'envoi du message."
    });
  }
}
