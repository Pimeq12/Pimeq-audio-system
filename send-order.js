export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const required = ["name", "phone", "email"];
    const missing = required.filter((key) => !String(body[key] || "").trim());

    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: `Champs manquants : ${missing.join(", ")}`
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.ORDER_EMAIL || "pimeqaudiosystem@gmail.com";
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
      ["Téléphone", body.phone],
      ["E-mail", body.email],
      ["Offre / service", body.offer || body.service || ""],
      ["Date de l'événement", body.date || ""],
      ["Lieu", body.location || body.lieu || ""],
      ["Budget", body.budget || ""],
      ["Message", body.message || ""]
    ];

    const rows = fields
      .filter(([, value]) => String(value ?? "").trim() !== "")
      .map(([label, value]) =>
        `<tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee">${esc(label)}</td><td style="padding:8px;border-bottom:1px solid #eee">${esc(value)}</td></tr>`
      ).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">
        <h2>Nouvelle commande — PIMEQ Audio System</h2>
        <p>Une nouvelle demande de commande vient d'être reçue depuis le site.</p>
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
        subject: `Nouvelle commande PIMEQ — ${body.name}`,
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
      error: "Erreur interne lors de l'envoi de la commande."
    });
  }
}
