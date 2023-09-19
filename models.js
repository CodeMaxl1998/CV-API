const mongoose = require('mongoose');

// Create schemas
const personalInfoSchema = new mongoose.Schema({ applicantId: String, name: String, dob: String, address: String, postalCode: String, city: String, country: String, email: String, phone: String});
const workExperienceSchema = new mongoose.Schema({applicantId: String, experienceId: String, jobTitle: String, company: String, timespan: String, details: [String]});
const educationSchema = new mongoose.Schema({applicantId: String, educationId: String, title: String, institution: String, timespan: String, degree: String, note: String});
const skillSchema = new mongoose.Schema({applicantId: String, skillId: String, skill: String, type: String, level: String});
const notesSchema = new mongoose.Schema({applicantId: String, noteId: String, content: String});

// Create models
const PersonalInfo = mongoose.model('PersonalInfos', personalInfoSchema);
const WorkExperience = mongoose.model('WorkExperience', workExperienceSchema);
const Education = mongoose.model('Education', educationSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Note = mongoose.model('Note', notesSchema);
// Personal Info Endpoint

module.exports = { PersonalInfo, WorkExperience, Education, Skill, Note };
