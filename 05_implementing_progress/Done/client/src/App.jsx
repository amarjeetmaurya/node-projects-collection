import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";

function App() {
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // queued items to upload
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progress, setProgress] = useState({}); // track progress per item
  const [isUploading, setIsUploading] = useState(false); // indicates if an upload is in progress
  const [filesList, setFilesList] = useState([]); // all files (uploaded + uploading)

  const dirId = "gvuhi9087thibjoi9ht7h"; // assuming root directory


  //======================== Helper to fetch directory items ========================//
  // function getDirectoryItems() {
  //   // Fetch updated list from server after all uploads
  //   fetch(`http://localhost:3000/directory/${dirId || ""}`, {
  //     method: "GET",
  //     credentials: "include",
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // console.log("Fetched directory items:", data);
  //       setFilesList(data);
  //     })
  //     .catch((err) => console.error("Error fetching directory items:", err));
  //   // For demo, we'll just log
  //   // console.log("Fetching updated directory items from server...");
  // }

  useEffect(() => {
    // Initial fetch of directory items
    // getDirectoryItems();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };


  // ===================== File Selection and Upload Logic =====================  //
  /**
   * Select multiple files
   */
  function handleFileSelect(e) {
    console.log(e.target.files);
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    console.log(selectedFiles);

    // Build a list of "temp" items
    const newItems = selectedFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return {
        file,
        name: file.name,
        id: tempId,
        isUploading: false,
      };
    });

    
    // Put them at the top of the existing list
    setFilesList((prev) => [...newItems, ...prev]);
    console.log(newItems);
    console.log(isUploading);
    // console.log(filesList);

    newItems.forEach((item) => {
      // Initialize progress=0 for each
      setIsUploading(true);
      setProgress((prev) => ({ ...prev, [item.id]: 0 }));
    });

    // Add them to the uploadQueue
    setUploadQueue((prev) => [...prev, ...newItems]);

    // Clear file input so the same file can be chosen again if needed
    e.target.value = "";

    // Start uploading queue if not already uploading
    if (!isUploading) {
      setIsUploading(true);
      console.log(filesList);
      // begin the queue process
      console.log(...newItems);
      processUploadQueue([...uploadQueue, ...newItems.reverse()]);
    }
  }

  /**
   * Upload items in queue one by one
   */

  function processUploadQueue(queue) {
    if (queue.length === 0) {
      // No more items to upload
      setIsUploading(false);
      setUploadQueue([]);
      setTimeout(() => {
        // getDirectoryItems();
      }, 1000);
      return;
    }

    // Take first item
    const [currentItem, ...restQueue] = queue;

    // Mark it as isUploading: true
    setFilesList((prev) =>
      prev.map((f) =>
        f.id === currentItem.id ? { ...f, isUploading: true } : f
      )
    );

    //   // Start upload
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://localhost:3000/upload/${dirId || ""}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("filename", currentItem.name);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setProgress((prev) => ({ ...prev, [currentItem.id]: progress }));
      }
    });

    xhr.addEventListener("load", () => {
      // Move on to the next item
      processUploadQueue(restQueue);
    });

    //   // If user cancels, remove from the queue
    setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));
    console.log(uploadXhrMap);
    xhr.send(currentItem.file);
  }


    /**
   * Cancel an in-progress upload
   */
  // function handleCancelUpload(tempId) {
  //   const xhr = uploadXhrMap[tempId];
  //   if (xhr) {
  //     xhr.abort();
  //   }
  //   // Remove it from queue if still there
  //   setUploadQueue((prev) => prev.filter((item) => item.id !== tempId));

  //   // Remove from filesList
  //   setFilesList((prev) => prev.filter((f) => f.id !== tempId));

  //   // Remove from progressMap
  //   setProgress((prev) => {
  //     const { [tempId]: _, ...rest } = prev;
  //     return rest;
  //   });

  //   // Remove from Xhr map
  //   setUploadXhrMap((prev) => {
  //     const copy = { ...prev };
  //     delete copy[tempId];
  //     return copy;
  //   });
  // }
  

  return (
    <>
      <div>
        <p>Click the button below to upload a file</p>
        <button onClick={handleUploadClick} className="btn">
          <Upload className="w-5 h-5" />
          <span>Upload</span>
        </button>
        <input
          multiple
          ref={fileInputRef}
          id="fileInput"
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p>Direcory Item</p>
        <div>
          {filesList.map((item) => (
            <div
              key={item.id}
              className=" mb-2 bg-yellow-100 p-2 rounded border"
            >
              <span>{item.name}</span>
            </div>
          ))}

          <div className="border rounded p-2" >
            <h3>Ongoing Uploads:</h3>
            <ul className="list-disc list-inside">
             {/* { console.log(uploadXhrMap)} */}
              {/* {uploadQueue.map((item) => (
                <li key={item.id} className="mb-2">
                  <span>{item.name} - </span>
                  <span>
                    {progress[item.id]
                      ? `Progress: ${progress[item.id].toFixed(2)}%`
                      : "Starting..."}
                  </span>
                  <button
                    onClick={() => handleCancelUpload(item.id)}
                    className="ml-4 text-red-500"
                  >
                    Cancel
                  </button>
                </li>
              ))} */}
             {/* {console.log(uploadQueue)} */}
            </ul>
          </div>
          {/* <div>
            <h3>Progress State:</h3>
            uploadQueue.length: {uploadQueue.length}
            <br />
            isUploading: {isUploading ? "true" : "false"}
            <br />
            <pre>{JSON.stringify(progress, null, 2)}</pre>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default App;
