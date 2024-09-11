document.addEventListener('DOMContentLoaded', () => {
    const subjectInput = document.getElementById('subject-input');
    const generateBtn = document.getElementById('generate-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const aiSketchContainer = document.getElementById('ai-sketch');
    const userDrawingContainer = document.getElementById('user-drawing');
    const feedbackContainer = document.getElementById('feedback');
    const getFeedbackBtn = document.getElementById('get-feedback-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const rotateBtn = document.getElementById('rotate-btn');

    let currentSubject = '';
    let currentAiSketchUrl = '';
    let currentUserDrawingUrl = '';
    let currentRotation = 0;

    function toggleLoading(elementId, isLoading) {
        const element = document.getElementById(elementId);
        if (isLoading) {
            element.classList.add('opacity-50', 'cursor-not-allowed');
            element.innerHTML += ' <svg class="animate-spin h-5 w-5 ml-2 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        } else {
            element.classList.remove('opacity-50', 'cursor-not-allowed');
            element.querySelector('svg')?.remove();
        }
    }

    function markdownToHtml(markdown) {
        const converter = new showdown.Converter();
        return converter.makeHtml(markdown);
    }

    generateBtn.addEventListener('click', async () => {
        const subject = subjectInput.value.trim();
        if (subject) {
            currentSubject = subject;
            toggleLoading('generate-btn', true);
            try {
                const response = await fetch('/generate_sketch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ subject }),
                });
                const data = await response.json();
                currentAiSketchUrl = data.image_url;
                aiSketchContainer.innerHTML = `<img src="${data.image_url}" alt="AI-generated sketch" class="max-w-full max-h-full">`;
                userDrawingContainer.innerHTML = '';
                feedbackContainer.innerHTML = '';
            } catch (error) {
                console.error('Error generating sketch:', error);
                aiSketchContainer.innerHTML = '<p class="text-red-500">Error generating sketch. Please try again.</p>';
            } finally {
                toggleLoading('generate-btn', false);
            }
        }
    });

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            toggleLoading('upload-btn', true);
            try {
                const formData = new FormData();
                formData.append('drawing', file);
                const response = await fetch('/upload_drawing', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                currentUserDrawingUrl = data.image_data;
                userDrawingContainer.innerHTML = `<img src="${data.image_data}" alt="User drawing" class="max-w-full max-h-full">`;
                currentRotation = 0;
            } catch (error) {
                console.error('Error uploading drawing:', error);
                userDrawingContainer.innerHTML = '<p class="text-red-500">Error uploading drawing. Please try again.</p>';
            } finally {
                toggleLoading('upload-btn', false);
            }
        }
    });

    rotateBtn.addEventListener('click', () => {
        const userDrawingImg = userDrawingContainer.querySelector('img');
        if (userDrawingImg) {
            currentRotation = (currentRotation + 90) % 360;
            userDrawingImg.style.transform = `rotate(${currentRotation}deg)`;
        }
    });

    getFeedbackBtn.addEventListener('click', async () => {
        if (currentAiSketchUrl && currentUserDrawingUrl) {
            toggleLoading('get-feedback-btn', true);
            try {
                const response = await fetch('/get_feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ai_sketch: currentAiSketchUrl,
                        user_drawing: currentUserDrawingUrl,
                    }),
                });
                const data = await response.json();
                const formattedFeedback = markdownToHtml(data.feedback);
                feedbackContainer.innerHTML = `<h3 class="text-xl font-semibold mb-2">Feedback:</h3><div class="feedback-content">${formattedFeedback}</div>`;
            } catch (error) {
                console.error('Error getting feedback:', error);
                feedbackContainer.innerHTML = '<p class="text-red-500">Error getting feedback. Please try again.</p>';
            } finally {
                toggleLoading('get-feedback-btn', false);
            }
        }
    });

    favoriteBtn.addEventListener('click', async () => {
        if (currentSubject && currentAiSketchUrl && currentUserDrawingUrl) {
            toggleLoading('favorite-btn', true);
            try {
                const response = await fetch('/save_favorite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        subject: currentSubject,
                        ai_sketch_url: currentAiSketchUrl,
                        user_drawing_url: currentUserDrawingUrl,
                    }),
                });
                const data = await response.json();
                alert(data.message);
            } catch (error) {
                console.error('Error saving favorite:', error);
                alert('Error saving favorite. Please try again.');
            } finally {
                toggleLoading('favorite-btn', false);
            }
        }
    });
});
