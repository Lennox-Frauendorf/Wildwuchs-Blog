let currentUser = localStorage.getItem("currentUser");

// Mainaccount (Admin) bei Systemstart anlegen, falls noch nicht vorhanden
if (!localStorage.getItem("user_admin")) {
    localStorage.setItem("user_admin", "wildwuchs");
}

window.onload = () => {
    // Theme laden
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("themeToggle").innerText = "☀️";
    }

    // Scroll Bar Event
    window.addEventListener("scroll", () => {
        let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.getElementById("progressBar").style.width = (winScroll / height * 100) + "%";
    });

    // Check Login Status
    if (currentUser) {
        showUser();
    }

    loadComments();
    loadLikes();

    // Terminal Input Listener
    const termInput = document.getElementById("terminalInput");
    termInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            let val = this.value.trim();
            if (val) processCommand(val);
            this.value = "";
        }
    });
};

// --- THEME ---
function toggleTheme() {
    let body = document.body;
    let btn = document.getElementById("themeToggle");
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        btn.innerText = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        btn.innerText = "🌙";
    }
}

// --- TERMINAL & LOGIN ---
function openTerminal() {
    document.getElementById("terminalOverlay").classList.remove("hidden");
    setTimeout(() => document.getElementById("terminalInput").focus(), 100);
}

function closeTerminal() {
    document.getElementById("terminalOverlay").classList.add("hidden");
}

function printToTerminal(text, type = "system") {
    const termBody = document.getElementById("terminalBody");
    const line = document.createElement("div");
    line.className = `terminal-line ${type}`;
    line.innerText = text;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
}

function processCommand(cmd) {
    printToTerminal(`guest@wildwuchs:~$ ${cmd}`);

    if (cmd.startsWith("/register as ")) {
        let creds = cmd.replace("/register as ", "").split("&");
        if (creds.length === 2) {
            let user = creds[0].trim();
            let pass = creds[1].trim();
            if (localStorage.getItem("user_" + user)) {
                printToTerminal(`Fehler: Nutzer '${user}' existiert bereits.`, "error");
            } else {
                localStorage.setItem("user_" + user, pass);
                printToTerminal(`Erfolg: Nutzer '${user}' registriert. Du kannst dich jetzt einloggen.`, "success");
            }
        } else {
            printToTerminal("Syntax-Fehler: /register as username&password", "error");
        }
    }
    else if (cmd.startsWith("/login as ")) {
        let creds = cmd.replace("/login as ", "").split("&");
        if (creds.length === 2) {
            let user = creds[0].trim();
            let pass = creds[1].trim();
            let storedPassword = localStorage.getItem("user_" + user);

            if (storedPassword === pass) {
                printToTerminal(`Login erfolgreich. Willkommen, ${user}.`, "success");
                localStorage.setItem("currentUser", user);
                currentUser = user;

                setTimeout(() => {
                    closeTerminal();
                    showUser();
                }, 1000);
            } else {
                printToTerminal("Zugriff verweigert. Falsche Daten.", "error");
            }
        } else {
            printToTerminal("Syntax-Fehler: /login as username&password", "error");
        }
    } else {
        printToTerminal(`Befehl nicht gefunden.`, "error");
    }
}

// --- USER & FEATURES ---
function showUser() {
    let welcome = document.getElementById("welcomeUser");
    welcome.innerText = currentUser;
    welcome.classList.remove("hidden");

    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("logoutBtn").classList.remove("hidden");

    document.getElementById("commentForm").classList.remove("hidden");
    document.getElementById("loginHint").classList.add("hidden");

    updateLikeUI();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

// --- LIKE SYSTEM (1 pro Profil) ---
function toggleLike() {
    if (!currentUser) {
        alert("Bitte melde dich an, um diesen Beitrag zu liken. (Tipp: Klicke auf 'Anmelden')");
        return;
    }

    let likedUsers = JSON.parse(localStorage.getItem("liked_users")) || [];
    let likes = parseInt(localStorage.getItem("post_likes") || "0");
    let btn = document.getElementById("likeBtn");
    let icon = document.getElementById("likeIcon");

    let index = likedUsers.indexOf(currentUser);

    if (index === -1) {
        // Noch nicht geliket -> Like hinzufügen
        likedUsers.push(currentUser);
        likes++;
    } else {
        // Bereits geliket -> Like entfernen
        likedUsers.splice(index, 1);
        likes--;
    }

    localStorage.setItem("liked_users", JSON.stringify(likedUsers));
    localStorage.setItem("post_likes", likes);

    document.getElementById("likeCount").innerText = likes;
    updateLikeUI();
}

function updateLikeUI() {
    if (!currentUser) return;
    let likedUsers = JSON.parse(localStorage.getItem("liked_users")) || [];
    let btn = document.getElementById("likeBtn");
    let icon = document.getElementById("likeIcon");

    if (likedUsers.includes(currentUser)) {
        btn.classList.add("liked");
        icon.innerText = "❤️";
    } else {
        btn.classList.remove("liked");
        icon.innerText = "🤍";
    }
}

function loadLikes() {
    let likes = localStorage.getItem("post_likes") || "0";
    document.getElementById("likeCount").innerText = likes;
}

function sharePost() {
    alert("Link wurde in die Zwischenablage kopiert! (Simulation)");
}

function focusComment() {
    if (currentUser) {
        document.getElementById("commentInput").focus();
    } else {
        openTerminal();
    }
}

// --- KOMMENTARE ---
function addComment() {
    let text = document.getElementById("commentInput").value.trim();
    if (!text) return;

    let comments = JSON.parse(localStorage.getItem("comments")) || [];
    comments.push({
        user: currentUser,
        text: text,
        date: new Date().toLocaleDateString('de-DE')
    });
    localStorage.setItem("comments", JSON.stringify(comments));

    document.getElementById("commentInput").value = "";
    loadComments();
}

function loadComments() {
    let comments = JSON.parse(localStorage.getItem("comments")) || [];
    let container = document.getElementById("comments");
    container.innerHTML = "";

    if (comments.length === 0) {
        container.innerHTML = "<p style='color: var(--text-muted);'>Noch keine Kommentare vorhanden. Sei der Erste!</p>";
        return;
    }

    comments.forEach(c => {
        container.innerHTML += `
            <div class="comment">
                <div class="comment-header">
                    <span>${c.user}</span>
                    <span class="comment-time">${c.date}</span>
                </div>
                <p>${c.text}</p>
            </div>
        `;
    });
}