import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";


// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDrrtaBVZsXdOewYAZpno57CaDUXnfLPZI",
  authDomain: "chatapp-assignment-e6c47.firebaseapp.com",
  databaseURL: "https://chatapp-assignment-e6c47-default-rtdb.firebaseio.com",
  projectId: "chatapp-assignment-e6c47",
  storageBucket: "chatapp-assignment-e6c47.appspot.com",
  messagingSenderId: "917567801196",
  appId: "1:917567801196:web:506da5c572971f18f81549",
  measurementId: "G-CQE6927414"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// ===============================
// 🔹 SIGNUP
// ===============================
window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Signup successful!");
      window.location.href = "popup.html";
    })
    .catch((error) => alert(error.message));
};

// ===============================
// 🔹 LOGIN
// ===============================
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "popup.html";
    })
    .catch((error) => alert(error.message));
};

// ===============================
// 🔹 GOOGLE SIGN-IN
// ===============================
window.googleSignIn = function () {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Google login successful!");
      window.location.href = "popup.html";
    })
    .catch((error) => alert(error.message));
};

// ===============================
// 🔹 ENTER CHAT
// ===============================
window.enterChat = function () {
  const username = document.getElementById("popupUsername").value.trim();
  if (!username) return alert("Please enter a username");

  localStorage.setItem("username", username);
  window.location.href = "chatApp.html";
};

// ===============================
// 🔹 SEND MESSAGE
// ===============================
window.sendMessage = function () {
  const message = document.getElementById("message").value.trim();
  const username = localStorage.getItem("username");
  if (message === "") return;

  push(ref(db, "messages"), { username, message })
    .then(() => (document.getElementById("message").value = ""))
    .catch((error) => alert("Error sending message: " + error.message));
};

// ===============================
// 🔹 DELETE MESSAGE
// ===============================
function deleteMessage(messageId, messageElement) {
  remove(ref(db, `messages/${messageId}`))
    .then(() => messageElement.remove())
    .catch((error) => alert("Error deleting message: " + error.message));
}

// ===============================
// 🔹 EDIT MESSAGE
// ===============================
function editMessage(messageId, messageElement, oldText) {
  const newText = prompt("Edit your message:", oldText);
  if (newText && newText.trim() !== "") {
    update(ref(db, `messages/${messageId}`), { message: newText })
      .then(() => {
        messageElement.querySelector(".message-text").textContent = newText;
      })
      .catch((error) => alert("Error updating message: " + error.message));
  }
}

// ===============================
// 🔹 LOGOUT
// ===============================
window.logout = function () {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("username");
      window.location.href = "index.html";
    })
    .catch((error) => alert("Error logging out: " + error.message));
};

// ===============================
// 🔹 LOAD MESSAGES IN CHAT
// ===============================
window.onload = function () {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;

  const currentUsername = localStorage.getItem("username");

  onChildAdded(ref(db, "messages"), (snapshot) => {
    const data = snapshot.val();
    const messageId = snapshot.key;

    const container = document.createElement("div");
    container.classList.add("message-container");
    container.classList.add(data.username === currentUsername ? "sent" : "received");

    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper");

    const letterCircle = document.createElement("div");
    letterCircle.classList.add("letter-circle");
    letterCircle.textContent = data.username.charAt(0).toUpperCase();

    const textWrapper = document.createElement("div");
    const name = document.createElement("div");
    name.classList.add("username");
    name.textContent = data.username;

    const msg = document.createElement("div");
    msg.classList.add("message-text");
    msg.textContent = data.message;

    textWrapper.appendChild(name);
    textWrapper.appendChild(msg);
    wrapper.appendChild(letterCircle);
    wrapper.appendChild(textWrapper);

    // Buttons only for current user's messages
   if (data.username === currentUsername) {
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("btn-container");

  // ✏️ Edit Button (emoji)
  const editBtn = document.createElement("span");
  editBtn.textContent = "✏️"; // ✏️ emoji
  editBtn.classList.add("edit-icon");
  editBtn.title = "Edit message";
  editBtn.addEventListener("click", () =>
    editMessage(messageId, container, data.message)
  );

  // 🗑️ Delete Button (emoji)
  const delBtn = document.createElement("span");
  delBtn.textContent = "🗑️"; // trash emoji
  delBtn.classList.add("delete-icon");
  delBtn.title = "Delete message";
  delBtn.addEventListener("click", () => {
    if (confirm("Delete this message?")) deleteMessage(messageId, container);
  });

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(delBtn);
  wrapper.appendChild(btnContainer);
}


    container.appendChild(wrapper);
    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // THEME TOGGLE
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    let isDark = false;
    themeToggleBtn.addEventListener("click", () => {
      document.body.style.backgroundColor = isDark ? "white" : "black";
      document.body.style.color = isDark ? "black" : "white";
      isDark = !isDark;
    });
  }
};
