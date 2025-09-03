import { IKContext, IKUpload } from "imagekitio-react";
import { useRef } from "react";
//import { ref } from "process";
import { toast }    from "react-toastify";

const authenticator = async () => {
    console.log("authenticator");
    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/upload-auth`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      const {signature, expire, token} = data;
      return {signature, expire, token};
    }
    catch (error) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  }


const Upload = ({children, type, setProgress, setData}) => {
    const ref = useRef(null);

    const onError = (error) => {
        console.error('Error uploading file:', error);
        toast.error('Error uploading file');
    }
    
    const onSuccess = (response) => {
        console.log('File uploaded successfully:', response);
        setData(response);
        toast.success('File uploaded successfully');
    }
    
    const onUploadProgress = (progress) => {
        console.log('OnUploadProgress', progress);
        setProgress(Math.round((progress.loaded/progress.total) * 100));
    }
    
    return (
        <IKContext
            publicKey={import.meta.env.VITE_IK_PUBLIC_KEY}
            urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
            authenticator={authenticator}
        >
            <IKUpload
                useUniqueFileName={false}
                onError={onError}
                onSuccess={onSuccess}
                onUploadProgress={onUploadProgress}
                className="hidden"
                ref={ref}
                accept={`${type}/*`}
            />
            <div className="cursor-pointer" onClick={() => ref.current.click()}>
                {children}
            </div>
        </IKContext>
    );
}

export default Upload;