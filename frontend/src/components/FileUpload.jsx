import React, { useState, useEffect } from "react";
import { RiDownload2Fill, RiFileUploadFill } from "react-icons/ri";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import "./style.css";

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileForDialog, setSelectedFileForDialog] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/upload/");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [isFileUploaded]);

  const validExtensions = ["mp3", "mp4", "jpeg", "png", "gif", "jpg"];

  const handleFileChange = (event) => {
    const selected = event.target.files;
    const selectedFilesArray = Array.from(selected);

    // Check if more than 10 files are selected
    if (selectedFilesArray.length > 10) {
      toast.error("You can upload a maximum of 10 files.");
      return;
    }

    // Validating each file
    const invalidFiles = selectedFilesArray.filter((file) => {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileSize = file.size;
      const fileType = file.type.toLowerCase();

      // Checking if file extension is valid
      if (!validExtensions.includes(fileExtension)) {
        toast.error(`Invalid file type: ${file.name}`);
        return true;
      }

      // Checking if file size is within the valid range (100KB - 10MB)
      if (fileSize < 100000 || fileSize > 10000000) {
        toast.error(
          `Invalid file size: ${file.name}. File must be between 100KB and 10MB.`
        );
        return true;
      }

      // Validating MIME type for audio and video
      if (
        (fileType.startsWith("audio/") && !["audio/mpeg"].includes(fileType)) ||
        (fileType.startsWith("video/") &&
          !["video/mp4", "video/webm"].includes(fileType))
      ) {
        toast.error(`Invalid MIME type: ${file.name}`);
        return true;
      }

      return false;
    });

    // If there are invalid files, stop the upload
    if (invalidFiles.length > 0) {
      return;
    }

    // If all files are valid, update the state with selected files
    setSelectedFiles(selected);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("No files selected.");
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append(`file`, selectedFiles[i]);
    }

    try {
      const response = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("File uploaded successfully!");
        setIsFileUploaded(!isFileUploaded);
        setSelectedFiles(null);
      } else {
        toast.error("Error uploading file!");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading file!");
    }
  };

  const handleFileDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/delete/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File removed successfully!");
        setIsFileUploaded(!isFileUploaded);
      } else {
        toast.error("Error removing file!");
      }
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Error removing file!");
    }
  };

  const renderMedia = (file) => {
    const fileUrl = file.file.startsWith("http")
      ? file.file
      : `http://127.0.0.1:8000${file.file}`;

    const fileType = file?.file_type?.toLowerCase();
    console.log(fileType, "type");

    if (
      fileType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif"].includes(fileType)
    ) {
      return (
        <img
          src={fileUrl}
          alt={file.file_name}
          className="max-w-full max-h-[400px] mx-auto rounded-md"
        />
      );
    } else if (
      fileType.startsWith("video/") ||
      ["mp4", "webm"].includes(fileType)
    ) {
      return (
        <video controls autoPlay className="w-full max-h-[400px] rounded-md">
          <source src={fileUrl} type={`video/${fileType}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (
      fileType.startsWith("audio/") ||
      ["mp3", "m4a", "wav"].includes(fileType)
    ) {
      return (
        <audio controls autoPlay className="w-full rounded-md">
          <source src={fileUrl} type={`audio/${fileType}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      return (
        <div className="text-center">
          <p className="mb-2">File cannot be previewed directly.</p>
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download {file.file_name}
          </a>
        </div>
      );
    }
  };

  const openDialog = (file) => {
    setSelectedFileForDialog(file);
    setIsOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col rounded-md border p-4 w-full">
      <div className="flex items-center gap-5">
        <div className="rounded-full border p-4">
          <RiFileUploadFill size={50} />
        </div>
        <div>
          <h3 className="font-bold">Upload Files</h3>
          <p>Select and upload the files e.g: images, videos, mp3 etc.</p>
        </div>
      </div>

      <div className="border bg-black h-[1px] w-full mt-4 mb-4" />

      <div className="w-full flex justify-between items-center px-6">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4 file:rounded-md
                        file:border-0 file:text-sm file:font-semibold
                        file:bg-pink-50 file:text-purple-700
                        hover:file:bg-pink-100"
        />
        <button
          onClick={handleFileUpload}
          className="bg-purple-600 text-white py-2 px-4 rounded-md"
        >
          Upload
        </button>
      </div>

      <div className="  mt-6">
        <h3 className="font-bold text-xl py-4">Lists of Uploaded Files</h3>
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="p-4 border rounded-sm">
              <div className="flex justify-between items-center gap-2">
                <div>
                  <h3>{file.file_name}</h3>
                  <span>Category: {file.category}</span>
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-400">
                  <span>Size: {file.file_size / 1024} KB</span>
                  <span>Type: {file.file_type}</span>
                  <span>
                    Uploaded At: {new Date(file.uploaded_at).toDateString()}
                  </span>
                </div>

                <div className="flex gap-2 items-center relative">
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger
                      onClick={() => openDialog(file)}
                      className="bg-purple-200 p-2 rounded-md"
                    >
                      View
                    </DialogTrigger>
                    {selectedFileForDialog && (
                      <DialogContent
                        className="dialog"
                        key={selectedFileForDialog?.id}
                      >
                        <DialogHeader>
                          <DialogTitle>
                            {selectedFileForDialog.file_name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center items-center p-4 max-w-full">
                          {renderMedia(selectedFileForDialog)}
                        </div>
                        <DialogDescription className="text-center mt-2">
                          {selectedFileForDialog.file_type}
                        </DialogDescription>
                      </DialogContent>
                    )}
                  </Dialog>

                  <button
                    className="bg-red-600 text-white"
                    onClick={() => handleFileDelete(file.id)}
                  >
                    Remove
                  </button>

                  <a
                    href={`${file.file}`}
                    download
                    target="_blank"
                    className="bg-purple-600 p-3 rounded-md text-white"
                  >
                    <RiDownload2Fill size={24} />
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
