const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(import.meta.env.VITE_SERVER_URL + "/upload", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.file_url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export { uploadFile };
