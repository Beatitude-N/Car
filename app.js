
const prompt = document.getElementById("prompt")
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;






function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
          <span>${isAi ? '🤖' : '👱‍♂️'}</span>
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

// const apiKey = '691b86f2e9c0cda6390b12cf3026706f96dc6c55'; // Replace with 'YOUR_API_KEY'
// const apiUrl = 'https://extractorapi.com/api/v1/extractor';

// const shortenButton = document.getElementById('shorten-button');
// const longUrlInput = document.getElementById('long-url');
// const shortUrlInput = document.getElementById('short-url');

// shortenButton.addEventListener('click', async (event) => {
//   event.preventDefault();
//   const longUrl = longUrlInput.value.trim();

//   const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

//   if (longUrl === '' || !urlRegex.test(longUrl)) {
//     alert('Please enter a valid URL.');
//     return;
//   }

//   const endpoint = apiUrl + '?apikey=' + apiKey + '&url=' + encodeURIComponent(longUrl);

//   try {
//     const response = await fetch(endpoint);
//     const result = await response.json();
//     const shortUrl = result.text;
//     shortUrlInput.textContent = shortUrl;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// });


const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const wowValue = data.get('wow');
  const chattextValue = data.get('chattext');

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('wow'));

  // to clear the textarea input
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);


  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.openai.com/v1/completions', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer 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');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      const responseData = JSON.parse(this.responseText);
      const completion = responseData.choices[0].text.trim();

      clearInterval(loadInterval);
      messageDiv.innerHTML = ' ';
      typeText(messageDiv, completion);
    }
  };
  xhr.send(
    JSON.stringify({
      model: 'text-davinci-003',
      prompt: `Use the following pieces of context to answer the question at the end. if you don't know it just say you don't know don't try to make up an answer Except if the question is a greeting." ${chattextValue}
        "
         ${data.get('wow')}   helpful answer`,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    })
  );


  // clearInterval(loadInterval);
  // messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
