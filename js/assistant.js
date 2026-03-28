// ========== مساعد تاوريرت بالدارجة ==========
let assistantMessages = [];
let isOpen = false;

function toggleAssistant() {
    const panel = document.getElementById('assistantPanel');
    if (isOpen) {
        panel.style.display = 'none';
        isOpen = false;
    } else {
        panel.style.display = 'flex';
        isOpen = true;
        if (assistantMessages.length === 0) {
            addMessage('مرحبا بيك فمساعد تاوريرت! 🤖\nشنو كتسقسي عليه؟', 'bot');
        }
    }
}

function addMessage(text, sender) {
    const container = document.getElementById('assistantMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `<div class="message-text">${text}</div>`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    assistantMessages.push({ text, sender });
}

function sendMessage() {
    const input = document.getElementById('assistantInput');
    const question = input.value.trim();
    if (!question) return;
    
    addMessage(question, 'user');
    input.value = '';
    
    // البحث في Supabase
    searchAnswer(question);
}

async function searchAnswer(question) {
    try {
        // البحث في قاعدة البيانات
        const response = await fetch(`${SUPABASE_URL}/rest/v1/assistant_answers?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const answers = await response.json();
        
        // البحث عن إجابة مناسبة
        let foundAnswer = null;
        let bestMatch = 0;
        
        for (let a of answers) {
            let match = 0;
            // البحث في السؤال
            if (question.includes(a.question) || a.question.includes(question)) {
                match += 10;
            }
            // البحث في الكلمات المفتاحية
            if (a.keywords) {
                for (let kw of a.keywords) {
                    if (question.includes(kw)) {
                        match += 3;
                    }
                }
            }
            if (match > bestMatch) {
                bestMatch = match;
                foundAnswer = a;
            }
        }
        
        if (foundAnswer && bestMatch > 0) {
            addMessage(foundAnswer.answer, 'bot');
        } else {
            addMessage('سمح ليا ما عرفتش. تقدر تسالي الصيدلية مباشرة من خلال قسم "الصيدليات". ولا تحاول تسأل بطريقة مختلفة.', 'bot');
        }
        
    } catch (error) {
        console.error(error);
        addMessage('عفوا، عندي مشكل فالاتصال. جرب مرة أخرى.', 'bot');
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// إضافة زر المساعد إلى الصفحة
function addAssistantButton() {
    const btn = document.createElement('div');
    btn.id = 'assistantBtn';
    btn.className = 'assistant-btn';
    btn.innerHTML = '<i class="fas fa-robot"></i>';
    btn.onclick = toggleAssistant;
    document.body.appendChild(btn);
    
    const panel = document.createElement('div');
    panel.id = 'assistantPanel';
    panel.className = 'assistant-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="assistant-header">
            <span><i class="fas fa-robot"></i> مساعد تاوريرت</span>
            <span class="assistant-close" onclick="toggleAssistant()">✖</span>
        </div>
        <div class="assistant-messages" id="assistantMessages"></div>
        <div class="assistant-input">
            <input type="text" id="assistantInput" placeholder="اسقسي بالدارجة...">
            <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    document.body.appendChild(panel);
    
    document.getElementById('assistantInput').addEventListener('keypress', handleKeyPress);
}

// إضافة CSS
function addAssistantCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .assistant-btn {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 55px;
            height: 55px;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(59,130,246,0.4);
            z-index: 999;
            transition: all 0.3s;
        }
        .assistant-btn:hover {
            transform: scale(1.1);
        }
        .assistant-btn i {
            font-size: 28px;
            color: white;
        }
        .assistant-panel {
            position: fixed;
            bottom: 90px;
            left: 20px;
            width: 350px;
            height: 500px;
            background: #1e293b;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 1000;
            overflow: hidden;
            border: 1px solid #334155;
        }
        .assistant-header {
            background: #0f172a;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #334155;
        }
        .assistant-header span:first-child {
            color: #22d3ee;
            font-weight: bold;
        }
        .assistant-close {
            cursor: pointer;
            color: #94a3b8;
            font-size: 20px;
        }
        .assistant-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message {
            max-width: 85%;
            padding: 10px 12px;
            border-radius: 15px;
            font-size: 14px;
            line-height: 1.4;
        }
        .message.user {
            background: #3b82f6;
            align-self: flex-end;
            border-bottom-left-radius: 5px;
        }
        .message.bot {
            background: #334155;
            align-self: flex-start;
            border-bottom-right-radius: 5px;
        }
        .assistant-input {
            display: flex;
            padding: 12px;
            border-top: 1px solid #334155;
            gap: 8px;
        }
        .assistant-input input {
            flex: 1;
            padding: 10px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 25px;
            color: white;
            outline: none;
        }
        .assistant-input button {
            background: #3b82f6;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: white;
            cursor: pointer;
        }
        @media (max-width: 480px) {
            .assistant-panel {
                width: calc(100% - 40px);
                left: 20px;
                right: 20px;
                bottom: 90px;
            }
        }
    `;
    document.head.appendChild(style);
}

// تشغيل المساعد
addAssistantCSS();
addAssistantButton();
