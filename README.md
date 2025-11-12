Nova AI Assistant

Nova is a conversational AI assistant powered by the OpenRouter API. Designed with a dynamic personality system and contextual memory, Nova combines intelligence with an engaging, human-like interaction style.
The project integrates a React frontend and a Node.js + Express backend connected to OpenRouter’s language models.

Features

Conversational Memory:
Nova retains user information and conversation context through a local JSON-based memory system.

Pause and Resume Control:
The assistant can be paused or resumed at any time, allowing controlled interaction.

Interrupt Handling:
A stop signal feature lets users interrupt Nova mid-response, triggering an immediate stop and acknowledgment.

Custom Personality Layer:
A system prompt defines Nova’s tone, intelligence level, and behavioral style, creating a consistent and distinct character.

Free AI Integration:
Utilizes the deepseek/deepseek-r1-0528:free model through OpenRouter, offering cost-free AI inference.

Tech Stack

Frontend: React
Backend: Node.js, Express
AI Provider: OpenRouter API
Data Storage: Local JSON file (memory.json)

Installation and Setup

Clone the repository

git clone https://github.com/yourusername/nova-ai-assistant.git
cd nova-ai-assistant


Install dependencies

npm install


Configure environment variables
Create a .env file in the project root and include:

OPENROUTER_API_KEY=your_api_key_here
PORT=5000


Run the backend

npm start


Run the frontend (if applicable)

cd client
npm start

Environment Variables
Variable	Description
OPENROUTER_API_KEY	API key obtained from OpenRouter.ai

PORT	Optional port for the backend server (default: 5000)
Memory System

All user data and contextual memory are stored in a local file named memory.json.
This file includes:

User identifiers and basic facts

Conversation history or relevant remembered information

Current pause/resume states

To reset Nova’s memory, delete this file.

API Integration

Nova communicates with the OpenRouter API using standard OpenAI-compatible endpoints.
Example model used:
deepseek/deepseek-r1-0528:free

The backend acts as a proxy, managing authentication and requests between the frontend and OpenRouter.


Credits

Developer: Chantal
Assistant Identity: Nova (fictional character)
Backend: Node.js, Express
Frontend: React
AI Provider: OpenRouter
