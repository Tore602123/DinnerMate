import { Configuration, OpenAIApi } from 'openai';
import { process } from './env';

// Configuring OpenAI with the API key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const chatbotConversation = document.getElementById('chatbot-conversation');
let conversationArr = []; // Array to store chat conversation locally

// Instruction object for the chatbot
const instructionObj = {
    role: 'system',
    content: 'You are a helpful cook that will suggest one dinner with recipe. Consider the user’s likes, dislikes, allergies, and the number of people they are cooking for. ',
};

document.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Retrieving user inputs from the form
    const likesInput = document.getElementById('likes-input').value;
    const dislikesInput = document.getElementById('dislikes-input').value;
    const allergiesInput = document.getElementById('allergies-input').value;
    const numberOfPeopleInput = document.getElementById('number-of-people-input').value;
    
    const userInputCombined = `Likes: ${likesInput}, Dislikes: ${dislikesInput}, Allergies: ${allergiesInput}, Number of People: ${numberOfPeopleInput}`;

    // Adding user input to the local conversation array
    conversationArr.push({
        role: 'user',
        content: userInputCombined
    });

    fetchReply();
    
    // Displaying user input in the chat interface
    displaySpeechBubble(userInputCombined, 'human');
});

function fetchReply() {
    // Prepending the instruction object to the conversation array
    let conversationWithInstructions = [instructionObj, ...conversationArr];

    openai.createChatCompletion({
        model: 'gpt-4-1106-preview',
        messages: conversationWithInstructions,
        presence_penalty: 0,
        frequency_penalty: 0.3
    }).then(response => {
        const replyText = response.data.choices[0].message.content;
        // Adding the reply to the local conversation array
        conversationArr.push(response.data.choices[0].message);
        displaySpeechBubble(replyText, 'ai');
    });
}

function displaySpeechBubble(text, role) {
    // Create a new speech bubble element
    const newSpeechBubble = document.createElement('div');
    newSpeechBubble.classList.add('speech', `speech-${role}`, 'blinking-cursor');
    chatbotConversation.appendChild(newSpeechBubble);

    // Call renderTypewriterText to display text with typewriter effect
    renderTypewriterText(text, newSpeechBubble);
}

function renderTypewriterText(text, speechBubble) {
    let i = 0;
    const interval = setInterval(() => {
        speechBubble.textContent += text.slice(i, i + 1);
        if (text.length === i) {
            clearInterval(interval);
            speechBubble.classList.remove('blinking-cursor');
        }
        i++;
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
    }, 10);
}
// Event listener for the reset button
document.getElementById('clear-btn').addEventListener('click', () => {
    // Clearing the chat from the page
    chatbotConversation.innerHTML = '';
    // Resetting the local conversation array
    conversationArr = [];
    // Optionally, you can display an initial message after clearing
    displaySpeechBubble('I\'m here to help you make dinner plans and find a recipe!', 'ai');
});

// You can remove the renderConversationFromDb() function as it's no longer needed.