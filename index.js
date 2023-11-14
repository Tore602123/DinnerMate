import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'

import { Configuration, OpenAIApi } from 'openai'
import { process } from './env'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const appSettings = {
    databaseURL: 'https://dinnermate-18faa-default-rtdb.europe-west1.firebasedatabase.app//'
}

const app = initializeApp(appSettings)

const database = getDatabase(app)

const conversationInDb = ref(database)

const chatbotConversation = document.getElementById('chatbot-conversation')

const instructionObj = {
    role: 'system',
    content: 'You are a helpful cook that will suggest one dinner with recipe. Consider the user’s likes, dislikes, allergies, and the number of people they are cooking for. ',
}

document.addEventListener('submit', (e) => {
    e.preventDefault();
    const likesInput = document.getElementById('likes-input').value;
    const dislikesInput = document.getElementById('dislikes-input').value;
    const allergiesInput = document.getElementById('allergies-input').value;
    const numberOfPeopleInput = document.getElementById('number-of-people-input').value;
    
    const userInputCombined = `Likes: ${likesInput}, Dislikes: ${dislikesInput}, Allergies: ${allergiesInput}, Number of People: ${numberOfPeopleInput}`;

    push(conversationInDb, {
        role: 'user',
        content: userInputCombined
    });

    fetchReply();
    
    const newSpeechBubble = document.createElement('div');
    newSpeechBubble.classList.add('speech', 'speech-human');
    chatbotConversation.appendChild(newSpeechBubble);
    newSpeechBubble.textContent = userInputCombined;
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

function fetchReply() {
    get(conversationInDb).then(async (snapshot) => {
        if (snapshot.exists()) {
            const conversationArr = Object.values(snapshot.val())
            conversationArr.unshift(instructionObj)
            const response = await openai.createChatCompletion({
                model: 'gpt-4-1106-preview',
                messages: conversationArr,
                presence_penalty: 0,
                frequency_penalty: 0.3
            })
            push(conversationInDb, response.data.choices[0].message)
            renderTypewriterText(response.data.choices[0].message.content)
        }
        else {
            console.log('No data available')
        }

    })
}

function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i - 1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 10)
}

document.getElementById('clear-btn').addEventListener('click', () => {
    remove(conversationInDb)
    chatbotConversation.innerHTML = '<div class="speech speech-ai">Im here to help you make dinner plans and find a recipe!</div>'
})

function renderConversationFromDb(){
    get(conversationInDb).then(async (snapshot)=>{
        if(snapshot.exists()) {
            Object.values(snapshot.val()).forEach(dbObj => {
                const newSpeechBubble = document.createElement('div')
                newSpeechBubble.classList.add(
                    'speech',
                    `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                    )
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = dbObj.content
            })
            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
        }
    })
}

renderConversationFromDb()