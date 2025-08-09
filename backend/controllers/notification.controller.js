import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId })
			.populate({
				path: "from",
				select: "username profileImg",
			})
			.sort({ createdAt: -1 }); // Sort by newest first

		// Mark notifications as read
		await Notification.updateMany(
			{ to: userId, read: false },
			{ read: true }
		);

		res.status(200).json(notifications);
	} catch (error) {
		console.error("Error in getNotifications function:", error.message);
		res.status(500).json({ error: "Failed to fetch notifications" });
	}
};

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const result = await Notification.deleteMany({ to: userId });

		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "No notifications found to delete" });
		}

		res.status(200).json({ 
			message: "Notifications deleted successfully",
			deletedCount: result.deletedCount 
		});
	} catch (error) {
		console.error("Error in deleteNotifications function:", error.message);
		res.status(500).json({ error: "Failed to delete notifications" });
	}
};
