/*
Description of Refactoring:
Extracted formatUser Function:

Extracted a function formatUser to improve code readability and reuse the user formatting logic.
Extracted getUserById Function:

Created a function getUserById to handle the common logic of fetching a user by ID.
Extracted getUserAndFormatFriends Function:

Extracted a function getUserAndFormatFriends to simplify the logic of getting a user and formatting its friends.
Simplified Friend Removal Logic:

Simplified the friend removal logic by directly using the filter method on the user.friends and friend.friends arrays.
Centralized Friend Formatting:

Centralized the friend formatting logic to avoid code duplication.
These refactorings aim to improve code readability, maintainability, and reduce redundancy.
*/



import User from "../models/User.js";

const formatUser = ({ _id, firstName, lastName, occupation, location, picturePath }) => {
  return { _id, firstName, lastName, occupation, location, picturePath };
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const getUserAndFormatFriends = async (id) => {
  const user = await getUserById(id);
  
  const friends = await Promise.all(
    user.friends.map((friendId) => getUserById(friendId))
  );
  
  return friends.map(formatUser);
};

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const formattedFriends = await getUserAndFormatFriends(id);
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await getUserById(id);
    const friend = await getUserById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((friendId) => friendId !== friendId);
      friend.friends = friend.friends.filter((userId) => userId !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    const formattedFriends = await getUserAndFormatFriends(id);
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
