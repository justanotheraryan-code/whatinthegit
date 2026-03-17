const decodeBtn = document.getElementById('decodeBtn');
const repoUrl = document.getElementById('repoUrl');
const results = document.getElementById('results');
const loader = document.getElementById('loader');
const content = document.getElementById('content');

// UI Elements
const resOneLiner = document.getElementById('resOneLiner');
const resValueProp = document.getElementById('resValueProp');
const resBuckets = document.getElementById('resBuckets');
const resComplexity = document.getElementById('resComplexity');

decodeBtn.addEventListener('click', decodeRepo);

async function decodeRepo() {
    const url = repoUrl.value.trim();
    if (!url) {
        alert("Please paste a GitHub URL first!");
        return;
    }

    // Reset UI
    results.classList.remove('hidden');
    loader.classList.remove('hidden');
    content.classList.add('hidden');
    decodeBtn.disabled = true;
    decodeBtn.innerText = "DECODING...";

    try {
        const response = await fetch('/api/decode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to analyze repository');
        }

        const data = await response.json();
        renderResult(data);
    } catch (error) {
        alert(error.message);
        results.classList.add('hidden');
    } finally {
        decodeBtn.disabled = false;
        decodeBtn.innerText = "DECODE PROJECT";
    }
}

function renderResult(data) {
    // Hide loader, show content
    loader.classList.add('hidden');
    content.classList.remove('hidden');

    // Inject data
    resOneLiner.innerText = data.one_liner;
    resValueProp.innerText = data.value_proposition;
    resComplexity.innerText = `${data.estimated_complexity} Complexity`;

    // Clear and build buckets
    resBuckets.innerHTML = '';
    data.functional_map.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bucket-card';
        card.innerHTML = `
            <h4>${item.bucket}</h4>
            <p>${item.description}</p>
        `;
        resBuckets.appendChild(card);
    });

    // Smooth scroll to results
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Allow Enter key to trigger decoding
repoUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') decodeRepo();
});
