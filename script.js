// Loader & Musik
const loaderWrapper = document.getElementById('loader-wrapper');
const enterBtn = document.getElementById('enter-btn');
const bgMusic = document.getElementById('bg-music');

if (bgMusic) bgMusic.volume = 0.3;

enterBtn.addEventListener('click', () => {
    loaderWrapper.style.opacity = '0';
    setTimeout(() => loaderWrapper.style.display = 'none', 800);
    if (bgMusic) bgMusic.play().catch(() => console.log("Audio blockiert."));
});

// Mobile Menü
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Toasts
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// === AUTHENTIFIZIERUNG (Hardcoded Accounts) ===
const accounts = {
    "Bianca": { pass: "Bianca", role: "admin" },
    "Mietja": { pass: "Mietja", role: "admin" },
    "Frank": { pass: "Frank", role: "admin" },
    "Lennox": { pass: "Lennox", role: "admin" },
    "Fynn": { pass: "Fynn", role: "user" }
};

let currentUser = null; // Speichert den eingeloggten User

// Modal Elemente
const modal = document.getElementById('login-modal');
const closeBtn = document.getElementById('close-modal');
const authBtn = document.getElementById('authBtn'); // Header Button
const submitLogin = document.getElementById('submit-login');
const userIn = document.getElementById('login-user');
const passIn = document.getElementById('login-pass');
const errorMsg = document.getElementById('login-error');

// Header-Button Logik (Öffnet Modal oder Loggt aus)
authBtn.addEventListener('click', () => {
    if (currentUser) {
        // Logout
        currentUser = null;
        updateUI();
        showToast("Du wurdest abgemeldet.", "error");
    } else {
        // Login Modal öffnen
        modal.classList.add('active');
        userIn.value = '';
        passIn.value = '';
        errorMsg.style.display = 'none';

        // Mobile Menü schließen falls offen
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Modal schließen
closeBtn.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// Login Versuch
submitLogin.addEventListener('click', () => {
    const u = userIn.value.trim();
    const p = passIn.value.trim();

    if (accounts[u] && accounts[u].pass === p) {
        // Erfolg
        currentUser = { name: u, role: accounts[u].role };
        modal.classList.remove('active');
        updateUI();
        showToast(`Willkommen, ${u}! 🚀`);
    } else {
        // Fehler
        errorMsg.style.display = 'block';
    }
});

// UI updaten basierend auf Login
function updateUI() {
    const commentInputs = document.querySelectorAll('.comment-input-area input');
    const commentButtons = document.querySelectorAll('.submit-comment');

    if (currentUser) {
        authBtn.textContent = `Abmelden (${currentUser.name})`;
        authBtn.classList.add('logged-in');

        commentInputs.forEach(input => {
            input.disabled = false;
            input.placeholder = "Schreib was dazu...";
        });
        commentButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.add('active');
        });
    } else {
        authBtn.textContent = "Anmelden";
        authBtn.classList.remove('logged-in');

        commentInputs.forEach(input => {
            input.disabled = true;
            input.value = "";
            input.placeholder = "Erst anmelden zum Kommentieren...";
        });
        commentButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('active');
        });
    }
}

// Interaktionen: Likes
document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        if (!currentUser) {
            showToast("Nur für WG-Mitglieder! Bitte einloggen.", "error");
            return;
        }
        const isLiked = this.classList.toggle('liked');
        const countSpan = this.querySelector('.like-count');
        let count = parseInt(countSpan.textContent);

        if (isLiked) {
            countSpan.textContent = count + 1;
            showToast("Stark! 🔥");
        } else {
            countSpan.textContent = count - 1;
        }
    });
});

// Interaktionen: Teilen
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const shareData = {
            title: btn.getAttribute('data-title'),
            text: 'News aus der WG Wildwuchs!',
            url: window.location.href + btn.getAttribute('data-url')
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { }
        } else {
            navigator.clipboard.writeText(shareData.url);
            showToast("Link kopiert! 🔗");
        }
    });
});

// Interaktionen: Kommentare posten
document.querySelectorAll('.submit-comment').forEach(button => {
    button.addEventListener('click', (e) => {
        if (!currentUser) return;

        const postId = e.target.getAttribute('data-postid');
        const inputField = document.getElementById(`input-${postId}`);
        const commentText = inputField.value.trim();

        if (commentText !== "") {
            const commentList = document.getElementById(`comments-${postId}`);
            const newComment = document.createElement('div');
            newComment.classList.add('comment');

            // Wenn Admin, extra Style und Krone
            if (currentUser.role === 'admin') {
                newComment.classList.add('admin-comment');
                newComment.innerHTML = `<strong>👑 ${currentUser.name}:</strong> ${commentText}`;
            } else {
                newComment.innerHTML = `<strong>${currentUser.name}:</strong> ${commentText}`;
            }

            commentList.appendChild(newComment);
            inputField.value = "";
            showToast("Gesendet! 💬");
        }
    });
});

// Init
updateUI();
