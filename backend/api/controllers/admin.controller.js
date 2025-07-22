const db = require("../../src/models");
 
// Approves a provider by updating isApproved flag
const approveProvider = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find provider user by ID and role
    const provider = await db.User.findOne({
      where: {
        id: userId,
        role: "provider"
      }
    });
 
    // Return error if provider not found
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
 
    provider.isApproved = true; // Mark provider as approved
    await provider.save(); // Save changes to database
 
    // Send success response with user details
    res.status(200).json({
      message: "Provider approved successfully",
      user: {
        id: provider.id,
        email: provider.email,
        role: provider.role,
        isApproved: provider.isApproved
      }
    });
  } catch (err) {
    console.error("Approval error:", err); // Log any errors
    res.status(500).json({ message: err.message });
  }
};
 
module.exports = { approveProvider };