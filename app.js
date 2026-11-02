
const $ = id => document.getElementById(id);

let profile = {};
let history = [];
let soundOn = true;
let ended = false;

function show(id) {
  ["intro", "setup", "chatScreen", "reveal"].forEach(x =>
    $(x).classList.toggle("hidden", x !== id)
  );
}

$("startBtn").onclick = () => show("setup");
$("backBtn").onclick = () => show("setup");

$("soundBtn").onclick = () => {
  soundOn = !soundOn;
  $("soundBtn").innerHTML = soundOn
    ? "♫ <small>Sound on</small>"
    : "♫ <small>Muted</small>";
};

$("setupForm").onsubmit = e => {
  e.preventDefault();

  profile = {
    name: $("personName").value.trim(),
    relationship: $("relationship").value,
    nickname: $("nickname").value.trim(),
    personality: $("personality").value.trim(),
    memory: $("memory").value.trim()
  };

  history = [];
  ended = false;
  $("messages").innerHTML = "";

  add(
    profile.nickname
      ? `hey, ${profile.nickname}. been a while, hasn't it?`
      : "hey. you finally answered.",
    false
  );

  show("chatScreen");
};

function add(text, sent) {
  const b = document.createElement("div");
  b.className = "bubble " + (sent ? "sent" : "received");
  b.textContent = text;
  $("messages").appendChild(b);
  $("messages").scrollTop = $("messages").scrollHeight;
}

function clean(t) {
  return t.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'");
}

function asksAboutDeath(text) {
  const s = clean(text);

  return [
    /\bhow did you die\b/,
    /\bhow did u die\b/,
    /\bhow were you killed\b/,
    /\bwhat killed you\b/,
    /\bwhat was your cause of death\b/,
    /\bcause of death\b/,
    /\bhow did you pass away\b/,
    /\bwhy did you die\b/,
    /\bwhat happened when you died\b/,
    /\bpaano ka namatay\b/,
    /\bpano ka namatay\b/,
    /\bkelan ka namatay\b/,
    /\bano ikinamatay mo\b/,
    /\bano ang ikinamatay mo\b/,
    /\bbakit ka namatay\b/,
    /\bsino pumatay sayo\b/,
    /\bsino ang pumatay sayo\b/,
    /\bpinatay ka ba\b/,
    /\bano nangyari nung namatay ka\b/,
    /\bwhat happened to you before you died\b/
  ].some(p => p.test(s));
}

function reveal() {
  ended = true;
  $("typing").classList.add("hidden");
  $("revealText").textContent =
    `WHO TOLD YOU I WAS ${profile.name.toUpperCase()}?`;

  show("reveal");

  if (soundOn) {
    const a = $("sting");
    a.currentTime = 0;
    a.volume = 0.85;
    a.play().catch(() => {});
  }
}

$("messageForm").onsubmit = async e => {
  e.preventDefault();

  const text = $("messageInput").value.trim();
  if (!text || ended) return;

  add(text, true);
  $("messageInput").value = "";

  if (asksAboutDeath(text)) {
    reveal();
    return;
  }

  history.push({ role: "user", content: text });

  $("typing").classList.remove("hidden");
  $("messageInput").disabled = true;

  try {
    const r = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, history })
    });

    const d = await r.json();

    if (!r.ok) throw new Error(d.error || "Chat service unavailable");

    $("typing").classList.add("hidden");
    add(d.reply, false);

    history.push({ role: "assistant", content: d.reply });

  } catch (err) {
    $("typing").classList.add("hidden");
    add(
      "sorry, baby. something interrupted the connection. try again in a moment.",
      false
    );
    console.error(err);

  } finally {
    $("messageInput").disabled = false;
    $("messageInput").focus();
  }
};

$("replayBtn").onclick = () => {
  show("intro");
  history = [];
  ended = false;
};
