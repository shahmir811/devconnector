const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// route    POST api/posts
// desc     Create new post
// access   Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is reqired')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.status(200).json(post);
    } catch (error) {
      console.log(error.message);
      res.status(500).json('Server error');
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////

// route    GET api/posts
// desc     Get all posts
// access   Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: '-1' }); // most recent first
    res.status(200).json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    GET api/posts/:id
// desc     Get post by id
// access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(400).json({ msg: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    DELETE api/posts/:id
// desc     Delete post by id
// access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }

    // check if user is authorized to delete his own post
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User is not authorized to delete this post' });
    }

    await post.remove();

    res.status(200).json({ msg: 'Post removed' });
  } catch (error) {
    console.log(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    PUT api/posts/like/:id -> id here is the post id
// desc     Like a comment
// access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(500).json({ msg: 'Post not found' });
    }

    // Check if this logged in user already liked this post
    const checkLength = post.likes.filter(
      like => like.user.toString() === req.user.id
    ).length;

    if (checkLength > 0) {
      return res.status(400).json({ msg: 'User already liked this post' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    PUT api/posts/unlike/:id -> id here is the post id
// desc     Like a comment
// access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(500).json({ msg: 'Post not found' });
    }

    // Check if this logged in user liked this post
    const checkLength = post.likes.filter(
      like => like.user.toString() === req.user.id
    ).length;

    if (checkLength === 0) {
      return res.status(400).json({ msg: 'Post has not been liked yet.' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    POST api/posts/comment/:id -> id is the post id
// desc     Comment on a post
// access   Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is reqired')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);
      await post.save();

      res.status(200).json(post.comments);
    } catch (error) {
      console.log(error.message);
      res.status(500).json('Server error');
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////

// route    DELETE api/posts/comment/:id/:comment_id -> id is the post id
// desc     Delete comment on a post
// access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Pull out comment that will be deleted
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // check user is eligibile to delete his own comment
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User is not authorized to delete this comment' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();

    res.status(200).json(post.comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

module.exports = router;
