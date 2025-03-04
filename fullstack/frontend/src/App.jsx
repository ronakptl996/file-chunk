import React, { useRef, useState } from "react";

const App = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isPausedState, setIsPausedState] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const isPausedRef = useRef(false);
  const uploadedChunks = useRef(new Set());

  const uploadFileInChunks = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const chunkSize = 1 * 1024 * 1024; // 5MB
      const totalChunks = Math.ceil(file.size / chunkSize);
      console.log({ chunkSize, totalChunks });
      setUploading(true);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (isPausedRef.current) break;
        if (uploadedChunks.current.has(chunkIndex)) continue;

        const start = chunkIndex * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkIndex", chunkIndex);
        formData.append("totalChunks", totalChunks);
        formData.append("fileName", file.name);

        await fetch("http://localhost:3001/api/video/upload", {
          method: "POST",
          body: formData,
        });
        uploadedChunks.current.add(chunkIndex);
      }

      if (uploadedChunks.current.size === totalChunks) {
        // Notify the server that all chunks are uploaded
        await fetch("http://localhost:3001/api/video/upload-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
          }),
        });

        setUploading(false);
        isPausedRef.current = false;
        setIsPausedState(false);
        setFile(null);
        alert("Upload complete!");
      }
    } catch (error) {
      console.log("Error while uploading ==", error);
    }
  };

  const pauseUpload = (e) => {
    e.preventDefault();
    isPausedRef.current = true;
    setIsPausedState(true);
  };

  const resumeUpload = (e) => {
    isPausedRef.current = false;
    setIsPausedState(false);
    uploadFileInChunks(e);
  };

  const checkUploadedChunk = async (e) => {
    e.preventDefault();
    const response = await fetch(
      "http://localhost:3001/api/video/check-upload-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name }),
      }
    );

    const data = await response.json();
    uploadedChunks.current = new Set(data.data.uploaded);
    uploadFileInChunks(e);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    setFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = async (e, value) => {
    e.preventDefault();
    setDragOver(value);
  };

  return (
    // <video src="http://localhost:3001/video" autoPlay loop muted controls />
    <div className="h-[100vh] bg-black flex justify-center items-center">
      <div className="bg-white shadow-lg p-6 rounded-lg w-[600px] mx-auto">
        <h2 className="text-lg font-bold text-green-600">Upload Files</h2>
        <p className="text-gray-500 text-sm">
          Upload documents you want to share with your team
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(e, true);
          }}
          onDragLeave={(e) => handleDragOver(e, false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed border-gray-300 p-8 text-center mt-4 rounded-lg cursor-pointer transition-all ${
            dragOver
              ? "border-green-500 bg-green-100"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-2xl">📁</span>
            <p className="text-gray-600">Drag and drop files here</p>
            <p className="text-gray-400 text-sm my-1">- OR -</p>
            <label
              className={`bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer ${
                file && "hidden"
              }`}
            >
              Browse Files
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {file && (
              <>
                <p className="text-gray-400 p-2 text-sm font-light">
                  {file.name}
                </p>
                <div className="flex">
                  <button
                    onClick={(e) => checkUploadedChunk(e)}
                    disabled={uploading}
                    className={`bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:bg-gray-400`}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  {uploading && (
                    <button
                      className={`bg-red-500 text-white px-4 py-2 mx-2 rounded-md cursor-pointer ${
                        isPausedState && "hidden"
                      }`}
                      onClick={(e) => pauseUpload(e)}
                    >
                      Pause
                    </button>
                  )}
                  {isPausedState && (
                    <button
                      className="bg-green-500 text-white px-4 py-2 mx-2 rounded-md cursor-pointer"
                      onClick={(e) => resumeUpload(e)}
                    >
                      Resume
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
