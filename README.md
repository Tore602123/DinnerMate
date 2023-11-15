# DinnerMate

## Overview
DinnerMate is a small school project designed to assist users in meal planning. It leverages a generative AI model to suggest personalized recipes based on user preferences.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)

### Installation

1. **Clone the Project**:
   ```bash
   git clone https://github.com/Tore602123/DinnerMate.git
   
2. Navigate to the project directory: 
```cd DinnerMate```

4. Install Vite: 
```npm install vite```

6. Create an `env.js` file in the project root with the following content:
```javascript
export const process = {
  env: {
    OPENAI_API_KEY: "Your-OpenAI-API-Key"
  }
};
```
## Running the Application
Start the web app: ```npm start```

Access the application in your web browser:
Go to - http://localhost:5173/ or your configured port.

Try different inputs related to meal preferences.
Click the submit button and wait for the AI's response.