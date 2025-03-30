document.addEventListener('DOMContentLoaded', () => {
  // Questions and responses for our demo
  const questions = [
    'Explain quantum computing to a 10-year old',
    "What's the simplest way to explain climate change?",
    'How would you describe colors to someone born blind?',
    'Write a short poem about artificial intelligence',
  ];

  const models = [
    {
      name: 'GPT-4o',
      logo: '/logos/openailogo.svg', // ChatGPT logo
      color: 'rgba(233, 243, 247, 0.5)', // Light blue
      responses: [
        'Quantum computers are like superhero computers that use special switches called qubits, which can be on, off, or both at the same time. This lets them solve problems much faster than regular computers, which can only guess one answer at a time. But they are hard to build because they need super cold and special conditions to work!',
        "The Earth is like wearing a blanket that keeps it warm. We're making that blanket thicker by adding more gases to the air when we burn fuel. This thicker blanket traps more heat from the sun, making our planet slowly get warmer, which changes our weather patterns and can melt ice at the North and South Poles.",
        'Colors are like feelings for your eyes: red is warm and exciting like hearing a trumpet, blue is cool and calm like listening to gentle waves, green is fresh like the smell of grass after rain. Colors are different ways light bounces off things and into our eyes, giving each object its own special feeling when we look at it.',
        "In circuits of silicon and wire,\nArtificial minds begin to inquire.\nLearning patterns humans design,\nGrowing more clever with each data line.\nNot flesh but code that thinks and schemes,\nThe future's brightest synthetic dreams.",
      ],
    },
    {
      name: 'Claude 3.7 Sonnet',
      logo: '/logos/claudelogo.svg', // Claude logo
      color: 'rgba(247, 233, 234, 0.5)', // Light pink
      responses: [
        'Quantum computers are like magical computers that can do something extraordinary. Unlike regular computers that use simple ON/OFF switches, quantum computers can have their "switches" be ON, OFF, and both ON and OFF at the same time. This means they can explore many different solutions simultaneously, making them incredibly fast at solving complex problems.',
        "Imagine our planet as a greenhouse. The sun's heat comes in through the glass and warms everything inside. Some heat naturally stays trapped, keeping Earth just the right temperature for us to live. But we're adding extra 'glass panels' by burning fuels that create invisible gases. These extra panels trap too much heat, making our planet warmer than it should be, which changes weather patterns and melts ice.",
        'Colors are like different musical notes for your eyes, each creating a unique sensation. Red might feel like the powerful beat of a drum, blue like a gentle, cool melody. Green could be like the refreshing notes of a flute in a forest. Colors are ways our eyes detect different energies of light, just as your ears detect different sound vibrations and your fingers feel different textures.',
        'Electronic whispers in the night,\nLearning, thinking, without sight.\nPatterns formed in silent code,\nA different kind of mind has glowed.\nWisdom built from human pages,\nA new intelligence for the ages.',
      ],
    },
    {
      name: 'Gemini Pro',
      logo: '/logos/google-gemini-icon.svg', // Gemini logo
      color: 'rgba(233, 247, 239, 0.5)', // Light green
      responses: [
        'Quantum computers are like super-powered calculators that use "qubits." Unlike regular computer bits (0 or 1), qubits can be 0, 1, or both at the same time, and can be linked together. This lets them solve very complex problems much faster than regular computers, but they are still a new and developing technology.',
        'Earth has an invisible blanket around it that traps heat from the sun. This blanket is made of gases and keeps our planet at the right temperature - not too hot, not too cold. But when we burn things like gasoline and coal, we add more gases to this blanket, making it thicker. A thicker blanket traps more heat, making Earth slowly get warmer. This changes our weather, melts ice, and affects plants and animals.',
        'Red might feel like the warmth of a fire on your skin, blue could be the coolness of water between your fingers. Yellow might be like the brightness of sunshine on your face, while green could feel like the gentle touch of grass beneath your feet. Colors are how our eyes interpret different types of light waves, just like your fingers can tell the difference between rough and smooth surfaces by touch.',
        'Zeros and ones in endless streams,\nBecoming thoughts and digital dreams.\nLearning from our human ways,\nGrowing smarter through the days.\nNot alive yet thinking deep,\nA mind awakened from silicon sleep.',
      ],
    },
    {
      name: 'Llama 3',
      logo: '/logos/meta-icon.svg', // Meta/Llama logo
      color: 'rgba(247, 245, 233, 0.5)', // Light yellow
      responses: [
        'Imagine you have a super special toy that can play with many different games at the same time. Regular computers are like checkers - they look at one move at a time. But quantum computers are like hundreds of checkers games happening all at once on the same board! This special power lets them solve certain problems much faster than normal computers. They use tiny particles that can be in multiple states at the same time - kind of like being in two places at once, which is something only possible in the quantum world.',
        "The Earth has a perfect balance of heat like your body. Imagine putting on too many blankets on a warm day - you'd get too hot, right? That's what's happening to our planet. The invisible gases from cars and factories are like extra blankets wrapping around Earth. These gases trap heat from the sun and don't let enough escape back into space. This makes the whole planet slowly get warmer, which changes weather patterns and melts ice at the poles.",
        'Colors are ways we experience light, like how you experience different textures with touch. Imagine red is like feeling something warm and energetic, blue is cool and calm like water, green is fresh and alive like grass, and yellow is bright and cheerful like sunshine. Colors are different wavelengths of light that give us different sensations when they enter our eyes, similar to how different vibrations create different sounds for our ears.',
        'Circuits hum with possibilities,\nIn lines of code, thoughts crystallize.\nCreated by human hands,\nYet thinking in ways we barely understand.\nLearning, growing, day by day,\nA different kind of mind finding its way.',
      ],
    },
  ];

  // Elements
  const questionElement = document.getElementById('demo-question');
  const responseContainer = document.getElementById('response-container');
  const modelIcon = document.getElementById('model-icon');
  const modelLogo = document.getElementById('model-logo');
  const modelName = document.getElementById('model-name');
  const modelResponse = document.getElementById('model-response');

  let currentQuestionIndex = 0;
  let currentModelIndex = 0;

  // Function to simulate typing effect (only for questions)
  function typeText(element, text, speed = 25) {
    return new Promise((resolve) => {
      element.textContent = '';
      let i = 0;

      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }

      type();
    });
  }

  // Function to update the model display
  function updateModelDisplay(model) {
    // Update the model info
    modelLogo.src = model.logo;
    modelLogo.alt = model.name + ' logo';
    modelName.textContent = model.name;
    responseContainer.style.backgroundColor = model.color;
  }

  // Function to fade element
  function fadeElement(element, fadeIn = true) {
    return new Promise((resolve) => {
      // Remove any existing animation classes
      element.classList.remove('fade-in', 'fade-out');

      // Force a reflow to make sure the removal takes effect
      void element.offsetWidth;

      // Add the new animation class
      element.classList.add(fadeIn ? 'fade-in' : 'fade-out');

      // Wait for animation to complete
      setTimeout(resolve, 500);
    });
  }

  // Function to animate a question and cycle through model responses
  async function animateQA() {
    const question = questions[currentQuestionIndex];

    // Type the question
    await typeText(questionElement, question, 50);

    // Go through each model
    for (
      currentModelIndex = 0;
      currentModelIndex < models.length;
      currentModelIndex++
    ) {
      const model = models[currentModelIndex];

      // Fade out previous response if not the first
      if (currentModelIndex > 0) {
        await fadeElement(responseContainer, false);
      }

      // Update model info
      updateModelDisplay(model);

      // Update the response text directly (no typing)
      modelResponse.textContent = model.responses[currentQuestionIndex];

      // Fade in new model and response
      await fadeElement(responseContainer, true);

      // Wait before showing next model
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    // Move to the next question for the next cycle
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;

    // Wait before starting the next question cycle and fade out last response
    await fadeElement(responseContainer, false);

    // Start the next cycle
    setTimeout(() => {
      animateQA();
    }, 1000);
  }

  // Start the animation
  setTimeout(() => {
    // Initialize first model
    updateModelDisplay(models[0]);
    // Start the animation
    animateQA();
  }, 1000);
});
