// controllers/topicController.js
// const Topic = require("../models/topicModel");
// const Module = require("../models/moduleModel");
const Topic = require("../../models/syllabus-management/topicModel");
const Module = require("../../models/syllabus-management/moduleModel");

// Create Topic
const createTopic = async (req, res) => {
  try {
    const { topicName, module } = req.body;

    if (!topicName || !module) {
      return res.status(400).json({ message: "Topic name and module are required" });
    }

    // check if module exists
    const existingModule = await Module.findById(module);
    if (!existingModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Check if topic with same name already exists in this module
    const existingTopic = await Topic.findOne({ topicName, module });
    if (existingTopic) {
      return res.status(400).json({ message: "Topic with this name already exists in this module" });
    }

    const newTopic = await Topic.create({ topicName, module });

    // increment module's totalTopics and add topic to topics array (if not already exists)
    if (!existingModule.topics.includes(newTopic._id)) {
      existingModule.totalTopics += 1;
      existingModule.topics.push(newTopic._id);
      await existingModule.save();
    }

    res.status(201).json({ message: "Topic created successfully", topic: newTopic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all topics
const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate("module", "moduleName");
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single topic
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate("module", "moduleName");
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update topic
const updateTopic = async (req, res) => {
  try {
    const { topicName, module: newModuleId } = req.body;
    
    // Get the current topic to check if module is changing
    const currentTopic = await Topic.findById(req.params.id);
    if (!currentTopic) return res.status(404).json({ message: "Topic not found" });

    // Check if topic name is being changed and if it already exists in the target module
    if (topicName && topicName !== currentTopic.topicName) {
      const targetModule = newModuleId || currentTopic.module;
      const existingTopic = await Topic.findOne({ 
        topicName, 
        module: targetModule,
        _id: { $ne: req.params.id } // Exclude current topic
      });
      if (existingTopic) {
        return res.status(400).json({ message: "Topic with this name already exists in this module" });
      }
    }

    // If module is changing, update the topic counts and topics arrays
    if (newModuleId && newModuleId !== currentTopic.module.toString()) {
      // Remove topic from old module
      const oldModule = await Module.findById(currentTopic.module);
      if (oldModule) {
        oldModule.totalTopics = Math.max(oldModule.totalTopics - 1, 0);
        oldModule.topics = oldModule.topics.filter(topicId => topicId.toString() !== currentTopic._id.toString());
        await oldModule.save();
      }

      // Add topic to new module (if not already exists)
      const newModule = await Module.findById(newModuleId);
      if (newModule && !newModule.topics.includes(currentTopic._id)) {
        newModule.totalTopics += 1;
        newModule.topics.push(currentTopic._id);
        await newModule.save();
      }
    }

    const updated = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("module", "moduleName");

    res.status(200).json({ message: "Topic updated", topic: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete topic
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    await Topic.findByIdAndDelete(req.params.id);

    // decrement module's totalTopics and remove topic from topics array
    const module = await Module.findById(topic.module);
    if (module) {
      module.totalTopics = Math.max(module.totalTopics - 1, 0);
      module.topics = module.topics.filter(topicId => topicId.toString() !== topic._id.toString());
      await module.save();
    }

    res.status(200).json({ message: "Topic deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
};
