const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const nameEl = document.getElementById("businessName");

let business = null;

function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `msg ${role}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
    return row;
}

function addFollowUp() {
    const box = document.createElement("div");
    box.className = "followup";
    box.innerHTML = "<span>Anything else you'd like to know?</span>";

    const yes = document.createElement("button");
    yes.textContent = "Yes, I have another question";
    yes.onclick = () => {
        input.focus();
        box.remove();
    };

    const no = document.createElement("button");
    no.textContent = "No, rate my experience";
    no.onclick = () => {
        box.querySelectorAll("button").forEach(b => b.remove());
        const label = document.createElement("span");
        label.textContent = "How was your experience?";
        box.prepend(label);
        addRatingButtons(box);
    };

    box.appendChild(yes);
    box.appendChild(no);
    chat.appendChild(box);
    chat.scrollTop = chat.scrollHeight;
}

function addRatingButtons(box) {
    const wrap = document.createElement("span");
    wrap.className = "rating";
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.title = `${i} out of 5`;
        btn.onclick = async () => {
            try {
                await fetch("/api/rating", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({rating: i})
                });
            } catch (e) {
                console.error(e);
            }
            wrap.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            const thank = document.createElement("span");
            thank.textContent = " Thank you for your feedback! ⭐";
            box.appendChild(thank);
        };
        wrap.appendChild(btn);
    }
    box.appendChild(wrap);
}

async function loadBusiness() {
    try {
        const response = await fetch("/api/business");
        business = await response.json();
        nameEl.textContent = business.name;
    } catch (error) {
        console.error("Business loading error:", error);
    }
}

async function loadHistory() {
    try {
        const response = await fetch("/api/history");
        const history = await response.json();
        if (!history.length) {
            addMessage("assistant",
                "Hello! 👋 Welcome to Padmavathi Embroidery Works & Boutiques.\n\n" +
                "I can help you with computer embroidery, customized designs, DTF stickers, " +
                "products, prices, orders, address, phone number and business hours.\n\n" +
                "What would you like to know?"
            );
            return;
        }
        history.forEach(item => addMessage(item.role, item.message));
    } catch (error) {
        console.error("History error:", error);
        addMessage("assistant", "Hello! 👋 How can I help you today?");
    }
}

async function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    addMessage("user", text);
    input.value = "";
    input.disabled = true;

    const typing = addMessage("assistant", "Typing…");

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message: text})
        });
        const data = await response.json();
        typing.remove();
        addMessage("assistant", data.answer || data.error || "Something went wrong.");
        addFollowUp();
    } catch (error) {
        typing.remove();
        addMessage("assistant", "I couldn't connect to the server. Please try again.");
    } finally {
        input.disabled = false;
        input.focus();
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value);
});

document.querySelectorAll(".suggestions button").forEach(button => {
    button.addEventListener("click", () => sendMessage(button.textContent));
});

document.getElementById("clearBtn").addEventListener("click", async () => {
    try {
        await fetch("/api/new-chat", {method: "POST"});
    } catch (e) {
        console.error(e);
    }
    chat.innerHTML = "";
    addMessage("assistant",
        "New chat started. 👋\n\nWhat would you like to know about Padmavathi Embroidery Works & Boutiques?"
    );
    input.focus();
});

(async function start() {
    await loadBusiness();
    await loadHistory();
    input.focus();
})();
