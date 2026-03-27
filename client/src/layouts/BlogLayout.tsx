import { Outlet } from 'react-router-dom';
import Navbar from '../components/Blog/Navbar';

const BlogLayout = () => {
  console.log("Blog Layout");
  return (
    <div className="px-4 md:px-8 lg:px-16 lx:px-32 2xl:px-64">
        <Navbar/>
        <Outlet/>
    </div>
);
};

export default BlogLayout