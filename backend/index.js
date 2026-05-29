import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { getSocraticResponse } from './llm.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend local development
app.use(cors({
  origin: '*', // Allows connecting from Vite dev server or local browser
}));

app.use(express.json());

// In-memory session database
// Format: { [sessionId]: { id: String, topic: String, targetGoal: String, messages: Array, createdAt: Date } }
const sessions = {};

// Root sanity check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'SocratesLink API is running', activeSessions: Object.keys(sessions).length });
});

/**
 * GET /api/chat/sessions
 * Returns a list of all active Socratic sessions (for sidebar navigation)
 */
app.get('/api/chat/sessions', (req, res) => {
  const list = Object.values(sessions).map(s => ({
    sessionId: s.id,
    topic: s.topic,
    createdAt: s.createdAt,
    lastMessage: s.messages[s.messages.length - 1]?.content || ''
  })).sort((a, b) => b.createdAt - a.createdAt);
  
  res.json(list);
});

/**
 * GET /api/chat/session/:sessionId
 * Returns the details and full chat history of a single session
 */
app.get('/api/chat/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: session.id,
    topic: session.topic,
    messages: session.messages,
    createdAt: session.createdAt
  });
});

/**
 * DELETE /api/chat/session/:sessionId
 * Deletes a session from backend memory
 */
app.delete('/api/chat/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    console.log(`🗑️ Session ${sessionId} deleted successfully.`);
    return res.status(200).json({ success: true });
  }
  
  res.status(404).json({ error: 'Session not found.' });
});

/**
 * POST /api/chat/init
 * Initializes a Socratic session and creates a dynamic opening question
 */
app.post('/api/chat/init', async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Strict validations
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Valid topic string is required.' });
    }
    
    const sessionId = uuidv4();
    
    // Initialize session structure
    sessions[sessionId] = {
      id: sessionId,
      topic: topic.trim(),
      messages: [],
      createdAt: new Date()
    };
    
    // Pre-generate a Socratic opening question tailored to the topic
    console.log(`Generating Socratic introductory question for topic: "${topic.trim()}"`);
    let initialAIQuestion = '';
    try {
      // Trigger a virtual conversation starting message
      initialAIQuestion = await getSocraticResponse(
        topic.trim(),
        [{ role: 'user', content: 'Let us start our discussion on this topic. Please ask your opening Socratic question.' }]
      );
    } catch (err) {
      console.error('Error generating dynamic intro, using default:', err);
      initialAIQuestion = `Hello! I am your Socratic guide. Today, let's explore the concept of "${topic.trim()}". To begin our journey, what is your current understanding of this, or how would you describe it in your own words?`;
    }
    
    // Save initial message in history
    sessions[sessionId].messages.push({
      role: 'assistant',
      content: initialAIQuestion,
      timestamp: new Date()
    });
    
    res.status(200).json({
      sessionId,
      topic: sessions[sessionId].topic,
      messages: sessions[sessionId].messages
    });
    
  } catch (error) {
    console.error('Error in /api/chat/init:', error);
    res.status(500).json({ error: 'Failed to initialize session.' });
  }
});

/**
 * POST /api/chat/message
 * Handles receiving student messages, validating length, and invoking LLM
 */
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    // Validation 1: Session existence
    if (!sessionId || !sessions[sessionId]) {
      return res.status(404).json({ error: 'Invalid or expired sessionId.' });
    }
    
    // Validation 2: Message validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }
    
    // Validation 3: Hard character limit of 500 characters
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message exceeds the hard limit of 500 characters.' });
    }
    
    const session = sessions[sessionId];
    
    // Append user message
    session.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });
    
    console.log(`Processing message for session ${sessionId}. History length: ${session.messages.length}`);
    
    // Invoke LLM Socratic Engine
    const aiResponse = await getSocraticResponse(
      session.topic,
      session.messages
    );
    
    // Append Socratic response
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });
    
    res.status(200).json({
      message: aiResponse,
      messages: session.messages
    });
    
  } catch (error) {
    console.error('Error in /api/chat/message:', error);
    res.status(500).json({ error: 'Failed to process Socratic dialogue.' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 SocratesLink Express Backend listening at http://localhost:${PORT}`);
});
