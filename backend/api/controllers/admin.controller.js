const db = require("../../src/models");
 
const approveProvider = async (req, res) => {
  try {
    const { userId } = req.params;
 
    const provider = await db.User.findOne({
      where: {
        id: userId,
        role: "provider"
      }
    });
 
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
 
    provider.isApproved = true;
    await provider.save();
 
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
    console.error("Approval error:", err);
    res.status(500).json({ message: err.message });
  }
};
 
module.exports = { approveProvider };