const $ = id => document.getElementById(id);
let profile = {}, history = [], soundOn = true, ended = false, turn = 0;

function show(id) {
  ["intro", "setup", "chatScreen", "reveal"].forEach(x => $(x).classList.toggle("hidden", x !== id));
}

$("startBtn").onclick = () => show("setup");
$("backBtn").onclick = () => show("setup");
$("soundBtn").onclick = () => {
  soundOn = !soundOn;
  $("soundBtn").innerHTML = soundOn ? "♫ <small>Sound on</small>" : "♫ <small>Muted</small>";
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
  turn = 0;
  ended = false;
  $("messages").innerHTML = "";
  const hello = profile.nickname
    ? `hey, ${profile.nickname}. been a while, hasn't it?`
    : "hey. you finally answered.";
  add(hello, false);
  history.push(hello);
  show("chatScreen");
  $("messageInput").focus();
};

function add(text, sent) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + (sent ? "sent" : "received");
  bubble.textContent = text;
  $("messages").appendChild(bubble);
  $("messages").scrollTop = $("messages").scrollHeight;
}

function clean(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "'");
}

function asksAboutDeath(text) {
  const s = clean(text);
  return [
    /\bhow did you die\b/, /\bhow did u die\b/, /\bhow were you killed\b/,
    /\bwhat killed you\b/, /\bwhat was your cause of death\b/, /\bcause of death\b/,
    /\bhow did you pass away\b/, /\bwhy did you die\b/, /\bwhat happened when you died\b/,
    /\bpaano ka namatay\b/, /\bpano ka namatay\b/, /\bkelan ka namatay\b/,
    /\bano ikinamatay mo\b/, /\bano ang ikinamatay mo\b/, /\bbakit ka namatay\b/,
    /\bsino pumatay sayo\b/, /\bsino ang pumatay sayo\b/, /\bpinatay ka ba\b/,
    /\bano nangyari nung namatay ka\b/, /\bwhat happened to you before you died\b/
  ].some(pattern => pattern.test(s));
}

function makeReply(text) {
  const s = clean(text);
  const name = profile.name || "me";
  const nick = profile.nickname;
  const call = nick ? nick : "you";
  const memory = profile.memory;
  const personality = clean(profile.personality);
  const playful = /funny|playful|teas|makulit|joker|sarcastic/.test(personality);
  const gentle = /gentle|soft|kind|sweet|quiet|calm|maalaga/.test(personality);

  if (/\b(who is this|who are you|sino to|sino ka|who's this)\b/.test(s))
    return `it's ${name}. don't tell me you forgot my number already.`;
  if (/\b( miss you|i miss u|miss u|miss kita|namimiss kita|i missed you)\b/.test(" " + s))
    return `i miss you too, ${call}. more than you know.`;
  if (/\b(love you|i love u|mahal kita|i love you)\b/.test(s))
    return gentle ? `i love you too. i hope you never forget that.` : `you always know how to make me smile. love you too.`;
  if (/\b(hello|hi|hey|hii|good morning|good night|kumusta|kamusta)\b/.test(s))
    return playful ? `well, look who finally decided to text me. what's up?` : `hey, ${call}. how have you been?`;
  if (/\b(where are you|nasaan ka|asan ka|where have you been)\b/.test(s))
    return `somewhere quiet. but don't worry about that. tell me about you.`;
  if (/\b(are you real|totoo ka ba|is this real|is this really you)\b/.test(s))
    return `you tell me. does this sound like someone else to you?`;
  if (/\b(remember|naalala|do you still remember|you remember)\b/.test(s)) {
    if (memory) return `of course i remember. ${memory} how could i forget something like that?`;
    return `i remember more than you think. what memory are you thinking about?`;
  }
  if (/\b(sorry|im sorry|i'm sorry|pasensya|patawad)\b/.test(s))
    return `hey. you don't have to explain everything right now. i'm listening.`;
  if (/\b(what are you doing|wyd|anong ginagawa mo|ano ginagawa mo)\b/.test(s))
    return `just thinking about you, actually. what are you doing?`;
  if (/\b(are you okay|okay ka lang|you okay|are u okay)\b/.test(s))
    return `i'm okay. promise. are you taking care of yourself?`;
  if (/\b(tell me something|say something|talk to me|kwentuhan|please reply)\b/.test(s))
    return `i was hoping you'd have more to tell me. what's been happening in your life?`;
  if (/\b(hate you|i hate you|galit ako sayo|i'm angry)\b/.test(s))
    return `that's okay. you can be honest with me. i want to hear what you're really feeling.`;
  if (/\b(bye|goodbye|i have to go|alis na ako|talk later)\b/.test(s))
    return `already? stay a little longer. i just got to talk to you.`;

  const fallback = [
    `tell me more, ${call}. i'm listening.`,
    `you know you can tell me anything, right?`,
    `that's interesting. what made you think of that?`,
    `i wish i could hear you say that instead of reading it.`,
    `has it really been that long since we talked?`,
    `i've been wondering how you've been. tell me honestly.`,
    `you sound different today. is everything alright?`,
    `i'm here. keep talking.`,
    `do you still think about the little things we used to do?`,
    `i remember the way you used to tell me everything.`
  ];
  if (memory && turn % 4 === 2) return `i keep thinking about this: ${memory}. do you still remember it?`;
  if (playful && turn % 3 === 0) return `you're still like that, huh? some things never change.`;
  return fallback[turn % fallback.length];
}

$("messageForm").onsubmit = e => {
  e.preventDefault();
  const text = $("messageInput").value.trim();
  if (!text || ended) return;
  add(text, true);
  $("messageInput").value = "";
  if (asksAboutDeath(text)) {
    reveal();
    return;
  }
  turn++;
  $("typing").classList.remove("hidden");
  window.setTimeout(() => {
    if (ended) return;
    $("typing").classList.add("hidden");
    const reply = makeReply(text);
    add(reply, false);
    history.push(text, reply);
  }, 650 + Math.min(text.length * 8, 900));
};

function reveal() {
  ended = true;
  $("typing").classList.add("hidden");
  $("revealText").textContent = `WHO TOLD YOU I WAS ${profile.name.toUpperCase()}?`;
  show("reveal");
  if (soundOn) {
    const audio = $("sting");
    audio.currentTime = 0;
    audio.volume = 0.85;
    audio.play().catch(() => {});
  }
}

$("replayBtn").onclick = () => {
  show("intro");
  history = [];
  ended = false;
};
