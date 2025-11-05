import { UploadCloudIcon } from "lucide-react";
import { useState } from "react";


interface UploadInputProps {
  id?: string;
  name: string;
  onFileSelect: (name: string, file: File | null) => void;
}

export function UploadInput({ id, name, onFileSelect }: UploadInputProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    console.log(selectedFile);
    setFile(selectedFile);
    onFileSelect(name, selectedFile);
  };

  return (
    <div className="p-5 bg-[#282828] relative border border-black">
      <input
        id={id}
        name={name}
        type="file"
        className="opacity-0 inset-0 absolute"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center gap-1">
        <UploadCloudIcon className="size-10" />
        <span className="font-medium text-base">Upload</span>
        <span className="text-[10px] font-extralight">Drag and drop file here</span>
      </div>
      {file && <p className="text-sm mt-2">{file.name}</p>}
    </div>
  );
}