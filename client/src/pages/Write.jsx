import { useAuth, useUser } from '@clerk/clerk-react';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Upload from '../components/Upload';
import { IKContext, IKUpload } from 'imagekitio-react';


const Write = () => {
  const {isLoaded, isSignedIn} = useUser();
  const [value, setValue ] =useState('');
  const [cover, setCover]= useState("");
  const [img, setImg] = useState("");
  const [video, setVideo] = useState("");
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const {getToken } = useAuth();

  useEffect(() => {
    img && setValue((prev) => prev+`<p><image src="${img.url}"/></p>`);
  }, [img])
  

  useEffect(() => {
    video && setValue((prev) => prev+`<p><iframe class="ql-video" src="${video.url}"/></p>`);
  }, [video]);

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      console.log("Write, useMatation");
      const token = await getToken(); 
      return axios.post(`${import.meta.env.VITE_API_URL}/posts/`, newPost, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    },
    onSuccess: (res) => {
      console.log('Post created successfully');
      setCover(res);
      toast.success('Post created successfully');
      navigate(`/${res.data.slug}`);
    },
  });

  if (!isLoaded) {
    return <div className="">Loading...</div>;
  }

  if (isLoaded && !isSignedIn) {
    return <div className="">Please sign in.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      img: cover.filePath || "",
      title: formData.get('title'),
      desc: formData.get('desc'),
      category: formData.get('category'),
      content: value,
    };
    
    try {
      console.log("New Post", data);
      await mutation.mutateAsync(data);
      console.log('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  return (
    <div className='h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6'>
      <h1 className= "text-cl font-light">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 mb-6 border">
        <Upload type="image" setProgress={setProgress} setData={setCover}>
          <div className='flex flex-row items-center gap-2'>
          <button type="button" className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500
            bg-white">Add a cover image
          </button>
          { cover ? cover.name : "No file chosen"}
          </div>
        </Upload>
        <input
         className="text-4xl font-semibold bg-transparent outline-none"
         type="text" 
         placeholder='Enter title'
         name='title'
        />
        <div className="flex items-center gap-2">
          <label className="" htmlFor="">Choose a category:</label>
          <select name="category" id="" className="p-2 rounded-xl bg-white shadow">
            <option value="general">General</option>
            <option value="web-design">Web design</option>
            <option value="development">Development</option>
            <option value="databases">Databases</option>
            <option value="seo">Search Engines</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <textarea className="p-4 rounded-xl bg-white shadow" name="desc" id="" placeholder='A short description'></textarea>
        <div className="flex flex-1">
          <div className="flex flex-col gap-2 mr-2">
            <Upload type="image" setProgress={setProgress} setData={setImg}>
              <button type="button" className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500
                bg-white">📷️
              </button>
            </Upload>
            <Upload type="video" setProgress={setProgress} setData={setVideo}>
              <button type="button" className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500
                bg-white">🎥️
              </button>
            </Upload>
          </div>
          <ReactQuill
            theme="snow"
            className="flex-1 rounded-xl bg-white shadow"
            value={value}
            onChange={setValue}
            readOnly={0<progress && progress<100}
          />
        </div>
        <button disabled={mutation.isPending || (0<progress && progress<100)}
         className="bg-blue-800 text-white font-medium rounded-xl mt-4 p-2 w-36 disabled:bg-blue-400 disabled:cursor-not-allowed">
          {mutation.isPending ? "loading...." : "Send"}
        </button>
        {"Progess: " + progress + "%"}
        {mutation.isError && <span>{mutation.error.message}</span>}
      </form>
    </div>
  )
}

export default Write