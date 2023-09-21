const express = require('express');
const basicAuth = require('basic-auth');
const router = express.Router();
const { PersonalInfo, WorkExperience, Education, Skill, Note } = require('./models');

const authenticate = (req, res, next) => {
  const user = basicAuth(req);
  
  if (!user || !user.name || user.name !== process.env.API_KEY) {
    res.set('WWW-Authenticate', 'Basic realm="Example"');
    return res.status(401).send("Unauthorized");
  }
  
  return next();
};

const fetchData = async (endpoint, query, description) => {
  try {
    return await endpoint.find(query);
  } catch (error) {
    console.error(`Error fetching ${description}`, error);
    throw new Error(error);
  }
};

const handleEndpointGetRequest = async (req, res, model, description) => {
  const { applicantId } = req.params;
  const query = applicantId ? { applicantId } : {};

  try {
    const data = await fetchData(model, query, description);
    if (!data.length) {
      if (applicantId) {
        return res.status(404).json({ error: `No ${description} found for given applicantId` });
      }
      return res.status(200).json([]);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const { v4: uuidv4 } = require('uuid');

const generateUniqueNoteId = () => {
  const uuid = uuidv4();
  const truncatedUuid = uuid.split('-')[0];
  return `note_${truncatedUuid}`;
};

const createNote = async (req, res) => {
  let { applicantId } = req.params;
  let { content } = req.body;
  applicantId = applicantId;
  const noteId = generateUniqueNoteId()
  content = content || "no content";
  try {
    const newNote = new Note({
      applicantId,
      noteId,
      content
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error(`Error creating note`, error);
    res.status(500).json({ error: error.toString() });
  }
}

const editNote = async (req, res) => {
  const { noteId } = req.params;
  const  content = req.body.content;

  try {
    const result = await Note.updateOne({ noteId: noteId }, { $set: { content: content } });

    // Check if the note was found
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: `Note ${noteId} not found`});
    }

    // Check if the note was actually modified
    if (result.matchedCount > 0 && result.modifiedCount === 0) {
      return res.status(200).json({ message: `Note ${noteId} was found but not modified` });
    }

    res.status(200).json({ message: `Note ${noteId} was successfully updated` });
  } catch (error) {
    console.error(`Error updating note`, error);
    res.status(500).json({ error: error.toString() });
  }
};

const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  try {
    const result = await Note.deleteOne({ noteId: noteId });

    // Check if the note was found and deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `Note ${noteId} not found`});
    }

    res.status(200).json({ message: `Note ${noteId} was successfully deleted` });
  } catch (error) {
    console.error(`Error deleting note`, error);
    res.status(500).json({ error: error.toString() });
  }
};

router.get('/personal-info', authenticate, (req, res) => handleEndpointGetRequest(req, res, PersonalInfo, 'personal info'));
router.get('/personal-info/:applicantId', authenticate, (req, res) => handleEndpointGetRequest(req, res, PersonalInfo, 'personal info'));

router.get('/work-experience', authenticate, (req, res) => handleEndpointGetRequest(req, res, WorkExperience, 'work experience'));
router.get('/work-experience/:applicantId', authenticate, (req, res) => handleEndpointGetRequest(req, res, WorkExperience, 'work experience'));

router.get('/education', authenticate, (req, res) => handleEndpointGetRequest(req, res, Education, 'education'));
router.get('/education/:applicantId', authenticate, (req, res) => handleEndpointGetRequest(req, res, Education, 'education'));  
  
router.get('/skills', authenticate, (req, res) => handleEndpointGetRequest(req, res, Skill, 'skills'));
router.get('/skills/:applicantId', authenticate, (req, res) => handleEndpointGetRequest(req, res, Skill, 'skills'));

router.get('/notes', authenticate, (req, res) => handleEndpointGetRequest(req, res, Note, 'notes'));
router.get('/notes/:applicantId', authenticate, (req, res) => handleEndpointGetRequest(req, res, Note, 'notes'));
router.post('/notes/:applicantId', authenticate, createNote);
router.put('/notes/:noteId', authenticate, editNote);
router.delete('/notes/:noteId', authenticate, deleteNote)

module.exports = router;
