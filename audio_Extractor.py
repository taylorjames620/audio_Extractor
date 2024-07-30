from flask import Flask, request, send_from_directory, jsonify, render_template
from moviepy.editor import VideoFileClip
import os

app = Flask(__name__)  # Initialize the Flask app

# Directory for uploaded video files
UPLOAD_FOLDER = 'uploads'  
# Directory for extracted audio files
AUDIO_FOLDER = 'audio'  

# Create the directories if they do not exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

@app.route('/')
def index():
    # Serve the index.html file when the root URL is accessed
    # return send_from_directory('', 'index.html') <-- Commented @ 3:42PM 5/19/24 TR (Now using render_template directly below)
    
    # Use render_template to serve the HTML file
    return render_template('index02.html') # <-- UPDATE html file 

@app.route('/upload', methods=['POST'])
def upload_file():
    
    # Check if the 'video-file' part is in the request
    if 'video-file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'})

    # Get the uploaded file
    file = request.files['video-file'] 
     
    # Check if a file was selected
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'})

    if file:
        try:
            # Path to save the uploaded file
            filepath = os.path.join(UPLOAD_FOLDER, file.filename) 
            
             # Save the uploaded file
            file.save(filepath)  
            
            # Load the video file using moviepy
            video = VideoFileClip(filepath) 
            
            # Create the audio file name
            audio_filename = os.path.splitext(file.filename)[0] + '.mp3' 
             
            # Path to save the extracted audio file
            audio_filepath = os.path.join(AUDIO_FOLDER, audio_filename)  
            
            # Extract and save the audio
            video.audio.write_audiofile(audio_filepath) 
             
            # Close the video file to free resources
            video.close()  

            # Optionally, remove the uploaded video file after extraction
            os.remove(filepath)

            # Return a JSON response with the URL to the extracted audio file
            return jsonify({'success': True, 'audio_url': f'/audio/{audio_filename}'})
        
        except Exception as e:
            
            # Return a JSON response with an error message if extraction fails
            return jsonify({'success': False, 'message': str(e)})

@app.route('/audio/<filename>')
def download_audio(filename):
    
    # Serve the extracted audio file for download
    return send_from_directory(AUDIO_FOLDER, filename)

if __name__ == '__main__':
    
    # Run the Flask app in debug mode
    app.run(debug=True)