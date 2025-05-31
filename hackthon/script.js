document.addEventListener('DOMContentLoaded', () => {
  const stateSelect = document.getElementById('state-select');
  const citySelect = document.getElementById('city-select');
  const providerList = document.getElementById('provider-listings');
  const newsContainer = document.getElementById('news-container');
  const form = document.getElementById('supportForm');
  const responseDiv = document.getElementById('form-response');

  // Load States
  if (stateSelect) {
    fetch('http://localhost:5000/api/states')
      .then(res => res.json())
      .then(states => {
        stateSelect.innerHTML = '<option value="">Select a state</option>';
        states.forEach(state => {
          const opt = document.createElement('option');
          opt.value = state.id;
          opt.textContent = state.name;
          stateSelect.appendChild(opt);
        });
      });

    // Load Cities on State Change
    stateSelect.addEventListener('change', () => {
      const stateId = stateSelect.value;
      if (!stateId) return;

      fetch(`http://localhost:5000/api/cities/${stateId}`)
        .then(res => res.json())
        .then(cities => {
          citySelect.innerHTML = '<option value="">Select a city</option>';
          cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city.id;
            opt.textContent = city.name;
            citySelect.appendChild(opt);
          });
        });
    });

    // Load Providers on City Change
    citySelect.addEventListener('change', () => {
      const cityId = citySelect.value;
      if (!cityId) return;

      fetch(`http://localhost:5000/api/providers/${cityId}`)
        .then(res => res.json())
        .then(providers => {
          providerList.innerHTML = '';
          if (providers.length === 0) {
            providerList.innerHTML = '<p>No providers listed for this city.</p>';
            return;
          }

          providers.forEach(p => {
            const card = document.createElement('div');
            card.className = 'provider-card';
            card.innerHTML = `
              <h3>${p.name} (${p.type}) ${p.vetted ? '✅' : ''}</h3>
              <p><strong>Address:</strong> ${p.address}</p>
              <p><strong>Contact:</strong> ${p.email || ''} ${p.phone || ''}</p>
              <p><strong>Website:</strong> <a href="${p.website}" target="_blank">${p.website}</a></p>
              <p><strong>Cost:</strong> ${p.cost}</p>
              <p><em>${p.notes}</em></p>
            `;
            providerList.appendChild(card);
          });
        });
    });
  }

  // Load News
  if (newsContainer) {
    fetch('http://localhost:5000/api/news')
      .then(res => res.json())
      .then(news => {
        news.forEach(item => {
          const card = document.createElement('div');
          card.className = 'news-item';
          card.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.content}</p>
            <p><small>${item.source} — ${item.date_posted}</small></p>
          `;
          newsContainer.appendChild(card);
        });
      });
  }

  // Handle Support Form
  if (form && responseDiv) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message')?.value || document.getElementById('query')?.value
      };

      console.log('Submitting form:', payload); // debug

      fetch('https://httpbin.org/post', { // Replace with real backend endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(() => {
        responseDiv.innerText = 'Thank you! Your message has been submitted.';
        form.reset();
      })
      .catch(() => {
        responseDiv.innerText = 'An error occurred. Please try again later.';
      });
    });
  }
});
