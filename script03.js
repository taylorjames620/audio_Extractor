document.getElementById('upload-form').onsubmit = function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('video-file');
    const file = fileInput.files[0];
    const noiseReduction = document.getElementById('noise-reduction').checked;


    if (!file) {
        alert("Please select a file.");
        return;
    }

    // Validate file size (example: max 200MB)
    const maxSize = 200 * 1024 * 1024; // Maximum file size in bytes (200MB)
    if (file.size > maxSize) {
        alert("File size exceeds 200MB.");
        return;
    }

    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('preview-container').style.display = 'none';
    document.getElementById('download-link').style.display = 'none';


    const formData = new FormData();
    formData.append('video-file', file);
    formData.append('noise-reduction', noiseReduction);


    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);


    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = percentComplete + '%';
            progressBar.textContent = Math.round(percentComplete) + '%';
        }
    };


    xhr.onload = function() {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
                // Set the audio source and show the preview
                const audioPreview = document.getElementById('audio-preview');
                audioPreview.src = result.audio_url;
                document.getElementById('preview-container').style.display = 'block';


                const audioLink = document.getElementById('audio-link');
                audioLink.href = result.audio_url;
                document.getElementById('download-link').style.display = 'block';
                document.getElementById('success-message').style.display = 'block';
                document.getElementById('download-button').onclick = function() {
                    window.location.href = result.audio_url;
                };
            } else {
                document.getElementById('error-message').innerText = 'Error: ' + result.message;
                document.getElementById('error-message').style.display = 'block';
            }
        } else {
            document.getElementById('error-message').innerText = 'Error: Could not extract audio. Please try again.';
            document.getElementById('error-message').style.display = 'block';
        }
        document.getElementById('progress-container').style.display = 'none';
    };


    xhr.onerror = function() {
        document.getElementById('error-message').innerText = 'Error: Could not extract audio. Please try again.';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('progress-container').style.display = 'none';
    };


    xhr.send(formData);
};