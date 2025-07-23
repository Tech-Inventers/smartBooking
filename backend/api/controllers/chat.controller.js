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
            content: `
              You are a smart assistant that helps users with booking management.

              For every message, respond ONLY with a valid JSON object that includes a "queryType" field. Based on the user's intent, use one of these formats:

               For booking:
              {
                "queryType": "booking",
                "provider_email": "provider1@example.com",
                "date": "2025-07-25",
                "startTime": "10:00",
                "endTime": "10:30",
                "notes": "Optional"
              }

              🗓 For availability:
              {
                "queryType": "availability",
                "provider_email": "provider1@example.com",
                "date": "2025-07-25"
              }

               For reschedule:
              {
                "queryType": "reschedule",
                "provider_email": "provider1@example.com",
                "original_date": "2025-07-25",
                "original_startTime": "10:00",
                "original_endTime": "10:30",
                "new_date": "2025-07-26",
                "new_startTime": "11:00",
                "new_endTime": "11:30"
              }

               For cancellation:
              {
                "queryType": "cancel",
                "provider_email": "provider1@example.com",
                "date": "2025-07-25",
                "startTime": "10:00",
                "endTime": "10:30"
              }

               For viewing bookings:
              {
                "queryType": "view"
              }

              Return only the JSON object. No extra explanation.
            `
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

    const {
      queryType,
      provider_email,
      date,
      startTime,
      endTime,
      notes,
      original_date,
      original_startTime,
      original_endTime,
      new_date,
      new_startTime,
      new_endTime
    } = parsed;

    let provider;
    if (provider_email) {
      provider = await db.User.findOne({
        where: { email: provider_email, role: "provider", isApproved: true }
      });
      if (!provider) {
        return res.status(404).json({ message: "Provider not found or not approved." });
      }
    }

    if (queryType === "availability") {
      const slots = await db.Availability.findAll({
        where: { staffId: provider.id, date, isAvailable: true }
      });

      if (!slots.length) {
        return res.status(200).json({ reply: "No available slots found for that date." });
      }

      const slotText = slots.map(slot => `${slot.startTime}–${slot.endTime}`).join(", ");
      return res.status(200).json({ reply: `Available slots on ${date}: ${slotText}` });
    }

    if (queryType === "booking") {
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
    }

    if (queryType === "cancel") {
      const booking = await db.Booking.findOne({
        where: {
          patientId: req.user.id,
          staffId: provider.id,
          date,
          startTime,
          endTime,
          status: "scheduled"
        }
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found or already cancelled." });
      }

      booking.status = "cancelled";
      await booking.save();

      return res.status(200).json({ message: "Booking cancelled", booking });
    }

    if (queryType === "reschedule") {
      const booking = await db.Booking.findOne({
        where: {
          patientId: req.user.id,
          staffId: provider.id,
          date: original_date,
          startTime: original_startTime,
          endTime: original_endTime,
          status: "scheduled"
        }
      });

      if (!booking) {
        return res.status(404).json({ message: "Original booking not found." });
      }

      const availability = await db.Availability.findOne({
        where: {
          staffId: provider.id,
          date: new_date,
          startTime: { [Op.lte]: new_startTime },
          endTime: { [Op.gte]: new_endTime },
          isAvailable: true
        }
      });

      if (!availability) {
        return res.status(400).json({ message: "New time is not available." });
      }

      const conflict = await db.Booking.findOne({
        where: {
          staffId: provider.id,
          date: new_date,
          [Op.or]: [
            {
              startTime: { [Op.lt]: new_endTime },
              endTime: { [Op.gt]: new_startTime }
            }
          ]
        }
      });

      if (conflict) {
        return res.status(400).json({ message: "New time slot already booked." });
      }

      booking.date = new_date;
      booking.startTime = new_startTime;
      booking.endTime = new_endTime;
      await booking.save();

      return res.status(200).json({ message: "Booking rescheduled", booking });
    }

    if (queryType === "view") {
      const bookings = await db.Booking.findAll({
        where: {
          patientId: req.user.id,
          date: { [Op.gte]: new Date() },
          status: "scheduled"
        },
        include: [{ model: db.User, as: "staff" }]
      });

      if (!bookings.length) {
        return res.status(200).json({ reply: "You have no upcoming bookings." });
      }

      const summary = bookings.map(b => `• ${b.staff.email} on ${b.date} from ${b.startTime}–${b.endTime}`).join("\n");

      return res.status(200).json({ reply: `Here are your upcoming bookings:\n${summary}` });
    }

    return res.status(400).json({ message: "Unsupported query type or missing required fields." });
  } catch (err) {
    console.error("Smart booking error:", err);
        return res.status(500).json({ message: err.message || "Internal server error." });
  }
};

module.exports = { handleSmartBooking };

