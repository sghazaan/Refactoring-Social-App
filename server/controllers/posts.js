/*
Description of Refactoring:
Extracted createNewPost Function:

Created a separate function createNewPost to encapsulate the logic of creating a new post.
Extracted getPosts Function:

Extracted a function getPosts to handle the common logic of fetching posts with optional filters.
Simplified createPost Function:

Simplified the createPost function by calling the extracted createNewPost function and then fetching all posts.
Reuse of getPosts for getFeedPosts and getUserPosts:

Reused the getPosts function for fetching feed posts and user-specific posts.
These refactorings aim to improve code organization, readability, and maintainability. 
*/



import Post from "../models/Post.js";
import User from "../models/User.js";

const createNewPost = async (userId, description, picturePath) => {
  const user = await User.findById(userId);
  const newPost = new Post({
    userId,
    firstName: user.firstName,
    lastName: user.lastName,
    location: user.location,
    description,
    userPicturePath: user.picturePath,
    picturePath,
    likes: {},
    comments: [],
  });
  await newPost.save();
};

const getPosts = async (filter) => {
  return await Post.find(filter);
};

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    await createNewPost(userId, description, picturePath);

    const posts = await getPosts();
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await getPosts();
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await getPosts({ userId });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
