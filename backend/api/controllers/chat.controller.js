const { default: ModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const db = require("../../src/models");
const { Op } = require("sequelize");
require("dotenv").config();

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

const handleSmartBooking = async (req, res) => {
  const userMessage = req.body.message;

  try {
    if (!token) {
      return res.status(500).json({ message: "Missing AI token in environment config." });
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content:
              "You help users book providers based on availability. Return only valid JSON in responses when booking is requested. Structure it as: { provider_email, date, startTime, endTime, notes }."
          },
          { role: "user", content: userMessage }
        ],
        model,
        temperature: 0.8,
        top_p: 1.0
      }
    });

    if (isUnexpected(response)) {
      console.error("Unexpected AI response:", response.body.error);
      return res.status(500).json({ message: "AI model returned an unexpected response." });
    }

    const aiReply = response.body.choices?.[0]?.message?.content;

    if (!aiReply) {
      return res.status(500).json({ message: "Empty reply from assistant." });
    }

    console.log("AI Response:", aiReply);

    // Extract JSON block from assistant response
    const jsonMatch = aiReply.match(/```json([\s\S]*?)```/) || aiReply.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res.status(200).json({ reply: aiReply });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (err) {
      console.error("Error parsing AI JSON:", err.message);
      return res.status(400).json({ message: "Failed to parse assistant's response as JSON." });
    }

    const { provider_email, date, startTime, endTime, notes } = parsed;
    if (!provider_email || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required booking fields in AI response." });
    }


    // Verify provider exists and is approved
    const provider = await db.User.findOne({
      where: { email: provider_email, role: "provider", isApproved: true }
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found or not approved." });
    }


    // Check provider availability for requested slot
    const isAvailable = await db.Availability.findOne({
      where: {
        staffId: provider.id,
        date,
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: endTime },
        isAvailable: true
      }
    });

    if (!isAvailable) {
      return res.status(400).json({ message: "Provider is not available at that time." });
    }

    
    // Check for booking conflicts
    const conflict = await db.Booking.findOne({
      where: {
        staffId: provider.id,
        date,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    // Create the booking
    const booking = await db.Booking.create({
      patientId: req.user.id,
      staffId: provider.id,
      date,
      startTime,
      endTime,
      notes: notes || "Booked via chat assistant",
      status: "scheduled"
    });

    return res.status(201).json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Smart booking error:", err);
    return res.status(500).json({ message: err.message || "Internal server error." });
  }
};

module.exports = { handleSmartBooking };
