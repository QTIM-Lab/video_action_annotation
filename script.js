let startFrame = null;
let videoPath = null;
let annotations = [];

document.getElementById('videoUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    videoPath = file.name;
    const videoElement = document.getElementById('video');
    videoElement.src = URL.createObjectURL(file);
});

document.getElementById('startButton').addEventListener('click', function() {
    const video = document.getElementById('video');
    startFrame = Math.floor(video.currentTime * getVideoFrameRate(video));
    if (isNaN(startFrame) || startFrame === null) {
        alert('Error: Unable to calculate startFrame');
        startFrame = 0; // Fallback to frame 0 if calculation fails
    }
    this.disabled = true;
});

document.getElementById('anotherAction').addEventListener('click', function() {
    if (startFrame === null) {
        alert('Please click "Start" before adding an action.');
        return;
    }

    const video = document.getElementById('video');
    const currentFrame = Math.floor(video.currentTime * getVideoFrameRate(video));
    const actionInput = document.getElementById('actionInput');

    const annotation = {
        startFrame: startFrame,
        endFrame: currentFrame,
        action: actionInput.value
    };

    annotations.push(annotation);

    // Add to the list on the right
    addAnnotationToList(annotation, annotations.length - 1);

    // Reset for next annotation
    startFrame = null;
    document.getElementById('startButton').disabled = false;
    actionInput.value = '';
});

function addAnnotationToList(annotation, index) {
    const annotationList = document.getElementById('annotationList');
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        ${annotation.action} (${annotation.startFrame} - ${annotation.endFrame})
        <button class="deleteButton" data-index="${index}">Delete</button>
    `;
    annotationList.appendChild(listItem);

    // Add event listener to the delete button
    listItem.querySelector('.deleteButton').addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        deleteAnnotation(index);
    });
}

function deleteAnnotation(index) {
    annotations.splice(index, 1);
    updateAnnotationList();
}

function updateAnnotationList() {
    const annotationList = document.getElementById('annotationList');
    annotationList.innerHTML = '';
    annotations.forEach((annotation, index) => {
        addAnnotationToList(annotation, index);
    });
}

document.getElementById('saveAnnotation').addEventListener('click', function() {
    if (annotations.length === 0) {
        alert('Please add at least one annotation before saving.');
        return;
    }

    const data = {
        videoPath: videoPath,
        annotations: annotations
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const videoFileName = videoPath.split('/').pop().split('.')[0];
    a.download = `${videoFileName}_annotations.json`;
    a.click();

    URL.revokeObjectURL(url);

    // Reset for next set of annotations
    annotations = [];
    document.getElementById('annotationList').innerHTML = '';
});

// Function to get video frame rate (you may need to adjust this based on your video)
function getVideoFrameRate(video) {
    return video.frameRate || 30; // Default to 30 fps if not available
}

const video = document.getElementById('video');
const prevFrameBtn = document.getElementById('prevFrame');
const nextFrameBtn = document.getElementById('nextFrame');
const actionInput = document.getElementById('actionInput');
const saveAnnotationBtn = document.getElementById('saveAnnotation');
const annotationList = document.getElementById('annotationList');

const frameStep = 1 / 30; // Assuming 30 fps, adjust as needed

prevFrameBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - frameStep);
});
function moveToNextFrame() {
    video.currentTime = Math.min(video.duration, video.currentTime + frameStep);
}

nextFrameBtn.addEventListener('click', moveToNextFrame);

function moveToPrevFrame() {
    video.currentTime = Math.min(video.duration, video.currentTime - frameStep);
}
prevFrameBtn.addEventListener('click', moveToPrevFrame);
document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowRight') {
        moveToNextFrame();
        event.preventDefault(); // Prevent default scrolling behavior
    } else if (event.code === 'ArrowLeft') {
        moveToPrevFrame();
        event.preventDefault(); // Prevent default scrolling behavior
    }
});

if (prevFrameBtn) prevFrameBtn.addEventListener('click', moveToPrevFrame);
if (nextFrameBtn) nextFrameBtn.addEventListener('click', moveToNextFrame);
