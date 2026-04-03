import { Progress } from "@/components/ui/progress";
import { FileImage, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";

interface FileUploadProps {
  onUpload: (blob: ExternalBlob) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  accept?: string;
  maxFiles?: number;
  label?: string;
}

export default function FileUpload({
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  accept = "image/*",
  maxFiles = 5,
  label = "Upload Files",
}: FileUploadProps) {
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
    const toProcess = files.slice(0, maxFiles - previews.length);
    for (const file of toProcess) {
      try {
        const bytes = await file.arrayBuffer();
        const uint8 = new Uint8Array(bytes);
        const blob = ExternalBlob.fromBytes(uint8).withUploadProgress(
          (_pct) => {},
        );
        onUpload(blob);
        const url = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, { name: file.name, url }]);
      } catch {
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) void processFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) void processFiles(files);
  };

  const removePreview = (idx: number) => {
    setPreviews((prev) => {
      const url = prev[idx]?.url;
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="space-y-3">
      <div
        data-ocid="upload.dropzone"
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) =>
          e.key === "Enter" && !isUploading && inputRef.current?.click()
        }
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? "Drop files here" : label}
          </p>
          <p className="text-xs text-muted-foreground">
            Drag &amp; drop or click to browse (max {maxFiles} files)
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((p, i) => (
            <div
              key={p.name}
              className="relative group rounded-lg overflow-hidden border border-border aspect-square"
            >
              {p.url.startsWith("blob:") ? (
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <FileImage className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
