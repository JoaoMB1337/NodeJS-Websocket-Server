let ws;

function connect() {
    const username = document.getElementById('username').value;
    const room = document.getElementById('room').value;
    
    if (!username || !room) {
        alert('Por favor, insira um nome e uma sala');
        return;
    }

    ws = new WebSocket(`ws://localhost:3000?room=${encodeURIComponent(room)}&username=${encodeURIComponent(username)}`);

    ws.onopen = () => {
        console.log('Conectado ao servidor');
        document.getElementById('message').disabled = false;
        document.getElementById('sendBtn').disabled = false;
        document.getElementById('username').disabled = true;
        document.getElementById('room').disabled = true;
        
        addMessage(`Você entrou na sala ${room}`, true);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'userList') {
            updateUserList(data.users);
            const myUsername = document.getElementById('username').value;
            const newUser = data.users.find(user => user !== myUsername && !document.querySelector(`#userList li[data-username="${user}"]`));
            if (newUser) {
                addMessage(`${newUser} entrou na sala`, true);
                provideVisualFeedback(newUser);
                playJoinSound(); 
            }
        } else if (data.type === 'message') {
            addMessage(`${data.username}: ${data.content}`);
        }
    };

    ws.onclose = (event) => {
        console.log('Desconectado do servidor', event.code, event.reason);
        document.getElementById('sendBtn').disabled = true;
        document.getElementById('username').disabled = false;
        document.getElementById('room').disabled = false;
        addMessage('Você saiu da sala', true);
        clearUserList();
    };

    ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
    };
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    
    if (message && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        messageInput.value = '';
    }
}

function addMessage(message, isSystem = false) {
    const messagesList = document.getElementById('messages');
    const li = document.createElement('li');
    li.textContent = message;
    if (isSystem) {
        li.classList.add('system-message');
    }
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight; // Auto-scroll
}

function updateUserList(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    
    users.forEach(username => {
        const li = document.createElement('li');
        li.textContent = username;
        li.setAttribute('data-username', username); 
        userList.appendChild(li);
    });
}

function clearUserList() {
    document.getElementById('userList').innerHTML = '';
}

function provideVisualFeedback(username) {
    const userElement = document.querySelector(`#userList li[data-username="${username}"]`);
    if (userElement) {
        userElement.classList.add('highlight');
        setTimeout(() => userElement.classList.remove('highlight'), 2000);
    }
}

function playJoinSound() {
    const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3'); // URL de exemplo
    audio.play().catch(err => console.log('Erro ao tocar som:', err));
}