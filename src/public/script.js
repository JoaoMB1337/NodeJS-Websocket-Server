let ws;
let countdownTime = 0;
let countdownTimer = null;

document.getElementById('joinBtn').addEventListener('click', connect);

function connect() {
    const username = document.getElementById('username').value;
    const room = document.getElementById('room').value;

    if (!username || !room) {
        alert('Por favor, insira um nome e uma sala');
        return;
    }

    ws = new WebSocket(`ws://192.168.1.214:3000?room=${encodeURIComponent(room)}&username=${encodeURIComponent(username)}`);

    ws.onopen = () => {
        console.log('Conectado ao servidor');
        document.getElementById('username').disabled = true;
        document.getElementById('room').disabled = true;
        document.getElementById('roomName').textContent = room;
        addMessage(`Você entrou na sala ${room}`, true);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'startCountdown') {
            startCountdown(data.countdownTime); // Iniciar contagem regressiva
        } else if (data.type === 'userList') {
            updateUserList(data.users);
        } else if (data.type === 'trainingData') {
            addMessage(`${data.username}: ${data.timestamp} - ${data.speed} km/h - ${data.distance} km`);
        }
    };

    ws.onclose = () => {
        console.log('Desconectado do servidor');
        addMessage('Você saiu da sala', true);
    };

    ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
    };
}

function startCountdown(seconds) {
    countdownTime = seconds;
    updateCountdownDisplay();

    countdownTimer = setInterval(() => {
        if (countdownTime <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            startTrainingSession(); // Começar a enviar dados de treino
        } else {
            countdownTime--;
            updateCountdownDisplay();
        }
    }, 1000);
}

function updateCountdownDisplay() {
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = `Início em: ${countdownTime}s`;
}

function startTrainingSession() {
    console.log('Iniciando treino...');
    
    // Simulação de envio de dados de treino
    setInterval(() => {
        const trainingData = {
            type: 'trainingData',
            timestamp: Date.now(),
            speed: (Math.random() * 20).toFixed(2),
            distance: (Math.random() * 5).toFixed(2),
            spm: (Math.random() * 50).toFixed(2),
            watts: (Math.random() * 300).toFixed(2)
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(trainingData)); // Enviar dados de treino para o servidor
        }
    }, 1000); // Envia dados a cada 1 segundo (exemplo)
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
