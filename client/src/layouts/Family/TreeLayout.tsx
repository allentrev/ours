import type { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const TreeLayout: FC<Props> = ({ children }) => {
  return (
    <div className="w-full h-screen bg-blue-100">
      <div className="h-full p-4">
        <div className="h-full rounded-xl bg-white shadow overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TreeLayout;