const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const addMedicationForm = document.getElementById('add-medication-form');
const medicationList = document.getElementById('medication-list');
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const logoutButton = document.getElementById('logout-button');
const findMedicationButton = document.getElementById('find-medication');


registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;

  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    alert('Registration successful! Logging you in...');
    login(username, password);
  } else {
    alert('Registration failed. Try again.');
  }
});


loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  login(username, password);
});


async function login(username, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    alert('Login successful!');
    window.location.href = 'dashboard.html';
  } else {
    alert('Invalid login credentials.');
  }
}


logoutButton?.addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' });
  alert('Logged out successfully!');
  window.location.href = 'index.html';
});


addMedicationForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('medication-name').value;
  const dosage = document.getElementById('medication-dosage').value;
  const frequency = document.getElementById('medication-frequency').value;
  const time = document.getElementById('medication-time').value;

  const response = await fetch('/medications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, dosage, frequency, time }),
  });

  if (response.ok) {
    loadMedications();
    alert('Medication added successfully!');
    addMedicationForm.reset();
  } else {
    alert('Failed to add medication.');
  }
});


async function loadMedications() {
  const response = await fetch('/medications');
  if (response.ok) {
    const medications = await response.json();
    medicationList.innerHTML = medications
      .map((med) => `<li><strong>${med.name}</strong>: ${med.dosage}, ${med.frequency} at ${med.time}</li>`)
      .join('');
  } else {
    alert('Failed to load medications.');
  }
}
findMedicationButton?.addEventListener('click', async () => {
  const medicationName = prompt('Enter the medication name to search:');
  if (!medicationName) return;

  try {
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${medicationName.toLowerCase()}`
    );

    let consolidatedInfo = `**Medication Details**\n- **Name:** ${medicationName}\n`;

    if (response.ok) {
      const data = await response.json();
      const drugInfo = data.results?.[0];

      if (drugInfo) {
        const purpose = drugInfo.purpose?.[0] || 'Purpose not available';

        let warnings = 'Warnings not available';
        if (drugInfo.warnings?.[0]) {
          warnings = drugInfo.warnings[0].length > 300
            ? drugInfo.warnings[0].substring(0, 300) + '...'
            : drugInfo.warnings[0];
        }

        let sideEffects = 'Side effects not available';
        if (drugInfo.adverse_reactions?.[0]) {
          sideEffects = drugInfo.adverse_reactions[0].length > 300
            ? drugInfo.adverse_reactions[0].substring(0, 300) + '...'
            : drugInfo.adverse_reactions[0];
        }

        consolidatedInfo += `
        **OpenFDA Information:**
        - **Purpose:** ${purpose}
        - **Warnings:** ${warnings}
        - **Side Effects:** ${sideEffects}`;

     
        let fullDataButton = document.getElementById('full-info-button');
        if (!fullDataButton) {
          
          fullDataButton = document.createElement('button');
          fullDataButton.id = 'full-info-button';

        
          fullDataButton.style.padding = '15px 25px'; 
          fullDataButton.style.marginTop = '20px';
          fullDataButton.style.backgroundColor = '#007BFF'; 
          fullDataButton.style.color = 'white';
          fullDataButton.style.border = 'none';
          fullDataButton.style.borderRadius = '8px'; 
          fullDataButton.style.fontSize = '18px'; 
          fullDataButton.style.fontWeight = 'bold'; 
          fullDataButton.style.cursor = 'pointer';
          fullDataButton.style.display = 'block';
          fullDataButton.style.textAlign = 'center';
          fullDataButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; 
          fullDataButton.style.transition = 'transform 0.2s ease, background-color 0.2s ease';

          
          fullDataButton.onmouseover = () => {
            fullDataButton.style.backgroundColor = '#0056b3';
            fullDataButton.style.transform = 'scale(1.05)'; 
          };
          fullDataButton.onmouseout = () => {
            fullDataButton.style.backgroundColor = '#007BFF';
            fullDataButton.style.transform = 'scale(1)'; 
          };

          document.body.appendChild(fullDataButton);
        }

        
        fullDataButton.textContent = `View Full Information for ${medicationName}`;
        fullDataButton.onclick = () => {
          let fullDetails = `**Full Details for ${medicationName}:**\n`;

          fullDetails += drugInfo.warnings?.[0]
            ? `\n**Warnings:**\n${drugInfo.warnings[0]}`
            : '';
          fullDetails += drugInfo.adverse_reactions?.[0]
            ? `\n\n**Side Effects:**\n${drugInfo.adverse_reactions[0]}`
            : '';

          alert(fullDetails);
        };
      } else {
        consolidatedInfo += '**OpenFDA Information:** Not available\n';
      }
    } else {
      consolidatedInfo += '**OpenFDA Information:** Not available\n';
    }

    
    alert(consolidatedInfo);
  } catch (error) {
    console.error('Error fetching medication details:', error);
    alert('Error fetching medication details. Please try again later.');
  }
});

// Auto-load on Dashboard
if (dashboard) loadMedications();
