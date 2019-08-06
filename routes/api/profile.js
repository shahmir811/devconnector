const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// route    GET api/profile/me
// desc     Get current user profile
// access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    POST api/profile
// desc     create or update user profile
// access   Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills are required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.company = company ? company : '';
    profileFields.website = website ? website : '';
    profileFields.location = location ? location : '';
    profileFields.bio = bio ? bio : '';
    profileFields.status = status ? status : '';
    profileFields.githubusername = githubusername ? githubusername : '';

    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {}; // if we dont initialize this object, this will give us an error of undefined
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update Profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.status(200).json(profile); // return profile
      }

      // create new profile
      profile = new Profile(profileFields);
      await profile.save();

      return res.status(200).json(profile); // return profile
    } catch (error) {
      console.log(error.message);
      res.status(500).json('Server error');
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////

// route    GET api/profile
// desc     Get all profiles
// access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.status(200).json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    GET api/profile/user/:user_id
// desc     Get profile by user_id
// access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    DELETE api/profile
// desc     Delete profile, user and posts
// access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: 'User removed' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    PUT api/profile/experience
// desc     Add profile experience
// access   Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).json('Server error');
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////

// route    DELETE api/profile/experience/:exp_id
// desc     Delete experience from profile
// access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of removing experience
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    PUT api/profile/education
// desc     Add profile education
// access   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).json('Server error');
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////

// route    DELETE api/profile/education/:edu_id
// desc     Delete education from profile
// access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of removing education
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server error');
  }
});

//////////////////////////////////////////////////////////////////////////////////

// route    GET api/profile/github/:username
// desc     Get user repo from github
// access   Public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'Github profile not found' });
      }

      res.status(200).json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
