import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      onFileUpload(file);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} 
    // style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}
    className='border-2 border-dashed border-purple-500 p-4 text-center'
    >
      <input {...getInputProps()} />
      <p>Drag & drop a geodata file here, or click to select one</p>
    </div>
  );
};

export default FileUpload;